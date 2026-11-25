import type {WorldDefinition} from './schema';
import {restorePrisonerPresentation} from './prisoner-presentation.ts';
import {restoreCaveTravel} from './cave-travel-presentation.ts';

/** Repair known prototype links while retaining authored scenes and progress IDs. */
export function restorePlatoContinuity(w:WorldDefinition):WorldDefinition{
 const flag='lampara_encendida',dialogue=w.dialogues['entrada-observacion'],room=w.interiors.prisioneros,door=w.interactions['entrada-prisioneros'];
 if(w.id!=='plato'||!w.journey)return w;
 // Legacy exported stair endpoints must meet the author's moved landing; do not replace custom explicit anchors.
 const ascent=w.interiors.ascenso,landing=ascent?.regions.find(r=>r.id==='descanso'),first=ascent?.regions.find(r=>r.id==='escalera-pintada'),upper=ascent?.regions.find(r=>r.id==='paso-piedra');
 if(landing?.y===400&&first?.bottom===undefined&&first?.y===310&&first?.h===250){first.y=400;first.h=160;first.bottom=560}
 if(landing?.y===400&&upper?.bottom===undefined&&upper?.y===215&&upper?.h===345){upper.bottom=400;upper.h=185}
 // Exact geometry from the author's 24-Nov export: preserve all unrelated custom edits.
 if(first?.x===227&&first.y===400&&first.w===243&&first.bottom===586){first.bottom=560;first.h=160}
 if(upper?.x===748&&upper.y===177&&upper.w===256&&upper.bottom===392){Object.assign(upper,{x:765,y:210,w:219,h:190,bottom:400})}
 const rock=ascent?.regions.find(r=>r.id==='limite-roca'),exit=ascent?.items.find(o=>o.id==='ascenso-salida');
 if(exit?.x===1141&&rock?.x===980&&rock.y===0&&rock.w===300&&rock.h===720){rock.y=280;rock.h=440}

 if(!w.inventoryItems?.['linterna-sofia']&&dialogue&&room?.lighting?.lampFlag===flag&&door&&w.interactions['encender-lampara']?.actions.some(a=>'reward' in a&&a.reward?.flags?.includes(flag))){
 dialogue.reward={...dialogue.reward,flags:[...new Set([...(dialogue.reward?.flags??[]),flag])]};
 door.requires=[...new Set([...(door.requires??[]),flag])];
 if(!room.events?.some(e=>e.id==='recuperar-lampara'))room.events=[{id:'recuperar-lampara',from:0,to:room.width,behavior:'encender-lampara',excludes:[flag]},...(room.events??[])];
 }
 const fire=w.interiors.fuego;
 if(fire&&w.interiors.ascenso&&!fire.items.some(o=>o.id==='fuego-ascenso')){
  fire.items.push({id:'fuego-ascenso',type:'door',x:1130,y:560,label:'Arco hacia el ascenso',integrated:true,behavior:'fuego-ascenso',hotspot:{x:1130,y:430,w:160,h:250},tooltip:'Este arco conduce al camino del ascenso. Puedes cruzarlo cuando el prisionero esté liberado.'});
  w.interactions['fuego-ascenso']??={requires:['prisionero_liberado'],blockedText:'Antes de subir, regresa a la sala de los prisioneros y libera a quien aceptó acompañarte. Luego podéis cruzar este arco.',actions:[{type:'enter',target:'ascenso'}]};
 }
 const temple=w.surface.objects.find(o=>o.id==='temple');
 if(temple&&(temple.behavior==='observar-polis'||!temple.behavior)){
  w.assets['agora-bg']??={src:'assets/polis-library-v2.png',width:1280,height:720,kind:'rock',label:'Interior del templo y ágora'};
  w.interiors.agora??={viewport:{width:1280,height:720},template:'room',backgroundGround:470,name:'Ágora · Templo de la Polis',subtitle:'Un lugar para leer y conversar',background:'agora-bg',width:1280,floor:560,spawn:{x:160,y:560},regions:[{id:'floor',type:'floor',x:0,y:560,w:1280,h:160}],items:[{id:'agora-entrada',type:'door',x:55,y:560,label:'Salir del templo',integrated:true,behavior:'agora-regresar',tooltip:'Regresa por esta entrada a la superficie, junto al templo.'},{id:'agora-platon',type:'philosopher',x:700,y:560,label:'Conversar con Platón',asset:'mentor',characterId:w.philosopher.id,instanceId:'agora-platon',behavior:'agora-conversar'},{id:'agora-papiros',type:'scroll',x:330,y:560,label:'Mesa de lectura',integrated:true,behavior:'agora-leer',hotspot:{x:330,y:460,w:220,h:210},tooltip:'Observa la mesa de lectura del ágora.'}]};
  w.interactions['entrar-agora']??={actions:[{type:'enter',target:'agora'}]};
  w.interactions['agora-regresar']??={actions:[{type:'return'}]};
  w.interactions['agora-conversar']??={actions:[{type:'talk',target:w.intro}]};
  w.interactions['agora-leer']??={actions:[{type:'examine',text:'Un espacio para leer y conversar. Puedes volver a la nave cuando quieras; tus descubrimientos y el avance de la caverna quedan guardados.'}]};
  Object.assign(temple,{label:'Entrar al templo del ágora',interaction:'door',to:'library',behavior:'entrar-agora',tooltip:'Entra al ágora para leer y conversar con Platón. No necesitas terminar la caverna.',hitWidth:180,hitHeight:220});
 }
 for(const mission of w.missions)mission.goal=mission.goal.replace('La nave podrá partir.','Se completará la aventura y se abrirá la siguiente etapa de Historia.');
 return restoreCaveTravel(restorePrisonerPresentation(w));
}
