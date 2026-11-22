import {dialogueAppearance} from './engine-settings';
import type Phaser from 'phaser';

type Actor = Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
export interface ConversationTarget {id:string;characterId?:string;name:string;view:Actor}
interface DialogueScene extends Phaser.Scene {
 player?:Actor;speakingCharacter?:string;
 conversationTargets?:()=>ConversationTarget[];
 approachCharacter?:(id:string)=>void;
}

/** HTML controls keep touch, focus and keyboard accessible over the Phaser camera. */
export function bindDialogueStage(scene:()=>DialogueScene|undefined,blocked:()=>boolean){
 const layer=document.createElement('div');layer.id='conversation-markers';document.body.append(layer);
 const markers=new Map<string,HTMLButtonElement>();
 const frame=()=>{
  requestAnimationFrame(frame);
  const s=scene(),panel=document.getElementById('panel')!,veil=document.getElementById('veil')!;
  const talking=veil.classList.contains('world-dialog')&&veil.classList.contains('visible');
  layer.hidden=blocked()||!s?.sys.isActive();
  if(!s?.player?.active)return;
  const rect=s.game.canvas.getBoundingClientRect(),camera=s.cameras.main;
  const project=(view:Actor,head=false)=>{
   const height=head?view.displayHeight:0;
   const p=(camera as typeof camera & {matrix:Phaser.GameObjects.Components.TransformMatrix}).matrix.transformPoint(view.x+Math.sin(view.rotation)*height-camera.scrollX,view.y-Math.cos(view.rotation)*height-camera.scrollY);
   return{x:rect.left+p.x*rect.width/s.scale.width,y:rect.top+p.y*rect.height/s.scale.height};
  };
  const targets=s.conversationTargets?.()??[],ids=new Set(targets.map(t=>t.id));
  for(const [id,b] of markers)if(!ids.has(id)){b.remove();markers.delete(id)}
  if(!layer.hidden)for(const target of targets){
   let b=markers.get(target.id);if(!b){b=document.createElement('button');b.className='conversation-marker';b.dataset.conversation=target.id;b.innerHTML='<span class="talk-ring"></span><span class="talk-icon" aria-hidden="true"><i></i><i></i><i></i></span>';b.onclick=e=>{e.stopPropagation();scene()?.approachCharacter?.(target.id)};layer.append(b);markers.set(target.id,b)}
   b.setAttribute('aria-label','Conversar con '+target.name);const p=project(target.view);
   b.hidden=!target.view.visible||!target.view.active||target.view.alpha===0||p.x<rect.left+22||p.x>rect.right-22||p.y<rect.top+15||p.y>rect.bottom-35;
   b.style.left=p.x+'px';b.style.top=p.y+'px';
  }
  if(!talking)return;
  const data=panel.querySelector<HTMLElement>('[data-dialogue-speaker]');
  const id=data?.dataset.dialogueSpeaker??s.speakingCharacter;
  const speaker=id==='sofia'?s.player:(targets.find(t=>t.characterId===id||t.id===id)??(id!=='narrator'?targets.find(t=>t.id===s.speakingCharacter):undefined))?.view;
  const anchor=speaker?project(speaker,true):{x:rect.left+rect.width/2,y:rect.top+rect.height*.7};
  const design=dialogueAppearance();panel.style.setProperty('--bubble-width',Math.min(design.width,rect.width-24)+'px');panel.style.setProperty('--dialogue-font',design.fontSize+'px');panel.classList.toggle('hide-portraits',!design.portraits);const theme=design.theme==='world'?(panel.querySelector<HTMLElement>('[data-dialogue-theme]')?.dataset.dialogueTheme??'parchment'):design.theme;panel.classList.toggle('ink',theme==='ink');panel.classList.toggle('parchment',theme==='parchment');
  const height=panel.offsetHeight,width=panel.offsetWidth;
  let left=Math.max(rect.left+12,Math.min(rect.right-width-12,anchor.x-width*.5));
  const above=anchor.y-height-26>=rect.top+14;
  let top=above?anchor.y-height-26:Math.min(rect.bottom-height-12,Math.max(rect.top+12,anchor.y+28));
  if(design.placement!=='speaker'){left=design.placement==='left'?rect.left+15:design.placement==='right'?rect.right-width-15:rect.left+(rect.width-width)/2;top=design.placement==='top'?rect.top+20:design.placement==='bottom'?rect.bottom-height-20:rect.top+(rect.height-height)/2}left=Math.max(rect.left+12,Math.min(rect.right-width-12,left+design.offsetX));top=Math.max(rect.top+12,Math.min(rect.bottom-height-12,top+design.offsetY));panel.style.left=left+'px';panel.style.top=top+'px';
  panel.style.setProperty('--tail-x',Math.max(30,Math.min(width-30,anchor.x-left))+'px');
  panel.classList.toggle('bubble-below',!above);panel.classList.toggle('bubble-narrator',!speaker||design.placement!=='speaker');
 };
 requestAnimationFrame(frame);
}
