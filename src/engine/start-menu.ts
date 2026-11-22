import {PLAY_MODE,modeName,selectMode,setProgressWrites,type PlayMode} from './play-session';
import {readLibrary,newCampaign,loadSavedGame,saveCheckpoint,type SavedGame} from './save-library';
import {escape} from './content-player';

interface MenuHost {show:(html:string)=>void;save:()=>boolean;resume:()=>void;reload:(start:boolean)=>void;close:()=>void;note:(text:string)=>void}
const date=(value:string)=>new Intl.DateTimeFormat('es',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Guayaquil'}).format(new Date(value));
const button=(id:string,label:string)=>`<button type="button" data-menu="${id}" ${id==='continue'?'data-action="continue-mode"':id==='story'?'data-action="mode-story"':id==='free'?'data-action="mode-free"':''}>${label}</button>`;
export function startMenu(host:MenuHost){
 const on=(id:string,run:()=>void)=>document.querySelector<HTMLButtonElement>(`[data-menu="${id}"]`)?.addEventListener('click',run);
 const header=(title:string)=>`<div class="start-screen"><div class="eyebrow">SOFÍA Y LOS MUNDOS DE LAS IDEAS</div><span class="menu-mode">Modo ${modeName(PLAY_MODE)}</span><h2>${title}</h2>`;
 const describe=(s:SavedGame)=>`<span class="save-name">${escape(s.name)}</span><small>${escape([s.location||'Último lugar guardado',s.progress,date(s.updated)].filter(Boolean).join(' · '))}</small>`;
 const error=(e:unknown)=>host.note((e as Error).message);
 const open=()=>{
  try{
   if(!host.save())return;setProgressWrites(false);const library=readLibrary(localStorage),active=library.entries.find(s=>s.id===library.active[PLAY_MODE]);
   if(!localStorage.getItem('sofia-play-mode-v1')&&!library.entries.length){chooseMode();return}
   host.show(header('Tu próximo viaje')+`<div class="main-menu-buttons">${active?button('continue','<strong>Continuar</strong>'+describe(active)):''}${button('load','Cargar partida')}${button('new','Nueva partida')}${button('mode','Cambiar modo')}</div><p class="menu-footnote">Cada partida conserva su propio guardado automático.</p></div>`);
   on('continue',host.resume);on('load',loadMenu);on('new',()=>nameForm(false));on('mode',chooseMode);
  }catch(e){error(e)}
 };
 const chooseMode=()=>{
  if(!host.save())return;setProgressWrites(false);
  host.show(`<div class="start-screen"><div class="eyebrow">SOFÍA Y LOS MUNDOS DE LAS IDEAS</div><h2>Elige cómo viajar</h2><div class="play-modes">${button('story','<strong>Historia</strong><span>Recorre una ruta y descubre los planetas paso a paso.</span>')}${button('free','<strong>Libre</strong><span>Elige cualquier mundo y explora a tu ritmo.</span>')}</div>${localStorage.getItem('sofia-play-mode-v1')?button('back','Volver al menú'):''}</div>`);
  const choose=(mode:PlayMode)=>{try{selectMode(mode);if(mode===PLAY_MODE)open();else host.reload(false)}catch(e){error(e)}};
  on('story',()=>choose('story'));on('free',()=>choose('free'));on('back',open);
 };
 const loadMenu=()=>{
  try{
   const saves=readLibrary(localStorage).entries.filter(s=>s.mode===PLAY_MODE).sort((a,b)=>b.updated.localeCompare(a.updated));
   host.show(header('Cargar partida')+`<div class="saved-game-list">${saves.length?saves.map(s=>`<button data-load-save="${escape(s.id)}"><b>${s.kind==='auto'?'Guardado automático':'Guardado con nombre'}</b>${describe(s)}</button>`).join(''):'<p>Todavía no hay partidas en este modo.</p>'}</div>${button('back','Volver al menú')}</div>`);
   document.querySelectorAll<HTMLButtonElement>('[data-load-save]').forEach(b=>b.onclick=()=>{try{setProgressWrites(false);loadSavedGame(localStorage,PLAY_MODE,b.dataset.loadSave!);selectMode(PLAY_MODE);host.reload(true)}catch(e){error(e)}});on('back',open);
  }catch(e){error(e)}
 };
 const nameForm=(manual:boolean)=>{
  if(manual&&!host.save())return;
  const library=readLibrary(localStorage),active=library.entries.find(s=>s.id===library.active[PLAY_MODE]);
  host.show(header(manual?'Guardar con nombre':'Nueva partida')+`<p>${manual?'Crea un punto al que podrás volver desde Cargar partida.':'Las partidas anteriores y los diseños del editor se conservan.'}</p><form id="save-name-form"><label>Nombre<input id="save-name" maxlength="80" required value="${escape(manual?(active?.name??'Mi viaje')+' · '+new Date().toLocaleDateString('es'):'Mi viaje · '+modeName(PLAY_MODE))}"></label><p id="save-name-error" role="alert"></p><div class="row"><button type="submit">${manual?'Guardar':'Comenzar'}</button>${button('cancel','Cancelar')}</div></form></div>`);
  document.getElementById('save-name-form')!.onsubmit=e=>{e.preventDefault();try{const title=(document.getElementById('save-name') as HTMLInputElement).value;if(manual){saveCheckpoint(localStorage,PLAY_MODE,title);host.close();host.note('Partida guardada con nombre.')}else{setProgressWrites(false);newCampaign(localStorage,PLAY_MODE,title);selectMode(PLAY_MODE);host.reload(true)}}catch(e){document.getElementById('save-name-error')!.textContent=(e as Error).message}};
  on('cancel',manual?host.close:open);document.querySelector<HTMLInputElement>('#save-name')!.focus();
 };
 return{open,chooseMode,save:()=>nameForm(true)};
}
