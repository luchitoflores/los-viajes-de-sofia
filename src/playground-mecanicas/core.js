/**
 * Reglas independientes de Phaser: configurar blancos, modalidades y puntuación.
 * No tiene acceso a partidas, puertas, NPC ni a los estados de Historia.
 */
export const MODES = Object.freeze({
  combat:{id:'combat',title:'Combate común',philosopher:'Laboratorio aislado',action:'Pulso de energía',instruction:'F o botón Pulso. Tres impactos por enemigo. Prueba derrota y reintento; no se guardan partidas. El encapuchado y la vasija de prueba usan el mismo controlador.',background:'cave',projectile:'pulse',targetSpeed:0,targets:[]},
  movement: {
    id:'movement', title:'Mecánicas de Sofía', philosopher:'Laboratorio de movimiento',
    action:'Movimiento lateral 2D',
    instruction:'Prueba caminar con joystick/A-D, correr con Shift, agacharte con C o abajo y saltar con arriba. Configura capacidades y exporta el preset.',
    background:'cave', projectile:'pulse', targetSpeed:0, targets:[]
  },
  fallacies: {
    id:'fallacies', title:'Cazar falacias', philosopher:'Laboratorio de lógica',
    action:'Disparo de análisis',
    instruction:'Dispara solamente contra afirmaciones falaces. No destruyas los razonamientos fundamentados.',
    background:'galaxy', projectile:'pulse', targetSpeed:74,
    targets:[
      {id:'ad-populum',label:'Todos lo creen; por eso es verdad',valid:true,tag:'AD POPULUM',explanation:'La popularidad no demuestra que una proposición sea verdadera.'},
      {id:'ad-hominem',label:'Su argumento es falso porque es joven',valid:true,tag:'AD HOMINEM',explanation:'Descalificar a una persona no refuta las razones que presenta.'},
      {id:'ignorancia',label:'Nadie lo refutó, así que es cierto',valid:true,tag:'APELACIÓN A LA IGNORANCIA',explanation:'No haberlo refutado todavía no demuestra que sea verdad.'},
      {id:'falsa-causa',label:'Llovió tras mi deseo; yo hice llover',valid:true,tag:'FALSA CAUSA',explanation:'Una sucesión temporal no demuestra causalidad.'},
      {id:'evidencia',label:'Compara evidencias antes de concluir',valid:false,tag:'BUENA PRÁCTICA',explanation:'Contrastar evidencias es una buena práctica de razonamiento: no la destruyas.'},
      {id:'contraejemplo',label:'Un contraejemplo refuta una regla universal',valid:false,tag:'BUEN ARGUMENTO',explanation:'Un contraejemplo relevante puede refutar una afirmación universal.'}
    ]
  },
  shadows: {
    id:'shadows',title:'Iluminar las sombras',philosopher:'Platón · La caverna',
    action:'Haz de luz',instruction:'Ilumina las sombras para reconocer sus fuentes. No son enemigos.',
    background:'cave',projectile:'light',targetSpeed:55,
    targets:[
      {id:'horse',label:'Sombra del caballo',valid:true,sprite:'horse',tag:'CABALLO',explanation:'La sombra depende del caballo y de la luz; no es el caballo mismo.'},
      {id:'tree',label:'Sombra del árbol',valid:true,sprite:'tree',tag:'ÁRBOL',explanation:'Un árbol posee más propiedades que las que muestra su sombra.'},
      {id:'figure',label:'Sombra de la figura humana',valid:true,sprite:'warrior',tag:'FIGURA HUMANA',explanation:'La proyección no agota lo que el objeto es.'},
      {id:'vase',label:'Sombra de la vasija',valid:true,sprite:'vase',tag:'VASIJA',explanation:'Investigar las condiciones de una apariencia permite comprender su origen.'}
    ]
  },
  badFaith: {
    id:'badFaith',title:'Desmontar la mala fe',philosopher:'Sartre · Libertad situada',
    action:'Pulso de reflexión',instruction:'Cuestiona excusas que ocultan elecciones. No confundas límites reales con mala fe.',
    background:'galaxy',projectile:'pulse',targetSpeed:68,
    targets:[
      {id:'rol',label:'Soy solo mi cargo; no puedo elegir',valid:true,tag:'MALA FE',explanation:'Reducirse por completo a un rol puede ocultar la libertad situada.'},
      {id:'sin-responsabilidad',label:'Mis actos nunca dependen de mí',valid:true,tag:'EVASIÓN',explanation:'Negar toda participación propia puede servir para evadir responsabilidad.'},
      {id:'fijo',label:'Ya estoy definido; jamás puedo cambiar',valid:true,tag:'ESENCIA FIJA',explanation:'Para Sartre una persona no queda agotada por una definición inmutable.'},
      {id:'limitaciones',label:'Hay circunstancias que restringen mis opciones',valid:false,tag:'FACTICIDAD',explanation:'Reconocer límites reales no es mala fe: la libertad en Sartre es situada.'},
      {id:'proyecto',label:'Puedo examinar cómo asumo mi situación',valid:false,tag:'REFLEXIÓN',explanation:'Reflexionar sobre cómo asumimos nuestro proyecto no es mala fe.'}
    ]
  }
});
export const DEFAULT_SETTINGS=Object.freeze({speed:280,cadence:350,spawnInterval:2200});
export function clamp(v,min,max){return Math.min(max,Math.max(min,v))}
export function normalizedAxis(x,y){const d=Math.hypot(x,y);return d>1?{x:x/d,y:y/d}:{x,y}}
export function scoreImpact(t){return t.valid?{points:10,kind:'correct',heading:t.tag,explanation:t.explanation}:{points:-5,kind:'wrong',heading:'Revisa tu disparo',explanation:t.explanation}}
export function makeSequence(id){if(!MODES[id])throw Error('Modo desconocido: '+id);return MODES[id].targets.slice()}
export function nextTarget(items,i){if(!items.length)throw Error('No hay objetivos');return items[i%items.length]}
