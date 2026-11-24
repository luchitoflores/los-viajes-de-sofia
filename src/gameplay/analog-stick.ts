export interface StickAxis {x:number;y:number}
/** Shared DOM input adapter: side/radial consumers use x; flight can consume x and y. */
export function bindAnalogStick(stick:HTMLElement,change:(v:StickAxis)=>void,options:{enabled:()=>boolean;deadZone?:()=>number;vertical?:()=>boolean}){
 let pointer:number|null=null;
 const reset=()=>{pointer=null;stick.style.setProperty('--dx','0px');stick.style.setProperty('--dy','0px');stick.setAttribute('aria-valuenow','0');change({x:0,y:0})};
 const move=(e:PointerEvent)=>{if(!options.enabled()){reset();return}e.stopPropagation();const r=stick.getBoundingClientRect(),radius=r.width*.32;let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;const length=Math.hypot(x,y);if(length>radius){x*=radius/length;y*=radius/length}stick.style.setProperty('--dx',x+'px');stick.style.setProperty('--dy',y+'px');const dz=radius*(options.deadZone?.()??.15),v={x:Math.abs(x)<dz?0:x/radius,y:options.vertical?.()&&Math.abs(y)>=dz?y/radius:0};stick.setAttribute('aria-valuenow',String(Math.round(v.x*100)));change(v)};
 const down=(e:PointerEvent)=>{if(!options.enabled()||pointer!==null)return;e.preventDefault();e.stopPropagation();pointer=e.pointerId;stick.setPointerCapture(pointer);move(e)};
 const drag=(e:PointerEvent)=>{if(e.pointerId===pointer)move(e)},up=(e:PointerEvent)=>{if(e.pointerId===pointer)reset()},visibility=()=>{if(document.hidden)reset()};
 stick.addEventListener('pointerdown',down);stick.addEventListener('pointermove',drag);for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,up as EventListener);window.addEventListener('blur',reset);document.addEventListener('visibilitychange',visibility);
 return{reset,destroy:()=>{reset();stick.removeEventListener('pointerdown',down);stick.removeEventListener('pointermove',drag);for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.removeEventListener(name,up as EventListener);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',visibility)}};
}
