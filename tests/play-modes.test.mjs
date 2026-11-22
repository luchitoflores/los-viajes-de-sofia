import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseStory,storyAccess,profileKey} from '../src/engine/play-session.ts';
import {facingFlip,radialDifference} from '../src/facing.ts';
const root=new URL('../public/worlds/',import.meta.url),ids=['plato','kant','hegel','heidegger','sartre','camus'];
const route=parseStory(JSON.parse(fs.readFileSync(new URL('story.json',root),'utf8')),ids);
test('Historia permite revisitar etapas previas y abre la siguiente solo al completarlas',()=>{
 const done=new Set();const allowed=id=>storyAccess(route,id,(world)=>done.has(world));
 assert.ok(allowed('plato'));assert.ok(!allowed('kant'));assert.ok(!allowed('camus'));assert.ok(!allowed('custom'));
 done.add('plato');assert.ok(allowed('kant'));assert.ok(!allowed('hegel'));done.add('kant');assert.ok(allowed('hegel'));assert.ok(allowed('plato'));
 for(const id of ids)done.add(id);assert.ok(allowed('camus'));
});
test('La ruta rechaza mundos ausentes, etapas duplicadas y objetivos inválidos',()=>{
 for(const change of [r=>r.stages.push(r.stages[0]),r=>r.stages[0].world='missing',r=>r.stages[0].flags=[],r=>r.stages[0].goal='']){const r=structuredClone(route);change(r);assert.throws(()=>parseStory(r,ids))}
});
test('Cada objetivo de Historia está implementado en sus datos y Libre conserva las claves antiguas',()=>{
 for(const s of route.stages.filter(s=>!s.legacy)){const w=JSON.parse(fs.readFileSync(new URL(s.world+'.json',root),'utf8')),flags=new Set(['intro-complete']);for(const d of Object.values(w.dialogues)){for(const f of d.reward?.flags??[])flags.add(f);for(const n of Object.values(d.nodes))for(const c of n.choices)for(const f of c.reward?.flags??[])flags.add(f)}for(const a of Object.values(w.activities))for(const f of a.reward?.flags??[])flags.add(f);for(const i of Object.values(w.interactions))for(const a of i.actions)for(const f of a.reward?.flags??[])flags.add(f);for(const f of s.flags)assert.ok(flags.has(f),s.world+': '+f)}
 assert.equal(profileKey('sofia-universe-progress-v1','free'),'sofia-universe-progress-v1');assert.equal(profileKey('sofia-universe-progress-v1','story'),'sofia-universe-progress-v1-story');assert.notEqual(profileKey('sofia-polis-radial-v1','story'),profileKey('sofia-polis-radial-v1','free'));
});
test('Los personajes miran a Sofía en ambos lados y en los cuatro cuadrantes radiales',()=>{
 assert.equal(facingFlip(-80),true);assert.equal(facingFlip(80),false);assert.equal(facingFlip(0,true),true);
 for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){const npc={x:Math.sin(angle)*500,y:-Math.cos(angle)*500};for(const side of [-1,1]){const hero={x:npc.x+side*70*Math.cos(angle),y:npc.y+side*70*Math.sin(angle)};assert.equal(facingFlip(radialDifference(hero,npc,angle)),side<0)}}
});
