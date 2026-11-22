from playwright.sync_api import sync_playwright
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
import json

PREFIX='/los-viajes-de-sofia/'
class Pages(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(Path('dist').resolve()),**kwargs)
 def do_GET(self):
  if not self.path.startswith(PREFIX):self.send_error(404);return
  self.path=self.path[len(PREFIX)-1:];super().do_GET()
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',4185),Pages);Thread(target=server.serve_forever,daemon=True).start()
P="window.__sofiaGame.scene.getScene('Planet')"
KEY='sofia-universe-progress-v1-story';report={};errors=[];failed=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':960},has_touch=True);p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
 def start(page):
  page.goto('http://127.0.0.1:4185'+PREFIX+'#/jugar');page.wait_for_selector('[data-menu="story"]',timeout=120000);page.locator('[data-menu="story"]').click();page.wait_for_selector('[data-menu="new"]',timeout=120000);page.locator('[data-menu="new"]').click();page.locator('#save-name').fill('Primera mirada');page.locator('#save-name-form button[type="submit"]').click()
 start(p);p.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000);p.wait_for_function(P+".introduction!==null&&"+P+".cameras.main.zoom<0.5",timeout=120000);angle=p.evaluate(P+'.bodyState.angle');p.screenshot(path='captures/tierra-introduccion-lejana.png');p.keyboard.down('ArrowRight');p.wait_for_timeout(250);p.keyboard.up('ArrowRight');assert p.evaluate(P+'.bodyState.angle')==angle
 p.wait_for_selector('#planet-view-tutorial',timeout=12000);assert p.evaluate(P+'.cameras.main.zoom')>.99;assert not p.locator('#veil.visible').count();assert 'camera-introduction-seen' in p.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')).worlds.earth.flags");p.screenshot(path='captures/tierra-introduccion-cercana-tooltip.png');report['overview_then_closeup_with_paused_walk_and_persistent_mark']=True
 target=p.locator('#planet-view').bounding_box();p.touchscreen.tap(target['x']+target['width']/2,target['y']+target['height']/2);p.wait_for_timeout(200);assert p.evaluate(P+'.overview');assert not p.locator('#planet-view-tutorial').count();report['real_touch_changes_view_and_dismisses_hint']=True
 p.reload();p.wait_for_selector('[data-menu="continue"]',timeout=120000);p.locator('[data-menu="continue"]').click();p.wait_for_function(P+".sys.isActive()&&!document.querySelector('#veil.visible')",timeout=120000);assert p.evaluate(P+'.introduction') is None;assert not p.locator('#planet-view-tutorial').count();report['continue_does_not_repeat_presentation']=True
 p.locator('[data-tab="galaxy"]').click();p.wait_for_selector('.world-lock');p.wait_for_timeout(350);p.screenshot(path='captures/pages-mapa-con-recursos-relativos.png');assert not failed,failed;report['production_build_runs_below_repository_path_including_map_and_css_assets']=True
 c.close();c=b.new_context(viewport={'width':932,'height':430},has_touch=True,reduced_motion='reduce');p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));start(p);p.wait_for_selector('#planet-view-tutorial',timeout=120000);assert p.evaluate(P+'.introduction') is None;assert p.evaluate(P+'.cameras.main.zoom')>.99;report['reduced_motion_skips_camera_animation']=True
 c.close();c=b.new_context(viewport={'width':1440,'height':960});p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.goto('http://127.0.0.1:4185'+PREFIX+'#/edicion?world=earth');p.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000);p.wait_for_function(P+".currentContext?.id==='earth'&&"+P+".sys.isActive()",timeout=120000);p.wait_for_timeout(500);assert p.evaluate(P+'.introduction') is None;assert not p.locator('#planet-view-tutorial').count();assert not p.evaluate("localStorage.getItem('"+KEY+"')");report['editor_never_runs_tutorial_or_writes_game_progress']=True
 assert not errors,errors;report['browser_errors']=errors;report['failed_http_assets']=failed;report['physical_phone_tested']=False;Path('captures/planet-introduction-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
server.shutdown()
