import Phaser from 'phaser';
import {COMPANION_FRAMES} from './cast';
export function createCompanion(scene:Phaser.Scene,height=92){
 if(!scene.anims.exists('companion-idle'))scene.anims.create({key:'companion-idle',frames:[{key:COMPANION_FRAMES[0]}],frameRate:1,repeat:-1});
 if(!scene.anims.exists('companion-walk'))scene.anims.create({key:'companion-walk',frames:[{key:COMPANION_FRAMES[1]},{key:COMPANION_FRAMES[0]},{key:COMPANION_FRAMES[2]},{key:COMPANION_FRAMES[0]}],frameRate:8,repeat:-1});
 const sprite=scene.add.sprite(0,0,COMPANION_FRAMES[0]).setOrigin(.5,1).setDepth(21);
 sprite.setScale(height/sprite.height);sprite.play('companion-idle');return sprite;
}
