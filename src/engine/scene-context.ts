import type {Universe} from './universe';
import {meets} from '../worlds/narrative';
import {actionLabel,type ContextAction} from './exploration-controls';
interface Candidate {id:string;x?:number;type?:string;interaction?:string;behavior?:string}
interface SceneContext {
 player:{x:number;y:number};companion?:{x:number;y:number};
 sys:{settings:{key:string}};closest:()=>Candidate|null;
 interactWith:(item:Candidate)=>void;itemX:(item:Candidate)=>number;itemY:(item:Candidate)=>number;
}
/** Adapts the existing near-target controllers; it does not add another movement system. */
export function sceneContextAction(getScene:()=>SceneContext|null,u:Universe|null,legacy:(item:Candidate)=>void):ContextAction|null{
 const scene=getScene();if(!scene?.player)return null;
 const o=scene.closest?.(),companion=u?.active?u.companion():null;
 if(companion&&scene.companion&&Math.hypot(scene.companion.x-scene.player.x,scene.companion.y-scene.player.y)<115&&(!o||Math.abs((o.x??Infinity)-scene.player.x)>Math.abs(scene.companion.x-scene.player.x)))return{id:'companion',kind:'talk',label:'Hablar',run:()=>{if(scene===getScene()&&scene.companion&&Math.hypot(scene.companion.x-scene.player.x,scene.companion.y-scene.player.y)<125)u?.talkCompanion()}};
 if(!o)return null;
 const behavior=o.behavior?u?.world?.interactions[o.behavior]:undefined;
 const type=behavior?.actions.find(a=>a.enabled!==false&&a.type!=='record'&&meets(u!.progress.flags,a))?.type??o.interaction??(['philosopher','plato','prisoner','warden'].includes(o.type??'')?'talk':o.type==='door'?'enter':'examine');
 return{id:o.id,kind:type==='talk'?'talk':['enter','return','surface','portal','ship','door'].includes(type)?'door':type,label:actionLabel(type),run:()=>{if(scene!==getScene())return;if(scene.sys.settings.key==='Planet')scene.interactWith(o);else if(Math.abs(scene.player.x-scene.itemX(o))<125&&Math.abs(scene.player.y-scene.itemY(o))<90)legacy(o)}};
}
