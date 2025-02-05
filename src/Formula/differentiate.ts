import { assertUnreachable } from "../Util/Util"
import { forEachNodes } from "./internal"
import { constant, sum, prod, threshold, frac, max, min } from "./utils"
import { NumNode, ReadNode } from "./type"
import { precompute, OptNode } from "./optimization"
import { DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"

export function zero_deriv(funct: OptNode, binding: (readNode: ReadNode<number>) => string, diff: string): boolean {
  let ret = true
  forEachNodes([funct], _ => { }, f => {
    const { operation } = f
    switch (operation) {
      case "read":
        if (f.type !== "number" || (f.accu && f.accu !== "add"))
          throw new Error(`Unsupported [${operation}] node in zero_deriv`)
        if (binding(f) === diff) ret = false
    }
  })
  return ret
}

export function ddx(f: OptNode, binding: (readNode: ReadNode<number>) => string, diff: string): OptNode {
  const { operation } = f
  switch (operation) {
    case "read":
      if (f.type !== "number" || (f.accu && f.accu !== "add"))
        throw new Error(`Unsupported [${operation}] node in d/dx`)
      const name = binding(f)
      if (name === diff) return constant(1)
      return constant(0)
    case "const": return constant(0)
    case "res":
      if (!zero_deriv(f, binding, diff)) throw new Error(`[${operation}] node takes only constant inputs. ${f}`)
      return constant(0)

    case "add": return sum(...f.operands.map(fi => ddx(fi, binding, diff)))
    case "mul":
      let ops = f.operands.map((fi, i) => prod(ddx(fi, binding, diff), ...f.operands.filter((v, ix) => ix !== i)))
      return sum(...ops)
    case "sum_frac":
      const a = f.operands[0]
      const da = ddx(a, binding, diff)
      const b = sum(...f.operands.slice(1,))
      const db = ddx(b, binding, diff)
      const denom = prod(sum(...f.operands), sum(...f.operands))
      const numerator = sum(prod(b, da), prod(-1, a, db))
      return frac(numerator, sum(prod(-1, numerator), denom))

    case "min": case "max":
      switch (f.operands.length) {
        case 1: return ddx(f.operands[0], binding, diff)
        case 2:
          const [arg1, arg2] = f.operands
          if (operation === "min") return threshold(arg1, arg2, ddx(arg2, binding, diff), ddx(arg1, binding, diff))
          if (operation === "max") return threshold(arg1, arg2, ddx(arg1, binding, diff), ddx(arg2, binding, diff))
          assertUnreachable(operation)
          break;
        default:
          if (operation === "min") return ddx(min(f.operands[0], min(...f.operands.slice(1))), binding, diff)
          if (operation === "max") return ddx(min(f.operands[0], min(...f.operands.slice(1))), binding, diff)
          throw new Error(`[${operation}] node operates on only 1 or 2 arguments. ${f}`)
      }
      break;
    case "threshold":
      const [value, thr, pass, fail] = f.operands
      if (!zero_deriv(value, binding, diff) || !zero_deriv(thr, binding, diff))
        throw new Error(`[${operation}] node must branch on constant inputs. ${f}`)
      return threshold(value, thr, ddx(pass, binding, diff), ddx(fail, binding, diff))
    default:
      assertUnreachable(operation)
  }
}

export function diff_debug() {
  console.log('Youve reached differentiate!!!')

  // Copied stats & formula from arbitrary build of my HuTao
  const stats: DynStat = { "0": 0.284294, "1": 0.9462000033378601, "2": 0.1, "3": 1.48, "TenacityOfTheMillelith": 0, "hp_": 0.23249999999999998, "hp": 1159, "ShimenawasReminiscence": 1, "atk_": 0.0933, "atk": 110.58, "EmblemOfSeveredFate": 0, "enerRech_": 0.09709999999999999 }
  const formula1: NumNode = { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "TenacityOfTheMillelith"], "accu": "add", "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "hp_"], "type": "number", "accu": "add" }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 15552.306844604493 }] }, { "operation": "read", "operands": [], "path": ["dyn", "hp"], "type": "number", "accu": "add" }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.05957 }] }, { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "ShimenawasReminiscence"], "accu": "add", "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.18 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "atk_"], "type": "number", "accu": "add" }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 507.727969991803 }] }, { "operation": "read", "operands": [], "path": ["dyn", "atk"], "type": "number", "accu": "add" }] }, { "operation": "read", "operands": [], "path": ["dyn", "3"], "type": "number", "accu": "add" }, { "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "0"], "type": "number", "accu": "add" }, { "operation": "read", "operands": [], "path": ["dyn", "1"], "type": "number", "accu": "add" }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "res", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "2"], "type": "number", "accu": "add" }] }, { "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "sum_frac", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "WanderersTroupe"], "accu": "add", "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 80 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "eleMas"], "type": "number", "accu": "add" }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 1400 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 2.7777777777777777 }] }, { "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "CrimsonWitchOfFlames"], "accu": "add", "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 4 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.15}, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "emptyOn": "l" }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 1.71495 }] }
  const formula2 = formula1 as OptNode

  const compute = precompute([formula2], {}, f => f.path[1], 1)

  var result = compute([{ id: '', values: stats }])[0]

  // Check validity of calculated derivatives
  const eps = 1e-5
  let stat2 = { ...stats }
  stat2['hp_'] = eps + (stat2['hp_'] ?? 0)
  var res2 = compute([{ id: '', values: stat2 }])[0]
  var dhp_ = ddx(formula2, f => f.path[1], 'hp_')
  const c_dhp_ = precompute([dhp_], {}, f => f.path[1], 1)
  console.log('diff hp_ (numeric/symbolic)', (res2 - result) / eps, c_dhp_([{ id: '', values: stats }])[0])

  stat2 = { ...stats }
  stat2['hp'] = eps + (stat2['hp'] ?? 0)
  res2 = compute([{ id: '', values: stat2 }])[0]
  var dhp = ddx(formula2, f => f.path[1], 'hp')
  const c_dhp = precompute([dhp], {}, f => f.path[1], 1)
  console.log('diff hp (numeric/symbolic)', (res2 - result) / eps, c_dhp([{ id: '', values: stats }])[0])

  stat2 = { ...stats }
  stat2['atk_'] = eps + (stat2['atk_'] ?? 0)
  res2 = compute([{ id: '', values: stat2 }])[0]
  var datk_ = ddx(formula2, f => f.path[1], 'atk_')
  const c_datk_ = precompute([datk_], {}, f => f.path[1], 1)
  console.log('diff atk_ (numeric/symbolic)', (res2 - result) / eps, c_datk_([{ id: '', values: stats }])[0])

  stat2 = { ...stats }
  stat2['atk'] = eps + (stat2['atk'] ?? 0)
  res2 = compute([{ id: '', values: stat2 }])[0]
  var datk = ddx(formula2, f => f.path[1], 'atk')
  const c_datk = precompute([datk], {}, f => f.path[1], 1)
  console.log('diff atk (numeric/symbolic)', (res2 - result) / eps, c_datk([{ id: '', values: stats }])[0])


  stat2 = { ...stats }
  stat2['eleMas'] = eps + (stat2['eleMas'] ?? 0)
  res2 = compute([{ id: '', values: stat2 }])[0]
  var deleMas = ddx(formula2, f => f.path[1], 'eleMas')
  const c_deleMas = precompute([deleMas], {}, f => f.path[1], 1)
  console.log('diff eleMas (numeric/symbolic)', (res2 - result) / eps, c_deleMas([{ id: '', values: stats }])[0])
}
