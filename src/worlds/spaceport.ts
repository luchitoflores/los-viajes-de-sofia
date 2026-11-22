import {object,angleDiff,radians,type PlanetObject} from '../planet-model.ts';
/** Embarque común para borradores anteriores sin nave. */
export function ensureShip(objects:PlanetObject[],spawn:number){
 // Sartre antiguo tenía kind=ship, interaction=none y behavior=ship.
 // Esa ya es la nave: habilitar embarque, sin añadir otro vehículo.
 const ships=objects.filter(o=>o.kind==='ship');
 const existing=ships.find(o=>!o.id.startsWith('sofia-spaceport'))??ships[0];
 if(existing){existing.interaction='ship';for(let i=objects.length-1;i>=0;i--)if(objects[i].kind==='ship'&&objects[i]!==existing)objects.splice(i,1);return existing}
 let angle=spawn-30;
 for(let offset=30;offset<360;offset+=18){const candidate=spawn-offset;if(objects.every(o=>Math.abs(angleDiff(radians(candidate),radians(o.angleDeg)))>.25)){angle=candidate;break}}
 let id='sofia-spaceport';while(objects.some(o=>o.id===id))id+='-ship';
 const ship=object('ship',angle,id);objects.push(ship);return ship;
}
