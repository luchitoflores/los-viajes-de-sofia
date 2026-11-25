import type {WorldDefinition} from './schema';
/** Existing cave saves never have to abandon their mission or collect the lamp again. */
export function restorePlatoSearchProgress(w:WorldDefinition,p:{introComplete:boolean;flags:string[];planet:{collected:string[]};interior:string|null;trail:{interior:string|null}[]}){
 if(w.id!=='plato'||!w.inventoryItems?.['linterna-sofia'])return;
 const add=(flag:string)=>{if(!p.flags.includes(flag))p.flags.push(flag)};
 if(p.introComplete)add('busqueda_linterna_iniciada');
 const advanced=!!p.interior&&p.interior!=='entrada'&&p.interior!=='agora'||p.trail.some(t=>!!t.interior&&t.interior!=='entrada'&&t.interior!=='agora')||['sombras_comprendidas','prisionero_liberado','aventura_platon_completada'].some(f=>p.flags.includes(f));
 if(advanced||p.flags.includes('lampara_encendida')){add('lampara_encendida');if(!p.planet.collected.includes('lampara-sofia'))p.planet.collected.push('lampara-sofia')}
 if(advanced){p.introComplete=true;add('intro-complete');add('busqueda_linterna_iniciada');add('permiso_platon');add('caverna_acceso_autorizado');add('linterna_utilizada')}
}
