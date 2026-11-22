export const CAST_IDS=['diog','beau','camus','aver','ockh','rous','plat','socr','aris','agus','toma','desc','hume','kant','nietz','sartre','fouc'] as const;
export type CastId=typeof CAST_IDS[number];
export function castSprite(id:string){return CAST_IDS.includes(id as CastId)?`cast-${id}.png`:'cast-socr.png'}
export function castPortrait(id:string){return CAST_IDS.includes(id as CastId)?`portrait-${id}.png`:'portrait-socr.png'}
export const COMPANION_FRAMES=['companion-idle.png','companion-step-a.png','companion-step-b.png'];
export const CAVE_PROPS={lamp:'cave-lamp.png',warden:'cave-warden.png',chains:'cave-chains.png',key:'cave-key.png',shadows:'cave-puppet.png',scroll:'cave-papyrus.png'};
export const CAVE_MISSIONS=[
 {flag:'prisoner',title:'Los esclavos de la caverna',goal:'Encuentra al prisionero y escucha cómo entiende las sombras.'},
 {flag:'caveKey',title:'El misterio de las sombras',goal:'Relaciona sombras y objetos; después conversa con el guardián sobre doxa y episteme para conseguir la llave.'},
 {flag:'freed',title:'Romper las cadenas',goal:'Regresa al prisionero con la llave y ofrécele salir contigo.'},
 {flag:'plato',title:'Explorar la luz',goal:'Acompaña al prisionero por el ascenso y conversa con Platón en el exterior.'},
 {flag:'caveCompleted',title:'Llegar a la salida',goal:'Lleva al prisionero hasta la salida de la caverna. Allí termina el rescate y se despide.'}
];
