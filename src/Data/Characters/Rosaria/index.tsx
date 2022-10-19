import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { equal, greaterEq, infoMut, min, percent, prod, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Rosaria"
const elementKey: ElementKey = "cryo"
const data_gen = data_gen_src as CharacterData
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0, c1i = 0, c6i = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    hit1: skillParam_gen.skill[s++],
    hit2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    dotDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    crInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0]
  },
  passive2: {
    crBonus: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
    maxBonus: skillParam_gen.passive2[p2++][0]
  },
  constellation1: {
    atkSpdInc: skillParam_gen.constellation1[c1i++],
    dmgInc: skillParam_gen.constellation1[c1i++],
    duration: skillParam_gen.constellation1[c1i++],
  },
  constellation6: {
    physShred: skillParam_gen.constellation6[c6i++],
    duration: skillParam_gen.constellation6[c6i++],
  },
} as const

const [condA1Path, condA1] = cond(key, "RosariaA1")
const [condA4Path, condA4] = cond(key, "RosariaA4")
const [condC1Path, condC1] = cond(key, "RosariaC1")
const [condC6Path, condC6] = cond(key, "DilucC6")

const nodeA1CritInc = equal(condA1, "on", greaterEq(input.asc, 1, datamine.passive1.crInc))
const nodeA4CritBonusDisp = equal(condA4, "on",
  greaterEq(input.asc, 4, min(
    prod(percent(datamine.passive2.crBonus), input.premod.critRate_),
    percent(datamine.passive2.maxBonus)
  ))
)
const nodeA4CritBonus = unequal(target.charKey, key, nodeA4CritBonusDisp)

const nodeC1AtkSpd = equal(condC1, "on", greaterEq(input.constellation, 1, datamine.constellation1.atkSpdInc))
const nodeC1NormalInc = equal(condC1, "on", greaterEq(input.constellation, 1, datamine.constellation1.dmgInc))
const nodeC6PhysShred = equal(condC6, "on", greaterEq(input.constellation, 6, -datamine.constellation6.physShred))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    hit1: dmgNode("atk", datamine.skill.hit1, "skill"),
    hit2: dmgNode("atk", datamine.skill.hit2, "skill"),
  },
  burst: {
    hit1: dmgNode("atk", datamine.burst.hit1, "burst"),
    hit2: dmgNode("atk", datamine.burst.hit2, "burst"),
    dotDmg: dmgNode("atk", datamine.burst.dotDmg, "burst"),
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    critRate_: nodeA1CritInc,
    atkSPD_: nodeC1AtkSpd,
    normal_dmg_: nodeC1NormalInc,
  },
  teamBuff: {
    premod: {
      physical_enemyRes_: nodeC6PhysShred
    },
    total: {
      critRate_: nodeA4CritBonus
    }
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i + (i < 5 ? 0 : -1)}`),
          textSuffix: i === 4 ? "(1)" : i === 5 ? "(2)" : "",
          multi: i === 2 ? 2 : undefined,
        }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg, { name: ct.chg(`auto.skillParams.5`) }),
      }, {
        text: ct.chg("auto.skillParams.6"),
        value: datamine.charged.stamina,
      }]
    }, {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }]
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.hit1, { name: ct.chg(`skill.skillParams.0`), textSuffix: "(1)" }),
      }, {
        node: infoMut(dmgFormulas.skill.hit2, { name: ct.chg(`skill.skillParams.0`), textSuffix: "(2)" }),
      }, {
        text: ct.chg("skill.skillParams.1"),
        value: datamine.skill.cd,
        unit: 's'
      }]
    }]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.hit1, { name: ct.chg(`burst.skillParams.0`), textSuffix: "(1)" }),
      }, {
        node: infoMut(dmgFormulas.burst.hit2, { name: ct.chg(`burst.skillParams.0`), textSuffix: "(2)" }),
      }, {
        node: infoMut(dmgFormulas.burst.dotDmg, { name: ct.chg(`burst.skillParams.1`) })
      }, {
        text: ct.chg("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: datamine.burst.cost,
      }]
    }, ct.condTem("constellation6", {
      value: condC6,
      path: condC6Path,
      name: st("hitOp.skill"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: nodeC6PhysShred
          }, {
            text: stg("duration"),
            value: datamine.constellation6.duration,
            unit: 's'
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1", [ct.condTem("passive1", {
      name: ct.ch("a1"),
      value: condA1,
      path: condA1Path,
      states: {
        on: {
          fields: [{
            node: nodeA1CritInc
          }, {
            text: stg("duration"),
            value: datamine.passive1.duration,
            unit: 's'
          }]
        }
      }
    })]),
    passive2: ct.talentTem("passive2", [ct.condTem("passive2", {
      name: st("afterUse.burst"),
      value: condA4,
      path: condA4Path,
      teamBuff: true,
      // Hide for Rosaria
      canShow: unequal(input.activeCharKey, key, 1),
      states: {
        on: {
          fields: [{
            node: infoMut(nodeA4CritBonusDisp, { ...KeyMap.info("critRate_"), isTeamBuff: true }),
          }, {
            text: stg("duration"),
            value: datamine.passive2.duration,
            unit: 's'
          }]
        }
      }
    }), ct.condTem("passive1", {
      // A1 conditional in teambuff, if A4 is active
      path: condA1Path,
      value: condA1,
      name: ct.ch("a1"),
      teamBuff: true,
      canShow: unequal(input.activeCharKey, key, equal(condA4, "on", 1)),
      states: {
        on: {
          fields: [{
            node: nodeA1CritInc
          }, {
            text: stg("duration"),
            value: datamine.passive1.duration,
            unit: 's'
          }]
        }
      }
    })]),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1", [ct.condTem("constellation1", {
      value: condC1,
      path: condC1Path,
      name: st("hitOp.crit"),
      states: {
        on: {
          fields: [{
            node: nodeC1NormalInc
          }, {
            node: nodeC1AtkSpd,
          }, {
            text: stg("duration"),
            value: datamine.constellation1.duration,
            unit: 's'
          }]
        }
      }
    })]),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  },
}
export default new CharacterSheet(sheet, data, assets)
