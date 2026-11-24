import test from 'node:test';import assert from 'node:assert/strict';
import {createInteriorJump,stepInteriorJump} from '../src/gameplay/interior-jump.ts';
import {restorePlatoContinuity} from '../src/worlds/plato-compatibility.ts';
import {readFileSync} from 'node:fs';
test('Interior jumping is explicit, lands and cannot repeat while Space is held',()=>{
 const s=createInteriorJump();for(let i=0;i<10;i++)stepInteriorJump(s,false,560,.016);assert.equal(s.y,560);assert.equal(s.airborne,false);
 stepInteriorJump(s,true,560,.016);assert.equal(s.airborne,true);let highest=s.y;
 for(let i=0;i<180;i++){stepInteriorJump(s,true,560,.016);highest=Math.min(highest,s.y)}
 assert.ok(highest<490);assert.equal(s.y,560);assert.equal(s.airborne,false);
 stepInteriorJump(s,false,560,.016);stepInteriorJump(s,true,560,.016);assert.equal(s.airborne,true);
});
test('The authored export repairs only its known broken stair anchors and access wall in local drafts',()=>{
 const w=JSON.parse(readFileSync('public/worlds/plato.json','utf8')),room=w.interiors.ascenso,regions=Object.fromEntries(room.regions.map(r=>[r.id,r]));
 Object.assign(regions['escalera-pintada'],{x:227,y:400,w:243,h:186,bottom:586});
 Object.assign(regions['paso-piedra'],{x:748,y:177,w:256,h:479,bottom:392});Object.assign(regions['limite-roca'],{x:980,y:0,w:300,h:720});
 const items=structuredClone(room.items),text=w.dialogues['entrada-observacion'].nodes.oscuro.text;
 restorePlatoContinuity(w);assert.equal(regions['escalera-pintada'].bottom,560);assert.equal(regions['paso-piedra'].x,765);assert.equal(regions['limite-roca'].y,280);assert.deepEqual(room.items,items);assert.equal(w.dialogues['entrada-observacion'].nodes.oscuro.text,text);
 regions['paso-piedra'].x=751;regions['paso-piedra'].bottom=380;restorePlatoContinuity(w);assert.equal(regions['paso-piedra'].x,751);assert.equal(regions['paso-piedra'].bottom,380);
});
test('The existing stair walking follows changing ground without automatically jumping; headroom caps ascent',()=>{
 const s=createInteriorJump();for(const y of [560,530,495,460,400]){stepInteriorJump(s,false,y,.05);assert.equal(s.y,y);assert.equal(s.airborne,false)}
 stepInteriorJump(s,true,400,.05,395);assert.equal(s.y,395);assert.ok(s.velocity>=0);
 for(let i=0;i<100;i++)stepInteriorJump(s,false,400,.016,395);assert.equal(s.y,400);assert.equal(s.airborne,false);
});
