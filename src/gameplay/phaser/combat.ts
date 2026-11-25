import type Phaser from 'phaser';
import {combatPreset,parseCombatEncounter,createCombat,stepCombat,type CombatEncounter,type CombatState,type CombatRecord} from '../combat';
import {meets} from '../conditions';
import './combat.css';
interface CombatHost {
 hero:()=>{x:number;y:number;facing:1|-1};flags:()=>string[];record:(id:string)=>CombatRecord|undefined;
 asset:(id:string)=>string;blocked:()=>boolean;editing:()=>boolean;floorAt:(x:number)=>number;canMove:(from:number,to:number)=>boolean;
 push:(dx:number)=>void;checkpoint:(x:number,y:number)=>void;approach:(x:number)=>void;
 begin:(id:string,ready:()=>void)=>void;victory:(id:string)=>void;defeat:(id:string,retry:()=>void)=>void;
}
/** Presentation adapter; all health, impacts, timing and enemy behavior live in the pure model. */
export class PhaserCombat {
 readonly configs:CombatEncounter[];readonly models=new Map<string,CombatState>();
 private views=new Map<string,any>();private projectiles=new Map<string,any>();private pending=new Set<string>();private finishing=new Set<string>();
 private held=false;private queued=false;private destroyed=false;private hud:HTMLDivElement;private outline:Phaser.GameObjects.Graphics;
 constructor(private scene:Phaser.Scene,raw:CombatEncounter[],private host:CombatHost){
  this.configs=raw.map(parseCombatEncounter);this.hud=document.createElement('div');this.hud.className='combat-hud';this.hud.hidden=true;(document.getElementById('stage')??document.getElementById('arena')??document.body).append(this.hud);this.outline=scene.add.graphics().setDepth(120);
  for(const c of this.configs){this.models.set(c.id,createCombat(c));const key=host.asset(c.asset);let view:any;
   if(scene.textures.exists(key)){view=scene.add.image(c.x,c.y,key).setOrigin(.5,1);const source=view.texture.getSourceImage(),height=118*scene.scale.height/540*c.scale;view.setDisplaySize(height*source.width/source.height,height)}
   else view=scene.add.rectangle(c.x,c.y,60*c.scale,120*c.scale,0x62556f).setOrigin(.5,1).setData('provisional','Recurso de enemigo pendiente');
   view.setDepth(14).setData('combatEnemy',c.id).setInteractive({useHandCursor:true});view.on('pointerup',()=>{if(host.blocked()||host.editing())return;const state=this.models.get(c.id)!;if(state.status==='active'){const hero=(scene as any).player??(scene as any).ship;hero?.setFlipX?.(state.enemyX<host.hero().x);this.attack()}else host.approach(state.enemyX)});this.views.set(c.id,view);
  }
  scene.input.keyboard?.on('keydown-F',this.keyDown);scene.input.keyboard?.on('keyup-F',this.keyUp);window.addEventListener('blur',this.keyUp);scene.events.once('shutdown',this.destroy,this);
 }
 private keyDown=(e:KeyboardEvent)=>{if(!e.ctrlKey&&!e.metaKey&&!this.host.blocked()&&!this.host.editing()&&!(document.activeElement as HTMLElement)?.matches('input,textarea,select'))this.held=true};
 private keyUp=()=>{this.held=false;this.queued=false};
 conversationTargets(){return this.configs.flatMap(c=>{const view=this.views.get(c.id);return c.characterId&&view?.active&&view.visible?[{id:c.id,characterId:c.characterId,name:c.name,pending:false,view}]:[]})}
 faceCharacter(id:string){const c=this.configs.find(c=>c.characterId===id),view=c&&this.views.get(c.id);if(!view?.active)return false;view.setFlipX(this.host.hero().x<view.x);const player=(this.scene as any).player??(this.scene as any).ship;player?.setFlipX(view.x<this.host.hero().x);return true}
 private active(){return this.configs.find(c=>this.models.get(c.id)?.status==='active')}
 attack(){if(this.active()&&!this.host.blocked()&&!this.host.editing())this.queued=true}
 attackAction(){return this.active()&&!this.host.blocked()&&!this.host.editing()?{id:'combat-attack',kind:'pulse',label:'Pulso',run:()=>this.attack()}:null}
 private activate(c:CombatEncounter,resetPosition=false){this.clearProjectiles();this.models.set(c.id,createCombat(c,true));this.pending.delete(c.id);this.finishing.delete(c.id);if(resetPosition)this.host.checkpoint(c.checkpoint.x,this.host.floorAt(c.checkpoint.x))}
 update(delta:number){if(this.destroyed)return;const paused=this.host.blocked()||this.host.editing();if(paused)this.keyUp();const hero=this.host.hero();
  if(!paused&&!this.active())for(const c of this.configs){const record=this.host.record(c.id),s=this.models.get(c.id)!;if(c.grounded&&s.status==='inactive')s.enemyY=this.host.floorAt(s.enemyX);if(record?.state==='defeated'||this.host.flags().includes(c.victoryFlag)){s.status='defeated';continue}if(!meets(this.host.flags(),c))continue;
   if(s.status==='inactive'&&record?.state==='active'){this.activate(c,true);break}
   if(s.status==='inactive'&&!this.pending.has(c.id)&&Math.abs(hero.x-s.enemyX)<=c.triggerRadius&&Math.abs(hero.y-s.enemyY)<180){this.pending.add(c.id);this.host.begin(c.id,()=>{if(!this.destroyed)this.activate(c)});break}
  }
  for(const c of this.configs){const s=this.models.get(c.id)!;const result={heroPush:0,heroHit:false,enemyHit:false,victory:false,defeat:false};let remaining=paused?0:Math.max(0,Math.min(.25,delta));while(remaining>0){const dt=Math.min(.04,remaining),r=stepCombat(c,s,this.host.hero(),dt,{attack:this.queued||this.held,paused},{floorAt:this.host.floorAt,canMove:this.host.canMove});remaining-=dt;result.heroPush+=r.heroPush;result.heroHit||=r.heroHit;result.enemyHit||=r.enemyHit;result.victory||=r.victory;result.defeat||=r.defeat}if(result.heroPush)this.host.push(result.heroPush);
   if(result.victory&&!this.finishing.has(c.id)){this.finishing.add(c.id);this.clearProjectiles();const v=this.views.get(c.id);this.scene.tweens.add({targets:v,alpha:0,duration:250,onComplete:()=>v?.setVisible(false)});this.host.victory(c.id)}
   if(result.defeat&&!this.finishing.has(c.id)){this.finishing.add(c.id);this.clearProjectiles();this.host.defeat(c.id,()=>{if(!this.destroyed)this.activate(c,true)})}
   const view=this.views.get(c.id);if(view?.active){view.setPosition(s.enemyX,s.enemyY).setFlipX?.(this.host.hero().x<s.enemyX);if(s.status!=='defeated')view.setVisible(true);else if(!this.finishing.has(c.id))view.setVisible(this.host.editing());view.input&&(view.input.enabled=!paused);}
  }
  if(!this.active()){const player=(this.scene as any).player??(this.scene as any).ship;player?.setAlpha(1)}this.queued=false;this.paint(paused);if(!paused)for(const id of [...this.pending])if(this.host.record(id)?.state!=='active')this.pending.delete(id);
 }
 private paint(paused:boolean){const visible=new Set<string>();
  for(const c of this.configs){const s=this.models.get(c.id)!;for(const p of s.projectiles){const key=c.id+':'+p.id;visible.add(key);let view=this.projectiles.get(key);if(!view){const asset=p.side==='enemy'&&c.attack.asset?this.host.asset(c.attack.asset):null;view=asset&&this.scene.textures.exists(asset)?this.scene.add.image(p.x,p.y,asset).setDisplaySize(p.radius*2,p.radius*2):this.scene.add.circle(p.x,p.y,p.radius,p.side==='enemy'?parseInt(c.attack.color.slice(1),16):0x68dcea,.95).setStrokeStyle(2,p.side==='enemy'?0x9d87bd:0xc7fcff);view.setDepth(60);this.projectiles.set(key,view)}view.setPosition(p.x,p.y)}}
  for(const [id,view] of this.projectiles)if(!visible.has(id)){view.destroy();this.projectiles.delete(id)}
  this.outline.clear();if(this.host.editing())for(const c of this.configs){this.outline.lineStyle(2,0xac91d5,.7).strokeRect(c.zone.min,c.y-c.hitbox.height,c.zone.max-c.zone.min,c.hitbox.height).lineStyle(2,0x80d6cf).strokeCircle(c.checkpoint.x,c.checkpoint.y,10)}
  const active=this.active();this.hud.hidden=paused||!active;if(active){const s=this.models.get(active.id)!,text=`Vida: ${s.heroHp}/${active.sofia.hp} · ${active.name}: ${s.enemyHp}/${active.hp} · F / Pulso`;if(this.hud.textContent!==text)this.hud.textContent=text;const player=(this.scene as any).player??(this.scene as any).ship;if(player?.active)player.setAlpha(!paused&&s.time<s.invulnerableUntil ? .5+.5*Math.abs(Math.sin(s.time*24)):1)}
 }
 private clearProjectiles(){for(const s of this.models.values())s.projectiles=[];for(const v of this.projectiles.values())v.destroy();this.projectiles.clear()}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.scene.input.keyboard?.off('keydown-F',this.keyDown);this.scene.input.keyboard?.off('keyup-F',this.keyUp);window.removeEventListener('blur',this.keyUp);this.clearProjectiles();for(const v of this.views.values())v.destroy();this.views.clear();this.outline.destroy();this.hud.remove();const player=(this.scene as any).player??(this.scene as any).ship;if(player?.active)player.setAlpha(1)}
}
