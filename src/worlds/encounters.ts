import {parseWorld,type WorldDefinition} from './schema.ts';
import {dialoguePlaces} from './scene-dialogues.ts';
import {storyKey} from './story-events.ts';
export interface EncounterRule {requires:string[];excludes:string[];repeat:'once'|'always'|'visit'}
export function configureEncounter(world:WorldDefinition,scene:string,source:string,dialogue:string,rule:EncounterRule){
 const w=structuredClone(world),place=dialoguePlaces(w).find(p=>p.scene===scene&&p.source===source&&p.dialogue===dialogue);if(!place?.behavior)throw Error('Este encuentro utiliza la presentación del mundo. Edita su conversación inicial.');
 if(rule.requires.some(f=>rule.excludes.includes(f)))throw Error('Una condición no puede ser obligatoria y estar prohibida.');
 const id='encounter-'+storyKey(scene+'/'+source+'/'+dialogue),behavior=structuredClone(w.interactions[place.behavior]),done='encounter-done-'+storyKey(scene+'/'+source+'/'+dialogue);
 behavior.actions=behavior.actions.filter(a=>!(a.type==='record'&&a.reward.flags?.includes(done)));
 if(place.trigger==='event'){
  const event=w.interiors[scene].events!.find(e=>e.id===source)!;event.requires=rule.requires;event.excludes=rule.excludes;event.repeat=rule.repeat==='visit'?'visit':'once';event.behavior=id;behavior.requires=[];behavior.excludes=[];
 }else{
  behavior.requires=rule.requires;behavior.excludes=[...new Set([...rule.excludes,...(rule.repeat==='once'?[done]:[])])];
  if(rule.repeat==='once'){(w.storyFlags??={})[done]={label:('Conversación completada: '+(w.dialogues[dialogue].title??dialogue)+' · '+(scene==='surface'?'Superficie':w.interiors[scene].name)).slice(0,160),kind:'event'};const index=behavior.actions.findIndex(a=>a.type==='talk'&&a.target===dialogue);behavior.actions.splice(index+1,0,{type:'record',reward:{flags:[done]}})}
  if(place.trigger==='companion'){(w.journey!.companion!.encounters??={})[scene]=id}
  else{const objects=scene==='surface'?w.surface.objects:w.interiors[scene].items;objects.find(o=>o.id===source)!.behavior=id}
 }
 w.interactions[id]=behavior;return parseWorld(w);
}
