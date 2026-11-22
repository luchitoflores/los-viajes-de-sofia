/** Los sprites de la biblioteca miran a la derecha en su pose original. */
export function facingFlip(localDifference:number,previous=false){return Math.abs(localDifference)<2?previous:localDifference<0}
export function radialDifference(hero:{x:number;y:number},npc:{x:number;y:number},rotation:number){return(hero.x-npc.x)*Math.cos(rotation)+(hero.y-npc.y)*Math.sin(rotation)}
