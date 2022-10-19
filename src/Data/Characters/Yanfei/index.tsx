import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, customShieldNode, dataObjForCharacterSheet, dmgNode, shieldElement } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Yanfei"
const elementKey: ElementKey = "pyro"
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
    ]
  },
  charged: {
    dmgArr: [
      skillParam_gen.auto[a++], // 0 seals
      skillParam_gen.auto[a++], // 1 seal
      skillParam_gen.auto[a++], // 2 seals
      skillParam_gen.auto[a++], // 3 seals
      skillParam_gen.auto[a++], // 4 seals
    ],
    unknown: {
      arr: [
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
      ]
    },
    stamina: skillParam_gen.auto[a++][0],
    sealStaminaRed_: skillParam_gen.auto[a++][0],
    maxSeals: 3,
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  sealDuration: skillParam_gen.auto[a++][0],
  // There is another unknown here for auto
  skill: {
    dmg: skillParam_gen.skill[0],
    cd: skillParam_gen.skill[1][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    charged_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    sealInterval: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    seal_pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmg: percent(skillParam_gen.passive2[0][0])
  },
  c1: {
    sealStaminaRed_: skillParam_gen.constellation1[0]
  },
  c2: {
    hpThresh: skillParam_gen.constellation2[0],
    charged_critRate_: skillParam_gen.constellation2[1]
  },
  c4: {
    hpShield_: skillParam_gen.constellation4[0],
    duration: 15,
  },
  c6: {
    extraSeals: skillParam_gen.constellation6[0]
  }
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurst_charged_dmg_ = equal(condAfterBurst, "on",
  subscript(input.total.burstIndex, datamine.burst.charged_dmg_)
)

const [condP1SealsPath, condP1Seals] = cond(key, "p1Seals")
const p1_pyro_dmg_ = greaterEq(input.asc, 1,
  // TODO: Should be changing number of seals shown based on C6
  lookup(condP1Seals, Object.fromEntries(range(1, 4).map(seals => [
    seals,
    prod(seals, datamine.passive1.seal_pyro_dmg_)
  ])), naught)
)

const [condP2ChargedCritPath, condP2ChargedCrit] = cond(key, "p2ChargedCrit")

const [condC2EnemyHpPath, condC2EnemyHp] = cond(key, "c2EnemyHp")
const c2EnemyHp_critRate_ = greaterEq(input.constellation, 2,
  equal(condC2EnemyHp, "on", datamine.c2.charged_critRate_)
)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: Object.fromEntries(datamine.charged.dmgArr.map((arr, i) =>
    [i, i < 4
      ? dmgNode("atk", arr, "charged")
      : greaterEq(input.constellation, 6, dmgNode("atk", arr, "charged"))
    ])),
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill")
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst")
  },
  passive2: {
    dmg: greaterEq(input.asc, 4, equal(condP2ChargedCrit, "on",
      customDmgNode(prod(input.total.atk, datamine.passive2.dmg), "charged")
    ))
  },
  constellation4: {
    pyro_shield: greaterEq(input.constellation, 4,
      shieldElement(elementKey, customShieldNode(prod(input.total.hp, datamine.c4.hpShield_)))
    ),
    norm_shield: greaterEq(input.constellation, 4,
      customShieldNode(prod(input.total.hp, datamine.c4.hpShield_))
    ),
  },
} as const

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5,
  },
  premod: {
    charged_dmg_: afterBurst_charged_dmg_,
    charged_critRate_: c2EnemyHp_critRate_,
    pyro_dmg_: p1_pyro_dmg_,
  }
})

const sheet: ICharacterSheet = {
  key,
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [
        // TODO: Would probably be better as a conditional,
        // but can't make conditional states based on constellation value
        ...datamine.charged.dmgArr.map((_, i) => ({
          node: infoMut(dmgFormulas.charged[i], { name: ct.chg(`charged.${i}`) }),
        })), {
          text: ct.chg("auto.skillParams.4"),
          // TODO: Should change this value based on how many seals, but can't do without conditional
          // charged attack. And its a bit execssive.
          value: datamine.charged.stamina,
        }, {
          text: st("staminaDec_"),
          value: datamine.charged.sealStaminaRed_ * 100,
          textSuffix: ct.ch("perSeal"),
          unit: "%",
        }, {
          text: ct.ch("maxSeals"),
          value: data => data.get(input.constellation).value >= 6
            ? datamine.charged.maxSeals + datamine.c6.extraSeals
            : datamine.charged.maxSeals,
        }, {
          text: ct.chg("auto.skillParams.6"),
          value: datamine.sealDuration,
          unit: "s"
        }],
    }, ct.condTem("passive1", {
      value: condP1Seals,
      path: condP1SealsPath,
      name: ct.ch("passive1.sealsConsumed"),
      // TODO: Should be changing number of seals shown based on C6
      states: Object.fromEntries(range(1, 4).map(seals => [
        seals, {
          name: ct.ch(`seals.${seals}`),
          fields: [{
            node: p1_pyro_dmg_,
          }, {
            text: stg("duration"),
            value: datamine.passive1.duration,
            unit: "s"
          }]
        }
      ]))
    }), ct.condTem("passive2", {
      value: condP2ChargedCrit,
      path: condP2ChargedCritPath,
      name: ct.ch("passive2.chargedCrit"),
      states: {
        on: {
          fields: [{
            node: infoMut(dmgFormulas.passive2.dmg, { name: ct.chg("passive2.key") })
          }]
        }
      }
    }), ct.headerTem("constellation1", {
      fields: [{
        text: ct.ch("c1.sealChargedStam_"),
        value: datamine.c1.sealStaminaRed_ * -100,
        textSuffix: ct.ch("perSeal"),
        unit: "%"
      }, {
        text: st("incInterRes")
      }]
    }), ct.condTem("constellation2", {
      value: condC2EnemyHp,
      path: condC2EnemyHpPath,
      name: st("enemyLessPercentHP", { percent: datamine.c2.hpThresh * 100 }),
      states: {
        on: {
          fields: [{
            node: c2EnemyHp_critRate_
          }]
        }
      }
    }), ct.headerTem("constellation6", {
      fields: [{
        text: ct.ch("c6.maxSealInc"),
        value: datamine.c6.extraSeals
      }]
    }), {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }],
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        text: stg("cd"),
        value: datamine.skill.cd,
        unit: "s",
      }]
    }]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        text: ct.ch("burst.grantMax")
      }, {
        text: stg("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: stg("energyCost"),
        value: datamine.burst.enerCost,
      }]
    }, ct.condTem("burst", {
      value: condAfterBurst,
      path: condAfterBurstPath,
      name: st("afterUse.burst"),
      states: {
        on: {
          fields: [{
            text: ct.chg("burst.skillParams.2"),
            value: datamine.burst.sealInterval,
            unit: "s"
          }, {
            node: afterBurst_charged_dmg_
          }]
        }
      }
    }), ct.headerTem("constellation4", {
      fields: [{
        node: infoMut(dmgFormulas.constellation4.norm_shield, { name: stg("dmgAbsorption") })
      }, {
        node: infoMut(dmgFormulas.constellation4.pyro_shield, { name: st(`dmgAbsorption.${elementKey}`) })
      }, {
        text: stg("duration"),
        value: datamine.c4.duration,
        unit: "s"
      }]
    })]),
    passive1: ct.talentTem("passive1"),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2"),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTem("constellation4"),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets)
