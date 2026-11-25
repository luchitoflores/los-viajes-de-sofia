import {planetTexture} from './planet-texture';
import Phaser from 'phaser';

export interface ShipPose {x:number;y:number;rotation:number;width:number;height:number}
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration=(ms:number)=>reduced()?Math.min(ms,140):ms;
function tween(scene:Phaser.Scene,config:Phaser.Types.Tweens.TweenBuilderConfig){
 return new Promise<void>((resolve,reject)=>{const shutdown=()=>reject(Error('El escenario cambió durante el embarque.'));scene.events.once('shutdown',shutdown);scene.tweens.add({...config,onComplete:()=>{scene.events.off('shutdown',shutdown);resolve()}})})
}
function local(p:ShipPose,x:number,y:number){return{x:p.x+x*Math.cos(p.rotation)-y*Math.sin(p.rotation),y:p.y+x*Math.sin(p.rotation)+y*Math.cos(p.rotation)}}
// Composición de los recursos ilustrados existentes: mismo casco, Sofía visible en la escotilla.
export function preparePilot(scene:Phaser.Scene){
 if(scene.textures.exists('ship-sofia-pilot'))return;
 const texture=scene.textures.createCanvas('ship-sofia-pilot',200,200)!;
 const c=texture.context;c.save();c.beginPath();c.arc(100,100,96,0,Math.PI*2);c.clip();c.fillStyle='#276167';c.fillRect(0,0,200,200);
 c.drawImage(scene.textures.get('av_sofia.png').getSourceImage() as HTMLImageElement,20,38,130,125,0,0,200,192);
 c.fillStyle='#70d7dd22';c.fillRect(0,0,200,200);c.restore();texture.refresh();
}
export function pilotAt(scene:Phaser.Scene,pose:ShipPose){preparePilot(scene);const p=local(pose,0,-pose.height*.493);return scene.add.image(p.x,p.y,'ship-sofia-pilot').setDisplaySize(pose.width*.37,pose.width*.37).setRotation(pose.rotation).setDepth(35)}
export interface Boarding {scene:Phaser.Scene;pilot:Phaser.GameObjects.Image;leave:()=>Promise<void>;dispose:()=>void}
export async function board(scene:Phaser.Scene,hero:Phaser.GameObjects.Sprite,pose:ShipPose,arriving=false):Promise<Boarding>{
 const start={x:hero.x,y:hero.y,rotation:hero.rotation,flip:hero.flipX};
 const hatch=local(pose,-pose.width*.12,-pose.height*.09);
 if(!arriving){hero.setFlipX(hatch.x<hero.x).play('sofia-walk',true);await tween(scene,{targets:hero,...hatch,rotation:pose.rotation,duration:duration(Math.max(320,Math.hypot(hero.x-hatch.x,hero.y-hatch.y)/.16)),ease:'Sine.easeInOut'});hero.play('sofia-idle',true);await tween(scene,{targets:hero,alpha:0,duration:duration(260)})}
 else hero.setPosition(hatch.x,hatch.y).setRotation(pose.rotation).setAlpha(0);
 const pilot=pilotAt(scene,pose);if(!arriving){pilot.setAlpha(0);await tween(scene,{targets:pilot,alpha:1,duration:duration(380)})}let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;pilot.destroy();if(hero.active)hero.setPosition(start.x,start.y).setRotation(start.rotation).setFlipX(start.flip).setAlpha(1).play('sofia-idle',true)};
 return{scene,pilot,dispose,leave:async()=>{if(disposed)return;pilot.destroy();hero.setPosition(hatch.x,hatch.y).setAlpha(0).play('sofia-walk',true);await tween(scene,{targets:hero,alpha:1,duration:duration(200)});await tween(scene,{targets:hero,x:start.x,y:start.y,rotation:start.rotation,duration:duration(520),ease:'Sine.easeInOut'});dispose()}};
}

/** Mueve la propia nave de la superficie: no crea otra nave estacionada. */
export async function dockShip(scene:Phaser.Scene,view:Phaser.GameObjects.Image,pose:ShipPose,pilot:Phaser.GameObjects.Image,landing:boolean){
 const motion={height:landing?270:0};
 const position=()=>{const p=local(pose,0,-motion.height);view.setPosition(p.x,p.y);const cabin=local({...pose,...p},0,-pose.height*.493);pilot.setPosition(cabin.x,cabin.y)};
 view.setVisible(true).setData('vehicleId','sofia-ship').setData('flightPhase',landing?'landing':'launch');position();
 await tween(scene,{targets:motion,height:landing?0:270,duration:duration(950),ease:landing?'Sine.easeOut':'Sine.easeIn',onUpdate:position});
 view.setData('flightPhase',landing?'parked':'departed');
}

interface FlightData {direction?:1|-1;fromMap?:boolean;shipSource?:string;source:string;destination:string;name:string;arrive:(reveal:()=>void)=>Promise<void>;done:(error?:unknown)=>void}
/** Escena superpuesta: el viaje no destruye el mundo de origen antes de cargar el destino. */
export class SpaceflightScene extends Phaser.Scene {
 direction:1|-1=1;phase='idle';private flightData!:FlightData;
 constructor(){super('Spaceflight')}
 init(data:FlightData){this.flightData=data;this.direction=data.direction??1;this.phase='launch'}
 preload(){if(this.textures.exists('flight-ship-current'))this.textures.remove('flight-ship-current');this.load.image('flight-ship-current',this.flightData.shipSource??'assets/polis-ship.png');for(const file of new Set(['galaxy.jpg','polis-ship.png','av_sofia.png',this.flightData.source,this.flightData.destination]))if(!this.textures.exists(file))this.load.image(file,file.startsWith('data:')?file:'assets/'+file)}
 create(){this.tweens.timeScale=1;this.cameras.main.setVisible(true);this.scene.bringToTop();const flight=this.run();document.body.classList.remove('story-selecting');flight.catch(e=>{this.flightData.done(e);this.scene.stop()})}
 private async run(){
  const w=this.scale.width,h=this.scale.height,dir=this.direction,x=(fraction:number)=>w*(dir===1?fraction:1-fraction);this.cameras.main.setViewport(0,0,w,h);
  this.add.image(w/2,h/2,'galaxy.jpg').setDisplaySize(w,h);
  const source=this.add.image(x(.13),h*.91,planetTexture(this,this.flightData.source)).setDisplaySize(h*.72,h*.72).setVisible(!this.flightData.fromMap);
  const target=this.add.image(x(1.2),h*.66,planetTexture(this,this.flightData.destination)).setDisplaySize(h*.14,h*.14);
  const ship=this.add.container(x(.2),h*.55).setScale(dir,1);ship.add(this.add.image(0,0,'flight-ship-current').setOrigin(.5,1).setDisplaySize(100,126));
  const pilot=pilotAt(this,{x:0,y:0,rotation:0,width:100,height:126});ship.add(pilot);
  const label=this.add.text(w/2,36,this.flightData.fromMap?'Viajando hacia '+this.flightData.name+'…':'Despegando…',{fontFamily:'Georgia',fontSize:'22px',color:'#fff0d2',stroke:'#162238',strokeThickness:4}).setOrigin(.5,0);
  const skip=this.add.text(w-20,h-28,'Omitir animación',{fontFamily:'Arial',fontSize:'15px',color:'#fff0d2',backgroundColor:'#152338'}).setOrigin(1).setPadding(12).setInteractive({useHandCursor:true});
  let fast=false;skip.on('pointerup',()=>{if(fast)return;fast=true;this.tweens.timeScale=12;skip.setVisible(false)});
  await tween(this,{targets:ship,x:x(.44),y:h*.46,angle:14*dir,duration:duration(900),ease:'Sine.easeIn'});
  this.phase='cruise';label.setText('Rumbo a '+this.flightData.name);
  this.tweens.add({targets:source,x:dir===1?-h*.5:w+h*.5,scaleX:source.scaleX*.35,scaleY:source.scaleY*.35,duration:duration(1800),ease:'Sine.easeInOut'});
  await Promise.all([tween(this,{targets:target,x:x(.85),y:h*.83,displayWidth:h*.7,displayHeight:h*.7,duration:duration(1800),ease:'Sine.easeInOut'}),tween(this,{targets:ship,x:x(.65),y:h*.42,angle:-8*dir,duration:duration(1800),ease:'Sine.easeInOut'})]);
  this.phase='landing';label.setText('Aterrizando en '+this.flightData.name+'…');skip.setVisible(false);
  await tween(this,{targets:ship,x:x(.78),y:h*.56,angle:0,duration:duration(800),ease:'Sine.easeOut'});
  await this.flightData.arrive(()=>{this.cameras.main.setVisible(false);document.body.classList.remove('ship-in-flight');document.body.classList.add('ship-arriving')});this.phase='complete';this.flightData.done();this.scene.stop();
 }
}
