export interface ContextAction {id:string;kind:string;label:string;run:()=>void}
export const actionLabel=(type:string)=>({talk:'Hablar',door:'Entrar',enter:'Entrar',return:'Regresar',surface:'Salir',portal:'Viajar',ship:'Embarcar',collect:'Recoger',activate:'Activar',open:'Abrir',unlock:'Abrir',lift:'Subir / bajar',equipment:'Usar linterna'}[type]??'Examinar');
const paths:Record<string,string>={
 talk:'M4 4h16v11H9l-5 5V4Z M8 8h8 M8 11h5',
 door:'M5 21V3h13v18 M14 12h1',enter:'M5 21V3h13v18 M14 12h1',
 collect:'M4 9h16v11H4Z M8 9V5h8v4 M12 12v5 M9 14h6',
 lamp:'M9 3h6 M8 6h8 M7 8h10l-2 5-2.5 8h-1L9 13Z',
 pulse:'M3 12h7 M7 7l5 5-5 5 M15 5a8 8 0 0 1 0 14 M18 8a4 4 0 0 1 0 8',
 weapon:'M4 20L19 5 M13 5h6v6 M4 20l-1-4 M4 20l4 1',
 examine:'M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0'
};
const icon=(kind:string)=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[kind]??paths.examine)+'"/></svg>';

interface LampStatus {owned:boolean;available:boolean;equipped:boolean;on:boolean}
interface ExplorationControlsHost {
 blocked:()=>boolean;
 target:()=>ContextAction|null;
 lamp:()=>LampStatus;
 lampCommand:(command:'toggle'|'equip'|'unequip')=>void;
 /** Reserved for a real equipped weapon; no attack is simulated if absent. */
 weapon?:()=>ContextAction|null;
 settings:()=>{contextual:'auto'|'lamp';secondary:'lamp'|'none'};
}

/** The center is ALWAYS contextual; the two smaller slots are weapon and one lamp toggle.
 * Do not repurpose the contextual button for the lamp when no NPC/object is nearby. */
export function bindExplorationControls(host:ExplorationControlsHost){
 const root=document.createElement('div');
 root.id='context-controls';
 root.innerHTML='<button id="context-weapon" type="button" aria-label="Sin arma equipada" title="Sin arma equipada" disabled></button><button id="context-primary" type="button"></button><button id="context-lamp" type="button"></button>';
 document.getElementById('stage')!.append(root);
 const primary=root.querySelector<HTMLButtonElement>('#context-primary')!;
 const weapon=root.querySelector<HTMLButtonElement>('#context-weapon')!;
 const lampButton=root.querySelector<HTMLButtonElement>('#context-lamp')!;
 const lampAction=():ContextAction=>({id:'lamp',kind:'lamp',label:host.lamp().on?'Apagar':'Encender',run:()=>host.lampCommand('toggle')});
 let current:ContextAction|null=null;
 let equippedWeapon:ContextAction|null=null;
 let last=0;
 const paint=(b:HTMLButtonElement,a:ContextAction|null)=>{
  b.hidden=!a;
  if(!a)return;
  const key=a.kind+':'+a.label;
  if(b.dataset.key!==key){
   b.dataset.key=key;
   b.innerHTML=icon(a.kind)+'<small>'+a.label+'</small>';
   b.setAttribute('aria-label',a.label);
   b.title=a.label;
  }
  b.dataset.action=a.id;
 };
 const tick=(time:number)=>{
  if(time-last>90){
   last=time;
   root.hidden=host.blocked();
   if(root.hidden){current=null;equippedWeapon=null;requestAnimationFrame(tick);return}
   // The contextual action only comes from a nearby, valid object/NPC/door.
   current=host.target();
   paint(primary,current);
   const lamp=host.lamp();
   paint(lampButton,lamp.available?lampAction():null);
   equippedWeapon=host.weapon?.()??null;
   // An unequipped slot is visually present but does not perform a fake attack.
   if(equippedWeapon){
    weapon.hidden=false;weapon.disabled=false;
    paint(weapon,equippedWeapon);
   }else{
    weapon.hidden=true;weapon.disabled=true;
    if(weapon.dataset.key!=='unarmed'){
     weapon.dataset.key='unarmed';
     weapon.innerHTML=icon('weapon')+'<small>Sin arma</small>';
     weapon.setAttribute('aria-label','Sin arma equipada');
     weapon.title='Acción de arma disponible cuando se equipe una herramienta compatible';
    }
   }
   root.dataset.lamp=lamp.on?'on':lamp.equipped?'off':'unequipped';
  }
  requestAnimationFrame(tick);
 };
 requestAnimationFrame(tick);
 const bind=(button:HTMLButtonElement,get:()=>ContextAction|null)=>{
  let selected:ContextAction|null=null,pointer:number|null=null;
  button.addEventListener('pointerdown',e=>{
   e.preventDefault();e.stopPropagation();
   if(host.blocked()||button.disabled)return;
   selected=get();pointer=e.pointerId;button.setPointerCapture(pointer);
  });
  button.addEventListener('pointerup',e=>{
   e.preventDefault();e.stopPropagation();
   if(pointer!==e.pointerId)return;
   pointer=null;
   if(!host.blocked()&&!button.disabled)selected?.run();
   selected=null;
  });
  button.addEventListener('pointercancel',()=>{selected=null;pointer=null});
  button.addEventListener('click',e=>{e.stopPropagation();if(e.detail===0&&!host.blocked()&&!button.disabled)get()?.run()});
 };
 bind(primary,()=>current);
 bind(lampButton,()=>host.lamp().available?lampAction():null);
 bind(weapon,()=>equippedWeapon);
 document.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()==='l'&&!e.repeat&&!host.blocked()&&!(e.target as HTMLElement).matches('input,textarea,select,button')){
   e.preventDefault();host.lampCommand('toggle');
  }
 });
}
