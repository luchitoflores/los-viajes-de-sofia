from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,math
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')";F="window.__sofiaGame.scene.getScene('Spaceflight')"
KEY='sofia-universe-progress-v1';errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True);page=ctx.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)))
 def ready():page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000)
 def finish():
  for _ in range(16):
   if not page.locator('#veil.visible').count():return
   for s in ['[data-run="choice-0"]','[data-run="continue"]','[data-run="leave"]']:
    if page.locator(s).count():page.locator(s).click();break
   else:raise AssertionError(page.locator('#panel').inner_text())
  raise AssertionError('Dialogue loop')
 def screen(scene,x,y):return page.evaluate(f"()=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 def tap(scene,x,y,touch=False):
  p=screen(scene,x,y);(page.touchscreen.tap if touch else page.mouse.click)(p['x'],p['y'])
 def radial(id,touch=False):
  angle=page.evaluate(f"{P}.objects.find(o=>o.id==='{id}').angleDeg");page.evaluate(f"()=>{{const s={P};s.cancelWalk();s.bodyState.angle=({angle}-14)*Math.PI/180}}")
  page.wait_for_timeout(700);p=page.evaluate(f"{P}.hotspots.get('{id}').getCenter()");tap(P,p['x'],p['y'],touch)
 def item(id,touch=False):
  p=page.evaluate(f"{W}.propViews.find(v=>v.id==='{id}'&&v.obj.type==='Zone').obj.getCenter()");tap(W,p['x'],p['y'],touch)
 def atlas(id):
  page.locator('[data-tab="galaxy"]').click();page.locator(f'[data-planet="{id}"]').click();page.wait_for_function(P+f".currentContext?.id==='{id}'&&"+P+'.objects==='+P+'.currentContext.state.objects',timeout=60000);page.wait_for_timeout(300)
 def enter_story(id):
  page.locator(f'[data-planet="{id}"]').click();page.wait_for_function("document.body.classList.contains('ship-cinematic')");page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
 def manual_save():
  page.locator('#pause').click();page.locator('[data-action="save-game"]').click();assert 'Partida guardada' in page.locator('#toast').inner_text();page.locator('[data-action="continue"]').click()
 def switch(mode):
  page.locator('#pause').click();page.locator('[data-action="play-modes"]').click()
  with page.expect_navigation(wait_until='domcontentloaded'):page.locator(f'[data-action="mode-{mode}"]').click()
  ready();page.wait_for_function(f"localStorage.getItem('sofia-play-mode-v1')==='{mode}'");page.wait_for_timeout(400)
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded');ready();page.wait_for_selector('[data-action="mode-free"]');page.screenshot(path='captures/modos-historia-libre.png');page.locator('[data-action="mode-free"]').click()
 assert not page.locator('#veil.visible').count();radial('philosopher');page.wait_for_selector('[data-run="choice-0"]');finish()
 atlas('camus');assert not page.locator('#veil.visible').count();assert not page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.camus.introComplete")
 radial('host');page.wait_for_selector('[data-run="choice-0"]');finish()
 ship=page.evaluate(P+".objects.find(o=>o.kind==='ship').id");radial(ship,True);page.wait_for_selector('[data-run="resume"]');page.locator('[data-planet="hegel"]').click()
 page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000);assert page.evaluate(P+'.currentContext.id')=='hegel';page.wait_for_timeout(500)
 assert not page.locator('#veil.visible').count();assert not page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.hegel.introComplete")
 assert page.evaluate(f"(()=>{{const s={P},o=s.objects.find(o=>o.id==='host');return Math.abs(Math.atan2(Math.sin(s.bodyState.angle-o.angleDeg*Math.PI/180),Math.cos(s.bodyState.angle-o.angleDeg*Math.PI/180)))*500}})()")<95
 assert page.evaluate(P+".views.get('host').flipX");page.keyboard.press('e');page.wait_for_selector('[data-run="choice-0"]');assert not page.evaluate(P+'.player.flipX');finish();report['silent_landing_near_host_and_explicit_keyboard_meeting']=True
 page.evaluate(f"()=>{{const s={P};s.bodyState.angle=12*Math.PI/180;s.cancelWalk()}}")
 page.wait_for_timeout(600);p=page.evaluate(P+".hotspots.get('host').getCenter()");tap(P,p['x'],p['y']);page.wait_for_selector('[data-run="choice-0"]');page.wait_for_timeout(150)
 assert not page.evaluate(P+".views.get('host').flipX");assert page.evaluate(P+'.player.flipX');page.screenshot(path='captures/personajes-frente-a-sofia.png');finish();report['radial_conversation_faces_both_directions']=True
 page.keyboard.down('ArrowRight');page.wait_for_timeout(350);page.keyboard.up('ArrowRight');manual_save();free_angle=page.evaluate(P+'.bodyState.angle');free_worlds=page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds")
 page.reload(wait_until='domcontentloaded');ready();page.locator('[data-action="continue-mode"]').click();assert page.evaluate(P+'.currentContext.id')=='hegel';assert abs(page.evaluate(P+'.bodyState.angle')-free_angle)<.01;report['manual_save_and_continue_exact_surface_position']=True
 switch('story');page.wait_for_selector('[data-planet="plato"]');assert page.evaluate(P+'.currentContext') is None;assert page.locator('[data-planet="plato"]').is_enabled();assert page.locator('[data-planet="kant"]').is_disabled();assert page.locator('[data-planet="camus"]').is_disabled();page.screenshot(path='captures/historia-ruta-bloqueada.png');report['story_starts_at_plato_and_locks_future_worlds']=True
 # Fixture de partida anterior: la caverna y su encuentro final ya se completaron.
 page.add_init_script("if(localStorage.getItem('test-story-fixture')!=='done'){const key='sofia_phaser_real_v02-story',s=JSON.parse(localStorage.getItem(key));if(s){s.flags.caveCompleted=true;s.flags.plato=true;localStorage.setItem(key,JSON.stringify(s));localStorage.setItem('test-story-fixture','done')}}")
 page.reload(wait_until='domcontentloaded');ready();page.wait_for_selector('[data-planet="plato"]');assert page.locator('[data-planet="kant"]').is_enabled();assert page.locator('[data-planet="hegel"]').is_disabled();enter_story('kant');page.wait_for_function(P+".currentContext?.id==='kant'",timeout=60000);page.wait_for_timeout(400);assert not page.locator('#veil.visible').count()
 radial('host',True);page.wait_for_selector('[data-run="choice-0"]');finish();radial('door-study');page.wait_for_function(W+".sys.isActive()&&"+W+".dataDef.name==='Estudio'",timeout=20000);page.wait_for_timeout(400)
 item('study-elena',True);page.wait_for_selector('[data-run="choice-0"]',timeout=20000);page.wait_for_timeout(100);assert page.evaluate(W+".propViews.find(v=>v.id==='study-elena'&&v.obj.type==='Image').obj.flipX");assert not page.evaluate(W+'.player.flipX');finish()
 item('study-notes');page.wait_for_selector('[data-run="continue"]');finish();item('door-morality-room');page.wait_for_function(W+".dataDef.name==='Sala de las máximas'",timeout=20000);page.wait_for_timeout(350);item('morality-room-kant');page.wait_for_selector('[data-run="choice-0"]',timeout=20000);finish()
 assert 'kant-duty' in page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1-story')).worlds.kant.flags")
 manual_save();x=page.evaluate(W+'.player.x');page.reload(wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene.getScene('World')?.player?.active",timeout=120000);page.wait_for_selector('[data-planet="plato"]');assert abs(page.evaluate(W+'.player.x')-x)<2
 assert page.locator('[data-planet="hegel"]').is_enabled();assert page.locator('[data-planet="heidegger"]').is_disabled();enter_story('kant');report['story_objectives_unlock_next_stage_and_interior_save']=True;report['interior_npc_and_hero_face_each_other']=True
 switch('free');assert page.evaluate(P+'.currentContext.id')=='hegel';assert abs(page.evaluate(P+'.bodyState.angle')-free_angle)<.01;assert page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.hegel.flags")==free_worlds['hegel']['flags'];page.locator('[data-tab="galaxy"]').click();assert all(page.locator(f'[data-planet="{id}"]').is_enabled() for id in ['plato','kant','hegel','heidegger','sartre','camus']);report['independent_modes_preserve_existing_free_save']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/play-modes-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
