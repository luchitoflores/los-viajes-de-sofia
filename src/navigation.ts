export function toward(current:number,target:number,speed:number,delta:number,tolerance=3):number {
 const distance=target-current;
 return Math.abs(distance)<=tolerance?0:Math.sign(distance)*Math.min(1,Math.abs(distance)/(speed*Math.max(.001,Math.min(delta,.05))));
}

export function bindJoystick(stick:HTMLElement,change:(axis:number)=>void,enabled:()=>boolean){
 let pointer:number|null=null;
 const reset=()=>{pointer=null;stick.style.setProperty('--dx','0px');stick.style.setProperty('--dy','0px');stick.setAttribute('aria-valuenow','0');change(0)};
 const move=(e:PointerEvent)=>{const rect=stick.getBoundingClientRect(),radius=rect.width*.32;let x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;const distance=Math.hypot(x,y);if(distance>radius){x*=radius/distance;y*=radius/distance}stick.style.setProperty('--dx',x+'px');stick.style.setProperty('--dy',y+'px');const axis=Math.abs(x)<radius*.15?0:x/radius;stick.setAttribute('aria-valuenow',String(Math.round(axis*100)));change(axis)};
 stick.addEventListener('pointerdown',e=>{if(!enabled())return;e.preventDefault();pointer=e.pointerId;stick.setPointerCapture(pointer);move(e)});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)move(e)});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,reset);
 window.addEventListener('blur',reset);
 return reset;
}

export function validHotspot(value:unknown):boolean {
 if(!value||typeof value!=='object')return false;const h=value as Record<string,unknown>;
 return ['x','y','w','h'].every(k=>typeof h[k]==='number'&&Number.isFinite(h[k])&&Math.abs(h[k] as number)<=10000)&&Number(h.w)>=24&&Number(h.w)<=800&&Number(h.h)>=24&&Number(h.h)<=800;
}
