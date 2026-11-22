from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,math
BASE=os.environ.get('SOFIA_URL','http://127.0.0.1:5173');OUT=Path('captures');OUT.mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')"
KEY='sofia-universe-progress-v1';report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True);page=ctx.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print('ERROR',e,flush=True)))
 def progress(id='sartre'):return page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds['{id}']")
 def ready(scene):page.wait_for_function(f"window.__sofiaGame?.scene.isActive('{scene}') && window.__sofiaGame.scene.getScene('{scene}').player?.active",timeout=90000)
 def point(scene,x,y):return page.evaluate(f"() => {{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);return {{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 def click(scene,x,y):
  pos=point(scene,x,y);assert 0<pos['x']<1440 and 0<pos['y']<960,pos;page.mouse.click(pos['x'],pos['y'])
 def radial(deg):page.evaluate(f"() => {{const s={P};s.cancelWalk();s.bodyState.angle={deg}*Math.PI/180}}" );page.wait_for_timeout(900)
 def tap_surface(id):
  pos=page.evaluate(f"{P}.hotspots.get('{id}').getCenter()");click(P,pos['x'],pos['y'])
 def tap_item(id):
  pos=page.evaluate(f"{W}.propViews.find(v=>v.id==='{id}' && v.obj.type==='Zone').obj.getCenter()");click(W,pos['x'],pos['y'])
 def run(id):page.locator(f'[data-run="{id}"]').click()
 def state_wait(expression):page.wait_for_function(expression,timeout=20000)
 def enter_atlas(system='existentialism'):
  page.locator('[data-tab="galaxy"]').click();page.locator('[data-galaxy="contemporary"]').click();page.locator(f'[data-system="{system}"]').click()
 page.goto(BASE,wait_until='domcontentloaded');ready('Planet');page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;page.wait_for_timeout(500)
 legacy=page.evaluate("[localStorage.getItem('sofia_phaser_real_v02'),localStorage.getItem('sofia-polis-radial-v1')]")
 page.locator('[data-tab="galaxy"]').click();assert page.locator('[data-galaxy]').count()==4
 page.locator('[data-theme="latin-america"]').click();assert 'no hay planetas' in page.locator('#panel').inner_text().lower();run('universe')
 page.locator('[data-galaxy="contemporary"]').click();page.locator('[data-system="existentialism"]').click();assert page.locator('[data-planet="sartre"]').count()==1
 page.screenshot(path=str(OUT/'atlas-por-autores.png'));page.locator('[data-planet="sartre"]').click();ready('Planet');state_wait(f"{P}.currentContext?.id==='sartre' && document.querySelector('#veil.visible.world-dialog')")
 angle=page.evaluate(f'{P}.bodyState.angle');page.keyboard.down('ArrowRight');page.wait_for_timeout(400);page.keyboard.up('ArrowRight');assert page.evaluate(f'{P}.bodyState.angle')==angle
 page.screenshot(path=str(OUT/'sartre-encuentro-inicial.png'))
 run('choice-1');run('choice-0');run('choice-0');run('choice-0');run('choice-0');assert progress()['introComplete'];assert page.locator('#veil.visible').count()==0
 print('Encuentro inicial y bloqueo verificados',flush=True);report['mandatory_first_meeting']=True
 page.locator('#planet-view').click();page.wait_for_timeout(1400);start=page.evaluate(f'{P}.bodyState.angle')
 for deg in [80,160,240,320,353]:
  a=math.radians(deg);click(P,math.sin(a)*460,-math.cos(a)*460);state_wait(f"Math.abs(Math.atan2(Math.sin({P}.bodyState.angle-{a}),Math.cos({P}.bodyState.angle-{a})))<.012 && {P}.destination===null")
 assert page.evaluate(f'{P}.bodyState.angle')-start>math.pi*1.98;report['shared_radial_360']=True
 page.locator('#planet-view').click();page.wait_for_timeout(1000);radial(40);tap_surface('sartre-cafe-door');ready('World');assert page.evaluate(f'{W}.place')=='universal';anchor=progress()['planet']['returnAnchor']['angle']
 tap_item('cafe-mentor');state_wait("document.querySelector('#veil.visible')");run('choice-0');run('choice-0');assert 'cafe-heard' in progress()['flags']
 tap_item('cafe-notebook');state_wait("document.querySelector('#veil.visible')");run('continue');assert 'cafe-evidence' in progress()['flags']
 tap_item('cafe-pairs-table');state_wait("document.querySelector('[data-left]')")
 page.locator('[data-left="facticity"]').click();page.locator('[data-right="project"]').click();assert 'Revisa' in page.locator('.activity-feedback').inner_text()
 for id in ['facticity','project','bad-faith-pair']:page.locator(f'[data-left="{id}"]').click();page.locator(f'[data-right="{id}"]').click()
 assert 'roles-pairs' in progress()['completed'];run('leave')
 tap_item('cafe-evidence-table');state_wait("document.querySelector('[data-evidence]')")
 page.drag_and_drop('[data-evidence="job"]','[data-category="fixed-role"]');state_wait(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.sartre.answers['cafe-classification']?.includes('job')")
 source=page.locator('[data-evidence="anything"]').bounding_box();target=page.locator('[data-category="denied-situation"]').bounding_box();cdp=page.context.new_cdp_session(page)
 sx=source['x']+source['width']/2;sy=source['y']+source['height']/2;tx=target['x']+target['width']/2;ty=target['y']+target['height']/2
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':sx,'y':sy}]})
 for n in range(1,13):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':sx+(tx-sx)*n/12,'y':sy+(ty-sy)*n/12}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});state_wait(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.sartre.answers['cafe-classification']?.includes('anything')")
 for id in ['work','conditions']:page.locator(f'[data-evidence="{id}"]').click();page.locator('[data-category="situated"]').click()
 assert 'cafe-complete' in progress()['flags'];page.screenshot(path=str(OUT/'sartre-clasificacion.png'));run('leave');page.locator('[data-tab="editor"]').click();tap_item('cafe-evidence-table');page.locator('[data-e="close"]').click();page.locator('#planet-exit').click();ready('Planet');assert abs(page.evaluate(f'{P}.bodyState.angle')-anchor)<1e-8
 print('Café, parejas, clasificación por ratón y dedo, y retorno verificados',flush=True);report['generic_pairs']=True;report['mouse_and_touch_classification']=True;report['door_exact_return']=True
 radial(130);tap_surface('sartre-choice-door');ready('World');page.locator('[data-tab="editor"]').click();assert page.locator('#world-save-behavior').count()==0;page.locator('#object-kind').select_option('asset:notebook');page.locator('[data-tool="object"]').click();assert page.locator('#object-kind').input_value()=='asset:notebook';page.locator('[data-tool="select"]').click();page.locator('[data-e="undo"]').click();assert page.evaluate(f"{W}.objects.some(o=>o.id==='choice-mentor') && !{W}.objects.some(o=>o.id==='cafe-evidence-table')");page.locator('[data-e="close"]').click();report['undo_scoped_to_scene']=True;tap_item('choice-mentor');state_wait("document.querySelector('#veil.visible')");run('choice-1');run('choice-0')
 click(W,850,470);state_wait(f'Math.abs({W}.player.x-850)<5 && {W}.destination===null');tap_item('choice-notebook');state_wait("document.querySelector('[data-run=\"option-0\"]')")
 run('option-0');run('reason-1');assert 'young-person-choice' not in progress()['completed'];run('reason-0');assert progress()['choices']['young-person-choice']=='care';assert progress()['reasons']['young-person-choice']=='assume'
 page.screenshot(path=str(OUT/'sartre-decision-consecuencia.png'));run('leave');page.reload(wait_until='domcontentloaded');ready('World');assert page.evaluate(f'{W}.dataDef.name')=='Sala de los Dos Caminos';assert progress()['choices']['young-person-choice']=='care';assert page.locator('#veil.visible').count()==0
 page.locator('#planet-exit').click();ready('Planet');enter_atlas('phenomenology');page.evaluate(f'window.__previousContext={P}.currentContext');page.locator('[data-planet="sartre"]').click();state_wait(f"{P}.currentContext!==window.__previousContext && {P}.player?.active && !document.querySelector('#veil.visible')");ready('Planet');assert progress()['introComplete'];assert page.locator('#veil.visible').count()==0
 report['choices_arguments_and_reload']=True;report['same_planet_from_two_routes']=True;print('Decisión argumentada, recarga y dos rutas al mismo planeta verificadas',flush=True)
 page.locator('[data-tab="editor"]').click();assert page.locator('#world-import-terrain').is_visible()
 with page.expect_file_chooser() as fc:page.locator('#world-import-terrain').click()
 fc.value.set_files('public/assets/planet-terrain.png');state_wait(f"{P}.currentContext?.sources.some(a=>a.key==={P}.currentContext.terrain && a.url.startsWith('data:'))");ready('Planet');state_wait("document.querySelector('#world-import-sprite')")
 page.locator('#world-sprite-kind').select_option('vase')
 with page.expect_file_chooser() as fc:page.locator('#world-import-sprite').click()
 fc.value.set_files('public/assets/polis-vase.png');state_wait("document.querySelector('#planet-palette [data-asset^=\"sprite-\"]')");page.wait_for_timeout(1300)
 palette=page.locator('#planet-palette [data-asset^="sprite-"]');palette.scroll_into_view_if_needed();box=palette.bounding_box();a=math.radians(230);target=point(P,math.sin(a)*500,-math.cos(a)*500)
 page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(target['x'],target['y'],steps=18);page.mouse.up();state_wait("document.querySelector('#world-save-behavior')")
 object_id=page.evaluate(f'{P}.objects.at(-1).id');page.locator('#radial-integrated').check();page.locator('#radial-integrated').uncheck();page.locator('#world-action').select_option('examine');page.locator('#world-action-text').fill('Un objeto configurado mediante datos.');page.locator('#world-save-behavior').click()
 with page.expect_download() as dl:page.locator('#world-export-all').click()
 config=json.loads(Path(dl.value.path()).read_text(encoding='utf-8'));assert config['format']=='sofia-world';assert config['assets'][config['terrain']]['src'].startswith('data:image/');assert config['surface']['objects'][-1]['behavior'] in config['interactions']
 page.screenshot(path=str(OUT/'editor-mundo-configurable.png'));page.locator('[data-e="close"]').click();radial(215);tap_surface(object_id);state_wait("document.querySelector('#veil.visible')");assert 'Un objeto configurado' in page.locator('#panel').inner_text();run('continue')
 page.locator('[data-tab="editor"]').click();bad=json.loads(json.dumps(config));bad['interactions']['cafe-entry']['actions'][0]['target']='missing'
 page.locator('#import-input').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});state_wait("document.querySelector('#toast').innerText.includes('No se pudo importar')");assert page.evaluate(f'{P}.currentContext.id')=='sartre'
 fixture=json.loads(json.dumps(config));fixture['id']='fixture-author';fixture['philosopher']['id']='fixture-author';fixture['philosopher']['name']='Autor de prueba';fixture['title']='Validación por datos'
 for d in fixture['dialogues'].values():
  for n in d['nodes'].values():n['speaker']='Autor de prueba'
 page.locator('#import-input').set_input_files({'name':'fixture.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()});state_wait(f"{P}.currentContext?.id==='fixture-author'");assert not progress('fixture-author')['introComplete'];run('choice-0');run('choice-0');run('choice-0');assert progress('fixture-author')['introComplete'];assert progress()['choices']['young-person-choice']=='care'
 enter_atlas('phenomenology');page.evaluate("() => {document.querySelector('[data-planet=fixture-author]').click();document.querySelector('[data-planet=sartre]').click()}");state_wait(f"{P}.currentContext?.id==='sartre' && {P}.player?.active && !document.querySelector('#veil.visible')");assert progress()['choices']['young-person-choice']=='care';assert page.evaluate(f"{P}.objects.some(o=>o.id==='{object_id}')")
 assert page.evaluate("[localStorage.getItem('sofia_phaser_real_v02'),localStorage.getItem('sofia-polis-radial-v1')]")==legacy
 page.locator('[data-tab="galaxy"]').click();run('legacy');page.locator('[data-world="2"]').click();page.locator('[data-action="explore-world"]').click();ready('World');assert page.evaluate(f'{W}.place')=='modern'
 page.locator('[data-tab="editor"]').click();assert page.locator('#object-kind option[value="vase"]').count()==1;assert page.locator('#object-kind option[value^="asset:"]').count()==0;page.locator('[data-e="close"]').click();report['legacy_editor_after_universal_editor']=True
 report.update(import_images=True,full_world_export=True,invalid_import_rejected=True,second_definition_same_engine=True,latest_selection_wins=True,legacy_saves_preserved=True,browser_errors=errors)
 assert not errors,errors;(OUT/'universe-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
