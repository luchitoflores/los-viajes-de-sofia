import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const base=fileURLToPath(new URL('../public/lab/gdevelop/',import.meta.url));
const project=JSON.parse(fs.readFileSync(path.join(base,'plantilla-plataformas.json'),'utf8'));
function entries(tree,key){return [...(tree?.[key]?[tree[key]]:[]),...(tree?.children??[]).flatMap(t=>entries(t,key))]}
function events(list){return list.flatMap(e=>[e,...events(e.events??[])])}

test('Native template stays editable: no code events, all scene/object folders and links resolve',()=>{
 const scenes=project.layouts.map(s=>s.name),sheets=new Set(project.externalEvents.map(s=>s.name));
 assert.equal(new Set(scenes).size,scenes.length);
 assert.deepEqual(entries(project.layoutsFolderStructure,'itemName').sort(),[...scenes].sort());
 for(const s of project.layouts){
  const names=s.objects.map(o=>o.name);assert.equal(new Set(names).size,names.length,s.name);
  assert.deepEqual(entries(s.objectsFolderStructure,'objectName').sort(),[...names].sort(),s.name);
  for(const i of s.instances)assert.ok(names.includes(i.name),`${s.name}: unknown instance ${i.name}`);
 }
 for(const e of events([...project.layouts.flatMap(s=>s.events),...project.externalEvents.flatMap(s=>s.events)])){
  assert.notEqual(e.type,'BuiltinCommonInstructions::JsCode','Use native events for the autonomous template');
  if(e.type==='BuiltinCommonInstructions::Link')assert.ok(sheets.has(e.target),`Missing shared sheet ${e.target}`);
 }
});

test('Native artwork resolves locally and decorative parallax never becomes a physical obstacle',()=>{
 const resources=new Map(project.resources.resources.map(r=>[r.name,r]));
 for(const r of resources.values())if(r.file&&!/^https?:/.test(r.file))assert.ok(fs.existsSync(path.join(base,r.file)),`Missing resource ${r.file}`);
 for(const s of project.layouts){
  const objects=new Map(s.objects.map(o=>[o.name,o]));
  for(const o of s.objects)for(const a of o.animations??[])for(const d of a.directions)for(const f of d.sprites)assert.ok(resources.has(f.image),`${s.name}/${o.name}: unregistered image ${f.image}`);
  for(const i of s.instances.filter(i=>['FondoLejano','FondoMedio','PrimerPlano'].includes(i.layer)))assert.ok(!objects.get(i.name).behaviors.some(b=>b.type.startsWith('PlatformBehavior::')),`${s.name}/${i.name}: decorative art blocks the player`);
 }
});
