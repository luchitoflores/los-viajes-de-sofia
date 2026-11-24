from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:5174/');OUT=Path('captures');OUT.mkdir(exist_ok=True)
W="window.__sofiaGame.scene.getScene('World')";P="window.__sofiaGame.scene.getScene('Planet')";KEY='sofia-universe-progress-v1'
world=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'));events=['event:'+id+':'+e['id'] for id,r in world['interiors'].items() for e in r.get('events',[])]
report={};errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':932,'height':430},has_touch=True)
 fixture={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'prisioneros','interiorX':420,'flags':['lampara_encendida']+events}}}
 context.add_init_script("if(!localStorage.getItem('lamp-fixture')){localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',"+json.dumps(json.dumps(fixture))+");localStorage.setItem('lamp-fixture','1')}")
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 def tap(selector):
  page.locator(selector).tap();page.wait_for_timeout(150)
 def finish():
  for _ in range(60):
   if not page.locator('#veil.world-dialog.visible').count():return
   choices=page.locator('#panel button:not([hidden])')
   if choices.count():choices.first.tap()
   else:page.keyboard.press('Enter')
   page.wait_for_timeout(65)
  raise AssertionError('Dialogue did not finish')
 def lamp():return page.locator('#context-controls').get_attribute('data-lamp')
 def start():
  page.goto(URL,wait_until='domcontentloaded');page.locator('[data-action="continue-mode"]').click(timeout=120000);page.wait_for_function(W+'.player?.active',timeout=60000);page.wait_for_timeout(600)
 def screenshot(name):page.screenshot(path=str(OUT/('lamp-'+name+'.png')))
 start();assert lamp()=='on';assert page.evaluate(W+'.heldLamp.prop.visible');screenshot('idle-on-mobile')
 assert page.locator('#context-primary').get_attribute('aria-label')=='Hablar';assert page.locator('#context-secondary').is_visible()
 tap('#context-primary');page.wait_for_selector('#veil.world-dialog.visible');assert not page.locator('#context-controls').is_visible();assert not page.locator('#joystick').is_visible();finish();report['context_talk_and_modal_lock']=True
 # Light remains directly reachable beside an NPC.
 tap('#context-secondary');assert lamp()=='off';assert page.evaluate(W+'.heldLamp.prop.visible');screenshot('idle-off-mobile')
 light=page.evaluate(W+'.roomLight.texture.context.getImageData(420,490,1,1).data[3]');assert light>200;report['off_preserves_ambient_darkness']=True
 session=context.new_cdp_session(page)
 def walk(direction,name):
  rect=page.locator('#joystick').bounding_box();x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2
  before=page.evaluate(W+'.player.x');page.evaluate("window.lampSamples=[];window.lampCollect=true;function collect(){const s=window.__sofiaGame.scene.getScene('World');if(window.lampCollect){window.lampSamples.push({frame:s.player.texture.key,height:s.player.displayHeight,x:s.player.x,y:s.player.y,px:s.heldLamp.prop.x,py:s.heldLamp.prop.y});requestAnimationFrame(collect)}};collect()")
  session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+direction*rect['width']*.3,'y':y}]});page.wait_for_timeout(850);assert page.locator('#context-controls').is_visible();screenshot(name);session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.evaluate('window.lampCollect=false');page.wait_for_timeout(180)
  after=page.evaluate(W+'.player.x');assert (after-before)*direction>80,(before,after);samples=page.evaluate('window.lampSamples');assert len(set(s['frame'] for s in samples))>=4;assert max(s['height'] for s in samples)-min(s['height'] for s in samples)<.01;assert all(abs(s['px']-s['x'])<90 and -110<s['py']-s['y']<0 for s in samples);assert not page.locator('#veil.visible').count();assert page.evaluate(W+'.heldLamp.prop.originX')==(.72 if direction<0 else .28);return samples
 walk(1,'walk-off-mobile');tap('#context-primary');assert lamp()=='on';walk(-1,'walk-on-mobile');report['real_emulated_touch_joystick_four_walk_frames_stable_feet_and_prop']=True
 tap('#equipment-menu');assert lamp()=='unequipped';assert not page.evaluate(W+'.heldLamp.prop.visible');tap('#equipment-menu');assert lamp()=='off';assert page.evaluate(W+'.heldLamp.prop.visible');page.keyboard.press('l');page.wait_for_timeout(200);assert lamp()=='on';report['equip_unequip_keyboard_and_recovery']=True
 page.keyboard.press('l');page.wait_for_timeout(200);assert lamp()=='off';page.reload(wait_until='domcontentloaded');page.locator('[data-action="continue-mode"]').click(timeout=120000);page.wait_for_function(W+'.player?.active');page.wait_for_timeout(500);assert lamp()=='off';saved=json.loads(page.evaluate('localStorage.getItem("'+KEY+'")'));assert 'lampara_encendida' in saved['worlds']['plato']['flags'];report['manual_off_survives_reload_and_preserves_milestone']=True;print('controls and save passed',flush=True)
 # Scene authoring and reusable preset transfer; previews do not write played progress.
 played=page.evaluate('localStorage.getItem("'+KEY+'")')
 page.goto(URL+'#/edicion?world=plato&scene=prisioneros');page.wait_for_selector('#equipment-settings',state='attached',timeout=60000);played=page.evaluate('localStorage.getItem("'+KEY+'")');page.locator('#sofia-mechanics > summary').click();page.locator('#lamp-radius').fill('180');page.locator('#equipment-settings button[type=submit]').click();page.wait_for_function("document.getElementById('core-status')?.textContent.includes('Mecánicas guardadas')")
 page.locator('#sofia-mechanics > summary').click()
 with page.expect_download() as dl:page.locator('#equipment-export').click()
 preset=json.loads(Path(dl.value.path()).read_text(encoding='utf8'));assert preset['settings']['lamp']['radius']==180
 page.locator('#equipment-import').set_input_files({'name':'lamp-preset.json','mimeType':'application/json','buffer':json.dumps(preset).encode()});page.wait_for_function("document.getElementById('equipment-status').textContent.includes('Preset cargado')");page.locator('#equipment-settings button[type=submit]').click();page.wait_for_function("document.getElementById('core-status')?.textContent.includes('Mecánicas guardadas')");report['editor_settings_preset_export_import']=True;print('preset passed',flush=True)
 metrics={}
 for scene in ['entrada','prisioneros','fuego','ascenso','salida']:
  print('room '+scene,flush=True);page.goto(URL+'#/edicion?world=plato&scene='+scene);page.wait_for_selector('#core-test-scene');page.wait_for_function("document.getElementById('core-scene').value==='"+scene+"'")
  page.locator('#core-test-flags').locator('..').locator('..').evaluate('(e)=>e.open=true');page.locator('#core-test-flags').fill(','.join(['lampara_encendida']+events));page.locator('#core-test-scene').click();page.wait_for_function("document.body.classList.contains('core-scene-preview')");page.wait_for_function(W+'.player?.active');page.wait_for_timeout(400);assert lamp()=='on',scene
  assert page.evaluate(W+'.heldLamp.prop.visible');page.keyboard.press('l');page.wait_for_timeout(150);assert lamp()=='off',scene
  metrics[scene]=page.evaluate(W+'.roomLight.texture.context.getImageData(1200,150,1,1).data[3]')
  assert page.evaluate('localStorage.getItem("'+KEY+'")')==played
  page.locator('#core-close-preview').click() if page.locator('#core-close-preview').count() else page.locator('#core-preview-close').click()
 assert metrics['prisioneros']>metrics['fuego']>metrics['salida'],metrics
 report['five_rooms_distinct_ambient_and_editor_progress_isolation']=metrics
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;(OUT/'mobile-lamp-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False),flush=True);browser.close()
