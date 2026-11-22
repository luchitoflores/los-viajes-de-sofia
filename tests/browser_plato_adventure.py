from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,math

URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/');OUT=Path('captures');OUT.mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')";KEY='sofia-universe-progress-v1'
report={};errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':960},has_touch=True)
 context.add_init_script("if(!localStorage.getItem('cave-fixture')){localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{}}));localStorage.setItem('cave-fixture','1')}")
 page=context.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)))
 touch=False
 def flags():return page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.plato.flags")
 def modal():return page.locator('#veil.world-dialog.visible').count()>0
 def tap(locator):
  box=locator.bounding_box();assert box
  (page.touchscreen.tap if touch else page.mouse.click)(box['x']+min(30,box['width']/2),box['y']+min(35,box['height']/2))
 def finish(branch=0):
  for _ in range(60):
   if not modal():return
   choices=page.locator('#panel button:not([hidden])')
   if choices.count():
    if touch:tap(choices.nth(min(branch,choices.count()-1)))
    else:choices.nth(min(branch,choices.count()-1)).click()
   else:tap(page.locator('#panel .bubble-content'))
   page.wait_for_timeout(45)
  raise AssertionError('El diálogo no termina')
 def ready():page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active||window.__sofiaGame?.scene.getScene('World')?.player?.active",timeout=120000)
 def room(prefix):return page.evaluate(W+f".sys.isActive()&&{W}.dataDef.name.startsWith('{prefix} ·')")
 def item(id,planet=False):
  page.wait_for_timeout(200)
  scene=P if planet else W
  q=page.evaluate(f"()=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),v="+(f"s.hotspots.get('{id}')" if planet else f"s.propViews.find(v=>v.id==='{id}'&&v.obj.type==='Zone').obj")+";const a=v.getCenter(),p=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}")
  (page.touchscreen.tap if touch else page.mouse.click)(q['x'],q['y'])
 def talk_item(id):
  print('investigate '+id,flush=True);item(id)
  try:page.wait_for_selector('#veil.world-dialog.visible',timeout=20000)
  except:
   page.screenshot(path=str(OUT/'cave-failure.png'));print(page.evaluate(W+"?{x:"+W+".player.x,pending:"+W+".pending,destination:"+W+".destination}:null"),flush=True);raise
 def go(id,prefix):
  for _ in range(5):
   if modal():finish()
   item(id)
   page.wait_for_function(W+f".dataDef.name.startsWith('{prefix} ·')||!!document.querySelector('#veil.world-dialog.visible')",timeout=25000)
   if room(prefix):page.wait_for_timeout(220);finish();print('room '+prefix,flush=True);return
   finish()
  raise AssertionError('No se llegó a '+prefix)
 def begin():
  page.goto(URL,wait_until='domcontentloaded');ready();page.locator('[data-action="continue-mode"]').click();page.wait_for_timeout(500)
 begin();page.locator('[data-conversation="philosopher"]').click();page.wait_for_selector('#dialogue-text');assert page.locator('#panel button:not([hidden])').count()==0
 page.keyboard.press('Enter');page.keyboard.press('Enter');page.wait_for_selector('#veil:not(.visible)',state='attached');report['buttonless_dialogue_enter']=True
 item('ship',True);page.wait_for_selector('[data-planet="earth"]',timeout=15000);assert page.locator('[data-planet="earth"]').is_enabled();page.locator('[data-run="resume"]').click();page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=15000);report['departure_allowed_before_adventure']=True
 page.locator('#planet-view').click();page.wait_for_timeout(1600);item('cave',True);page.wait_for_function(W+".sys.isActive()&&"+W+".dataDef.name.startsWith('A ·')",timeout=25000);page.wait_for_timeout(250);finish()
 talk_item('lampara-sofia');finish();assert 'lampara_encendida' in flags();talk_item('antorcha-entrada');finish();assert 'antorcha_entrada' in flags()
 go('entrada-prisioneros','B');page.screenshot(path=str(OUT/'caverna-b-lampara-local.png'))
 lighting=page.evaluate(f"()=>{{const s={W},t=s.roomLight.texture.context;return{{near:t.getImageData(Math.max(0,Math.round(s.player.x)),500,1,1).data[3],far:t.getImageData(1220,300,1,1).data[3]}}}}")
 assert lighting['near']<lighting['far'] and lighting['far']>200,lighting
 page.reload(wait_until='domcontentloaded');ready();page.locator('[data-action="continue-mode"]').click();assert room('B');assert 'antorcha_entrada' in flags();report['lamp_torch_and_room_save']=True
 talk_item('prisionero-encadenado');finish();assert 'prisionero_acepta' not in flags();talk_item('prisioneros-ascenso');finish();assert room('B');assert 'prisionero_liberado' not in flags();report['prisoner_and_ascent_initially_blocked']=True
 go('prisioneros-fuego','C');talk_item('muro-proyeccion');finish();assert 'sombras_comprendidas' not in flags()
 for obj in ['fuego','caballo','vasija','figura']:talk_item('objeto-'+obj);finish()
 talk_item('muro-proyeccion');finish(1);assert 'sombras_comprendidas' in flags();page.screenshot(path=str(OUT/'caverna-c-fuego-investigacion.png'));report['shadows_discovered_by_investigation_and_branching']=True
 go('fuego-prisioneros','B');talk_item('prisionero-encadenado');finish();assert 'prisionero_acepta' in flags();talk_item('cadenas-prisionero');finish();page.wait_for_timeout(500)
 assert 'prisionero_liberado' in flags();assert page.evaluate(W+".companion?.getData('characterId')==='prisionero'");assert not page.evaluate(W+".propViews.some(v=>v.id==='prisionero-encadenado')");report['same_prisoner_freed_without_duplicate']=True
 go('prisioneros-ascenso','D')
 page.evaluate(f"()=>{{window.stairSamples=[];const collect=()=>{{const s={W};if(s.sys.isActive()&&s.dataDef.name.startsWith('D ·')){{window.stairSamples.push({{x:s.player.x,y:s.player.y,g:s.groundAt(s.player.x),cy:s.companion?.y,cg:s.follower?s.groundAt(s.follower.x):null}});requestAnimationFrame(collect)}}}};requestAnimationFrame(collect)}}")
 page.keyboard.down('ArrowRight');page.wait_for_selector('#veil.world-dialog.visible',timeout=10000);page.keyboard.up('ArrowRight');finish(1)
 page.keyboard.down('ArrowRight');page.wait_for_function(W+'.player.x>890',timeout=12000);page.keyboard.up('ArrowRight');samples=page.evaluate('window.stairSamples');assert len(samples)>40;assert max(abs(s['y']-s['g']) for s in samples)<1;assert max(abs(s['cy']-s['cg']) for s in samples if s['cy'] is not None)<1;assert min(s['y'] for s in samples)<220;page.screenshot(path=str(OUT/'caverna-d-ascenso-companero.png'));report['keyboard_stairs_and_companion_follow_ground']=True
 go('ascenso-salida','E');talk_item('salida-planeta');finish();assert 'primer_ascenso_completado' in flags();assert 'aventura_platon_completada' not in flags();assert room('E');page.screenshot(path=str(OUT/'caverna-e-primer-ascenso.png'));report['first_exit_does_not_end_mission']=True
 go('salida-ascenso','D');go('ascenso-prisioneros','B');assert 'regreso_caverna_completado' in flags();assert 'decision_final_prisionero' not in flags()
 page.evaluate("window.dispatchEvent(new Event('pagehide'))");checkpoint=context.storage_state();(OUT/'plato-return-checkpoint.json').write_text(json.dumps(checkpoint),encoding='utf8');page.screenshot(path=str(OUT/'caverna-b-regreso.png'));report['return_to_cave_is_mandatory']=True
 # Ending A: stay; Sofia climbs alone.
 page.locator('[data-conversation="companion"]').click();page.wait_for_selector('#panel button:not([hidden])');assert page.locator('#panel button:not([hidden])').count()==2;page.screenshot(path=str(OUT/'caverna-decision-final.png'));finish(0);page.wait_for_timeout(250);assert 'prisionero_se_queda' in flags();assert not page.evaluate(W+'.companion');assert page.evaluate(W+".propViews.some(v=>v.id==='prisionero-se-queda')")
 go('prisioneros-ascenso','D');go('ascenso-salida','E');talk_item('salida-planeta');finish();assert 'aventura_platon_completada' in flags();page.locator('[data-tab="galaxy"]').click();page.locator('[data-planet="kant"]').click();page.wait_for_function("document.getElementById('toast').textContent.includes('superficie')");assert room('E');page.locator('[data-planet="plato"]').click()
 item('salida-planeta');page.wait_for_function(P+'.sys.isActive()',timeout=15000);assert abs(math.atan2(math.sin(page.evaluate(P+'.bodyState.angle')-math.radians(190)),math.cos(page.evaluate(P+'.bodyState.angle')-math.radians(190))))<.25;assert not page.evaluate(P+'.companion');report['ending_stay_second_ascent_and_surface_anchor']=True
 context.close()
 # Ending B: independent save checkpoint, emulated landscape touch throughout.
 context=browser.new_context(viewport={'width':932,'height':430},has_touch=True,storage_state=checkpoint);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));touch=True;begin();assert room('B');page.wait_for_timeout(600)
 tap(page.locator('[data-conversation="companion"]'));finish(1);assert 'prisionero_sale' in flags();assert page.evaluate(W+'.companion?.active')
 go('prisioneros-ascenso','D');go('ascenso-salida','E');talk_item('salida-planeta');finish();assert 'aventura_platon_completada' in flags();assert 'segundo_ascenso_completado' in flags();assert 'prisionero_se_queda' not in flags();assert page.evaluate(W+".propViews.some(v=>v.id==='prisionero-libre-salida')");page.screenshot(path=str(OUT/'caverna-final-exterior-movil.png'))
 item('salida-planeta');page.wait_for_function(P+'.sys.isActive()',timeout=15000);assert not page.evaluate(P+'.companion');report['ending_exterior_emulated_touch_and_no_universe_follower']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;(OUT/'plato-adventure-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False),flush=True);browser.close()
