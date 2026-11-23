import {answerFlag} from '../worlds/story-events.ts';
import {meets} from '../worlds/narrative.ts';
import {radians,type PlanetSave} from '../planet-model.ts';
import {validId,type WorldDefinition,type Reward,type DialogueNode,type Choice} from '../worlds/schema.ts';
export interface WorldProgress {dialogueRead?:Record<string,string[]>;dialogueStarts?:Record<string,string>;entryPortalScene:string|null;pendingArrival:string|null;mechanisms:Record<string,number>;introComplete:boolean;flags:string[];concepts:string[];memories:string[];completed:string[];answers:Record<string,string[]>;choices:Record<string,string>;reasons:Record<string,string>;cursors:Record<string,string>;planet:PlanetSave;interior:string|null;interiorX:number|null;trail:{interior:string|null;x:number|null}[]}
export function freshProgress(w:WorldDefinition):WorldProgress{return{entryPortalScene:null,pendingArrival:null,mechanisms:{},introComplete:w.role==='home',flags:[],concepts:[],memories:[],completed:[],answers:{},choices:{},reasons:{},cursors:{},planet:{version:1,angle:radians(w.surface.spawnAngle),collected:[],discovered:[],objects:structuredClone(w.surface.objects),returnAnchor:null},interior:null,interiorX:null,trail:[]}}
export function restoreProgress(w:WorldDefinition,raw:unknown):WorldProgress{
 const p=freshProgress(w);if(!raw||typeof raw!=='object')return p;const s=raw as Partial<WorldProgress>;
 if(s.mechanisms&&typeof s.mechanisms==='object'&&!Array.isArray(s.mechanisms))for(const [id,y] of Object.entries(s.mechanisms))if(validId(id)&&Number.isFinite(y)&&y>=0&&y<=720)p.mechanisms[id]=y;
 if(s.entryPortalScene==='surface'||(validId(s.entryPortalScene)&&Object.hasOwn(w.interiors,s.entryPortalScene)))p.entryPortalScene=s.entryPortalScene;
 if(validId(s.pendingArrival))p.pendingArrival=s.pendingArrival;
 p.introComplete=w.role==='home'||s.introComplete===true;for(const k of ['flags','concepts','memories','completed'] as const)if(Array.isArray(s[k]))p[k]=[...new Set(s[k]!.filter(validId))];
 for(const k of ['choices','cursors','reasons'] as const)if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))for(const [id,v] of Object.entries(s[k]!))if(validId(id)&&validId(v))p[k][id]=v;
 if(s.answers&&typeof s.answers==='object'&&!Array.isArray(s.answers))for(const [id,v] of Object.entries(s.answers))if(validId(id)&&Array.isArray(v))p.answers[id]=v.filter(validId);
 if(s.dialogueRead&&typeof s.dialogueRead==='object'&&!Array.isArray(s.dialogueRead)){p.dialogueRead={};for(const [id,keys] of Object.entries(s.dialogueRead))if(validId(id)&&Array.isArray(keys))p.dialogueRead[id]=keys.filter(k=>typeof k==='string'&&k.length<240&&/^[a-zA-Z0-9_:.-]+$/.test(k)).slice(-100)}
 if(s.dialogueStarts&&typeof s.dialogueStarts==='object'&&!Array.isArray(s.dialogueStarts)){p.dialogueStarts={};for(const [id,key] of Object.entries(s.dialogueStarts))if(validId(id)&&typeof key==='string'&&key.length<240&&/^[a-zA-Z0-9_:.-]+$/.test(key))p.dialogueStarts[id]=key}
 const b=s.planet;if(b&&typeof b==='object'){if(Number.isFinite(b.angle)&&Math.abs(b.angle)<1e7)p.planet.angle=b.angle;for(const k of ['collected','discovered'] as const)if(Array.isArray(b[k]))p.planet[k]=b[k].filter(validId);const a=b.returnAnchor;if(a&&validId(a.id)&&Number.isFinite(a.angle)&&Number.isFinite(a.height)&&a.height>=0&&a.height<=1000)p.planet.returnAnchor={...a}}
 if(validId(s.interior)&&Object.hasOwn(w.interiors,s.interior))p.interior=s.interior;if(typeof s.interiorX==='number'&&Number.isFinite(s.interiorX)&&s.interiorX>=0&&s.interiorX<=10000)p.interiorX=s.interiorX;
 if(Array.isArray(s.trail))p.trail=s.trail.filter(v=>v&&((v.interior===null)||(validId(v.interior)&&Object.hasOwn(w.interiors,v.interior)))&&(v.x===null||(typeof v.x==='number'&&Number.isFinite(v.x)&&v.x>=0&&v.x<=10000))).slice(-100);
 return p;
}
export function reward(p:WorldProgress,r:Reward|undefined){if(!r)return;for(const k of ['flags','concepts','memories'] as const)for(const id of r[k]??[])if(!p[k].includes(id))p[k].push(id)}
export function dialogueNode(w:WorldDefinition,p:WorldProgress,id:string):{id:string;node:DialogueNode}{const d=w.dialogues[id];if(!d)throw Error('Diálogo inexistente.');const cursor=p.cursors[id];const nodeId=cursor&&d.nodes[cursor]?cursor:(d.entries?.find(e=>meets(p.flags,e))?.node??d.start);return{id:nodeId,node:d.nodes[nodeId]}}
export function chooseDialogue(w:WorldDefinition,p:WorldProgress,id:string,nodeId:string,choiceId:string):Choice {
 const d=w.dialogues[id],n=d?.nodes[nodeId],c=n?.choices.find(c=>c.id===choiceId);if(!c||(c.requires??[]).some(id=>!p.flags.includes(id))||(c.excludes??[]).some(id=>p.flags.includes(id)))throw Error('Opción de diálogo inexistente o bloqueada.');if(n.kind==='decision'||n.kind==='branch'){const alternatives=n.choices.map(c=>answerFlag(id,nodeId,c.id));p.flags=p.flags.filter(f=>!alternatives.includes(f));p.flags.push(answerFlag(id,nodeId,c.id))}reward(p,c.reward);
 if(c.next)p.cursors[id]=c.next;else{delete p.cursors[id];reward(p,d.reward);if(id===w.intro){p.introComplete=true;if(!p.flags.includes('intro-complete'))p.flags.push('intro-complete')}}return c;
}
export function answerActivity(w:WorldDefinition,p:WorldProgress,id:string,itemId:string,targetId:string){
 const a=w.activities[id];if(!a||a.type==='decisions')throw Error('Actividad de parejas o clasificación inexistente.');
 if(a.type==='question'){const option=a.options.find(o=>o.id===itemId);if(!option)throw Error('Opción inexistente.');if(option.correct){p.answers[id]=[option.id];if(!p.completed.includes(id))p.completed.push(id);reward(p,a.reward)}return{correct:option.correct,feedback:option.feedback,complete:p.completed.includes(id)}}
 const item=(a.type==='pairs'?a.pairs:a.items).find(i=>i.id===itemId);if(!item)throw Error('Elemento inexistente.');
 const correct=a.type==='pairs'?item.id===targetId:('category' in item&&item.category===targetId);
 if(correct){const answers=p.answers[id]??=[];if(!answers.includes(itemId))answers.push(itemId);if((a.type==='pairs'?a.pairs:a.items).every(i=>answers.includes(i.id))){if(!p.completed.includes(id))p.completed.push(id);reward(p,a.reward)}}
 return{correct,feedback:item.feedback,complete:p.completed.includes(id)};
}
export function finishDecision(w:WorldDefinition,p:WorldProgress,id:string,optionId:string,reasonId:string){
 const a=w.activities[id];if(!a||a.type!=='decisions')throw Error('Decisión inexistente.');const option=a.options.find(o=>o.id===optionId),reason=a.reasons.find(r=>r.id===reasonId);if(!option||!reason)throw Error('Elección o argumento inexistente.');
 if(reason.adequate&&!p.completed.includes(id)){p.choices[id]=option.id;p.reasons[id]=reason.id;p.completed.push(id);reward(p,option.reward);reward(p,a.reward)}return{adequate:reason.adequate,feedback:reason.feedback,consequence:option.consequence!};
}
export function gate(w:WorldDefinition,p:WorldProgress,behaviorId:string|undefined):{allowed:boolean;intro?:boolean;text?:string}{
 if(!p.introComplete)return{allowed:false,intro:true};const b=behaviorId?w.interactions[behaviorId]:undefined;if(b?.requires?.some(id=>!p.flags.includes(id))||b?.excludes?.some(id=>p.flags.includes(id)))return{allowed:false,text:b.blockedText??'Hay algo que investigar antes.'};return{allowed:true};
}
