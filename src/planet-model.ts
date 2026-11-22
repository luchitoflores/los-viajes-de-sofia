export const RADIUS=500;
export const TAU=Math.PI*2;
export type Kind='temple'|'ship'|'tree'|'cave'|'house'|'door'|'vase'|'scroll'|'rock'|'philosopher';
export type Interaction='none'|'talk'|'collect'|'door'|'ship';
export type Interior='entrance'|'library';
export interface PlanetObject {tooltip?:string;characterId?:string;instanceId?:string;id:string;kind:Kind;label:string;angleDeg:number;height:number;scale:number;rotation:number;flip:boolean;interaction:Interaction;to:Interior;collision:boolean;collisionWidth:number;collisionHeight:number;hitWidth?:number;hitHeight?:number;asset?:string;behavior?:string;integrated?:boolean}
export interface Body {angle:number;height:number;velocity:number;grounded:boolean}
export interface PlanetSave {version:1;angle:number;collected:string[];discovered:string[];objects:PlanetObject[];returnAnchor:{id:string;angle:number;height:number}|null}
export const ART:Record<Kind,{width:number;height:number;file:string}>={temple:{width:220,height:220,file:'polis-temple.png'},ship:{width:130,height:150,file:'polis-ship.png'},tree:{width:180,height:205,file:'polis-tree.png'},cave:{width:180,height:170,file:'polis-cave.png'},house:{width:160,height:190,file:'polis-house.png'},door:{width:70,height:100,file:'polis-door.png'},vase:{width:34,height:44,file:'polis-vase.png'},scroll:{width:48,height:32,file:'polis-scroll.png'},rock:{width:85,height:65,file:'polis-rock.png'},philosopher:{width:80,height:118,file:'cast-socr.png'}};
export const KINDS=Object.keys(ART) as Kind[];
export function object(kind:Kind,angleDeg:number,id:string=kind):PlanetObject{return{id,kind,label:({temple:'Templo de la Polis',ship:'La nave de Sofía',tree:'Olivo',cave:'Entrada a la caverna',house:'Casa del ágora',door:'Puerta de la biblioteca',vase:'Ánfora de la Polis',scroll:'Pergamino de preguntas',rock:'Rocas del sendero',philosopher:'Sócrates'})[kind],angleDeg,height:0,scale:1,rotation:0,flip:false,interaction:kind==='philosopher'?'talk':kind==='temple'||kind==='cave'||kind==='door'?'door':kind==='vase'||kind==='scroll'?'collect':kind==='ship'?'ship':'none',to:kind==='cave'?'entrance':'library',collision:false,collisionWidth:ART[kind].width*.6,collisionHeight:ART[kind].height*.5}}
export function defaultObjects():PlanetObject[]{return[
 object('ship',-26),object('philosopher',0),object('temple',35),object('tree',70,'olive-east'),object('scroll',85),object('rock',110,'rocks-garden'),object('house',132),{...object('door',132),height:0,scale:.78},object('tree',155,'olive-cave'),object('cave',190),object('vase',234),object('tree',265,'olive-west'),object('rock',290,'rocks-west'),object('scroll',312,'scroll-return'),object('tree',-67,'olive-landing')];}
export const radians=(degrees:number)=>degrees*Math.PI/180;
export function angleDiff(a:number,b:number):number{return Math.atan2(Math.sin(a-b),Math.cos(a-b))}
export function surfacePoint(angle:number,height=0){return{x:Math.sin(angle)*(RADIUS+height),y:-Math.cos(angle)*(RADIUS+height)}}
export function project(x:number,y:number){return{angleDeg:Math.atan2(x,-y)*180/Math.PI,height:Math.hypot(x,y)-RADIUS}}
export function jump(body:Body):boolean{if(!body.grounded)return false;body.velocity=270;body.grounded=false;return true}
export function stepBody(body:Body,axis:number,delta:number,objects:PlanetObject[]):void{
 const slices=Math.max(1,Math.ceil(Math.min(delta,.1)/(1/120))),dt=Math.min(delta,.1)/slices;
 for(let n=0;n<slices;n++){
  const before=body.angle,oldHeight=body.height;
  let next=before+Math.max(-1,Math.min(1,axis))*200/(RADIUS+body.height)*dt;
  body.velocity-=740*dt;let nextHeight=body.height+body.velocity*dt;
  let floor=0;
  for(const o of objects){if(!o.collision)continue;
   const center=radians(o.angleDeg),half=(o.collisionWidth*o.scale/2+11)/RADIUS,top=o.height+o.collisionHeight*o.scale;
   const diff=angleDiff(next,center);
   if(Math.abs(diff)<half){
    if(body.velocity<=0&&oldHeight>=top-.5&&nextHeight<=top)floor=Math.max(floor,top);
    else if(Math.min(nextHeight,oldHeight)<top-.5&&Math.max(nextHeight,oldHeight)+85>o.height){const side=angleDiff(before,center)<0?-1:1;next=before+angleDiff(center+side*half,before);}
   }
  }
  body.angle=next;body.height=Math.max(floor,nextHeight);body.grounded=nextHeight<=floor;
  if(body.grounded)body.velocity=0;
 }
}
function bounded(value:unknown,min:number,max:number):value is number{return typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max}
export function validObjects(value:unknown):value is PlanetObject[]{
 if(!Array.isArray(value)||value.length>200)return false;const ids=new Set<string>();
 return value.every((o:PlanetObject)=>{if(!o||typeof o.id!=='string'||!o.id||o.id.length>100||ids.has(o.id))return false;ids.add(o.id);return (o.tooltip===undefined||(typeof o.tooltip==='string'&&o.tooltip.length>0&&o.tooltip.length<=600))&&KINDS.includes(o.kind)&&typeof o.label==='string'&&o.label.length<=140&&bounded(o.angleDeg,-36000,36000)&&bounded(o.height,-100,350)&&bounded(o.scale,.15,3)&&bounded(o.rotation,-360,360)&&typeof o.flip==='boolean'&&['none','talk','collect','door','ship'].includes(o.interaction)&&['entrance','library'].includes(o.to)&&typeof o.collision==='boolean'&&bounded(o.collisionWidth,5,500)&&bounded(o.collisionHeight,5,500)&&(o.hitWidth===undefined||bounded(o.hitWidth,24,900))&&(o.hitHeight===undefined||bounded(o.hitHeight,24,900))&&(o.integrated===undefined||typeof o.integrated==='boolean')&&(o.instanceId===undefined||o.instanceId===o.id)&&[o.asset,o.behavior,o.characterId,o.instanceId].every(id=>id===undefined||(typeof id==='string'&&/^[a-z][a-z0-9._:-]{0,99}$/.test(id)&&!['constructor','prototype','__proto__'].includes(id)))});
}
export function freshPlanet():PlanetSave{return{version:1,angle:radians(-17),collected:[],discovered:[],objects:defaultObjects(),returnAnchor:null}}
export function parseSave(raw:string|null):PlanetSave{
 const fallback=freshPlanet();if(!raw)return fallback;
 try{const s=JSON.parse(raw) as PlanetSave;if(s.version!==1||!validObjects(s.objects)||!bounded(s.angle,-1e7,1e7)||!Array.isArray(s.collected)||!s.collected.every(x=>typeof x==='string')||!Array.isArray(s.discovered)||!s.discovered.every(x=>typeof x==='string'))return fallback;
 if(s.returnAnchor!==null&&(!s.returnAnchor||typeof s.returnAnchor.id!=='string'||!bounded(s.returnAnchor.angle,-1e7,1e7)||!bounded(s.returnAnchor.height,0,1000)))return fallback;return s;}catch{return fallback}
}
export function parseLayout(data:unknown):PlanetObject[]{const x=data as {format?:string;version?:number;radius?:number;objects?:unknown};if(!x||x.format!=='sofia-radial-planet'||x.version!==1||x.radius!==RADIUS||!validObjects(x.objects))throw Error('El archivo no es un planeta radial válido.');return structuredClone(x.objects)}
