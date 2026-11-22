export type PlayMode='story'|'free';
const MODE_KEY='sofia-play-mode-v1';
export function readMode():PlayMode{try{return localStorage.getItem(MODE_KEY)==='story'?'story':'free'}catch{return'free'}}
export const PLAY_MODE=readMode();
export const profileKey=(key:string,mode:PlayMode=PLAY_MODE)=>mode==='story'?key+'-story':key;
export function selectMode(mode:PlayMode){localStorage.setItem(MODE_KEY,mode)}
export const modeName=(mode:PlayMode)=>mode==='story'?'Historia':'Libre';
export interface StoryRoute {format:'sofia-story';version:1;stages:{world:string;flags:string[];goal:string;legacy?:boolean}[]}
export function parseStory(raw:unknown,worlds:string[]):StoryRoute{
 const r=raw as StoryRoute,ids=new Set<string>();
 if(!r||r.format!=='sofia-story'||r.version!==1||!Array.isArray(r.stages)||!r.stages.length||r.stages.length>100)throw Error('Ruta de historia inválida.');
 for(const s of r.stages){if(!s||!worlds.includes(s.world)||ids.has(s.world)||typeof s.goal!=='string'||!s.goal.trim()||s.goal.length>500||!Array.isArray(s.flags)||!s.flags.length||!s.flags.every(f=>/^[a-z][a-z0-9._:-]{0,99}$/i.test(f))||(s.legacy!==undefined&&typeof s.legacy!=='boolean'))throw Error('Etapa de historia inválida.');ids.add(s.world)}
 return structuredClone(r);
}
export function storyAccess(route:StoryRoute|null,world:string,complete:(world:string,flags:string[],legacy:boolean)=>boolean){
 if(!route)return false;const index=route.stages.findIndex(s=>s.world===world);return index>=0&&route.stages.slice(0,index).every(s=>complete(s.world,s.flags,!!s.legacy));
}

// Evitar que pagehide/blur vuelvan a guardar la partida antigua durante un reinicio.
let progressWrites=true;
export const canWriteProgress=()=>progressWrites;
export const setProgressWrites=(enabled:boolean)=>{progressWrites=enabled};
