/** Kinematics/cadence only. The host owns visuals, targets, pedagogical evaluation and rewards. */
export function shotReady(now:number,last:number,interval:number){return Number.isFinite(interval)&&interval>=0&&now-last>=interval}
export function advanceProjectile(point:{x:number;y:number},velocity:{x:number;y:number},delta:number){const dt=Math.max(0,Math.min(.04,delta));point.x+=velocity.x*dt;point.y+=velocity.y*dt;return point}
export function insideTarget(point:{x:number;y:number},target:{x:number;y:number;rx:number;ry:number}){return Math.abs(point.x-target.x)<target.rx&&Math.abs(point.y-target.y)<target.ry}
