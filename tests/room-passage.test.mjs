import {test} from 'node:test';
import assert from 'node:assert/strict';
import {crossingPassage} from '../src/gameplay/room-passage.ts';
const left={id:'back',type:'door',x:55,passage:'left'},right={id:'next',type:'door',x:1200,passage:'right'};
const floor=()=>560;
test('walking crossings are directional and never trigger while standing',()=>{
 assert.equal(crossingPassage([left,right],1174,1178,560,floor),right);
 assert.equal(crossingPassage([left,right],82,78,560,floor),left);
 assert.equal(crossingPassage([left,right],60,64,560,floor),undefined);
 assert.equal(crossingPassage([left,right],1200,1200,560,floor),undefined);
});
test('nearby props, explicit portals and other floors cannot auto-activate',()=>{
 assert.equal(crossingPassage([{...right,passage:'manual'}],1174,1178,560,floor),undefined);
 assert.equal(crossingPassage([{...right,type:'prisoner'}],1174,1178,560,floor),undefined);
 assert.equal(crossingPassage([right],1174,1178,320,floor),undefined);
 assert.equal(crossingPassage([right],400,404,560,floor),undefined);
});
