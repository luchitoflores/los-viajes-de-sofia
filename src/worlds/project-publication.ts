import {parseProject,type ProjectBundle} from './project.ts';
import type {Asset} from './schema.ts';
export interface ProjectFile {path:string;text?:string;dataUrl?:string}
export function projectFiles(raw:unknown):ProjectFile[]{
 const p:ProjectBundle=parseProject(raw),files=new Map<string,ProjectFile>();
 const add=(file:ProjectFile)=>{if(file.path.split('/').some(part=>!part||part==='.'||/[. ]$/.test(part))||file.path.includes('..')||!/^public\/(assets\/[a-zA-Z0-9_./ -]+\.(png|webp|jpe?g)|worlds\/[a-z0-9-]+\.json|engine-settings\.json|engine-project\.json)$/.test(file.path))throw Error('Ruta de publicación inválida.');const key=file.path.toLowerCase(),old=files.get(key);if(old&&(old.text!==file.text||old.dataUrl!==file.dataUrl))throw Error('Dos recursos distintos usan la misma ruta: '+file.path);files.set(key,file)};
 const asset=(a:Asset,fallback:string)=>{
  if(!a.src.startsWith('data:'))return;
  const match=/^data:image\/(png|webp|jpeg);base64,(.+)$/.exec(a.src);if(!match)throw Error('Imagen incorporada inválida.');
  const extension=match[1]==='jpeg'?'jpg':match[1],path=a.projectPath??'assets/imported/'+fallback.replace(/[^a-z0-9._-]/gi,'-')+'.'+extension;
  if(!new RegExp('\\.'+(extension==='jpg'?'jpe?g':extension)+'$','i').test(path))throw Error('La extensión de la ruta no coincide con la imagen: '+path);
  const data=atob(match[2]);if(!(extension==='png'?data.startsWith('\x89PNG\r\n\x1a\n'):extension==='webp'?data.startsWith('RIFF')&&data.slice(8,12)==='WEBP':data.startsWith('\xff\xd8\xff')))throw Error('La imagen no tiene una cabecera válida.');
  add({path:'public/'+path,dataUrl:a.src});a.src=path;a.projectPath=path;
 };
 for(const w of p.worlds)for(const [id,a] of Object.entries(w.assets))asset(a,w.id+'-'+id);
 for(const [id,a] of Object.entries(p.resources))asset(a,'resource-'+id);
 for(const c of p.characters){asset(c.sprite,'character-'+c.id);asset(c.portrait,'portrait-'+c.id)}
 for(const w of p.worlds)add({path:'public/'+p.catalog.planets.find(e=>e.id===w.id)!.source,text:JSON.stringify(w,null,2)+'\n'});
 add({path:'public/worlds/index.json',text:JSON.stringify(p.catalog,null,2)+'\n'});
 add({path:'public/engine-settings.json',text:JSON.stringify(p.settings,null,2)+'\n'});
 add({path:'public/engine-project.json',text:JSON.stringify({format:'sofia-engine-library',version:1,resources:p.resources,characters:p.characters},null,2)+'\n'});
 return [...files.values()];
}
