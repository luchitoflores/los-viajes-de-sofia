import type {WorldDefinition} from '../worlds/schema';
import type {WorldProgress} from './progression';
let timer:ReturnType<typeof setTimeout>|undefined;
/** Solo cambios de progreso: cargar o abrir el menú no repite el aviso. */
export function notifyObjectiveChange(world:WorldDefinition,before:Partial<WorldProgress>|undefined,after:WorldProgress){
 if(!before)return;
 const previous=new Set(before.flags??[]),completed=world.missions.filter(m=>!previous.has(m.flag)&&after.flags.includes(m.flag));
 const next=world.missions.find(m=>!after.flags.includes(m.flag));
 if(!completed.length&&!(after.introComplete&&!before.introComplete))return;
 let box=document.getElementById('objective-notice');
 if(!box){box=document.createElement('div');box.id='objective-notice';box.setAttribute('role','status');box.setAttribute('aria-live','polite');(document.getElementById('stage')??document.body).append(box)}
 box.replaceChildren();
 const heading=document.createElement('strong');heading.textContent=completed.length?'Objetivo cumplido':'Nuevo objetivo';box.append(heading);
 if(completed.length){const text=document.createElement('span');text.textContent=completed.map(m=>m.title).join(' · ');box.append(text)}
 if(next){const text=document.createElement('span');text.textContent=(completed.length?'Nuevo objetivo: ':'')+next.title;box.append(text)}
 box.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{box!.hidden=true},5000);
}
