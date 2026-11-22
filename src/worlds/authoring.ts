import {VIEWPORT,sceneTemplate,connectInterior,type TemplateId} from './templates.ts';
import {ART,object,type Kind} from '../planet-model.ts';
import {CAST_IDS,castSprite,castPortrait,CAVE_PROPS} from '../cast.ts';
import {parseWorld,type Asset,type WorldDefinition} from './schema.ts';
export const BUILTIN_ASSETS:Record<string,Asset>={
 ...Object.fromEntries(Object.entries(ART).map(([id,a])=>['stock-'+id,{src:'assets/'+a.file,width:a.width,height:a.height,kind:id as Kind,label:object(id as Kind,0).label}])),
 ...Object.fromEntries(CAST_IDS.map(id=>['cast-'+id,{src:'assets/'+castSprite(id),width:80,height:118,kind:'philosopher' as const,label:id}])),
 ...Object.fromEntries(Object.entries(CAVE_PROPS).map(([id,file])=>['cave-'+id,{src:'assets/'+file,width:80,height:110,kind:'rock' as const,label:'Caverna: '+id}])),
 ...Object.fromEntries([['library','polis-library-v2.png'],['entrance','polis-cave-entry-v3.png'],['shadows','polis-cave-shadows-v3.png'],['ascent','polis-ascent-v2.png'],['exterior','exterior.webp'],['medieval','mmid.webp'],['modern','dmid.webp'],['contemporary','cmid.webp']].map(([id,file])=>['background-'+id,{src:'assets/'+file,width:1600,height:540,kind:'rock' as const,label:'Fondo: '+id}]))
};
export function createWorld(input:{id:string;title:string;authorId:string;author:string;galaxy:string;cast:string;intro:string}):WorldDefinition{
 const mentor=BUILTIN_ASSETS['cast-'+input.cast]??BUILTIN_ASSETS['cast-socr'];
 return parseWorld({format:'sofia-world',version:1,viewport:VIEWPORT,id:input.id,title:input.title,summary:'Mundo en construcción. Configura sus escenarios y diálogos antes de publicarlo.',artStatus:'provisional',philosopher:{id:input.authorId,name:input.author,portrait:'assets/'+castPortrait(input.cast)},galaxy:input.galaxy,systems:[],themes:[],assets:{terrain:{src:'assets/planet-terrain.png',width:1012,height:1012,kind:'rock'},mentor,door:BUILTIN_ASSETS['stock-door']},terrain:'terrain',intro:'arrival',surface:{spawnAngle:-8,objects:[{...object('philosopher',0,'mentor'),label:input.author.slice(0,140),asset:'mentor',behavior:'meet'}]},interiors:{},interactions:{meet:{actions:[{type:'talk',target:'arrival'}]}},dialogues:{arrival:{start:'welcome',nodes:{welcome:{speaker:input.author,portrait:'mentor',text:input.intro,choices:[{id:'explore',text:'Continuar'}]}}}},activities:{},concepts:{},memories:{},missions:[]});
}
export function addInterior(world:WorldDefinition,id:string,name:string,background:Asset,parent:string|null,template:TemplateId='room'):WorldDefinition{
 const w=structuredClone(world);if(w.interiors[id])throw Error('Ya existe un interior con ese ID.');if(parent&&!w.interiors[parent])throw Error('No existe la escena de origen.');
 const asset='background-'+id,enter='enter-'+id,exit='exit-'+id;
 {w.assets[asset]=background;w.assets.door??=BUILTIN_ASSETS['stock-door'];w.interiors[id]=sceneTemplate(template,name,asset);connectInterior(w,parent,id,'door-'+id,1180);const door=parent?w.interiors[parent].items.at(-1)!:w.surface.objects.at(-1)!,back=w.interiors[id].items.at(-1)!;w.interactions[enter]=w.interactions[door.behavior!];delete w.interactions[door.behavior!];door.behavior=enter;w.interactions[exit]=w.interactions[back.behavior!];delete w.interactions[back.behavior!];back.id=exit;back.behavior=exit;if(template==='elevator'){w.assets.platform={...BUILTIN_ASSETS['stock-rock'],width:130,height:28};w.interactions['lift-'+id]={actions:[{type:'lift',target:'lift'}]};w.interiors[id].items.push({id:'lift-'+id,type:'door',x:965,y:560,asset:'platform',label:'Subir o bajar en el ascensor',behavior:'lift-'+id})}return parseWorld(w)}
}
