import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mechanicsFor,commandLamp,lampState,syncEquipmentFlags,equipmentPreset} from '../src/worlds/equipment.ts';
import {parseWorld} from '../src/worlds/schema.ts';
import {freshProgress,restoreProgress} from '../src/engine/progression.ts';
const world=()=>parseWorld(JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8')));
test('Legacy lamp milestone defaults to off equipment; manual state survives save without erasing narrative progress',()=>{
 const w=world(),c=mechanicsFor(w),p=freshProgress(w);p.flags.push('lampara_encendida','prisionero_liberado');
 assert.equal(lampState(p,c).on,false);assert.ok(commandLamp(p,c,'turnOff'));assert.ok(p.flags.includes('lampara_encendida'));assert.ok(p.flags.includes('prisionero_liberado'));
 const restored=restoreProgress(w,JSON.parse(JSON.stringify(p)));assert.equal(lampState(restored,c).on,false);assert.equal(lampState(restored,c).equipped,true);
 assert.ok(commandLamp(restored,c,'unequip'));assert.equal(lampState(restored,c).equipped,false);assert.ok(commandLamp(restored,c,'toggle'));assert.equal(lampState(restored,c).on,true);
});
test('Equipment conditions, disabled tools and unowned lamps cannot execute; current-state flags are exclusive',()=>{
 const w=world(),c=mechanicsFor(w),p=freshProgress(w);assert.equal(commandLamp(p,c,'toggle'),false);p.flags.push(c.lamp.flag);c.lamp.requires=['permission'];assert.equal(commandLamp(p,c,'toggle'),false);p.flags.push('permission');assert.ok(commandLamp(p,c,'turnOn'));assert.ok(p.flags.includes('equipment:lamp:on'));assert.ok(!p.flags.includes('equipment:lamp:off'));commandLamp(p,c,'unequip');syncEquipmentFlags(p,c);assert.ok(!p.flags.includes('equipment:lamp:on'));assert.equal(p.flags.filter(f=>f==='equipment:lamp:off').length,1);c.lamp.requires=['unavailable'];assert.equal(lampState(p,c).on,false);c.lamp.enabled=false;assert.equal(commandLamp(p,c,'turnOn'),false);
});
test('Mechanics presets, condition gates and equipment actions validate and roundtrip in the world contract',()=>{
 const w=world();w.mechanics=structuredClone(equipmentPreset);w.mechanics.lamp.radius=190;w.interactions['lamp-test']={actions:[{type:'equipment',command:'turnOff',requires:['lampara_encendida']},{type:'equipment',command:'turnOn'}]};assert.deepEqual(parseWorld(JSON.parse(JSON.stringify(w))),w);
 for(const bad of [0,601,NaN]){const next=structuredClone(w);next.mechanics.lamp.radius=bad;assert.throws(()=>parseWorld(next));}const bad=structuredClone(w);bad.interactions['lamp-test'].actions[0].command='shoot';assert.throws(()=>parseWorld(bad));
 const other=JSON.parse(fs.readFileSync('public/worlds/sartre.json','utf8'));assert.equal(mechanicsFor(other).lamp.enabled,false);
});

test('Flashlight migrates only the old default artwork and preserves explicit off state and custom assets',()=>{const w=world();w.mechanics=structuredClone(equipmentPreset);w.mechanics.lamp.asset='assets/sofia-lamp-handheld.png';const adapted=mechanicsFor(w);assert.equal(adapted.lamp.asset,'assets/sofia-actions/flashlight.png');assert.equal(w.mechanics.lamp.asset,'assets/sofia-lamp-handheld.png');const p=restoreProgress(w,{flags:['lampara_encendida'],equipment:{lamp:{equipped:true,on:false}}});assert.equal(lampState(p,adapted).on,false);w.mechanics.lamp.asset='assets/my-tool.png';assert.equal(mechanicsFor(w).lamp.asset,'assets/my-tool.png')});
