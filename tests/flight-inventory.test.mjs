import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {flightPath,travelDirection} from '../src/gameplay/travel-direction.ts';
import {collectedItems} from '../src/worlds/inventory.ts';
import {parseWorld} from '../src/worlds/schema.ts';
import {restoreProgress} from '../src/engine/progression.ts';
test('Flight passes only intermediate planets in either direction and includes newly inserted worlds',()=>{
 const order=['earth','plato','sartre'];assert.deepEqual(flightPath(order,'earth','sartre'),['plato']);assert.deepEqual(flightPath(order,'sartre','earth'),['plato']);
 order.splice(2,0,'new-world');assert.deepEqual(flightPath(order,'earth','sartre'),['plato','new-world']);assert.deepEqual(flightPath(order,'sartre','earth'),['new-world','plato']);
 assert.equal(travelDirection(order,'sartre','earth'),-1);assert.deepEqual(flightPath(order,'earth','plato'),[]);assert.deepEqual(flightPath(order,'plato','plato'),[]);assert.deepEqual(flightPath(order,'unknown','earth'),[]);
});
test('Inventory recovers old collected IDs, explains their meaning and separates repeated appearances',()=>{
 const w=parseWorld(JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8'))),p=restoreProgress(w,{planet:{collected:['scroll','vase','scroll','scroll-return']}});
 const items=collectedItems(w,p.planet.collected);assert.equal(items.length,3);assert.match(items[0].name,/Pergamino/);assert.match(items[0].description,/razones/);assert.match(items[1].description,/objeto/);assert.equal(items[0].scene,'Superficie');
 assert.deepEqual(collectedItems(w,[]),[]);assert.equal(p.memories.includes('scroll'),false);assert.match(collectedItems(w,['deleted-object'])[0].description,/versión anterior/);
});
test('Inventory supports authored interior objects without claiming uncollected objects',()=>{
 const w=parseWorld(JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8')));const room=w.interiors.entrada;
 room.items.push({id:'test-object',label:'Objeto de prueba',type:'scroll',x:200,y:560,behavior:'recoger-pergamino',tooltip:'Su significado editable.'});
 const items=collectedItems(w,['test-object']);assert.equal(items.length,1);assert.equal(items[0].scene,room.name);assert.match(items[0].description,/significado editable/);
});
