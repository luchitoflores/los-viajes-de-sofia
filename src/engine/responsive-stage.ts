import Phaser from 'phaser';

/** Fill landscape proportionally; portrait remains playable without orientation lock.
 * Expand camera bounds by the clipped canvas margin so the hero can stay visible
 * on high/low landings without changing authored geometry or character scale. */
export function bindResponsiveStage(game:Phaser.Game){
 const bounds=new WeakMap<Phaser.Cameras.Scene2D.Camera,{x:number;y:number;width:number;height:number;dx:number;dy:number}>();
 let previous='';
 const update=()=>{
  const stage=document.getElementById('stage');if(!stage)return;
  const rect=stage.getBoundingClientRect(),landscape=rect.width>=rect.height&&!document.body.classList.contains('core-mode');
  const mode=landscape?Phaser.Scale.ENVELOP:Phaser.Scale.FIT;
  const key=[rect.width,rect.height,game.scale.width,game.scale.height,mode].join(':');
  if(key!==previous){previous=key;game.scale.scaleMode=mode;game.scale.refresh()}
  const canvas=game.canvas.getBoundingClientRect();
  const dx=landscape?Math.max(0,(canvas.width-rect.width)/2)*game.scale.width/canvas.width:0;
  const dy=landscape?Math.max(0,(canvas.height-rect.height)/2)*game.scale.height/canvas.height:0;
  for(const scene of game.scene.getScenes(true)){
   if(scene.sys.settings.key!=='World')continue;const camera=scene.cameras.main;if(!camera.useBounds)continue;
   let original=bounds.get(camera);if(!original){original={...camera.getBounds(),dx:-1,dy:-1};bounds.set(camera,original)}
   if(original.dx===dx&&original.dy===dy)continue;original.dx=dx;original.dy=dy;
   camera.setBounds(original.x-dx,original.y-dy,original.width+2*dx,original.height+2*dy);
  }
 };
 game.events.on('poststep',update);game.events.once('destroy',()=>game.events.off('poststep',update));
}
