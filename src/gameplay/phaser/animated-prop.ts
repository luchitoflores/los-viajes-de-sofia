import type Phaser from 'phaser';
import type {Asset} from '../../worlds/schema';
/** Regular image sheets remain assets; appearances choose the art independently of identity. */
export function animatedProp(scene:Phaser.Scene,x:number,y:number,art:Asset&{file:string}){
 const a=art.animation;
 if(!a)return scene.add.image(x,y,art.file).setOrigin(.5,1).setDisplaySize(art.width,art.height);
 const texture=scene.textures.get(art.file),source=texture.getSourceImage() as HTMLImageElement;
 const width=source.width/a.columns,height=source.height/a.rows,key=art.file+'-idle-'+JSON.stringify(a);
 for(let i=0;i<a.frames;i++)if(!texture.has('cell-'+i))texture.add('cell-'+i,0,i%a.columns*width,Math.floor(i/a.columns)*height,width,height);
 if(scene.anims.exists(key)&&scene.anims.get(key).frames[0]?.frame.texture!==texture)scene.anims.remove(key);
 if(!scene.anims.exists(key))scene.anims.create({key,frames:Array.from({length:a.frames},(_,i)=>({key:art.file,frame:'cell-'+i})),frameRate:a.frameRate,repeat:-1});
 const sprite=scene.add.sprite(x,y,art.file,'cell-0').setOrigin(.5,a.anchorY).setDisplaySize(art.width,art.height).setData('idle-animation',key);
 return window.matchMedia('(prefers-reduced-motion: reduce)').matches?sprite:sprite.play(key);
}
