import {prepareDialoguePages,nextDialoguePage} from './dialogue-pages';
export function advanceDialogue(panel:HTMLElement){
 const text=panel.querySelector<HTMLElement>('#dialogue-text');
 if(text&&text.textContent!==text.getAttribute('aria-label')){text.dispatchEvent(new Event('dialogue-reveal'));return}
 if(nextDialoguePage(panel))return;
 const next=panel.querySelector<HTMLButtonElement>('[data-story-next]');
 if(next){next.click();return}
 const choices=Array.from(panel.querySelectorAll<HTMLButtonElement>('button:not([hidden])'));
 const focused=document.activeElement;if(focused instanceof HTMLButtonElement&&choices.includes(focused))focused.click();else choices[0]?.focus();
}
export function configureDialoguePanel(panel:HTMLElement,close:()=>void){
 const buttons=Array.from(panel.querySelectorAll<HTMLButtonElement>('button'));
 const utilities=['reveal-text','leave','atlas','album','map','return-cave'];
 const choices=buttons.filter(b=>!utilities.includes(b.dataset.run??b.dataset.action??''));
 buttons.filter(b=>utilities.includes(b.dataset.run??b.dataset.action??'')).forEach(b=>b.hidden=true);
 if(choices.length===1){choices[0].hidden=true;choices[0].dataset.storyNext='true'}
 panel.onclick=e=>{if((e.target as HTMLElement).closest('button,a'))return;if(!choices.length){if(!nextDialoguePage(panel))close()}else advanceDialogue(panel)};
 panel.tabIndex=0;prepareDialoguePages(panel);
}
/** Enter avanza una vez; las respuestas múltiples requieren elegir el botón. */
export function bindDialogueKeyboard(){
 document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'||event.isComposing)return;
  const target=event.target as HTMLElement|null;
  if(target?.closest('input,textarea,select,[contenteditable="true"]'))return;
  const panel=document.querySelector<HTMLElement>('#veil.visible #panel');if(!panel)return;
  if(panel.classList.contains('speech-bubble')){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat){if(!panel.querySelector('button:not([hidden])')&&!panel.querySelector('[data-story-next]'))panel.click();else advanceDialogue(panel)}return}
  const buttons=Array.from(panel.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')).filter(b=>b.getClientRects().length>0);
  const text=panel.querySelector<HTMLElement>('#dialogue-text');
  const next=buttons.find(b=>['continue'].includes(b.dataset.run??b.dataset.action??''));
  const onlyClose=buttons.length===1&&['close','leave'].includes(buttons[0].dataset.run??buttons[0].dataset.action??'');
  if(!text&&!panel.querySelector('.character-tag')&&!next&&!onlyClose)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat)return;
  if(text&&text.textContent!==text.getAttribute('aria-label')){panel.querySelector<HTMLButtonElement>('[data-run="reveal-text"]')?.click();return}
  const focused=document.activeElement;
  if(focused instanceof HTMLButtonElement&&buttons.includes(focused)&&focused.dataset.run!=='reveal-text'){focused.click();return}
  const choices=buttons.filter(b=>b.dataset.run?.startsWith('choice-'));
  if(choices.length===1){choices[0].click();return}
  if(choices.length>1){choices[0].focus();return}
  if(next){next.click();return}
  if(onlyClose){buttons[0].click();return}
  const replies=buttons.filter(b=>!['close','leave','atlas','map','album','return-cave','reveal-text'].includes(b.dataset.run??b.dataset.action??''));
  if(replies.length===1&&buttons.length===1){replies[0].click();return}
  (replies[0]??buttons[0])?.focus();
 },true);
}
