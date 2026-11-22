import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectFiles} from '../src/worlds/project-publication.ts';
import {applyProjectFiles} from './project-filesystem.ts';
const args=process.argv.slice(2),input=args.find(a=>!a.startsWith('--'));
if(!input)throw Error('Uso: npm run apply:project -- archivo.json [--apply]. Sin --apply solo valida.');
const raw=readFileSync(resolve(input));if(raw.length>100_000_000)throw Error('El proyecto supera 100 MB.');
const plan=projectFiles(JSON.parse(raw.toString('utf8')));
if(!args.includes('--apply')){process.stdout.write(JSON.stringify({valid:true,files:plan.map(f=>f.path),instructions:'Añade --apply para incorporar. Se crea una copia de seguridad.'},null,2)+'\n');process.exit(0)}
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),result=applyProjectFiles(plan,root,raw);
process.stdout.write(JSON.stringify({...result,next:'Ejecuta npm test y npm run build.'},null,2)+'\n');
