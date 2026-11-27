"""Use GDevelop's native preview export, starting INSIDE rooms with no entry history."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import threading,http.server,json,os
ROOT=Path(__file__).resolve().parents[1]
ARTIFACTS=ROOT/'artifacts/gdevelop';ARTIFACTS.mkdir(parents=True,exist_ok=True)
EXPORT=Path(os.environ.get('GDEVELOP_PREVIEW_DIR','')).resolve()
if not os.environ.get('GDEVELOP_PREVIEW_DIR') or not (EXPORT/'index.html').exists():raise SystemExit('Define GDEVELOP_PREVIEW_DIR con la carpeta de una vista previa nativa exportada de GDevelop.')
cases=[('plato__entrada','Item_entrada_planeta',False),('salida','Portal',False),('arena','Portal',True),('plato__salida','VolverSuperficiePrueba',False)]
selected=os.environ.get('GDEVELOP_PREVIEW_SCENE','plato__entrada')
cases=[case for case in cases if case[0]==selected]
if not cases:raise SystemExit('Escena de prueba desconocida: '+selected)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(EXPORT),**kw)
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet);threading.Thread(target=server.serve_forever,daemon=True).start();results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 for scene,portal,touch in cases:
  ctx=browser.new_context(viewport={'width':932 if touch else 1280,'height':430 if touch else 720},has_touch=touch);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/',timeout=60000)
  def ev(e):return page.evaluate('()=>{const d=window.__sofiaKit;return '+e+'}')
  def wait(e):page.wait_for_function('()=>{const d=window.__sofiaKit;return d&&('+e+')}',timeout=30000)
  def room(s):wait('d.scene==='+json.dumps(s)+'&&d.ready');page.wait_for_timeout(150)
  def click(x,y):
   box=page.locator('canvas').bounding_box();x=box['x']+x*box['width']/1280;y=box['y']+y*box['height']/720
   (page.touchscreen.tap if touch else page.mouse.click)(x,y);page.wait_for_timeout(100)
  def obj(name):
   xy=ev('(()=>{const o=d.actors.find(o=>o.getName()==='+json.dumps(name)+');return [o.getDrawableX()+o.getWidth()/2,o.getDrawableY()+o.getHeight()/2]})()');click(*xy)
  room(scene);assert ev('(d.state.doors||[]).length')==0
  assert ev('d.hero.getRuntimeScene().getGame().isPreview()')
  for _ in range(12):
   if not ev('d.dialogue'):break
   page.keyboard.press('Enter');page.wait_for_timeout(100)
  if scene=='plato__salida':
   assert not ev('!!d.state.flags.aventura_platon_completada');obj('Item_salida_planeta');page.wait_for_timeout(300);assert ev('d.scene')==scene
  obj(portal);room('plato');assert ev('!!d.universe');assert ev('d.actors.find(o=>o.getName()==="Mapa_ship")!==undefined')
  if scene in ['plato__entrada','arena']:
   obj('Mapa_ship');wait('d.hero.isHidden()');click(450,190);room('earth');wait('!d.universe.busy()')
   obj('Mapa_ship');wait('d.hero.isHidden()');click(450,238);room('plato');wait('!d.universe.busy()')
  assert not errors,errors
  result={'start':scene,'native_preview':True,'empty_entry_history':True,'surface_return':True,'flight_both_directions':scene in ['plato__entrada','arena'],'emulated_touch':touch,'errors':errors};results.append(result);print('PASS',result,flush=True);ctx.close()
 browser.close()
server.shutdown();(ARTIFACTS/'preview-returns-validation.json').write_text(json.dumps(results,indent=2))
