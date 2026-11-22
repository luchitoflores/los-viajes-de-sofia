import type Phaser from 'phaser';
export const SOFIA_HEIGHT=118;
export const SOFIA_SCALE=SOFIA_HEIGHT/241;
// Recortes de los originales: igualar la figura visible evita el cambio de altura entre poses.
export const SOFIA_CROPS=[[33,70,135,224],[53,93,124,202],[39,84,138,210],[47,64,140,228],[40,79,143,221],[51,95,131,206]] as const;
export function prepareSofia(scene:Phaser.Scene){
 SOFIA_CROPS.forEach(([x,y,w,h],i)=>{const key=`sofia-stable-${i}`;if(scene.textures.exists(key))return;const texture=scene.textures.createCanvas(key,280,314)!;const width=w*241/h;texture.context.drawImage(scene.textures.get(`sofia_${i}.png`).getSourceImage() as HTMLImageElement,x,y,w,h,(280-width)/2,63,width,241);texture.refresh()});
 if(!scene.anims.exists('sofia-idle'))scene.anims.create({key:'sofia-idle',frames:[{key:'sofia-stable-0'}],frameRate:1,repeat:-1});
 if(!scene.anims.exists('sofia-walk'))scene.anims.create({key:'sofia-walk',frames:[2,3,4,5].map(i=>({key:`sofia-stable-${i}`})),frameRate:7,repeat:-1});
}
