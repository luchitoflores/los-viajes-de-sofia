import {dialogueAppearance} from './engine-settings';

const advances=new WeakMap<HTMLElement,()=>boolean>();
export const nextDialoguePage=(panel:HTMLElement)=>advances.get(panel)?.()??false;

/** Reserve the complete page before revealing letters; long speeches advance by tap. */
export function prepareDialoguePages(panel:HTMLElement){
 const text=panel.querySelector<HTMLElement>('#dialogue-text')??panel.querySelector<HTMLElement>('.bubble-content>p');
 if(!text)return;
 text.id='dialogue-text';const full=text.getAttribute('aria-label')??text.textContent??'';
 const stage=document.querySelector('#game-canvas canvas')?.getBoundingClientRect();
 const design=dialogueAppearance(),available=Math.min(innerHeight,stage?.height||innerHeight)-36;
 panel.style.setProperty('--bubble-width',Math.min(design.width,(stage?.width||innerWidth)-24)+'px');
 panel.style.setProperty('--dialogue-font',design.fontSize+'px');
 text.textContent=full;
 const chrome=panel.offsetHeight-text.offsetHeight,line=parseFloat(getComputedStyle(text).lineHeight)||25;
 const limit=Math.max(line,available-chrome-4),words=full.match(/\S+\s*/g)??[''];
 const pages:string[]=[];let start=0,height=0;
 while(start<words.length){
  let low=start+1,high=words.length,end=low;
  while(low<=high){const mid=Math.floor((low+high)/2);text.textContent=words.slice(start,mid).join('');if(text.offsetHeight<=limit){end=mid;low=mid+1}else high=mid-1}
  const page=words.slice(start,end).join('');text.textContent=page;height=Math.max(height,text.offsetHeight);pages.push(page);start=end;
 }
 text.style.height=height+'px';text.style.boxSizing='border-box';
 const row=panel.querySelector<HTMLElement>('.row');let index=0,complete=false,timer:ReturnType<typeof setTimeout>|undefined;
 const reveal=()=>{clearTimeout(timer);complete=true;text.textContent=pages[index]};
 text.addEventListener('dialogue-reveal',reveal);
 const show=()=>{
  clearTimeout(timer);const page=pages[index];text.setAttribute('aria-label',page);text.dataset.page=String(index+1);text.dataset.pages=String(pages.length);
  if(row)row.style.visibility=index===pages.length-1?'':'hidden';
  complete=matchMedia('(prefers-reduced-motion: reduce)').matches;text.textContent=complete?page:'';let count=0;
  const tick=()=>{if(!text.isConnected||complete)return;count+=3;text.textContent=page.slice(0,count);if(count<page.length)timer=setTimeout(tick,16);else complete=true};if(!complete)timer=setTimeout(tick,16);
 };
 advances.set(panel,()=>{if(!text.isConnected)return false;if(!complete){reveal();return true}if(index<pages.length-1){index++;show();return true}return false});show();
}
