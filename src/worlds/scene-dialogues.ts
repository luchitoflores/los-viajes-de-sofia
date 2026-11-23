import type {WorldDefinition,Dialogue} from './schema.ts';
export const readable=(id:string)=>{const text=id.replace(/[_:-]+/g,' ');return text.charAt(0).toUpperCase()+text.slice(1)};
export const dialogueTitle=(id:string,d:Dialogue)=>d.title??readable(id);
export const conversationScenes=(w:WorldDefinition)=>[{id:'surface',name:'Superficie del planeta',number:0},...Object.entries(w.interiors).map(([id,s],i)=>({id,name:s.name,number:i+1}))];
export interface DialoguePlace {scene:string;dialogue:string;source:string;label:string;trigger:'object'|'event'|'companion'|'intro';requires:string[];excludes:string[];behavior?:string}
export function dialoguePlaces(w:WorldDefinition):DialoguePlace[]{
 const places:DialoguePlace[]=[];
 const add=(scene:string,source:string,label:string,trigger:DialoguePlace['trigger'],behavior:string|undefined,requires:string[]=[],excludes:string[]=[])=>{
  const b=behavior?w.interactions[behavior]:undefined;
  for(const action of b?.actions??[])if(action.type==='talk')places.push({scene,source,label,trigger,behavior,dialogue:action.target,requires:[...new Set([...requires,...b?.requires??[],...action.requires??[]])],excludes:[...new Set([...excludes,...b?.excludes??[],...action.excludes??[]])]});
 };
 for(const s of conversationScenes(w)){
  const items=s.id==='surface'?w.surface.objects:w.interiors[s.id].items;
  for(const o of items){const c='visibleWhen' in o?o.visibleWhen:undefined;add(s.id,o.id,'Al tocar: '+o.label,'object',o.behavior,c?.requires,c?.excludes)}
  if(s.id!=='surface')for(const e of w.interiors[s.id].events??[])add(s.id,e.id,'Al recorrer esta escena · una vez por partida','event',e.behavior,e.requires,e.excludes);
 }
 if(w.dialogues[w.intro])places.push({scene:'surface',source:'intro',label:'Al conocer al anfitrión','trigger':'intro',dialogue:w.intro,requires:[],excludes:[]});
 const c=w.journey?.companion;if(c)for(const scene of c.scenes)add(scene,'companion','Al hablar con '+(w.characters?.[c.characterId]?.name??'el compañero'),'companion',c.encounters?.[scene]??c.behavior,c.requires,c.excludes);
 return places;
}
export function sceneDialogueGroups(w:WorldDefinition,scene:string){
 const places=dialoguePlaces(w),used=new Set(places.map(p=>p.dialogue));
 const scopes=scene==='all'?conversationScenes(w):conversationScenes(w).filter(s=>s.id===scene);
 const groups=scopes.map(s=>({...s,dialogues:[...new Set(places.filter(p=>p.scene===s.id).map(p=>p.dialogue))].map((id,i)=>({id,number:s.number+'.'+(i+1),title:dialogueTitle(id,w.dialogues[id]),places:places.filter(p=>p.scene===s.id&&p.dialogue===id)}))}));
 if(scene==='unassigned'||scene==='all')groups.push({id:'unassigned',name:'Borradores sin asignar a una escena',number:-1,dialogues:Object.keys(w.dialogues).filter(id=>!used.has(id)).map((id,i)=>({id,number:'B'+(i+1),title:dialogueTitle(id,w.dialogues[id]),places:[]}))});
 return groups;
}
export function conditionLabel(w:WorldDefinition,flag:string){return w.storyFlags?.[flag]?.label??w.missions.find(m=>m.flag===flag)?.title??readable(flag)}
export function conditionOrigin(w:WorldDefinition,flag:string){
 const id=Object.keys(w.dialogues).find(id=>w.dialogues[id].reward?.flags?.includes(flag)||Object.values(w.dialogues[id].nodes).some(n=>n.choices.some(c=>c.reward?.flags?.includes(flag))));
 if(!id)return '';
 const scenes=[...new Set(dialoguePlaces(w).filter(p=>p.dialogue===id).map(p=>conversationScenes(w).find(s=>s.id===p.scene)?.name).filter(Boolean))];
 return scenes.length?'Se obtiene en: '+scenes.join(' / '):'';
}
export function removeUnusedDialogue(w:WorldDefinition,id:string){
 if(id===w.intro||dialoguePlaces(w).some(p=>p.dialogue===id)||Object.values(w.interactions).some(b=>b.actions.some(a=>a.type==='talk'&&a.target===id)))throw Error('Esta conversación está vinculada. Conserva sus conexiones; puedes editar sus textos sin eliminarla.');
 const next=structuredClone(w);delete next.dialogues[id];return next;
}
