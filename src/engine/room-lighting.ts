import type Phaser from 'phaser';
import type {RoomLighting} from '../worlds/narrative';

export class RoomLight {
 private texture:Phaser.Textures.CanvasTexture;private last=0;
 constructor(private scene:Phaser.Scene,private config:RoomLighting,private flags:()=>string[],private lamp?:()=>{on:boolean;radius:number;intensity:number}){
  const key='room-light-'+scene.sys.settings.key;
  if(scene.textures.exists(key))scene.textures.remove(key);
  this.texture=scene.textures.createCanvas(key,scene.scale.width,scene.scale.height)!;
  scene.add.image(0,0,key).setOrigin(0).setScrollFactor(0).setDepth(65);
  scene.events.once('shutdown',()=>{if(scene.textures.exists(key))scene.textures.remove(key)});
 }
 private lampLight(){return this.lamp?.()??{on:!!this.config.lampFlag&&this.flags().includes(this.config.lampFlag),radius:250,intensity:1}}
 private darkness(x:number){const c=this.config;return c.fadeTo?c.darkness+(c.fadeTo.darkness-c.darkness)*Math.max(0,Math.min(1,x/c.fadeTo.x)):c.darkness}
 visibleAt(x:number,y:number,hero:{x:number;y:number}){
  const c=this.config,flags=this.flags();return this.darkness(hero.x)<.75||(this.lampLight().on&&Math.hypot(x-hero.x,y-(hero.y-65))<this.lampLight().radius)||(c.lights??[]).some(l=>(!l.flag||flags.includes(l.flag))&&Math.hypot(x-l.x,y-l.y)<l.radius);
 }
 update(time:number,hero:{x:number;y:number},editing=false){
  if(time-this.last<65)return;this.last=time;
  const c=this.texture.context,w=this.texture.width,h=this.texture.height,camera=this.scene.cameras.main;
  c.clearRect(0,0,w,h);if(editing){this.texture.refresh();return}c.globalCompositeOperation='source-over';c.fillStyle=`rgba(3,8,20,${this.darkness(hero.x)})`;c.fillRect(0,0,w,h);c.globalCompositeOperation='destination-out';
  const light=(x:number,y:number,r:number)=>{const point=(camera as unknown as {matrix:Phaser.GameObjects.Components.TransformMatrix}).matrix.transformPoint(x-camera.scrollX,y-camera.scrollY);x=point.x;y=point.y;r*=camera.zoom;const g=c.createRadialGradient(x,y,20,x,y,r);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.45,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)};
  const lamp=this.lampLight();if(lamp.on){c.globalAlpha=lamp.intensity;light(hero.x,hero.y-65,lamp.radius);c.globalAlpha=1;}
  for(const l of this.config.lights??[])if(!l.flag||this.flags().includes(l.flag))light(l.x,l.y,l.radius);
  c.globalCompositeOperation='source-over';this.texture.refresh();
 }
}
