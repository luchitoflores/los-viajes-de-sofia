import {angleDiff,jump,stepBody,type Body,type PlanetObject} from './planet-model.ts';
export interface Follower {x:number;y:number;lift:number;velocity:number;moving:boolean;facing:number}
export function followSide(f:Follower,heroX:number,direction:number,ground:(x:number)=>number,delta:number,heroJumping=false){
 const dt=Math.min(Math.max(delta,0),.05),target=heroX-direction*65,distance=target-f.x;
 const step=Math.sign(distance)*Math.min(Math.abs(distance),255*dt);
 f.x+=step;f.moving=Math.abs(step)>.15;if(f.moving)f.facing=Math.sign(step);
 if(heroJumping&&f.lift===0&&f.velocity===0)f.velocity=300;
 f.velocity-=950*dt;f.lift=Math.max(0,f.lift+f.velocity*dt);if(f.lift===0)f.velocity=0;
 f.y=ground(f.x)-f.lift;
}
export function followOrbit(f:Body,hero:Body,direction:number,dt:number,objects:PlanetObject[]){
 const target=hero.angle-direction*.15,diff=angleDiff(target,f.angle);
 if(hero.height>18&&f.grounded)jump(f);
 stepBody(f,Math.abs(diff)<.008?0:Math.max(-1,Math.min(1,diff*9)),dt,objects);
 return Math.abs(diff)>.015;
}
