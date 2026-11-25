import {mechanicsFor} from '../gameplay/equipment.ts';
import type {WorldDefinition,InteriorItem,Mission,InventoryDefinition,Dialogue,Behavior,Asset} from './schema';
export interface PlatoSearchPack {assets:Record<string,Asset>;inventoryItems:Record<string,InventoryDefinition>;intro:Dialogue;dialogues:Record<string,Dialogue>;interactions:Record<string,Behavior>;missions:Mission[];lampObject:InteriorItem}
/** One-time compatibility patch for older author drafts. The playable content lives in JSON. */
export function restorePlatoSearch(world:WorldDefinition,pack:PlatoSearchPack){
 if(world.id!=='plato'||!world.journey||world.inventoryItems?.['linterna-sofia'])return world;
 const w=structuredClone(world);w.assets={...pack.assets,...w.assets};w.inventoryItems={...pack.inventoryItems,...w.inventoryItems};
 w.mechanics??=mechanicsFor(w);w.mechanics.lamp.onUseFlags??=['linterna_utilizada'];w.mechanics.lamp.requires=[...new Set([...(w.mechanics.lamp.requires??[]),'inventory:linterna-sofia:owned'])];
 const old=w.dialogues[w.intro],canonical=old&&Object.keys(old.nodes).length===1&&Object.values(old.nodes)[0].text.startsWith('Bienvenida, Sofía. En la caverna');
 if(canonical)w.dialogues[w.intro]={...structuredClone(pack.intro),reward:{...old.reward,flags:[...new Set([...(old.reward?.flags??[]),'busqueda_linterna_iniciada'])]}};
 else if(old)old.reward={...old.reward,flags:[...new Set([...(old.reward?.flags??[]),'busqueda_linterna_iniciada'])]};
 for(const [id,d] of Object.entries(pack.dialogues))w.dialogues[id]??=structuredClone(d);
 for(const [id,b] of Object.entries(pack.interactions)){
  if(id==='mentor'){const old=w.interactions[id];if(old?.actions[0]?.type==='talk'&&old.actions[0].target===w.intro)w.interactions[id]={...old,actions:[...structuredClone(b.actions),...old.actions.slice(1)]};else w.interactions[id]??=structuredClone(b)}
  else if(id==='entrada-prisioneros'){const old=w.interactions[id];w.interactions[id]={...old,...b,requires:[...new Set([...(old?.requires??[]),'caverna_acceso_autorizado'])],actions:[structuredClone(b.actions[0]),...(old?.actions??b.actions.slice(1)).map(a=>a.type==='enter'?{...a,requires:[...new Set([...(a.requires??[]),'equipment:lamp:on'])]}:a)]}}
  else w.interactions[id]??=structuredClone(b);
 }
 const room=w.interiors.entrada,lamp=room?.items.find(o=>o.id==='lampara-sofia');
 if(lamp){const prior=lamp.behavior;Object.assign(lamp,{label:pack.lampObject.label,asset:lamp.asset??pack.lampObject.asset,integrated:false,tooltip:pack.lampObject.tooltip});if(prior==='encender-lampara'||!prior){lamp.behavior='recoger-linterna';if(lamp.hotspot?.w===190)lamp.hotspot=structuredClone(pack.lampObject.hotspot)}else{const b=w.interactions[prior];if(b?.actions[0]?.type==='activate')b.actions[0]={...pack.interactions['recoger-linterna'].actions[0],reward:'reward' in b.actions[0]?b.actions[0].reward:undefined} as typeof b.actions[0]}}
 else if(room)room.items.push(structuredClone(pack.lampObject));
 const thought=w.dialogues['entrada-observacion'];if(thought){if(thought.reward?.flags)thought.reward.flags=thought.reward.flags.filter(f=>f!=='lampara_encendida');for(const n of Object.values(thought.nodes))if(n.text.startsWith('Aquí casi no se ve nada'))n.text='Aquí llega algo de luz de la entrada. Buscaré la linterna antes de seguir hacia esas voces.'}
 const host=w.surface.objects.find(o=>o.id==='philosopher');if(host?.angleDeg===0)host.angleDeg=170;
 const oldMission=w.missions.findIndex(m=>m.flag==='lampara_encendida');if(oldMission>=0)w.missions.splice(oldMission,1,...structuredClone(pack.missions));else w.missions.unshift(...structuredClone(pack.missions));
 w.storyFlags={...w.storyFlags,busqueda_linterna_iniciada:{label:'Buscar la linterna en el primer escenario',kind:'mission'},permiso_platon:{label:'Platón ha autorizado continuar al interior',kind:'door'},caverna_acceso_autorizado:{label:'Una luz en la oscuridad · completada',kind:'mission'}};
 return w;
}
