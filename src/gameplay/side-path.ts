export interface PathRegion {type:string;x:number;w:number}
/** A frame may span >24 units vertically on an authored steep stair. That is not a ledge.
 * Reject real discontinuities at region boundaries, and never invent a staircase from pixels. */
export function canWalkPath(from:number,to:number,regions:PathRegion[],ground:(x:number)=>number){
 if(Math.abs(ground(to)-ground(from))<=24)return true;
 const lo=Math.min(from,to),hi=Math.max(from,to);
 if(!regions.some(r=>r.type==='stairs'&&r.x<=hi&&r.x+r.w>=lo))return false;
 for(let x=lo;x<hi;x+=1)if(Math.abs(ground(Math.min(hi,x+1))-ground(x))>24)return false;
 return true;
}
