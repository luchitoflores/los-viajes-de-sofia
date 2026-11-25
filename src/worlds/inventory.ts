import {objectItem,type ItemState} from './inventory-operations.ts';
import type {WorldDefinition} from './schema';
export interface InventoryItem {id:string;name:string;description:string;scene:string;image?:string;itemId?:string;category?:string;functionality?:string;state?:ItemState}
/** Existing collected IDs remain the source of truth, including old saved games. */
export function collectedItems(w:WorldDefinition,collected:string[],states:Record<string,ItemState>={}):InventoryItem[]{
 const objects=[...w.surface.objects.map(object=>({object,scene:'Superficie'})),...Object.values(w.interiors).flatMap(r=>r.items.map(object=>({object,scene:r.name})))];
 return [...new Set(collected)].map(id=>{
  const historical=Object.entries(states).find(([,state])=>state.sourceObject===id),archived=historical?w.inventoryItems?.[historical[0]]:undefined;
  const found=objects.find(v=>v.object.id===id);if(!found&&historical&&archived){const [itemId,state]=historical;return{id,itemId,name:archived.name,description:archived.description,category:archived.category,functionality:archived.functionality,state,image:w.assets[archived.asset]?.src,scene:state.sourceScene==='surface'?'Superficie':w.interiors[state.sourceScene??'']?.name??'Escenario anterior'}};if(!found)return{id,name:id,description:'Objeto recogido en una versión anterior del escenario. Su descripción ya no está disponible.',scene:'Escenario anterior'};
  const {object:o,scene}=found,behavior=o.behavior?w.interactions[o.behavior]:undefined;
  const text=behavior?.actions.filter(a=>a.type==='collect').map(a=>'text' in a?a.text:'').join('\n');
  const itemId=historical?.[0]??objectItem(w,id),definition=itemId?w.inventoryItems?.[itemId]:undefined;
  if(definition&&itemId)return{id,itemId,name:definition.name,description:definition.description,category:definition.category,functionality:definition.functionality,state:states[itemId],scene,image:w.assets[definition.asset]?.src};
  const asset=o.asset?w.assets[o.asset]:undefined;
  return{id,name:o.label,description:[o.tooltip,text].filter((v,i,a)=>v&&a.indexOf(v)===i).join('\n\n')||'Has recogido este objeto. Puedes ampliar su descripción desde el editor de la escena.',scene,...(asset&&!asset.animation&&!o.integrated?{image:asset.src}:{})};
 });
}
