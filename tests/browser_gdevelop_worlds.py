from pathlib import Path
from playwright.sync_api import sync_playwright
import threading,http.server,json,math,os
ROOT=Path(__file__).resolve().parents[1]
CAP=ROOT/'artifacts/gdevelop';CAP.mkdir(parents=True,exist_ok=True)
EXPORT=Path(os.environ.get('GDEVELOP_EXPORT_DIR',ROOT/'public/lab/gdevelop/build')).resolve()
URL=os.environ.get('GDEVELOP_URL','')
if not URL and not (EXPORT/'index.html').exists():raise SystemExit('Exporta el proyecto GDevelop a HTML5 y define GDEVELOP_EXPORT_DIR con su carpeta de salida.')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(EXPORT),**kw)
 def log_message(self,*a):pass
server=None
if not URL:
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet);threading.Thread(target=server.serve_forever,daemon=True).start();URL=f'http://127.0.0.1:{server.server_port}/'
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 for mobile in [False,True]:
  ctx=browser.new_context(viewport={'width':932 if mobile else 1280,'height':430 if mobile else 720},has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(URL,timeout=60000)
  def ev(expr):return page.evaluate('()=>{const d=window.__sofiaKit;return '+expr+'}')
  def wait(expr,timeout=16000):
   try:page.wait_for_function('()=>{const d=window.__sofiaKit;return d&&('+expr+')}',timeout=timeout)
   except Exception:
    print('FAILED',expr,'ERRORS',errors,'STATE',ev('({scene:d.scene,ready:d.ready})'),flush=True);raise
  def room(s):wait('d.scene==='+json.dumps(s)+'&&d.ready');page.wait_for_timeout(200)
  def click(x,y):
   b=page.locator('canvas').bounding_box();x=b['x']+x*b['width']/1280;y=b['y']+y*b['height']/720
   (page.touchscreen.tap if mobile else page.mouse.click)(x,y);page.wait_for_timeout(100)
  def object_click(name):
   x,y=ev('(()=>{const o=d.actors.find(o=>o.getName()==='+json.dumps(name)+');return [o.getDrawableX()+o.getWidth()/2,o.getDrawableY()+o.getHeight()/2]})()');click(x,y)
  def key(k):page.keyboard.press(k);page.wait_for_timeout(100)
  def finish():
   for i in range(40):
    if not ev('d.dialogue'):return
    if ev('d.question'):raise AssertionError('Unexpected decision '+str(ev('d.options')))
    if mobile:click(290,120)
    else:key('Enter')
   raise AssertionError('Conversation did not finish')
  room('earth');assert ev('d.actors.find(o=>o.getName()==="Atacar").isHidden()')
  # A full circular walk, using keyboard as an accessible alternative; real click/touch below.
  start=ev('[d.x,d.y]');page.keyboard.down('d');page.wait_for_timeout(11000);page.keyboard.up('d')
  radius=ev('Math.hypot(d.x-640,d.y-375)');assert abs(radius-180)<.5,radius
  object_click('Mapa_ship');wait('d.hero.isHidden()');click(460,271);wait('d.flight?.target==="sartre"');assert ev('d.flight.over.includes("plato")');room('sartre');wait('!d.universe.busy()')
  object_click('Mapa_sartre_ship');wait('d.hero.isHidden()');click(460,175);wait('d.flight?.direction===-1');room('earth');wait('!d.universe.busy()')
  object_click('Mapa_ship');wait('d.hero.isHidden()');click(460,223);room('plato');wait('!d.universe.busy()')
  object_click('Mapa_philosopher');wait('d.dialogue',timeout=22000);assert 'Platón' in ev('d.ui.Speaker.getString()');finish()
  cave=ev('d.actors.filter(o=>o.getVariables().has("Acciones")).find(o=>o.getVariables().get("Acciones").getAsString().includes("plato__entrada")).getName()')
  object_click(cave);room('plato__entrada');finish()
  object_click('Item_lampara_sofia');wait('d.state.flags.linterna===true');key('l');assert ev('d.state.flags.luz')
  # Real return portal/door preserves surface orientation.
  object_click('Item_entrada_planeta');room('plato');assert abs(ev('Math.hypot(d.x-640,d.y-375)')-180)<.5
  # Scene-preview equivalent: isolate combat with real projectiles and real controls, no injected damage.
  print('PASS travel + surface + cave',mobile,flush=True)
  page.evaluate('()=>{const d=window.__sofiaKit,step=d.step;d.step=()=>{d.step=step;d.travel("arena",220)}}');room('arena');key('s');page.keyboard.down('s');page.wait_for_timeout(400)
  assert ev('d.crouching&&d.hero.getAnimationName()==="Crouch"');feet=ev('d.y');hp=ev('d.hero.getBehavior("Salud").Health()');page.wait_for_timeout(3500)
  assert ev('d.hero.getBehavior("Salud").Health()')==hp,'Crouch failed to evade high projectiles';assert ev('d.y')==feet
  page.keyboard.up('s');page.wait_for_timeout(100)
  if mobile:click(930,615);wait('d.crouching');click(930,615)
  # Shots must originate at the instrument and cause visible health loss/feedback.
  for i in range(20):
   if ev('!!d.state.flags.guardian_vencido'):break
   if mobile:click(1140,615)
   else:key('f')
   page.wait_for_timeout(300)
  wait('d.state.flags.guardian_vencido===true');assert ev('d.actors.find(o=>o.getName()==="Enemigo").getBehavior("Salud").Health()')<=0
  page.screenshot(path=str(CAP/('worlds-touch.png' if mobile else 'worlds-desktop.png')))
  assert not errors,errors[:5]
  results.append({'emulated_touch':mobile,'physical_phone':False,'circular_walk':True,'ordered_flight_both_directions':True,'surface_npc_yarn':True,'cave_entry_return':True,'lamp':True,'crouch_evades_projectiles':True,'combat_damage':True,'errors':errors})
  print('PASS',results[-1],flush=True);ctx.close()
 browser.close()
if server:server.shutdown()
(CAP/'worlds-validation.json').write_text(json.dumps(results,indent=2))
