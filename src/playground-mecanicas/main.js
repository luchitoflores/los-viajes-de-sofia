import Phaser from 'phaser';
import {MODES,DEFAULT_SETTINGS,clamp,normalizedAxis,makeSequence,nextTarget,scoreImpact} from './core.js';

const W=960,H=540,$=id=>document.getElementById(id);
const touch={up:false,down:false,left:false,right:false,fire:false};
const settings={...DEFAULT_SETTINGS};
let activeScene=null,feedbackTimer=null,avatarKind='ship';
const ASSETS={
  ship:'polis-ship.png',sofia:'sofia_0.png',galaxy:'galaxy.jpg',cave:'plato-03_fuego_y_sombras.png',
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
  document.querySelector('.fire').textContent=modeId==='shadows'?'LUZ ✦':'PULSO ✦';
}
class MechanicsPlayground extends Phaser.Scene {
  constructor(){super('MechanicsPlayground')}
  preload(){
    for(const [key,file] of Object.entries(ASSETS))this.load.image(key,'./assets/'+file);
  }
  create(){
    this.keys=this.input.keyboard.addKeys({
      left:Phaser.Input.Keyboard.KeyCodes.LEFT,right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:Phaser.Input.Keyboard.KeyCodes.UP,down:Phaser.Input.Keyboard.KeyCodes.DOWN,
      a:Phaser.Input.Keyboard.KeyCodes.A,d:Phaser.Input.Keyboard.KeyCodes.D,
      w:Phaser.Input.Keyboard.KeyCodes.W,s:Phaser.Input.Keyboard.KeyCodes.S,
      fire:Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    this.input.keyboard.addCapture(['LEFT','RIGHT','UP','DOWN','SPACE']);
    this.targets=[];this.bullets=[];
    this.background=null;this.shade=null;this.elapsed=0;this.lastShot=-10000;
    this.glow=this.add.circle(160,H/2,56,0x67dff3,.18).setDepth(9);
    this.ship=this.add.image(160,H/2,'ship').setDisplaySize(113,105).setDepth(10);
    this.thruster=this.add.circle(103,H/2,15,0xffb067,.7).setDepth(8);
    this.floor=this.add.rectangle(W/2,H-40,W,80,0x304254,.95).setDepth(1).setVisible(false);
    this.floorEdge=this.add.rectangle(W/2,H-80,W,5,0xc6c5b0,.95).setDepth(2).setVisible(false);
    this.grounded=true;this.verticalVelocity=0;this.wasJump=false;
    this.tooltip=this.add.text(180,420,'Usa las flechas para mover la nave',{
      fontFamily:'system-ui',fontSize:'14px',color:'#f4f4ff',
      backgroundColor:'#10152cbb',padding:{x:11,y:7}
    }).setOrigin(.5).setDepth(19);
    this.tweens.add({targets:this.tooltip,alpha:0,delay:3500,duration:650});
    activeScene=this;
    this.setMode('fallacies');
    this.setAvatar('ship');
  }
  setAvatar(kind){
    if(kind!=='foot'&&kind!=='ship')return;
    avatarKind=kind;
    const foot=kind==='foot';
    this.ship.setTexture(foot?'sofia':'ship');
    this.ship.setOrigin(.5,foot?1:.5);
    this.ship.setDisplaySize(foot?79:113,foot?108:105);
    this.ship.setPosition(160,foot?H-80:H/2).setRotation(0).setFlipX(false);
    this.grounded=true;this.verticalVelocity=0;this.wasJump=false;
    this.glow.setVisible(!foot);this.thruster.setVisible(!foot);
    this.floor.setVisible(foot);this.floorEdge.setVisible(foot);
    document.querySelectorAll('[data-avatar]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.avatar===kind)));
    this.setMode(this.modeId);
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
    modeInfo(id);this.updateHud();
    $('learning-log').textContent=this.mode.instruction;
    $('feedback').classList.remove('show');clearTimeout(feedbackTimer);
  }
  updateHud(){$('points').textContent=String(this.score);$('hits').textContent=String(this.hits)}
  fire(){
    if(this.time.now-this.lastShot<settings.cadence)return;
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
    const x=Number(k.right.isDown||k.d.isDown||touch.right)-Number(k.left.isDown||k.a.isDown||touch.left);
    const y=Number(k.down.isDown||k.s.isDown||touch.down)-Number(k.up.isDown||k.w.isDown||touch.up);
    const direction=normalizedAxis(x,y);
    this.ship.x=clamp(this.ship.x+direction.x*dt*settings.speed,70,W*.53);
    if(avatarKind==='foot'){
      const jumpNow=direction.y<0;
      if(jumpNow&&!this.wasJump&&this.grounded){this.verticalVelocity=-490;this.grounded=false}
      this.wasJump=jumpNow;
      if(!this.grounded){
        this.ship.y+=this.verticalVelocity*dt;
        this.verticalVelocity+=1250*dt;
        if(this.ship.y>=H-80){this.ship.y=H-80;this.verticalVelocity=0;this.grounded=true}
      }
      this.ship.setAngle(0);
      if(direction.x!==0)this.ship.setFlipX(direction.x<0);
    }else{
      this.ship.y=clamp(this.ship.y+direction.y*dt*settings.speed,70,H-68);
      this.ship.setAngle(90+direction.y*8);
      this.glow.setPosition(this.ship.x,this.ship.y);
      this.thruster.setPosition(this.ship.x-54,this.ship.y+8);
    }
    if(k.fire.isDown||touch.fire)this.fire();
    this.elapsed+=delta;
    if(this.elapsed>=settings.spawnInterval){this.elapsed=0;this.spawnTarget()}
    for(const bullet of [...this.bullets]){
      bullet.view.x+=bullet.speed*dt;
      if(bullet.view.x>W+60){
        bullet.view.destroy();this.bullets.splice(this.bullets.indexOf(bullet),1);continue;
      }
      for(const target of [...this.targets]){
        if(Math.abs(bullet.view.x-target.view.x)<target.rx&&Math.abs(bullet.view.y-target.view.y)<target.ry){
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
$('speed').addEventListener('input',e=>{settings.speed=Number(e.target.value);$('speed-label').textContent=String(settings.speed)});
$('cadence').addEventListener('input',e=>{settings.cadence=Number(e.target.value);$('cadence-label').textContent=String(settings.cadence)});
$('reset').addEventListener('click',()=>activeScene?.setMode(activeScene.modeId));
