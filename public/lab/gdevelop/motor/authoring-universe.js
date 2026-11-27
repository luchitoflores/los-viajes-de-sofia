// Registered once by a native external event. Every surface is an ordinary duplicable scene.
runtimeScene.getGame().__sofiaUniverse = c => {
 const {runtimeScene:rs,game,scene,d,hero,actors,role,value,cfg,state,targets,inside,meets,interact,travel,notice,save}=c;
 if(cfg('Modo','interior')!=='superficie')return null;
 const cx=Number(cfg('CentroX',640)),cy=Number(cfg('CentroY',360)),radius=Number(cfg('Radio',220));
 const rad=a=>({x:cx+Math.sin(a)*radius,y:cy-Math.cos(a)*radius}),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const angle=o=>Math.atan2(o.getX()-cx,cy-o.getY());
 const fixed=actors.filter(o=>!['jugador','boton','arma','efecto'].includes(role(o))).map(o=>({o,a:angle(o),height:Math.hypot(o.getX()-cx,o.getY()-cy)-radius}));
 let a=Number(cfg('AnguloInicial',-8))*Math.PI/180;
 if(game.__sofiaSurfaceReturn?.scene===scene){a=game.__sofiaSurfaceReturn.angle;game.__sofiaSurfaceReturn=null}
 // Interior/portal arrivals carry degrees in the shared arrival x field.
 if(d.x!==hero.getX()||Math.abs(d.x)<=180)a=d.x*Math.PI/180;
 if(game.__sofiaSurfaceAngle!==undefined){a=game.__sofiaSurfaceAngle;delete game.__sofiaSurfaceAngle}
 let target=null,pending=null,flight=null,map=null,landing=game.__sofiaLanding?0:null;game.__sofiaLanding=false;
 const surfaces=()=>game.getGameData().layouts.filter(l=>l.variables?.some(v=>v.name==='Modo'&&v.value==='superficie')).sort((a,b)=>Number(a.variables.find(v=>v.name==='Orden')?.value||0)-Number(b.variables.find(v=>v.name==='Orden')?.value||0));
 const uiTexts=[];
 const label=(s,x,y)=>{const o=rs.createObject('Choice1');o.setLayer('UI');o.setPosition(x,y);o.setString(s);o.setZOrder(1000);uiTexts.push(o);return o};
 const clear=()=>{for(const o of uiTexts)o.deleteFromScene(rs);uiTexts.length=0;d.ui.Bubble.hide(true)};
 const ship=actors.find(o=>role(o)==='nave');
 const place=(o,ang,height=0)=>{o.setPosition(cx+Math.sin(ang)*(radius+height),cy-Math.cos(ang)*(radius+height));o.setAngle(ang*180/Math.PI)};
 const moveHero=()=>{const p=rad(a);d.x=p.x;d.y=p.y;hero.setPosition(p.x,p.y);hero.setAngle(a*180/Math.PI);state.surfaceAngles??={};state.surfaceAngles[scene]=a*180/Math.PI;};
 for(const {o,a,height} of fixed)place(o,a,height);moveHero();
 const openMap=()=>{
  target=null;pending=null;map=[];clear();d.ui.Bubble.hide(false);d.ui.Bubble.setPosition(305,100);d.ui.Bubble.setWidth(650);d.ui.Bubble.setHeight(510);label('Elige destino · o baja sin viajar',340,120);
  surfaces().forEach((l,i)=>{const title=l.variables.find(v=>v.name==='Titulo')?.value||l.name;map.push({o:label((l.name===scene?'Bajar aquí · ':'Viajar · ')+title,340,175+i*48),scene:l.name,index:i})});
 };
 const beginFlight=destination=>{
  clear();map=null;if(destination.scene===scene){hero.hide(false);return}
  const worlds=surfaces(),from=worlds.findIndex(l=>l.name===scene),to=worlds.findIndex(l=>l.name===destination.scene),direction=Math.sign(to-from)||1;
  flight={time:0,target:destination.scene,direction,over:worlds.slice(Math.min(from,to)+1,Math.max(from,to)).map(l=>l.name)};d.flight=flight;
  target=null;pending=null;hero.hide(true);save();
  label('Despegue',420,100);
 };
 const context={
  savedX:()=>a*180/Math.PI,
  face(o){const delta=wrap(angle(o)-a);hero.flipX(delta<0);o.flipX(delta>0)},
  view(){notice('Vista general del planeta · recorre toda su circunferencia con toque o A/D.');},
  board(){hero.hide(true);openMap()},
  busy:()=>!!flight||!!map||landing!==null,
  distance:o=>Math.abs(wrap(angle(o)-a))*radius,
  click(p){
   if(map){const chosen=map.find(t=>p.x>=320&&p.x<=950&&p.y>=t.o.getY()-4&&p.y<t.o.getY()+42);if(chosen)beginFlight(chosen);return true}
   if(flight||landing!==null)return true;
   const o=targets().reverse().find(o=>inside(p,o));pending=o||null;target=o?angle(o):Math.atan2(p.x-cx,cy-p.y);return true;
  },
  step(dt,input){
   if(d.noticeUntil&&d.time>d.noticeUntil){d.ui.Status.hide(true);d.noticeUntil=0}
   if(map){if(input.isMouseButtonReleased(0))context.click({x:gdjs.evtTools.input.getCursorX(rs,'',0),y:gdjs.evtTools.input.getCursorY(rs,'',0)});return}
   if(flight){
    flight.time+=dt;const t=flight.time,dir=flight.direction;
    if(t>=1.1)for(const {o} of fixed)if(o!==ship&&!['sobrevuelo','boton'].includes(role(o)))o.hide(true);
    if(ship){if(t<1.1){const sa=angle(ship);place(ship,sa,t*150)}else{ship.setAngle(dir*90);ship.setPosition(200+dir*0+(dir>0?t-1.1:4.9-t)*180,280);}}
    if(uiTexts[0])uiTexts[0].setString(t<1.1?'Despegue':t<4.8?'Vuelo '+(dir>0?'→':'←')+(flight.over.length?' · Sobrevolando '+flight.over.join(', '):''):'Aproximación');
    // Native planet objects are reused as flyover scenery; the one visible ship is never duplicated.
    for(const o of actors.filter(o=>role(o)==='sobrevuelo')){const wid=String(value(o,'Mundo'));const idx=flight.over.indexOf(wid);o.hide(idx<0||t<1.1||t>4.8);if(idx>=0)o.setPosition(cx+dir*(700-(t-1.1)*420+idx*240),500)}
    if(t>=5.6){game.__sofiaLanding=true;game.__sofiaSurfaceReturn={scene:flight.target,angle:-26*Math.PI/180};travel(flight.target,-26,dir)}return;
   }
   if(landing!==null){landing+=dt;hero.hide(true);const anchor=fixed.find(f=>f.o===ship);if(ship&&anchor)place(ship,anchor.a,Math.max(0,1.2-landing)*160);if(landing>=1.2){landing=null;hero.hide(false);moveHero()}return}
   if(d.dialogue||d.menu){hero.setAnimationName('Idle');return}
   let axis=Number(input.isKeyPressed(39)||input.isKeyPressed(68))-Number(input.isKeyPressed(37)||input.isKeyPressed(65));if(axis){target=null;pending=null}
   if(pending&&context.distance(pending)<45){const o=pending;target=null;pending=null;game.__sofiaSurfaceReturn={scene,angle:a};interact(o);return}
   if(!axis&&target!==null){const delta=wrap(target-a);if(Math.abs(delta)<.018)target=null;else axis=Math.sign(delta)}
   let next=a+axis*Number(cfg('Velocidad',120))/radius*dt;
   for(const f of fixed.filter(f=>role(f.o)==='obstaculo'))if(Math.abs(wrap(next-f.a))*radius<f.o.getWidth()/2+16&&Math.abs(wrap(next-f.a))<Math.abs(wrap(a-f.a))){next=a;axis=0;target=null;notice(value(f.o,'Nombre','Obstáculo: busca otro camino alrededor del planeta.'))}
   a=wrap(next);moveHero();if(axis)hero.flipX(axis<0);hero.setAnimationName(axis?'Walk':'Idle');
  }
 };
 for(const o of actors.filter(o=>role(o)==='sobrevuelo'))o.hide(true);
 return context;
};
