import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PlanetIntroduction} from '../src/engine/planet-introduction.ts';
import {parseWorld} from '../src/worlds/schema.ts';
import {readFileSync} from 'node:fs';
test('La llegada mantiene el planeta completo, acerca suavemente y completa una sola vez',()=>{let pose=-1,finished=0;const intro=new PlanetIntroduction({holdMs:1000,zoomMs:2000},v=>pose=v,()=>finished++);assert.equal(pose,0);intro.step(999);assert.equal(pose,0);intro.step(1001);assert.equal(pose,.5);intro.step(1000);assert.equal(pose,1);assert.equal(finished,1);intro.step(4000);intro.finish();assert.equal(finished,1)});
test('Movimiento reducido evita el acercamiento animado y los datos rechazan tiempos inválidos',()=>{let pose=-1;const intro=new PlanetIntroduction({holdMs:1000,zoomMs:2000},v=>pose=v,()=>{},true);intro.step(300);assert.equal(pose,1);assert.equal(intro.finished,true);const w=JSON.parse(readFileSync('public/worlds/earth.json','utf8'));parseWorld(w);w.surface.introduction.zoomMs=-1;assert.throws(()=>parseWorld(w))});
