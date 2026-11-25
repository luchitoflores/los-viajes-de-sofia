import {shotReady,advanceProjectile,insideTarget} from './projectiles.ts';
import type {Conditions} from './conditions';
export interface CombatRecord {state:'inactive'|'active'|'defeated';attempts:number}
export interface CombatEncounter extends Conditions {
 id:string;name:string;asset:string;characterId?:string;x:number;y:number;scale:number;grounded:boolean;
 hp:number;speed:number;behavior:'static'|'patrol'|'chase';zone:{min:number;max:number};hitbox:{width:number;height:number};triggerRadius:number;
 beforeDialogue?:string;afterDialogue?:string;victoryFlag:string;reward?:{flags?:string[];concepts?:string[];memories?:string[]};checkpoint:{x:number;y:number};
 attack:{type:'none'|'contact'|'projectile';damage:number;interval:number;range:number;speed:number;radius:number;color:string;asset?:string};
 sofia:{hp:number;damage:number;interval:number;range:number;speed:number;invulnerability:number;knockback:number;hitbox:{width:number;height:number}};
}
export const combatPreset:CombatEncounter={id:'training-enemy',name:'Enemigo de prueba',asset:'warden',x:460,y:560,scale:1,grounded:true,hp:3,speed:45,behavior:'static',zone:{min:420,max:850},hitbox:{width:64,height:138},triggerRadius:310,victoryFlag:'training-victory',checkpoint:{x:170,y:560},attack:{type:'projectile',damage:1,interval:2.1,range:850,speed:140,radius:14,color:'#302046'},sofia:{hp:3,damage:1,interval:.5,range:650,speed:650,invulnerability:.9,knockback:26,hitbox:{width:46,height:126}}};
const id=(v:unknown)=>typeof v==='string'&&/^[a-z][a-z0-9._:-]{0,99}$/.test(v)&&!['constructor','prototype','__proto__'].includes(v);
const n=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function parseCombatEncounter(raw:unknown):CombatEncounter{
 const c=structuredClone(raw) as CombatEncounter;
 if(!c||!id(c.id)||!id(c.asset)||c.characterId!==undefined&&!id(c.characterId)||typeof c.name!=='string'||!c.name||c.name.length>140||!id(c.victoryFlag)||![c.beforeDialogue,c.afterDialogue].every(v=>v===undefined||id(v)))throw Error('Identidad, aspecto o diálogo del encuentro inválido.');
 c.grounded??=true;c.scale??=1;c.hitbox??=structuredClone(combatPreset.hitbox);c.sofia={...structuredClone(combatPreset.sofia),...c.sofia};c.attack={...structuredClone(combatPreset.attack),...c.attack};
 if(!n(c.x,0,10000)||!n(c.y,0,2000)||!n(c.scale,.15,3)||typeof c.grounded!=='boolean'||!Number.isInteger(c.hp)||!n(c.hp,1,1000)||!n(c.speed,0,600)||!['static','patrol','chase'].includes(c.behavior)||!c.zone||!n(c.zone.min,0,10000)||!n(c.zone.max,c.zone.min+1,10000)||!n(c.x,c.zone.min,c.zone.max)||!n(c.triggerRadius,40,700)||!c.checkpoint||!n(c.checkpoint.x,0,10000)||!n(c.checkpoint.y,0,2000))throw Error('Posición, zona o vida del encuentro inválida.');
 const a=c.attack,s=c.sofia;
 if(!['none','contact','projectile'].includes(a.type)||!n(a.damage,.1,20)||!n(a.interval,.3,10)||!n(a.range,50,1500)||!n(a.speed,40,900)||!n(a.radius,4,40)||!/^#[0-9a-fA-F]{6}$/.test(a.color)||a.asset!==undefined&&!id(a.asset)||!Number.isInteger(s.hp)||!n(s.hp,1,20)||!n(s.damage,.1,100)||!n(s.interval,.15,5)||!n(s.range,32,1500)||!n(s.speed,60,1800)||!n(s.invulnerability,.1,5)||!n(s.knockback,0,80))throw Error('Ataques o protección del encuentro inválidos.');
 for(const box of [c.hitbox,s.hitbox])if(!box||!n(box.width,12,200)||!n(box.height,20,240))throw Error('Hitbox del encuentro inválida.');
 for(const list of [c.requires,c.excludes,c.reward?.flags,c.reward?.concepts,c.reward?.memories])if(list!==undefined&&(!Array.isArray(list)||list.length>50||!list.every(id)))throw Error('Condiciones o recompensa de combate inválidas.');
 return c;
}
export interface CombatProjectile {id:number;side:'sofia'|'enemy';x:number;y:number;vx:number;vy:number;distance:number;radius:number;range:number;damage:number}
export interface CombatState {status:'inactive'|'active'|'defeated'|'retry';time:number;enemyX:number;enemyY:number;enemyHp:number;heroHp:number;invulnerableUntil:number;enemyProtectedUntil:number;lastShot:number;lastEnemyShot:number;patrol:1|-1;serial:number;projectiles:CombatProjectile[]}
export function createCombat(c:CombatEncounter,active=false):CombatState{return{status:active?'active':'inactive',time:0,enemyX:c.x,enemyY:c.y,enemyHp:c.hp,heroHp:c.sofia.hp,invulnerableUntil:0,enemyProtectedUntil:0,lastShot:-c.sofia.interval,lastEnemyShot:0,patrol:1,serial:0,projectiles:[]}}
export interface CombatHero {x:number;y:number;facing:1|-1}
export function stepCombat(c:CombatEncounter,s:CombatState,hero:CombatHero,delta:number,input:{attack:boolean;paused?:boolean},ground:{floorAt:(x:number)=>number;canMove?:(from:number,to:number)=>boolean}){
 const result={heroPush:0,heroHit:false,enemyHit:false,victory:false,defeat:false};
 if(input.paused||s.status!=='active')return result;
 const dt=Math.max(0,Math.min(.04,delta));s.time+=dt;
 let direction=c.behavior==='patrol'?s.patrol:c.behavior==='chase'&&Math.abs(hero.x-s.enemyX)>60?Math.sign(hero.x-s.enemyX):0;
 if(c.behavior==='patrol'&&(s.enemyX>=c.zone.max||s.enemyX<=c.zone.min)){s.patrol=s.enemyX>=c.zone.max?-1:1;direction=s.patrol}
 const next=Math.max(c.zone.min,Math.min(c.zone.max,s.enemyX+direction*c.speed*dt));if(!ground.canMove||ground.canMove(s.enemyX,next))s.enemyX=next;if(c.grounded)s.enemyY=ground.floorAt(s.enemyX);
 const add=(side:'sofia'|'enemy',x:number,y:number,vx:number,vy:number,radius:number,range:number,damage:number)=>s.projectiles.push({id:++s.serial,side,x,y,vx,vy,radius,range,damage,distance:0});
 if(input.attack&&shotReady(s.time,s.lastShot,c.sofia.interval)){s.lastShot=s.time;add('sofia',hero.x+hero.facing*28,hero.y-c.sofia.hitbox.height/2,hero.facing*c.sofia.speed,0,9,c.sofia.range,c.sofia.damage)}
 if(c.attack.type==='projectile'&&Math.abs(hero.x-s.enemyX)<=c.attack.range&&shotReady(s.time,s.lastEnemyShot,c.attack.interval)){
  s.lastEnemyShot=s.time;const dx=hero.x-s.enemyX,dy=hero.y-c.sofia.hitbox.height/2-(s.enemyY-c.hitbox.height/2),length=Math.hypot(dx,dy)||1;add('enemy',s.enemyX,s.enemyY-c.hitbox.height/2,dx/length*c.attack.speed,dy/length*c.attack.speed,c.attack.radius,c.attack.range,c.attack.damage);
 }
 const damageHero=(damage:number,from:number)=>{if(s.time<s.invulnerableUntil)return;s.heroHp=Math.max(0,s.heroHp-damage);s.invulnerableUntil=s.time+c.sofia.invulnerability;result.heroHit=true;result.heroPush=(hero.x<from?-1:1)*c.sofia.knockback};
 const kept:CombatProjectile[]=[];
 for(const p of s.projectiles){advanceProjectile(p,{x:p.vx,y:p.vy},dt);p.distance+=Math.hypot(p.vx,p.vy)*dt;if(p.distance>p.range)continue;
  if(p.side==='sofia'&&insideTarget(p,{x:s.enemyX,y:s.enemyY-c.hitbox.height/2,rx:c.hitbox.width/2+p.radius,ry:c.hitbox.height/2+p.radius})){if(s.time>=s.enemyProtectedUntil){s.enemyHp=Math.max(0,s.enemyHp-p.damage);s.enemyProtectedUntil=s.time+.12;result.enemyHit=true}continue}
  if(p.side==='enemy'&&insideTarget(p,{x:hero.x,y:hero.y-c.sofia.hitbox.height/2,rx:c.sofia.hitbox.width/2+p.radius,ry:c.sofia.hitbox.height/2+p.radius})){damageHero(p.damage,p.x-p.vx*.01);continue}kept.push(p);
 }
 s.projectiles=kept;
 if(c.attack.type==='contact'&&Math.abs(hero.x-s.enemyX)<(c.hitbox.width+c.sofia.hitbox.width)/2&&Math.abs(hero.y-s.enemyY)<80&&shotReady(s.time,s.lastEnemyShot,c.attack.interval)){s.lastEnemyShot=s.time;damageHero(c.attack.damage,s.enemyX)}
 if(s.enemyHp<=0){s.status='defeated';s.projectiles=[];result.victory=true}else if(s.heroHp<=0){s.status='retry';s.projectiles=[];result.defeat=true}
 return result;
}
