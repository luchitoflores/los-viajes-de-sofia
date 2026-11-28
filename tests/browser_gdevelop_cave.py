"""Native GDevelop parallax/rescue regression. Rewards are reached through real controls.
Export plantilla-plataformas.json with the cave as starting scene, then set GDEVELOP_EXPORT_DIR.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json,http.server,threading
ROOT=Path(__file__).resolve().parents[1];EXPORT=Path(os.environ.get('GDEVELOP_EXPORT_DIR',ROOT.parent/'engine-comparison/build-painted-cave'));CAP=ROOT/'artifacts/gdevelop-cave';CAP.mkdir(parents=True,exist_ok=True)
if not (EXPORT/'index.html').exists():raise SystemExit('Define GDEVELOP_EXPORT_DIR con la exportación nativa de Laboratorio_Mundo_Sombras.')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(EXPORT),**kw)
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet);threading.Thread(target=server.serve_forever,daemon=True).start();results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 for touch in [False,True]:
  ctx=browser.new_context(viewport={'width':932 if touch else 1280,'height':430 if touch else 720},has_touch=touch);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def ev(e):return page.evaluate('()=>{const s=window.__nativeScene,h=s.getObjects("Sofia")[0];return '+e+'}')
  def wait(e,timeout=12000):page.wait_for_function('()=>{const s=window.__nativeScene;if(!s)return false;const h=s.getObjects("Sofia")[0];return '+e+'}',timeout=timeout)
  def pointer(obj):
   x,y=ev('(()=>{const o=s.getObjects('+json.dumps(obj)+')[0],ui=o.getLayer()==="UI",layer=s.getLayer(o.getLayer());return [o.getDrawableX()+o.getWidth()/2-layer.getCameraX()+640,o.getDrawableY()+o.getHeight()/2-layer.getCameraY()+360]})()');box=page.locator('canvas').bounding_box();return box['x']+x*box['width']/1280,box['y']+y*box['height']/720
  def tap(obj):
   x,y=pointer(obj)
   if touch:
    cdp=ctx.new_cdp_session(page);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});page.wait_for_timeout(90);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});cdp.detach()
   else:page.mouse.click(x,y)
   page.wait_for_timeout(130)
  try:
   page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('!!window.gdjs && typeof gdjs.registerRuntimeScenePostEventsCallback==="function"');page.evaluate('()=>{gdjs.registerRuntimeScenePostEventsCallback(function(s){window.__nativeScene=s})}');wait('h&&h.getBehavior("PlatformerObject").isOnFloor()');page.screenshot(path=str(CAP/('inicio-touch.png' if touch else 'inicio.png')))
   assert ev('s.getName()')=='Laboratorio_Mundo_Sombras'
   # The lever is above the floor: clicking it from below must not remotely release a prisoner.
   tap('MecanismoRescate');assert ev('s.getObjects("MecanismoRescate")[0].getVariables().get("Activado").getAsNumber()')==0
   page.keyboard.down('d');wait('h.getX()>265');
   if touch:tap('Saltar')
   else:page.keyboard.down('Space')
   wait('h.getX()>465');page.keyboard.up('d');page.keyboard.up('Space');wait('h.getBehavior("PlatformerObject").isOnFloor()');print('PASS wall jump',touch,ev('[h.getX(),h.getY()]'),flush=True)
   # A second real jump reaches the elevated mechanism; no teleport/forced activation.
   page.keyboard.down('d')
   if touch:tap('Saltar')
   else:page.keyboard.down('Space')
   wait('h.getX()>625');page.keyboard.up('d');page.keyboard.up('Space');wait('h.getBehavior("PlatformerObject").isOnFloor()&&h.getY()<450');assert ev('s.getObjects("MecanismoRescate")[0].getVariables().get("Activado").getAsNumber()')==0
   # Native layer cameras actually have different movement factors.
   cameras=ev('[s.getLayer("FondoLejano").getCameraX(),s.getLayer("FondoMedio").getCameraX(),s.getLayer("").getCameraX(),s.getLayer("PrimerPlano").getCameraX()]');assert cameras[0]<cameras[1]<cameras[2]<cameras[3],cameras
   if touch:tap('MecanismoRescate')
   else:page.keyboard.press('e')
   wait('s.getObjects("MecanismoRescate")[0].getVariables().get("Activado").getAsNumber()===1');wait('s.getObjects("PrisioneroRescate")[0].getAnimation()===1&&s.getObjects("CadenaPrisionero")[0].isHidden()');assert ev('s.getVariables().get("RescatesEnEscena").getAsNumber()')==1
   page.screenshot(path=str(CAP/('rescate-touch.png' if touch else 'rescate.png')))
   page.wait_for_timeout(4800);assert ev('s.getObjects("AvisoRescate")[0].isHidden()')
   # Same native object types, new instance keys: equivalent to duplicating the trio in the editor.
   page.evaluate('()=>{const s=window.__nativeScene;for(const name of ["MecanismoRescate","PrisioneroRescate","CadenaPrisionero"]){const old=s.getObjects(name)[0],o=s.createObject(name);o.setWidth(old.getWidth());o.setHeight(old.getHeight());o.getVariables().get("Clave").setString("celda-duplicada");o.setPosition(name==="MecanismoRescate"?590:480,name==="MecanismoRescate"?420:name==="PrisioneroRescate"?560:505)}}')
   wait('s.getObjects("PrisioneroRescate").length===2');assert ev('s.getObjects("PrisioneroRescate")[1].getAnimation()')==0
   if touch:tap('Accion')
   else:page.keyboard.press('Enter')
   wait('s.getObjects("PrisioneroRescate")[1].getAnimation()===1');assert ev('s.getObjects("CadenaPrisionero")[1].isHidden()');assert ev('s.getVariables().get("RescatesEnEscena").getAsNumber()')==2
   # Return/re-enter with native UI; the released state survives scene changes in this session.
   tap('VolverLab');wait('s.getName()==="Plantilla_Planeta_Circular"');tap('LabSombras');wait('s.getName()==="Laboratorio_Mundo_Sombras"');wait('s.getObjects("PrisioneroRescate")[0].getAnimation()===1')
   assert not errors,errors[:3];results.append({'touch_emulated':touch,'physical_phone':False,'real_two_jumps':True,'independent_parallax_cameras':cameras,'nearby_activation_only':True,'prisoner_released':True,'chains_hidden':True,'notice_expires':True,'duplicated_cell_keys_independent':True,'enter_or_touch_action':True,'release_survives_scene_change':True,'errors':errors});print('PASS cave',results[-1],flush=True)
  except Exception:
   print('STATE',ev('({scene:s.getName(),hero:[h?.getX(),h?.getY()],errors:'+json.dumps(errors[:3])+'})'),flush=True);page.screenshot(path=str(CAP/'failure.png'));raise
  finally:ctx.close()
 browser.close()
server.shutdown();(CAP/'validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
