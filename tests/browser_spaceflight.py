from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
OUT=Path('captures');OUT.mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')"
F="window.__sofiaGame.scene.getScene('Spaceflight')"
report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=b.new_context(viewport={'width':1440,'height':960},has_touch=True)
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded')
 page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000)
 page.locator('[data-action="continue-mode"]').click()
 def finish():
  for _ in range(15):
   if not page.locator('#veil.visible').count():return
   for selector in ['[data-run="choice-0"]','[data-run="continue"]','[data-run="leave"]']:
    if page.locator(selector).count():page.locator(selector).click();break
   else:raise AssertionError(page.locator('#panel').inner_text())
  raise AssertionError('El diálogo no termina')
 def meet():
  page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='philosopher');s.cancelWalk();s.bodyState.angle=(o.angleDeg-8)*Math.PI/180}}")
  page.wait_for_timeout(500);page.keyboard.press('e');page.wait_for_selector('[data-run="choice-0"]');finish()
 meet()
 def embark(touch=False):
  # Colocar la cámara cerca del puerto; aproximación final e interacción mediante clic real.
  page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship'&&o.interaction==='ship');s.cancelWalk();s.bodyState.angle=(o.angleDeg+17)*Math.PI/180}}")
  page.wait_for_timeout(900)
  point=page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship'&&o.interaction==='ship'),v=s.hotspots.get(o.id).getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(v.x-c.scrollX,v.y-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
  (page.touchscreen.tap if touch else page.mouse.click)(point['x'],point['y'])
  page.wait_for_function("document.body.classList.contains('ship-boarding')",timeout=15000)
  scale=page.evaluate(P+'.player.scaleY')
  page.keyboard.down('ArrowRight');page.wait_for_timeout(200);page.keyboard.up('ArrowRight')
  assert abs(page.evaluate(P+'.player.scaleY')-scale)<.0001
  page.wait_for_selector('[data-run="resume"]',timeout=15000)
  assert page.locator('[data-run="resume"]').inner_text()=='Bajar de la nave'
  assert page.evaluate(P+'.player.alpha')==0
  assert page.evaluate(P+".children.list.some(o=>o.texture?.key==='ship-sofia-pilot')")
 embark();position=page.evaluate(P+'.bodyState.angle');page.locator('[data-run="resume"]').click()
 page.wait_for_function("!document.body.classList.contains('ship-cinematic')")
 assert page.evaluate(P+'.player.alpha')==1
 assert abs(page.evaluate(P+'.bodyState.angle')-position)<.001
 report['board_and_cancel_without_changing_world']=True
 page.evaluate("()=>{window.__landings=[];const sample=()=>{const s=window.__sofiaGame.scene.getScene('Planet');if(document.body.classList.contains('ship-arriving')&&s?.views&&Array.from(s.views.values()).some(v=>v.getData('flightPhase')==='landing'))window.__landings.push({world:s.currentContext?.id??'plato',ships:s.objects.filter(o=>o.kind==='ship'&&s.views.get(o.id)?.visible).length,pilots:s.children.list.filter(o=>o.texture?.key==='ship-sofia-pilot'&&o.active).length,hero:s.player.alpha});requestAnimationFrame(sample)};sample()}")
 for index,destination in enumerate(['camus','hegel','kant','heidegger','sartre','plato']):
  embark(touch=index%2==0)
  page.locator(f'[data-planet="{destination}"]').click()
  page.wait_for_function(P+".views&&Array.from("+P+".views.values()).some(v=>v.getData('flightPhase')==='launch')",timeout=15000)
  page.wait_for_function(F+"?.sys.isActive()&&"+F+".phase==='cruise'",timeout=15000)
  if index==0:page.screenshot(path=str(OUT/'sofia-vuelo-entre-mundos.png'))
  # La exploración anterior y las teclas no deben alterar la trayectoria cinematográfica.
  page.keyboard.down('ArrowRight');page.wait_for_timeout(180);page.keyboard.up('ArrowRight')
  page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
  samples=page.evaluate(f"window.__landings.filter(s=>s.world==='{destination}')")
  assert samples and all(s['ships']==1 and s['pilots']==1 and s['hero']==0 for s in samples),samples
  page.wait_for_function(P+'.sys.isActive()&&'+P+'.player.alpha===1')
  assert not page.evaluate(F+'.sys.isActive()')
  if destination!='plato':assert page.evaluate(P+'.currentContext.id')==destination
  else:assert page.evaluate(P+'.currentContext') is None
  assert abs(page.evaluate(P+'.bodyState.height'))<.01
  assert abs(page.evaluate(P+'.player.scaleY')-118/241)<.0001
  assert page.evaluate(P+".objects.some(o=>o.kind==='ship'&&o.interaction==='ship')")
  assert not page.locator('#veil.visible').count()
  meet()
  if index==0:page.screenshot(path=str(OUT/'sofia-aterrizaje-camus.png'))
  report[destination]={'boarding':True,'flight':True,'landing':True,'touch_emulated':index%2==0,'single_ship_launch_and_landing':True}
  print(destination+' vuelo y aterrizaje comprobados',flush=True)
 page.reload(wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=60000)
 saved=page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1'))")
 assert all(saved['worlds'][id]['introComplete'] for id in ['camus','hegel','kant','heidegger','sartre','plato'])
 report['progress_preserved_after_six_flights_and_reload']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False
 (OUT/'spaceflight-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
 b.close()
