import type Phaser from 'phaser';

// Imported spherical illustrations may have opaque corners; clip at render time, preserving the source.
export function planetTexture(scene:Phaser.Scene,key:string){
 const image=scene.textures.get(key).getSourceImage() as HTMLImageElement;
 const sample=document.createElement('canvas');sample.width=sample.height=1;
 const context=sample.getContext('2d')!;
 // Existing transparent paintings keep their silhouettes and protruding scenery.
 context.clearRect(0,0,1,1);context.drawImage(image,0,0,1,1,0,0,1,1);
 const [r,g,b,a]=context.getImageData(0,0,1,1).data;
 if(a<250||r+g+b>30)return key;
 const clipped=key+'-round';if(scene.textures.exists(clipped))return clipped;
 const texture=scene.textures.createCanvas(clipped,image.width,image.height)!;
 const c=texture.context;c.beginPath();c.ellipse(image.width/2,image.height/2,image.width/2,image.height/2,0,0,Math.PI*2);c.clip();c.drawImage(image,0,0);texture.refresh();return clipped;
}
