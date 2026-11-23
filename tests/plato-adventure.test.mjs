import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {parseWorld} from '../src/worlds/schema.ts';
import {meets} from '../src/worlds/narrative.ts';
import {freshProgress,restoreProgress,dialogueNode,chooseDialogue,gate,reward} from '../src/engine/progression.ts';
import {groundAt} from '../src/worlds/templates.ts';
const raw=()=>JSON.parse(readFileSync(new URL('../public/worlds/plato.json',import.meta.url),'utf8'));
const finish=(w,p,id,answer)=>{for(let n=0;n<30;n++){const current=dialogueNode(w,p,id),available=current.node.choices.filter(c=>meets(p.flags,c)),choice=available.find(c=>c.id===answer)??available[0];assert.ok(choice);chooseDialogue(w,p,id,current.id,choice.id);if(!choice.next)return}throw Error('Diálogo sin final')};

test('Platón preserves five cave rooms and adds the agora and both endings require return and second ascent',()=>{
 const w=parseWorld(raw());assert.ok(['entrada','prisioneros','fuego','ascenso','salida','agora'].every(id=>w.interiors[id]));assert.equal(Object.keys(w.activities).length,0);
 for(const ending of ['quedarse','exterior']){
  const p=freshProgress(w);finish(w,p,w.intro);assert.equal(gate(w,p,'prisioneros-ascenso').allowed,false);
  finish(w,p,'prisionero');assert.ok(!p.flags.includes('prisionero_acepta'));
  for(const object of ['fuego','caballo','figura'])finish(w,p,'observar-'+object);
  assert.equal(gate(w,p,'comprender-sombras').allowed,true);finish(w,p,'origen-sombras','escuchar');assert.equal(dialogueNode(w,p,'prisionero').id,'evidencias');
  finish(w,p,'prisionero','mostrar');reward(p,w.interactions['liberar-cadenas'].actions[0].reward);assert.ok(meets(p.flags,w.journey.companion));assert.equal(gate(w,p,'prisioneros-ascenso').allowed,true);
  finish(w,p,'primera-salida');assert.equal(gate(w,p,'salida-planeta').allowed,false);assert.equal(dialogueNode(w,p,'companero').id,'volver');
  finish(w,p,'regreso-conflicto','preguntar');assert.equal(dialogueNode(w,p,'companero').id,'decidir');finish(w,p,'companero',ending);assert.ok(p.flags.includes('decision_final_prisionero'));assert.equal(p.flags.includes('prisionero_se_queda'),ending==='quedarse');
  assert.equal(gate(w,p,'salida-planeta').allowed,false);finish(w,p,'cierre');assert.equal(gate(w,p,'salida-planeta').allowed,true);assert.ok(p.flags.includes('segundo_ascenso_completado'));assert.ok(p.flags.includes(w.journey.completionFlag));assert.deepEqual(restoreProgress(w,p).flags,p.flags);
 }
});
test('Shared stair landings join continuously on ascent and descent',()=>{
 const i=parseWorld(raw()).interiors.ascenso;
 for(const x of [165,470,765,830])assert.ok(Math.abs(groundAt(i,x-.001)-groundAt(i,x+.001))<.01);
 assert.equal(groundAt(i,0),560);assert.equal(groundAt(i,900),215);assert.equal(groundAt(i,765),400);
});
test('Narrative inputs reject invalid light, events, companion identity and conditional dialogue dead ends',()=>{
 for(const change of [w=>w.interiors.entrada.lighting.darkness=2,w=>w.interiors.entrada.lighting.lights[0].radius=-1,w=>w.interiors.entrada.events[0].behavior='missing',w=>w.journey.companion.characterId='missing',w=>w.interiors.ascenso.regions[3].bottom=-1,w=>{w.dialogues.companero.nodes['segunda-vez'].choices[0].next='segunda-vez'}]){const w=raw();change(w);assert.throws(()=>parseWorld(w))}
});
