import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {arrivalFacing,planetOrder,travelDirection} from '../src/gameplay/travel-direction.ts';
import {setRoomFloor} from '../src/worlds/room-floor.ts';
import {grantKnowledge,scrollSections,enrichCollections} from '../src/worlds/knowledge.ts';
import {parseWorld} from '../src/worlds/schema.ts';
import {freshProgress,restoreProgress} from '../src/engine/progression.ts';
import {mechanicsFor,lampState,commandLamp} from '../src/gameplay/equipment.ts';
const world=()=>parseWorld(JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8')));
test('Arrivals face into the room and flights reverse in the same ordered universe',()=>{
 assert.equal(arrivalFacing(90,1280),1);assert.equal(arrivalFacing(1160,1280),-1);
 const order=planetOrder(['earth'],['plato','sartre'],['sartre','earth','plato','kant']);assert.deepEqual(order,['earth','plato','sartre','kant']);
 for(const [a,b] of [['earth','plato'],['plato','sartre'],['earth','kant']]){assert.equal(travelDirection(order,a,b),1);assert.equal(travelDirection(order,b,a),-1)}
 const w=world(),p=freshProgress(w);p.interior='salida';p.interiorX=1190;p.interiorFacing=-1;assert.equal(restoreProgress(w,JSON.parse(JSON.stringify(p))).interiorFacing,-1);
});
test('Lamp starts off, stays scoped to authored cave rooms and preserves deliberate on state',()=>{
 const w=world(),p=freshProgress(w),c=mechanicsFor(w);p.flags.push(c.lamp.flag);
 assert.equal(lampState(p,c,'prisioneros').on,false);assert.equal(lampState(p,c,'surface').available,false);assert.equal(lampState(p,c,'agora').equipped,false);
 assert.equal(commandLamp(p,c,'turnOn','surface'),false);assert.equal(commandLamp(p,c,'turnOn','prisioneros'),true);assert.equal(lampState(p,c,'prisioneros').on,true);
 assert.equal(lampState(p,c,'surface').on,false);assert.equal(lampState(p,c,'prisioneros').on,true);assert.ok(p.flags.includes('lampara_encendida'));
});
test('A lower physical floor is valid, moves its support and spawn, and preserves upper platforms',()=>{
 const w=world(),before=structuredClone(w.interiors.salida),next=setRoomFloor(w,'salida',685);parseWorld(next);
 assert.equal(next.interiors.salida.floor,685);assert.equal(next.interiors.salida.spawn.y,685);assert.equal(w.interiors.salida.floor,before.floor);
 assert.equal(next.interiors.salida.items.find(o=>o.id==='salida-planeta').y,685);
 assert.throws(()=>setRoomFloor(w,'salida',721));const ascent=setRoomFloor(w,'ascenso',650);assert.equal(ascent.interiors.ascenso.regions.find(r=>r.id==='alto').y,w.interiors.ascenso.regions.find(r=>r.id==='alto').y);
});
test('Completion grants a retrospective scroll, later sections grow the same item without duplication',()=>{
 const w=world(),p=freshProgress(w);assert.deepEqual(grantKnowledge(w,p),[]);p.flags.push('aventura_platon_completada');
 assert.deepEqual(grantKnowledge(w,p),['pergamino-platon']);assert.equal(scrollSections(w,p.flags,'pergamino-platon').length,1);assert.deepEqual(grantKnowledge(w,p),[]);
 const old=restoreProgress(w,{flags:['aventura_platon_completada']});assert.ok(old.memories.includes('pergamino-platon'));
 w.knowledgeScrolls[0].sections.push({id:'ideas',title:'Otra misión futura',text:'Nuevo apartado de prueba.',requires:['otra-mision']});p.flags.push('otra-mision');grantKnowledge(w,p);assert.equal(scrollSections(w,p.flags,'pergamino-platon').length,2);assert.equal(p.memories.filter(id=>id==='pergamino-platon').length,1);parseWorld(w);
});
test('Collection fallback enriches old drafts without replacing authored biography or scroll text',()=>{
 const w=world(),extra=JSON.parse(fs.readFileSync('public/collections.json','utf8')).worlds.plato;delete w.authorProfile;delete w.knowledgeScrolls;delete w.memories['pergamino-platon'];const next=enrichCollections(w,extra);parseWorld(next);assert.ok(next.authorProfile.works.length>0);next.authorProfile.life='Mi biografía editada.';assert.equal(enrichCollections(next,extra).authorProfile.life,'Mi biografía editada.');
});
