import {object} from '../planet-model.ts';
import type {Interior,WorldDefinition,WorldObject,Asset} from './schema.ts';
export const VIEWPORT={width:1280,height:720},FLOOR=560,UPPER=326.468085106383;
export const TEMPLATE_IDS=['room','cave','horizontal','stairs','two-level','elevator'] as const;
export type TemplateId=typeof TEMPLATE_IDS[number];
export const TEMPLATE_NAMES:Record<TemplateId,string>={room:'Habitación plana',cave:'Caverna',horizontal:'Sendero horizontal',stairs:'Escaleras', 'two-level':'Dos niveles',elevator:'Ascensor'};
export const TEMPLATE_BACKGROUNDS:Record<TemplateId,string>={room:'polis-library-v2.png',cave:'polis-cave-shadows-v3.png',horizontal:'exterior.webp',stairs:'polis-ascent-v2.png','two-level':'polis-ascent-v2.png',elevator:'polis-library-v2.png'};
export function sceneTemplate(template:TemplateId,name:string,background:string):Interior{
 if(!TEMPLATE_IDS.includes(template))throw Error('Plantilla desconocida.');
 const floor=(id:string,x:number,w:number,y:number)=>({id,type:'floor' as const,x,y,w,h:720-y});
 const regions:Interior['regions']=template==='stairs'||template==='two-level'?[floor('lower',0,306.67,FLOOR),{id:'stairs',type:'stairs',x:306.67,y:UPPER,w:560,h:FLOOR-UPPER},floor('upper',866.67,413.33,UPPER)]:template==='elevator'?[floor('lower',0,900,FLOOR),{id:'lift',type:'elevator',x:900,y:UPPER,w:130,h:FLOOR-UPPER},floor('upper',1030,250,UPPER)]:[floor('floor',0,1280,FLOOR)];
 return{viewport:{...VIEWPORT},template,backgroundGround:470,name,subtitle:'Plantilla genérica · recursos provisionales',background,width:1280,floor:FLOOR,spawn:{x:160,y:FLOOR},items:[],regions};
}
export function connectInterior(w:WorldDefinition,from:string|null,to:string,id:string,x:number,angle=35){
 if(!w.interiors[to]||(from&&!w.interiors[from]))throw Error('Conexión con una escena inexistente.');
 w.interactions[id]={actions:[{type:'enter',target:to}]};const label='Entrar: '+w.interiors[to].name;
 if(from)w.interiors[from].items.push({id,type:'door',x,y:groundAt(w.interiors[from],x),label,asset:'door',behavior:id});else w.surface.objects.push({...object('door',angle,id),label,asset:'door',behavior:id});
 const back='return-'+id;w.interactions[back]={actions:[{type:'return'}]};w.interiors[to].items.push({id:back,type:'door',x:55,y:w.interiors[to].floor,label:'Regresar por la entrada',asset:'door',behavior:back});
}
export function portalObject(id:string,target:string,angle=150):WorldObject{return{...object('door',angle,id),label:'Portal a '+target,asset:'door',behavior:id}}
export function groundAt(i:Pick<Interior,'floor'|'regions'>,x:number,lifts:Record<string,number>={}):number{
 const r=i.regions.find(r=>r.type==='stairs'&&x>=r.x&&x<=r.x+r.w);if(r){const bottom=r.bottom??i.floor;return bottom+(r.y-bottom)*(x-r.x)/r.w;}
 const lift=i.regions.find(r=>r.type==='elevator'&&x>=r.x&&x<=r.x+r.w);if(lift)return lifts[lift.id]??i.floor;
 return i.regions.find(r=>r.type==='floor'&&x>=r.x&&x<=r.x+r.w)?.y??i.floor;
}
export function characterAsset(w:WorldDefinition,o:{characterId?:string;asset?:string}){return o.characterId?w.characters?.[o.characterId]?.spriteId??o.asset:o.asset}
