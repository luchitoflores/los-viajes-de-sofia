import {conversationKey,finishConversation} from './conversation-status';
import type {WorldDefinition,Activity} from '../worlds/schema';
import {dialogueNode,chooseDialogue,answerActivity,finishDecision,type WorldProgress} from './progression';
export interface ContentHost {face?:(characterId:string)=>void;remember?:(id:string,dialogue:string)=>void;show:(html:string,kind?:'story'|'dark'|'light')=>void;close:()=>void;save:()=>void;atlas:()=>void}
export const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const bind=(action:string,fn:()=>void)=>{document.querySelector<HTMLButtonElement>(`#panel [data-run="${action}"]`)?.addEventListener('click',fn)};
const button=(id:string,text:string)=>`<button data-run="${id}">${escape(text)}</button>`;
export class ContentPlayer {
 constructor(private world:()=>WorldDefinition,private progress:()=>WorldProgress,private host:ContentHost){}
 dialogue(id:string,done:(complete:boolean)=>void=()=>this.host.close()){
  const w=this.world(),p=this.progress(),{id:nodeId,node}=dialogueNode(w,p,id),intro=id===w.intro&&!p.introComplete;
  (p.dialogueStarts??={})[id]??=conversationKey(w,p,id);
  const character=node.characterId?w.characters?.[node.characterId]:node.speaker===w.philosopher.name?w.characters?.[w.philosopher.id]:undefined;const speaker=character?.name??node.speaker;const choices=node.choices.filter(c=>(c.requires??[]).every(id=>p.flags.includes(id))&&!(c.excludes??[]).some(id=>p.flags.includes(id)));
  const speakingId=node.characterId??(node.speaker===w.philosopher.name?w.philosopher.id:undefined);if(speakingId)this.host.face?.(speakingId);
  const portrait=character?.portraitId?w.assets[character.portraitId].src:node.portrait?w.assets[node.portrait].src:node.speaker==='Sofía'?'assets/av_sofia.png':node.speaker===w.philosopher.name?w.philosopher.portrait:null;
  this.host.show(`<div data-dialogue-theme="${w.dialogues[id].style??'parchment'}" data-dialogue-speaker="${escape(node.speaker==='Sofía'?'sofia':speakingId??'narrator')}"></div>${portrait?`<img class="portrait" src="${escape(portrait)}" alt="${escape(speaker)}">`:''}<div class="character-tag">${escape(speaker)}</div><p id="dialogue-text" aria-label="${escape(node.text)}">${escape(node.text)}</p><div class="row">${choices.map((c,i)=>button('choice-'+i,c.text)).join('')}</div>`,'story');
  choices.forEach((c,i)=>bind('choice-'+i,()=>{const result=chooseDialogue(w,p,id,nodeId,c.id);if(!result.next)finishConversation(p,id,p.dialogueStarts?.[id]??conversationKey(w,p,id));this.host.save();const next=()=>{if(result.next)this.dialogue(id,done);else{this.host.remember?.(node.characterId??w.philosopher.id,id);done(true)}};if(result.feedback||result.consequence){this.host.show(`<div data-dialogue-theme="${w.dialogues[id].style??'parchment'}" data-dialogue-speaker="${escape(speakingId??'narrator')}"></div><div class="character-tag">${escape(speaker)}</div><p>${escape(result.feedback??result.consequence!)}</p>${button('continue','Continuar')}`,'story');bind('continue',next)}else next()}));
  bind('atlas',()=>this.host.atlas());bind('leave',()=>done(false));
 }
 message(text:string,next:()=>void=()=>this.host.close(),title='Descubrimiento'){
  this.host.show(`<div data-dialogue-speaker="sofia"></div><div class="character-tag">Sofía</div><p>${escape(text)}</p>${button('continue','Continuar')}`,'story');bind('continue',next);
 }
 activity(id:string,done:(complete:boolean)=>void=()=>this.host.close()){
  const w=this.world(),p=this.progress(),a=w.activities[id];if(!a)throw Error('Actividad inexistente.');if(a.type==='question'){let feedback='';const render=()=>{this.host.show(`<div class="eyebrow">Pregunta</div><h2>${escape(a.title)}</h2><p>${escape(a.prompt)}</p><div class="options">${a.options.map((o,i)=>button('answer-'+i,o.text)).join('')}</div><p role="status">${escape(feedback)}</p>${button('question-close',p.completed.includes(id)?'Terminar':'Salir de la actividad')}`);a.options.forEach((o,i)=>bind('answer-'+i,()=>{const r=answerActivity(w,p,id,o.id,o.id);feedback=r.feedback;this.host.save();render()}));bind('question-close',()=>done(p.completed.includes(id)))};render();return}let selected:string|null=null,feedback='';
  const render=()=>{
   const answers=p.answers[id]??[],complete=p.completed.includes(id);
   let body='';
   if(a.type==='pairs')body=`<div class="activity-columns"><div>${a.pairs.map(i=>`<button data-left="${i.id}" aria-pressed="${selected===i.id}" ${answers.includes(i.id)?'disabled':''}>${escape(i.left)}</button>`).join('')}</div><div>${[...a.pairs].reverse().map(i=>`<button data-right="${i.id}" ${answers.includes(i.id)?'disabled':''}>${escape(i.right)}</button>`).join('')}</div></div>`;
   else if(a.type==='classify')body=`<div class="classify-items">${a.items.map(i=>`<button draggable="true" data-evidence="${i.id}" aria-pressed="${selected===i.id}" ${answers.includes(i.id)?'disabled':''}>${escape(i.text)}</button>`).join('')}</div><div class="classify-categories">${a.categories.map(c=>`<button data-category="${c.id}">${escape(c.label)}</button>`).join('')}</div>`;
   else {this.decision(id,a,done);return}
   this.host.show(`<div class="eyebrow">${a.type==='pairs'?'Relacionar':'Clasificar'}</div><h2>${escape(a.title)}</h2><p>${escape(a.prompt)}</p>${body}<p class="activity-feedback" role="status">${escape(feedback||(complete?'Actividad completada. Puedes consultar tus descubrimientos.':'Selecciona un elemento y su destino.'))}</p><div class="row">${button('leave',complete?'Guardar y volver al camino':'Volver al camino')}</div>`);
   bind('leave',()=>done(complete));
   const answer=(item:string,target:string)=>{const r=answerActivity(w,p,id,item,target);feedback=(r.correct?'Bien observado. ':'Revisa la relación. ')+r.feedback;if(r.correct)selected=null;this.host.save();render()};
   if(a.type==='pairs'){
    document.querySelectorAll<HTMLButtonElement>('#panel [data-left]').forEach(b=>b.onclick=()=>{selected=b.dataset.left!;render()});
    document.querySelectorAll<HTMLButtonElement>('#panel [data-right]').forEach(b=>b.onclick=()=>{if(selected)answer(selected,b.dataset.right!)});
   }else{
    const select=(id:string)=>{selected=id;document.querySelectorAll<HTMLElement>('#panel [data-evidence]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.evidence===id)))};
    document.querySelectorAll<HTMLButtonElement>('#panel [data-evidence]').forEach(b=>{
     b.onclick=()=>select(b.dataset.evidence!);b.ondragstart=e=>{select(b.dataset.evidence!);e.dataTransfer?.setData('text/plain',b.dataset.evidence!)};
     let start:{x:number;y:number}|null=null;b.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};select(b.dataset.evidence!);b.setPointerCapture(e.pointerId)};
     b.onpointerup=e=>{const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-category]');if(target&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8){e.preventDefault();answer(b.dataset.evidence!,target.dataset.category!)}start=null};b.onpointercancel=()=>{start=null};
    });
    document.querySelectorAll<HTMLButtonElement>('#panel [data-category]').forEach(b=>{b.onclick=()=>{if(selected)answer(selected,b.dataset.category!)};b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const item=e.dataTransfer?.getData('text/plain');if(item&&a.items.some(i=>i.id===item))answer(item,b.dataset.category!)}});
   }
  };render();
 }
 private decision(id:string,a:Extract<Activity,{type:'decisions'}>,done:(complete:boolean)=>void){
  const w=this.world(),p=this.progress();let chosen=p.completed.includes(id)?p.choices[id]:null,feedback='';
  const render=()=>{
   const complete=p.completed.includes(id),option=a.options.find(o=>o.id===chosen),reason=a.reasons.find(r=>r.id===p.reasons[id]);
   this.host.show(`<div class="eyebrow">Decidir y argumentar</div><h2>${escape(a.title)}</h2><p>${escape(a.prompt)}</p>${option?`<h3>${escape(option.text)}</h3><p>${escape(option.consequence!)}</p><small>Consecuencia simulada; ninguna alternativa se califica como respuesta moral correcta.</small>${complete?`<p>Argumento guardado: ${escape(reason?.text??'')}</p>`:`<h3>¿Qué razón puedes asumir?</h3><div class="options">${a.reasons.map((r,i)=>button('reason-'+i,r.text)).join('')}</div>`}`:`<div class="options">${a.options.map((o,i)=>button('option-'+i,o.text)).join('')}</div>`}<p role="status">${escape(feedback)}</p><div class="row">${!complete&&chosen?button('reconsider','Revisar mi elección'):''}${button('leave',complete?'Guardar y volver al camino':'Volver al camino')}</div>`);
   a.options.forEach((o,i)=>bind('option-'+i,()=>{chosen=o.id;render()}));a.reasons.forEach((r,i)=>bind('reason-'+i,()=>{const result=finishDecision(w,p,id,chosen!,r.id);feedback=result.feedback;this.host.save();render()}));bind('reconsider',()=>{chosen=null;feedback='';render()});bind('leave',()=>done(complete));
  };render();
 }
}
