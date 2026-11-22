import {profileKey,type PlayMode} from './play-session.ts';
import {applyRestart,restartChanges,type SaveStorage} from './restart.ts';
import {parseSave} from '../planet-model.ts';

export const LIBRARY_KEY='sofia-save-library-v1';
const keys=['sofia-universe-progress-v1','sofia_phaser_real_v02','sofia-polis-radial-v1'] as const;
type Profile=Record<string,string|null>;
export interface SavedGame {id:string;campaign:string;mode:PlayMode;kind:'auto'|'manual';name:string;created:string;updated:string;location:string;progress:string;data:Profile}
interface Library {version:1;active:Partial<Record<PlayMode,string>>;entries:SavedGame[]}
export function readLibrary(storage:SaveStorage):Library{
 const raw=storage.getItem(LIBRARY_KEY);if(!raw)return{version:1,active:{},entries:[]};
 const value=JSON.parse(raw) as Library;
 if(value?.version!==1||!value.active||!Array.isArray(value.entries))throw Error('No se pudo leer la biblioteca de partidas. Sus datos se conservan.');
 const ids=new Set<string>();
 for(const s of value.entries){if(!s||typeof s.id!=='string'||ids.has(s.id)||typeof s.campaign!=='string'||!['story','free'].includes(s.mode)||!['auto','manual'].includes(s.kind)||typeof s.name!=='string'||!s.name.trim()||s.name.length>80||!Number.isFinite(Date.parse(s.created))||!Number.isFinite(Date.parse(s.updated))||typeof s.location!=='string'||typeof s.progress!=='string'||!s.data||keys.some(k=>s.data[k]!==null&&typeof s.data[k]!=='string'))throw Error('Una partida guardada no es válida. Sus datos se conservan.');ids.add(s.id)}
 for(const mode of ['story','free'] as const)if(value.active[mode]&&!value.entries.some(s=>s.id===value.active[mode]&&s.mode===mode&&s.kind==='auto'))throw Error('La partida activa no está disponible.');
 return value;
}
function capture(storage:SaveStorage,mode:PlayMode):Profile{
 return Object.fromEntries(keys.map(k=>{const raw=storage.getItem(profileKey(k,mode));if(raw===null)return[k,null];const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw Error('El guardado actual no es válido.');if(k===keys[1])delete data.userScenes;if(k===keys[2])delete data.objects;return[k,JSON.stringify(data)]}));
}
function name(value:string){const result=value.trim();if(!result||result.length>80)throw Error('Escribe un nombre de entre 1 y 80 caracteres.');return result}
function entry(mode:PlayMode,title:string,data:Profile):SavedGame{const id=crypto.randomUUID(),time=new Date().toISOString();return{id,campaign:id,mode,kind:'auto',name:name(title),created:time,updated:time,location:'',progress:'',data}}
function commit(storage:SaveStorage,library:Library,changes:Record<string,string>={}){applyRestart(storage,{...changes,[LIBRARY_KEY]:JSON.stringify(library)})}
export function initializeLibrary(storage:SaveStorage){
 const library=readLibrary(storage);let changed=false;
 for(const mode of ['free','story'] as const){const active=library.entries.find(s=>s.id===library.active[mode]);if(active&&!keys.some(k=>storage.getItem(profileKey(k,mode))!==null)){loadSavedGame(storage,mode,active.id);return initializeLibrary(storage)}if(active){active.data=capture(storage,mode);changed=true}else if(keys.some(k=>storage.getItem(profileKey(k,mode))!==null)){const s=entry(mode,'Partida anterior · '+(mode==='story'?'Historia':'Libre'),capture(storage,mode));library.entries.push(s);library.active[mode]=s.id;changed=true}}
 if(changed)commit(storage,library);return library;
}
export function autoSave(storage:SaveStorage,mode:PlayMode,location='',progress=''){
 const library=readLibrary(storage),active=library.entries.find(s=>s.id===library.active[mode]);if(!active)return;
 active.data=capture(storage,mode);active.updated=new Date().toISOString();active.location=location||active.location;active.progress=progress||active.progress;commit(storage,library);
}
export function saveCheckpoint(storage:SaveStorage,mode:PlayMode,title:string){
 const library=readLibrary(storage),active=library.entries.find(s=>s.id===library.active[mode]);if(!active)throw Error('Primero crea o continúa una partida.');
 const s={...structuredClone(active),id:crypto.randomUUID(),kind:'manual' as const,name:name(title),created:new Date().toISOString(),updated:new Date().toISOString(),data:capture(storage,mode)};library.entries.push(s);commit(storage,library);return s;
}
export function newCampaign(storage:SaveStorage,mode:PlayMode,title:string){
 const library=readLibrary(storage),changes=restartChanges(storage,mode,null),view:SaveStorage={getItem:k=>changes[k]??storage.getItem(k),setItem:()=>{},removeItem:()=>{}};
 const s=entry(mode,title,capture(view,mode));library.entries.push(s);library.active[mode]=s.id;commit(storage,library,changes);return s;
}
export function loadSavedGame(storage:SaveStorage,mode:PlayMode,id:string){
 const library=readLibrary(storage),s=library.entries.find(s=>s.id===id&&s.mode===mode);if(!s)throw Error('No se encontró esa partida en este modo.');
 const changes:Record<string,string>={};
 for(const k of keys){const raw=s.data[k];let data=raw?JSON.parse(raw):k===keys[2]?parseSave(null):{};if(!data||typeof data!=='object'||Array.isArray(data))throw Error('La partida no es válida.');
  if(k===keys[1]){const current=JSON.parse(storage.getItem(profileKey(k,mode))||'{}');data.userScenes=current.userScenes??{}}
  if(k===keys[2])data.objects=parseSave(storage.getItem(profileKey(k,mode))).objects;
  changes[profileKey(k,mode)]=JSON.stringify(data);
 }
 const active=library.entries.find(a=>a.id===s.campaign&&a.kind==='auto'&&a.mode===mode);if(!active)throw Error('Falta la partida a la que pertenece este guardado.');
 active.data=structuredClone(s.data);active.location=s.location;active.progress=s.progress;active.updated=new Date().toISOString();library.active[mode]=active.id;commit(storage,library,changes);
}
