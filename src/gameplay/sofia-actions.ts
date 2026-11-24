import type Phaser from 'phaser';
import type {Motion} from './locomotion';
export const SOFIA_ACTION_SOURCES={run:'assets/sofia-actions/run.png',crouch:'assets/sofia-actions/crouch.png',jump:'assets/sofia-actions/jump.png'};
export function preloadSofiaActions(scene:Phaser.Scene){for(const [id,src] of Object.entries(SOFIA_ACTION_SOURCES))if(!scene.textures.exists('action-sheet-'+id))scene.load.image('action-sheet-'+id,src)}
/** Split regular cells at runtime, maintaining one scale per sheet and a common feet pivot.
 * The source artwork stays untouched; this is the same texture preparation used for idle/walk. */
export function prepareSofiaActions(scene:Phaser.Scene){
 const reference={run:420,crouch:445,jump:397};
 for(const [id,height] of Object.entries(reference)){
  const image=scene.textures.get('action-sheet-'+id).getSourceImage() as HTMLImageElement,source=document.createElement('canvas');source.width=image.width;source.height=image.height;const context=source.getContext('2d')!;context.drawImage(image,0,0);const pixels=context.getImageData(0,0,image.width,image.height).data,cw=image.width/3,ch=image.height/2,scale=241/height;
  for(let i=0;i<6;i++){const key='sofia-'+id+'-'+i;if(scene.textures.exists(key))continue;const ox=i%3*cw,oy=Math.floor(i/3)*ch;let left=cw,top=ch,right=0,bottom=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[((oy+y)*image.width+ox+x)*4+3]>220){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}if(right<=left)throw Error('Fotograma vacío: '+key);
   const w=right-left+1,h=bottom-top+1,texture=scene.textures.createCanvas(key,280,314)!;texture.context.drawImage(image,ox+left,oy+top,w,h,(280-w*scale)/2,304-h*scale,w*scale,h*scale);texture.refresh();
  }
 }
 const create=(key:string,frames:string[],repeat=-1,frameRate=9)=>{if(!scene.anims.exists(key))scene.anims.create({key,frames:frames.map(key=>({key})),frameRate,repeat})};
 create('sofia-run',Array.from({length:6},(_,i)=>'sofia-run-'+i),-1,11);
 create('sofia-crouch',['sofia-crouch-3','sofia-crouch-4','sofia-crouch-5'],-1,4);
 create('sofia-rise',['sofia-jump-1','sofia-jump-2'],0,8);create('sofia-apex',['sofia-jump-3'],0);create('sofia-fall',['sofia-jump-4'],0);create('sofia-land',['sofia-jump-5'],0);
}
export function animateActor(hero:Phaser.GameObjects.Sprite,motion:Motion){const key='sofia-'+motion;if(hero.getData('actor-motion')!==motion){const previous=hero.getData('actor-motion');hero.setData('actor-motion',motion);hero.play(key);if(motion==='idle'&&['rise','apex','fall'].includes(previous)){hero.play('sofia-land');hero.once('animationcomplete',()=>{if(hero.getData('actor-motion')==='idle')hero.play('sofia-idle')})}}}
