import type {WorldDefinition,Asset} from './schema';
export const prisonerArt:Record<string,Asset>={
 'prisoners-shadow-background':{src:'assets/cave-prisoners/shadow-room-v2.png',width:1280,height:720,kind:'rock',label:'Sala de sombras · sin fuego visible'},
 'prisoner-bound-back':{src:'assets/cave-prisoners/prisoner-bound-back-idle.png',width:140,height:140,kind:'philosopher',label:'Prisionero sentado de espaldas y encadenado · animado',animation:{columns:3,rows:2,frames:6,frameRate:3,anchorY:.94}}
};
/** Upgrade only known prototype art; preserve custom backgrounds, appearances and narrative state. */
export function restorePrisonerPresentation(w:WorldDefinition){
 if(w.id!=='plato'||!w.journey)return w;
 const room=w.interiors.prisioneros;if(!room)return w;
 for(const [id,a] of Object.entries(prisonerArt))w.assets[id]??=structuredClone(a);
 const source=w.assets[room.background],paths=[source?.src,source?.projectPath].filter(Boolean) as string[];
 if(paths.some(p=>p.endsWith('ec43f3ee-167f-4349-8070-2394379ab0a2-Caverna-de-Platon-a-la-Luz-del-Fuego.png')||p.endsWith('02_prisioneros_sin_npc.png'))){room.background='prisoners-shadow-background';if(room.lighting?.darkness===.96)room.lighting.darkness=.82}
 for(const id of ['prisionero-encadenado','otros-encadenados']){
  const o=room.items.find(o=>o.id===id);if(!o||o.spriteId)continue;
  const asset=o.asset??(o.characterId?w.characters?.[o.characterId]?.spriteId:undefined);
  if(asset&&!['prisoner','warden','character-prisionero-sprite','character-otro-prisionero-sprite'].includes(asset))continue;
  o.spriteId='prisoner-bound-back';o.lockFacing=true;
 }
 return w;
}
