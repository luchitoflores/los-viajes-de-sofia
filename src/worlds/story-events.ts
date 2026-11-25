import type {WorldDefinition,Dialogue,Choice,Region} from './schema.ts';
export const storyKey=(text:string)=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0).toString(36)};
export const answerFlag=(dialogue:string,node:string,choice:string)=>'answer-'+storyKey(dialogue+'/'+node+'/'+choice);
export const dialogueDoneFlag=(dialogue:string)=>'conversation-done-'+storyKey(dialogue);
export interface StoryFlag {label:string;kind:'state'|'event'|'mission'|'door'}
export function eventCatalog(w:WorldDefinition){
 const found=new Map<string,{id:string;label:string;kind:StoryFlag['kind'];sources:string[]}>();
 const add=(id:string,label?:string,source?:string,kind:StoryFlag['kind']='state')=>{const prev=found.get(id);if(prev){if(label)prev.label=label;if(source&&!prev.sources.includes(source))prev.sources.push(source);if(kind!=='state')prev.kind=kind}else found.set(id,{id,label:label??id.replace(/[_:-]/g,' '),kind,sources:source?[source]:[]})};
 for(const [id,f] of Object.entries(w.storyFlags??{}))add(id,f.label,undefined,f.kind);
 for(const [id,label] of [['owned','Linterna obtenida'],['equipped','Linterna equipada'],['on','Linterna encendida ahora'],['off','Linterna apagada o guardada']])add('equipment:lamp:'+id,label,'Equipamiento de Sofía');
 for(const m of w.missions){add(m.flag,m.title,undefined,'mission');for(const stage of m.stages??[])for(const flag of stage.completeWhen)add(flag,stage.title,undefined,'mission')}
 for(const [id,item] of Object.entries(w.inventoryItems??{}))for(const [key,label] of [['discovered','Descubierto'],['owned','En inventario'],['equipped','Equipado'],['used','Usado'],['given','Entregado'],['consumed','Consumido']])add('inventory:'+id+':'+key,item.name+' · '+label,'Inventario de objetos');
 for(const room of Object.values(w.interiors))for(const e of room.encounters??[]){add(e.victoryFlag,'Vencer: '+e.name,'Combate: '+e.name,'event');for(const f of [...e.requires??[],...e.excludes??[]])add(f);for(const f of e.reward?.flags??[])add(f,undefined,'Victoria: '+e.name)}
 for(const [id,d] of Object.entries(w.dialogues)){
  const title=d.title??id.replace(/[-_]/g,' ');for(const f of d.reward?.flags??[])add(f,undefined,'Al terminar: '+title);
  for(const [node,n] of Object.entries(d.nodes))for(const c of n.choices){for(const f of c.reward?.flags??[])add(f,undefined,title+' / '+c.text);if(n.kind==='decision'||n.kind==='branch')add(answerFlag(id,node,c.id),'Respuesta: '+title+' / '+c.text,title+' / '+c.text,'event')}
  for(const e of d.entries??[])for(const f of [...e.requires??[],...e.excludes??[]])add(f);
 }
 for(const [id,b] of Object.entries(w.interactions)){for(const f of [...b.requires??[],...b.excludes??[]])add(f);for(const a of b.actions){for(const f of [...a.requires??[],...a.excludes??[]])add(f);if('reward' in a)for(const f of a.reward?.flags??[])add(f,undefined,a.enabled===false?undefined:'Acción: '+id)}}
 for(const a of Object.values(w.activities))for(const f of a.reward?.flags??[])add(f,undefined,'Actividad: '+a.title);
 for(const room of Object.values(w.interiors))for(const e of room.events??[])for(const f of [...e.requires??[],...e.excludes??[]])add(f);
 for(const [id,f] of Object.entries(w.storyFlags??{}))add(id,f.label,undefined,f.kind);
 return [...found.values()];
}
export function doors(w:WorldDefinition){return [['surface',w.surface.objects],...Object.entries(w.interiors).map(([id,s])=>[id,s.items])] .flatMap(([scene,items])=>(items as typeof w.surface.objects).filter(o=>o.kind==='door'||('interaction' in o&&o.interaction==='door')||('type' in o&&o.type==='door')).map(o=>({scene:scene as string,id:o.id,label:o.label})))}
export function compileEffects(world:WorldDefinition,choice:Choice,effects:string[]):{world:WorldDefinition;choice:Choice}{
 const w=effects.some(e=>e.startsWith('door|'))?structuredClone(world):world,c=structuredClone(choice),flags:string[]=[];
 for(const value of effects){
  if(value.startsWith('flag|')){const id=value.slice(5);if(!eventCatalog(w).some(f=>f.id===id))throw Error('Acontecimiento inexistente.');flags.push(id);continue}
  const [type,scene,id]=value.split('|');if(type!=='door')throw Error('Efecto desconocido.');
  const items=scene==='surface'?w.surface.objects:w.interiors[scene]?.items,o=items?.find(o=>o.id===id);if(!o?.behavior||!w.interactions[o.behavior])throw Error('La puerta debe tener una conexión antes de poder habilitarla.');
  const flag='door-open-'+storyKey(scene+'/'+id),behavior='author-door-'+storyKey(scene+'/'+id);w.interactions[behavior]=structuredClone(w.interactions[o.behavior]);w.interactions[behavior].requires=[...new Set([...w.interactions[behavior].requires??[],flag])];o.behavior=behavior;(w.storyFlags??={})[flag]={kind:'door',label:'Puerta habilitada: '+o.label};flags.push(flag);
 }
 if(flags.length)c.reward={...c.reward,flags:[...new Set(flags)]};else if(c.reward){delete c.reward.flags;if(!Object.keys(c.reward).length)delete c.reward}return{world:w,choice:c};
}
export function linearTurns(d:Dialogue):string[]|null{const result:string[]=[],seen=new Set<string>();let id:string|undefined=d.start;while(id){if(seen.has(id)||!d.nodes[id]||d.nodes[id].choices.length!==1)return null;seen.add(id);result.push(id);id=d.nodes[id].choices[0].next}return result.length===Object.keys(d.nodes).length&&!d.entries?.length?result:null}
export function moveTurn(d:Dialogue,id:string,before:string){const order=linearTurns(d);if(!order)throw Error('Esta conversación tiene bifurcaciones. Conecta sus siguientes turnos sin reordenar las ramas.');if(id===before)return structuredClone(d);const next=structuredClone(d),list=order.filter(x=>x!==id);if(!list.includes(before))throw Error('Turno inexistente.');list.splice(list.indexOf(before),0,id);next.start=list[0];list.forEach((key,i)=>{if(list[i+1])next.nodes[key].choices[0].next=list[i+1];else delete next.nodes[key].choices[0].next});next.nodes=Object.fromEntries(list.map(key=>[key,next.nodes[key]]));return next}
export function removeTurn(d:Dialogue,id:string,replacement?:string){
 if(!d.nodes[id]||Object.keys(d.nodes).length===1)throw Error('Conserva al menos un texto.');if(replacement===id||(replacement&&!d.nodes[replacement]))throw Error('Elige otro turno para reconectar.');
 if((d.start===id||d.entries?.some(e=>e.node===id))&&!replacement)throw Error('Este texto es un inicio. Elige el turno que lo sustituirá.');
 const next=structuredClone(d);delete next.nodes[id];if(next.start===id)next.start=replacement!;for(const e of next.entries??[])if(e.node===id)e.node=replacement!;
 for(const n of Object.values(next.nodes))for(const c of n.choices)if(c.next===id){if(replacement)c.next=replacement;else delete c.next}return next;
}
