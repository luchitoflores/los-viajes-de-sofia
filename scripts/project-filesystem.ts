import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,unlinkSync,realpathSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {resolve,dirname,relative,sep} from 'node:path';
import type {ProjectFile} from '../src/worlds/project-publication.ts';

export function applyProjectFiles(plan:ProjectFile[],base:string,source:Uint8Array){
 const root=realpathSync(base);
 const checked=(path:string,publicFile=true)=>{
  if(publicFile&&!path.startsWith('public/'))throw Error('Solo se publican datos e imágenes dentro de public.');
  const target=resolve(root,path),rel=relative(root,target);if(rel.startsWith('..')||rel.startsWith(sep))throw Error('Ruta fuera del proyecto.');
  let parent=existsSync(target)?target:dirname(target);while(!existsSync(parent))parent=dirname(parent);
  const real=realpathSync(parent);if(real!==root&&!real.startsWith(root+sep))throw Error('Un enlace de carpeta sale del proyecto.');return target;
 };
 const targets=new Set<string>();for(const file of plan){const target=checked(file.path).toLowerCase();if(targets.has(target))throw Error('Dos archivos comparten el mismo destino.');targets.add(target)}
 const backup=checked('.project-backups/'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8),false),before=new Map<string,Uint8Array|null>();
 mkdirSync(backup,{recursive:true});writeFileSync(resolve(backup,'project.json'),source);
 try{
  for(const f of plan){const target=checked(f.path),old=existsSync(target)?readFileSync(target):null;before.set(target,old);if(old){const copy=resolve(backup,f.path);mkdirSync(dirname(copy),{recursive:true});writeFileSync(copy,old)}mkdirSync(dirname(target),{recursive:true});const temporary=target+'.sofia-import-tmp';writeFileSync(temporary,f.dataUrl?Buffer.from(f.dataUrl.split(',')[1],'base64'):f.text!);renameSync(temporary,target)}
  return{applied:plan.length,backup};
 }catch(error){
  const failures:unknown[]=[];for(const [target,old] of before)try{old===null?existsSync(target)&&unlinkSync(target):writeFileSync(target,old);if(existsSync(target+'.sofia-import-tmp'))unlinkSync(target+'.sofia-import-tmp')}catch(e){failures.push(e)}
  if(failures.length)throw new AggregateError([error,...failures],'La restauración quedó incompleta. Copia de seguridad: '+backup);
  throw error;
 }
}
