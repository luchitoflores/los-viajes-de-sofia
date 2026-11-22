import {parseSave,freshPlanet} from '../planet-model.ts';
import {validId} from '../worlds/schema.ts';
import {profileKey,type PlayMode} from './play-session.ts';
export interface SaveStorage {getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void;removeItem:(key:string)=>void}
const record=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const polisPlaces=new Set(['polis','library','entrance','shadows','ascent','exterior']);
function json(storage:SaveStorage,key:string){const raw=storage.getItem(key);if(raw===null)return{};const value=JSON.parse(raw);if(!record(value))throw Error('La partida guardada no es válida.');return value}
export function restartChanges(storage:SaveStorage,mode:PlayMode,world:string|null):Record<string,string>{
 if(world!==null&&!validId(world))throw Error('Mundo inválido.');
 const key=profileKey('sofia-universe-progress-v1',mode),old=json(storage,key),next=structuredClone(old);
 if(world===null){Object.assign(next,{version:1,last:null,worlds:{},journeys:[],characterMemory:{}})}
 else{
  next.version=1;next.last=world;next.worlds=record(next.worlds)?next.worlds:{};
  const worldIds=[...Object.keys(next.worlds),world].sort((a,b)=>b.length-a.length),forgotten=new Set<string>();
  const belongs=(v:unknown)=>typeof v==='string'&&worldIds.find(id=>v.startsWith(id+':'))===world;
  delete next.worlds[world];next.journeys=[];next.characterMemory=record(next.characterMemory)?next.characterMemory:{};
  for(const [id,values] of Object.entries(next.characterMemory)){if(!Array.isArray(values)||!values.some(belongs))continue;const kept=values.filter(v=>!belongs(v));if(kept.length)next.characterMemory[id]=kept;else{delete next.characterMemory[id];forgotten.add(id)}}
  for(const progress of Object.values(next.worlds))if(record(progress)&&Array.isArray(progress.flags))progress.flags=progress.flags.filter((f:unknown)=>typeof f!=='string'||!f.startsWith('met:')||!forgotten.has(f.slice(4)));
 }
 const changes:Record<string,string>={[key]:JSON.stringify(next)};
 if(world===null||world==='plato'){
  const legacyKey=profileKey('sofia_phaser_real_v02',mode),legacy=json(storage,legacyKey);
  const keep=(value:unknown,remove:Set<string>)=>Array.isArray(value)?value.filter(v=>typeof v==='string'&&!remove.has(v)):[];
  const positions=world===null?{}:Object.fromEntries(Object.entries(record(legacy.positions)?legacy.positions:{}).filter(([place])=>!polisPlaces.has(place)));
  changes[legacyKey]=JSON.stringify({...legacy,level:'polis',flags:{},positions,learned:world===null?[]:keep(legacy.learned,new Set(['appearance','allegory','opinion'])),met:world===null?[]:keep(legacy.met,new Set(['plat','socr'])),memories:world===null?[]:keep(legacy.memories,new Set(['light'])),seen:world===null?['polis']:['polis',...keep(legacy.seen,polisPlaces)],userScenes:record(legacy.userScenes)?legacy.userScenes:{}});
  const planetKey=profileKey('sofia-polis-radial-v1',mode),planet=parseSave(storage.getItem(planetKey));
  changes[planetKey]=JSON.stringify({...planet,angle:freshPlanet().angle,collected:[],discovered:[],returnAnchor:null});
 }
 return changes;
}
/** Solo las claves del perfil elegido; si falla una escritura, restaurar las anteriores. */
export function applyRestart(storage:SaveStorage,changes:Record<string,string>){
 const before=Object.fromEntries(Object.keys(changes).map(key=>[key,storage.getItem(key)]));
 try{for(const [key,value] of Object.entries(changes))storage.setItem(key,value)}
 catch(error){for(const [key,value] of Object.entries(before)){try{value===null?storage.removeItem(key):storage.setItem(key,value)}catch{/* La UI informa del fallo de almacenamiento. */}}throw error}
}
