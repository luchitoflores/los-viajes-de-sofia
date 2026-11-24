import type Phaser from 'phaser';
import type {LampSettings} from '../equipment';
const lampKey=(source:string)=>{let h=2166136261;for(const c of source)h=Math.imul(h^c.charCodeAt(0),16777619);return 'held-lamp-'+(h>>>0).toString(36)};
export function preloadHeldLamp(scene:Phaser.Scene,source='assets/sofia-actions/flashlight.png'){const key=lampKey(source);if(!scene.textures.exists(key))scene.load.image(key,source)}
// Local hand positions in normalized Sofia frames (feet at y=304, visible height=241).
export const LAMP_HANDS:Record<string,[number,number]>={'sofia-stable-0':[35,-74],'sofia-stable-2':[31,-76],'sofia-stable-3':[38,-69],'sofia-stable-4':[31,-70],'sofia-stable-5':[27,-76]};
// Hand anchors for the generated action sheets, in the same normalized feet-space.
[[54,-108],[65,-100],[53,-107],[52,-87],[68,-103],[53,-82]].forEach((point,i)=>LAMP_HANDS['sofia-run-'+i]=point as [number,number]);
[[48,-67],[50,-68],[52,-70],[56,-71],[49,-72],[61,-72]].forEach((point,i)=>LAMP_HANDS['sofia-crouch-'+i]=point as [number,number]);
[[40,-70],[34,-107],[56,-96],[50,-81],[56,-90],[60,-47]].forEach((point,i)=>LAMP_HANDS['sofia-jump-'+i]=point as [number,number]);
/** Independent prop: Sofia's body, feet, scale and existing animations are never replaced. */
export function attachHeldLamp(scene:Phaser.Scene,hero:Phaser.GameObjects.Sprite,settings:()=>LampSettings|null,state:()=>{equipped:boolean;on:boolean},hidden:()=>boolean){
 const key=lampKey(settings()?.asset??'assets/sofia-actions/flashlight.png');if(!scene.textures.exists(key))return;
 const prop=scene.add.image(0,0,key).setOrigin(.12,.3),glow=scene.add.image(0,0,key).setOrigin(.12,.3).setBlendMode('ADD').setAlpha(.3);
 const update=()=>{const c=settings(),s=state(),visible=!!c&&s.equipped&&!hidden()&&hero.visible;prop.setVisible(visible);glow.setVisible(visible&&s.on);if(!visible||!c)return;
  const hand=LAMP_HANDS[hero.texture.key]??LAMP_HANDS['sofia-stable-0'],scale=hero.scaleY,dir=hero.flipX?-1:1,x=(hand[0]+c.handX-30)*scale*dir,y=(hand[1]+c.handY+68)*scale,angle=hero.rotation;
  const origin=c.asset.includes('flashlight')?.28:.12,originY=c.asset.includes('flashlight')?.55:.3;prop.setOrigin(hero.flipX?1-origin:origin,originY);glow.setOrigin(hero.flipX?1-origin:origin,originY);
  prop.setPosition(hero.x+x*Math.cos(angle)-y*Math.sin(angle),hero.y+x*Math.sin(angle)+y*Math.cos(angle)).setRotation(angle).setFlipX(hero.flipX).setDisplaySize(c.size*scale,c.size*scale*prop.height/prop.width).setDepth(hero.depth+.1).setTint(s.on?0xffffff:0xb0a6a0);
  glow.copyPosition(prop).setRotation(angle).setFlipX(hero.flipX).setDisplaySize(prop.displayWidth,prop.displayHeight).setDepth(prop.depth+.01).setTint(parseInt(c.color.slice(1),16));
 };
 scene.events.on('postupdate',update);scene.events.once('shutdown',()=>scene.events.off('postupdate',update));return{prop,glow};
}
