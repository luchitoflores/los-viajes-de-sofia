import type {WorldDefinition,InventoryCommand,Action} from './schema';
import {meets} from '../gameplay/conditions.ts';
import {mechanicsFor} from '../gameplay/equipment.ts';
export interface ItemState {discovered?:boolean;sourceObject?:string;sourceScene?:string;equipped?:boolean;used?:boolean;given?:boolean;consumed?:boolean}
export interface InventoryProgress {flags:string[];planet:{collected:string[]};inventoryState?:Record<string,ItemState>}
export function objectItem(w:WorldDefinition,objectId:string){const o=[...w.surface.objects,...Object.values(w.interiors).flatMap(r=>r.items)].find(o=>o.id===objectId);const a=o?.behavior?w.interactions[o.behavior]?.actions.find(a=>a.type==='collect'&&a.item):undefined;return a?.type==='collect'?a.item:undefined}
export function ownsItem(w:WorldDefinition,p:InventoryProgress,item:string,carried:string[]=[]){const state=p.inventoryState?.[item];return !state?.given&&!state?.consumed&&(state?.discovered||carried.includes(item)||p.planet.collected.some(id=>objectItem(w,id)===item))}
export function syncInventoryFlags(w:WorldDefinition,p:InventoryProgress,carried:string[]=[]){
 for(const [id,item] of Object.entries(w.inventoryItems??{})){
  const source=p.planet.collected.find(object=>objectItem(w,object)===id);if(source){const state=(p.inventoryState??={})[id]??={};state.discovered=true;state.sourceObject??=source;state.sourceScene??=w.surface.objects.some(o=>o.id===source)?'surface':Object.entries(w.interiors).find(([,r])=>r.items.some(o=>o.id===source))?.[0]}
  const prefix='inventory:'+id+':',state=p.inventoryState?.[id]??{},owned=ownsItem(w,p,id,carried);
  p.flags=p.flags.filter(f=>!f.startsWith(prefix));for(const [key,yes] of Object.entries({discovered:state.discovered,owned,equipped:owned&&state.equipped,used:state.used,given:state.given,consumed:state.consumed}))if(yes)p.flags.push(prefix+key);
  if(item.equipment==='lamp'&&owned){const c=mechanicsFor(w);if(!p.flags.includes(c.lamp.flag))p.flags.push(c.lamp.flag)}
 }
}
export function itemCommandStatus(w:WorldDefinition,p:InventoryProgress,itemId:string,command:InventoryCommand,scene:string,carried:string[]=[],nearby:string[]=[]){
 const item=w.inventoryItems?.[itemId],op=item?.commands?.[command];
 if(!item||!op)return{allowed:false,reason:'Este objeto no tiene esa acción configurada en este mundo.'};
 if(!ownsItem(w,p,itemId,carried))return{allowed:false,reason:'Primero necesitas encontrar este objeto; no debe estar entregado ni consumido.'};
 if(op.recipient&&!nearby.includes(op.recipient))return{allowed:false,reason:'Acércate a '+(w.characters?.[op.recipient]?.name??op.recipient)+' para entregar o utilizar este objeto.'};
 if(item.equipment==='lamp'){const lamp=mechanicsFor(w).lamp;if(!lamp.enabled||!meets(p.flags,lamp)||lamp.scenes&&!lamp.scenes.includes(scene))return{allowed:false,reason:op.blockedText??'La linterna no se utiliza en esta escena.'}}
 if(!meets(p.flags,op)||op.scenes&&!op.scenes.includes(scene))return{allowed:false,reason:op.blockedText??'Este objeto no se puede utilizar aquí o todavía falta un requisito.'};
 return{allowed:true,reason:''};
}
/** Uses the same action interpreter as objects, doors, dialogue and activities. */
export function executeItemCommand(w:WorldDefinition,p:InventoryProgress,itemId:string,command:InventoryCommand,scene:string,carried:string[]=[],nearby:string[]=[]):Action[]{
 const check=itemCommandStatus(w,p,itemId,command,scene,carried,nearby);if(!check.allowed)throw Error(check.reason);
 const op=w.inventoryItems![itemId].commands![command]!,state=(p.inventoryState??={})[itemId]??={};
 if(command==='equip')state.equipped=true;if(command==='unequip')state.equipped=false;if(command==='use')state.used=true;if(command==='give'){state.given=true;state.equipped=false}if(op.consume){state.consumed=true;state.equipped=false}
 syncInventoryFlags(w,p,carried);return structuredClone(op.actions);
}
