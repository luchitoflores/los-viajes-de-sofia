import type {WorldDefinition,AuthorProfile,KnowledgeScroll} from './schema';
import {meets} from '../gameplay/conditions.ts';
export interface CollectionExtra {authorProfile?:AuthorProfile;knowledgeScrolls?:KnowledgeScroll[]}
export function enrichCollections(world:WorldDefinition,extra?:CollectionExtra){const w=structuredClone(world);if(!extra)return w;
 w.authorProfile??=extra.authorProfile?structuredClone(extra.authorProfile):undefined;w.knowledgeScrolls??=extra.knowledgeScrolls?structuredClone(extra.knowledgeScrolls):undefined;
 for(const s of w.knowledgeScrolls??[])w.memories[s.id]??={name:s.title,text:'Este pergamino reúne los conocimientos descubiertos en sus misiones.'};return w;
}
export function scrollSections(w:WorldDefinition,flags:string[],id:string){return w.knowledgeScrolls?.find(s=>s.id===id)?.sections.filter(s=>meets(flags,s))??[]}
export function grantKnowledge(w:WorldDefinition,p:{flags:string[];memories:string[]}){const earned:string[]=[];for(const s of w.knowledgeScrolls??[])if(scrollSections(w,p.flags,s.id).length&&!p.memories.includes(s.id)){p.memories.push(s.id);earned.push(s.id)}return earned}
