import type Phaser from 'phaser';
export interface HintItem {id:string;tooltip?:string}
export class ObjectHints {
 private element:HTMLElement;private timer:ReturnType<typeof setTimeout>|undefined;private held=false;private start:{x:number;y:number}|null=null;
 constructor(private scene:Phaser.Scene,private enabled:()=>boolean,key:string,lookup:(id:string)=>HintItem|undefined){
  this.element=document.getElementById('object-tooltip')??document.body.appendChild(Object.assign(document.createElement('div'),{id:'object-tooltip'}));this.element.hidden=true;this.element.setAttribute('role','tooltip');
  const item=(view:Phaser.GameObjects.GameObject)=>lookup(view.getData(key));
  scene.input.on('gameobjectover',(p:Phaser.Input.Pointer,v:Phaser.GameObjects.GameObject)=>{if(!p.wasTouch)this.show(item(v),p)});
  scene.input.on('gameobjectout',()=>{if(!this.held)this.element.hidden=true});
  scene.input.on('gameobjectdown',(p:Phaser.Input.Pointer,v:Phaser.GameObjects.GameObject)=>{this.clear();this.held=false;if(!this.enabled()||!item(v)?.tooltip)return;this.start={x:p.x,y:p.y};this.timer=setTimeout(()=>{this.held=true;this.show(item(v),p)},450)});
  scene.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(this.start&&Math.hypot(p.x-this.start.x,p.y-this.start.y)>15)this.clear()});
  scene.events.once('shutdown',()=>{this.clear();this.element.hidden=true});
 }
 private clear(){if(this.timer)clearTimeout(this.timer);this.timer=undefined;this.start=null}
 private show(item:HintItem|undefined,p:Phaser.Input.Pointer){if(!this.enabled()||!item?.tooltip)return;const r=this.scene.game.canvas.getBoundingClientRect();this.element.textContent=item.tooltip;this.element.hidden=false;this.element.style.left=Math.max(r.left+10,Math.min(r.right-280,r.left+p.x*r.width/this.scene.scale.width-130))+'px';this.element.style.top=Math.max(r.top+10,Math.min(r.bottom-90,r.top+p.y*r.height/this.scene.scale.height-90))+'px'}
 consume(){const held=this.held;this.clear();this.held=false;return held}
}
