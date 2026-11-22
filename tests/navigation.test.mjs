import {test} from 'node:test';
import assert from 'node:assert/strict';
import {toward,validHotspot} from '../src/navigation.ts';
import {object,validObjects,parseSave,freshPlanet} from '../src/planet-model.ts';

test('El destino se alcanza en ambos sentidos sin oscilar ni sobrepasarlo',()=>{
 for(const target of [-413,527]){let x=0;for(let i=0;i<500;i++){const before=x;x+=toward(x,target,220,1/60)*220/60;assert.ok(Math.abs(target-x)<=Math.abs(target-before))}assert.ok(Math.abs(x-target)<=3);assert.equal(toward(x,target,220,1/60),0)}
});
test('Las zonas radiales editables validan sus dimensiones y conservan las partidas anteriores',()=>{
 assert.ok(validObjects([{...object('temple',0),hitWidth:180,hitHeight:200}]));assert.ok(!validObjects([{...object('temple',0),hitWidth:NaN}]));assert.ok(!validObjects([{...object('temple',0),hitHeight:-1}]));const original=freshPlanet();assert.deepEqual(parseSave(JSON.stringify(original)),original);
});

test('Las zonas invisibles importadas rechazan dimensiones y coordenadas inválidas',()=>{
 assert.ok(validHotspot({x:350,y:355,w:120,h:80}));for(const h of [null,{}, {x:0,y:0,w:-5,h:80},{x:Infinity,y:0,w:80,h:80},{x:0,y:0,w:80,h:900}])assert.equal(validHotspot(h),false);
});
