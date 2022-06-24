"use strict";(self.webpackChunkgenshin_optimizer=self.webpackChunkgenshin_optimizer||[]).push([[110],{2191:function(n,e,t){t.d(e,{Z:function(){return _}});var r=t.p+"static/media/icon_bow.7ceaa8e25b0b8aeb8059.png",o=t.p+"static/media/icon_catalyst.db078b7b8059b30bef60.png",i=t.p+"static/media/icon_claymore.63b1abb8aeae95e8844d.png",a=t.p+"static/media/icon_polearm.e5f4a2a17edcf4ddec4d.png",c=t.p+"static/media/icon_sword.619c9c2d2c38eb90e342.png",u=t.p+"static/media/Item_Fragile_Resin.f9ec8223a0f695b313d4.png",s=t.p+"static/media/Item_Condensed_Resin.1cecf64ac9eea4bd933b.png",d=t.p+"static/media/Item_Wanderer's_Advice.58c62cf7c20b05da5d56.png",f=t.p+"static/media/Item_Hero's_Wit.a79e36d06cf81ac57536.png",l=t.p+"static/media/Item_Adventurer's_Experience.92b5d19508c95dfb3a30.png",p=t.p+"static/media/icon_team_1.41b86f382a2f22046378.png",m=t.p+"static/media/icon_team_2.a3ae60c2d611bee8e4be.png",v=t.p+"static/media/icon_team_3.e1118d3bf7ee2221b2d7.png",h=t.p+"static/media/icon_team_4.dc2457a39d3389110ffe.png",_={weaponTypes:{bow:r,catalyst:o,claymore:i,polearm:a,sword:c},slot:{flower:t.p+"static/media/icon_slot_flower.32f54857d26800b737d5.png",plume:t.p+"static/media/icon_slot_plume.f76181312931b3f6e2f0.png",sands:t.p+"static/media/icon_slot_sands.c0f765022ede0c4f8940.png",goblet:t.p+"static/media/icon_slot_goblet.073848cfcd634ccca56f.png",circlet:t.p+"static/media/icon_slot_circlet.f3dccabfef6a71aeeb36.png"},resin:{fragile:u,condensed:s},exp_books:{advice:d,wit:f,experience:l},team:{team1:p,team2:m,team3:v,team4:h}}},3992:function(n,e,t){var r=t(66934),o=t(57621),i=(0,r.ZP)(o.Z)((function(n){return{backgroundColor:n.theme.palette.contentDark.main}}));e.Z=i},71310:function(n,e,t){var r=t(66934),o=t(57621),i=(0,r.ZP)(o.Z)((function(n){return{backgroundColor:n.theme.palette.contentLight.main}}));e.Z=i},33890:function(n,e,t){t.d(e,{Z:function(){return p}});var r=t(1413),o=t(29439),i=t(45987),a=t(1235),c=t(24518),u=t(47047),s=t(65117),d=t(72791),f=t(80184),l=["title","children","id"];function p(n){var e=n.title,t=n.children,p=n.id,m=void 0===p?"dropdownbtn":p,v=(0,i.Z)(n,l),h=(0,d.useState)(null),_=(0,o.Z)(h,2),g=_[0],y=_[1],Z=Boolean(g),b=(0,d.useCallback)((function(n){return y(n.currentTarget)}),[y]),k=(0,d.useCallback)((function(){return y(null)}),[y]);return(0,f.jsxs)(d.Suspense,{fallback:(0,f.jsx)(c.Z,(0,r.Z)((0,r.Z)({endIcon:(0,f.jsx)(a.Z,{})},v),{},{children:(0,f.jsx)(u.Z,{width:50})})),children:[(0,f.jsx)(c.Z,(0,r.Z)((0,r.Z)({},v),{},{id:m,"aria-controls":"basic-menu","aria-haspopup":"true","aria-expanded":Z?"true":void 0,onClick:b,endIcon:(0,f.jsx)(a.Z,{}),children:e})),(0,f.jsx)(s.Z,{id:"basic-menu",anchorEl:g,open:Z,onClose:k,MenuListProps:{"aria-labelledby":m},onClick:k,children:(0,f.jsx)(d.Suspense,{fallback:(0,f.jsx)(u.Z,{width:"100%",height:"1000"}),children:t})})]})}},55942:function(n,e,t){var r=(0,t(66934).ZP)("img",{name:"ImgIcon",slot:"Root"})((function(n){var e=n.size;return{display:"inline-block",width:"auto",height:"".concat(1.2*(void 0===e?1:e),"em"),verticalAlign:"text-bottom"}}));e.Z=r},947:function(n,e,t){t.d(e,{G:function(){return k},Z:function(){return g}});var r=t(29439),o=t(1413),i=t(93433),a=t(15671),c=t(43144),u=t(2191),s=t(55942),d=t(25617),f=t(66624),l=t(26138),p=t(78661),m=t(2139),v=t(53343),h=t(80184),_=Promise.all([t.e(36),t.e(665)]).then(t.bind(t,79681)).then((function(n){return n.default})),g=function(){function n(e,t){var r=this;(0,a.Z)(this,n),this.sheet=void 0,this.data=void 0,this.isMelee=function(){var n=r.sheet.weaponTypeKey;return"sword"===n||"polearm"===n||"claymore"===n},this.getData=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"anemo";return"charKey"in r.data?r.data:r.data[n]},this.getTalent=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"anemo";return"talent"in r.sheet?r.sheet.talent:r.sheet.talents[n]},this.getTalentOfKey=function(n){var e,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"anemo";return null===(e=r.getTalent(t))||void 0===e?void 0:e.sheets[n]},this.sheet=e,this.data=t}return(0,c.Z)(n,[{key:"name",get:function(){return this.sheet.name}},{key:"icon",get:function(){return(0,h.jsx)(s.Z,{src:this.thumbImgSide,sx:{height:"2em",marginTop:"-2em",marginLeft:"-0.5em"}})}},{key:"nameWIthIcon",get:function(){return(0,h.jsxs)("span",{children:[this.icon," ",this.name]})}},{key:"cardImg",get:function(){return this.sheet.cardImg}},{key:"thumbImg",get:function(){return this.sheet.thumbImg}},{key:"thumbImgSide",get:function(){return this.sheet.thumbImgSide}},{key:"bannerImg",get:function(){return this.sheet.bannerImg}},{key:"rarity",get:function(){return this.sheet.rarity}},{key:"elementKey",get:function(){return"elementKey"in this.sheet?this.sheet.elementKey:void 0}},{key:"weaponTypeKey",get:function(){return this.sheet.weaponTypeKey}},{key:"constellationName",get:function(){return this.sheet.constellationName}},{key:"isTraveler",get:function(){return"talents"in this.sheet}}],[{key:"getAll",get:function(){return _}}]),n}();g.get=function(n){return n?_.then((function(e){return e[n]})):void 0},g.getLevelString=function(n,e){return"".concat(n,"/").concat(m.SJ[e])};var y=function(n,e,t){return{title:e("".concat(n,".name")),icon:(0,h.jsx)(s.Z,{size:2,sx:{m:-1},src:t}),action:(0,h.jsx)(d.Z,{color:"success",children:(0,v.st)("talents.".concat(n))}),description:e("".concat(n,".description"))}},Z={passive1:(0,p.ew)(l.qH.asc,1,1),passive2:(0,p.ew)(l.qH.asc,4,1),constellation1:(0,p.ew)(l.qH.constellation,1,1),constellation2:(0,p.ew)(l.qH.constellation,2,1),constellation3:(0,p.ew)(l.qH.constellation,3,1),constellation4:(0,p.ew)(l.qH.constellation,4,1),constellation5:(0,p.ew)(l.qH.constellation,5,1),constellation6:(0,p.ew)(l.qH.constellation,6,1)};function b(n,e){return Z[n]?(["passive1","passive2"].includes(n)?(t=l.qH.asc,r=1===+n.slice(-1)?1:4):(t=l.qH.constellation,r=+n.slice(-1)),e?(0,p.ew)(t,r,e||1):Z[n]):e;var t,r}var k=function(n,e,t,a){var c="Traveler"===n?[function(n){return(0,h.jsx)(f.v,{ns:"char_Traveler_gen",key18:"".concat(a,".").concat(n)})}]:(0,v.dW)("char",n),s=(0,r.Z)(c,1)[0];return t.auto=u.Z.weaponTypes[e],{talentTemplate:function(n,e){var r;return function(n,e,t,r){return{name:e("".concat(n,".name")),img:t,sections:[].concat((0,i.Z)("auto"!==n?[{text:e("".concat(n,".description"))}]:[]),(0,i.Z)(r||[]))}}(n,s,null!==(r=t[n])&&void 0!==r?r:"",e)},headerTemplate:function(n,e){var r;return function(n,e,t,r){return(0,o.Z)((0,o.Z)({},r),{},{header:y(n,e,t),canShow:b(n,r.canShow)})}(n,s,null!==(r=t[n])&&void 0!==r?r:"",e)},fieldsTemplate:function(n,e){return function(n,e){return(0,o.Z)((0,o.Z)({},e),{},{canShow:b(n,e.canShow)})}(n,e)},conditionalTemplate:function(n,e){var r;return function(n,e,t,r){return(0,o.Z)((0,o.Z)({},e),{},{header:(0,o.Z)((0,o.Z)({},y(n,t,r)),e.header),canShow:b(n,e.canShow)})}(n,e,s,null!==(r=t[n])&&void 0!==r?r:"")}}}},53343:function(n,e,t){t.d(e,{Oy:function(){return u},dW:function(){return f},st:function(){return c},v9:function(){return s},wV:function(){return d}});var r=t(93433),o=t(66624),i=t(78661),a=t(80184),c=function(n,e){return(0,a.jsx)(o.v,{ns:"sheet",key18:n,values:e})},u=function(n){return(0,a.jsx)(o.v,{ns:"sheet_gen",key18:n})},s=function(n){return(0,i.Mp)(["conditional"].concat((0,r.Z)(n)))};function d(n,e){var t=[n,e];return[t,s(t)]}function f(n,e){return[function(t){return(0,a.jsx)(o.v,{ns:"".concat(n,"_").concat(e,"_gen"),key18:t})},function(t,r){return(0,a.jsx)(o.v,{ns:"".concat(n,"_").concat(e),key18:t,values:r})}]}},26138:function(n,e,t){t.d(e,{fA:function(){return N},qH:function(){return M},ri:function(){return J},uK:function(){return G},y0:function(){return H}});var r,o=t(1413),i=t(37762),a=t(93433),c=t(79406),u=t(24351),s=t(60393),d=t(78661),f=!0,l=u.Kj,p=["auto","skill","burst"],m=["normal","charged","plunging","skill","burst","elemental"],v=["hp","hp_","atk","atk_","def","def_","eleMas","enerRech_","critRate_","critDMG_","electro_dmg_","hydro_dmg_","pyro_dmg_","cryo_dmg_","physical_dmg_","anemo_dmg_","geo_dmg_","heal_"],h=["overloaded","shattered","electrocharged","superconduct","swirl"],_=["vaporize","melt"],g=[].concat(v,(0,a.Z)(["all","burning"].concat(h,_,m).map((function(n){return"".concat(n,"_dmg_")})))),y=[].concat((0,a.Z)(l.flatMap((function(n){return["".concat(n,"_dmgInc"),"".concat(n,"_critDMG_"),"".concat(n,"_res_")]}))),(0,a.Z)(m.flatMap((function(n){return["".concat(n,"_dmgInc"),"".concat(n,"_critDMG_"),"".concat(n,"_critRate_")]}))),["all_dmgInc"],(0,a.Z)(c.bU),["enemyDefRed_"],["stamina","staminaDec_","staminaSprintDec_","staminaGlidingDec_","staminaChargedDec_","incHeal_","shield_","cdRed_","moveSPD_","atkSPD_","weakspotDMG_","dmgRed_","healInc"]),Z=(0,s.O)(p,(function(n){return(0,d.ij)()})),b=(0,s.O)(g,(function(n){return(0,d.ij)(void 0,{key:n})})),k=(0,s.O)(y,(function(n){return(0,d.ij)(void 0,{key:n})})),w=(0,i.Z)(l);try{for(w.s();!(r=w.n()).done;){var j=r.value;k["".concat(j,"_res_")].info.variant=j,k["".concat(j,"_enemyRes_")].info.variant=j,k["".concat(j,"_critDMG_")].info.variant=j,k["".concat(j,"_dmgInc")].info.variant=j,b["".concat(j,"_dmg_")].info.variant=j}}catch(L){w.e(L)}finally{w.f()}for(var S=0,x=[].concat(h,_);S<x.length;S++){var I=x[S];b["".concat(I,"_dmg_")].info.variant=I}function O(n,e){return e=(0,s.I8)(e),(0,s.Q1)(e,[],(function(n){return n.operation}),(function(e){return e.info=(0,o.Z)((0,o.Z)({},n),e.info)})),e}var W,K,M=(0,d.yY)((0,s.I8)({activeCharKey:(0,d.WK)(),charKey:(0,d.WK)(),charEle:(0,d.WK)(),weaponType:(0,d.WK)(),lvl:(0,d.ij)(void 0,{key:"level",prefix:"char"}),constellation:(0,d.ij)(),asc:(0,d.ij)(),special:(0,d.ij)(),infusion:{overridableSelf:(0,d.WK)("small"),nonOverridableSelf:(0,d.WK)("small"),team:(0,d.WK)("small")},base:(0,s.O)(["atk","hp","def"],(function(n){return(0,d.ij)("add",{key:n})})),customBonus:O({prefix:"custom",pivot:f},(0,o.Z)((0,o.Z)({},b),k)),bonus:(0,o.Z)({},Z),premod:(0,o.Z)((0,o.Z)((0,o.Z)({},Z),b),k),total:O({prefix:"total",pivot:f},(0,o.Z)((0,o.Z)((0,o.Z)((0,o.Z)((0,o.Z)({},Z),(0,s.Uq)(p,(function(n){return["".concat(n,"Index"),(0,d.ij)()]}))),b),k),{},{cappedCritRate:(0,d.ij)(void 0,{key:"critRate_"})})),art:O({prefix:"art",asConst:true},(0,o.Z)((0,o.Z)({},(0,s.O)(v,(function(n){return b[n]}))),(0,s.O)(u.eV,(function(n){return{id:(0,d.WK)(),set:(0,d.WK)()}})))),artSet:(0,s.O)(u.q2,(function(n){return(0,d.ij)("add",{key:n})})),weapon:O({prefix:"weapon",asConst:true},{id:(0,d.WK)(),key:(0,d.WK)(),type:(0,d.WK)(),lvl:(0,d.ij)(),asc:(0,d.ij)(),refinement:(0,d.ij)(),refineIndex:(0,d.ij)(),main:(0,d.ij)(),sub:(0,d.ij)(),sub2:(0,d.ij)()}),enemy:(0,o.Z)((0,o.Z)((0,o.Z)({def:(0,d.ij)("add",{key:"enemyDef_multi",pivot:f})},(0,s.O)(l.map((function(n){return"".concat(n,"_resMulti")})),(function(n){return(0,d.ij)()}))),{},{level:(0,d.ij)(void 0,{key:"enemyLevel"})},(0,s.Uq)(l,(function(n){return["".concat(n,"_res_"),(0,d.ij)(void 0)]}))),{},{defRed:(0,d.ij)(void 0),defIgn:(0,d.ij)("add",{key:"enemyDefIgn_",pivot:f})}),hit:{ele:(0,d.WK)(),reaction:(0,d.WK)(),move:(0,d.WK)(),hitMode:(0,d.WK)(),base:(0,d.ij)("add",{key:"base"}),dmgBonus:(0,d.ij)("add",{key:"dmg_",pivot:f}),dmgInc:(0,d.ij)("add",{key:"dmgInc",pivot:f}),dmg:(0,d.ij)()}})),V=M.base,R=M.bonus,C=M.customBonus,D=M.premod,P=M.total,T=M.art,z=M.hit,q=M.enemy;W="add",K={bonus:R,customBonus:C,premod:D,art:T,total:(0,s.O)(g,(function(n){return P[n]}))},(0,s.Q1)(K,[],(function(n){return n.operation}),(function(n){"read"===n.operation&&"number"===n.type&&(n.accu=W)})),R.auto.info={key:"autoBoost"},R.skill.info={key:"skillBoost"},R.burst.info={key:"burstBoost"},V.atk.info={key:"atk",prefix:"base",pivot:f},delete P.critRate_.info.pivot,P.critRate_.info.prefix="uncapped";var B=(0,d.Sm)(d.J_,(0,d.WV)(25/9,(0,d.F9)(P.eleMas,1400))),A=(0,d.P5)(z.ele,{pyro:(0,d.P5)(z.reaction,{pyro_vaporize:(0,d.a9)("vaporize"),pyro_melt:(0,d.a9)("melt")},void 0),hydro:(0,d.sZ)(z.reaction,"hydro_vaporize","vaporize"),cryo:(0,d.sZ)(z.reaction,"cryo_melt","melt")},void 0),H={premod:(0,o.Z)((0,o.Z)((0,o.Z)({},(0,s.O)(p,(function(n){return R[n]}))),(0,s.O)(y,(function(n){return C[n]}))),(0,s.O)(g,(function(n){var e=[];switch(n){case"atk":case"def":case"hp":e.push((0,d.WV)(V[n],(0,d.Sm)(d.J_,D["".concat(n,"_")])));break;case"critRate_":e.push((0,d.aQ)(.05,{key:n,prefix:"default"}),(0,d.P5)(z.move,(0,s.O)(m,(function(n){return D["".concat(n,"_critRate_")]})),0));break;case"critDMG_":e.push((0,d.aQ)(.5,{key:n,prefix:"default"}),(0,d.P5)(z.ele,(0,s.O)(l,(function(n){return D["".concat(n,"_critDMG_")]})),0),(0,d.P5)(z.move,(0,s.O)(m,(function(n){return D["".concat(n,"_critDMG_")]})),0));break;case"enerRech_":e.push((0,d.aQ)(1,{key:n,prefix:"default"}))}return d.Sm.apply(void 0,(0,a.Z)([].concat(e,[T[n],C[n]]).filter((function(n){return n}))))}))),total:(0,o.Z)((0,o.Z)((0,o.Z)((0,o.Z)((0,o.Z)({},(0,s.O)(p,(function(n){return D[n]}))),(0,s.O)(g,(function(n){return D[n]}))),(0,s.O)(y,(function(n){return D[n]}))),(0,s.Uq)(p,(function(n){return["".concat(n,"Index"),(0,d.Sm)(P[n],-1)]}))),{},{stamina:(0,d.Sm)((0,d.a9)(100,{key:"stamina",prefix:"default"}),C.stamina),cappedCritRate:(0,d.Fp)((0,d.VV)(P.critRate_,d.J_),d.zv)}),hit:{dmgBonus:(0,d.Sm)(P.all_dmg_,(0,d.P5)(z.move,(0,s.O)(m,(function(n){return P["".concat(n,"_dmg_")]})),d.zv),(0,d.P5)(z.ele,(0,s.O)(l,(function(n){return P["".concat(n,"_dmg_")]})),d.zv)),dmgInc:(0,d.Sm)(P.all_dmgInc,(0,d.P5)(z.ele,(0,s.O)(l,(function(n){return P["".concat(n,"_dmgInc")]})),NaN),(0,d.P5)(z.move,(0,s.O)(m,(function(n){return P["".concat(n,"_dmgInc")]})),NaN)),dmg:(0,d.WV)((0,d.Sm)(z.base,z.dmgInc),(0,d.Sm)(d.J_,z.dmgBonus),(0,d.P5)(z.hitMode,{hit:d.J_,critHit:(0,d.Sm)(d.J_,P.critDMG_),avgHit:(0,d.Sm)(d.J_,(0,d.WV)(P.cappedCritRate,P.critDMG_))},NaN),q.def,(0,d.P5)(z.ele,(0,s.O)(l,(function(n){return q["".concat(n,"_resMulti")]})),NaN),(0,d.P5)(A,{melt:(0,d.P5)(z.ele,{pyro:(0,d.WV)(2,(0,d.Sm)(B,P.melt_dmg_)),cryo:(0,d.WV)(1.5,(0,d.Sm)(B,P.melt_dmg_))},1,{key:"melt_dmg_"}),vaporize:(0,d.P5)(z.ele,{hydro:(0,d.WV)(2,(0,d.Sm)(B,P.vaporize_dmg_)),pyro:(0,d.WV)(1.5,(0,d.Sm)(B,P.vaporize_dmg_))},1,{key:"vaporize_dmg_"})},1))},enemy:(0,o.Z)({def:(0,d.F9)((0,d.Sm)(M.lvl,100),(0,d.WV)((0,d.Sm)(q.level,100),(0,d.Sm)(d.J_,(0,d.WV)(-1,q.defRed)),(0,d.Sm)(d.J_,(0,d.WV)(-1,q.defIgn)))),defRed:P.enemyDefRed_},(0,s.Uq)(l,(function(n){return["".concat(n,"_resMulti"),(0,d.R9)((0,d.ce)((0,d.Sm)(q["".concat(n,"_res_")],P["".concat(n,"_enemyRes_")]),{key:"".concat(n,"_res_"),variant:n}))]})))},N=(0,d.yY)((0,s.I8)(M),["target"]),G=(0,o.Z)((0,o.Z)({},(0,d.yY)((0,s.O)([].concat((0,a.Z)(l),(0,a.Z)(u.vn)),(function(n){return(0,d.ij)("add")})),["tally"])),{},{ele:d.ys});G.ele=d.Sm.apply(void 0,(0,a.Z)(l.map((function(n){return(0,d.VV)(G[n],1)}))));var J=M},78661:function(n,e,t){t.d(e,{Dg:function(){return y},ER:function(){return S},F9:function(){return _},Fp:function(){return m},J_:function(){return c},KP:function(){return b},Mp:function(){return K},NY:function(){return z},P5:function(){return l},PX:function(){return B},Qj:function(){return j},Qq:function(){return R},R9:function(){return g},Sm:function(){return v},UF:function(){return W},VV:function(){return p},WK:function(){return V},WV:function(){return h},a9:function(){return s},aQ:function(){return d},aT:function(){return I},ce:function(){return f},ew:function(){return k},ij:function(){return M},lp:function(){return C},m7:function(){return T},sD:function(){return w},sZ:function(){return Z},uY:function(){return O},yY:function(){return x},ys:function(){return a},zv:function(){return u}});var r=t(93433),o=t(1413),i=t(60393),a=s(NaN,{key:"TODO"}),c=d(1),u=d(0);function s(n,e){return{operation:"const",operands:[],value:n,info:e}}function d(n,e){return n>=Number.MAX_VALUE/100&&(n=1/0),n<=-Number.MAX_VALUE/100&&(n=-1/0),s(n,(0,o.Z)({key:"_"},e))}function f(n,e){return e&&(n.info=(0,o.Z)((0,o.Z)({},n.info),e)),n}function l(n,e,t,r){return{operation:"lookup",operands:"none"!==t?[P(n),P(t)]:[P(n)],table:e,info:r}}function p(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];return{operation:"min",operands:D(e)}}function m(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];return{operation:"max",operands:D(e)}}function v(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];return{operation:"add",operands:D(e)}}function h(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];return{operation:"mul",operands:D(e)}}function _(n,e){return{operation:"sum_frac",operands:D([n,e])}}function g(n){return{operation:"res",operands:D([n])}}function y(n,e,t,r){return{operation:"match",operands:[P(n),P(e),P(t),P(0)],info:r,emptyOn:"unmatch"}}function Z(n,e,t,r){return{operation:"match",operands:[P(n),P(e),P(t),P(void 0)],info:r,emptyOn:"unmatch"}}function b(n,e,t,r){return{operation:"match",operands:[P(n),P(e),P(0),P(t)],info:r,emptyOn:"match"}}function k(n,e,t,r){return{operation:"threshold",operands:[P(n),P(e),P(t),P(0)],info:r,emptyOn:"l"}}function w(n,e,t,r){return{operation:"threshold",operands:[P(n),P(e),P(t),P(void 0)],info:r,emptyOn:"l"}}function j(n,e,t,r){return{operation:"threshold",operands:[P(n),P(e),P(0),P(t)],info:r,emptyOn:"ge"}}function S(n,e,t,r,o){return{operation:"threshold",operands:[P(n),P(e),P(t),P(r)],info:o}}function x(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(n.operation){if("read"!==n.operation)throw new Error("Found ".concat(n.operation," node while making reader"));return(0,o.Z)((0,o.Z)({},n),{},{path:e})}return(0,i.O)(Object.keys(n),(function(t){return x(n[t],[].concat((0,r.Z)(e),[t]))}))}function I(n,e){return{operation:"data",operands:[n],data:e}}function O(n,e,t){return{operation:"data",operands:[n],data:e,reset:!0,info:t}}function W(n,e){return{operation:"read",operands:[],path:n,info:e,type:"number"}}function K(n){return{operation:"read",operands:[],path:n,type:"string"}}function M(n,e){return{operation:"read",operands:[],path:[],accu:n,info:e,type:"number"}}function V(n){return{operation:"read",operands:[],path:[],accu:n,type:"string"}}function R(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];return{operation:"prio",operands:D(e)}}function C(n,e,t){return{operation:"subscript",operands:[n],list:e,info:t}}function D(n){return n.map((function(n){return"object"===typeof n?n:s(n)}))}function P(n){return"object"!==typeof n?s(n):n}function T(n,e,t,r,o){return{operation:"match",operands:[P(n),P(e),P(t),P(r)],info:o}}function z(n,e){if(n.operation!==e.operation)return!1;if(n.operands.length!==e.operands.length)return!1;switch(n.operation){case"read":return e.operation===n.operation&&n.path.every((function(n,t){return n===e.path[t]}));case"const":return e.operation===n.operation&&n.value===e.value;case"mul":case"add":case"min":case"max":if(e.operation!==n.operation)return!1;var t=[];return n.operands.every((function(n,r){return e.operands.some((function(e,r){return!t.includes(r)&&(!!z(n,e)&&(t.push(r),!0))}))}));default:return n.operands.every((function(n,t){return z(n,e.operands[t])}))}}var q=function(n){for(var e,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=3735928559^t,o=1103547991^t,i=0;i<n.length;i++)e=n.charCodeAt(i),r=Math.imul(r^e,2654435761),o=Math.imul(o^e,1597334677);return r=Math.imul(r^r>>>16,2246822507)^Math.imul(o^o>>>13,3266489909),4294967296*(2097151&(o=Math.imul(o^o>>>16,2246822507)^Math.imul(r^r>>>13,3266489909)))+(r>>>0)};function B(n){var e=Math.imul(q(n.operation),5234543537);switch(n.operation){case"const":return e^q(n.value.toString(2));case"mul":case"add":case"min":case"max":return n.operands.reduce((function(n,e){return n^B(e)}),e);default:return n.operands.reduce((function(n,e){return Math.imul(n^B(e),9923429423)}),e)}}},42320:function(n,e,t){t.d(e,{Z:function(){return i}});var r=t(29439),o=t(72791);function i(n,e){var t=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],i=(0,o.useState)(void 0),a=(0,r.Z)(i,2),c=a[0],u=a[1];return(0,o.useEffect)((function(){var e,r=!0;return null!==(e=null===n||void 0===n?void 0:n.then((function(n){return r&&u((function(){return n}))}),console.error))&&void 0!==e||u(void 0),function(){r=!1,!t&&u(void 0)}}),e),c}},50921:function(n,e,t){t.d(e,{_L:function(){return i},vV:function(){return o},zU:function(){return a}});var r=t(6239),o=["level","rarity","name"];function i(n,e){return{new:{getValue:function(e){return n._getChar(e)?0:1},tieBreaker:"name"},name:{getValue:function(n){return n}},level:{getValue:function(e){var t,r;return null!==(t=null===(r=n._getChar(e))||void 0===r?void 0:r.level)&&void 0!==t?t:0},tieBreaker:"rarity"},rarity:{getValue:function(n){var t;return null===e||void 0===e||null===(t=e[n])||void 0===t?void 0:t.rarity},tieBreaker:"level"}}}function a(n,e){return{element:function(t,r){var o,i;return!r||r.includes(null===e||void 0===e||null===(o=e[t])||void 0===o?void 0:o.elementKey)||"Traveler"===t&&!n._getChar(t)||"Traveler"===t&&r.includes(null===(i=n._getChar(t))||void 0===i?void 0:i.elementKey)},weaponType:function(n,t){var r;return!t||t.includes(null===e||void 0===e||null===(r=e[n])||void 0===r?void 0:r.weaponTypeKey)},favorite:function(e,t){var r;return!t||t===(null!==(r=n._getChar(e))&&void 0!==r&&r.favorite?"yes":"no")},name:function(n,e){return!e||r.Z.t("char_".concat(n,"_gen:name")).toLowerCase().includes(e.toLowerCase())}}}},46956:function(n,e,t){t.d(e,{C:function(){return i},e:function(){return o}});var r=t(29439);function o(n,e,t){function r(n,e,t,r){var o=r.getValue(n),i=r.getValue(e);return(t?-1:1)*("string"===typeof o&&"string"===typeof i?o.localeCompare(i):i-o)}return function(o,i){if(!t[n])return 0;var a=t[n],c=r(o,i,e,a);return!c&&a.tieBreaker&&t[a.tieBreaker]&&(c=r(o,i,e,t[a.tieBreaker])),c}}function i(n,e){return function(t){return Object.entries(n).every((function(n){var o=(0,r.Z)(n,2),i=o[0],a=o[1];return e[i]&&e[i](t,a)}))}}}}]);
//# sourceMappingURL=110.caf4d15b.chunk.js.map