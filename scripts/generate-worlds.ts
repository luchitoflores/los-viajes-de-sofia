import {readFile,writeFile,rename,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {compileBatch,connectInstruction} from '../src/worlds/generator.ts';
import {parseWorld} from '../src/worlds/schema.ts';
import {parseCatalog} from '../src/worlds/catalog.ts';
const dir=resolve('public/worlds'),read=async(name:string)=>JSON.parse(await readFile(resolve(dir,name),'utf8'));
const catalog=parseCatalog(await read('index.json'));const existing=await Promise.all(catalog.planets.map(p=>read(p.source.replace('worlds/','')).then(parseWorld)));
const args=process.argv.slice(2),check=args.includes('--check'),instruction=args.filter(a=>a!=='--check').join(' ');const batch=instruction?{worlds:connectInstruction(instruction,existing,catalog),catalog}:compileBatch(await read('blueprints.json'),catalog,existing);
const generated=instruction?batch.worlds.filter(w=>JSON.stringify(w)!==JSON.stringify(existing.find(old=>old.id===w.id))):batch.worlds;
for(const w of generated)for(const src of new Set([...Object.values(w.assets).map(a=>a.src),w.philosopher.portrait]))if(src.startsWith('assets/'))await access(resolve('public',src));
const file=(w:{id:string})=>instruction?catalog.planets.find(p=>p.id===w.id)!.source.replace('worlds/',''):w.id+'.json';
if(!check){
for(const w of generated)await writeFile(resolve(dir,file(w)+'.tmp'),JSON.stringify(w,null,2)+'\n','utf8');
for(const w of generated)await rename(resolve(dir,file(w)+'.tmp'),resolve(dir,file(w)));
if(!instruction){await writeFile(resolve(dir,'index.json.tmp'),JSON.stringify(batch.catalog,null,2)+'\n','utf8');await rename(resolve(dir,'index.json.tmp'),resolve(dir,'index.json'))}
}
console.log(JSON.stringify({validated:true,checkOnly:check,generated:generated.map(w=>w.id),planets:batch.catalog.planets.length,instruction:instruction||'Lote de plantillas'},null,2));
