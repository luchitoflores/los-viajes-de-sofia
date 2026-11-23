import type {WorldDefinition} from './schema';
export interface Conditions {requires?:string[];excludes?:string[]}
export interface SceneEvent extends Conditions {repeat?:'once'|'visit';id:string;from:number;to:number;behavior:string}
export interface RoomLighting {darkness:number;lampFlag?:string;fadeTo?:{x:number;darkness:number};lights?:{x:number;y:number;radius:number;flag?:string}[]}
export interface Journey {physicalDoors?:boolean;completionFlag:string;blockedText:string;legacyCompletionFlags?:string[];companion?:Conditions&{encounters?:Record<string,string>;characterId:string;behavior:string;scenes:string[]}}
export function meets(flags:string[],when:Conditions|undefined){return !when||((when.requires??[]).every(f=>flags.includes(f))&&!(when.excludes??[]).some(f=>flags.includes(f)))}
export function visibleObject(w:WorldDefinition,flags:string[],id:string){const o=[...w.surface.objects,...Object.values(w.interiors).flatMap(i=>i.items)].find(o=>o.id===id);return !o||!('visibleWhen' in o)||meets(flags,o.visibleWhen)}
