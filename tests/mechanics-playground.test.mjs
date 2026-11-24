import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MODES,makeSequence,nextTarget,normalizedAxis,scoreImpact,clamp} from '../src/playground-mecanicas/core.js';

test('all playground experiences have distinct stable targets and pedagogical feedback',()=>{
  for(const id of Object.keys(MODES)){
    const targets=makeSequence(id);
    if(id==='movement')assert.equal(targets.length,0,'Free movement mode should not spawn educational targets');
    else assert.ok(targets.length>=3);
    assert.equal(new Set(targets.map(t=>t.id)).size,targets.length);
    for(const target of targets){
      assert.ok(target.label&&target.tag&&target.explanation);
      assert.equal(typeof target.valid,'boolean');
    }
    if(targets.length) assert.deepEqual(nextTarget(targets,targets.length),targets[0]);
  }
});
test('player must distinguish falacies and bad faith from non-fallacious alternatives',()=>{
  for(const id of ['fallacies','badFaith']){
    const list=makeSequence(id);
    assert.ok(list.some(t=>t.valid));
    assert.ok(list.some(t=>!t.valid));
  }
});
test('hits reward good selections, penalize false positives',()=>{
  assert.equal(scoreImpact({valid:true,tag:'X',explanation:'E'}).points,10);
  assert.equal(scoreImpact({valid:false,tag:'X',explanation:'E'}).points,-5);
});
test('movement vector normalization prevents a faster diagonal',()=>{
  const n=normalizedAxis(1,1);
  assert.ok(Math.abs(Math.hypot(n.x,n.y)-1)<1e-12);
  assert.deepEqual(normalizedAxis(0,1),{x:0,y:1});
  assert.equal(clamp(900,130,480),480);
});
test('invalid scene mode is rejected before loading targets',()=>{
  assert.throws(()=>makeSequence('missing'),/desconocido/);
});

test('Free walking is separated from cognitive minigames',()=>{
  assert.equal(MODES.movement.id,'movement');
  assert.equal(MODES.movement.background,'cave');
  assert.equal(makeSequence('movement').length,0);
});
