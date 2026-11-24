import {shotReady,advanceProjectile,insideTarget} from '../gameplay/projectiles.ts';
import {controlIcon} from '../gameplay/control-icons.ts';
import {RoomLight} from '../engine/room-lighting.ts';
import Phaser from 'phaser';
import {prepareSofia,SOFIA_SCALE} from '../sofia.ts';
import {createActor,stepActor,explorationProfile,parseMovement} from '../gameplay/locomotion.ts';
import {preloadSofiaActions,prepareSofiaActions,animateActor} from '../gameplay/sofia-actions.ts';
import {bindAnalogStick} from '../gameplay/analog-stick.ts';
import {preloadHeldLamp,attachHeldLamp} from '../engine/held-lamp.ts';
import {equipmentPreset,commandLamp,lampState} from '../worlds/equipment.ts';
import {MODES,DEFAULT_SETTINGS,clamp,normalizedAxis,makeSequence,nextTarget,scoreImpact} from './core.js';

const W=960,H=540,$=id=>document.getElementById(id);
const touch={up:false,down:false,left:false,right:false,fire:false,jump:false,run:false,crouch:false};
const stick={x:0,y:0};let profile=structuredClone(explorationProfile);const toolConfig=structuredClone(equipmentPreset),toolProgress={flags:[toolConfig.lamp.flag]};
const settings={...DEFAULT_SETTINGS};
let activeScene=null,feedbackTimer=null,avatarKind='ship';
const ASSETS={
  ship:'polis-ship.png',galaxy:'galaxy.jpg',cave:'plato-03_fuego_y_sombras.png',
  horse:'shadow_horse.webp',tree:'shadow_tree.webp',warrior:'shadow_warrior.webp',
  vase:'polis-vase.png'
};

function notice(result){
  $('feedback-title').textContent=result.heading;
  $('feedback-text').textContent='';
  $('learning-log').textContent=result.heading+': '+result.explanation;
  const box=$('feedback');
  box.style.borderColor=result.kind==='wrong'?'#ff9494':'#aae8ba';
  box.classList.add('show');clearTimeout(feedbackTimer);
  feedbackTimer=setTimeout(()=>box.classList.remove('show'),1150);
}
function modeInfo(modeId){
  const m=MODES[modeId];
  $('mode-label').textContent=m.title;
  $('lesson-title').textContent=m.philosopher;
  $('lesson-instruction').textContent=m.instruction;
  $('lesson-action').textContent=m.action+'. El movimiento, el proyectil, las colisiones y el resultado son reutilizables.';
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===modeId)));
  document.querySelector('.fire').innerHTML=controlIcon('fire')+'<small>'+(modeId==='shadows'?'Luz':'Pulso')+'</small>';
}
class MechanicsPlayground extends Phaser.Scene {
  constructor(){super('MechanicsPlayground')}
  preload(){preloadSofiaActions(this);preloadHeldLamp(this,toolConfig.lamp.asset);
    for(const [key,file] of Object.entries(ASSETS))this.load.image(key,'./assets/'+file);
    for(let i=0;i<6;i++)this.load.image('sofia_'+i+'.png','./assets/sofia_'+i+'.png');
  }
  create(){
    prepareSofia(this);prepareSofiaActions(this);
    this.keys=this.input.keyboard.addKeys({
      left:Phaser.Input.Keyboard.KeyCodes.LEFT,right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:Phaser.Input.Keyboard.KeyCodes.UP,down:Phaser.Input.Keyboard.KeyCodes.DOWN,
      a:Phaser.Input.Keyboard.KeyCodes.A,d:Phaser.Input.Keyboard.KeyCodes.D,
      w:Phaser.Input.Keyboard.KeyCodes.W,s:Phaser.Input.Keyboard.KeyCodes.S,
      fire:Phaser.Input.Keyboard.KeyCodes.SPACE,run:Phaser.Input.Keyboard.KeyCodes.SHIFT,crouch:Phaser.Input.Keyboard.KeyCodes.C
    });
    this.input.keyboard.addCapture(['LEFT','RIGHT','UP','DOWN','SPACE']);
    this.targets=[];this.bullets=[];
    this.background=null;this.shade=null;this.elapsed=0;this.lastShot=-10000;
    this.glow=this.add.circle(390,H/2,56,0x67dff3,.18).setDepth(9);
    this.ship=this.add.sprite(390,H/2,'ship').setDisplaySize(113,105).setDepth(10);
    this.thruster=this.add.circle(335,H/2,15,0xffb067,.7).setDepth(8);
    this.floor=this.add.rectangle(W/2,H-40,W,80,0x304254,.95).setDepth(1).setVisible(false);
    this.floorEdge=this.add.rectangle(W/2,H-80,W,5,0xc6c5b0,.95).setDepth(2).setVisible(false);
    this.grounded=true;this.verticalVelocity=0;this.wasJump=false;
    this.tooltip=this.add.text(470,215,'◀ Camina ▶ · ▲ Salta',{
      fontFamily:'system-ui',fontSize:'14px',color:'#f4f4ff',
      backgroundColor:'#10152cbb',padding:{x:11,y:7}
    }).setOrigin(.5).setDepth(19);
    this.tweens.add({targets:this.tooltip,alpha:0,delay:3500,duration:650});
    this.actor=createActor(390,H-80);this.held=attachHeldLamp(this,this.ship,()=>toolConfig.lamp,()=>lampState(toolProgress,toolConfig),()=>avatarKind!=='foot');
    this.labLighting={darkness:.72};this.roomLight=new RoomLight(this,this.labLighting,()=>toolProgress.flags,()=>({on:avatarKind==='foot'&&this.modeId==='movement'&&lampState(toolProgress,toolConfig).on,radius:toolConfig.lamp.radius,intensity:1,focused:true,facing:this.ship.flipX?-1:1}));
    activeScene=this;window.__mechanicsScene=this;
    this.setMode('movement');
    // Abrir mostrando la animación real de Sofía, no la nave.
    const requested=new URLSearchParams(location.search).get('actor');
    this.setAvatar(requested==='ship'?'ship':'foot');
  }
  setAvatar(kind){
    if(kind!=='foot'&&kind!=='ship')return;
    avatarKind=kind;
    const foot=kind==='foot';
    this.ship.stop();
    this.ship.setTexture(foot?'sofia-stable-0':'ship');
    this.ship.setOrigin(.5,foot?304/314:.5);
    if(foot)this.ship.setScale(SOFIA_SCALE);else this.ship.setDisplaySize(113,105);
    if(foot)this.ship.play('sofia-idle');
    this.ship.setPosition(390,foot?H-80:H/2).setRotation(0).setFlipX(false);
    this.actor=createActor(390,H-80);this.ship.setData('actor-motion',null);
    this.glow.setVisible(!foot);this.thruster.setVisible(!foot);
    this.floor.setVisible(foot);this.floorEdge.setVisible(foot);
    document.querySelectorAll('[data-avatar]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.avatar===kind)));
    this.setMode(this.modeId);this.controlsVisibility();
  }
  controlsVisibility(){
    const foot=avatarKind==='foot',movement=this.modeId==='movement';
    document.querySelector('[data-dir=fire]').hidden=foot&&movement;
    document.querySelector('[data-dir=jump]').hidden=!foot||!profile.jump;
    document.querySelector('[data-dir=run]').hidden=!foot||!profile.run;
    document.querySelector('[data-dir=crouch]').hidden=!foot||!profile.crouch;
    document.getElementById('tool-light').hidden=!foot||!movement;
    document.querySelector('.right-actions').classList.toggle('movement-controls',foot&&movement);
  }
  setMode(id){
    if(!MODES[id])return;
    this.modeId=id;this.mode=MODES[id];this.sequence=makeSequence(id);
    this.index=0;this.score=0;this.hits=0;this.elapsed=0;this.lastShot=-10000;
    for(const obj of [...this.targets,...this.bullets])obj.view.destroy();
    this.targets=[];this.bullets=[];
    if(this.background)this.background.destroy();
    if(this.shade)this.shade.destroy();
    this.background=this.add.image(W/2,H/2,this.mode.background).setDisplaySize(W,H).setDepth(-40);
    this.shade=this.add.rectangle(W/2,H/2,W,H,0x0a1130,id==='shadows'?.37:.2).setDepth(-39);
    modeInfo(id);this.controlsVisibility();this.updateHud();
    $('learning-log').textContent=this.mode.instruction;
    $('feedback').classList.remove('show');clearTimeout(feedbackTimer);
  }
  updateHud(){$('points').textContent=String(this.score);$('hits').textContent=String(this.hits)}
  fire(){
    if(!shotReady(this.time.now,this.lastShot,settings.cadence))return;
    this.lastShot=this.time.now;
    const light=this.mode.projectile==='light';
    const view=this.add.container(this.ship.x+(avatarKind==='foot'?42:65),this.ship.y-(avatarKind==='foot'?48:0)).setDepth(14);
    view.add([
      this.add.circle(0,0,light?17:11,light?0xffea92:0x5fe5ff,.28),
      this.add.rectangle(-16,0,24,4,light?0xffe9bb:0xaff4ff,.7),
      this.add.ellipse(0,0,light?31:23,9,light?0xffed85:0x84edff)
    ]);
    this.bullets.push({view,speed:690});
  }
  spawnTarget(){
    if(this.targets.length>=6)return;
    const definition=nextTarget(this.sequence,this.index++);
    const lane=avatarKind==='foot'?H-128:[115,205,301,391][(this.index*3)%4];
    const view=this.add.container(1060,lane+(Math.random()-.5)*23).setDepth(5);
    const shadow=this.modeId==='shadows';
    if(shadow){
      const sprite=this.add.image(0,-5,definition.sprite).setDisplaySize(105,100).setAlpha(.9);
      if(definition.sprite==='vase')sprite.setTint(0x353449);
      view.add([
        this.add.circle(0,-3,56,0xffd590,.17),
        sprite,
        this.add.rectangle(0,54,174,26,0x10182f,.91).setStrokeStyle(1,0xbfa98f,.6),
        this.add.text(0,54,definition.label,{fontFamily:'system-ui',fontSize:'13px',color:'#fff2d3'}).setOrigin(.5)
      ]);
    }else{
      const color=definition.valid?0x68538f:0x376b74;
      view.add([
        this.add.rectangle(4,5,236,84,0x080b19,.58),
        this.add.rectangle(0,0,236,84,color,.95).setStrokeStyle(2,0xece0ff,.87),
        this.add.text(0,0,definition.label,{
          fontFamily:'system-ui',fontSize:'17px',color:'#fff',align:'center',fontStyle:'bold',
          wordWrap:{width:215}
        }).setOrigin(.5)
      ]);
    }
    this.targets.push({view,definition,speed:this.mode.targetSpeed,rx:shadow?68:123,ry:shadow?60:49});
  }
  impact(bullet,target){
    const x=target.view.x,y=target.view.y;
    const decision=scoreImpact(target.definition);
    bullet.view.destroy();target.view.destroy();
    this.bullets.splice(this.bullets.indexOf(bullet),1);
    this.targets.splice(this.targets.indexOf(target),1);
    this.score+=decision.points;if(decision.kind==='correct')this.hits++;
    this.updateHud();notice(decision);
    const halo=this.add.circle(x,y,16,decision.kind==='correct'?0xffde9d:0xff8181,.72).setDepth(20);
    this.tweens.add({targets:halo,scale:5,alpha:0,duration:440,onComplete:()=>halo.destroy()});
  }
  update(time,delta){
    const dt=clamp(delta/1000,0,.04),k=this.keys;
    const typing=document.activeElement?.matches('input,textarea,select');
    const x=typing?0:stick.x||Number(k.right.isDown||k.d.isDown||touch.right)-Number(k.left.isDown||k.a.isDown||touch.left);
    const y=typing?0:stick.y||Number(k.down.isDown||k.s.isDown||touch.down)-Number(k.up.isDown||k.w.isDown||touch.up);
    const direction=normalizedAxis(x,y);
    if(avatarKind==='foot'){
      stepActor(this.actor,{axis:x,run:!typing&&(k.run.isDown||touch.run),crouch:!typing&&(k.crouch.isDown||k.down.isDown||touch.crouch),jump:!typing&&(k.up.isDown||k.w.isDown||touch.jump||this.modeId==='movement'&&k.fire.isDown)},profile,dt,{minX:170,maxX:W-210,floorAt:()=>H-80});
      this.ship.setPosition(this.actor.x,this.actor.y).setAngle(0).setFlipX(this.actor.facing<0);
      animateActor(this.ship,this.actor.motion);
      $('actor-state').textContent=({idle:'Quieta',walk:'Caminando',run:'Corriendo',crouch:'Agachada',rise:'Saltando · sube',apex:'Salto · punto alto',fall:'Saltando · baja'})[this.actor.motion];
      const light=lampState(toolProgress,toolConfig);$('tool-light').setAttribute('aria-pressed',String(light.on));
    }else{
      this.ship.x=clamp(this.ship.x+direction.x*dt*settings.speed,80,W-80);
      this.ship.y=clamp(this.ship.y+direction.y*dt*settings.speed,70,H-68);
      this.ship.setAngle(90+direction.y*8);
      this.glow.setPosition(this.ship.x,this.ship.y);
      this.thruster.setPosition(this.ship.x-54,this.ship.y+8);
      $('actor-state').textContent='Vuelo · 2 ejes';
    }
    this.labLighting.darkness=avatarKind==='foot'&&this.modeId==='movement'?.72:0;this.roomLight.update(time,this.ship);
    if(!typing&&(k.fire.isDown||touch.fire)&&this.modeId!=='movement')this.fire();
    this.elapsed+=delta;
    if(this.elapsed>=settings.spawnInterval){this.elapsed=0;if(this.sequence.length)this.spawnTarget()}
    for(const bullet of [...this.bullets]){
      advanceProjectile(bullet.view,{x:bullet.speed,y:0},dt);
      if(bullet.view.x>W+60){
        bullet.view.destroy();this.bullets.splice(this.bullets.indexOf(bullet),1);continue;
      }
      for(const target of [...this.targets]){
        if(insideTarget(bullet.view,{x:target.view.x,y:target.view.y,rx:target.rx,ry:target.ry})){
          this.impact(bullet,target);break;
        }
      }
    }
    for(const target of [...this.targets]){
      target.view.x-=target.speed*dt;
      if(target.view.x < -160){
        target.view.destroy();this.targets.splice(this.targets.indexOf(target),1);
      }
    }
  }
}
new Phaser.Game({
  type:Phaser.AUTO,parent:'arena',width:W,height:H,
  backgroundColor:'#151b36',
  render:{pixelArt:false,antialias:true},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},
  scene:[MechanicsPlayground]
});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>activeScene?.setMode(b.dataset.mode)));
document.querySelectorAll('[data-avatar]').forEach(b=>b.addEventListener('click',()=>activeScene?.setAvatar(b.dataset.avatar)));
document.querySelectorAll('[data-dir]').forEach(button=>{
  const name=button.dataset.dir;
  button.addEventListener('pointerdown',e=>{
    e.preventDefault();touch[name]=true;button.classList.add('pressed');
    button.setPointerCapture?.(e.pointerId);
  });
  const stop=e=>{e.preventDefault();touch[name]=false;button.classList.remove('pressed')};
  button.addEventListener('pointerup',stop);
  button.addEventListener('pointercancel',stop);
  button.addEventListener('lostpointercapture',()=>{touch[name]=false;button.classList.remove('pressed')});
});
window.addEventListener('blur',()=>{for(const key of Object.keys(touch))touch[key]=false});
$('speed').addEventListener('input',e=>{settings.speed=Number(e.target.value);profile.speed=settings.speed;$('speed-label').textContent=String(settings.speed)});
$('cadence').addEventListener('input',e=>{settings.cadence=Number(e.target.value);$('cadence-label').textContent=String(settings.cadence)});
$('reset').addEventListener('click',()=>activeScene?.setAvatar(avatarKind));

bindAnalogStick($('analog-stick'),v=>Object.assign(stick,v),{enabled:()=>!!activeScene,vertical:()=>avatarKind==='ship'});
$('tool-light').onclick=()=>commandLamp(toolProgress,toolConfig,'toggle');
for(const key of ['runMultiplier','jumpSpeed','gravity','crouchMultiplier'])$(key).oninput=e=>{profile[key]=Number(e.target.value);$(key+'-value').textContent=e.target.value};
for(const key of ['walk','run','jump','crouch'])$('cap-'+key).onchange=e=>{profile[key]=e.target.checked;activeScene?.controlsVisibility()};
function displayProfile(){settings.speed=profile.speed;for(const key of ['runMultiplier','jumpSpeed','gravity','crouchMultiplier']){$(key).value=profile[key];$(key+'-value').textContent=profile[key]}$('speed').value=profile.speed;$('speed-label').textContent=profile.speed;for(const key of ['walk','run','jump','crouch'])$('cap-'+key).checked=profile[key];activeScene?.controlsVisibility()}
$('preset-export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(parseMovement(profile),null,2)],{type:'application/json'}));a.download='sofia-movimiento.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('preset-import').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;profile=parseMovement(JSON.parse(await f.text()));displayProfile();$('preset-status').textContent='Preset aplicado al laboratorio.'}catch(e){$('preset-status').textContent=e.message}};
$('preset-default').onclick=()=>{profile=structuredClone(explorationProfile);displayProfile()};
displayProfile();

document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='l'&&!e.repeat&&!document.activeElement?.matches('input,textarea,select'))commandLamp(toolProgress,toolConfig,'toggle')});

for(const [key,label] of [['jump','Saltar'],['run','Correr'],['crouch','Agacharse']])document.querySelector('[data-dir='+key+']').innerHTML=controlIcon(key)+'<small>'+label+'</small>';
$('tool-light').innerHTML=controlIcon('flashlight')+'<small>Linterna</small>';

$('preset-save').onclick=()=>{try{localStorage.setItem('sofia-gameplay-movement-v1',JSON.stringify(parseMovement(profile)));$('preset-status').textContent='Preset guardado solo en el laboratorio.'}catch(e){$('preset-status').textContent=e.message}};
try{const saved=localStorage.getItem('sofia-gameplay-movement-v1');if(saved){profile=parseMovement(JSON.parse(saved));displayProfile()}}catch(e){$('preset-status').textContent='No se pudo recuperar el preset: '+e.message}
