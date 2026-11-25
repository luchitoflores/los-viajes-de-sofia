import {groundAt} from './templates.ts';
import type {WorldDefinition} from './schema';
/** Move only the principal support; keep explicitly authored upper platforms intact. */
export function setRoomFloor(world:WorldDefinition,scene:string,y:number){
 const w=structuredClone(world),r=w.interiors[scene];if(!r)throw Error('Habitación inexistente.');
 const height=r.viewport?.height??w.viewport?.height??540;if(!Number.isFinite(y)||y<1||y>height-12)throw Error('El suelo debe quedar dentro del escenario, dejando 12 unidades debajo.');
 const before=r.floor,shift=y-before;r.floor=y;
 for(const z of r.regions){if(z.type==='floor'&&Math.abs(z.y-before)<1){z.y=y;z.h=Math.max(1,Math.min(z.h,height-y))}if(z.type==='stairs'&&(z.bottom===undefined||Math.abs(z.bottom-before)<1)){z.bottom=y;z.h=Math.max(1,y-z.y)}}
 for(const o of r.items)if(Math.abs(o.y-before)<1){o.y=y;if(o.hotspot)o.hotspot.y+=shift}
 r.spawn.y=groundAt(r,r.spawn.x);for(const p of Object.values(w.spawns??{}))if(p.scene===scene)p.y=groundAt(r,p.x??r.spawn.x);return w;
}
