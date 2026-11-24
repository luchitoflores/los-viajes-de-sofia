import {bindAnalogStick} from './gameplay/analog-stick.ts';
export function toward(current:number,target:number,speed:number,delta:number,tolerance=3):number {
 const distance=target-current;
 return Math.abs(distance)<=tolerance?0:Math.sign(distance)*Math.min(1,Math.abs(distance)/(speed*Math.max(.001,Math.min(delta,.05))));
}

export function bindJoystick(stick:HTMLElement,change:(axis:number)=>void,enabled:()=>boolean,deadZone:()=>number=()=>.15){
 return bindAnalogStick(stick,v=>change(v.x),{enabled,deadZone}).reset;
}

export function validHotspot(value:unknown):boolean {
 if(!value||typeof value!=='object')return false;const h=value as Record<string,unknown>;
 return ['x','y','w','h'].every(k=>typeof h[k]==='number'&&Number.isFinite(h[k])&&Math.abs(h[k] as number)<=10000)&&Number(h.w)>=24&&Number(h.w)<=800&&Number(h.h)>=24&&Number(h.h)<=800;
}
