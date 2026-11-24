import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseWorld,parseAsset} from '../src/worlds/schema.ts';
import {characterAsset} from '../src/worlds/templates.ts';
import {restorePrisonerPresentation,prisonerArt} from '../src/worlds/prisoner-presentation.ts';
const world=()=>JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8'));
test('Prisoner room has no visible fire source and bound appearances differ from the freed identity',()=>{
 const w=parseWorld(world()),r=w.interiors.prisioneros,bound=r.items.find(o=>o.id==='prisionero-encadenado'),free=r.items.find(o=>o.id==='prisionero-se-queda');
 assert.equal(r.background,'prisoners-shadow-background');assert.equal(r.lighting.lights?.length??0,0);assert.equal(bound.lockFacing,true);assert.equal(bound.characterId,free.characterId);assert.equal(characterAsset(w,bound),'prisoner-bound-back');assert.notEqual(characterAsset(w,bound),characterAsset(w,free));assert.deepEqual(bound.visibleWhen,{excludes:['prisionero_liberado']});
 assert.equal(w.assets['prisoner-bound-back'].animation.frames,6);assert.ok(w.interiors.fuego.lighting.lights.length>0);
 for(const a of Object.values(prisonerArt))assert.ok(fs.existsSync('public/'+a.src));
});
test('Known old background and sprites upgrade without replacing geometry, dialogue or custom appearances',()=>{
 const w=world(),r=w.interiors.prisioneros,previous=w.assets[r.background];r.background='old';w.assets.old={...previous,src:'assets/imported/ec43f3ee-167f-4349-8070-2394379ab0a2-Caverna-de-Platon-a-la-Luz-del-Fuego.png'};
 const bound=r.items.find(o=>o.id==='prisionero-encadenado');delete bound.spriteId;delete bound.lockFacing;
 const geometry=JSON.stringify(r.regions),dialogues=JSON.stringify(w.dialogues);restorePrisonerPresentation(w);assert.equal(r.background,'prisoners-shadow-background');assert.equal(bound.spriteId,'prisoner-bound-back');assert.equal(JSON.stringify(r.regions),geometry);assert.equal(JSON.stringify(w.dialogues),dialogues);parseWorld(w);
 r.background='custom';w.assets.custom={...prisonerArt['prisoners-shadow-background'],src:'assets/my-custom-background.png'};w.assets['custom-person']=structuredClone(w.assets['character-prisionero-sprite']);bound.spriteId='custom-person';restorePrisonerPresentation(w);assert.equal(r.background,'custom');assert.equal(bound.spriteId,'custom-person');
});
test('Animation grids and instance appearances are validated and survive roundtrip',()=>{
 const w=world();assert.deepEqual(parseWorld(JSON.parse(JSON.stringify(w))).assets['prisoner-bound-back'].animation,prisonerArt['prisoner-bound-back'].animation);
 for(const bad of [{columns:0},{rows:1,frames:7},{frameRate:0},{anchorY:2}])assert.throws(()=>parseAsset({...prisonerArt['prisoner-bound-back'],animation:{...prisonerArt['prisoner-bound-back'].animation,...bad}}));
 w.interiors.prisioneros.items[0].spriteId='missing';assert.throws(()=>parseWorld(w));
});
