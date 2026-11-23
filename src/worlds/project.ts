import {parseWorld,parseAsset,validId,type WorldDefinition,type Asset} from './schema.ts';
import {parseCatalog,type Catalog} from './catalog.ts';
import {parseCharacter,type CharacterRecord} from './characters.ts';
import {parseSettings,type EngineSettings} from '../engine/engine-settings.ts';
import {validateConnections} from './generator.ts';
export interface ProjectBundle {format:'sofia-project';version:1;catalog:Catalog;worlds:WorldDefinition[];resources:Record<string,Asset>;characters:CharacterRecord[];settings:EngineSettings}
export function parseProject(raw:unknown):ProjectBundle {
 const p=raw as ProjectBundle;if(!p||p.format!=='sofia-project'||p.version!==1||!Array.isArray(p.worlds)||!p.worlds.length||p.worlds.length>100||!p.resources||Array.isArray(p.resources)||typeof p.resources!=='object'||!Object.keys(p.resources).every(validId)||Object.keys(p.resources).length>5000||!Array.isArray(p.characters)||p.characters.length>1000)throw Error('Archivo de proyecto inválido.');
 const worlds=p.worlds.map(parseWorld),catalog=parseCatalog(p.catalog),characters=p.characters.map(parseCharacter),ids=new Set(worlds.map(w=>w.id));
 if(ids.size!==worlds.length||new Set(characters.map(c=>c.id)).size!==characters.length||catalog.planets.length!==worlds.length||new Set(catalog.planets.map(p=>p.source)).size!==catalog.planets.length||worlds.some(w=>!catalog.planets.some(e=>e.id===w.id&&e.philosopherId===w.philosopher.id&&(e.kind==='home')===(w.role==='home'))))throw Error('El catálogo y los mundos no coinciden.');
 validateConnections(worlds,catalog);
 return{format:'sofia-project',version:1,catalog,worlds,characters,resources:Object.fromEntries(Object.entries(p.resources).map(([id,a])=>[id,parseAsset(a)])),settings:parseSettings(p.settings)};
}
export function usages(w:WorldDefinition,kind:'dialogue'|'activity',id:string){
 const result:{scene:string;object:string;label:string}[]=[];
 for(const [scene,items] of [['surface',w.surface.objects],...Object.entries(w.interiors).map(([id,i])=>[id,i.items])] as [string,{id:string;label:string;behavior?:string}[]][])
  for(const o of items)if(o.behavior&&w.interactions[o.behavior]?.actions.some(a=>a.type===(kind==='dialogue'?'talk':'activity')&&'target' in a&&a.target===id))result.push({scene,object:o.id,label:o.label});
 if(kind==='dialogue'&&id===w.intro)result.push({scene:'surface',object:'',label:'Encuentro inicial del mundo'});
 const companion=w.journey?.companion;if(companion)for(const scene of companion.scenes)if(w.interactions[companion.encounters?.[scene]??companion.behavior]?.actions.some(a=>a.type===(kind==='dialogue'?'talk':'activity')&&'target' in a&&a.target===id))result.push({scene,object:'',label:'Compañero: '+w.characters?.[companion.characterId]?.name});
 for(const [scene,i] of Object.entries(w.interiors))for(const e of i.events??[])if(w.interactions[e.behavior]?.actions.some(a=>a.type===(kind==='dialogue'?'talk':'activity')&&'target' in a&&a.target===id))result.push({scene,object:'',label:'Evento: '+e.id});
 return result;
}
