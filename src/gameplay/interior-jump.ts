import {explorationProfile} from './locomotion.ts';
export interface InteriorJump {airborne:boolean;y:number;velocity:number;held:boolean}
export const createInteriorJump=():InteriorJump=>({airborne:false,y:0,velocity:0,held:false});
/** Optional vertical motion over the existing authored walking/stair geometry. */
export function stepInteriorJump(s:InteriorJump,pressed:boolean,ground:number,delta:number,ceiling=0){
 const dt=Math.max(0,Math.min(.05,delta));
 if(!s.airborne){s.y=ground;if(pressed&&!s.held){s.airborne=true;s.velocity=-explorationProfile.jumpSpeed}}
 s.held=pressed;
 if(s.airborne){const before=s.y;s.y+=s.velocity*dt;s.velocity+=explorationProfile.gravity*dt;
  if(s.y<ceiling){s.y=ceiling;s.velocity=Math.max(0,s.velocity)}
  if(s.velocity>=0&&before<=ground+1&&s.y>=ground){s.y=ground;s.velocity=0;s.airborne=false}
  // A rising slope must never leave the actor permanently below the authored floor.
  if(before>ground+1&&s.y>=ground){s.y=ground;s.velocity=0;s.airborne=false}
 }
 return s;
}
