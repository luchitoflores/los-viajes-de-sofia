import {dialoguePlaces} from '../src/worlds/scene-dialogues.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {combatPreset,parseCombatEncounter,createCombat,stepCombat} from '../src/gameplay/combat.ts';
import {parseWorld} from '../src/worlds/schema.ts';
import {freshProgress,restoreProgress,gate} from '../src/engine/progression.ts';
import {restoreCombatContent} from '../src/worlds/combat-compatibility.ts';
const floor={floorAt:()=>560,canMove:()=>true};
const config=()=>structuredClone(combatPreset);
test('Pulse cadence, single impacts, victory and projectile cleanup',()=>{
 const c=config(),s=createCombat(c,true),hero={x:200,y:560,facing:1};let victories=0;
 for(let i=0;i<250;i++){const r=stepCombat(c,s,hero,.02,{attack:true},floor);victories+=Number(r.victory)}
 assert.equal(s.enemyHp,0);assert.equal(s.status,'defeated');assert.equal(victories,1);assert.deepEqual(s.projectiles,[]);
});
test('Pause freezes all damage, timing and projectiles; no attacks before activation',()=>{
 const c=config(),s=createCombat(c),hero={x:200,y:560,facing:1};stepCombat(c,s,hero,1,{attack:true},floor);assert.equal(s.time,0);assert.equal(s.projectiles.length,0);
 s.status='active';stepCombat(c,s,hero,.02,{attack:true},floor);const before=structuredClone(s);for(let i=0;i<100;i++)stepCombat(c,s,hero,.04,{attack:true,paused:true},floor);assert.deepEqual(s,before);
});
test('Slow spheres can defeat Sofia; retry restores health and does not touch learning',()=>{
 const c=config(),s=createCombat(c,true),hero={x:300,y:560,facing:1};for(let i=0;i<1000&&s.status==='active';i++)stepCombat(c,s,hero,.04,{attack:false},floor);
 assert.equal(s.status,'retry');assert.equal(s.heroHp,0);assert.deepEqual(s.projectiles,[]);const retry=createCombat(c,true);assert.equal(retry.heroHp,3);assert.equal(retry.enemyHp,3);
});
test('Contact invulnerability prevents frame damage; patrol and chase respect zone and floor',()=>{
 const c=config();c.attack.type='contact';c.attack.interval=.3;c.behavior='chase';const s=createCombat(c,true),hero={x:465,y:560,facing:1};for(let i=0;i<20;i++)stepCombat(c,s,hero,.02,{attack:false},floor);assert.equal(s.heroHp,2);
 c.attack.type='none';for(let i=0;i<2000;i++)stepCombat(c,s,{x:9999,y:560,facing:-1},.04,{attack:false},{floorAt:x=>560-x/100,canMove:()=>true});assert.ok(s.enemyX<=c.zone.max);assert.equal(s.enemyY,560-s.enemyX/100);
});
test('World encounter references, bounds and presets are validated',()=>{
 const w=JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8'));assert.equal(parseWorld(w).interiors.fuego.encounters.length,1);assert.deepEqual(dialoguePlaces(w).filter(p=>p.trigger==='combat').map(p=>p.scene),['fuego','fuego']);
 for(const change of [c=>c.hp=0,c=>c.zone.max=50000,c=>c.beforeDialogue='missing',c=>c.asset='missing',c=>c.characterId='missing',c=>c.attack.interval=0]){const raw=structuredClone(w);change(raw.interiors.fuego.encounters[0]);assert.throws(()=>parseWorld(raw))}
 for(const c of JSON.parse(fs.readFileSync('public/presets/combat-lab.json','utf8')))assert.ok(parseCombatEncounter(c));
});
test('Investigation gates, migration and defeated saves retain the previous adventure',()=>{
 const w=parseWorld(JSON.parse(fs.readFileSync('public/worlds/plato.json','utf8'))),p=freshProgress(w);p.introComplete=true;assert.equal(gate(w,p,'examinar-fuego').allowed,false);p.flags.push('encapuchado_vencido');assert.equal(gate(w,p,'examinar-fuego').allowed,true);
 p.combats={'caverna-encapuchado':{state:'defeated',attempts:2}};const restored=restoreProgress(w,p);assert.deepEqual(restored.combats,p.combats);assert.ok(!restored.flags.includes('aventura_platon_completada'));
 const old=structuredClone(w);delete old.interiors.fuego.encounters;delete old.dialogues['encapuchado-inicio'];const pack=JSON.parse(fs.readFileSync('public/worlds/plato-combat.json','utf8'));const migrated=restoreCombatContent(old,pack);assert.equal(migrated.interiors.fuego.encounters.length,1);assert.equal(restoreCombatContent(migrated,pack),migrated);migrated.interiors.fuego.encounters=[];assert.equal(restoreCombatContent(migrated,pack).interiors.fuego.encounters.length,0,'An explicitly deleted encounter must not reappear');
 const advanced=restoreProgress(w,{flags:['sombras_comprendidas']});assert.equal(advanced.combats['caverna-encapuchado'].state,'defeated');
});
