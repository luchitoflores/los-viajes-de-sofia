import test from 'node:test';import assert from 'node:assert/strict';
import {restartChanges,applyRestart} from '../src/engine/restart.ts';
import {freshPlanet} from '../src/planet-model.ts';
import {profileKey,canWriteProgress,setProgressWrites} from '../src/engine/play-session.ts';
const K='sofia-universe-progress-v1',L='sofia_phaser_real_v02',P='sofia-polis-radial-v1';
function storage(values={}){const m=new Map(Object.entries(values));return{m,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}}
const save={version:1,last:'camus',worlds:{camus:{introComplete:true,flags:['done'],choices:{choice:'yes'}},kant:{introComplete:true,flags:['kant-duty','met:camus','met:older-character']}},journeys:[{world:'camus'}],characterMemory:{camus:['camus:arrival'],clara:['heidegger:time','camus:guest']}};
test('Reiniciar un mundo borra su progreso y recuerdos sin borrar los demás ni el otro modo',()=>{
 const s=storage({[K]:JSON.stringify(save),[K+'-story']:'historia intacta',[L]:'legacy intacto'}),changes=restartChanges(s,'free','camus');applyRestart(s,changes);const p=JSON.parse(s.getItem(K));
 assert.equal(p.last,'camus');assert.equal(p.worlds.camus,undefined);assert.deepEqual(p.worlds.kant.flags,['kant-duty','met:older-character']);assert.deepEqual(p.characterMemory,{clara:['heidegger:time']});assert.deepEqual(p.journeys,[]);assert.equal(s.getItem(K+'-story'),'historia intacta');assert.equal(s.getItem(L),'legacy intacto');
});
test('Reiniciar el modo conserva las composiciones de la Polis y los interiores del editor',()=>{
 const planet=freshPlanet();planet.objects[0].angleDeg=51;planet.objects[0].label='Mi nave';planet.collected=['vase'];planet.discovered=['scroll'];planet.angle=6;planet.returnAnchor={id:'door',angle:2,height:0};
 const rooms={shadows:{items:[{id:'propio',label:'Objeto del autor'}],regions:[]}},s=storage({[profileKey(K,'story')]:JSON.stringify(save),[profileKey(L,'story')]:JSON.stringify({level:'shadows',flags:{freed:true},userScenes:rooms}),[profileKey(P,'story')]:JSON.stringify(planet),[K]:'libre intacto','sofia-universe-catalog-v1':'catalogo intacto'});
 applyRestart(s,restartChanges(s,'story',null));const p=JSON.parse(s.getItem(K+'-story')),legacy=JSON.parse(s.getItem(L+'-story')),surface=JSON.parse(s.getItem(P+'-story'));
 assert.deepEqual(p.worlds,{});assert.equal(p.last,null);assert.deepEqual(p.characterMemory,{});assert.deepEqual(legacy.userScenes,rooms);assert.deepEqual(legacy.flags,{});assert.equal(legacy.level,'polis');assert.deepEqual(surface.objects,planet.objects);assert.deepEqual(surface.collected,[]);assert.equal(surface.returnAnchor,null);assert.equal(s.getItem(K),'libre intacto');assert.equal(s.getItem('sofia-universe-catalog-v1'),'catalogo intacto');
});
test('Reiniciar Platón conserva visitas antiguas y sus diseños, pero limpia la caverna',()=>{
 const raw={level:'ascent',flags:{freed:true,caveCompleted:true},positions:{ascent:900,modern:730},learned:['opinion','doubt'],met:['plat','socr','desc'],memories:['light','other'],seen:['polis','shadows','modern'],userScenes:{ascent:{items:[],regions:[]}}},s=storage({[L]:JSON.stringify(raw)});
 applyRestart(s,restartChanges(s,'free','plato'));const p=JSON.parse(s.getItem(L));assert.deepEqual(p.flags,{});assert.deepEqual(p.positions,{modern:730});assert.deepEqual(p.learned,['doubt']);assert.deepEqual(p.met,['desc']);assert.deepEqual(p.memories,['other']);assert.deepEqual(p.userScenes,raw.userScenes);
});
test('Un fallo de escritura restaura las claves que ya se habían cambiado',()=>{
 const s=storage({a:'anterior',b:'otro'});let failed=false;const set=s.setItem;s.setItem=(k,v)=>{if(k==='b'&&!failed){failed=true;throw Error('fallo simulado')}return set(k,v)};
 assert.throws(()=>applyRestart(s,{a:'nuevo',b:'nuevo'}));assert.equal(s.getItem('a'),'anterior');assert.equal(s.getItem('b'),'otro');
});
test('Los IDs con prefijos compartidos no borran recuerdos del otro planeta',()=>{
 const s=storage({[K]:JSON.stringify({version:1,worlds:{foo:{},'foo:bar':{flags:['kept']}},characterMemory:{npc:['foo:start','foo:bar:room']}})});applyRestart(s,restartChanges(s,'free','foo'));assert.deepEqual(JSON.parse(s.getItem(K)).characterMemory.npc,['foo:bar:room']);
 setProgressWrites(false);assert.equal(canWriteProgress(),false);setProgressWrites(true);assert.equal(canWriteProgress(),true);
});
