import {jsonResource} from './json-resource.ts';
export interface DialogueAppearance {theme:'world'|'parchment'|'ink';placement:'speaker'|'top'|'bottom'|'left'|'right';width:number;fontSize:number;offsetX:number;offsetY:number;portraits:boolean}
export interface DesignDecision {id:string;time:string;scope:string;text:string}
export interface EngineSettings {version:1;dialogue:DialogueAppearance;decisions:DesignDecision[]}
export const SETTINGS_KEY='sofia-engine-settings-v1';
export const defaultSettings=():EngineSettings=>({version:1,dialogue:{theme:'world',placement:'speaker',width:470,fontSize:17,offsetX:0,offsetY:0,portraits:true},decisions:[]});
export function parseSettings(raw:unknown):EngineSettings {
 const s=raw as EngineSettings,d=s?.dialogue;
 if(!s||s.version!==1||!d||!['world','parchment','ink'].includes(d.theme)||!['speaker','top','bottom','left','right'].includes(d.placement)||typeof d.portraits!=='boolean'||![[d.width,240,800],[d.fontSize,12,28],[d.offsetX,-400,400],[d.offsetY,-300,300]].every(([v,min,max])=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max)||!Array.isArray(s.decisions)||s.decisions.length>2000||!s.decisions.every(n=>n&&typeof n.id==='string'&&n.id.length<=100&&typeof n.time==='string'&&Number.isFinite(Date.parse(n.time))&&typeof n.scope==='string'&&n.scope.length<=150&&typeof n.text==='string'&&n.text.length>0&&n.text.length<=2000))throw Error('Configuración del motor inválida.');
 return structuredClone(s);
}
let settings=defaultSettings(),preview:DialogueAppearance|null=null;
try{const raw=localStorage.getItem(SETTINGS_KEY);if(raw)settings=parseSettings(JSON.parse(raw))}catch{}
export const engineSettings=()=>structuredClone(settings);
export const dialogueAppearance=()=>preview??settings.dialogue;
export function previewAppearance(value:DialogueAppearance|null){preview=value?parseSettings({...settings,dialogue:value}).dialogue:null}
export function saveSettings(value:EngineSettings){const parsed=parseSettings(value);localStorage.setItem(SETTINGS_KEY,JSON.stringify(parsed));settings=parsed;window.dispatchEvent(new Event('sofia-settings-changed'))}
export function recordDecision(scope:string,text:string){const next=engineSettings(),last=next.decisions.at(-1),time=new Date().toISOString();if(last&&last.scope===scope&&last.text===text&&Date.now()-Date.parse(last.time)<60000)last.time=time;else{if(next.decisions.length>=2000)throw Error('El historial alcanzó 2000 entradas. Exporta el proyecto para conservarlo.');next.decisions.push({id:crypto.randomUUID(),time,scope,text})}saveSettings(next)}
export async function loadPublishedSettings(){if(localStorage.getItem(SETTINGS_KEY))return;const published=await jsonResource('engine-settings.json',true);if(published)settings=parseSettings(published)}
