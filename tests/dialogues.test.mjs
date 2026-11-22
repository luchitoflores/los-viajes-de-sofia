import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseWorld} from '../src/worlds/schema.ts';
import {dialoguePack,mergeDialoguePack} from '../src/worlds/dialogues.ts';
const world=()=>parseWorld(JSON.parse(readFileSync(new URL('../public/worlds/sartre.json',import.meta.url),'utf8')));

test('Conversation packs preserve branching, rewards and action chains without mutating the source',()=>{
 const w=world(),before=JSON.stringify(w),o=w.surface.objects.find(o=>o.kind==='philosopher');
 const previous=w.interactions[o.behavior];previous.actions.push({type:'activity',target:Object.keys(w.activities)[0]});
 previous.requires=['fixture'];const start=structuredClone(w);
 const pack=dialoguePack(w);pack.dialogues[w.intro].style='ink';pack.bindings=[{scene:'surface',object:o.id,dialogue:w.intro}];
 const changed=mergeDialoguePack(w,pack),edited=changed.surface.objects.find(i=>i.id===o.id);
 assert.equal(changed.dialogues[w.intro].style,'ink');assert.deepEqual(changed.interactions[edited.behavior].actions.slice(1),previous.actions.slice(1));assert.deepEqual(changed.interactions[edited.behavior].requires,['fixture']);assert.deepEqual(w,start);assert.notEqual(JSON.stringify(changed),before);
 assert.deepEqual(mergeDialoguePack(changed,dialoguePack(changed)),changed);
});
test('A conversation is assigned to one appearance even when its old behavior is shared',()=>{
 const w=world(),o=w.surface.objects.find(o=>o.kind==='philosopher');w.surface.objects.push({...o,id:'other-appearance',angleDeg:80});
 const changed=mergeDialoguePack(w,{format:'sofia-dialogues',version:1,worldId:w.id,dialogues:{},bindings:[{scene:'surface',object:o.id,dialogue:w.intro}]});
 assert.notEqual(changed.surface.objects.find(i=>i.id===o.id).behavior,changed.surface.objects.find(i=>i.id==='other-appearance').behavior);
});
test('Import rejects foreign worlds, invalid themes, dangling references, duplicate bindings and unsafe IDs atomically',()=>{
 for(const edit of [p=>p.worldId='other',p=>p.dialogues[Object.keys(p.dialogues)[0]].style='html',p=>p.bindings=[{scene:'missing',object:'npc',dialogue:'unknown'}],p=>p.bindings.push(p.bindings[0]),p=>Object.defineProperty(p.dialogues,'__proto__',{value:{},enumerable:true}),p=>p.dialogues[Object.keys(p.dialogues)[0]].nodes.start.choices[0].next='missing']){
  const w=world(),before=JSON.stringify(w),pack=dialoguePack(w);edit(pack);assert.throws(()=>mergeDialoguePack(w,pack));assert.equal(JSON.stringify(w),before);
 }
});
