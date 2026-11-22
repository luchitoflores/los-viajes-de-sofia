import {object} from '../planet-model.ts';
import {parseWorld,validId,type WorldDefinition,type Asset,type Character,type Dialogue} from './schema.ts';
import {parseCatalog,registerWorld,type Catalog} from './catalog.ts';
import {VIEWPORT,TEMPLATE_BACKGROUNDS,sceneTemplate,connectInterior,portalObject,groundAt,type TemplateId} from './templates.ts';
export interface Blueprint {format:'sofia-blueprints';version:1;assets:Record<string,Asset>;characters:Record<string,Character>;worlds:{id:string;title:string;author:string;galaxy:string;systems:string[];intro:string;dialogues:Record<string,Dialogue>;scenes:{id:string;name:string;template:TemplateId;from:string|null;npcs:{id:string;character:string;dialogue:string;x:number}[];objects?:{id:string;asset:string;label:string;text:string;x:number}[]}[];portals?:{id:string;target:string;angle:number;spawn?:string}[]}[]}
export function compileBatch(raw:unknown,base:Catalog,existing:WorldDefinition[]=[]){
 const b=raw as Blueprint;if(!b||b.format!=='sofia-blueprints'||b.version!==1||!Array.isArray(b.worlds)||b.worlds.length<1||b.worlds.length>30||!b.assets||!b.characters)throw Error('Lote de mundos inválido.');
 let catalog=parseCatalog(base);const worlds:WorldDefinition[]=[],ids=new Set<string>();
 for(const spec of b.worlds){
  if(!validId(spec.id)||ids.has(spec.id)||!Array.isArray(spec.scenes))throw Error('ID de mundo duplicado o escenas inválidas.');ids.add(spec.id);const author=b.characters[spec.author];if(!author)throw Error('Falta la identidad del filósofo.');
  const w:WorldDefinition={format:'sofia-world',version:1,id:spec.id,title:spec.title,summary:'Prueba jugable generada con plantillas y recursos reutilizados. No representa el arte definitivo.',artStatus:'provisional',viewport:VIEWPORT,philosopher:{id:spec.author,name:author.name,portrait:b.assets[author.portraitId??author.spriteId]?.src},galaxy:spec.galaxy,systems:spec.systems,themes:[],assets:structuredClone(b.assets),characters:structuredClone(b.characters),terrain:'terrain',intro:spec.intro,surface:{spawnAngle:-8,objects:[]},interiors:{},interactions:{},dialogues:structuredClone(spec.dialogues),activities:{},concepts:{},memories:{},missions:[],spawns:{surface:{scene:'surface',angle:-8}}};
  const mentor={...object('philosopher',0,'host'),label:author.name.slice(0,140),asset:author.spriteId,characterId:spec.author,instanceId:'host',behavior:'host-talk'};w.surface.objects.push(mentor);w.interactions['host-talk']={actions:[{type:'talk',target:spec.intro}]};
  for(const scene of spec.scenes){if(!validId(scene.id)||w.interiors[scene.id])throw Error('Escena duplicada o ID inválido.');const bg='background-'+scene.template;w.assets[bg]={src:'assets/'+TEMPLATE_BACKGROUNDS[scene.template],width:1280,height:720,kind:'rock',label:'Fondo genérico: '+scene.template};w.interiors[scene.id]=sceneTemplate(scene.template,scene.name,bg);w.spawns![scene.id]={scene:scene.id,x:160,y:560};}
  for(const [index,scene] of spec.scenes.entries()){
   const interior=w.interiors[scene.id];connectInterior(w,scene.from,scene.id,'door-'+scene.id,1180,40+index*35);
   for(const npc of scene.npcs){const c=b.characters[npc.character];if(!c)throw Error('NPC sin identidad: '+npc.character);const id=scene.id+'-'+npc.id;interior.items.push({id,instanceId:id,characterId:npc.character,type:'philosopher',x:npc.x,y:groundAt(interior,npc.x),asset:c.spriteId,label:c.name.slice(0,140),behavior:id});w.interactions[id]={actions:[{type:'talk',target:npc.dialogue}]}}
   for(const o of scene.objects??[]){const id=scene.id+'-'+o.id;interior.items.push({id,type:'scroll',x:o.x,y:groundAt(interior,o.x),asset:o.asset,label:o.label,behavior:id});w.interactions[id]={actions:[{type:'examine',text:o.text}]}}
   if(scene.template==='elevator'){const id=scene.id+'-lift';interior.items.push({id,type:'door',x:965,y:560,label:'Subir o bajar en el ascensor',asset:'platform',behavior:id});w.interactions[id]={actions:[{type:'lift',target:'lift'}]}}
  }
  for(const portal of spec.portals??[]){w.surface.objects.push(portalObject(portal.id,portal.target,portal.angle));w.interactions[portal.id]={actions:[{type:'portal',target:portal.target,...(portal.spawn?{spawn:portal.spawn}:{})}]}}
  worlds.push(parseWorld(w));catalog=registerWorld(catalog,w,'worlds/'+w.id+'.json');
 }
 validateConnections([...existing.filter(w=>!ids.has(w.id)),...worlds],catalog);return{worlds,catalog};
}
export function resolveSpawn(w:WorldDefinition,id='surface'){
 const p=w.spawns?.[id];if(p)return p;if(id==='surface')return{scene:'surface',angle:w.surface.spawnAngle};const i=w.interiors[id];if(i)return{scene:id,...i.spawn};throw Error('Punto de aparición inexistente: '+id);
}
export function validateConnections(worlds:WorldDefinition[],catalog:Catalog){const byId=new Map(worlds.map(w=>[w.id,w]));for(const w of worlds)for(const b of Object.values(w.interactions))for(const a of b.actions)if(a.type==='portal'){if(!catalog.planets.some(p=>p.id===a.target))throw Error('Portal hacia un planeta inexistente: '+a.target);const target=byId.get(a.target);if(!target)throw Error('Falta la definición del destino: '+a.target);resolveSpawn(target,a.spawn)}}
export function connectInstruction(text:string,worlds:WorldDefinition[],catalog:Catalog){
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[«».,]/g,'').trim();
 const match=normalize(text).match(/^(?:crea (?:un )?portal|conecta)(?: desde| de)? (.+?) (?:con|hacia|a|→) (.+)$/);if(!match)throw Error('Usa «Conecta Camus con Sartre» o «Conecta montaña de Camus con estudio de Kant».');
 const locate=(name:string)=>{name=name.replace(/^(?:el |la |los |las |planeta de |mundo de )+/g,'');const options=worlds.flatMap(w=>{const surname=normalize(w.philosopher.name).split(' ').at(-1)!;return[{world:w,scene:null as string|null,aliases:[w.id,normalize(w.philosopher.name),surname]},...Object.entries(w.interiors).map(([id,i])=>({world:w,scene:id,aliases:[normalize(i.name)+' de '+surname,id+' de '+w.id]}))]});const found=options.filter(o=>o.aliases.includes(name));if(found.length!==1)throw Error('Destino ambiguo o desconocido: '+name);return found[0]};
 const from=locate(match[1]),to=locate(match[2]),result=worlds.map(w=>structuredClone(w)),w=result.find(w=>w.id===from.world.id)!;const id='connection-'+from.world.id+'-'+(from.scene??'surface')+'-'+to.world.id+'-'+(to.scene??'surface');if(!validId(id))throw Error('Identificador de conexión demasiado largo.');
 if(w.interactions[id]){validateConnections(result,catalog);return result}
 if(from.world.id===to.world.id){if(!to.scene)throw Error('Para regresar al planeta usa la acción de retorno.');connectInterior(w,from.scene,to.scene,id,1180)}else{w.interactions[id]={actions:[{type:'portal',target:to.world.id,spawn:to.scene??'surface'}]};if(from.scene)w.interiors[from.scene].items.push({id,type:'door',x:1180,y:groundAt(w.interiors[from.scene],1180),label:'Portal a '+to.world.philosopher.name,asset:'door',behavior:id});else w.surface.objects.push(portalObject(id,to.world.id,150))}
 const parsed=result.map(parseWorld);validateConnections(parsed,catalog);return parsed;
}
