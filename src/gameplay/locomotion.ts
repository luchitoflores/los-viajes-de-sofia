/** Pure side-view actor controller. No Phaser, DOM, missions, philosophers or save keys. */
export interface MovementProfile {format:'sofia-movement';version:1;id:string;walk:boolean;run:boolean;jump:boolean;crouch:boolean;speed:number;runMultiplier:number;crouchMultiplier:number;jumpSpeed:number;gravity:number;height:number;crouchHeight:number}
export const explorationProfile:MovementProfile={format:'sofia-movement',version:1,id:'exploration-side',walk:true,run:true,jump:true,crouch:true,speed:220,runMultiplier:1.65,crouchMultiplier:.4,jumpSpeed:490,gravity:1250,height:118,crouchHeight:100};
export function parseMovement(value:unknown):MovementProfile{
 const p=value as MovementProfile;if(!p||p.format!=='sofia-movement'||p.version!==1||!(/^[a-z][a-z0-9-]{0,70}$/).test(p.id)||!['walk','run','jump','crouch'].every(k=>typeof p[k as keyof MovementProfile]==='boolean')||![[p.speed,30,600],[p.runMultiplier,1,3],[p.crouchMultiplier,.1,1],[p.jumpSpeed,80,900],[p.gravity,100,3000],[p.height,40,300],[p.crouchHeight,20,p.height]].every(([v,min,max])=>Number.isFinite(v)&&v>=min&&v<=max))throw Error('Preset de movimiento inválido.');return structuredClone(p);
}
export type Motion='idle'|'walk'|'run'|'crouch'|'rise'|'apex'|'fall';
export interface ActorState {x:number;y:number;vx:number;vy:number;grounded:boolean;facing:1|-1;motion:Motion;height:number;wasJump:boolean}
export interface ActorInput {axis:number;run:boolean;crouch:boolean;jump:boolean;blocked?:boolean}
export interface ActorEnvironment {minX:number;maxX:number;floorAt:(x:number)=>number|null;canStand?:(state:ActorState)=>boolean;canMove?:(x:number,y:number,height:number)=>boolean}
export const createActor=(x:number,y:number):ActorState=>({x,y,vx:0,vy:0,grounded:true,facing:1,motion:'idle',height:118,wasJump:false});
export function stepActor(s:ActorState,input:ActorInput,p:MovementProfile,delta:number,env:ActorEnvironment){
 const dt=Math.max(0,Math.min(.04,delta));if(input.blocked){s.vx=0;s.wasJump=input.jump;return s}
 const duck=s.grounded&&p.crouch&&(input.crouch||(s.motion==='crouch'&&env.canStand?.(s)===false));s.height=duck?p.crouchHeight:p.height;
 const axis=p.walk?Math.max(-1,Math.min(1,input.axis)):0,running=p.run&&input.run&&!duck;
 s.vx=axis*p.speed*(duck?p.crouchMultiplier:running?p.runMultiplier:1);if(axis)s.facing=axis<0?-1:1;
 const x=Math.max(env.minX,Math.min(env.maxX,s.x+s.vx*dt));if(env.canMove?.(x,s.y,s.height)!==false)s.x=x;else s.vx=0;
 if(p.jump&&input.jump&&!s.wasJump&&s.grounded&&!duck){s.vy=-p.jumpSpeed;s.grounded=false}s.wasJump=input.jump;
 const floor=env.floorAt(s.x),before=s.y;
 if(!s.grounded){s.y+=s.vy*dt;s.vy+=p.gravity*dt;if(floor!==null&&s.vy>=0&&before<=floor+1&&s.y>=floor){s.y=floor;s.vy=0;s.grounded=true}}
 else if(floor!==null&&Math.abs(floor-s.y)<25){s.y=floor;s.vy=0}else{s.grounded=false;s.vy=0}
 s.motion=!s.grounded?(s.vy<-55?'rise':s.vy>55?'fall':'apex'):duck?'crouch':Math.abs(s.vx)<1?'idle':running?'run':'walk';return s;
}
