import type Phaser from 'phaser';
// Reproyecta una ilustración existente en una sola textura, alineando su suelo con la geometría.
export function backgroundTexture(scene:Phaser.Scene,key:string,ground:number|undefined,width:number,height:number,floor:number){
 if(ground===undefined)return key;const id=key+'-floor-'+width+'-'+height+'-'+floor;
 if(scene.textures.exists(id))return id;const source=scene.textures.get(key).getSourceImage() as HTMLImageElement;
 const texture=scene.textures.createCanvas(id,width,height)!;const context=texture.context,split=ground/540*source.height;
 context.drawImage(source,0,0,source.width,split,0,0,width,floor);context.drawImage(source,0,split,source.width,source.height-split,0,floor,width,height-floor);texture.refresh();return id;
}
