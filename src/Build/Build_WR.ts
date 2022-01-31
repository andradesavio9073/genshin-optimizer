import Artifact from "../Artifact/Artifact";
import { ArtCharDatabase } from "../Database/Database";
import { forEachNodes, mapFormulas } from "../Formula/internal";
import { allOperations, constantFold } from "../Formula/optimization";
import { ConstantNode, NumNode } from "../Formula/type";
import { constant, customRead, max, min } from "../Formula/utils";
import { allSlotKeys, ArtifactSetKey } from "../Types/consts";
import { assertUnreachable, objectFromKeyMap } from "../Util/Util";
import type { ArtifactBuildData, ArtifactsBySlot, Build, DynStat, PlotData, RequestFilter } from "./Worker";

export function reaffine(nodes: NumNode[], arts: ArtifactsBySlot): { nodes: NumNode[], arts: ArtifactsBySlot } {
  const affineNodes = new Set<NumNode>(), topLevelAffine = new Set<NumNode>()

  function visit(node: NumNode, isAffine: boolean) {
    if (isAffine) affineNodes.add(node)
    else node.operands.forEach(_op => {
      const op = _op as NumNode
      affineNodes.has(op) && topLevelAffine.add(op)
    })
  }

  const dynKeys = new Set<string>()

  forEachNodes(nodes, _ => { }, f => {
    const operation = f.operation
    switch (operation) {
      case "read":
        if (f.type !== "number" || f.path[0] !== "dyn" || f.accu !== "add")
          throw new Error(`Found unsupported ${operation} node at path ${f.path} when computing affine nodes`)
        dynKeys.add(f.path[1])
        visit(f, true)
        break
      case "add": visit(f, f.operands.every(op => affineNodes.has(op))); break
      case "mul": {
        const nonConst = f.operands.filter(op => op.operation !== "const")
        visit(f, nonConst.length === 0 || (nonConst.length === 1 && affineNodes.has(nonConst[0])))
        break
      }
      case "const":
        if (typeof f.value === "string" || f.value === undefined)
          throw new Error(`Found constant ${f.value} while compacting`)
        visit(f as NumNode, true); break
      case "res": case "threshold_add": case "sum_frac":
      case "max": case "min": visit(f, false); break
      case "data": case "subscript": case "lookup": case "match": case "prio":
        throw new Error(`Found unsupported ${operation} node when computing affine nodes`)
      default: assertUnreachable(operation)
    }
  })

  let current = -1
  function nextDynKey(): string {
    while (dynKeys.has(`${++current}`));
    return `${current}`
  }

  nodes.forEach(node => affineNodes.has(node) && topLevelAffine.add(node))
  const affine = [...topLevelAffine].filter(f => f.operation !== "const")
  const affineMap = new Map(affine.map(node => [node, { ...customRead(["dyn", `${nextDynKey()}`]), accu: "add" as const }]))
  nodes = mapFormulas(nodes, f => affineMap.get(f as NumNode) ?? f, f => f)

  function reaffineArt(stat: DynStat): DynStat {
    const values = constantFold([...affineMap.keys()], {
      dyn: Object.fromEntries(Object.entries(stat).map(([key, value]) => [key, constant(value)]))
    } as any, _ => true)
    return Object.fromEntries([...affineMap.values()].map((v, i) => [v.path[1], (values[i] as ConstantNode<number>).value]))
  }
  const result = {
    nodes, arts: {
      base: reaffineArt(arts.base),
      values: objectFromKeyMap(allSlotKeys, slot =>
        arts.values[slot].map(({ id, set, values }) => ({ id, set, values: reaffineArt(values) })))
    }
  }
  for (const arts of Object.values(result.arts.values))
    for (const { values } of arts)
      for (const [key, baseValue] of Object.entries(result.arts.base))
        values[key] -= baseValue
  return result
}
export function compactArtifacts(db: ArtCharDatabase, mainStatAssumptionLevel: number): ArtifactsBySlot {
  const result: ArtifactsBySlot = {
    base: {},
    values: { flower: [], plume: [], goblet: [], circlet: [], sands: [] }
  }
  const keys = new Set<string>()

  for (const art of db._getArts()) {
    const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level))

    const data: ArtifactBuildData = {
      id: art.id, set: art.setKey,
      values: {
        [art.setKey]: 1,
        [art.mainStatKey]: art.mainStatKey.endsWith('_') ? mainStatVal / 100 : mainStatVal,
        /* TODO: Use accurate value */
        ...Object.fromEntries(art.substats.map(substat =>
          [substat.key, substat.key.endsWith('_') ? substat.value / 100 : substat.value]))
      },
    }
    delete data.values[""]
    result.values[art.slotKey].push(data)
    Object.keys(data.values).forEach(x => keys.add(x))
  }
  result.base = Object.fromEntries([...keys].map(key => [key, 0]))
  return result
}
/** Remove artifacts that cannot be in top `numTop` builds */
export function pruneOrder(arts: ArtifactsBySlot, numTop: number): ArtifactsBySlot {
  let progress = false
  const values = objectFromKeyMap(allSlotKeys, slot => {
    const list = arts.values[slot]
    const newList = list.filter(art => {
      let count = 0
      return list.every(other => {
        const greaterEqual = Object.entries(other.values).every(([k, o]) => o >= art.values[k])
        const greater = Object.entries(other.values).some(([k, o]) => o > art.values[k])
        if (greaterEqual && (greater || other.id > art.id)) count++
        return count < numTop
      })
    })
    if (newList.length !== list.length) progress = true
    return newList
  })
  return progress ? { base: arts.base, values } : arts
}
/** Remove artifacts that cannot reach `minimum` in any build */
export function pruneRange(nodes: NumNode[], arts: ArtifactsBySlot, minimum: number[]): ArtifactsBySlot {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }]))
  while (true) {
    const artRanges = objectFromKeyMap(allSlotKeys, slot => computeArtRange(arts.values[slot]))
    const otherArtRanges = objectFromKeyMap(allSlotKeys, key =>
      addArtRange(Object.entries(artRanges).map(a => a[0] === key ? baseRange : a[1]).filter(x => x)))

    let progress = false

    const values = objectFromKeyMap(allSlotKeys, slot => {
      const result = arts.values[slot].filter(art => {
        const read = addArtRange([computeArtRange([art]), otherArtRanges[slot]])
        const newRange = computeNodeRange(nodes, read)
        return nodes.every((node, i) => newRange.get(node)!.min >= minimum[i])
      })
      if (result.length !== arts.values[slot].length)
        progress = true
      return result
    })
    if (!progress) return arts // Make sure we return the original `arts` if there is no progress
    arts = { base: arts.base, values }
  }
}
export function pruneNodeRange(nodes: NumNode[], arts: ArtifactsBySlot): NumNode[] {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, value]) => [key, { min: value, max: value }]))
  const reads = addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))])
  const nodeRange = computeNodeRange(nodes, reads)

  return mapFormulas(nodes, f => {
    const { operation } = f
    const operandRanges = f.operands.map(x => nodeRange.get(x)!)
    switch (operation) {
      case "threshold_add": {
        const [value, threshold] = operandRanges
        if (value.min >= threshold.max) return f.operands[2]
        else if (value.max < threshold.min) return constant(0)
        break
      }
      case "min": {
        const newOperands = f.operands.filter((_, i) => {
          const op1 = operandRanges[i]
          return operandRanges.every((op2, j) => op1.min <= op2.max)
        })
        if (newOperands.length < operandRanges.length) return min(...newOperands)
        break
      }
      case "max": {
        const newOperands = f.operands.filter((_, i) => {
          const op1 = operandRanges[i]
          return operandRanges.every(op2 => op1.max >= op2.min)
        })
        if (newOperands.length < operandRanges.length) return max(...newOperands)
        break
      }
    }
    return f
  }, f => f)
}
function addArtRange(ranges: DynMinMax[]): DynMinMax {
  const result: DynMinMax = {}
  ranges.forEach(range => {
    Object.entries(range).map(([key, value]) => {
      if (result[key]) {
        result[key].min += value.min
        result[key].max += value.max
      } else result[key] = { ...value }
    })
  })
  return result
}
function computeArtRange(arts: ArtifactBuildData[]): DynMinMax {
  const result: DynMinMax = {}
  arts.forEach(({ values }) => {
    Object.entries(values).forEach(([key, value]) => {
      if (result[key]) {
        if (result[key].max < value) result[key].max = value
        if (result[key].min > value) result[key].min = value
      } else result[key] = { min: value, max: value }
    })
  })

  return result
}
export function computeNodeRange(nodes: NumNode[], reads: DynMinMax): Map<NumNode, MinMax> {
  const range = new Map<NumNode, MinMax>()

  forEachNodes(nodes, _ => { }, _f => {
    const f = _f as NumNode
    const { operation } = f
    const operands = f.operands.map(op => range.get(op)!)
    let current: MinMax
    switch (operation) {
      case "read":
        if (f.path[0] !== "dyn")
          throw new Error(`Found non-dyn path ${f.path} while computing range`)
        current = reads[f.path[1] as any as number]
        break
      case "const": current = computeMinMax([f.value]); break
      case "subscript": current = computeMinMax(f.list); break
      case "add": case "min": case "max":
        current = {
          min: allOperations[operation](operands.map(x => x.min)),
          max: allOperations[operation](operands.map(x => x.max)),
        }; break
      case "res": current = {
        min: allOperations[operation]([operands[0].max]),
        max: allOperations[operation]([operands[0].min]),
      }; break
      case "mul": current = operands.reduce((accu, current) => computeMinMax([
        accu.min * current.min, accu.min * current.max,
        accu.max * current.min, accu.max * current.max,
      ])); break
      case "threshold_add":
        if (operands[0].min >= operands[1].max) current = operands[2]
        else if (operands[0].max < operands[1].min) current = computeMinMax([0])
        else current = computeMinMax([0], [operands[2]])
        break
      case "sum_frac": {
        const [x, c] = operands, sum = { min: x.min + c.min, max: x.max + c.max }
        if (sum.min <= 0 && sum.max >= 0)
          current = (x.min <= 0 && x.max >= 0) ? { min: NaN, max: NaN } : { min: -Infinity, max: Infinity }
        else
          // TODO: Check this
          current = computeMinMax([
            x.min / sum.min, x.min / sum.max,
            x.max / sum.min, x.max / sum.max
          ])
        break
      }
      case "data": case "lookup": case "match":
        throw new Error(`Unsupported ${operation} node`)
      default: assertUnreachable(operation)
    }
    range.set(f, current)
  })
  return range
}
function computeMinMax(values: readonly number[], minMaxes: readonly MinMax[] = []): MinMax {
  const max = Math.max(...values, ...minMaxes.map(x => x.max))
  const min = Math.min(...values, ...minMaxes.map(x => x.min))
  return { min, max }
}
export function* setPermutations(setFilters: Dict<ArtifactSetKey, number>): Iterable<RequestFilter> {
  const list = [{
    value: [] as (ArtifactSetKey | "other")[],
    remaining: setFilters,
    otherRemaining: Object.values(setFilters).reduce((a, b) => a - b, 5)
  }]
  const otherCommand = { kind: "exclude", sets: new Set(Object.keys(setFilters)) } as const

  while (list.length) {
    const { value, remaining, otherRemaining } = list.pop()!
    if (!Object.keys(remaining).length) {
      yield objectFromKeyMap(allSlotKeys, (_, i) => {
        const set = value[i]
        if (set === "other") return otherCommand
        if (!set) return { kind: "exclude", sets: new Set() }
        return { kind: "required", sets: new Set([set]) }
      })
      continue
    }
    for (const set of ["other" as const, ...Object.keys(remaining)]) {
      if (set === "other" && !otherRemaining) continue

      const newValue = [...value, set], newRemaining = { ...remaining }
      let newOtherRemaining = otherRemaining
      if (set !== "other") {
        newRemaining[set]! -= 1
        if (newRemaining[set]! <= 0) delete newRemaining[set]
      } else newOtherRemaining -= 1
      list.push({ value: newValue, remaining: newRemaining, otherRemaining: newOtherRemaining })
    }
  }
}
export function filterArts(arts: ArtifactsBySlot, filters: RequestFilter): ArtifactsBySlot {
  return {
    base: arts.base,
    values: objectFromKeyMap(allSlotKeys, slot => {
      const filter = filters[slot]
      switch (filter.kind) {
        case "id": return arts.values[slot].filter(art => filter.ids.has(art.id))
        case "exclude": return arts.values[slot].filter(art => !filter.sets.has(art.set))
        case "required": return arts.values[slot].filter(art => filter.sets.has(art.set))
      }
    })
  }
}
export function countBuilds(arts: ArtifactsBySlot): number {
  return allSlotKeys.reduce((_count, slot) => arts.values[slot].length, 1)
}
export function mergeBuilds(builds: Build[][], maxNum: number): Build[] {
  return builds.flatMap(x => x).sort((a, b) => b.value - a.value).slice(0, maxNum)
}
export function mergePlot(plots: PlotData[]): PlotData {
  let scale = 0.01, reductionScaling = 2, maxCount = 1500
  let keys = new Set(plots.flatMap(x => Object.keys(x).map(k => Math.round(parseFloat(k) / scale))))
  while (keys.size > maxCount) {
    scale *= reductionScaling
    keys = new Set([...keys].map(key => Math.round(key / scale)))
  }
  const result: PlotData = {}
  for (const plot of plots)
    for (const [_x, y] of Object.entries(plot)) {
      const x = Math.round(parseFloat(_x) / scale) * scale
      if (!result[x] || result[x]!.value < y.value)
        result[x] = y
    }

  return result
}

type DynMinMax = { [key in string]: MinMax }
type MinMax = { min: number, max: number }
type CompactNodes = { nodes: NumNode[], affine: NumNode[] }
