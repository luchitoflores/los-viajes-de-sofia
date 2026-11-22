from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,math,time
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173');OUT=Path('captures');OUT.mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')";KEY='sofia-universe-progress-v1';report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True);page=ctx.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',e,flush=True)))
 def ready(scene):page.wait_for_function(f"window.__sofiaGame?.scene.getScene('{scene}')?.sys.isActive()&&window.__sofiaGame.scene.getScene('{scene}').player?.active",timeout=120000)
 def progress(id):return page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds['{id}']")
 def finish():
  for _ in range(12):
   if not page.locator('#veil.visible').count():return
   if page.locator('[data-run="choice-0"]').count():page.locator('[data-run="choice-0"]').click()
   elif page.locator('[data-run="continue"]').count():page.locator('[data-run="continue"]').click()
   elif page.locator('[data-run="leave"]').count():page.locator('[data-run="leave"]').click()
   else:raise AssertionError(page.locator('#panel').inner_text())
  raise AssertionError('Dialogue did not close')
 def load(id):
  page.locator('[data-tab="galaxy"]').click();page.locator(f'[data-planet="{id}"]').click();ready('Planet');page.wait_for_function(f"{P}.currentContext?.id==='{id}' && {P}.objects==={P}.currentContext.state.objects",timeout=60000)
 def pos(scene,x,y):return page.evaluate(f"()=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 def tap(scene,x,y,touch=False):
  p=pos(scene,x,y);assert 0<p['x']<1440 and 0<p['y']<960,p;(page.touchscreen.tap if touch else page.mouse.click)(p['x'],p['y'])
 def radial(id):
  angle=page.evaluate(f"{P}.objects.find(o=>o.id==='{id}').angleDeg");page.evaluate(f"()=>{{const s={P};s.cancelWalk();s.bodyState.angle=({angle}-20)*Math.PI/180}} ");page.wait_for_timeout(800);p=page.evaluate(f"{P}.hotspots.get('{id}').getCenter()");tap(P,p['x'],p['y'])
 def item(id,touch=False):
  p=page.evaluate(f"{W}.propViews.find(v=>v.id==='{id}'&&v.obj.type==='Zone').obj.getCenter()");tap(W,p['x'],p['y'],touch)
 def return_surface(world):
  while page.evaluate(f"{W}.sys.isActive()"):
   page.locator('#planet-exit').click();page.wait_for_timeout(500)
  ready('Planet');assert page.evaluate(f"{P}.currentContext.id") == world
 page.goto(URL,wait_until='domcontentloaded');ready('Planet');page.locator('[data-action="start"]').click();assert page.locator('.character-tag',has_text='Platón').count();finish();report['plato_first_meeting_preserved_story']=True
 page.locator('[data-tab="galaxy"]').click();assert page.locator('[data-planet]').count()==6;page.screenshot(path=str(OUT/'seis-planetas-genericos.png'));page.locator('[data-run="resume"]').click()
 for world in ['camus','hegel','kant','heidegger']:
  load(world);page.wait_for_selector('[data-run="choice-0"]');angle=page.evaluate(P+'.bodyState.angle');page.keyboard.down('ArrowRight');page.wait_for_timeout(400);page.keyboard.up('ArrowRight');assert abs(page.evaluate(P+'.bodyState.angle')-angle)<.001;finish();assert progress(world)['introComplete']
  start=page.evaluate(P+'.bodyState.angle');page.keyboard.down('ArrowRight');page.wait_for_function(f"{P}.bodyState.angle>{start}+2*Math.PI",timeout=60000);page.keyboard.up('ArrowRight');page.wait_for_timeout(150);assert abs(page.evaluate(P+'.bodyState.height'))<.01
  reverse=page.evaluate(P+'.bodyState.angle');page.keyboard.down('ArrowLeft');page.wait_for_timeout(600);page.keyboard.up('ArrowLeft');assert page.evaluate(P+'.bodyState.angle')<reverse
  door={'camus':'door-mountain','hegel':'door-transformation','kant':'door-study','heidegger':'door-path'}[world];radial(door);ready('World');page.wait_for_timeout(500);assert page.evaluate(W+'.scale.height')==720;assert page.evaluate(W+'.scale.width')==1280;assert abs(page.evaluate(W+'.player.y')-560)<.01;assert abs(page.evaluate(W+'.player.scaleY*241/720')-118/540)<.001
  assert page.evaluate(W+".children.list.filter(o=>o.type==='Image'&&o.depth===-60).length")==1
  anchor=progress(world)['planet']['returnAnchor']['angle']
  if world=='camus':item('mountain-sisyphus');page.wait_for_selector('[data-run="choice-0"]');assert 'repetición' in page.locator('#dialogue-text').get_attribute('aria-label');finish();assert 'sisyphus-reflected' in progress(world)['flags'];page.screenshot(path=str(OUT/'camus-sisifo-plantilla.png'))
  if world=='hegel':
   item('transformation-marco');page.wait_for_selector('[data-run="choice-0"]');finish();item('transformation-ana');page.wait_for_selector('[data-run="choice-0"]',timeout=20000);assert page.evaluate(W+'.player.y')<330;assert abs(page.evaluate(W+'.player.y-'+W+'.groundAt('+W+'.player.x)'))<.01;finish();page.screenshot(path=str(OUT/'hegel-dos-niveles.png'))
   # Walk back down the same stairs through real input.
   page.keyboard.down('ArrowLeft');page.wait_for_function(W+'.player.x<280',timeout=15000);page.keyboard.up('ArrowLeft');page.wait_for_timeout(100);assert abs(page.evaluate(W+'.player.y')-560)<.01
  if world=='kant':
   item('study-elena');page.wait_for_selector('[data-run="choice-0"]');finish();item('study-notes',True);page.wait_for_selector('[data-run="continue"]');finish();item('door-morality-room');page.wait_for_function(W+".dataDef.name==='Sala de las máximas'&&"+W+".player?.active",timeout=15000);page.wait_for_timeout(400);item('morality-room-kant');page.wait_for_selector('[data-run="choice-0"]');finish();assert 'kant-duty' in progress(world)['flags'];page.screenshot(path=str(OUT/'kant-sala-maximas.png'));page.locator('#planet-exit').click();page.wait_for_function(W+".dataDef.name==='Estudio'&&"+W+".player?.active",timeout=15000);page.wait_for_timeout(400);assert page.evaluate(W+'.player.x')>1000
  if world=='heidegger':
   item('path-clara');page.wait_for_selector('[data-run="choice-0"]');finish();item('door-time-room');page.wait_for_function(W+".dataDef.name==='Habitación del tiempo'&&"+W+".player?.active",timeout=15000);page.wait_for_timeout(400);item('time-room-clara');page.wait_for_selector('[data-run="choice-0"]');finish();assert 'heidegger-time' in progress(world)['flags'];assert len(page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).characterMemory.clara"))==2;page.screenshot(path=str(OUT/'heidegger-temporalidad.png'));page.locator('#planet-exit').click();page.wait_for_function(W+".dataDef.name==='Sendero'&&"+W+".player?.active",timeout=15000);page.wait_for_timeout(400)
  return_surface(world);assert abs(page.evaluate(P+'.bodyState.angle')-anchor)<.03;report[world]={'first_meeting':True,'walk_360_and_reverse':True,'floor_560':True,'npc_dialogue':True,'return_anchor':True};print(world+' validado',flush=True)
 # A real portal must enter the preserved Sartre, with its original introductory branches.
 load('camus');radial('portal-sartre');ready('Planet');page.wait_for_function(P+".currentContext?.id==='sartre'&&"+P+'.objects==='+P+'.currentContext.state.objects',timeout=60000);page.wait_for_selector('[data-run="choice-0"]')
 for _ in range(10):
  if not page.locator('#veil.visible').count():break
  if _==0 and page.locator('[data-run="choice-1"]').count():page.locator('[data-run="choice-1"]').click()
  elif page.locator('[data-run="choice-0"]').count():page.locator('[data-run="choice-0"]').click()
  elif page.locator('[data-run="continue"]').count():page.locator('[data-run="continue"]').click()
 assert progress('sartre')['introComplete'];assert page.evaluate(P+'.objects.some(o=>o.id==="sartre-cafe-door")');origin=progress('camus')['planet']['angle'];page.reload(wait_until='domcontentloaded');ready('Planet');page.wait_for_selector('#planet-exit:not([hidden])');page.locator('#planet-exit').click();page.wait_for_function(P+".currentContext?.id==='camus'&&"+P+'.objects==='+P+'.currentContext.state.objects',timeout=60000);assert abs(page.evaluate(P+'.bodyState.angle')-origin)<.03;report['portal_to_preserved_sartre_and_back_after_reload']=True
 assert not errors,errors;report['browser_errors']=errors;(OUT/'templates-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
