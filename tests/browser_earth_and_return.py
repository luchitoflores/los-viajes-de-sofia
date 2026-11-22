from playwright.sync_api import sync_playwright
from pathlib import Path
import json,math
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')";F="window.__sofiaGame.scene.getScene('Spaceflight')";U='sofia-universe-progress-v1-story';report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1440,'height':960},has_touch=True);p=c.new_page();p.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)))
 def tap(selector,touch=False):
  l=p.locator(selector);l.scroll_into_view_if_needed();a=l.bounding_box();(p.touchscreen.tap if touch else p.mouse.click)(a['x']+a['width']/2,a['y']+a['height']/2)
 def ready(id):p.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.sys.isActive()&&"+P+".currentContext?.id==='"+id+"'&&!document.body.classList.contains('ship-cinematic')",timeout=120000)
 def coords(scene,id):
  return p.evaluate("()=>{const s="+scene+",v="+("s.hotspots.get('"+id+"')" if scene==P else "s.propViews.find(v=>v.id==='"+id+"'&&v.obj.type==='Zone').obj")+",c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),a=v.getCenter(),t=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}}")
 def item(scene,id,touch=False):
  p.wait_for_timeout(250);a=coords(scene,id)
  if scene==P and (not(a['left']+10<a['x']<a['right']-10 and a['top']+10<a['y']<a['bottom']-10) or not p.evaluate("a=>document.elementFromPoint(a.x,a.y)?.tagName==='CANVAS'",a)):
   tap('#planet-view',touch);p.wait_for_timeout(1300);a=coords(scene,id)
  (p.touchscreen.tap if touch else p.mouse.click)(a['x'],a['y'])
 def finish():
  for _ in range(80):
   if not p.locator('#veil.visible').count():return
   choices=p.locator('#panel button:not([hidden]):visible')
   if choices.count():choices.first.click()
   else:p.keyboard.press('Enter')
  raise AssertionError('Dialogue loop')
 def board(touch=False):
  item(P,'ship',touch)
  try:p.wait_for_selector('[data-planet="earth"]',timeout=25000)
  except Exception:
   p.screenshot(path='captures/earth-board-failure.png');print(p.evaluate("()=>({angle:"+P+".bodyState.angle,toast:document.getElementById('toast').textContent,body:document.body.className})"),flush=True);raise
  assert p.locator('[data-planet="earth"]').is_enabled()
 def fly(id,source,touch=False):
  tap('[data-planet="'+id+'"]',touch);p.wait_for_function(F+".sys.isActive()&&"+F+".phase==='cruise'",timeout=30000);assert p.evaluate(F+'.flightData.source')==source
  p.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000);print(p.evaluate("()=>({id:"+P+".currentContext?.id,active:"+P+".sys.isActive(),toast:document.getElementById('toast').textContent,scenes:window.__sofiaGame.scene.getScenes(true).map(s=>s.sys.settings.key)})"),flush=True);assert p.evaluate(P+'.currentContext.id')==id;ready(id);assert not p.locator('#veil.visible').count();assert p.evaluate(P+".objects.filter(o=>o.kind==='ship').length") ==1;assert p.evaluate(P+'.player.alpha')==1
 p.goto('http://127.0.0.1:4173/#/jugar');p.wait_for_selector('[data-menu="story"]',timeout=120000);tap('[data-menu="story"]');p.wait_for_selector('[data-menu="new"]',timeout=120000);tap('[data-menu="new"]');p.locator('#save-name').fill('Desde la Tierra');p.locator('#save-name-form button[type="submit"]').click();ready('earth');assert not p.locator('#veil.visible').count();assert p.locator('#game-canvas').evaluate("e=>getComputedStyle(e).visibility")=='visible';assert p.evaluate(P+'.objects.filter(o=>o.kind==="philosopher").length')==0
 tap('#planet-view');p.wait_for_timeout(1500);p.screenshot(path='captures/tierra-planeta-jugable.png');a=p.evaluate(P+'.bodyState.angle');p.keyboard.down('ArrowRight');p.wait_for_function(P+f'.bodyState.angle>{a}+Math.PI*2',timeout=30000);p.keyboard.up('ArrowRight');assert abs(p.evaluate(P+'.bodyState.height'))<1;report['new_story_starts_on_real_earth_and_walks_360']=True;print('Earth start and 360 passed',flush=True)
 board();assert p.locator('[data-planet="plato"]').is_enabled();assert p.locator('[data-planet="kant"]').is_disabled();p.screenshot(path='captures/tierra-mapa-antes-del-primer-viaje.png');fly('plato','planet-earth-v1.png');assert not p.evaluate("JSON.parse(localStorage.getItem('"+U+"')).worlds.plato.introComplete");board();assert p.locator('[data-planet="kant"]').is_disabled();fly('earth','planet-plato-stone.png');report['same_ship_returns_to_earth_before_intro_or_missions_without_unlocking_kant']=True;print('Unfinished Plato round trip passed',flush=True)
 old=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'));del old['interiors']['agora'];del old['assets']['agora-bg']
 for id in ['entrar-agora','agora-regresar','agora-conversar','agora-leer']:del old['interactions'][id]
 temple=next(o for o in old['surface']['objects'] if o['id']=='temple');temple['behavior']='observar-polis';temple['interaction']='none';next(o for o in old['surface']['objects'] if o['id']=='olive-east')['label']='Olivo del autor'
 p.evaluate("w=>new Promise(resolve=>{const r=indexedDB.open('sofia-world-editor');r.onsuccess=()=>{const db=r.result,t=db.transaction('worlds','readwrite');t.objectStore('worlds').put(w);t.oncomplete=()=>{db.close();resolve()}}})",old)
 board();fly('plato','planet-earth-v1.png');tap('[data-conversation="philosopher"]');p.wait_for_selector('#dialogue-text');finish();assert not p.evaluate("JSON.parse(localStorage.getItem('"+U+"')).worlds.plato.flags.includes('aventura_platon_completada')");assert p.evaluate(P+".objects.find(o=>o.id==='olive-east').label")=='Olivo del autor'
 item(P,'temple');p.wait_for_function(W+".sys.isActive()&&"+W+".dataDef.name.startsWith('Ágora')",timeout=25000);p.wait_for_timeout(700);p.screenshot(path='captures/platon-templo-agora-accesible.png');heights=p.evaluate("()=>{const s="+W+",npc=s.propViews.find(v=>v.id==='agora-platon'&&v.obj.type==='Image').obj;return[s.player.scaleY*241,npc.displayHeight]}");assert abs(heights[0]-heights[1])<2
 item(W,'agora-papiros');p.wait_for_selector('#dialogue-text');finish();tap('[data-conversation="agora-platon"]');p.wait_for_selector('#dialogue-text');finish();item(W,'agora-entrada');ready('plato');angle=p.evaluate(P+'.bodyState.angle');assert abs(math.atan2(math.sin(angle-math.radians(35)),math.cos(angle-math.radians(35))))<.25;report['old_draft_gains_temple_with_npc_hotspots_and_surface_return']=True;print('Agora and return anchor passed',flush=True)
 p.set_viewport_size({'width':932,'height':430});p.wait_for_timeout(400);board(True);assert p.locator('[data-planet="kant"]').is_disabled();fly('earth','planet-plato-stone.png',True);p.screenshot(path='captures/tierra-regreso-movil.png');assert not p.evaluate("JSON.parse(localStorage.getItem('"+U+"')).worlds.plato.flags.includes('aventura_platon_completada')");report['emulated_touch_returns_home_and_keeps_unfinished_plato_progress']=True
 tap('#pause',True);tap('[data-action="change-mode"]',True);tap('[data-menu="free"]',True);p.wait_for_selector('[data-menu="new"]',timeout=120000);tap('[data-menu="new"]',True);p.locator('#save-name').fill('Tierra en Libre');p.locator('#save-name-form button[type="submit"]').click();ready('earth');assert not p.locator('#veil.visible').count();report['new_free_game_also_starts_on_earth']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/earth-return-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
