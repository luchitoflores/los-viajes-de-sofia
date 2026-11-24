export interface Conditions {requires?:string[];excludes?:string[]}
export function meets(flags:string[],when:Conditions|undefined){return !when||((when.requires??[]).every(f=>flags.includes(f))&&!(when.excludes??[]).some(f=>flags.includes(f)))}
