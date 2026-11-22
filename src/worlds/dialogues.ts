import {parseWorld,configurePrimaryBehavior,validId,type WorldDefinition,type Dialogue} from './schema.ts';

export interface DialogueBinding {scene:string;object:string;dialogue:string}
export interface DialoguePack {format:'sofia-dialogues';version:1;worldId:string;dialogues:Record<string,Dialogue>;bindings:DialogueBinding[]}
export function dialoguePack(w:WorldDefinition):DialoguePack {
 const bindings:DialogueBinding[]=[];
 for(const [scene,objects] of [['surface',w.surface.objects],...Object.entries(w.interiors).map(([id,i])=>[id,i.items])] as [string,{id:string;behavior?:string}[]][])
  for(const o of objects){const a=o.behavior?w.interactions[o.behavior]?.actions[0]:undefined;if(a?.type==='talk')bindings.push({scene,object:o.id,dialogue:a.target})}
 return{format:'sofia-dialogues',version:1,worldId:w.id,dialogues:structuredClone(w.dialogues),bindings};
}
/** Shared import/code boundary: validate the whole candidate before any persistence. */
export function mergeDialoguePack(world:WorldDefinition,raw:unknown):WorldDefinition {
 const pack=raw as DialoguePack;
 if(!pack||pack.format!=='sofia-dialogues'||pack.version!==1||pack.worldId!==world.id||!pack.dialogues||Array.isArray(pack.dialogues)||typeof pack.dialogues!=='object'||!Object.keys(pack.dialogues).every(validId)||!Array.isArray(pack.bindings)||pack.bindings.length>500)throw Error('Paquete de diálogos inválido o de otro mundo.');
 const w=structuredClone(world);Object.assign(w.dialogues,structuredClone(pack.dialogues));
 const bound=new Set<string>();
 for(const b of pack.bindings){
  if(!b||!validId(b.scene)||!validId(b.object)||!validId(b.dialogue)||!Object.hasOwn(w.dialogues,b.dialogue))throw Error('Vínculo de diálogo inválido.');
  const objects=b.scene==='surface'?w.surface.objects:Object.hasOwn(w.interiors,b.scene)?w.interiors[b.scene].items:[];
  const o=objects.find(o=>o.id===b.object),key=b.scene+':'+b.object;
  if(!o||bound.has(key))throw Error('El vínculo necesita un objeto existente y único en esa escena.');bound.add(key);
  const previous=o.behavior?w.interactions[o.behavior]:undefined;
  if(previous?.actions[0]?.type==='talk'&&previous.actions[0].target===b.dialogue)continue;
  // An instance gets its own behavior so assigning it cannot change another NPC.
  const instances=[...w.surface.objects,...Object.values(w.interiors).flatMap(i=>i.items)];
  let id=o.behavior&&instances.filter(other=>other.behavior===o.behavior).length===1?o.behavior:'';
  if(!id){let n=Object.keys(w.interactions).length;do{id='dialogue-binding-'+n++}while(Object.hasOwn(w.interactions,id))}
  w.interactions[id]=configurePrimaryBehavior(previous,{type:'talk',target:b.dialogue},previous?.requires??[]);o.behavior=id;
  if('interaction' in o)o.interaction='talk';
 }
 return parseWorld(w);
}
