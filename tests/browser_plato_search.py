"""The authored search in room A, desktop and emulated mobile; isolated game profiles."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')"
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/');OUT=Path('captures');OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':960},has_touch=True,reduced_motion='reduce')
 context.add_init_script("if(!localStorage.getItem('search-fixture')){localStorage.setItem('search-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'earth',worlds:{earth:{introComplete:true,flags:['camera-introduction-seen']}}}))}")
 page=context.new_page();errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)));touch=False
 def tap(locator):
  (locator.tap if touch else locator.click)()
 def progress():return page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1')).worlds.plato")
 def ready():page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active||window.__sofiaGame?.scene.getScene('World')?.player?.active",timeout=300000)
 def finish():
  for _ in range(90):
   if not page.locator('#veil.world-dialog.visible').count():return
   assert page.locator('#panel button:not([hidden])').count()==0
   if touch:page.locator('#panel .bubble-content').tap(position={'x':25,'y':25})
   else:page.keyboard.press('Enter')
   page.wait_for_timeout(55)
  raise AssertionError('Dialogue did not finish')
 def click_item(id,planet=False):
  scene=P if planet else W
  q=page.evaluate(f"id=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),v="+("s.hotspots.get(id)" if planet else "s.propViews.find(v=>v.id===id&&v.obj.type==='Zone').obj")+".getCenter(),p=c.matrix.transformPoint(v.x-c.scrollX,v.y-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}",id)
  (page.touchscreen.tap if touch else page.mouse.click)(q['x'],q['y'])
 def room(letter):
  page.wait_for_function(W+f".sys.isActive()&&{W}.dataDef.name.startsWith('{letter} ·')",timeout=30000);page.wait_for_timeout(350)
 def inventory(command):
  tap(page.locator('[data-tab="inventory"]'));page.wait_for_selector('[data-inventory]');tap(page.locator('[data-inventory]').filter(has_text='Linterna de Sofía'));page.wait_for_selector('[data-item-command="'+command+'"]');assert page.locator('[data-item-command="'+command+'"]').is_enabled();tap(page.locator('[data-item-command="'+command+'"]'));page.wait_for_timeout(250);finish()
 def return_and_enter():
  click_item('entrada-prisioneros');page.wait_for_selector('#veil.world-dialog.visible',timeout=15000);page.wait_for_function("document.getElementById('panel').textContent.includes('Platón')");finish();room('A')
  click_item('entrada-planeta');page.wait_for_function(P+'.sys.isActive()',timeout=15000);page.wait_for_timeout(600)
  tap(page.locator('[data-conversation="philosopher"]'));page.wait_for_selector('#veil.world-dialog.visible',timeout=15000);page.wait_for_function("document.getElementById('panel').textContent.includes('encontrado')");finish();assert 'caverna_acceso_autorizado' in progress()['flags']
  click_item('cave',True);room('A');finish();assert not page.evaluate(W+".propViews.some(v=>v.id==='lampara-sofia')")
  # Explicitly off must block passage even after Plato's permission.
  if progress().get('equipment',{}).get('lamp',{}).get('on'):inventory('use')
  click_item('entrada-prisioneros');page.wait_for_selector('#veil.world-dialog.visible',timeout=15000);page.wait_for_function("document.getElementById('panel').textContent.includes('Enciende')");finish();room('A')
  inventory('use');assert progress()['equipment']['lamp']['on'];click_item('entrada-prisioneros');room('B');finish()
  light=page.evaluate(W+".roomLight.texture.context.getImageData(1220,200,1,1).data[3]");assert light>100
 try:
  page.goto(URL,wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=300000);tap(page.locator('[data-action="continue-mode"]'));ready()
  # Reuse boarding/flight/landing; the new host position is near the cave.
  page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship');s.cancelWalk();s.bodyState.angle=(o.angleDeg+10)*Math.PI/180}}")
  page.wait_for_timeout(1200);click_item('ship',True);page.wait_for_selector('[data-planet="plato"]',timeout=20000);tap(page.locator('[data-planet="plato"]'));page.wait_for_function("window.__sofiaGame.scene.getScene('Spaceflight').sys.isActive()",timeout=30000);page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=180000);page.wait_for_function(P+".currentContext?.id==='plato'&&"+P+".player.alpha===1",timeout=30000)
  page.emulate_media(reduced_motion='no-preference')
  assert not page.locator('#veil.world-dialog.visible').count();assert not progress()['introComplete']
  tap(page.locator('[data-conversation="philosopher"]'));page.wait_for_selector('#veil.world-dialog.visible',timeout=15000);finish();assert 'busqueda_linterna_iniciada' in progress()['flags'];page.wait_for_selector('#quest-item.undiscovered:not([hidden])')
  click_item('cave',True);room('A');finish();assert 'lampara_encendida' not in progress()['flags']
  click_item('entrada-prisioneros');page.wait_for_selector('#veil.world-dialog.visible',timeout=15000);finish();room('A')
  click_item('lampara-sofia');page.wait_for_selector('#pickup-notice:not([hidden])',timeout=15000);assert 'Linterna' in page.locator('#pickup-notice').inner_text();assert page.evaluate(W+".registry.get('last-pickup').animated");finish()
  assert 'lampara-sofia' in progress()['planet']['collected'];assert 'caverna_acceso_autorizado' not in progress()['flags'];assert 'superficie' in page.locator('#quest').inner_text() and 'Platón' in page.locator('#quest').inner_text()
  page.evaluate("window.dispatchEvent(new Event('pagehide'))");checkpoint=context.storage_state();page.screenshot(path=str(OUT/'search-lamp-found-room-a.png'))
  inventory('equip');assert progress()['equipment']['lamp']['equipped'];assert not progress()['equipment']['lamp']['on'];inventory('use');assert progress()['equipment']['lamp']['on'];inventory('unequip');assert not progress()['equipment']['lamp']['equipped']
  return_and_enter();page.reload(wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=300000);ready();tap(page.locator('[data-action="continue-mode"]'));room('B');assert progress()['equipment']['lamp']['on'];print('Desktop search, equipment, permission, real light and reload verified',flush=True)
  context.close()
  # Continue a separate copy just after the pickup using touch only.
  context=browser.new_context(viewport={'width':932,'height':430},has_touch=True,storage_state=checkpoint);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));touch=True
  page.goto(URL,wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=300000);tap(page.locator('[data-action="continue-mode"]'));room('A');finish();page.screenshot(path=str(OUT/'search-mobile-objective.png'))
  inventory('equip');inventory('use');inventory('unequip');return_and_enter();page.screenshot(path=str(OUT/'search-mobile-prisoners-light.png'));assert not errors,errors
  (OUT/'plato-search-validation.json').write_text(json.dumps({'desktop':True,'emulated_landscape_touch':True,'physical_phone_tested':False,'room_a_pickup':True,'return_to_plato_required':True,'room_b_real_lamp_gate':True,'equipment_and_reload':True,'browser_errors':errors},indent=2),encoding='utf8')
  print('Landscape touch search and continuity verified',flush=True);browser.close()
 except Exception:
  try:
   page.screenshot(path=str(OUT/'plato-search-failure.png'))
   print(page.locator('#panel').inner_text(),flush=True)
   print(progress(),flush=True)
   print(page.evaluate("()=>{const g=window.__sofiaGame,p=g.scene.getScene('Planet'),f=g.scene.getScene('Spaceflight');return{phase:f.phase,classes:document.body.className,active:p.sys.isActive(),paused:p.sys.isPaused(),time:p.tweens.timeScale,tweens:p.tweens.getTweens().map(t=>({elapsed:t.elapsed,state:t.state,targets:t.targets.map(x=>({x:x.x,y:x.y,height:x.height,alpha:x.alpha,phase:x.getData?.('flightPhase')}))}))}}"),flush=True)
  except:pass
  raise
