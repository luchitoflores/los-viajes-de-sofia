import {SCENES,WORLDS,PHILOSOPHERS,CONCEPTS,INITIAL} from './data.js';
const $=id=>document.getElementById(id);
const canvas=$('world'),ctx=canvas.getContext('2d');
const W=960,H=540,saveKey='sofia_mundos_2026_v1',editorKey='sofia_worldeditor_2026_v1';
const deep=v=>JSON.parse(JSON.stringify(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const escapeHTML=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let state=deep(INITIAL);
try{const s=JSON.parse(localStorage.getItem(saveKey)||'null');if(s&&SCENES[s.scene])state={...state,...s,flags:{...state.flags,...s.flags},editorScenes:s.editorScenes||{}}}catch(e){console.warn('Guardado no disponible',e)}
const scenes=deep(SCENES);
Object.entries(state.editorScenes||{}).forEach(([id,changes])=>{if(scenes[id]&&changes){if(Array.isArray(changes.objects))scenes[id].objects=changes.objects;if(Array.isArray(changes.zones))scenes[id].zones=changes.zones}});
const assets={};
const filenames=new Set(['galaxy.jpg','cave_entrance.webp','cave_shadows.webp','cave_ascent.webp','exterior.webp','prisoner.png',...Array.from({length:8},(_,i)=>`sofia_${i}.png`)]);
Object.values(SCENES).forEach(s=>['background','far','mid','front'].forEach(k=>s[k]&&filenames.add(s[k])));
Object.values(PHILOSOPHERS).forEach(p=>{filenames.add(p.sprite);filenames.add(p.portrait)});
for(const name of filenames){const img=new Image();img.src=`assets/${name}`;assets[name]=img}
const audio={enabled:false,ctx:null,ambient:null,gain:null,
 init(){try{this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume()}catch(e){}},
 play(freq=520,dur=.12,type='sine'){if(!this.enabled)return;this.init();if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),start=c.currentTime;o.type=type;o.frequency.setValueAtTime(freq,start);o.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.65),start+dur);g.gain.setValueAtTime(.035,start);g.gain.exponentialRampToValueAtTime(.0001,start+dur);o.connect(g).connect(c.destination);o.start(start);o.stop(start+dur)},
 toggle(){this.enabled=!this.enabled;if(this.enabled){this.init();this.startAmbience()}else this.stopAmbience();$('soundButton').textContent=this.enabled?'♫':'♪';this.play(620,.13);showToast(this.enabled?'Ambiente sonoro activado':'Sonido silenciado')},
 startAmbience(){if(!this.ctx||this.ambient)return;let n=0;const notes=[196,246.94,293.66,261.63,220,196,174.61,220];this.ambient=setInterval(()=>{if(!this.enabled||!started||freeze||editing)return;this.play(notes[n++%notes.length],.54,'sine')},740)},
 stopAmbience(){if(this.ambient)clearInterval(this.ambient);this.ambient=null}
};
const player={x:state.x||110,y:state.y||450,vx:0,vy:0,face:1,onGround:true,stair:null,walking:false};
let sceneId=state.scene,scene=scenes[sceneId],cam=0,started=false,editing=false,freeze=false,keys={left:false,right:false,jump:false},time=0,lastTick=0,firstTutorial=true,toastTimeout=0;
let editMode='select',selected=null,brushStart=null,brushRect=null,dragging=null,history=[];
const overlay=$('overlay'),overlayContent=$('overlay-content');
const DEFAULT_HINT='Explora y observa tu entorno.';
function persist(){state.scene=sceneId;state.x=Math.round(player.x);state.y=Math.round(player.y);try{localStorage.setItem(saveKey,JSON.stringify(state))}catch(e){console.warn('No se pudo guardar',e)}}
function editorPersist(){state.editorScenes[sceneId]={objects:deep(scene.objects),zones:deep(scene.zones)};persist()}
function snap(){history.push({objects:deep(scene.objects),zones:deep(scene.zones)});if(history.length>24)history.shift()}
function undo(){const p=history.pop();if(!p)return;scene.objects=p.objects;scene.zones=p.zones;selected=null;editorPersist();showToast('Se deshizo el cambio')}
function showToast(text){const el=$('toast');el.textContent=text;el.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.hidden=true,2400)}
function showDialog(content){freeze=true;overlayContent.innerHTML=content;overlay.classList.add('visible');$('hint').hidden=true}
function closeDialog(){overlay.classList.remove('visible');freeze=false;persist()}
function buttonRow(buttons){return `<div class="button-row">${buttons.map((b,i)=>`<button ${i===0?'class="primary"':''} data-dialog="${b.id}">${escapeHTML(b.label)}</button>`).join('')}</div>`}
function simpleDialog(title,body,btn='Continuar',portrait='',callback=null){showDialog(`<div class="eyebrow">DIARIO DE EXPLORACIÓN</div>${portrait?`<img class="portrait" src="assets/${portrait}" alt="">`:''}<h2>${title}</h2><p>${body}</p>${buttonRow([{id:'continue',label:btn}])}`);overlayContent.querySelector('[data-dialog="continue"]').onclick=()=>{closeDialog();if(callback)callback()}}
function unlockConcept(id){if(!state.unlockedConcepts.includes(id)){state.unlockedConcepts.push(id);audio.play(720,.23);showToast(`✧ Nuevo concepto: ${CONCEPTS[id].name}`);persist()}}
function unlockPhilosopher(id){if(!state.unlockedPhilosophers.includes(id)){state.unlockedPhilosophers.push(id);showToast(`Nueva ficha: ${PHILOSOPHERS[id].name}`);persist()}}
function addMemory(id,name,desc,image){if(state.memories.some(m=>m.id===id))return;state.memories.push({id,name,desc,image});persist()}
function markFlag(id){state.flags[id]=true;persist()}
function rememberScene(id){if(!state.visited.includes(id))state.visited.push(id);const world=scenes[id].world;if(!state.discoveredWorlds.includes(world))state.discoveredWorlds.push(world)}
function enterScene(id,x=null){if(!scenes[id])return;sceneId=id;scene=scenes[id];const pos=scene.spawn;player.x=x??pos.x;player.y=pos.y;player.vx=0;player.vy=0;player.stair=null;player.onGround=true;cam=clamp(player.x-W*.38,0,Math.max(0,scene.width-W));rememberScene(id);$('location').textContent=scene.name;updateQuest();persist();audio.play(390,.28);showToast(scene.name)}
function storyStart(){started=true;closeDialog();enterScene(sceneId,player.x);if(firstTutorial){firstTutorial=false;simpleDialog('Tu viaje comienza','Sofía ha seguido una señal de su brújula hasta una caverna desconocida. Camina con los controles de la pantalla o las flechas. Cuando veas un resplandor cerca de un objeto, toca <b>Acción</b>.','Explorar', 'sofia_0.png')}}
function intro(){showDialog(`<div class="seal">✦ ✧ ✦</div><div class="eyebrow">AVENTURA FILOSÓFICA · VERSIÓN JUGABLE</div><h1>Sofía y los mundos de las ideas</h1><p>Una pequeña astronauta encuentra una brújula que no señala el norte: señala preguntas que todavía merecen ser exploradas. Descubre mundos, conversa con sus pensadores y reúne un atlas de ideas.</p><blockquote>«Lo primero que descubrí no fue una respuesta, sino una pregunta.»</blockquote><div class="hintline">Este capítulo explora la <b>caverna de Platón</b>. También puedes visitar escenas de otras épocas y editar tus escenarios desde el teléfono.</div>${buttonRow([{id:'start',label:state.flags.plato?'Continuar mi viaje':'Comenzar viaje'},{id:'galaxy',label:'Ver la galaxia'},{id:'legacy',label:'Juego original'}])}`);overlayContent.querySelector('[data-dialog="start"]').onclick=storyStart;overlayContent.querySelector('[data-dialog="galaxy"]').onclick=showGalaxy;overlayContent.querySelector('[data-dialog="legacy"]').onclick=()=>location.href='legacy.html'}
function updateQuest(){let text=scene.note||DEFAULT_HINT;const f=state.flags;
 if(sceneId==='cave_entrance')text=!f.lamp?'✦ Encuentra y enciende la lámpara.':'✦ Cruza la caverna y entra al pasaje de las sombras.';
 if(sceneId==='cave_shadows')text=!f.prisoner?'✦ Habla con el prisionero.':!f.shadows?'✦ Descubre qué produce las sombras.':!f.freed?'✦ Ayuda a liberar al prisionero.':'✦ Busca el sendero hacia la luz.';
 if(sceneId==='cave_ascent')text='✦ Sube las escaleras y sigue la luz del exterior.';
 if(sceneId==='cave_exit')text=!f.plato?'✦ Encuentra a Platón y habla con él.':'✦ Regresa a tu nave o explora otros mundos.';
 $('quest').textContent=text;
}
function showGalaxy(){const cards=WORLDS.map(w=>`<button class="tile ${!w.enabled?'locked':''}" ${w.enabled?`data-world="${w.id}"`:'disabled'}><div class="planet-art" style="background-image:linear-gradient(0deg,#141c34aa,#141c3422),url('assets/${w.image}')"></div><b>${escapeHTML(w.name)}</b><small>${escapeHTML(w.tag)}</small><small>${w.enabled?escapeHTML(w.desc):'En diseño · próximamente'}</small></button>`).join('');
 showDialog(`<div class="eyebrow">BITÁCORA ESTELAR</div><h2>Galaxia de las ideas</h2><p>Elige un destino para aterrizar. Los planetas completos y las visitas breves se distinguen en sus descripciones.</p><div class="cards">${cards}</div>${buttonRow([{id:'return',label:'Volver a la aventura'},{id:'album',label:'Abrir colecciones'}])}`);
 overlayContent.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{const w=WORLDS.find(x=>x.id===b.dataset.world);closeDialog();started=true;enterScene(w.scene)});
 overlayContent.querySelector('[data-dialog="return"]').onclick=()=>{closeDialog();if(!started)intro()};
 overlayContent.querySelector('[data-dialog="album"]').onclick=()=>showAlbum('worlds')}
function showAlbum(tab='philosophers'){
 const tabs=[['philosophers','Filósofos'],['concepts','Conceptos'],['worlds','Mundos'],['memories','Recuerdos']];
 let body='';
 if(tab==='philosophers')body=Object.entries(PHILOSOPHERS).map(([id,p])=>{const ok=state.unlockedPhilosophers.includes(id);return `<div class="album-entry ${!ok?'locked-entry':''}"><img src="assets/${p.portrait}"><div><strong>${ok?escapeHTML(p.name):'??? · Sin descubrir'}</strong><p>${ok?escapeHTML(p.life+' · '+p.school):'Explora los mundos para encontrar al mentor.'}</p>${ok?`<p>${escapeHTML(p.description)}</p><small>Obras: ${escapeHTML(p.works)}</small>`:''}</div></div>`}).join('');
 if(tab==='concepts')body=Object.entries(CONCEPTS).map(([id,c])=>{const ok=state.unlockedConcepts.includes(id);return `<div class="album-entry ${!ok?'locked-entry':''}"><div style="font-size:30px;color:#e5c98d">◇</div><div><strong>${ok?escapeHTML(c.name):'Concepto desconocido'}</strong><p>${ok?escapeHTML(c.desc):'Todavía no has vivido esta idea.'}</p>${ok?`<small>${escapeHTML(c.who)} · Ejemplo: ${escapeHTML(c.example)}</small>`:''}</div></div>`}).join('');
 if(tab==='worlds')body=WORLDS.map(w=>`<div class="album-entry"><img src="assets/${w.image}" alt=""><div><strong>${escapeHTML(w.name)}</strong><p>${state.discoveredWorlds.includes(w.id)?'✓ Visitado':'Pendiente de exploración'} · ${escapeHTML(w.tag)}</p><p>${escapeHTML(w.desc)}</p></div></div>`).join('');
 if(tab==='memories')body=state.memories.length?state.memories.map(m=>`<div class="album-entry"><img src="assets/${m.image}" alt=""><div><strong>${escapeHTML(m.name)}</strong><p>${escapeHTML(m.desc)}</p></div></div>`).join(''):'<p>Tu diario está vacío. Cada descubrimiento importante dejará un recuerdo.</p>';
 showDialog(`<div class="eyebrow">MOCHILA DE DESCUBRIMIENTOS</div><h2>Mis colecciones</h2><div class="tabs">${tabs.map(([id,n])=>`<button data-tab="${id}" class="${tab===id?'active':''}">${n}</button>`).join('')}</div><div style="max-height:240px;overflow:auto;padding-right:3px">${body}</div>${buttonRow([{id:'close',label:'Regresar'},{id:'galaxy',label:'Ir a la galaxia'}])}`);
 overlayContent.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showAlbum(b.dataset.tab));overlayContent.querySelector('[data-dialog="close"]').onclick=()=>{closeDialog();if(!started)intro()};overlayContent.querySelector('[data-dialog="galaxy"]').onclick=showGalaxy}
function talkPrisoner(){markFlag('prisoner');updateQuest();simpleDialog('El prisionero','— Desde que nací, lo único que conozco son las sombras que se mueven sobre el muro. Para nosotros, eso es todo lo que existe. ¿Cómo podría haber algo detrás?<br><br><b>Sofía:</b> — Tal vez la pared solo muestra una parte de lo que sucede. ¿Podemos investigar qué produce esas figuras?','Investigar la pared', '',()=>showToast('Nueva misión: descubre el origen de las sombras'))}
function puzzleIcon(id){if(id==='vase')return `<svg viewBox="0 0 80 90" width="80" height="85" xmlns="http://www.w3.org/2000/svg"><path d="M27 13H53L50 27Q64 39 57 64Q49 77 31 64Q16 43 30 27Z" fill="#c99062" stroke="#6d4234" stroke-width="4"/><path d="M26 25Q5 26 17 48Q21 54 27 50M54 25Q76 26 63 48Q60 54 56 50" fill="none" stroke="#c99062" stroke-width="7"/><path d="M30 37Q40 32 50 37M31 49Q40 46 50 49" stroke="#6e4834" stroke-width="3"/></svg>`;
 if(id==='tree')return `<svg viewBox="0 0 80 90" width="80" height="85" xmlns="http://www.w3.org/2000/svg"><path d="M37 45L36 79H48L44 45" fill="#8b5d43"/><path d="M40 6L8 50H72Z" fill="#699a74" stroke="#416d53" stroke-width="4"/><path d="M40 22L13 62H67Z" fill="#7cb78a" stroke="#436d51" stroke-width="4"/></svg>`;
 return `<svg viewBox="0 0 80 90" width="80" height="85" xmlns="http://www.w3.org/2000/svg"><path d="M39 9V76Q14 80 16 60Q17 46 39 46M39 76Q66 80 64 60Q63 46 39 46" fill="none" stroke="#bb8b55" stroke-width="8" stroke-linecap="round"/><path d="M39 7L57 7M41 15L55 15M41 26L52 26M41 37L49 37" fill="none" stroke="#d3b378" stroke-width="3"/></svg>`}
const puzzleList=[['vase','Ánfora'],['tree','Árbol'],['lyre','Lira']];let puzzleRound=0,puzzleSelected='';
function showPuzzle(){if(!state.flags.prisoner){simpleDialog('Primero escucha','El prisionero conoce estas sombras mejor que nadie. Habla con él antes de explorar su origen.');return}puzzleRound=0;puzzleSelected='';renderPuzzle()}
function renderPuzzle(){if(puzzleRound>=3){markFlag('shadows');unlockConcept('shadows');addMemory('shadows','Lo que hay detrás de las sombras','Sofía descubrió que las figuras de la pared tenían causas que los prisioneros ignoraban.','cave_hall.jpg');audio.play(920,.28);updateQuest();simpleDialog('Una nueva manera de mirar','Has descubierto que las sombras no son los objetos mismos. La apariencia puede ser un punto de partida, pero investigar exige buscar sus causas.','Volver a la caverna');return}
 const [target,label]=puzzleList[puzzleRound];showDialog(`<div class="eyebrow">MINIJUEGO · DESCUBRIR LAS CAUSAS</div><h2>¿De dónde vienen las sombras?</h2><p>La hoguera proyecta esta silueta. Examina los tres objetos y toca el que podría producirla.</p><div class="shadow-target" id="shadow-target"><div style="filter:brightness(0);opacity:.8">${puzzleIcon(target)}</div></div><div class="puzzle-grid">${puzzleList.map(([id,n])=>`<button class="puzzle-option" data-choice="${id}">${puzzleIcon(id)}<span>${n}</span></button>`).join('')}</div><p class="puzzle-note">Sombra ${puzzleRound+1} de 3. Puedes elegir tocando una figura; se admite también arrastrar con ratón o dedo.</p>`);
 overlayContent.querySelectorAll('[data-choice]').forEach(b=>{b.onclick=()=>{if(b.dataset.choice===target){puzzleRound++;audio.play(680,.17);renderPuzzle()}else{b.classList.add('wrong');audio.play(210,.22);showToast('Observa de nuevo su silueta')}};b.setAttribute('draggable','true');b.ondragstart=e=>e.dataTransfer?.setData('text/plain',b.dataset.choice)});
 const tar=$('shadow-target');tar.ondragover=e=>e.preventDefault();tar.ondrop=e=>{e.preventDefault();const choice=e.dataTransfer.getData('text/plain');overlayContent.querySelector(`[data-choice="${choice}"]`)?.click()};
}
function talkPlato(){markFlag('plato');unlockPhilosopher('plat');unlockConcept('cave');unlockConcept('shadows');addMemory('light','La primera luz','Sofía y el prisionero alcanzaron el exterior; la búsqueda no termina cuando se sale de la caverna.','gsky.webp');updateQuest();audio.play(880,.32);simpleDialog('El encuentro con Platón','— Has visto sombras, objetos y la luz exterior, Sofía. En mi alegoría, el ascenso representa la dificultad de educar la mirada y el pensamiento. Aprender no es cambiar una imagen por otra sin reflexionar: es examinar por qué creíamos saber.<br><br><b>Sofía:</b> — ¿Y qué debemos hacer con lo aprendido?<br><br>— Regresar, conversar y ayudar a otros a hacerse preguntas.','Abrir mis colecciones','plat.webp',()=>showAlbum('concepts'))}
function talkLegacy(what){const map={augustine:['agus','memory','Agustín de Hipona','¿Dónde está el pasado? En la memoria. ¿Y el futuro? En la expectativa. Explorar el tiempo exige mirar también hacia nuestra interioridad.'],descartes:['desc','doubt','René Descartes','Si los sentidos me engañan, puedo dudar de muchas cosas; pero mientras dudo, estoy pensando. ¿Qué certeza encuentro en ese acto?'],foucault:['fouc','vigilance','Michel Foucault','No hace falta ver siempre al vigilante para que la posibilidad de observación transforme nuestras acciones. ¿Qué formas de disciplina has notado?']};const [id,concept,name,message]=map[what];unlockPhilosopher(id);unlockConcept(concept);addMemory('meet-'+id,'Encuentro con '+name,message,PHILOSOPHERS[id].portrait);simpleDialog(name,message,'Continuar',PHILOSOPHERS[id].sprite)}
function interact(obj){if(!obj)return;audio.play(560,.11);
 if(obj.type==='door'){if(obj.requires&&!state.flags[obj.requires]){simpleDialog('Todavía no puedes avanzar','Primero debes comprender las sombras y ayudar al prisionero.');return}enterScene(obj.target,obj.targetX??110);return}
 switch(obj.action){
 case 'lamp':markFlag('lamp');addMemory('lamp','La primera lámpara','Sofía encendió su luz en la oscuridad.','cave_hall.jpg');updateQuest();simpleDialog('La luz de Sofía','Una lámpara ilumina la roca. A partir de ahora podrás observar los objetos en la oscuridad.','Continuar');break;
 case 'prisoner':talkPrisoner();break;
 case 'shadows':showPuzzle();break;
 case 'chains':if(!state.flags.shadows){simpleDialog('Las cadenas','Antes de liberar al prisionero, Sofía debe investigar qué produce las sombras.');return}markFlag('freed');addMemory('free','El prisionero liberado','Una pregunta abrió el camino hacia una experiencia nueva.','cave_hall.jpg');updateQuest();simpleDialog('Una decisión valiente','Sofía abre el mecanismo de las cadenas. El prisionero se levanta lentamente, desconcertado ante todo lo que todavía no conoce.','Seguir hacia la luz');break;
 case 'plato':talkPlato();break;
 case 'ship':showGalaxy();break;
 case 'augustine':case 'descartes':case 'foucault':talkLegacy(obj.action);break;
 case 'mural':simpleDialog('Una inscripción antigua','«Muchos vieron estas figuras. Pocos preguntaron qué las produce». Tal vez observar no sea suficiente.');break;
 case 'vase':simpleDialog('Un cántaro de arcilla','Este objeto está apoyado sobre el suelo. En el editor visual puedes moverlo y cambiar su posición; ya no depende de aparecer al azar.');break;
 case 'torch':simpleDialog('Una antorcha','La luz de la antorcha proyecta siluetas distintas según la posición de los objetos. ¿Qué parte del mundo ilumina y cuál queda oculta?');break;
 case 'plant':simpleDialog('Un nuevo paisaje','Al salir, los objetos tienen colores, tamaños y formas que no se distinguían en el interior.');break;
 case 'medscroll':simpleDialog('Un manuscrito','Una pregunta medieval: ¿cómo podemos razonar sobre el mundo y cuál es el papel de la fe?');break;
 case 'modernscroll':simpleDialog('Meditaciones','Descartes pregunta si aquello que parece evidente podría estar equivocado.');break;
 case 'camera':simpleDialog('La mirada invisible','Aunque la torre parece vacía, los ciudadanos cambian su conducta cuando creen que alguien los observa.');break;
 default:if(obj.type==='scroll'||obj.type==='vase')simpleDialog(obj.name||'Un hallazgo','Sofía observa atentamente este objeto. ¿Qué podría enseñarle?');else simpleDialog('Descubrimiento',obj.name||'Un objeto antiguo');
 }
}
function nearby(){let best=null,min=130;for(const o of scene.objects){const d=Math.abs(o.x-player.x)+Math.abs((o.y??450)-player.y)*.4;if(d<min){min=d;best=o}}
 for(const z of scene.zones){if(z.type==='stairs'&&player.x>=z.x-45&&player.x<=z.x+z.w+45){const dx=Math.min(Math.abs(player.x-(z.startX??z.x)),Math.abs(player.x-(z.endX??z.x+z.w)));if(dx<90)return{type:'stairs',name:'Escalera',zone:z,hint:'Subir o bajar la escalera'}}
 if(['door','dialogue','event'].includes(z.type)&&player.x>=z.x-42&&player.x<=z.x+z.w+42&&player.y>=z.y-140&&player.y<=z.y+z.h+140)return{type:'zone',name:z.name||z.type,zone:z,hint:z.name||('Activar zona '+z.type)}}
 return best}
function action(){if(editing||freeze||!started)return;const obj=nearby();if(!obj){showToast('Acércate a una figura, puerta u objeto.');return}if(obj.type==='zone'){const z=obj.zone;if(z.type==='door'){if(scenes[z.target])enterScene(z.target,z.targetX??null);else showToast('Configura un escenario de destino válido en el editor.')}else if(z.type==='dialogue')simpleDialog(z.name||'Una conversación',z.text||'Este espacio está preparado para activar un diálogo. Puedes configurar su contenido en el proyecto.');else if(z.type==='event')simpleDialog(z.name||'Un acontecimiento',z.text||'Una zona de evento puede activar aquí un minijuego o misión.');return}if(obj.type==='stairs'){const z=obj.zone,start=Math.abs(player.x-z.startX)<Math.abs(player.x-z.endX);const sx=start?z.startX:z.endX,sy=start?z.startY:z.endY,ex=start?z.endX:z.startX,ey=start?z.endY:z.startY;player.x=sx;player.y=sy;player.stair={sx,sy,ex,ey,t:0};audio.play(330,.12);return}interact(obj)}
function getFloor(x,yPrev){const floors=scene.zones.filter(z=>z.type==='floor'&&x>=z.x&&x<=z.x+z.w).sort((a,b)=>a.y-b.y);const cand=floors.find(z=>z.y>=yPrev-22);return cand||floors.at(-1)}
function update(dt){time+=dt;if(!started||freeze||editing)return;
 if(player.stair){player.stair.t=Math.min(1,player.stair.t+dt*.54);const k=player.stair.t,sm=k*k*(3-2*k);player.x=player.stair.sx+(player.stair.ex-player.stair.sx)*sm;player.y=player.stair.sy+(player.stair.ey-player.stair.sy)*sm;player.onGround=true;player.walking=true;if(k>=1){player.stair=null;player.vy=0}updateQuest();return}
 const dir=(keys.right?1:0)-(keys.left?1:0);player.vx+=(dir*265-player.vx)*Math.min(1,dt*(dir?9:13));if(Math.abs(player.vx)<.5)player.vx=0;player.walking=Math.abs(player.vx)>6;
 const oldX=player.x,oldY=player.y;
 player.x=clamp(player.x+player.vx*dt,40,scene.width-40);if(dir)player.face=dir;
 for(const z of scene.zones){if(z.type!=='solid')continue;if(player.x+20>z.x&&player.x-20<z.x+z.w&&player.y>z.y&&player.y-128<z.y+z.h){if(player.vx>0)player.x=z.x-21;else if(player.vx<0)player.x=z.x+z.w+21;player.vx=0}}
 player.vy+=830*dt;player.y+=player.vy*dt;const floor=getFloor(player.x,oldY);if(floor&&player.vy>=0&&player.y>=floor.y&&oldY<=floor.y+14){player.y=floor.y;player.vy=0;player.onGround=true}else player.onGround=false;
 for(const z of scene.zones){if(z.type==='water'&&player.x>=z.x&&player.x<=z.x+z.w&&player.y>=z.y&&player.y<=z.y+z.h){player.x=scene.spawn.x;player.y=scene.spawn.y;player.vx=0;player.vy=0;showToast('Agua profunda: Sofía regresó a una zona segura.');break}}
 if(player.y>660){player.x=scene.spawn.x;player.y=scene.spawn.y;player.vy=0;showToast('Sofía volvió a una zona segura.')}
 cam+=((clamp(player.x-360,0,Math.max(0,scene.width-W)))-cam)*Math.min(1,dt*4.7);
 const n=nearby();if(n){$('hint').hidden=false;$('hint').textContent='✦ '+(n.hint||('Interactuar: '+n.name))}else $('hint').hidden=true;
}
function jump(){if(!started||freeze||editing)return;if(player.onGround&&!player.stair){player.vy=-385;player.y-=2;player.onGround=false;audio.play(430,.18)}}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function ellipse(x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function line(points,color,width=3){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function drawSprite(name,x,y,w,h,flip=false){const im=assets[name];if(!im||!im.complete||!im.naturalWidth)return false;ctx.save();if(flip){ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(im,-w/2,y-h,w,h)}else ctx.drawImage(im,x-w/2,y-h,w,h);ctx.restore();return true}
function background(){const bg=assets[scene.background];ctx.fillStyle='#151529';ctx.fillRect(0,0,W,H);
 if(sceneId.startsWith('cave_')){if(bg?.complete&&bg.naturalWidth){ctx.drawImage(bg,-cam,0,scene.width,H)}ctx.fillStyle='rgba(4,7,21,.10)';ctx.fillRect(0,0,W,H)}
 else {
 if(bg?.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W,H);
 const far=assets[scene.far],mid=assets[scene.mid],front=assets[scene.front];
 // Recortar espacio transparente de las capas originales antes de mostrarlas: los edificios quedan por encima del suelo.
 if(far?.naturalWidth){const yy=Math.floor(far.naturalHeight*.42);ctx.drawImage(far,0,yy,far.naturalWidth,far.naturalHeight-yy,-cam*.20,229,scene.width*.88,171)}
 if(mid?.naturalWidth){const yy=Math.floor(mid.naturalHeight*.36);ctx.drawImage(mid,0,yy,mid.naturalWidth,mid.naturalHeight-yy,-cam*.56,274,scene.width*.95,174)}
 if(front?.naturalWidth)ctx.drawImage(front,-cam,312,scene.width,138);
 }
}
function drawGround(){for(const z of scene.zones){if(z.type!=='floor')continue;if(sceneId.startsWith('cave_'))continue;const x=z.x-cam;if(x+z.w<0||x>W)continue;ctx.save();const g=ctx.createLinearGradient(0,z.y,0,z.y+120);if(sceneId.startsWith('cave_')){g.addColorStop(0,'#5c4e50');g.addColorStop(.25,'#302c3c');g.addColorStop(1,'#171929')}else{g.addColorStop(0,'#8b754f');g.addColorStop(.12,'#59483d');g.addColorStop(1,'#272a38')}ctx.fillStyle=g;ctx.fillRect(x,z.y,z.w,H-z.y);ctx.fillStyle=sceneId.startsWith('cave_')?'#aa8a6a':'#d6ae7b';ctx.globalAlpha=.72;ctx.fillRect(x,z.y,Math.min(z.w,W+200),5);ctx.restore()}
 for(const z of scene.zones){if(z.type==='solid'){const x=z.x-cam;const grad=ctx.createLinearGradient(x,z.y,x+z.w,z.y+z.h);grad.addColorStop(0,'#a38a72');grad.addColorStop(.5,'#574e58');grad.addColorStop(1,'#342f3a');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x+6,z.y);ctx.lineTo(x+z.w-14,z.y-14);ctx.lineTo(x+z.w,z.y+z.h);ctx.lineTo(x-6,z.y+z.h);ctx.closePath();ctx.fill();line([[x+6,z.y],[x+z.w-14,z.y-14]],'#bb9b70',3)}}
}
function drawCaveDecor(){if(!sceneId.startsWith('cave_'))return;ctx.save();ctx.translate(-cam,0);
 if(false){
 // torch casting moving shadows on wall
 const gx=1240,gy=200;const gradient=ctx.createRadialGradient(gx,gy,14,gx,gy,310);gradient.addColorStop(0,'rgba(249,159,63,.36)');gradient.addColorStop(1,'rgba(255,154,57,0)');ctx.fillStyle=gradient;ctx.fillRect(gx-310,gy-310,620,620);
 ctx.save();ctx.globalAlpha=.55;ctx.fillStyle='#13101d';ctx.translate(1160,205);ctx.scale(1.2,1.1);
 ctx.beginPath();ctx.ellipse(0,25,48,43,0,0,7);ctx.fill();ctx.fillRect(-30,53,60,25);
 ctx.restore();
 for(let i=0;i<3;i++){let x=1460+i*70;ellipse(x,297,22,45,'#1a1721');ellipse(x,242,18,20,'#1a1721')}
 }
 if(sceneId==='cave_ascent'){
 ctx.strokeStyle='#bb9872';ctx.lineWidth=4;ctx.fillStyle='#50414b';for(let i=0;i<12;i++){const x=480+i*49,y=444-i*14;ctx.fillRect(x,y,53,12);ctx.strokeRect(x,y,53,12)}
 }
 // glowing torches
 for(const tx of (sceneId==='cave_shadows'?[1270]:sceneId==='cave_ascent'?[325,1290]:[680,1830])){
 ctx.strokeStyle='#755e50';ctx.lineWidth=12;line([[tx,313],[tx,355]],'#7a5847',11);ellipse(tx,308,18,6,'#c18b4e');const h=28+Math.sin(time*8+tx)*7;ctx.beginPath();ctx.moveTo(tx,307-h);ctx.bezierCurveTo(tx-20,292,tx-13,312,tx,314);ctx.bezierCurveTo(tx+16,309,tx+20,291,tx,307-h);ctx.fillStyle='#ffb65c';ctx.fill();ellipse(tx,303,6,13,'#fff1ba')}
 ctx.restore()}
function drawProp(o){const x=o.x-cam,y=o.y??450;if(x<-150||x>W+160)return;
 ctx.save();ctx.translate(x,y);
 if(o.type==='philosopher'){let id=o.who||'plat';const p=PHILOSOPHERS[id];if(p){const im=assets[p.sprite],h=158,w=im?.naturalWidth?h*im.naturalWidth/im.naturalHeight:75;drawSprite(p.sprite,0,0,w,h,x<player.x)}ellipse(0,-170,17,3,'rgba(242,204,151,.12)')}
 else if(o.type==='prisoner'){drawSprite('prisoner.png',0,0,188,210);/*
 ellipse(0,0,40,7,'#171524');ctx.fillStyle='#8e6e56';ctx.beginPath();ctx.moveTo(-36,-80);ctx.lineTo(14,-80);ctx.lineTo(40,-3);ctx.lineTo(-40,-3);ctx.closePath();ctx.fill();ellipse(0,-92,27,31,'#c7936c');ellipse(-4,-103,30,22,'#282330');ctx.fillStyle='#b27d5b';ctx.fillRect(-33,-66,11,47);ctx.fillRect(25,-70,12,50);line([[-34,-35],[-49,-24],[-70,-42]],'#788596',4);line([[36,-30],[52,-24],[66,-39]],'#788596',4);
 }
 */}
 else if(o.type==='vase'){
 const g=ctx.createLinearGradient(-24,-68,25,-10);g.addColorStop(0,'#e9b977');g.addColorStop(.45,'#a66745');g.addColorStop(1,'#614034');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-24,-64);ctx.lineTo(24,-64);ctx.lineTo(18,-52);ctx.bezierCurveTo(37,-37,32,-10,13,-4);ctx.lineTo(-13,-4);ctx.bezierCurveTo(-32,-10,-36,-37,-18,-52);ctx.closePath();ctx.fill();ctx.strokeStyle='#d69b63';ctx.lineWidth=5;ctx.beginPath();ctx.arc(-17,-41,17,1.6,4.4);ctx.stroke();ctx.beginPath();ctx.arc(17,-41,17,-1.25,1.55);ctx.stroke();line([[-18,-35],[18,-35]],'#dbb88a',3);
 }
 else if(o.type==='scroll'){ctx.rotate(-.08);roundRect(-40,-24,80,20,4);ctx.fillStyle='#e3cca4';ctx.fill();ctx.fillStyle='#7c614b';for(let i=0;i<4;i++)ctx.fillRect(-28,-20+i*4,50-i*5,1.2);ellipse(-40,-13,6,12,'#f3dab7');ellipse(40,-13,6,12,'#e0bf8f')}
 else if(o.type==='lamp'||o.type==='torch'){ctx.fillStyle='#b5965a';ctx.fillRect(-8,-52,16,50);ellipse(0,-48,19,6,'#d5af70');ctx.beginPath();ctx.moveTo(0,-105);ctx.quadraticCurveTo(-24,-78,0,-53);ctx.quadraticCurveTo(22,-72,0,-105);ctx.fillStyle='#ffd27c';ctx.fill();ellipse(0,-70,5,15,'#fff5bb')}
 else if(o.type==='door'){ctx.fillStyle='#342b3c';roundRect(-45,-150,90,150,40);ctx.fill();ctx.strokeStyle='#d1ab7c';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#62506a';roundRect(-36,-135,72,132,32);ctx.fill();ctx.strokeStyle='#c89c68';ctx.lineWidth=3;ctx.stroke();ellipse(18,-60,4,4,'#f6d79b');}
 else if(o.type==='shadows' && editing){ctx.fillStyle='#3b2c30';roundRect(-78,-160,156,120,18);ctx.fill();ctx.strokeStyle='#cda16c';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#d7b78f';ctx.font='italic 19px Georgia';ctx.textAlign='center';ctx.fillText('¿Qué hay detrás?',0,-82);}
 else if(o.type==='chains'){ctx.strokeStyle='#a0a1aa';ctx.lineWidth=5;ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(-44,-110);ctx.bezierCurveTo(-22,-80,20,-150,45,-35);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#d9b179';ctx.strokeRect(-17,-47,34,31)}
 else if(o.type==='mural' && editing){ctx.fillStyle='#7e6461';roundRect(-68,-125,136,105,6);ctx.fill();ctx.strokeStyle='#b79572';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#d3b286';ctx.font='italic 18px Georgia';ctx.textAlign='center';ctx.fillText('¿Realidad?',0,-73)}
 else if(o.type==='ship'){
 const g=ctx.createLinearGradient(-53,-105,53,-12);g.addColorStop(0,'#b0d2ce');g.addColorStop(1,'#365e81');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-142);ctx.bezierCurveTo(46,-115,57,-48,55,-25);ctx.lineTo(-55,-25);ctx.bezierCurveTo(-54,-58,-43,-117,0,-142);ctx.fill();ellipse(0,-84,27,28,'#223450');ellipse(0,-84,19,20,'#9fdde1');ctx.fillStyle='#ac8051';ctx.fillRect(-62,-24,124,17);ctx.fillStyle='#dfbc7a';ctx.fillRect(-29,-12,18,16);ctx.fillRect(13,-12,18,16)}
 ctx.restore();
 // interaction marker that is anchored in the world
 const close=Math.abs(o.x-player.x)+Math.abs(y-player.y)*.4<130;
 if(close&&!editing&&!freeze){ctx.save();const dy=Math.sin(time*3)*4;ctx.strokeStyle='#f0d18b';ctx.lineWidth=2;ellipse(x,y-(o.type==='philosopher'?195:184)+dy,17,17,'#162b40da');ctx.beginPath();ctx.arc(x,y-(o.type==='philosopher'?195:184)+dy,16,0,7);ctx.stroke();ctx.fillStyle='#ffe1a1';ctx.textAlign='center';ctx.font='bold 18px Georgia';ctx.fillText('!',x,y-(o.type==='philosopher'?189:178)+dy);ctx.restore()}
}
function drawZones(){ctx.save();for(const z of scene.zones){if(!editing&&z.type!=='stairs')continue;
 if(z.type==='stairs'&&!editing){const x=z.x-cam;ctx.strokeStyle='#dec092';ctx.lineWidth=3;ctx.setLineDash([6,7]);ctx.beginPath();ctx.moveTo(z.startX-cam,z.startY);ctx.lineTo(z.endX-cam,z.endY);ctx.stroke();ctx.setLineDash([]);continue}
 let colors={floor:'#66dda8',surface:'#deb477',solid:'#e57279',door:'#66c9fa',stairs:'#d3a7f8',water:'#73c7ec',dialogue:'#f4d677',event:'#f296ca'};ctx.fillStyle=(colors[z.type]||'#8de6e6')+'55';ctx.strokeStyle=colors[z.type]||'#8de6e6';ctx.lineWidth=2;ctx.setLineDash([7,4]);ctx.fillRect(z.x-cam,z.y,z.w,z.h);ctx.strokeRect(z.x-cam,z.y,z.w,z.h);ctx.setLineDash([]);if(z.type==='stairs'){line([[z.startX-cam,z.startY],[z.endX-cam,z.endY]],'#ead8ff',4)}if(selected===z){ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.strokeRect(z.x-cam,z.y,z.w,z.h)}ctx.font='12px system-ui';ctx.fillStyle='#fff';ctx.fillText(z.type,z.x-cam+7,z.y+18)}ctx.restore()}
function drawEditorObjects(){if(!editing)return;ctx.save();for(const o of scene.objects){if(selected===o){ctx.strokeStyle='#a9fff1';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.strokeRect(o.x-cam-45,o.y-171,90,182);ctx.setLineDash([])}ctx.font='11px system-ui';ctx.fillStyle='#fff';ctx.fillText(o.name||o.type,o.x-cam-28,o.y+15)}if(brushRect){ctx.fillStyle='#61cbec55';ctx.strokeStyle='#9aeaff';ctx.fillRect(brushRect.x-cam,brushRect.y,brushRect.w,brushRect.h);ctx.strokeRect(brushRect.x-cam,brushRect.y,brushRect.w,brushRect.h)}ctx.restore()}
function drawPlayer(){ellipse(player.x-cam,player.y+1,35,8,'#11182877');const frames=player.stair?[2,3,4,5]:player.walking?[2,3,4,5]:[0,1];const k=player.walking||player.stair?Math.floor(time*10)%frames.length:Math.floor(time*1.2)%frames.length;const frame=frames[k];const y=player.y+(player.onGround?Math.sin(time*2)*1:0);drawSprite(`sofia_${frame}.png`,player.x-cam,y,168,212,player.face<0)}
function drawParticles(){ctx.save();for(let i=0;i<35;i++){let x=(i*137+time*(9+i%5))%W,y=(i*67+20+Math.sin(time*.7+i)*18)%H;ctx.globalAlpha=.15+.12*Math.sin(time+i);ellipse(x,y,1.4,1.4,'#f9daa6')}ctx.restore()}
function render(){background();drawCaveDecor();drawGround();scene.objects.forEach(drawProp);drawZones();drawPlayer();drawEditorObjects();drawParticles();}
function frame(ts){const dt=clamp((ts-lastTick)/1000||.016,0,.048);lastTick=ts;update(dt);render();requestAnimationFrame(frame)}
function bindControls(){document.querySelectorAll('[data-control]').forEach(b=>{const key=b.dataset.control;const down=e=>{e.preventDefault();if(key==='act')action();else if(key==='jump')jump();else keys[key]=true;b.classList.add('pressed')};const up=e=>{e.preventDefault();if(key==='left'||key==='right')keys[key]=false;b.classList.remove('pressed')};b.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,up))});
 window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();if(['ArrowLeft','KeyA'].includes(e.code))keys.left=true;if(['ArrowRight','KeyD'].includes(e.code))keys.right=true;if(['Space','KeyW'].includes(e.code)&&!e.repeat)jump();if(['KeyE','Enter'].includes(e.code)&&!e.repeat)action();if(e.code==='Escape'&&!editing&&!freeze)pause()});
 window.addEventListener('keyup',e=>{if(['ArrowLeft','KeyA'].includes(e.code))keys.left=false;if(['ArrowRight','KeyD'].includes(e.code))keys.right=false});
 $('galaxyButton').onclick=showGalaxy;$('collectionButton').onclick=()=>showAlbum();$('editorButton').onclick=()=>startEditor();$('soundButton').onclick=()=>audio.toggle();
 window.addEventListener('blur',()=>{keys={left:false,right:false,jump:false};persist()});window.addEventListener('beforeunload',persist)
}
function pause(){showDialog(`<div class="eyebrow">PAUSA</div><h2>El viaje puede esperar</h2><p>Tu progreso se guarda automáticamente en este navegador.</p>${buttonRow([{id:'resume',label:'Continuar'},{id:'atlas',label:'Ver galaxia'}])}`);overlayContent.querySelector('[data-dialog="resume"]').onclick=closeDialog;overlayContent.querySelector('[data-dialog="atlas"]').onclick=showGalaxy}
function startEditor(){if(freeze){closeDialog();started=true}editing=true;freeze=true;document.body.classList.add('editing');$('editor').hidden=false;selected=null;editMode='select';$('editor-tool').value='select';syncProperties();showToast('Modo editor activado')}
function closeEditor(){editing=false;freeze=false;document.body.classList.remove('editing');$('editor').hidden=true;selected=null;brushRect=null;editorPersist();updateQuest();showToast('Modo juego · cambios guardados')}
function syncProperties(){const box=$('properties');if(!selected){box.innerHTML='<small>Selecciona un objeto o pinta una zona para editar sus propiedades.</small>';return}
 const entry=selected;const nums=[['x','X'],['y','Y'],['w','Ancho'],['h','Alto'],['startX','Inicio X'],['startY','Inicio Y'],['endX','Fin X'],['endY','Fin Y']].filter(([k])=>entry[k]!=null);
 box.innerHTML=`<b style="font-size:12px">${escapeHTML(entry.name||entry.type)}</b><div class="propgrid">${nums.map(([k,n])=>`<label>${n}<input data-prop="${k}" type="number" value="${Math.round(entry[k])}"></label>`).join('')}<label class="wide">Destino <input data-prop="target" value="${escapeHTML(entry.target||'')}" placeholder="cave_exit"></label><label class="wide">Etiqueta <input data-prop="name" value="${escapeHTML(entry.name||'')}" placeholder="Nombre visible"></label></div>`;
 box.querySelectorAll('[data-prop]').forEach(inp=>inp.onchange=()=>{snap();entry[inp.dataset.prop]=['x','y','w','h','startX','startY','endX','endY'].includes(inp.dataset.prop)?Number(inp.value):inp.value;editorPersist();syncProperties()});}
function canvasPoint(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)/rect.width*W+cam,y:(e.clientY-rect.top)/rect.height*H}}
function snappedObjectY(x,y){const possible=scene.zones.filter(z=>['floor','surface'].includes(z.type)&&x>=z.x&&x<=z.x+z.w&&Math.abs(y-z.y)<=85).sort((a,b)=>Math.abs(y-a.y)-Math.abs(y-b.y));return possible[0]?.y??y}
function findEditTarget(p){for(const o of [...scene.objects].reverse()){const dx=Math.abs(p.x-o.x),dy=Math.abs(p.y-(o.y-75));if(dx<65&&dy<103)return o}for(const z of [...scene.zones].reverse())if(p.x>=z.x&&p.x<=z.x+z.w&&p.y>=z.y&&p.y<=z.y+z.h)return z;return null}
function editorPointerDown(e){if(!editing||e.target!==canvas)return;const p=canvasPoint(e),tool=$('editor-tool').value;
 if(tool==='object'){snap();const type=$('object-type').value;const obj={id:'edit-'+Date.now(),type,name:{vase:'Cántaro',scroll:'Pergamino',torch:'Antorcha',door:'Puerta',philosopher:'Mentor'}[type],x:Math.round(p.x),y:Math.round(snappedObjectY(p.x,p.y)),...(type==='door'?{target:'cave_exit',hint:'Entrar en puerta'}:{})};scene.objects.push(obj);selected=obj;editorPersist();syncProperties();return}
 if(tool==='zone'){snap();brushStart=p;brushRect={x:p.x,y:p.y,w:1,h:1};canvas.setPointerCapture(e.pointerId);return}
 selected=findEditTarget(p);if(selected){snap();dragging={obj:selected,x:p.x,y:p.y,ox:selected.x,oy:selected.y};canvas.setPointerCapture(e.pointerId)}else{dragging={pan:true,x:p.x,cam};canvas.setPointerCapture(e.pointerId)}syncProperties()}
function editorPointerMove(e){if(!editing||!dragging&&!brushStart)return;const p=canvasPoint(e);
 if(brushStart){brushRect={x:Math.min(p.x,brushStart.x),y:Math.min(p.y,brushStart.y),w:Math.max(4,Math.abs(p.x-brushStart.x)),h:Math.max(4,Math.abs(p.y-brushStart.y))};return}
 if(dragging?.pan){cam=clamp(dragging.cam+(dragging.x-p.x),0,scene.width-W);return}
 if(dragging?.obj){dragging.obj.x=Math.round(clamp(dragging.ox+p.x-dragging.x,0,scene.width));dragging.obj.y=Math.round(clamp(dragging.oy+p.y-dragging.y,100,520))}
}
function editorPointerUp(e){if(!editing)return;if(brushRect&&brushStart){if(brushRect.w>6&&brushRect.h>6){const type=$('zone-type').value;const z={id:'zone-'+Date.now(),type,x:Math.round(brushRect.x),y:Math.round(brushRect.y),w:Math.round(brushRect.w),h:Math.round(brushRect.h)};if(type==='stairs'){z.startX=z.x;z.startY=z.y+z.h;z.endX=z.x+z.w;z.endY=z.y;}if(type==='door'){z.target='cave_exit'}scene.zones.push(z);selected=z;editorPersist();syncProperties()}}else if(dragging?.obj){if(scene.objects.includes(dragging.obj))dragging.obj.y=Math.round(snappedObjectY(dragging.obj.x,dragging.obj.y));editorPersist();syncProperties()}brushRect=null;brushStart=null;dragging=null}
function downloadFile(name,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function bindEditor(){canvas.addEventListener('pointerdown',editorPointerDown);canvas.addEventListener('pointermove',editorPointerMove);canvas.addEventListener('pointerup',editorPointerUp);canvas.addEventListener('pointercancel',editorPointerUp);
 $('editor-tool').onchange=e=>{editMode=e.target.value;selected=null;syncProperties()};
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const mode=b.dataset.edit;if(mode==='close')closeEditor();if(mode==='undo')undo();if(mode==='save'){editorPersist();showToast('Escena guardada')};if(mode==='delete'&&selected){snap();let arr=scene.objects.includes(selected)?scene.objects:scene.zones;arr.splice(arr.indexOf(selected),1);selected=null;editorPersist();syncProperties()}if(mode==='export')downloadFile('escenario-'+sceneId+'.json',JSON.stringify({scene:sceneId,objects:scene.objects,zones:scene.zones},null,2));if(mode==='import')$('import-file').click()});
 $('import-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.objects)||!Array.isArray(data.zones))throw Error('Faltan objetos o zonas');snap();scene.objects=data.objects;scene.zones=data.zones;editorPersist();showToast('Escenario importado')}catch(e){showToast('Archivo inválido: '+e.message)}e.target.value=''};
 canvas.addEventListener('wheel',e=>{if(!editing)return;e.preventDefault();cam=clamp(cam+e.deltaY*1.2,0,scene.width-W)},{passive:false});
}
function debugAPI(){window.SofiaTest={get:()=>({scene:sceneId,x:player.x,y:player.y,flags:deep(state.flags),concepts:[...state.unlockedConcepts],philosophers:[...state.unlockedPhilosophers],memories:state.memories.map(m=>m.id),editing}),teleport:(x,y)=>{player.x=x;player.y=y??getFloor(x,player.y)?.y??450},scene:(id)=>enterScene(id),action,album:showAlbum,galaxy:showGalaxy,editor:startEditor,save:persist}}
bindControls();bindEditor();debugAPI();intro();requestAnimationFrame(frame);
