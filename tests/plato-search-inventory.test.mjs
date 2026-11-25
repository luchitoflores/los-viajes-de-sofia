import {collectedItems} from '../src/worlds/inventory.ts';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseWorld,configurePrimaryBehavior} from '../src/worlds/schema.ts';
import {freshProgress,restoreProgress,chooseDialogue,dialogueNode,reward,gate} from '../src/engine/progression.ts';
import {activeObjective,syncMissionProgress} from '../src/worlds/mission-progress.ts';
import {syncInventoryFlags,ownsItem,itemCommandStatus,executeItemCommand} from '../src/worlds/inventory-operations.ts';
import {restorePlatoSearch} from '../src/worlds/plato-search.ts';
import {mechanicsFor,commandLamp,lampState} from '../src/gameplay/equipment.ts';
const world=()=>parseWorld(JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8')));
const finish=(w,p,id)=>{for(let i=0;i<30;i++){const {id:node,node:n}=dialogueNode(w,p,id),c=n.choices[0];chooseDialogue(w,p,id,node,c.id);if(!c.next)return}throw Error('Dialogue loop')};
test('Search starts after meeting Plato; the lamp is in room A and room B requires return and actual light',()=>{
 const w=world(),p=freshProgress(w);assert.equal(activeObjective(w,p.flags),null);assert.ok(!w.surface.objects.some(o=>o.behavior==='recoger-linterna'));
 finish(w,p,w.intro);assert.equal(activeObjective(w,p.flags).stage.id,'buscar-linterna');assert.equal(gate(w,p,'entrada-caverna').allowed,true);assert.equal(gate(w,p,'entrada-prisioneros').allowed,false);
 const o=w.interiors.entrada.items.find(o=>o.id==='lampara-sofia'),a=w.interactions[o.behavior].actions[0];assert.equal(a.type,'collect');assert.equal(a.item,'linterna-sofia');assert.equal(o.integrated,false);
 p.planet.collected.push(o.id);reward(p,a.reward);syncInventoryFlags(w,p);syncMissionProgress(w,p);assert.ok(ownsItem(w,p,'linterna-sofia'));assert.equal(lampState(p,mechanicsFor(w),'entrada').on,false);
 assert.equal(activeObjective(w,p.flags).stage.id,'regresar-platon');assert.equal(gate(w,p,'entrada-prisioneros').allowed,false);
 finish(w,p,'linterna-regreso');syncMissionProgress(w,p);assert.ok(p.flags.includes('caverna_acceso_autorizado'));assert.equal(gate(w,p,'entrada-prisioneros').allowed,true);
 assert.ok(w.interactions['entrada-prisioneros'].actions.find(a=>a.type==='enter').requires.includes('equipment:lamp:on'));
 assert.ok(commandLamp(p,mechanicsFor(w),'turnOn','entrada'));assert.ok(lampState(p,mechanicsFor(w),'entrada').on);assert.equal(lampState(p,mechanicsFor(w),'surface').on,false);
});
test('Equipment, use, recipient proximity and consumption share reusable item conditions and persist',()=>{
 const w=world();w.inventoryItems.key={name:'Llave',asset:'scroll',category:'Llave',description:'Una llave de prueba.',functionality:'Abre un mecanismo.',commands:{equip:{label:'Equipar',actions:[{type:'record',reward:{flags:[]}}]},use:{label:'Usar',requires:['key-permission'],scenes:['entrada'],actions:[{type:'record',reward:{flags:['mechanism-open']}}]},give:{label:'Entregar',recipient:'plat',scenes:['surface'],consume:true,actions:[{type:'record',reward:{flags:['gift-done']}}]}}};
 w.interiors.entrada.items.push({id:'key-object',type:'scroll',x:300,y:560,label:'Llave',behavior:'pickup-key'});w.interactions['pickup-key']={actions:[{type:'collect',item:'key',text:'Llave recogida.'}]};parseWorld(w);
 const p=freshProgress(w);p.planet.collected.push('key-object');syncInventoryFlags(w,p);executeItemCommand(w,p,'key','equip','entrada');assert.ok(p.flags.includes('inventory:key:equipped'));
 assert.throws(()=>executeItemCommand(w,p,'key','use','entrada'));assert.ok(!p.inventoryState.key.used);p.flags.push('key-permission');const actions=executeItemCommand(w,p,'key','use','entrada');reward(p,actions[0].reward);assert.ok(p.flags.includes('mechanism-open'));
 assert.equal(itemCommandStatus(w,p,'key','give','surface').allowed,false);executeItemCommand(w,p,'key','give','surface',[],['plat']);assert.ok(!ownsItem(w,p,'key'));assert.ok(p.flags.includes('inventory:key:given'));
 const restored=restoreProgress(w,JSON.parse(JSON.stringify(p)));assert.ok(restored.inventoryState.key.given);assert.ok(!ownsItem(w,restored,'key'));assert.throws(()=>executeItemCommand(w,restored,'key','give','surface',[],['plat']));
 const carried=freshProgress(w);assert.equal(itemCommandStatus(w,carried,'key','equip','entrada',['key']).allowed,true);
});
test('Advanced cave saves gain inventory continuity without replaying the introduction or changing explicit off state',()=>{
 const w=world(),p=restoreProgress(w,{introComplete:true,interior:'fuego',interiorX:550,flags:['sombras_comprendidas'],equipment:{lamp:{equipped:true,on:false}}});
 assert.equal(p.interior,'fuego');assert.equal(p.interiorX,550);assert.ok(p.flags.includes('caverna_acceso_autorizado'));assert.ok(p.planet.collected.includes('lampara-sofia'));assert.ok(ownsItem(w,p,'linterna-sofia'));assert.equal(lampState(p,mechanicsFor(w),'fuego').on,false);
 assert.deepEqual(restoreProgress(w,p).flags,p.flags);
});
test('Older author drafts retain custom text, item position and unrelated actions while gaining the quest',()=>{
 const w=world(),pack=JSON.parse(fs.readFileSync('public/worlds/plato-search-introduction.json','utf8'));
 delete w.inventoryItems;delete w.mechanics;w.missions=w.missions.filter(m=>!m.stages&&m.flag!=='linterna_utilizada');w.missions.unshift({flag:'lampara_encendida',title:'Una luz propia',goal:'Enciende la lámpara.'});w.dialogues.arrival={start:'bienvenida',nodes:{bienvenida:{speaker:'Platón',characterId:'plat',text:'Mi bienvenida personalizada',choices:[{id:'seguir',text:'Continuar'}]}}};w.interactions.mentor={actions:[{type:'talk',target:'arrival'}]};const lamp=w.interiors.entrada.items.find(o=>o.id==='lampara-sofia');lamp.behavior='encender-lampara';delete lamp.asset;w.interiors.entrada.items.find(o=>o.id==='lampara-sofia').x=620;w.interactions.mentor.actions.push({type:'record',reward:{flags:['custom-result']}});
 const next=parseWorld(restorePlatoSearch(w,pack));assert.equal(next.dialogues.arrival.nodes.bienvenida.text,'Mi bienvenida personalizada');assert.equal(next.interiors.entrada.items.find(o=>o.id==='lampara-sofia').x,620);assert.deepEqual(next.interactions.mentor.actions.at(-1),w.interactions.mentor.actions.at(-1));assert.deepEqual(restorePlatoSearch(next,pack),next);
});
test('Definitions reject broken item links, recursive operations and self-completing mission stages',()=>{
 for(const mutate of [w=>w.inventoryItems['linterna-sofia'].asset='missing',w=>w.interactions['recoger-linterna'].actions[0].item='missing',w=>w.inventoryItems['linterna-sofia'].commands.use.actions=[{type:'inventory',item:'linterna-sofia',command:'use'}],w=>w.missions[0].stages[0].completeWhen=[w.missions[0].flag]]){const w=world();mutate(w);assert.throws(()=>parseWorld(w))}
 const old={actions:[{type:'collect',item:'linterna-sofia',text:'Antes',reward:{flags:['kept']}},{type:'record',reward:{flags:['tail']}}]};const next=configurePrimaryBehavior(old,{type:'collect',text:'Editado'},[]);assert.equal(next.actions[0].item,'linterna-sofia');assert.deepEqual(next.actions[1],old.actions[1]);
});

test('Collected tools retain discovery, meaning and ownership if their scene appearance is later removed',()=>{const w=world(),p=freshProgress(w);p.planet.collected.push('lampara-sofia');syncInventoryFlags(w,p);assert.equal(p.inventoryState['linterna-sofia'].sourceScene,'entrada');w.interiors.entrada.items=w.interiors.entrada.items.filter(o=>o.id!=='lampara-sofia');const restored=restoreProgress(w,p);assert.ok(ownsItem(w,restored,'linterna-sofia'));const item=collectedItems(w,restored.planet.collected,restored.inventoryState)[0];assert.equal(item.itemId,'linterna-sofia');assert.match(item.description,/linterna portátil/);assert.equal(item.scene,w.interiors.entrada.name)});
