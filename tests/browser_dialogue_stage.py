from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,math

P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')"
OUT=Path('captures');OUT.mkdir(exist_ok=True);report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True)
 ctx.add_init_script("if(!localStorage.getItem('stage-fixture')){localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'sartre',worlds:{sartre:{introComplete:true,flags:['retained-progress']}}}));localStorage.setItem('stage-fixture','1')}")
 page=ctx.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)))
 def ready(scene='Planet'):
  page.wait_for_function(f"window.__sofiaGame?.scene.getScene('{scene}')?.sys.isActive()&&window.__sofiaGame.scene.getScene('{scene}').player?.active",timeout=120000);page.wait_for_timeout(350)
 def radial(angle):page.evaluate(f"()=>{{const s={P};s.cancelWalk();s.bodyState.angle={angle}*Math.PI/180}}");page.wait_for_timeout(850)
 def settle():page.wait_for_selector('#veil:not(.visible)',state='attached');page.wait_for_timeout(600);ready('World' if page.evaluate(W+'.sys.isActive()') else 'Planet')
 def finish():
  for _ in range(35):
   if not page.locator('#veil.visible').count():return
   choices=page.locator('#panel button:not([hidden])')
   if choices.count():choices.first.click()
   else:page.locator('#panel').click(position={'x':25,'y':40})
  raise AssertionError('La conversación no termina')
 def editor():page.locator('[data-tab="editor"]').click();page.wait_for_selector('#world-dialogue-editor')
 def close_editor():page.locator('[data-e="close"]').click();page.wait_for_timeout(500)
 def screen(scene,x,y):return page.evaluate(f"()=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint({x}-c.scrollX,{y}-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded');ready();page.locator('[data-action="continue-mode"]').click();radial(-8)
 editor();page.locator('#world-dialogue-editor').click();page.locator('[data-run="new-dialogue"]').click();page.locator('#dialogue-id').fill('encuentro-editado');page.locator('#dialogue-style').select_option('ink');page.locator('#dialogue-character').select_option('sartre');page.locator('#dialogue-body').fill('El mundo se construye con decisiones. ¿Qué quieres explorar primero?')
 page.locator('[data-run="new-node"]').click();page.locator('#dialogue-body').fill('Quiero descubrirlo caminando y preguntar de nuevo cuando lo necesite.');page.locator('#dialogue-character').select_option('@sofia');page.locator('#dialogue-node').select_option('start');page.locator('[data-response="0"] [data-field="next"]').select_option('node-2');page.locator('[data-response="0"] [data-field="text"]').fill('Quiero observar el mundo');page.locator('[data-run="add-response"]').click();page.locator('[data-response="1"] [data-field="text"]').fill('Quiero empezar preguntando');page.locator('[data-response="1"] [data-field="next"]').select_option('node-2')
 host_id=page.evaluate(P+".objects.find(o=>o.kind==='philosopher').id")
 binding=page.locator('#dialogue-binding option').evaluate_all("opts=>opts.find(o=>o.textContent.startsWith('Superficie · Jean-Paul')).value")
 page.locator('#dialogue-binding').select_option(binding);page.locator('#dialogue-form button[type="submit"]').click();settle();close_editor();radial(-8)
 marker=page.locator(f'[data-conversation="{host_id}"]');marker.click();page.wait_for_selector('#dialogue-text');page.locator('#dialogue-text').dispatch_event('dialogue-reveal');assert page.locator('#panel.ink').count();assert not page.locator('#conversation-markers').is_visible();page.screenshot(path=str(OUT/'dialogo-tinta-personaje.png'))
 text=page.locator('#dialogue-text').inner_text();page.keyboard.press('Enter');assert page.locator('#dialogue-text').inner_text()==text;page.keyboard.press('Tab');page.keyboard.press('Enter');page.wait_for_function("document.querySelector('[data-dialogue-speaker]')?.dataset.dialogueSpeaker==='sofia'");page.locator('#dialogue-text').dispatch_event('dialogue-reveal');page.screenshot(path=str(OUT/'dialogo-sofia-responde.png'));finish();report['mouse_marker_branches_and_sofia_speaker']=True
 editor();page.locator('#world-dialogue-editor').click();page.locator('#dialogue-existing').select_option('encuentro-editado');page.locator('#dialogue-style').select_option('parchment')
 with page.expect_download() as download:page.locator('[data-run="export-dialogues"]').click()
 pack=json.loads(Path(download.value.path()).read_text(encoding='utf-8'));assert pack['dialogues']['encuentro-editado']['style']=='parchment';assert any(v['object']==host_id and v['dialogue']=='encuentro-editado' for v in pack['bindings'])
 invalid={**pack,'worldId':'otro-mundo'};page.locator('#dialogue-file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':json.dumps(invalid).encode()});page.wait_for_function("document.getElementById('authoring-error').textContent.length>0");assert page.locator('#dialogue-form').is_visible()
 page.locator('#dialogue-file').set_input_files({'name':'dialogues.json','mimeType':'application/json','buffer':json.dumps(pack).encode()});settle();close_editor();page.set_viewport_size({'width':932,'height':430});radial(-8)
 marker=page.locator(f'[data-conversation="{host_id}"]');box=marker.bounding_box();page.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2);page.wait_for_selector('#dialogue-text');page.locator('#dialogue-text').dispatch_event('dialogue-reveal');assert page.locator('#panel.parchment').count();box=page.locator('#panel').bounding_box();assert box['x']>=0 and box['y']>=0 and box['x']+box['width']<=934 and box['y']+box['height']<=432;page.screenshot(path=str(OUT/'dialogo-pergamino-movil.png'));finish();report['pack_export_import_rejects_wrong_world_and_touch_parchment']=True
 page.set_viewport_size({'width':1440,'height':960});editor();page.locator('#world-new-interior').click();page.locator('#new-interior-name').fill('Sala de conversaciones guardada');page.locator('#new-interior-template').select_option('room');page.locator('#new-interior-form button[type="submit"]').click();ready('World');page.wait_for_function(W+".dataDef.name==='Sala de conversaciones guardada'");room=page.evaluate(W+'.dataDef.name');close_editor();page.reload(wait_until='domcontentloaded');ready('World');page.locator('[data-action="continue-mode"]').click();assert page.evaluate(W+'.dataDef.name')==room;report['editor_scene_is_playable_level_after_reload']=True
 assert 'retained-progress' in page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1')).worlds.sartre.flags");report['existing_progress_preserved']=True
 page.locator('[data-tab="galaxy"]').click();card=page.locator('[data-planet="plato"] img');assert 'planet-plato-stone' in card.get_attribute('src');page.locator('[data-planet="plato"]').click();ready();radial(-8);assert page.evaluate(P+".textures.exists("+P+".currentContext.terrain+'-round')");page.locator('#planet-view').click();page.wait_for_timeout(1800);page.screenshot(path=str(OUT/'platon-dos-mundos-navegable.png'));page.locator('#planet-view').click();radial(-8);page.locator('[data-conversation="philosopher"]').click();page.wait_for_selector('#dialogue-text');page.locator('#dialogue-text').dispatch_event('dialogue-reveal');page.screenshot(path=str(OUT/'platon-nuevo-dialogo.png'));finish()
 start=page.evaluate(P+'.bodyState.angle');page.keyboard.down('ArrowRight');page.wait_for_function(P+f'.bodyState.angle>{start}+Math.PI*2',timeout=35000);page.keyboard.up('ArrowRight');assert abs(page.evaluate(P+'.bodyState.height'))<1;report['new_plato_art_real_360_walk']=True
 radial(190);page.keyboard.press('e');ready('World');finish();page.wait_for_function(W+".dataDef.name.startsWith('A ·')");point=screen(W,55,480);page.mouse.click(point['x'],point['y']);page.wait_for_function(P+'.sys.isActive()',timeout=10000);ready();assert abs(math.atan2(math.sin(page.evaluate(P+'.bodyState.angle')-190*math.pi/180),math.cos(page.evaluate(P+'.bodyState.angle')-190*math.pi/180)))<.2;report['cave_door_return_keeps_radial_anchor']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;(OUT/'dialogue-stage-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False),flush=True);b.close()


