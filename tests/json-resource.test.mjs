import {test} from 'node:test';
import assert from 'node:assert/strict';
import {jsonResource} from '../src/engine/json-resource.ts';
test('Missing JSON reports its path and optional SPA fallback is ignored',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response('<!doctype html><title>App</title>',{status:200});
  await assert.rejects(jsonResource('worlds/missing.json'),/worlds\/missing.json.*HTML/);
  assert.equal(await jsonResource('engine-project.json',true),undefined);
  globalThis.fetch=async()=>new Response('{bad');await assert.rejects(jsonResource('worlds/bad.json'),/bad.json.*JSON/);
  globalThis.fetch=async()=>new Response('{"id":"saved"}');assert.deepEqual(await jsonResource('worlds/valid.json'),{id:'saved'});
 }finally{globalThis.fetch=original}
});
