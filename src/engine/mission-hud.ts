import {activeObjective} from '../worlds/mission-progress';
import type {WorldDefinition} from '../worlds/schema';
export function missionHud(w:WorldDefinition,flags:string[]){
 const current=activeObjective(w,flags),heading=document.getElementById('chapter'),quest=document.getElementById('quest'),panel=document.getElementById('objective');
 panel?.classList.toggle('has-active-mission',!!current);
 if(heading)heading.textContent=current?.mission.title??w.title;if(quest)quest.textContent=current?'En curso · '+current.goal:'Explora y conversa con '+w.philosopher.name+'.';
 let icon=document.getElementById('quest-item') as HTMLImageElement|null;const item=current?.stage?.item;
 if(item&&w.inventoryItems?.[item]&&panel){const definition=w.inventoryItems[item];if(!icon){icon=document.createElement('img');icon.id='quest-item';panel.append(icon)}icon.src=w.assets[definition.asset].src;const found=flags.includes('inventory:'+item+':owned');icon.classList.toggle('undiscovered',!found);icon.alt=found?definition.name:'Objeto por descubrir';icon.hidden=false}else if(icon)icon.hidden=true;
}
