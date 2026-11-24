import type {Dialogue, WorldDefinition} from '../worlds/schema';
import {linearTurns, moveTurn} from '../worlds/story-events';
import {conditionLabel} from '../worlds/scene-dialogues';
import {escape} from './content-player';
import './dialogue-visual-editor.css';
import {conditionFields,readConditionFields} from './story-event-editor';

interface Ports {
 world: WorldDefinition; scene?: string; dialogue:()=>Dialogue; node:()=>string;
 capture:()=>void; select:(id:string)=>void; change:(d:Dialogue)=>void;
 render:()=>void; error:(e:unknown)=>void; preview?:()=>Promise<void>;
}

/** Authoring presentation only: the existing form and interpreter remain authoritative. */
export function dialogueVisualEditor(p:Ports){
 const form=document.getElementById('dialogue-form')!;
 const sequence=document.getElementById('dialogue-sequence')!.parentElement!;
 const workspace=document.createElement('div');workspace.className='dialogue-workspace';
 const script=document.createElement('section');script.className='dialogue-script';
 const stage=document.createElement('section');stage.className='dialogue-stage-reference';
 form.before(workspace);workspace.append(script,form);script.append(stage,sequence);
 form.classList.add('dialogue-inspector');
 const toolbar=document.createElement('div');toolbar.className='dialogue-palette';
 toolbar.innerHTML='<strong>Guion visual</strong><button type="button" data-undo title="Deshacer cambios del guion">↶ Deshacer</button><button type="button" data-redo title="Rehacer cambios del guion">↷ Rehacer</button><button type="button" data-palette="line">＋ Texto</button><button type="button" data-palette="decision">＋ Decisión</button><button type="button" data-palette="branch">＋ Bifurcación</button><button type="button" data-copy-turn>Duplicar bloque</button><button type="button" data-preview-current>▶ Probar desde aquí</button><small>Selecciona un bloque. Sus conexiones y resultados se editan a la derecha.</small>';
 script.insertBefore(toolbar,sequence);
 const list=document.getElementById('dialogue-sequence')!;
 const moments=document.createElement('nav');moments.className='dialogue-moments';moments.setAttribute('aria-label','Momentos de la conversación');script.insertBefore(moments,toolbar);
 const momentRules=document.createElement('div');script.insertBefore(momentRules,toolbar);
 const warnings=document.createElement('p');warnings.className='dialogue-visual-warnings';warnings.setAttribute('role','status');script.append(warnings);
 const status=document.createElement('p');status.className='dialogue-draft-status';status.textContent='Borrador: usa Guardar conversación para conservar los cambios.';form.prepend(status);
 const select=(id:string)=>{try{p.capture();p.select(id);p.render()}catch(e){p.error(e)}};
 const asset=(id?:string)=>{const src=id?p.world.assets[id]?.src:undefined;return src?(/^(data:|blob:|https?:)/.test(src)?src:new URL(src.replace(/^\//,''),document.baseURI).href):undefined};
 const room=p.scene?p.world.interiors[p.scene]:undefined;
 const background=asset(room?.background??p.world.terrain);
 stage.innerHTML=`<header><strong>${escape(room?.name??'Superficie')}</strong><a href="#/edicion?world=${p.world.id}&scene=${p.scene??'surface'}">Editar escenario / NPC</a></header><div class="dialogue-scene-image">${background?`<img src="${escape(background)}" alt="Referencia de la escena">`:''}</div><small>Referencia del escenario. La prueba reproduce el diálogo real sin guardar progreso.</small><div class="dialogue-speaker-shortcuts"></div>`;
 const shortcuts=stage.querySelector<HTMLElement>('.dialogue-speaker-shortcuts')!;
 const add=(kind:string)=>{
  const before=p.node();form.querySelector<HTMLButtonElement>('[data-run="new-node"]')!.click();
  if(p.node()===before)return;
  if(kind!=='line'){const control=document.getElementById('dialogue-step-kind') as HTMLSelectElement;control.value=kind;control.dispatchEvent(new Event('change'))}
 };
 toolbar.querySelectorAll<HTMLButtonElement>('[data-palette]').forEach(b=>b.onclick=()=>add(b.dataset.palette!));
 const preview=toolbar.querySelector<HTMLButtonElement>('[data-preview-current]')!;preview.hidden=!p.preview;
 preview.onclick=async()=>{try{p.capture();await p.preview?.()}catch(e){p.error(e)}};
 let history:Dialogue[]=[structuredClone(p.dialogue())],cursor=0,restoring=false;
 const checkpoint=()=>{const current=p.dialogue();if(JSON.stringify(current)!==JSON.stringify(history[cursor])){history=history.slice(0,cursor+1);history.push(structuredClone(current));if(history.length>40)history.shift();cursor=history.length-1}};
 const undo=toolbar.querySelector<HTMLButtonElement>('[data-undo]')!,redo=toolbar.querySelector<HTMLButtonElement>('[data-redo]')!;
 const restore=(direction:number)=>{try{p.capture();checkpoint();const next=cursor+direction;if(next<0||next>=history.length)return;cursor=next;p.change(structuredClone(history[cursor]));if(!p.dialogue().nodes[p.node()])p.select(p.dialogue().start);restoring=true;p.render();restoring=false}catch(e){restoring=false;p.error(e)}};
 undo.onclick=()=>restore(-1);redo.onclick=()=>restore(1);
 toolbar.querySelector<HTMLButtonElement>('[data-copy-turn]')!.onclick=()=>{try{p.capture();checkpoint();const d=p.dialogue(),original=d.nodes[p.node()],id='node-'+crypto.randomUUID();d.nodes[id]=structuredClone(original);if(original.choices.length===1)original.choices[0].next=id;p.select(id);p.render()}catch(e){p.error(e)}};
 let dragged:string|null=null;
 function render(){
  if(!restoring)checkpoint();undo.disabled=cursor===0;redo.disabled=cursor===history.length-1;
  const d=p.dialogue(),order=linearTurns(d)??Object.keys(d.nodes),linear=!!linearTurns(d);
  const number=(id:string)=>order.indexOf(id)+1;
  moments.innerHTML=`<button type="button" data-moment="${d.start}" ${p.node()===d.start?'aria-current="true"':''}>Inicio habitual</button>`+(d.entries??[]).map(e=>`<button type="button" data-moment="${e.node}" ${p.node()===e.node?'aria-current="true"':''}>${escape(e.label??'Otro momento')}<small>${escape([...(e.requires??[]).map(f=>'Después de: '+conditionLabel(p.world,f)),...(e.excludes??[]).map(f=>'Antes de: '+conditionLabel(p.world,f))].join(' · ')||'Sin requisitos adicionales')}</small></button>`).join('');
  moments.querySelectorAll<HTMLButtonElement>('[data-moment]').forEach(b=>b.onclick=()=>select(b.dataset.moment!));
  const entry=d.entries?.find(e=>e.node===p.node());
  momentRules.innerHTML=entry?`<details><summary>Cuándo aparece «${escape(entry.label??'este momento')}»</summary><label>Nombre del momento<input data-moment-name maxlength="160" value="${escape(entry.label??'Momento')}"></label>${conditionFields(p.world,entry.requires,entry.excludes,'visual-moment')}<label>Prioridad<select data-moment-priority>${d.entries!.map((e,i)=>`<option value="${i}" ${e===entry?'selected':''}>${i+1}${i===0?' · revisar primero':''}</option>`).join('')}</select></label><button type="button" data-apply-moment>Aplicar condiciones al borrador</button><small>Después guarda la conversación. La prueba simula estos requisitos; no los cumple en tu partida.</small></details>`:'';
  momentRules.querySelector<HTMLButtonElement>('[data-apply-moment]')?.addEventListener('click',()=>{try{p.capture();const conditions=readConditionFields(momentRules,'visual-moment'),label=momentRules.querySelector<HTMLInputElement>('[data-moment-name]')!.value.trim();if(!label)throw Error('Pon nombre a este momento.');if(!conditions.requires.length&&!conditions.excludes.length)throw Error('Escoge una condición para este momento; para el caso general utiliza el inicio.');const current=p.dialogue().entries!,index=current.findIndex(e=>e.node===p.node()),priority=Number(momentRules.querySelector<HTMLSelectElement>('[data-moment-priority]')!.value),updated={...current[index],...conditions,label};current.splice(index,1);current.splice(priority,0,updated);p.render()}catch(e){p.error(e)}});
  list.innerHTML=order.map((id,i)=>{
   const n=d.nodes[id],portrait=asset(n.portrait??(n.characterId?p.world.characters?.[n.characterId]?.portraitId:undefined));
   return `<li data-turn-id="${id}" class="dialogue-turn ${id===p.node()?'selected':''}"><header><button type="button" class="dialogue-drag" draggable="${linear}" data-drag="${id}" title="${linear?'Arrastrar antes de otro bloque':'Las ramas se ordenan mediante sus destinos'}" aria-label="Arrastrar bloque ${i+1}">⠿</button>${portrait?`<img src="${escape(portrait)}" alt="">`:''}<button type="button" data-select-turn="${id}"><b>${i+1}. ${escape(n.speaker)}</b><small>${n.choices.length>1?(n.kind==='branch'?'Bifurcación':'Decisión'):'Texto'}${d.start===id?' · Inicio':''}</small></button><button type="button" data-up="${id}" ${!linear||i===0?'disabled':''} title="Mover arriba" aria-label="Mover bloque ${i+1} arriba">↑</button><button type="button" data-down="${id}" ${!linear||i===order.length-1?'disabled':''} title="Mover abajo" aria-label="Mover bloque ${i+1} abajo">↓</button></header><label>Texto de ${escape(n.speaker)}<textarea data-inline-text="${id}" maxlength="2500" rows="3">${escape(n.text)}</textarea></label><div class="dialogue-connections">${n.choices.map(c=>`<button type="button" ${c.next&&d.nodes[c.next]?`data-destination="${c.next}"`: 'disabled'}>${escape(n.choices.length>1?c.text:'Siguiente')} → ${c.next&&d.nodes[c.next]?'Bloque '+number(c.next)+' · '+escape(d.nodes[c.next].speaker):c.next?'Destino ausente':'Fin'}${c.reward?.flags?.length?' · '+c.reward.flags.length+' resultado(s)':''}</button>`).join('')}</div></li>`;
  }).join('');
  list.querySelectorAll<HTMLButtonElement>('[data-select-turn]').forEach(b=>b.onclick=()=>select(b.dataset.selectTurn!));
  list.querySelectorAll<HTMLButtonElement>('[data-destination]').forEach(b=>b.onclick=()=>select(b.dataset.destination!));
  list.querySelectorAll<HTMLTextAreaElement>('[data-inline-text]').forEach(t=>{t.oninput=()=>{undo.disabled=false;const id=t.dataset.inlineText!;d.nodes[id].text=t.value;if(id===p.node())(document.getElementById('dialogue-body') as HTMLTextAreaElement).value=t.value;status.textContent='Hay cambios en el borrador. Guarda la conversación para conservarlos.'}});
  list.querySelectorAll<HTMLElement>('[data-turn-id]').forEach(row=>{
   row.ondragover=e=>{if(linear){e.preventDefault();row.classList.add('drop-target')}};row.ondragleave=()=>row.classList.remove('drop-target');
   row.ondrop=e=>{e.preventDefault();if(!dragged)return;try{p.capture();p.change(moveTurn(p.dialogue(),dragged,row.dataset.turnId!));p.render()}catch(err){p.error(err)}finally{dragged=null;row.classList.remove('drop-target')}};
  });
  list.querySelectorAll<HTMLElement>('[data-drag]').forEach(handle=>{handle.ondragstart=e=>{if(!linear){e.preventDefault();return}dragged=handle.dataset.drag!;e.dataTransfer?.setData('text/plain',dragged!)};handle.ondragend=()=>{dragged=null;list.querySelectorAll('.drop-target').forEach(e=>e.classList.remove('drop-target'))}});
  for(const direction of ['up','down'] as const)list.querySelectorAll<HTMLButtonElement>('[data-'+direction+']').forEach(b=>b.onclick=()=>{try{p.capture();const id=b.dataset[direction]!,index=order.indexOf(id);p.change(direction==='up'?moveTurn(p.dialogue(),id,order[index-1]):moveTurn(p.dialogue(),order[index+1],id));p.render()}catch(e){p.error(e)}});
  const speakers=[...new Set(order.map(id=>d.nodes[id].speaker))];shortcuts.innerHTML=speakers.map(s=>`<button type="button">${escape(s)}</button>`).join('');Array.from(shortcuts.querySelectorAll('button')).forEach((b,i)=>b.onclick=()=>select(order.find(id=>d.nodes[id].speaker===speakers[i])!));
  const reachable=new Set<string>(),visit=(id:string)=>{if(reachable.has(id)||!d.nodes[id])return;reachable.add(id);d.nodes[id].choices.forEach(c=>{if(c.next)visit(c.next)})};visit(d.start);d.entries?.forEach(e=>visit(e.node));
  const disconnected=order.filter(id=>!reachable.has(id));warnings.textContent=disconnected.length?'Sin conexión desde los inicios: '+disconnected.map(id=>'bloque '+number(id)).join(', ')+'. Conéctalos como destino o como momento.':linear?'Puedes arrastrar bloques o usar ↑ ↓ para cambiar el orden.':'Esta conversación tiene ramas o momentos: usa las conexiones para recorrerla. El arrastre no modifica sus rutas.';
 }
  document.getElementById('dialogue-body')!.addEventListener('input',()=>{undo.disabled=false;const inline=list.querySelector<HTMLTextAreaElement>('[data-inline-text="'+p.node()+'"]');if(inline)inline.value=(document.getElementById('dialogue-body') as HTMLTextAreaElement).value});
 return {render};
}
