import type Phaser from 'phaser';
import type {LampSettings} from '../worlds/equipment';
const lampKey=(source:string)=>{let h=2166136261;for(const c of source)h=Math.imul(h^c.charCodeAt(0),16777619);return 'held-lamp-'+(h>>>0).toString(36)};
export function preloadHeldLamp(scene:Phaser.Scene,source='assets/sofia-lamp-handheld.png'){const key=lampKey(source);if(!scene.textures.exists(key))scene.load.image(key,source)}
// Local hand positions in normalized Sofia frames (feet at y=304, visible height=241).
export const LAMP_HANDS:Record<string,[number,number]>={'sofia-stable-0':[35,-74],'sofia-stable-2':[31,-76],'sofia-stable-3':[38,-69],'sofia-stable-4':[31,-70],'sofia-stable-5':[27,-76]};
/** Independent prop: Sofia's body, feet, scale and existing animations are never replaced. */
export function attachHeldLamp(scene:Phaser.Scene,hero:Phaser.GameObjects.Sprite,settings:()=>LampSettings|null,state:()=>{equipped:boolean;on:boolean},hidden:()=>boolean){
 const key=lampKey(settings()?.asset??'assets/sofia-lamp-handheld.png');if(!scene.textures.exists(key))return;
 const prop=scene.add.image(0,0,key).setOrigin(.12,.3),glow=scene.add.image(0,0,key).setOrigin(.12,.3).setBlendMode('ADD').setAlpha(.3);
 const update=()=>{const c=settings(),s=state(),visible=!!c&&s.equipped&&!hidden()&&hero.visible;prop.setVisible(visible);glow.setVisible(visible&&s.on);if(!visible||!c)return;
  const hand=LAMP_HANDS[hero.texture.key]??LAMP_HANDS['sofia-stable-0'],scale=hero.scaleY,dir=hero.flipX?-1:1,x=(hand[0]+c.handX-30)*scale*dir,y=(hand[1]+c.handY+68)*scale,angle=hero.rotation;
  prop.setOrigin(hero.flipX?.88:.12,.3);glow.setOrigin(hero.flipX?.88:.12,.3);
  prop.setPosition(hero.x+x*Math.cos(angle)-y*Math.sin(angle),hero.y+x*Math.sin(angle)+y*Math.cos(angle)).setRotation(angle).setFlipX(hero.flipX).setDisplaySize(c.size*scale,c.size*scale*prop.height/prop.width).setDepth(hero.depth+.1).setTint(s.on?0xffffff:0xb0a6a0);
  glow.copyPosition(prop).setRotation(angle).setFlipX(hero.flipX).setDisplaySize(prop.displayWidth,prop.displayHeight).setDepth(prop.depth+.01).setTint(parseInt(c.color.slice(1),16));
 };
 scene.events.on('postupdate',update);scene.events.once('shutdown',()=>scene.events.off('postupdate',update));return{prop,glow};
}
