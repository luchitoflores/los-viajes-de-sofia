/** Explicit walking connections; ordinary props and portals never auto-activate. */
export interface WalkPassage {id:string;type:string;x:number;passage?:'manual'|'left'|'right'}
export function crossingPassage<T extends WalkPassage>(items:T[],from:number,to:number,y:number,ground:(x:number)=>number):T|undefined{
 const direction=Math.sign(to-from);if(!direction)return;
 return items.find(o=>o.type==='door'&&o.passage===(direction<0?'left':'right')&&
  Math.abs(y-ground(o.x))<60&&(direction<0?to<=o.x+24:to>=o.x-24)&&Math.abs(from-o.x)<85);
}
