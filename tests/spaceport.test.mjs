import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureShip} from '../src/worlds/spaceport.ts';
import {defaultObjects,object,validObjects} from '../src/planet-model.ts';
import fs from 'node:fs';

test('El puerto conserva la nave colocada por el autor y no la duplica',()=>{
 const objects=defaultObjects(),ship=objects.find(o=>o.kind==='ship');ship.angleDeg=83;ship.scale=.8;
 assert.equal(ensureShip(objects,0),ship);assert.equal(ensureShip(objects,180),ship);
 assert.equal(objects.filter(o=>o.kind==='ship').length,1);assert.equal(ship.angleDeg,83);assert.equal(ship.scale,.8);
});
test('Un mundo antiguo sin nave recibe un puerto válido sin cambiar sus objetos',()=>{
 const objects=[object('temple',-30),object('tree',-48),{...object('rock',25),id:'sofia-spaceport'}],before=structuredClone(objects);
 const ship=ensureShip(objects,0);assert.ok(validObjects(objects));assert.equal(ship.interaction,'ship');assert.notEqual(ship.id,'sofia-spaceport');assert.deepEqual(objects.slice(0,3),before);
 assert.notEqual(ship.angleDeg,-30);assert.notEqual(ship.angleDeg,-48);assert.equal(ensureShip(objects,0),ship);
});

test('La nave examinable de Sartre se reutiliza y elimina solo las naves duplicadas de ejecución',()=>{
 const source=JSON.parse(fs.readFileSync(new URL('../public/worlds/sartre.json',import.meta.url),'utf8'));
 const objects=structuredClone(source.surface.objects),ship=objects.find(o=>o.kind==='ship'),others=structuredClone(objects.filter(o=>o.kind!=='ship'));
 assert.equal(ship.interaction,'none');objects.push(object('ship',-70,'sofia-spaceport'));
 assert.equal(ensureShip(objects,0),ship);assert.equal(ship.interaction,'ship');assert.equal(objects.filter(o=>o.kind==='ship').length,1);
 assert.equal(ship.id,'sartre-ship');assert.deepEqual(objects.filter(o=>o.kind!=='ship'),others);assert.equal(source.surface.objects.find(o=>o.kind==='ship').interaction,'none');
});
