import {PlanetIntroduction,showPlanetViewHint,type PlanetIntroductionSettings} from './engine/planet-introduction';
import {ObjectHints} from './engine/object-hints';
import {planetTexture} from './engine/planet-texture';
import {PLAY_MODE,profileKey,selectMode,modeName,canWriteProgress} from './engine/play-session';
import {facingFlip,radialDifference} from './facing';
import {ensureShip} from './worlds/spaceport';
import {setEditorChoices} from './editor-controls';
import {prepareSofia,SOFIA_SCALE,SOFIA_HEIGHT} from './sofia';
import {toward} from './navigation';
import Phaser from 'phaser';
import {ART,KINDS,RADIUS,angleDiff,object,parseLayout,parseSave,project,radians,stepBody,surfacePoint,validObjects,type Body,type Interior,type Kind,type PlanetObject,type PlanetSave} from './planet-model';
const KEY=profileKey('sofia-polis-radial-v1');
let stored:string|null=null;try{stored=localStorage.getItem(KEY)}catch{}
export const planetState:PlanetSave=parseSave(stored);
export interface ResourceArt {file:string;width:number;height:number;src?:string}
export interface PlanetContext {introduction?:{settings:PlanetIntroductionSettings;seen:()=>boolean;complete:()=>void};terrainScale?:number;viewport?:{width:number;height:number};id:string;state:PlanetSave;terrain:string;sources:{key:string;url:string}[];separateObjects:boolean;art:(item:PlanetObject)=>ResourceArt;palette:{characterId?:string;id:string;kind:Kind;label:string;art:ResourceArt}[];save:(state:PlanetSave)=>void;edited:(objects:PlanetObject[])=>void;properties:(item:PlanetObject)=>void;exportWorld:()=>void;validateObjects:(objects:PlanetObject[])=>void}
export interface PlanetBridge {legacyTerrainArt?:()=>ResourceArt|undefined;legacyHostArt?:()=>ResourceArt|undefined;board:(item:PlanetObject)=>void;exportResources?:(objects:PlanetObject[])=>Record<string,unknown>;resources?:()=>{id:string;kind:Kind;label:string;art:ResourceArt}[];resource?:(id:string)=>ResourceArt|undefined;context?:()=>PlanetContext|undefined;dispatch?:(item:PlanetObject)=>boolean;activate:(scene:Phaser.Scene)=>void;blocked:()=>boolean;editing:()=>boolean;axis:()=>number;mode:()=>string;note:(message:string)=>void;talk:()=>void;collect:(item:PlanetObject)=>void;enter:(place:Interior)=>void;galaxy:()=>void}
const element=(id:string)=>document.getElementById(id)!;
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function createPlanetScene(host:PlanetBridge){
 return class PlanetScene extends Phaser.Scene {
  private currentContext:PlanetContext|undefined;
  private get state(){return this.currentContext?.state??planetState}
  private art(item:PlanetObject){return this.currentContext?.art(item)??(item.id==='philosopher'?host.legacyHostArt?.():undefined)??(item.asset?host.resource?.(item.asset):undefined)??ART[item.kind]}
  init(){this.currentContext=host.context?.();ensureShip(this.state.objects,-17)}
  bodyState:Body={angle:this.state.angle,height:0,velocity:0,grounded:true};
  player!:Phaser.GameObjects.Sprite;private hints:ObjectHints|null=null;
  
  objects:PlanetObject[]=this.state.objects;
  views=new Map<string,Phaser.GameObjects.Image>();
  hotspots=new Map<string,Phaser.GameObjects.Zone>();private scenery:Phaser.GameObjects.RenderTexture|null=null;
  private destination:number|null=null;private pending:PlanetObject|null=null;private stalled=0;
  cursors!:Phaser.Types.Input.Keyboard.CursorKeys;
  private introduction:PlanetIntroduction|null=null;private removeViewHint:(()=>void)|undefined;
  cinematic=false;
  overview=false;private cameraAngle=0;private center=new Phaser.Math.Vector2();private lastSave=0;
  private selected:string|null=null;private undo:PlanetObject[][]=[];private outline!:Phaser.GameObjects.Graphics;private wasEditing=false;private dragKind:string|null=null;private ghost:Phaser.GameObjects.Image|null=null;
  constructor(){super('Planet')}
  preload(){const terrain=host.legacyTerrainArt?.();if(terrain&&!this.textures.exists(terrain.file))this.load.image(terrain.file,terrain.src??'assets/'+terrain.file);const mentor=host.legacyHostArt?.();if(mentor&&!this.textures.exists(mentor.file))this.load.image(mentor.file,mentor.src??'assets/'+mentor.file);for(const item of this.state.objects){const a=item.asset?host.resource?.(item.asset):undefined;if(a&&!this.textures.exists(a.file))this.load.image(a.file,a.src!)}const files=['av_sofia.png','planet-terrain.png','galaxy.jpg',...Object.values(ART).map(a=>a.file),...Array.from({length:8},(_,i)=>`sofia_${i}.png`)];for(const file of new Set(files))if(!this.textures.exists(file))this.load.image(file,'assets/'+file);for(const source of this.currentContext?.sources??[])if(!this.textures.exists(source.key))this.load.image(source.key,source.url)}
  create(){
   const view=this.currentContext?.viewport??{width:960,height:540};this.scale.setGameSize(view.width,view.height);this.cameras.main.setViewport(0,0,view.width,view.height);
   this.cinematic=false;this.objects=this.state.objects;
   const anchor=this.state.returnAnchor;this.bodyState={angle:anchor?.angle??this.state.angle,height:anchor?.height??0,velocity:0,grounded:true};this.state.returnAnchor=null;
   this.views.clear();this.hotspots.clear();this.scenery=null;this.cancelWalk();this.selected=null;this.undo=[];this.wasEditing=false;
   this.add.image(0,0,'galaxy.jpg').setDisplaySize(5000,2500).setDepth(-100);
   this.add.image(0,0,planetTexture(this,this.currentContext?.terrain??host.legacyTerrainArt?.()?.file??'planet-terrain.png')).setDisplaySize((RADIUS+6)*2*(this.currentContext?.terrainScale??1),(RADIUS+6)*2*(this.currentContext?.terrainScale??1)).setDepth(-50);
   this.outline=this.add.graphics().setDepth(80);
   this.renderObjects();
   prepareSofia(this);
   this.player=this.add.sprite(0,0,'sofia-stable-0').setOrigin(.5,304/314).setScale(SOFIA_SCALE).setDepth(30);this.player.play('sofia-idle');
   this.cursors=this.input.keyboard!.createCursorKeys();this.cameraAngle=-this.bodyState.angle;
   this.center.set(...this.cameraTarget());this.cameras.main.setZoom(1).setRotation(this.cameraAngle).centerOn(this.center.x,this.center.y);
   this.input.on('gameobjectdown',(_p:Phaser.Input.Pointer,view:Phaser.GameObjects.Image)=>{if(!host.editing())return;const id=view.getData('planetId') as string;if(id){this.selected=id;this.showProps();this.drawSelection()}});
   this.input.on('dragstart',()=>{if(host.editing())this.snapshot()});
   this.input.on('drag',(pointer:Phaser.Input.Pointer,view:Phaser.GameObjects.Image)=>{if(!host.editing())return;const item=this.objects.find(o=>o.id===view.getData('planetId'));if(!item)return;const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);const placement=project(point.x,point.y);item.angleDeg=placement.angleDeg;this.positionView(item,view);this.drawSelection()});
   this.input.on('dragend',()=>{if(host.editing()){this.saveEdit();this.showProps()}});
   this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{if(host.editing()&&host.mode()==='object'){const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);this.placeToken((element('object-kind') as HTMLSelectElement).value,point.x,point.y)}});
   this.hints=new ObjectHints(this,()=>!host.editing()&&!host.blocked(),'planetId',id=>this.objects.find(o=>o.id===id) as PlanetObject&{tooltip?:string});
   this.input.on('pointerup',(pointer:Phaser.Input.Pointer,over:Phaser.GameObjects.GameObject[])=>this.tap(pointer,over));
   this.input.on('wheel',(_pointer:Phaser.Input.Pointer,_over:unknown,_dx:number,dy:number)=>{if(!this.cinematic&&!host.blocked()){this.introduction?.finish();this.overview=dy>0}});
   const zoom=element('planet-view');zoom.hidden=false;zoom.onclick=()=>this.toggleOverview();
   this.events.once('shutdown',()=>{this.introduction=null;this.removeViewHint?.();this.persist();zoom.hidden=true;element('planet-palette')?.remove();this.ghost?.destroy();this.ghost=null;this.dragKind=null;});
   const persistOnExit=()=>this.persist();window.addEventListener('pagehide',persistOnExit);this.events.once('shutdown',()=>window.removeEventListener('pagehide',persistOnExit));
   host.activate(this);this.drawEditor();this.persist();
  }
  presentIntroduction(){
   const intro=this.currentContext?.introduction;
   if(!intro||intro.seen()||this.introduction||!canWriteProgress()||host.editing()||host.blocked())return;
   this.cancelWalk();this.input.keyboard?.resetKeys();this.overview=false;const feet=surfacePoint(this.bodyState.angle,this.bodyState.height);this.player.setPosition(feet.x,feet.y).setRotation(this.bodyState.angle);
   const near=surfacePoint(this.bodyState.angle,90),farZoom=Math.min(this.cameras.main.width,this.cameras.main.height)/(2*(RADIUS+235));
   this.introduction=new PlanetIntroduction(intro.settings,t=>{
    this.center.set(near.x*t,near.y*t);this.cameraAngle=-this.bodyState.angle*t;
    this.cameras.main.setZoom(Phaser.Math.Linear(farZoom,1,t)).setRotation(this.cameraAngle).centerOn(this.center.x,this.center.y);
   },()=>{intro.complete();this.introduction=null;this.input.keyboard?.resetKeys();this.removeViewHint?.();this.removeViewHint=showPlanetViewHint(element('planet-view'))},window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  private cameraTarget():[number,number]{if(this.overview||host.editing())return[0,0];const p=surfacePoint(this.bodyState.angle,90);return[p.x,p.y]}
  private positionView(item:PlanetObject,view:Phaser.GameObjects.Image){const p=surfacePoint(radians(item.angleDeg),item.height),art=this.art(item);const height=item.kind==='philosopher'?SOFIA_HEIGHT:art.height;const width=item.kind==='philosopher'?height*view.texture.getSourceImage().width/view.texture.getSourceImage().height:art.width;view.setPosition(p.x,p.y).setRotation(radians(item.angleDeg+item.rotation)).setOrigin(.5,1).setDisplaySize(width*item.scale,height*item.scale).setFlipX(item.flip).setAlpha(item.integrated&&host.editing()?.25:1).setVisible(!this.state.collected.includes(item.id)||host.editing());}
  private renderObjects(){
   for(const view of this.views.values())view.destroy();for(const zone of this.hotspots.values())zone.destroy();this.views.clear();this.hotspots.clear();
   for(const item of this.objects){
    const view=this.add.image(0,0,this.art(item).file).setDepth(item.kind==='philosopher'?8:3);view.setData('planetId',item.id);view.setInteractive({useHandCursor:true});this.input.setDraggable(view);this.positionView(item,view);this.views.set(item.id,view);
    const zone=this.add.zone(view.x,view.y,Math.max(48,(item.hitWidth??this.art(item).width)*item.scale),Math.max(48,(item.hitHeight??this.art(item).height)*item.scale)).setOrigin(.5,1).setRotation(view.rotation).setDepth(item.kind==='philosopher'?9:4).setData('planetId',item.id).setInteractive({useHandCursor:true});this.hotspots.set(item.id,zone);
   }this.refreshScenery();
  }
  private refreshScenery(){
   this.scenery?.destroy();const extent=Math.ceil(Math.max(RADIUS+30,...this.objects.map(o=>RADIUS+o.height+Math.max(this.art(o).height,this.art(o).width)*o.scale+40)));
   this.scenery=this.add.renderTexture(-extent,-extent,extent*2,extent*2).setOrigin(0).setDepth(3);this.scenery.beginDraw();
   for(const item of this.objects){const view=this.views.get(item.id)!;const collected=this.state.collected.includes(item.id);this.positionView(item,view);if(!item.integrated&&!this.currentContext?.separateObjects&&item.kind!=='philosopher'&&item.kind!=='ship'&&!collected){view.setVisible(true);this.scenery.batchDraw(view,view.x+extent,view.y+extent)}view.setVisible((host.editing()||(!item.integrated&&(this.currentContext?.separateObjects||item.kind==='philosopher'||item.kind==='ship')))&&(!collected||host.editing()));const zone=this.hotspots.get(item.id);zone?.setPosition(view.x,view.y).setRotation(view.rotation).setSize(Math.max(48,(item.hitWidth??this.art(item).width)*item.scale),Math.max(48,(item.hitHeight??this.art(item).height)*item.scale)).setVisible(!host.editing()&&!collected);if(zone?.input)zone.input.hitArea.setTo(0,0,zone.width,zone.height)}
   this.scenery.endDraw();this.scenery.setVisible(!host.editing()&&!this.currentContext?.separateObjects);
  }
  cancelWalk(){this.destination=null;this.pending=null;this.stalled=0}
  private tap(pointer:Phaser.Input.Pointer,over:Phaser.GameObjects.GameObject[]){
   if(pointer.downElement!==this.game.canvas||pointer.upElement!==this.game.canvas)return;
   if(this.introduction||this.hints?.consume()||host.blocked()||host.editing()||pointer.button>0)return;
   const item=over.map(v=>this.objects.find(o=>o.id===v.getData('planetId'))).find(o=>o&&(o.interaction!=='none'||(this.currentContext&&!!o.behavior))&&!this.state.collected.includes(o.id));
   const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y),angle=item?radians(item.angleDeg):Math.atan2(point.x,-point.y);
   if(!item&&Math.hypot(point.x,point.y)<RADIUS*.25)return;
   this.destination=this.bodyState.angle+angleDiff(angle,this.bodyState.angle);this.pending=item??null;this.stalled=0;
  }
  update(time:number,delta:number){
   if(this.cinematic)return;
   if(this.introduction){if(!host.blocked()&&!host.editing())this.introduction.step(delta);return;}
   const blocked=host.blocked(),edit=host.editing();if(!edit)this.faceNearbyCharacters();
   if(edit!==this.wasEditing)this.drawEditor();
   const manual=host.axis()||(Number(this.cursors.right.isDown)-Number(this.cursors.left.isDown));if(manual||blocked||edit)this.cancelWalk();
   if(this.pending&&this.isNear(this.pending)){const item=this.pending;this.cancelWalk();this.interactWith(item);return}
   const axis=blocked||edit?0:manual||(this.destination===null?0:toward(this.bodyState.angle,this.destination,200/RADIUS,delta/1000,3/RADIUS));
   if(!axis&&this.destination!==null)this.cancelWalk();const before=this.bodyState.angle;
   if(!blocked&&!edit)stepBody(this.bodyState,axis,Math.min(delta/1000,.05),this.objects.filter(o=>!this.state.collected.includes(o.id)));
   if(axis&&Math.abs(this.bodyState.angle-before)<.00001){this.stalled+=delta;if(this.stalled>1200){this.cancelWalk();host.note('El paso está cerrado. Prueba otro camino.')}}else this.stalled=0;
   const p=surfacePoint(this.bodyState.angle,this.bodyState.height);this.player.setPosition(p.x,p.y).setRotation(this.bodyState.angle);if(axis)this.player.setFlipX(axis<0);this.player.play(axis?'sofia-walk':'sofia-idle',true);
   const alpha=1-Math.exp(-delta/140),target=this.cameraTarget(),camera=this.cameras.main;
   this.center.x=Phaser.Math.Linear(this.center.x,target[0],alpha);this.center.y=Phaser.Math.Linear(this.center.y,target[1],alpha);
   const targetAngle=this.overview||edit?0:-this.bodyState.angle;this.cameraAngle+=angleDiff(targetAngle,this.cameraAngle)*alpha;
   const zoom=this.overview||edit?Math.min(camera.width,camera.height)/(2*(RADIUS+235)):1;
   camera.setRotation(this.cameraAngle).setZoom(Phaser.Math.Linear(camera.zoom,zoom,alpha)).centerOn(this.center.x,this.center.y);
   element('near-hint').hidden=true;
   if(time-this.lastSave>1200&&!blocked&&!edit){this.persist();this.lastSave=time}
  }
  selectForEdit(id:string){if(this.objects.some(o=>o.id===id)){this.selected=id;this.showProps();this.drawSelection()}}
  speakingCharacter:string|undefined;
  conversationTargets(){return this.objects.filter(o=>o.kind==='philosopher'&&!this.state.collected.includes(o.id)).flatMap(o=>{const view=this.views.get(o.id);return view?[{id:o.id,characterId:o.characterId,name:o.label,view}]:[]})}
  approachCharacter(id:string){if(host.blocked()||host.editing())return;const item=this.objects.find(o=>o.id===id);if(item){this.destination=this.bodyState.angle+angleDiff(radians(item.angleDeg),this.bodyState.angle);this.pending=item;this.stalled=0}}
  faceCharacter(id:string){this.speakingCharacter=id;const o=this.objects.find(o=>o.characterId===id||o.id===id||(!this.currentContext&&o.kind==='philosopher'));if(!o)return;this.speakingCharacter=o.id;const v=this.views.get(o.id);if(!v)return;v.setFlipX(facingFlip(radialDifference(this.player,v,v.rotation),v.flipX));this.player.setFlipX(facingFlip(radialDifference(v,this.player,this.player.rotation),this.player.flipX))}
  private faceNearbyCharacters(){for(const o of this.objects.filter(o=>o.kind==='philosopher')){const v=this.views.get(o.id);if(v&&Phaser.Math.Distance.Between(this.player.x,this.player.y,v.x,v.y)<350)v.setFlipX(facingFlip(radialDifference(this.player,v,v.rotation),v.flipX))}}
  toggleOverview(){this.introduction?.finish();this.overview=!this.overview;element('planet-view').setAttribute('aria-pressed',String(this.overview))}
  private isNear(item:PlanetObject){return Math.abs(angleDiff(this.bodyState.angle,radians(item.angleDeg)))*RADIUS<95&&Math.abs(this.bodyState.height-item.height)<90&&!this.state.collected.includes(item.id)}
  closest(){return this.objects.filter(o=>(o.interaction!=='none'||(this.currentContext&&!!o.behavior))&&this.isNear(o)).sort((a,b)=>Math.abs(angleDiff(this.bodyState.angle,radians(a.angleDeg)))-Math.abs(angleDiff(this.bodyState.angle,radians(b.angleDeg))))[0]??null}
  interact(){if(this.introduction||host.blocked()||host.editing())return;const item=this.closest();if(item)this.interactWith(item);else host.note('Acércate a una persona, un objeto o una entrada.')}
  interactWith(item:PlanetObject){
   if(host.blocked()||host.editing()||!this.isNear(item))return;if(item.kind==='philosopher')this.faceCharacter(item.id);
   if(!this.state.discovered.includes(item.id))this.state.discovered.push(item.id);
   if(item.kind==='ship'&&item.interaction==='ship'){host.board(item);this.persist();return}
   if(host.dispatch?.(item)){this.refreshScenery();this.persist();return}
   if(item.interaction==='collect'){this.state.collected.push(item.id);this.refreshScenery();host.collect(item)}
   else if(item.interaction==='talk')host.talk();
   else if(item.interaction==='door'){this.state.returnAnchor={id:item.id,angle:this.bodyState.angle,height:this.bodyState.height};this.persist();host.enter(item.to)}
   else if(item.interaction==='ship')host.galaxy();
   this.persist();
  }
  private persist(){if(!canWriteProgress())return;this.state.angle=this.bodyState.angle;this.state.objects=this.objects;try{if(this.currentContext)this.currentContext.save(this.state);else localStorage.setItem(KEY,JSON.stringify(this.state))}catch{host.note('No se pudo guardar. Exporta el planeta antes de cerrar.')}}
  snapshot(){this.undo.push(structuredClone(this.objects));if(this.undo.length>30)this.undo.shift()}
  saveEdit(){this.state.objects=this.objects;this.currentContext?.edited(this.objects);this.persist()}
  undoEdit(){const previous=this.undo.pop();if(!previous){host.note('No hay cambios para deshacer.');return}this.objects=previous;this.selected=null;this.saveEdit();this.renderObjects();this.showProps();this.drawSelection()}
  redrawProps(){this.renderObjects();this.drawSelection()}
  deleteSelected(){if(!this.selected)return;this.snapshot();this.objects=this.objects.filter(o=>o.id!==this.selected);this.selected=null;this.saveEdit();this.renderObjects();this.showProps();this.drawSelection()}
  exportEdit(){this.saveEdit();if(this.currentContext){this.currentContext.exportWorld();return}const data={format:'sofia-radial-planet',version:1,radius:RADIUS,objects:this.objects,resources:host.exportResources?.(this.objects)};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='sofia-planeta-polis.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  importEdit(data:unknown){const objects=parseLayout(data);this.currentContext?.validateObjects(objects);this.snapshot();this.objects=objects;this.selected=null;this.saveEdit();this.renderObjects();this.showProps();this.drawSelection();host.note('Planeta importado y guardado.')}
  drawEditor(){element('editor').dataset.selectedObject=this.selected??'';
   const edit=host.editing();this.wasEditing=edit;this.player?.setAlpha(edit?0.45:1);this.outline?.clear();
   const zoneButton=document.querySelector('[data-tool="zone"]') as HTMLElement;zoneButton.hidden=edit;
   const zoneLabel=element('zone-kind').closest('label') as HTMLElement;zoneLabel.hidden=edit;
   if(edit){
    setEditorChoices(element('object-kind') as HTMLSelectElement,this.currentContext?this.currentContext.palette.map(a=>({value:'characterId' in a&&a.characterId?'character:'+a.characterId:'asset:'+a.id,label:a.label})):[...KINDS.map(k=>({value:k,label:object(k,0).label})),...(host.resources?.()??[]).map(a=>({value:'characterId' in a&&a.characterId?'character:'+a.characterId:'asset:'+a.id,label:a.label}))]);
    element('edit-help').textContent='Arrastra un recurso de la biblioteca al borde del planeta. Para moverlo, arrástralo sobre la superficie. Ángulo en grados, altura radial y giro local se ajustan abajo.';
    this.buildPalette();this.showProps();this.drawSelection();
   }else{element('planet-palette')?.remove();this.ghost?.destroy();this.ghost=null;}
   this.cancelWalk();this.refreshScenery();
  }
  private drawSelection(){if(!this.outline)return;this.outline.clear();if(!host.editing())return;this.outline.lineStyle(1,0xeac986,.45).strokeCircle(0,0,RADIUS);const item=this.objects.find(o=>o.id===this.selected);if(item){const p=surfacePoint(radians(item.angleDeg),item.height);const art=this.art(item),width=Math.max(48,(item.hitWidth??art.width)*item.scale),height=Math.max(48,(item.hitHeight??art.height)*item.scale),a=radians(item.angleDeg+item.rotation),points=[[-width/2,-height],[width/2,-height],[width/2,0],[-width/2,0]].map(([x,y])=>({x:p.x+x*Math.cos(a)-y*Math.sin(a),y:p.y+x*Math.sin(a)+y*Math.cos(a)}));this.outline.lineStyle(2,0x99ebe3,1).strokePoints(points,true).strokeCircle(p.x,p.y,8)}}
  private canvasPoint(clientX:number,clientY:number){const rect=this.game.canvas.getBoundingClientRect();return{x:(clientX-rect.left)/rect.width*this.scale.width,y:(clientY-rect.top)/rect.height*this.scale.height,inside:clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom}}
  private buildPalette(){
   element('planet-palette')?.remove();const palette=document.createElement('div');palette.id='planet-palette';
   const entries=this.currentContext?.palette??[...KINDS.map(kind=>({id:kind,kind,label:object(kind,0).label,art:ART[kind] as ResourceArt})),...(host.resources?.()??[])];
   for(const entry of entries){const {kind,art}=entry,token='characterId' in entry&&entry.characterId?'character:'+entry.characterId:this.currentContext||entry.id!==kind?'asset:'+entry.id:kind;const button=document.createElement('button');button.type='button';button.title=entry.label;button.setAttribute('aria-label','Arrastrar '+entry.label);button.dataset.kind=kind;button.dataset.asset=entry.id;const img=document.createElement('img');img.src=art.src??'assets/'+art.file;img.alt='';button.append(img);const label=document.createElement('span');label.textContent=entry.label;button.append(label);
    button.onpointerdown=e=>{e.preventDefault();this.dragKind=token;button.setPointerCapture(e.pointerId);this.ghost?.destroy();this.ghost=this.add.image(0,0,art.file).setOrigin(.5,1).setDisplaySize(art.width,art.height).setAlpha(.5).setDepth(90).setVisible(false)};
    button.onpointermove=e=>{if(this.dragKind!==token||!this.ghost)return;const p=this.canvasPoint(e.clientX,e.clientY),point=this.cameras.main.getWorldPoint(p.x,p.y),projection=project(point.x,point.y),base=surfacePoint(radians(projection.angleDeg));this.ghost.setPosition(base.x,base.y).setRotation(radians(projection.angleDeg)).setVisible(p.inside&&Math.abs(projection.height)<230)};
    button.onpointerup=e=>{if(this.dragKind!==token)return;const p=this.canvasPoint(e.clientX,e.clientY);this.ghost?.destroy();this.ghost=null;this.dragKind=null;if(p.inside){const world=this.cameras.main.getWorldPoint(p.x,p.y);this.placeToken(token,world.x,world.y)}};
    button.onpointercancel=()=>{this.ghost?.destroy();this.ghost=null;this.dragKind=null};palette.append(button);
   }element('edit-help').after(palette);
  }
  private placeToken(token:string,x:number,y:number){const asset=(this.currentContext?.palette??host.resources?.()??[]).find(a=>(('characterId' in a&&a.characterId)?'character:'+a.characterId:'asset:'+a.id)===token);if(asset)this.placeObject(asset.kind,x,y,asset.id,'characterId' in asset?asset.characterId as string:undefined);else if(KINDS.includes(token as Kind))this.placeObject(token as Kind,x,y)}
  placeObject(kind:Kind,x:number,y:number,asset?:string,characterId?:string){if(!host.editing()||!KINDS.includes(kind))return;if(this.objects.length>=200){host.note('El planeta admite hasta 200 objetos. Elimina uno antes de añadir otro.');return}const p=project(x,y);if(Math.abs(p.height)>230){host.note('Suelta el objeto cerca de la superficie circular.');return}this.snapshot();const item=object(kind,p.angleDeg,'object-'+crypto.randomUUID());if(asset){item.asset=asset;item.label=(this.currentContext?.palette??host.resources?.()??[]).find(a=>a.id===asset)?.label??asset;item.interaction='none'}if(characterId){item.characterId=characterId;item.instanceId=item.id;item.label=this.currentContext?.palette.find(a=>a.characterId===characterId)?.label.slice(0,140)??item.label}const name=(element('object-name') as HTMLInputElement).value.trim();if(name)item.label=name;this.objects.push(item);this.selected=item.id;this.saveEdit();this.renderObjects();this.showProps();this.drawSelection()}
  showProps(){
   const item=this.objects.find(o=>o.id===this.selected);if(!item){element('properties').innerHTML='<small>Selecciona un objeto o arrastra uno desde la biblioteca.</small>';return}
   element('properties').innerHTML=`<b>${escape(item.label)}</b><div class="propgrid">${(['angleDeg','height','scale','rotation','collisionWidth','collisionHeight','hitWidth','hitHeight'] as const).map((key,i)=>`<label>${['Ángulo (°)','Altura radial','Tamaño','Giro local (°)','Colisión: ancho','Colisión: alto','Zona: ancho','Zona: alto'][i]}<input id="radial-${key}" type="number" step="${key==='scale'?'.05':'1'}" value="${item[key]??(key==='hitWidth'?this.art(item).width:this.art(item).height)}"></label>`).join('')}<label class="wide">Nombre<input id="radial-label" maxlength="140" value="${escape(item.label)}"></label><label class="wide">Interacción<select id="radial-interaction">${['none','talk','collect','door','ship'].map((v,i)=>`<option value="${v}" ${v===item.interaction?'selected':''}>${['Decoración','Conversación','Coleccionable','Entrar','Galaxia'][i]}</option>`).join('')}</select></label><label class="wide">Interior<select id="radial-to"><option value="library" ${item.to==='library'?'selected':''}>Biblioteca</option><option value="entrance" ${item.to==='entrance'?'selected':''}>Caverna</option></select></label><label>Reflejar<input id="radial-flip" type="checkbox" ${item.flip?'checked':''}></label><label>Ya dibujado en el fondo<input id="radial-integrated" type="checkbox" ${item.integrated?'checked':''}></label><label>Sólido<input id="radial-collision" type="checkbox" ${item.collision?'checked':''}></label></div>`;
   const keys=['angleDeg','height','scale','rotation','collisionWidth','collisionHeight','label','interaction','to','flip','collision','hitWidth','hitHeight','integrated'] as const;
   for(const key of keys){const input=element('radial-'+key) as HTMLInputElement;input.onchange=()=>{const candidate={...item,[key]:key==='flip'||key==='collision'||key==='integrated'?input.checked:key==='label'||key==='interaction'||key==='to'?input.value:Number(input.value)};if(!validObjects([candidate])){host.note('Valor fuera de rango: tamaño 0.15–3, altura −100–350.');this.showProps();return}this.snapshot();Object.assign(item,candidate);this.saveEdit();const view=this.views.get(item.id);if(view)this.positionView(item,view);this.drawSelection()}}
   if(this.currentContext){element('radial-interaction').closest('label')!.hidden=true;element('radial-to').closest('label')!.hidden=true;this.currentContext.properties(item)}
  }
 };
}
