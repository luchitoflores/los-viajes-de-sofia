import type {WorldDefinition} from '../worlds/schema';
import {configureEncounter} from '../worlds/encounters';
import {dialoguePlaces} from '../worlds/scene-dialogues';
import {conditionFields,readConditionFields} from './story-event-editor';
import {escape} from './content-player';
export function encounterEditor(root:HTMLElement,w:WorldDefinition,scene:string,source:string,dialogue:string,save:(w:WorldDefinition)=>Promise<void>){
 const p=dialoguePlaces(w).find(p=>p.scene===scene&&p.source===source&&p.dialogue===dialogue);if(!p)return;const e=p.trigger==='event'?w.interiors[scene].events!.find(e=>e.id===source):undefined;
 root.innerHTML=`<h2>Cuándo aparece esta conversación</h2><p>${escape(p.label)}</p>${p.trigger==='companion'?'<p>Estas reglas afectan a lo que dice el compañero. Su presencia y seguimiento conservan las reglas del rescate.</p>':''}<form id="encounter-rule-form">${conditionFields(w,p.requires,p.excludes.filter(f=>!f.startsWith('encounter-done-')))}<label>Repetición<select id="encounter-repeat">${p.trigger==='event'?'<option value="once">Una vez por partida</option><option value="visit">Una vez en cada visita a la habitación</option>':'<option value="always">Cada vez que se lo toque y se cumplan las condiciones</option><option value="once">Una vez por partida en esta aparición</option>'}</select></label><p id="encounter-rule-error" role="alert"></p><button type="submit">Guardar condiciones</button></form>`;
 (document.getElementById('encounter-repeat') as HTMLSelectElement).value=e?.repeat==='visit'?'visit':p.trigger==='event'||p.excludes.some(f=>f.startsWith('encounter-done-'))?'once':'always';
 document.getElementById('encounter-rule-form')!.onsubmit=async event=>{event.preventDefault();try{await save(configureEncounter(w,scene,source,dialogue,{...readConditionFields(root),repeat:(document.getElementById('encounter-repeat') as HTMLSelectElement).value as 'once'|'always'|'visit'}))}catch(e){document.getElementById('encounter-rule-error')!.textContent=(e as Error).message}};
}
