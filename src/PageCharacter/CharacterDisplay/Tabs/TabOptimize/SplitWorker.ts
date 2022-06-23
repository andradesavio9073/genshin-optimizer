import type { NumNode } from '../../../../Formula/type';
import { precompute } from '../../../../Formula/optimization';
import { allSlotKeys, ArtifactSetKey } from '../../../../Types/consts';
import { estimateMaximum, reduceFormula, slotUpperLower, statsUpperLower } from '../../../../Formula/addedUtils';
import type { ArtSetExclusionFull, CachedCompute, InterimResult, Setup, Split, SplitWork, SubProblem, SubProblemNC, SubProblemWC } from './BackgroundWorker';
import { ArtifactBuildData, ArtifactsBySlot, countBuilds, DynStat, filterArts, RequestFilter } from './common';
import { cartesian, objectKeyMap, objectKeyValueMap } from '../../../../Util/Util';
import { sparseMatmul } from '../../../../Formula/linearUpperBound';

export class SplitWorker {
  min: number[]

  arts: ArtifactsBySlot
  nodes: NumNode[]
  artSet: Dict<ArtifactSetKey | 'uniqueKey', number[]>

  subproblems: { count: number, heur: number, subproblem: SubProblem }[] = []

  callback: (interim: InterimResult) => void

  constructor({ arts, optimizationTarget, filters, artSetExclusion }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.min = filters.map(x => x.min)
    this.nodes = filters.map(x => x.value)
    this.callback = callback

    this.min.push(-Infinity)
    this.nodes.push(optimizationTarget)

    this.artSet = objectKeyValueMap(Object.entries(artSetExclusion), ([setKey, v]) => {
      if (setKey === 'rainbow') return ['uniqueKey', v.map(v => v + 1)]
      return [setKey, v.flatMap(v => (v === 2) ? [2, 3] : [4, 5])]
    })
  }

  addSubProblem(subproblem: SubProblem) {
    const count = countBuilds(filterArts(this.arts, subproblem.filter))
    if (count === 0) return
    let maxEst = subproblem.cache ? subproblem.cachedCompute.maxEst[subproblem.cachedCompute.maxEst.length - 1] : 0
    this.subproblems.push({ count, heur: maxEst, subproblem })
  }

  /**
   * Iteratively splits the subproblem (depth-first) into smaller chunks until it is small enough,
   *   as determined by `minCount`. Repeat up to `maxIter` times before returning control to the main thread.
   * @param minCount
   * @param maxIter
   * @returns Either ONE [subproblem] of size `minCount` or ZERO [] subproblems.
   */
  split({ threshold, minCount, maxIter, subproblem }: Split): SubProblem[] {
    if (threshold > this.min[this.min.length - 1]) this.min[this.min.length - 1] = threshold
    if (subproblem) this.addSubProblem(subproblem)
    const initialProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0)

    // console.log('split', this.min[this.min.length - 1], {
    //   todo: this.subproblems.length, buildsleft: this.subproblems.reduce((a, { count }) => a + count, 0)
    // }, this.subproblems)

    let n = 0
    while (n < maxIter && this.subproblems.length) {
      n += 1
      const { count, subproblem } = this.subproblems.pop()!
      if (count <= minCount) {
        const newProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0) + count
        this.callback({ command: 'interim', tested: 0, failed: 0, skipped: initialProblemTotal - newProblemTotal, buildValues: undefined })
        return [subproblem]
      }

      this.splitBNB(this.min[this.min.length - 1], subproblem).forEach(subp => this.addSubProblem(subp))
    }
    const newProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0)
    this.callback({ command: 'interim', tested: 0, failed: 0, skipped: initialProblemTotal - newProblemTotal, buildValues: undefined })
    return []
  }

  popOne() {
    // Yield largest subproblem (requests => level-order / prio queue order)
    if (this.subproblems.length === 0) return undefined
    let ret = { i: -1, heur: -Infinity }
    for (let i = 1; i < this.subproblems.length; i++) {
      const { heur, subproblem } = this.subproblems[i]
      if (heur > ret.heur) ret = { i, heur }
    }
    if (ret.i < 0) return undefined
    return this.subproblems.splice(ret.i, 1)[0].subproblem
  }

  /**
   * Iteratively splits the subproblem (breadth-first) into many many chunks to better distribute the B&B workload
   *   between the workers. There is some danger of over-fracturing the chunks.
   * @returns A list of [subproblems] with length `numSplits`
   */
  splitWork({ threshold, numSplits, subproblem }: SplitWork) {
    if (threshold > this.min[this.min.length - 1]) this.min[this.min.length - 1] = threshold
    if (subproblem) this.addSubProblem(subproblem)
    const initialProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0)

    console.log('splitWork', this.min[this.min.length - 1], {
      todo: this.subproblems.length, buildsleft: this.subproblems.reduce((a, { count }) => a + count, 0)
    })

    while (this.subproblems.length > 0 && this.subproblems.length <= numSplits) {
      const { subproblem } = this.subproblems.shift()!
      this.splitBNB(this.min[this.min.length - 1], subproblem).forEach(subp => this.addSubProblem(subp))
    }
    const newProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0)
    this.callback({ command: 'interim', tested: 0, failed: 0, skipped: initialProblemTotal - newProblemTotal, buildValues: undefined })
    console.log('exit splitWork. Filters pre-exit', this.subproblems)
    return this.subproblems.splice(0, numSplits).map(({ subproblem }) => subproblem)
  }

  /**
   * splitBNB takes a SubProblem and tries to perform Branch and Bound (BnB) pruning to solve for the
   *   optimal damage value. As the name states, there are two main phases: Branching and Bounding.
   *   The bounding is handled by an `estimateMaximum()` function call, and the branching is done by `pickBranch()`.
   *
   * @param threshold  Objective function lower bound threshold
   * @param subproblem The subproblem to split
   * @returns An array of up to 32 splits of the input subproblem.
   */
  splitBNB(threshold: number, subproblem: SubProblem) {
    const a = filterArts(this.arts, subproblem.filter)

    // 1. check constraints & simplify formula.
    if (subproblem.cache === false) {
      const { statsMin, statsMax } = statsUpperLower(a)

      // 1a. Simplify formula, cut off always-satisfied constraints, and validate setExclusion stuff.
      let sub2 = reduceSubProblem(subproblem, statsMin, statsMax)
      if (sub2 === undefined) return []

      // 1b. Check that remaining constraints are satisfiable
      let f = [...sub2.constraints.map(({ value }) => value), sub2.optimizationTarget]
      const cachedCompute = estimateMaximum({ f, a })
      if (sub2.constraints.some(({ min }, i) => cachedCompute.maxEst[i] < min)) return []
      if (cachedCompute.maxEst[cachedCompute.maxEst.length - 1] < threshold) return []

      subproblem = { ...sub2, cache: true, cachedCompute }
    }
    // 1c. A cached subproblem skips most of the above constraint checking, but `threshold` may change
    //     between iterations.
    const { cachedCompute } = subproblem
    if (cachedCompute.maxEst[cachedCompute.maxEst.length - 1] < threshold) return []

    // 2. Pick branching parameter
    let numBuilds = Object.values(a.values).reduce((tot, arts) => tot * arts.length, 1)
    const { k } = pickBranch(a, threshold, subproblem)
    const branchVals = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
      const vals = arts.map(a => a.values[k])
      return [slotKey, (Math.min(...vals) + Math.max(...vals)) / 2]
    }))
    const branchArts = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
      const above = arts.filter(art => art.values[k] < branchVals[slotKey] ? true : false)
      const below = arts.filter(art => art.values[k] < branchVals[slotKey] ? false : true)
      return [slotKey, [below, above]]
    }))

    // 3. Perform branching. Check bounding during the branching phase as well.
    let branches = [] as { numBuilds: number, heur: number, subproblem: SubProblemWC }[]
    cartesian([0, 1], [0, 1], [0, 1], [0, 1], [0, 1]).forEach(([s1, s2, s3, s4, s5]) => {
      let z = {
        base: { ...a.base },
        values: {
          flower: branchArts.flower[s1],
          plume: branchArts.plume[s2],
          sands: branchArts.sands[s3],
          goblet: branchArts.goblet[s4],
          circlet: branchArts.circlet[s5],
        }
      }

      let numBuilds = Object.values(z.values).reduce((tot, arts) => tot * arts.length, 1)
      if (numBuilds === 0) return;
      const { statsMin, statsMax } = statsUpperLower(z)

      // 1a. Simplify formula, cut off always-satisfied constraints, and validate setExclusion stuff.
      let sub2 = reduceSubProblem(subproblem, statsMin, statsMax)
      if (sub2 === undefined) return;

      // 1b. (fast) Check that existing constraints are satisfiable
      let { maxEst } = estimateMaximum({ a: z, cachedCompute })
      if (sub2.constraints.some(({ min }, i) => maxEst[i] < min)) return;
      if (maxEst[maxEst.length - 1] < threshold) return;

      // 1b. (slow) Check that existing constraints are satisfiable
      let f = [...sub2.constraints.map(({ value }) => value), sub2.optimizationTarget]
      let cc2 = estimateMaximum({ a: z, f })
      if (sub2.constraints.some(({ min }, i) => cc2.maxEst[i] < min)) return;
      if (cc2.maxEst[cc2.maxEst.length - 1] < threshold) return;

      let newFilter: RequestFilter = objectKeyMap(allSlotKeys, slot => ({ kind: 'id' as 'id', ids: new Set(z.values[slot].map(art => art.id)) }))
      branches.push({
        numBuilds,
        heur: cc2.maxEst[cc2.maxEst.length - 1],
        subproblem: {
          ...sub2,
          filter: newFilter,
          cache: true,
          cachedCompute: cc2,
          depth: sub2.depth + 1
        }
      })
    })
    branches.sort((a, b) => b.numBuilds - a.numBuilds)
    return branches.map(({ subproblem }) => subproblem)
  }
}

/**
 * Takes a Subproblem and reduces whatever formulas it can. Also deletes any constraint equations that are always active
 *   (and therefore have no contribution)
 *
 * @param sub          Subproblem to reduce/simplify.
 * @param statsMinMax  Reduction is based on the range of valid stats.
 * @returns  A new subproblem that should be identical to the previous one, but with fewer components.
 *           If the subproblem is unsatisfiable, return `undefined`
 */
function reduceSubProblem({ optimizationTarget, constraints, artSetExclusion, filter, depth }: SubProblem, statsMin: DynStat, statsMax: DynStat): SubProblemNC | undefined {
  // const { optimizationTarget, constraints, artSetExclusion } = sub
  let subnodes = [optimizationTarget, ...constraints.map(({ value }) => value)]
  const submin = constraints.map(({ min }) => min)

  subnodes = reduceFormula(subnodes, statsMin, statsMax)

  // 1. Check for always-feasible constraints.
  const [compute, mapping, buffer] = precompute(subnodes, n => n.path[1])
  Object.entries(statsMin).forEach(([k, v]) => buffer[mapping[k] ?? 0] = v)
  const result = compute()

  const newOptTarget = subnodes.shift()!
  const active = submin.map((m, i) => m > result[i])
  active[0] = true  // Always preserve main dmg formula
  const newConstraints = subnodes.map((value, i) => ({ value, min: submin[i] })).filter((_, i) => active[i])

  // 2. Check for never-active and always-active ArtSetExcl constraints.
  let newArtExcl = {} as ArtSetExclusionFull
  for (const [setKey, exclude] of Object.entries(artSetExclusion)) {
    if (setKey === 'uniqueKey') {
      // let minSets = Object.fromEntries(Object.entries(statsMin).filter(([statKey, v]) => v > 0 && allArtifactSets.includes(statKey as any)))
      // let numSets = Object.keys(minSets).length
      // let numSlotsUsed = Object.values(minSets).reduce((a, b) => a + b)

      // TODO: Check and exclude rainbow bullshit.
      newArtExcl[setKey] = exclude
      continue
    }
    const reducedExcl = exclude.filter(n => statsMin[setKey] <= n && n <= statsMax[setKey])        // Cut away never-active
    if (reducedExcl.includes(statsMin[setKey]) && reducedExcl.includes(statsMax[setKey])) return;  // Always active.
    if (reducedExcl.length > 0) newArtExcl[setKey] = reducedExcl
  }

  return {
    cache: false,
    optimizationTarget: newOptTarget,
    constraints: newConstraints,
    artSetExclusion: newArtExcl,

    filter, depth
  }
}

/**
 * Decides how to split between different branches.
 * TODO: Branch values should also be calculated & returned here
 * @param a     Artifact set
 * @param lin   Linear form from compute
 * @returns     The key to branch on.
 */
function pickBranch(a: ArtifactsBySlot, threshold: number, { constraints, cachedCompute: { lin }, artSetExclusion }: SubProblemWC) {
  let linToConsider = lin[lin.length - 1]
  let keysToConsider = [...Object.keys(linToConsider.w), ...Object.keys(artSetExclusion).filter(k => k !== 'uniqueKey')]

  // let thr = [...constraints.map(({ min }) => min), threshold]
  // const w0 = lin.map(({ c }) => c)
  // function pickBranchHelper(arts: ArtifactBuildData[]) {
  //   const w = sparseMatmul(lin, arts.map(art => art.values)).reduce((maxWs, ws) => {
  //     ws.forEach((wi, i) => maxWs[i] = Math.max(maxWs[i], wi))
  //     return maxWs
  //   }, Array(lin.length).fill(-Infinity) as number[])
  //   return { arts, w, ...slotUpperLower(arts) }
  // }


  let shatterOn = { k: '', heur: -1 }
  keysToConsider.forEach(k => {
    // let branches = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    //   const vals = arts.map(a => a.values[k])
    //   const minv = Math.min(...vals)
    //   const maxv = Math.max(...vals)
    //   if (minv === maxv) {
    //     return [slotKey, [pickBranchHelper(arts)]]
    //   }

    //   const branchVal = (minv + maxv) / 2
    //   const lowerArts = arts.filter(a => a.values[k] <= branchVal)
    //   const upperArts = arts.filter(a => a.values[k] > branchVal)
    //   return [slotKey, [
    //     pickBranchHelper(lowerArts),
    //     pickBranchHelper(upperArts),
    //   ]]
    // }))

    // // Do a quick forward-branch to check how good the branch is.
    // let numBranch = 0
    // let numBuild = 0
    // let maxW = -Infinity
    // cartesian(branches.flower, branches.plume, branches.sands, branches.goblet, branches.circlet)
    //   .forEach(([flower, plume, sands, goblet, circlet]) => {
    //     const maxEst = Array(flower.w.length).fill(0).map((_, i) => (w0[i] + flower.w[i] + plume.w[i] + sands.w[i] + goblet.w[i] + circlet.w[i]))
    //     let mememe: ArtifactsBySlot = { base: a.base, values: { flower: flower.arts, plume: plume.arts, sands: sands.arts, goblet: goblet.arts, circlet: circlet.arts } }
    //     let { statsMin, statsMax } = statsUpperLower(mememe)

    //     if (maxEst.some((m, i) => m < thr[i])) return
    //     if (Object.entries(artSetExclusion).some(([slotKey, excl]) => excl.includes(statsMin[slotKey]) && excl.includes(statsMax[slotKey]))) return

    //     numBranch++
    //     numBuild += flower.arts.length * plume.arts.length * sands.arts.length * goblet.arts.length * circlet.arts.length
    //     maxW = Math.max(maxW, maxEst[maxEst.length - 1])
    //   })

    //   if (numBuild === 0) {
    //     console.log(k, branches)
    //     throw Error('wait what')
    //   }

    // console.log('new', { k, numBranch, numBuild, maxW })
    // throw Error('stop')

    const postShatterRangeReduction = Object.entries(a.values).reduce((rangeReduc, [slot, arts]) => {
      const vals = arts.map(a => a.values[k])
      const minv = Math.min(...vals)
      const maxv = Math.max(...vals)
      if (minv === maxv) return rangeReduc

      arts.map(a => Object.entries(a.values).reduce((acc, [statKey, val]) => acc + val * (linToConsider[statKey] ?? 0), 0))

      const branchVal = (minv + maxv) / 2
      const glb = Math.max(...vals.filter(v => v <= branchVal))
      const lub = Math.min(...vals.filter(v => v > branchVal))
      return rangeReduc + Math.min(maxv - glb, lub - minv)
    }, 0)
    const heur = linToConsider.w[k] * postShatterRangeReduction
    // console.log('old', { k, heur })
    if (heur > shatterOn.heur) shatterOn = { k, heur }
  })

  if (shatterOn.k === '') {
    console.log('===================== SHATTER BROKE ====================', lin, a)
    throw Error('Shatter broke...')
  }
  return shatterOn
}
