import type Phaser from 'phaser';
export interface RoomLighting {darkness:number;lampFlag?:string;fadeTo?:{x:number;darkness:number};lights?:{x:number;y:number;radius:number;flag?:string}[]}

export class RoomLight {
 private texture:Phaser.Textures.CanvasTexture;private last=0;private lampFade=0;
 constructor(private scene:Phaser.Scene,private config:RoomLighting,private flags:()=>string[],private lamp?:()=>{on:boolean;radius:number;intensity:number;focused?:boolean;facing?:number}){
  const key='room-light-'+scene.sys.settings.key;
  if(scene.textures.exists(key))scene.textures.remove(key);
  this.texture=scene.textures.createCanvas(key,scene.scale.width,scene.scale.height)!;
  scene.add.image(0,0,key).setOrigin(0).setScrollFactor(0).setDepth(65);
  scene.events.once('shutdown',()=>{if(scene.textures.exists(key))scene.textures.remove(key)});
 }
 configure(config:RoomLighting){this.config=config;this.last=0}
 private lampLight(){return this.lamp?.()??{on:!!this.config.lampFlag&&this.flags().includes(this.config.lampFlag),radius:250,intensity:1}}
 private inLamp(x:number,y:number,hero:{x:number;y:number}){const l=this.lampLight(),dx=x-hero.x,dy=y-(hero.y-65);return l.on&&(Math.hypot(dx,dy)<l.radius*(l.focused?.55:1)||(l.focused&&dx*(l.facing??1)>0&&Math.abs(dy)<Math.abs(dx)*.55+15&&Math.hypot(dx,dy)<l.radius*1.4))}
 private darkness(x:number){const c=this.config;return c.fadeTo?c.darkness+(c.fadeTo.darkness-c.darkness)*Math.max(0,Math.min(1,x/c.fadeTo.x)):c.darkness}
 visibleAt(x:number,y:number,hero:{x:number;y:number}){
  const c=this.config,flags=this.flags();return this.darkness(hero.x)<.75||this.inLamp(x,y,hero)||(c.lights??[]).some(l=>(!l.flag||flags.includes(l.flag))&&Math.hypot(x-l.x,y-l.y)<l.radius);
 }
 update(time:number,hero:{x:number;y:number},editing=false){
  if(time-this.last<65)return;const elapsed=this.last?time-this.last:65;this.last=time;
  const c=this.texture.context,w=this.texture.width,h=this.texture.height,camera=this.scene.cameras.main;
  c.clearRect(0,0,w,h);if(editing){this.texture.refresh();return}c.globalCompositeOperation='source-over';c.fillStyle=`rgba(3,8,20,${this.darkness(hero.x)})`;c.fillRect(0,0,w,h);c.globalCompositeOperation='destination-out';
  const light=(x:number,y:number,r:number,cone?:number)=>{const point=(camera as unknown as {matrix:Phaser.GameObjects.Components.TransformMatrix}).matrix.transformPoint(x-camera.scrollX,y-camera.scrollY);x=point.x;y=point.y;r*=camera.zoom;c.save();if(cone!==undefined){c.beginPath();c.moveTo(x,y);c.arc(x,y,r,cone-.5,cone+.5);c.closePath();c.clip()}const g=c.createRadialGradient(x,y,20,x,y,r);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.45,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore()};
  const lamp=this.lampLight();this.lampFade+=(Number(lamp.on)-this.lampFade)*(1-Math.exp(-elapsed/130));if(this.lampFade>.01){c.globalAlpha=lamp.intensity*this.lampFade;light(hero.x,hero.y-65,lamp.radius*(lamp.focused?.55:1));if(lamp.focused)light(hero.x,hero.y-65,lamp.radius*1.4,(lamp.facing===-1?Math.PI:0)+((camera as unknown as {rotation:number}).rotation??0));c.globalAlpha=1;}
  for(const l of this.config.lights??[])if(!l.flag||this.flags().includes(l.flag))light(l.x,l.y,l.radius);
  c.globalCompositeOperation='source-over';this.texture.refresh();
 }
}
