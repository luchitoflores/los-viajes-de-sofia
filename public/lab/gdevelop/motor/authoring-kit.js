// Shared engine event. Content is authored in native scenes, variables and Yarn.
if (!runtimeScene.__sofiaKit) {
 const game=runtimeScene.getGame(),sv=runtimeScene.getVariables(),scene=runtimeScene.getName();
 const value=(o,k,f='')=>{const v=o.getVariables();return v.has(k)?v.get(k).toJSObject():f};
 const cfg=(k,f)=>sv.has(k)?sv.get(k).toJSObject():f;
 const all=()=>runtimeScene.getAdhocListOfAllInstances();
 const role=o=>String(value(o,'Tipo',''));
 const actors=all().filter(o=>role(o));
 const hero=actors.find(o=>role(o)==='jugador');if(!hero)throw Error('Esta habitación necesita una instancia con Tipo=jugador.');
 const ui=Object.fromEntries(['Title','Help','Message','Speaker','Bubble','Choice1','Choice2','Status'].map(n=>[n,runtimeScene.getObjects(n)[0]]));
 const KEY='sofia-gdevelop-autonomia-v1';
 if(!game.__sofiaKitState){
  let raw;try{raw=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
  game.__sofiaKitState=raw?.version===1&&raw.flags&&raw.items?raw:{version:1,flags:{},items:{},removed:[],enemies:{},hp:null,checkpoint:null,last:null};
 }
 const state=game.__sofiaKitState;
 const history=game.getVariables().get('Historia');
 if(!game.__sofiaKitHistory){state.flags={...(history.toJSObject()||{}),...state.flags};history.fromJSObject(state.flags);game.__sofiaKitHistory=true}
 const id=o=>scene+':'+String(value(o,'Id','')||o.persistentUuid||o.getName()+':'+actors.indexOf(o));
 const flags=StringList=>String(StringList||'').split(',').map(s=>s.trim()).filter(Boolean);
 const flag=f=>f==='equipment:lamp:on'?!!state.flags.luz:!!state.flags[f];
 const meets=rule=>flags(rule).every(f=>f.startsWith('!')?!flag(f.slice(1)):flag(f));
 const health=o=>o.hasBehavior('Salud')?o.getBehavior('Salud'):null;
 const hp=o=>health(o)?.Health()??0;
 const give=rule=>{for(const f of flags(rule)){state.flags[f]=true;history.getChild(f).setBoolean(true)}};
 const d=runtimeScene.__sofiaKit={scene,state,hero,actors,ui,x:hero.getX(),y:hero.getY(),vy:0,destination:null,pending:null,dialogue:false,question:false,options:[],selected:-1,time:0,dead:false,changing:false,ready:false,bullets:[],lastShot:-100,shoots:new Map(),noticeUntil:0,blocked:'',speaker:null,menu:false};
 globalThis.__sofiaKit=d;
 const maxHp=health(hero)?.MaxHealth()||5;
 if(state.hp!==null)health(hero)?.SetCurrentHealth(Math.max(1,Math.min(maxHp,state.hp)));
 if(game.__sofiaKitArrival?.scene===scene){d.x=game.__sofiaKitArrival.x;hero.setPosition(d.x,d.y);hero.flipX(game.__sofiaKitArrival.facing<0);game.__sofiaKitArrival=null}
 if(!state.checkpoint)state.checkpoint={scene,x:d.x};
 d.checkpoint={scene,x:d.x};
 for(const o of actors){
  const r=role(o);if(['suelo','obstaculo','paso'].includes(r))o.hide(true);
  if(['escalera','zona','evento'].includes(r))o.setOpacity(0);
  if(r==='enemigo'&&state.enemies[id(o)]!==undefined)health(o)?.SetCurrentHealth(state.enemies[id(o)]);
  if(r==='enemigo'&&hp(o)<=0)o.hide(true);
  if(state.removed.includes(id(o)))o.hide(true);
 }
 hero.setZOrder(100);
 const show=(name,on)=>ui[name]?.hide(!on);
 const text=(name,s)=>ui[name]?.setString(String(s));
 const choices=[ui.Choice1,ui.Choice2];
 const save=()=>{state.hp=Math.max(1,hp(hero));state.last={scene,x:d.universe?.savedX()??d.x};try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{notice('No se pudo guardar en este navegador.');return false}};
 const notice=s=>{text('Status',s);show('Status',true);d.noticeUntil=d.time+2.8};
 d.save=save;d.notice=notice;
 const targets=()=>actors.filter(o=>['npc','companero','objeto','portal','checkpoint','enemigo','zona','entrada','nave'].includes(role(o))&&!o.isHidden()&&!state.removed.includes(id(o)));
 const rect=o=>({x:o.getDrawableX(),y:o.getDrawableY(),w:o.getWidth(),h:o.getHeight()});
 const inside=(p,o)=>{const b=rect(o);return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h};
 const available=o=>(!value(o,'OcultarSi')||!meets(value(o,'OcultarSi')))&&(!value(o,'VisibleSi')||meets(value(o,'VisibleSi')));
 const validScene=target=>game.getGameData().layouts.some(l=>l.name===target);
 const travel=(target,x,facing=1)=>{
  if(d.changing)return;if(!validScene(target)){notice('No existe la escena: '+target);return}
  if(!Number.isFinite(x))x=120;save();d.changing=true;game.__sofiaKitArrival={scene:target,x,facing};
  gdjs.dialogueTree.stopRunningDialogue();gdjs.evtTools.runtimeScene.replaceScene(runtimeScene,target,false);
 };
 d.travel=travel;
 const uiRefresh=()=>{
  text('Title',cfg('Titulo',scene)+' · Vida '+Math.max(0,hp(hero))+'/'+maxHp);
  for(const o of actors){const r=role(o);if(['npc','companero','objeto','portal','checkpoint','enemigo'].includes(r))o.hide(!available(o)||state.removed.includes(id(o))||(r==='enemigo'&&hp(o)<=0)||(r==='companero'&&!meets(value(o,'Requiere'))))}
 };
 const dialogUI=()=>{
  for(const n of ['Bubble','Speaker','Message'])show(n,d.dialogue||d.menu);
  for(const c of choices)c.hide(true);
  if(!d.dialogue)return;
  const anchor=d.speaker??hero;
  const offset=runtimeScene.getLayer('').getCameraX()-640;
  const x=d.question?270:Math.max(15,Math.min(805,anchor.getX()-offset-220)),y=d.question?110:Math.max(85,Math.min(350,anchor.getY()-330));
  ui.Bubble.setPosition(x,y);ui.Bubble.setWidth(460);ui.Bubble.setHeight(d.question?Math.max(245,145+d.options.length*44):180);
  ui.Speaker.setPosition(x+18,y+10);ui.Message.setPosition(x+18,y+46);ui.Message.setWidth(420);
  if(d.question)for(let i=0;i<d.options.length;i++){
   if(!choices[i]){const o=runtimeScene.createObject('Choice1');o.setLayer('UI');choices.push(o)}
   choices[i].hide(false);choices[i].setPosition(x+18,y+115+i*44);choices[i].setString((d.selected===i?'▶ ':'› ')+d.options[i]);
  }
 };
 const syncYarn=()=>{
  const variable=new gdjs.Variable();gdjs.dialogueTree.saveState(variable);
  for(const [key,v] of Object.entries(variable.toJSObject()?.variables??{}))if(!['__proto__','constructor','prototype'].includes(key)){state.flags[key]=v;history.getChild(key).fromJSObject(v)}
  save();uiRefresh();
 };
 const read=()=>{
  syncYarn();d.selected=-1;
  if(!gdjs.dialogueTree.isRunning()){give(value(d.talking,'Otorga'));save();d.dialogue=false;d.question=false;d.enterAfter=d.time+.2;dialogUI();const done=d.afterTalk;d.afterTalk=null;done?.();return}
  d.question=gdjs.dialogueTree.isDialogueLineType('options');
  if(d.question&&gdjs.dialogueTree.getLineOptionsCount()===1){gdjs.dialogueTree.selectOption(0);gdjs.dialogueTree.hasSelectedOptionChanged();gdjs.dialogueTree.confirmSelectOption();read();return}
  if(!d.question){const raw=gdjs.dialogueTree.getLineText(),i=raw.indexOf(':');text('Speaker',i<0?'':raw.slice(0,i));text('Message',i<0?raw:raw.slice(i+1).trim());
   d.speaker=i>=0&&raw.slice(0,i)==='Sofía'?hero:d.talking;
   if(gdjs.dialogueTree.branchContainsTag('decision')){gdjs.dialogueTree.goToNextDialogueLine();d.question=gdjs.dialogueTree.isDialogueLineType('options')}
  }
  if(d.question)d.options=Array.from({length:gdjs.dialogueTree.getLineOptionsCount()},(_,i)=>String(gdjs.dialogueTree.getLineOption(i)));
  dialogUI();
 };
 const talk=(node,o)=>{
  if(!d.ready){notice('Las conversaciones se están cargando.');return}
  if(!gdjs.dialogueTree.hasDialogueBranch(node)){notice('No existe el nodo Yarn: '+node);return}
  d.destination=null;d.pending=null;d.talking=o;d.speaker=o;d.dialogue=true;if(d.universe)d.universe.face(o);else{hero.flipX(o.getX()<d.x);o.flipX(d.x<o.getX());}
  for(const [key,v] of Object.entries(state.flags))gdjs.dialogueTree.setVariable(key,v);
  gdjs.dialogueTree.startFrom(node);read();
 };
 const advance=()=>{if(d.menu){d.menu=false;dialogUI();return}if(d.dialogue&&!d.question){gdjs.dialogueTree.goToNextDialogueLine();read()}};
 const answer=i=>{if(!d.question||i<0||i>=d.options.length)return;gdjs.dialogueTree.selectOption(i);gdjs.dialogueTree.hasSelectedOptionChanged();gdjs.dialogueTree.confirmSelectOption();read()};
 const shoot=(owner,isHero)=>{
  const now=d.time,interval=isHero?Number(cfg('IntervaloAtaque',.35)):Number(value(owner,'Intervalo',1.8));
  if(now-(isHero?d.lastShot:d.shoots.get(owner)??-100)<interval)return;
  if(isHero)d.lastShot=now;else d.shoots.set(owner,now);
  const o=runtimeScene.createObject('Pulso');o.setPosition(owner.getX()+(isHero?(hero.isFlippedX()?-25:25):0),owner.getY()-(isHero?(d.crouching?35:65):100));o.setWidth(30);o.setHeight(18);o.setZOrder(105);
  if(!isHero)o.setColor('255;135;110');
  const direction=isHero?(hero.isFlippedX()?-1:1):Math.sign(d.x-owner.getX())||1;
  d.bullets.push({o,hero:isHero,vx:direction*(isHero?Number(cfg('VelocidadDisparo',620)):Number(value(owner,'VelocidadDisparo',180))),damage:Number(isHero?cfg('Danio',1):value(owner,'Danio',1)),life:3});
 };
 const attack=()=>{if(!cfg('Combate',false)||d.dialogue||d.menu||d.dead)return;d.attackUntil=d.time+.18;shoot(hero,true)};
 const execute=(actions,o)=>{
  if(!actions?.length)return;
  const [a,...rest]=actions;if(!meets([...(a.requires||[]),...(a.excludes||[]).map(f=>'!'+f)].join(','))){execute(rest,o);return}
  if(a.reward?.flags)give(a.reward.flags.join(','));
  if(a.type==='talk'){d.afterTalk=()=>execute(rest,o);const variant=a.variants?.find(v=>meets([...(v.requires||[]),...(v.excludes||[]).map(f=>'!'+f)].join(',')));talk(variant?.target||a.target,o);return}
  if(a.type==='enter'){(state.doors??=[]).push({scene,x:d.universe?.savedX()??d.x});travel(a.target,120);return}
  if(a.type==='return'){
   let previous=state.doors?.pop();while(previous&&!validScene(previous.scene))previous=state.doors?.pop();
   if(previous){travel(previous.scene,previous.x);return}
   // Direct scene previews have never crossed a door. Their authored surface is a real fallback.
   const target=String(cfg('RegresoSinHistorial',cfg('Superficie','')));
   if(validScene(target)){travel(target,Number(state.surfaceAngles?.[target]??-8));return}
   notice('Configura Superficie o RegresoSinHistorial para volver desde la prueba de esta escena.');return;
  }
  if(a.type==='surface'){travel(String(cfg('Superficie','plato')),Number(state.surfaceAngles?.[cfg('Superficie','plato')]??-8));return}
  if(a.type==='portal'){travel(a.target,-8);return}
  if(a.type==='equipment'){const on=a.command==='turnOn';history.getChild('luz').setBoolean(on);state.flags.luz=on;}
  if(a.type==='collect'){state.items[id(o)]={name:value(o,'Nombre',o.getName()),description:a.text||''};if(!state.removed.includes(id(o)))state.removed.push(id(o));o.hide(true);}
  if(a.type==='activity'){notice('Actividad pendiente de integrar: '+a.target);return}
  if(a.text)notice(a.text);save();execute(rest,o);
 };
 const interact=o=>{
  if(!available(o)||!meets(value(o,'Requiere'))){notice(value(o,'Bloqueo','Este acceso todavía está bloqueado.'));return}
  const r=role(o),node=String(value(o,'Dialogo'));
  if(r==='nave'){d.universe?.board(o);return}
  if(value(o,'Destino')&&r!=='paso'){
   const target=String(value(o,'Destino'));(state.doors??=[]).push({scene,x:d.universe?.savedX()??d.x});travel(target,value(o,'DestinoSuperficie',false)?Number(state.surfaceAngles?.[target]??-8):Number(value(o,'LlegadaX',120)));return;
  }
  if(value(o,'Acciones')){try{execute(JSON.parse(value(o,'Acciones')),o)}catch(e){notice('Revisa Acciones: '+e.message)}return}
  if(r==='npc'||r==='companero'){let branch=node;try{const variant=JSON.parse(value(o,'VariantesDialogo','[]')).find(v=>meets([...(v.requires||[]),...(v.excludes||[]).map(f=>'!'+f)].join(',')));branch=variant?.target||branch}catch{}if(branch)talk(branch,o);else notice('Asigna un nodo en la variable Dialogo.');return}
  if(r==='portal'){travel(String(value(o,'Destino')),Number(value(o,'LlegadaX',120)));return}
  if(r==='checkpoint'){state.checkpoint={scene,x:o.getX()};save();notice('Punto de retorno guardado.');return}
  if(r==='enemigo'){attack();return}
  if(r==='objeto'){
   give(value(o,'Otorga'));state.items[id(o)]={name:String(value(o,'Nombre',o.getName())),description:String(value(o,'Descripcion','Objeto recogido.'))};
   if(value(o,'UnaVez',true))state.removed.push(id(o));o.hide(true);save();uiRefresh();notice('Recogido: '+value(o,'Nombre',o.getName()));if(node)talk(node,o);
  }
 };
 const inventory=()=>{
  if(d.dialogue||d.dead)return;d.destination=null;d.pending=null;d.menu=true;
  ui.Bubble.setPosition(270,110);ui.Bubble.setWidth(600);ui.Bubble.setHeight(360);ui.Speaker.setPosition(290,125);ui.Message.setPosition(290,165);ui.Message.setWidth(550);
  text('Speaker','Inventario · Enter o toque para cerrar');text('Message',Object.values(state.items).map(i=>i.name+' — '+i.description).join('\n\n')||'Todavía no has recogido objetos.');dialogUI();
 };
 const retry=()=>{health(hero)?.SetCurrentHealth(maxHp);state.hp=maxHp;for(const o of actors.filter(o=>role(o)==='enemigo'&&hp(o)>0))delete state.enemies[id(o)];const c=state.checkpoint??d.checkpoint;travel(c.scene,c.x)};
 const action=a=>{
  if(a==='superficiePrueba'){
   if(!game.isPreview()||d.universe)return;
   const surface=String(cfg('Superficie',cfg('RegresoSinHistorial','')));
   if(validScene(surface)){d.dialogue=false;d.menu=false;travel(surface,Number(state.surfaceAngles?.[surface]??-8))}else notice('Configura la variable Superficie de esta escena.');return;
  }
  if(a==='vista'){d.universe?.view();return}if(a==='agacharse'){d.crouchToggle=!d.crouchToggle;d.destination=null;return}
  if(a==='atacar')attack();if(a==='inventario')inventory();if(a==='guardar'&&save())notice('Partida de la plantilla guardada.');
  if(a==='cargar'){const last=state.last;if(last)travel(last.scene,last.x);else notice('Todavía no hay un guardado.');}
  if(a==='reintentar'&&d.dead)retry();
  if(a==='reiniciar'&&confirm('¿Borrar únicamente el progreso de esta plantilla de GDevelop?')){localStorage.removeItem(KEY);game.__sofiaKitState=null;game.__sofiaKitHistory=false;history.fromJSObject({});d.changing=true;gdjs.evtTools.runtimeScene.replaceScene(runtimeScene,String(cfg('Inicio','inicio')),false)}
 };
 const pointClick=(p,up=p)=>{
  if(d.dead){retry();return}
  if(d.dialogue||d.menu){if(d.question){for(let i=0;i<choices.length;i++)if(!choices[i].isHidden()&&inside(up,choices[i])){answer(i);break}}else advance();return}
  const button=actors.find(o=>role(o)==='boton'&&!o.isHidden()&&inside(up,o));if(button){action(String(value(button,'Accion')));return}
  if(d.universe?.click(p))return;
  const o=targets().reverse().find(o=>inside(p,o));d.pending=o??null;d.destination=o?o.getX():Math.max(30,Math.min(Number(cfg('Ancho',1280))-30,p.x));
 };
 const keyHandler=e=>{
  if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.isComposing||e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(['Enter','NumpadEnter','Space','KeyF','KeyR','KeyI','KeyL'].includes(e.code)||(e.code==='Tab'&&globalThis.__sofiaKit?.question)){e.preventDefault();game.__sofiaKitKeys.push(e.code)}
 };
 if(!game.__sofiaKitKeys){game.__sofiaKitKeys=[];window.addEventListener('keydown',keyHandler)}
 const lamp=new PIXI.Graphics();runtimeScene.getLayer('').getRenderer().addRendererObject(lamp,9000);
 const json=String(cfg('ArchivoDialogos','dialogues/historias.yarn.json'));
 game.getJsonManager().loadJson(json,(error,content)=>{if(error){notice('No se pudo cargar '+json);return}try{const variable=new gdjs.Variable();variable.setString(JSON.stringify(content));gdjs.dialogueTree.loadFromSceneVariable(variable,'');d.ready=true}catch(e){notice('Revisa el archivo Yarn: '+String(e))}});
 d.universe=game.__sofiaUniverse?.({runtimeScene,game,sv,scene,d,hero,actors,role,value,cfg,state,targets,inside,meets,interact,travel,notice,save});
 const previewReturn=actors.find(o=>role(o)==='boton'&&value(o,'Accion')==='superficiePrueba');
 if(previewReturn)previewReturn.hide(!game.isPreview()||!!d.universe);
 for(const o of actors.filter(o=>role(o)==='arma'||role(o)==='boton'&&['atacar','agacharse'].includes(value(o,'Accion'))))o.hide(!cfg('Combate',false));
 text('Help',cfg('Ayuda','Toca para caminar · A/D · Espacio: salto · F: pulso · Enter: hablar · I: inventario'));uiRefresh();dialogUI();show('Status',false);
 d.step=()=>{
  if(d.changing)return;const dt=Math.min(.05,runtimeScene.getElapsedTime()/1000);d.time+=dt;state.flags=history.toJSObject()||{};
  const signature=JSON.stringify(state.flags);if(signature!==d.flagSignature){d.flagSignature=signature;try{for(const rule of JSON.parse(cfg('ReglasProgreso','[]')))if(meets(rule.requires.join(',')))give(rule.flags.join(','))}catch{}uiRefresh()}
  if(previewReturn)previewReturn.hide(!game.isPreview()||!!d.universe||d.dialogue||d.menu);
  const input=game.getInputManager(),key=game.__sofiaKitKeys.shift();
  if(d.universe?.busy()){d.universe.step(dt,input);return}
  if(key==='Enter'||key==='NumpadEnter'){
   if(d.dead)retry();else if(d.menu)advance();else if(d.question){if(d.selected>=0)answer(d.selected)}else if(d.dialogue)advance();
   else if(d.time>(d.enterAfter??0)){const distance=o=>d.universe?d.universe.distance(o):Math.abs(o.getX()-d.x);const near=targets().filter(o=>distance(o)<130).sort((a,b)=>distance(a)-distance(b))[0];if(near)interact(near)}
  }
  if(key==='Tab'&&d.question){d.selected=(d.selected+1)%d.options.length;dialogUI()}
  if(key==='KeyF')attack();if(key==='KeyI')inventory();if(key==='KeyR'&&d.dead)retry();
  if(key==='KeyL'&&state.flags.linterna){state.flags.luz=!state.flags.luz;history.getChild('luz').setBoolean(state.flags.luz);save();notice(state.flags.luz?'Linterna encendida':'Linterna apagada')}
  if(input.isMouseButtonReleased(0))pointClick({x:gdjs.evtTools.input.getCursorX(runtimeScene,'',0),y:gdjs.evtTools.input.getCursorY(runtimeScene,'',0)},{x:gdjs.evtTools.input.getCursorX(runtimeScene,'UI',0),y:gdjs.evtTools.input.getCursorY(runtimeScene,'UI',0)});
  if(d.universe){d.universe.step(dt,input);return}
  if(Number(cfg('Ancho',1280))>1280)runtimeScene.getLayer('').setCameraX(Math.max(640,Math.min(Number(cfg('Ancho',1280))-640,d.x)));
  if(!d.dialogue&&!d.menu&&!d.dead)for(const event of actors.filter(o=>role(o)==='evento')){const b=rect(event);if(d.x>=b.x&&d.x<=b.x+b.w&&meets(value(event,'Requiere'))&&!(state.events||[]).includes(id(event))){(state.events??=[]).push(id(event));try{execute(JSON.parse(value(event,'Acciones','[]')),event)}catch(e){notice(e.message)}save();break}}
  d.crouching=!d.dialogue&&!d.menu&&(d.crouchToggle||input.isKeyPressed(40)||input.isKeyPressed(83));
  let axis=0;
  if(!d.dialogue&&!d.menu&&!d.dead){
   axis=Number(input.isKeyPressed(39)||input.isKeyPressed(68))-Number(input.isKeyPressed(37)||input.isKeyPressed(65));if(axis){d.destination=null;d.pending=null}
   if(d.pending&&Math.abs(d.x-d.pending.getX())<(role(d.pending)==='enemigo'?260:100)){const o=d.pending;d.pending=null;d.destination=null;interact(o)}
   if(!axis&&d.destination!==null){const diff=d.destination-d.x;if(Math.abs(diff)<4)d.destination=null;else axis=Math.sign(diff)}
   if(key==='Space'&&cfg('PermitirSalto',true)&&d.grounded)d.vy=-420;
   if(d.crouching)axis=0;
   let next=Math.max(25,Math.min(Number(cfg('Ancho',1280))-25,d.x+axis*Number(cfg('Velocidad',240))*dt));
   for(const o of actors.filter(o=>(role(o)==='obstaculo'||role(o)==='npc'&&value(o,'Solido',false))&&!o.isHidden())){const b=rect(o),margin=role(o)==='npc'?24:18;if(next+margin>b.x&&next-margin<b.x+b.w&&d.y>b.y+8&&d.y-130<b.y+b.h&&Math.abs(next-o.getX())<Math.abs(d.x-o.getX())){next=d.x;d.destination=null;axis=0}}
   const oldX=d.x;d.x=next;const previousY=d.y;d.vy+=950*dt;d.y+=d.vy*dt;d.grounded=false;
   for(const o of actors.filter(o=>role(o)==='escalera')){const b=rect(o),surface=x=>b.y+b.h-(x-b.x)/b.w*b.h,oldSurface=surface(oldX);if(d.x>=b.x-3&&d.x<=b.x+b.w+3&&Math.abs(previousY-oldSurface)<45&&d.vy>=0){d.y=surface(d.x);d.vy=0;d.grounded=true}}
   for(const o of actors.filter(o=>role(o)==='suelo')){const b=rect(o);if(d.x>=b.x&&d.x<=b.x+b.w&&d.vy>=0&&previousY<=b.y+5&&d.y>=b.y){d.y=b.y;d.vy=0;d.grounded=true}}
   if(d.y>800){health(hero)?.Hit(maxHp,false,false);}
   if(axis)hero.flipX(axis<0);hero.setPosition(d.x,d.y);
   for(const o of actors.filter(o=>role(o)==='paso')){const b=rect(o),direction=Number(value(o,'Direccion',1));if(axis*direction<=0||d.x<b.x||d.x>b.x+b.w||d.y<b.y||d.y>b.y+b.h)continue;
    if(!meets(value(o,'Requiere'))){d.x-=axis*5;hero.setX(d.x);d.destination=null;axis=0;if(d.blocked!==id(o)){notice(value(o,'Bloqueo','Completa el requisito para continuar.'));d.blocked=id(o)}break}
    travel(String(value(o,'Destino')),Number(value(o,'LlegadaX',120)),direction);return;
   }
   if(!actors.some(o=>role(o)==='paso'&&Math.abs(o.getX()-d.x)<120))d.blocked='';
  }
  hero.setAnimationName(d.crouching?'Crouch':axis?'Walk':'Idle');
  for(const o of actors.filter(o=>role(o)==='companero'&&!o.isHidden())){const goal=d.x+(hero.isFlippedX()?90:-90),diff=goal-o.getX();if(!d.dialogue&&Math.abs(diff)>5)o.setX(o.getX()+Math.sign(diff)*Math.min(Math.abs(diff),Number(cfg('Velocidad',240))*dt));o.flipX(hero.isFlippedX());let ground=d.y;for(const f of actors.filter(f=>['suelo','escalera'].includes(role(f)))){const b=rect(f);if(o.getX()>=b.x&&o.getX()<=b.x+b.w){ground=role(f)==='escalera'?b.y+b.h-(o.getX()-b.x)/b.w*b.h:b.y;break}}o.setY(ground)}
  const weapon=actors.find(o=>role(o)==='arma');if(weapon){weapon.hide(!cfg('Combate',false));weapon.setPosition(d.x+(hero.isFlippedX()?-25:25),d.y-(d.crouching?35:65));weapon.flipX(hero.isFlippedX());weapon.setOpacity(d.attackUntil>d.time?255:190)}
  if(!d.dialogue&&!d.menu&&!d.dead&&cfg('Combate',false)){
   for(const o of actors.filter(o=>role(o)==='enemigo'&&!o.isHidden()&&meets(value(o,'Requiere')))){
    const speed=Number(value(o,'Velocidad',30)),lo=Number(value(o,'MinX',o.getX()-80)),hi=Number(value(o,'MaxX',o.getX()+80));
    o.__direction??=-1;if(o.getX()<=lo)o.__direction=1;if(o.getX()>=hi)o.__direction=-1;o.setX(Math.max(lo,Math.min(hi,o.getX()+o.__direction*speed*dt)));o.flipX(d.x<o.getX());
    if(Math.abs(o.getX()-d.x)<Number(value(o,'Alcance',650)))shoot(o,false);
    if(Math.abs(o.getX()-d.x)<40&&Math.abs(o.getY()-d.y)<100)health(hero)?.Hit(Number(value(o,'Danio',1)),false,false);
   }
   for(const bullet of d.bullets){bullet.life-=dt;bullet.o.setX(bullet.o.getX()+bullet.vx*dt);const victims=bullet.hero?actors.filter(o=>role(o)==='enemigo'&&!o.isHidden()):[hero];
    for(const obstacle of actors.filter(o=>role(o)==='obstaculo'))if(inside({x:bullet.o.getX(),y:bullet.o.getY()},obstacle))bullet.life=0;
    if(bullet.life<=0)continue;
    for(const o of victims)if(Math.abs(bullet.o.getX()-o.getX())<38&&bullet.o.getY()>o.getY()-(o===hero&&d.crouching?64:145)&&bullet.o.getY()<o.getY()){
     const before=hp(o);health(o)?.Hit(bullet.damage,false,false);bullet.life=0;
     if(hp(o)<before){o.__hitUntil=d.time+.24;notice((o===hero?'Sofía':value(o,'Nombre','Enemigo'))+' −'+(before-hp(o))+' · Vida '+Math.max(0,hp(o)));}
     if(o!==hero){state.enemies[id(o)]=hp(o);if(hp(o)<=0){give(value(o,'Otorga'));o.hide(true);notice('Encuentro superado.');save();uiRefresh()}}break;
    }
   }
   for(const b of d.bullets.filter(b=>b.life<=0))b.o.deleteFromScene(runtimeScene);d.bullets=d.bullets.filter(b=>b.life>0);
  }
  for(const o of actors.filter(o=>['enemigo','jugador'].includes(role(o)))){o.setColor(o.__hitUntil>d.time?'255;95;95':'255;255;255');o.setOpacity(o.__hitUntil>d.time?160:255)}
  if(hp(hero)<=0&&!d.dead){d.dead=true;d.destination=null;d.pending=null;d.bullets.forEach(b=>b.o.hide());notice('Sin energía · Enter, R o toca para reintentar desde el punto de retorno.');d.noticeUntil=Infinity;}
  if(!d.dead)state.hp=hp(hero);text('Title',cfg('Titulo',scene)+' · Vida '+Math.max(0,hp(hero))+'/'+maxHp);
  if(d.noticeUntil&&d.time>d.noticeUntil){show('Status',false);d.noticeUntil=0}
  lamp.clear();const dark=Number(cfg('Oscuridad',0));if(dark>0){lamp.beginFill(0x030511,dark).drawRect(-300,-300,1880,1320);if(state.flags.luz)lamp.beginHole().drawCircle(d.x,d.y-65,235).endHole();lamp.endFill()}
  if(cfg('Combate',false))for(const o of actors.filter(o=>role(o)==='enemigo'&&!o.isHidden())){const width=72,x=o.getX()-width/2,y=o.getY()-170;lamp.beginFill(0x171729,.9).drawRoundedRect(x,y,width,9,3).endFill();lamp.beginFill(0xe3ad65,1).drawRoundedRect(x,y,width*Math.max(0,hp(o))/(health(o)?.MaxHealth()||1),9,3).endFill()}
  for(const o of actors.filter(o=>role(o)==='boton'&&['atacar','agacharse'].includes(value(o,'Accion'))))o.hide(!cfg('Combate',false));
 };
}
runtimeScene.__sofiaKit.step();
