import type {WorldDefinition} from './schema';
/** Data compatibility for the cave, without changing its conditions or ending. */
export function restoreCaveTravel(w:WorldDefinition){
 if(w.id!=='plato'||!w.journey)return w;
 for(const o of w.surface.objects){const names:Record<string,string>={scroll:'Pergamino de preguntas','scroll-return':'Pergamino del regreso',vase:'Ánfora de la Polis'};if(names[o.id]&&['scroll','vase'].includes(o.label))o.label=names[o.id]}
 const room=w.interiors.salida,exit=room?.items.find(o=>o.id==='salida-planeta');
 if(exit&&(!exit.asset||exit.asset==='surface-portal')){
  w.assets['surface-portal']??={src:'assets/cave-prisoners/surface-portal-blue.png',width:150,height:225,kind:'door',label:'Portal azul · regreso a la superficie',animation:{columns:2,rows:2,frames:4,frameRate:3,anchorY:1}};
  exit.asset='surface-portal';exit.integrated=false;exit.tooltip='Portal a la superficie. Se abre cuando completas la misión de la caverna.';
 }
 const recovery=w.interiors.prisioneros?.events?.find(e=>e.id==='recuperar-lampara');
 if(recovery?.behavior==='encender-lampara'){w.interactions['recuperar-equipo']??={actions:[{type:'record',reward:{flags:['lampara_encendida']}}]};recovery.behavior='recuperar-equipo'}
 const explicit=w.interactions['encender-lampara'];if(explicit&&!explicit.actions.some(a=>a.type==='equipment'))explicit.actions.push({type:'equipment',command:'turnOn'});
 const thought=w.dialogues['entrada-observacion'];if(thought)for(const n of Object.values(thought.nodes))n.text=n.text.replace('Enciendo mi lámpara para investigar esas voces.','Tengo mi linterna. Puedo encenderla con L o tocarla para investigar esas voces.');
 return w;
}
