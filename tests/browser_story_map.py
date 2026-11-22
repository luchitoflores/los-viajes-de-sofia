from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
Path('captures').mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')";F="window.__sofiaGame.scene.getScene('Spaceflight')";U='sofia-universe-progress-v1';errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True)
 ctx.add_init_script("if(!localStorage.getItem('story-map-test-seed')){localStorage.setItem('sofia-play-mode-v1','story');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'camus',worlds:{camus:{introComplete:true,flags:['intro-complete','free-kept']}}}));localStorage.setItem('story-map-test-seed','1')}")
 page=ctx.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)))
 def map_ready():
  page.wait_for_selector('[data-planet="plato"]',timeout=120000)
  page.wait_for_function("document.body.classList.contains('story-selecting')&&document.body.classList.contains('story-map')")
  assert page.locator('#game-canvas').evaluate("e=>getComputedStyle(e).visibility")=='hidden'
  assert not page.locator('[data-run="resume"]').count()
  assert page.locator('[data-run="story-modes"]').is_visible()
 def finish():
  for _ in range(15):
   if not page.locator('#veil.visible').count():return
   choices=page.locator('#panel button:not([hidden])')
   if choices.count():choices.first.click()
   else:page.keyboard.press('Enter')
  raise AssertionError('Dialogue loop')
 def fly(id,touch=False,capture=False,from_map=True):
  page.evaluate("()=>{window.__storyLandings=[];const sample=()=>{const s=window.__sofiaGame?.scene.getScene('Planet');if(document.body.classList.contains('ship-arriving')&&s?.views&&Array.from(s.views.values()).some(v=>v.getData('flightPhase')==='landing'))window.__storyLandings.push({ships:s.objects.filter(o=>o.kind==='ship'&&s.views.get(o.id)?.visible).length,pilots:s.children.list.filter(o=>o.texture?.key==='ship-sofia-pilot'&&o.active).length,hero:s.player.alpha});if(!window.__storyStop)requestAnimationFrame(sample)};requestAnimationFrame(sample)}")
  button=page.locator(f'[data-planet="{id}"]')
  if touch:
   box=button.bounding_box();page.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2)
  else:button.click()
  page.wait_for_function(F+"?.sys.isActive()&&"+F+".phase==='cruise'",timeout=30000)
  assert page.evaluate(F+'.flightData.fromMap')==from_map
  assert page.evaluate(F+".children.list.some(o=>o.type==='Container'&&o.list.some(c=>c.texture?.key==='ship-sofia-pilot'))")
  if capture:page.screenshot(path='captures/historia-entrada-vuelo.png')
  page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
  assert not page.locator('#veil.visible').count();assert not page.evaluate(F+'.sys.isActive()')
  assert page.evaluate(P+'.currentContext?.id??"plato"')==id
  assert page.evaluate(P+'.player.alpha')==1
  samples=page.evaluate('window.__storyLandings');assert samples and all(s['ships']==1 and s['pilots']==1 and s['hero']==0 for s in samples),samples
  assert page.evaluate(f"(()=>{{const s={P},h=s.objects.find(o=>o.kind==='philosopher');return Math.abs(Math.atan2(Math.sin(s.bodyState.angle-h.angleDeg*Math.PI/180),Math.cos(s.bodyState.angle-h.angleDeg*Math.PI/180)))*500}})()")<95
  page.evaluate('window.__storyStop=true')
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded');map_ready();assert page.locator('.world-lock').count()==5;assert page.locator('[data-planet="plato"]').is_enabled();assert page.locator('[data-planet="kant"]').is_disabled()
 angle=page.evaluate(P+'.bodyState.angle');page.keyboard.down('ArrowRight');page.wait_for_timeout(250);page.keyboard.up('ArrowRight');assert page.evaluate(P+'.bodyState.angle')==angle
 page.screenshot(path='captures/historia-inicio-en-mapa.png');page.locator('[data-run="story-modes"]').click();page.locator('[data-action="restart-menu"]').click();page.locator('[data-action="restart-world"]').click();page.locator('[data-action="cancel-restart"]').click();map_ready();free_before=page.evaluate(f"localStorage.getItem('{U}')");report['story_opens_map_without_exposing_or_controlling_surface']=True
 fly('plato',capture=True);page.screenshot(path='captures/historia-primer-aterrizaje.png');assert not page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1-story')).worlds.plato?.introComplete")
 page.keyboard.press('e');page.wait_for_selector('#dialogue-text');finish();assert page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1-story')).worlds.plato.introComplete");report['unlocked_planet_selected_before_pilot_flight_and_single_ship_landing']=True;print('Mapa inicial y primer aterrizaje comprobados',flush=True)
 page.reload(wait_until='domcontentloaded');map_ready();assert page.locator('.world-lock').count()==5;assert page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1-story')).worlds.plato.introComplete");report['resume_returns_to_map_and_preserves_completed_dialogue']=True
 # Partida previa de prueba con el rescate completo: desbloquea la segunda etapa.
 page.add_init_script("if(!localStorage.getItem('story-map-completed-cave')){const k='sofia_phaser_real_v02-story',s=JSON.parse(localStorage.getItem(k));if(s){s.flags.caveCompleted=true;s.flags.plato=true;s.met=[...new Set([...s.met,'plat'])];localStorage.setItem(k,JSON.stringify(s));localStorage.setItem('story-map-completed-cave','1')}}")
 page.reload(wait_until='domcontentloaded');map_ready();assert page.locator('[data-planet="kant"]').is_enabled();assert page.locator('[data-planet="hegel"]').is_disabled();page.set_viewport_size({'width':932,'height':430});page.screenshot(path='captures/historia-mapa-movil-entrada.png')
 locked=page.locator('[data-planet="hegel"]').bounding_box();page.touchscreen.tap(locked['x']+locked['width']/2,locked['y']+locked['height']/2);assert not page.evaluate(F+'.sys.isActive()');assert page.locator('#veil.visible').count()
 page.evaluate('window.__storyStop=false');fly('kant',touch=True);assert not page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1-story')).worlds.kant.introComplete");page.keyboard.press('e');page.wait_for_selector('#dialogue-text');finish();report['mobile_unlocked_choice_flies_and_locked_choice_does_not_enter']=True;print('Reanudación y elección táctil comprobadas',flush=True)
 page.locator('[data-tab="galaxy"]').click();page.evaluate('window.__storyStop=false');fly('plato',touch=True);report['story_atlas_selection_also_animates_without_manual_boarding']=True
 assert page.evaluate(f"localStorage.getItem('{U}')")==free_before
 page.locator('#pause').click();page.locator('[data-action="play-modes"]').click()
 with page.expect_navigation(wait_until='domcontentloaded'):page.locator('[data-action="mode-free"]').click()
 page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.currentContext?.id==='camus'&&window.__sofiaGame.scene.getScene('Planet').player?.active&&window.__sofiaGame.scene.getScene('Planet').sys.isActive()&&!document.querySelector('#veil.visible')",timeout=120000);assert not page.locator('#veil.visible').count();assert not page.locator('body.story-map').count();assert 'free-kept' in page.evaluate(f"JSON.parse(localStorage.getItem('{U}')).worlds.camus.flags");report['free_mode_continue_is_unchanged']=True
 # Regreso a Historia y reinicio: vuelve al mapa, sin saltarse la selección inicial.
 page.locator('#pause').click();page.locator('[data-action="play-modes"]').click()
 with page.expect_navigation(wait_until='domcontentloaded'):page.locator('[data-action="mode-story"]').click()
 map_ready();page.locator('[data-run="story-modes"]').click();page.locator('[data-action="restart-menu"]').click();page.locator('[data-action="restart-mode"]').click()
 with page.expect_navigation(wait_until='domcontentloaded'):page.locator('[data-action="confirm-restart"]').click()
 map_ready();assert page.locator('.world-lock').count()==5;assert page.locator('[data-planet="plato"]').is_enabled();report['switching_to_story_and_restarting_both_return_to_map']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/story-map-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
