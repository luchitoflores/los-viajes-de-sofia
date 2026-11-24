import {meets,type Conditions} from './conditions.ts';
export type LampCommand='equip'|'unequip'|'toggle'|'turnOn'|'turnOff';
export interface LampSettings extends Conditions {focused?:boolean;enabled:boolean;flag:string;radius:number;intensity:number;color:string;asset:string;handX:number;handY:number;size:number}
export interface MechanicsSettings {lamp:LampSettings;controls:{deadZone:number;contextual:'auto'|'lamp';secondary:'lamp'|'none'}}
export interface EquipmentState {lamp?:{equipped:boolean;on:boolean}}
export interface EquipmentProgress {flags:string[];equipment?:EquipmentState}
export const equipmentPreset:MechanicsSettings={lamp:{focused:true,enabled:true,flag:'lampara_encendida',radius:250,intensity:1,color:'#ffe2a1',asset:'assets/sofia-actions/flashlight.png',handX:30,handY:-68,size:34},controls:{deadZone:.15,contextual:'auto',secondary:'lamp'}};
/** Existing lampFlag is a narrative acquisition milestone, never erased by switching the light off. */
export function mechanicsFor(world:{mechanics?:MechanicsSettings;interiors:Record<string,{lighting?:{lampFlag?:string}}> }):MechanicsSettings{
 if(world.mechanics){const c=structuredClone(world.mechanics);if(c.lamp.asset==='assets/sofia-lamp-handheld.png')c.lamp.asset=equipmentPreset.lamp.asset;return c;}
 const flag=Object.values(world.interiors).find(i=>i.lighting?.lampFlag)?.lighting?.lampFlag;
 const value=structuredClone(equipmentPreset);value.lamp.enabled=!!flag;if(flag)value.lamp.flag=flag;return value;
}
export function lampState(p:EquipmentProgress,c:MechanicsSettings){const owned=c.lamp.enabled&&p.flags.includes(c.lamp.flag),saved=p.equipment?.lamp,available=owned&&meets(p.flags,c.lamp);return{owned,available,equipped:owned&&(saved?.equipped??true),on:available&&(saved?.equipped??true)&&(saved?.on??true)}}
export function commandLamp(p:EquipmentProgress,c:MechanicsSettings,command:LampCommand){
 const state=lampState(p,c);if(!state.available)return false;
 let {equipped,on}=state;
 if(command==='unequip'){equipped=false;on=false}else if(command==='equip'){equipped=true;on=false}else if(command==='turnOn'){equipped=true;on=true}else if(command==='turnOff'){on=false}else{equipped=true;on=!state.on}
 (p.equipment??={}).lamp={equipped,on};syncEquipmentFlags(p,c);return true;
}
export function syncEquipmentFlags(p:EquipmentProgress,c:MechanicsSettings){const s=lampState(p,c);p.flags=p.flags.filter(f=>!['equipment:lamp:owned','equipment:lamp:equipped','equipment:lamp:on','equipment:lamp:off'].includes(f));if(s.owned)p.flags.push('equipment:lamp:owned',s.equipped?'equipment:lamp:equipped':'equipment:lamp:off');if(s.equipped)p.flags.push(s.on?'equipment:lamp:on':'equipment:lamp:off')}
