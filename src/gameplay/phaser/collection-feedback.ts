import type Phaser from 'phaser';
let timer:ReturnType<typeof setTimeout>|undefined;
export function collectionFeedback(scene:Phaser.Scene&{views?:Map<string,Phaser.GameObjects.Image>;propViews?:{id:string;obj:any}[];player?:any},id:string,name:string,text:string){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const view=scene.views?.get(id)??scene.propViews?.find(v=>v.id===id&&(v.obj.type==='Image'||v.obj.type==='Sprite'))?.obj;
 if(view?.texture&&scene.player&&!reduced){const copy=scene.add.image(view.x,view.y,view.texture.key,view.frame?.name).setOrigin(view.originX,view.originY).setScale(view.scaleX,view.scaleY).setRotation(view.rotation).setDepth(100);scene.tweens.add({targets:copy,x:scene.player.x,y:scene.player.y-65,alpha:0,scaleX:copy.scaleX*.5,scaleY:copy.scaleY*.5,duration:420,ease:'Sine.easeOut',onComplete:()=>copy.destroy()})}
 let sounded=false;const sound=scene.sound as unknown as {context?:AudioContext;mute?:boolean;volume?:number};const audio=sound.context;
 if(audio&&!sound.mute&&(sound.volume??1)>0){const play=()=>{try{for(const [offset,hz] of [[0,659],[.08,880]]){const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+offset;osc.type='sine';osc.frequency.value=hz;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035*(sound.volume??1),at+.015);gain.gain.exponentialRampToValueAtTime(.001,at+.15);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.17)}sounded=true;scene.registry.set('last-pickup-sound',id)}catch{}};if(audio.state==='running')play();else void audio.resume().then(play).catch(()=>{})}
 scene.registry.set('last-pickup',{id,animated:!!view&&!reduced,sounded});
 let box=document.getElementById('pickup-notice');if(!box){box=document.createElement('div');box.id='pickup-notice';box.setAttribute('role','status');box.setAttribute('aria-live','polite');(document.getElementById('stage')??document.body).append(box)}
 box.replaceChildren();for(const content of [name,'Recogido · Disponible en Inventario']){const line=document.createElement('span');line.textContent=content;box.append(line)}box.title=text;box.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{box!.hidden=true},2800);
}
