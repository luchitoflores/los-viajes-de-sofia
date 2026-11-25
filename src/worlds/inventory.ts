import type {WorldDefinition} from './schema';
export interface InventoryItem {id:string;name:string;description:string;scene:string;image?:string}
/** Existing collected IDs remain the source of truth, including old saved games. */
export function collectedItems(w:WorldDefinition,collected:string[]):InventoryItem[]{
 const objects=[...w.surface.objects.map(object=>({object,scene:'Superficie'})),...Object.values(w.interiors).flatMap(r=>r.items.map(object=>({object,scene:r.name})))];
 return [...new Set(collected)].map(id=>{
  const found=objects.find(v=>v.object.id===id);if(!found)return{id,name:id,description:'Objeto recogido en una versión anterior del escenario. Su descripción ya no está disponible.',scene:'Escenario anterior'};
  const {object:o,scene}=found,behavior=o.behavior?w.interactions[o.behavior]:undefined;
  const text=behavior?.actions.filter(a=>a.type==='collect').map(a=>'text' in a?a.text:'').join('\n');
  const asset=o.asset?w.assets[o.asset]:undefined;
  return{id,name:o.label,description:[o.tooltip,text].filter((v,i,a)=>v&&a.indexOf(v)===i).join('\n\n')||'Has recogido este objeto. Puedes ampliar su descripción desde el editor de la escena.',scene,...(asset&&!asset.animation&&!o.integrated?{image:asset.src}:{})};
 });
}
