import type {WorldDefinition} from './schema';
export {meets,type Conditions} from '../gameplay/conditions.ts';
import {meets,type Conditions} from '../gameplay/conditions.ts';
export interface SceneEvent extends Conditions {repeat?:'once'|'visit';id:string;from:number;to:number;behavior:string}
export type {RoomLighting} from '../gameplay/phaser/room-light';
export interface Journey {physicalDoors?:boolean;completionFlag:string;blockedText:string;legacyCompletionFlags?:string[];companion?:Conditions&{encounters?:Record<string,string>;characterId:string;behavior:string;scenes:string[]}}

export function visibleObject(w:WorldDefinition,flags:string[],id:string){const o=[...w.surface.objects,...Object.values(w.interiors).flatMap(i=>i.items)].find(o=>o.id===id);return !o||!('visibleWhen' in o)||meets(flags,o.visibleWhen)}
