export interface ZoneRect {x:number;y:number;w:number;h:number;bottom?:number}
export type ZoneHandle='move'|'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w';
export const zoneHandles=(r:ZoneRect)=>({nw:[r.x,r.y],n:[r.x+r.w/2,r.y],ne:[r.x+r.w,r.y],e:[r.x+r.w,r.y+r.h/2],se:[r.x+r.w,r.y+r.h],s:[r.x+r.w/2,r.y+r.h],sw:[r.x,r.y+r.h],w:[r.x,r.y+r.h/2]}) as Record<Exclude<ZoneHandle,'move'>,number[]>;
export function handleAt(r:ZoneRect,x:number,y:number,tolerance=14):ZoneHandle|null{return Object.entries(zoneHandles(r)).find(([,p])=>Math.hypot(x-p[0],y-p[1])<=tolerance)?.[0] as ZoneHandle??null}
export function smallestZone<T extends ZoneRect>(zones:T[],x:number,y:number){return zones.map((r,i)=>({r,i})).filter(({r})=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h).sort((a,b)=>a.r.w*a.r.h-b.r.w*b.r.h)[0]?.i??-1}
export function transformZone(r:ZoneRect,handle:ZoneHandle,dx:number,dy:number,width:number,height:number){
 let left=r.x,top=r.y,right=r.x+r.w,bottom=r.y+r.h;
 if(handle==='move'){left=Math.max(0,Math.min(width-r.w,left+dx));top=Math.max(0,Math.min(height-r.h,top+dy));right=left+r.w;bottom=top+r.h}
 else{if(handle.includes('w'))left=Math.max(0,Math.min(right-12,left+dx));if(handle.includes('e'))right=Math.min(width,Math.max(left+12,right+dx));if(handle.includes('n'))top=Math.max(0,Math.min(bottom-12,top+dy));if(handle.includes('s'))bottom=Math.min(height,Math.max(top+12,bottom+dy))}
 const next={...r,x:Math.round(left),y:Math.round(top),w:Math.round(right-left),h:Math.round(bottom-top)};
 if(r.bottom!==undefined)next.bottom=handle==='move'?r.bottom+top-r.y:r.bottom===r.y+r.h?bottom:r.bottom;
 return next;
}
