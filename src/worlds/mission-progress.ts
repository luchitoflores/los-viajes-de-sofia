import {meets} from '../gameplay/conditions.ts';
import type {WorldDefinition,MissionStage} from './schema';
export const stageComplete=(stage:MissionStage,flags:string[])=>stage.completeWhen.every(f=>flags.includes(f));
export function activeObjective(w:WorldDefinition,flags:string[]){
 const mission=w.missions.find(m=>!flags.includes(m.flag));if(!mission||!meets(flags,mission))return null;
 const stage=mission.stages?.find(s=>!stageComplete(s,flags));if(stage&&!meets(flags,stage))return null;
 return{mission,stage,title:stage?.title??mission.title,goal:stage?.goal??mission.goal,key:mission.flag+'/'+(stage?.id??'main')};
}

export function syncMissionProgress(w:WorldDefinition,p:{flags:string[];concepts:string[];memories:string[]}){for(let pass=0;pass<w.missions.length;pass++){let changed=false;for(const m of w.missions)if(m.stages&&!p.flags.includes(m.flag)&&meets(p.flags,m)&&m.stages.every(s=>stageComplete(s,p.flags))){p.flags.push(m.flag);for(const key of ['flags','concepts','memories'] as const)for(const id of m.reward?.[key]??[])if(!p[key].includes(id))p[key].push(id);changed=true}if(!changed)break}}
