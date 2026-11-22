from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,math
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173');OUT=Path('captures');OUT.mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')"
errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True);page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 def ready(scene):page.wait_for_function(f"window.__sofiaGame?.scene.isActive('{scene}')&&window.__sofiaGame.scene.getScene('{scene}').player?.active",timeout=120000)
 def point(scene,x,y):return page.evaluate(f"()=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 def click(scene,x,y,touch=False):
  q=point(scene,x,y);(page.touchscreen.tap if touch else page.mouse.click)(q['x'],q['y'])
 def exported():
  with page.expect_download() as d:page.locator('#world-export-all').click()
  return json.loads(Path(d.value.path()).read_text(encoding='utf-8'))
 page.goto(URL,wait_until='domcontentloaded');ready('Planet');page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;page.wait_for_timeout(400)
 start=page.evaluate(P+".views.get('philosopher').x");page.keyboard.down('ArrowRight');page.wait_for_timeout(1500);page.keyboard.up('ArrowRight');page.wait_for_timeout(300)
 assert abs(page.evaluate(P+".views.get('philosopher').x")-start)<.01;assert page.evaluate(P+".companion===undefined");report['philosopher_stays_at_encounter']=True
 page.locator('[data-tab="editor"]').click();page.locator('#world-library').click();page.locator('[data-library-asset="cast-plat"]').click();page.wait_for_timeout(400)
 assert page.locator('#object-kind option[value="asset:cast-plat"]').count()==1;report['legacy_shared_library']=True
 page.locator('#world-new').click();page.locator('#new-world-title').fill('Mundo del editor');page.locator('#new-world-author').fill('Autor de prueba');page.locator('#new-world-author-id').fill('editor-test-author');page.locator('#new-world-cast').select_option('plat');page.locator('#new-world-intro').fill('Esta es una presentación de prueba del editor.');page.locator('#new-world-form button[type="submit"]').click()
 page.wait_for_function(f"{P}.sys.isActive() && {P}.objects[0]?.label==='Autor de prueba'",timeout=60000);page.wait_for_selector('#world-new-interior');assert page.locator('#editor').is_visible();report['create_world_from_form']=True
 page.locator('#world-library').click();page.locator('#library-search').fill('Ánfora');page.locator('[data-library-asset="stock-vase"]').click();page.wait_for_selector('#world-new-interior');page.wait_for_timeout(600)
 page.locator('#object-kind').select_option('asset:stock-vase');page.locator('#object-name').fill('Ánfora del recuerdo');page.locator('[data-tool="object"]').click();click(P,490,-85);page.wait_for_timeout(300)
 page.locator('#radial-label').fill('Ánfora de mis preguntas');page.locator('#radial-label').press('Tab');assert page.evaluate(P+".objects.some(o=>o.label==='Ánfora de mis preguntas')");report['place_and_rename_object']=True
 page.locator('#world-resource-name').fill('Mi pergamino');page.locator('#world-import-sprite').click();page.locator('#world-image-file').set_input_files('public/assets/polis-scroll.png');page.wait_for_timeout(1000);page.wait_for_selector('#world-new-interior');page.wait_for_function("[...document.querySelectorAll('#object-kind option')].some(o=>o.text==='Mi pergamino')",timeout=20000);report['named_image_import']=True
 page.locator('#world-new-interior').click();page.locator('#new-interior-name').fill('Biblioteca propia');page.locator('#new-interior-background').select_option('background-library');page.locator('#new-interior-form button[type="submit"]').click();ready('World');page.wait_for_function(W+".dataDef.name==='Biblioteca propia'",timeout=30000);page.wait_for_selector('#world-new-interior');report['create_interior_in_editor']=True
 page.locator('#object-kind').select_option('asset:stock-vase');page.locator('#object-name').fill('Objeto interior táctil');page.locator('[data-tool="object"]').click();click(W,650,470,True);page.wait_for_timeout(300);assert page.evaluate(W+".objects.some(o=>o.label==='Objeto interior táctil')");report['touch_place_interior_object']=True
 page.locator('#world-new-interior').click();page.locator('#new-interior-name').fill('Cueva interior');page.locator('#new-interior-background').select_option('background-shadows');page.locator('#new-interior-form button[type="submit"]').click();page.wait_for_function(W+".dataDef.name==='Cueva interior'",timeout=30000);page.wait_for_selector('#world-room-settings');page.locator('#world-room-settings').click();page.locator('#scene-name').fill('Cueva de las preguntas');page.locator('#scene-background-file').set_input_files('public/assets/polis-cave-shadows-v3.png');page.locator('#scene-settings-form button[type="submit"]').click();page.wait_for_function(W+".dataDef.name==='Cueva de las preguntas'",timeout=30000)
 data=exported();world_id=data['id'];rooms={i['name']:key for key,i in data['interiors'].items()};assert len(rooms)==2;assert any(o['label']=='Ánfora de mis preguntas' for o in data['surface']['objects']);assert data['interiors'][rooms['Cueva de las preguntas']]['background'].startswith('background-');report['nested_interior_and_background_import']=True
 page.screenshot(path=str(OUT/'editor-interiores.png'))
 # The first preview still requires the authored introduction.
 page.locator('[data-e="close"]').click();page.wait_for_selector('[data-run="choice-0"]');page.locator('[data-run="choice-0"]').click();page.wait_for_timeout(300)
 # Re-enter the first room from its surface door through a real click.
 page.locator('[data-tab="editor"]').click();page.locator('#world-edit-surface').click();ready('Planet');page.wait_for_timeout(600);page.locator('[data-e="close"]').click();page.evaluate(f"()=>{{const s={P};s.bodyState.angle=35*Math.PI/180;s.cancelWalk()}}");page.wait_for_timeout(700)
 door='door-'+rooms['Biblioteca propia'];z=page.evaluate(f"{P}.hotspots.get('{door}').getCenter()");click(P,z['x'],z['y']);page.wait_for_function(W+".sys.isActive()&&"+W+".dataDef.name==='Biblioteca propia'",timeout=30000)
 # Walk to the next door and enter, then return via the HUD to its actual origin.
 page.keyboard.down('ArrowRight');page.wait_for_function(W+".player.x>1100",timeout=20000);page.keyboard.up('ArrowRight');page.wait_for_timeout(200)
 door2='door-'+rooms['Cueva de las preguntas'];z=page.evaluate(f"{W}.propViews.find(v=>v.id==='{door2}'&&v.obj.type==='Zone').obj.getCenter()");click(W,z['x'],z['y']);page.wait_for_function(W+".dataDef.name==='Cueva de las preguntas'",timeout=30000)
 page.reload(wait_until='domcontentloaded');ready('World');page.wait_for_function(W+".dataDef.name==='Cueva de las preguntas'",timeout=30000);page.locator('#planet-exit').click();page.wait_for_function(W+".dataDef.name==='Biblioteca propia'",timeout=30000);assert page.evaluate(W+".player.x")>1000;page.locator('#planet-exit').click();ready('Planet');assert abs(page.evaluate(P+".bodyState.angle")-35*math.pi/180)<.03;report['nested_return_survives_reload']=True
 page.locator('[data-tab="editor"]').click();page.locator('#world-library').click();assert page.locator('[data-library-asset] span',has_text='Mi pergamino').count()>=1;page.locator('[data-run="close-library"]').click();page.locator('#world-new').click();page.locator('#new-world-title').fill('Duplicado');page.locator('#new-world-author').fill('Autor de prueba');page.locator('#new-world-author-id').fill('editor-test-author');page.locator('#new-world-form button[type="submit"]').click();page.wait_for_function("document.querySelector('#authoring-error').textContent.length>0");report['duplicate_author_rejected']=True
 # Old cave saves: stepping back traverses scenes instead of exiting straight to the planet.
 old=b.new_context(viewport={'width':1440,'height':960});old.add_init_script("localStorage.setItem('sofia_phaser_real_v02',JSON.stringify({level:'ascent',flags:{intro:true,freed:true,caveKey:true}}));")
 # Let the radial parser supply the default objects; establish its real entrance anchor after startup.
 q=old.new_page();q.on('pageerror',lambda e:errors.append(str(e)));q.goto(URL,wait_until='domcontentloaded');q.wait_for_function("window.__sofiaGame?.scene.getScene('World')?.place==='ascent'&&window.__sofiaGame.scene.getScene('World').player?.active",timeout=120000)
 q.locator('[data-action="start"]').click();q.locator('[data-run="choice-0"]').click() if q.locator('[data-run="choice-0"]').count() else None;q.locator('#planet-exit').click();q.wait_for_function("window.__sofiaGame.scene.getScene('World').place==='shadows'&&window.__sofiaGame.scene.getScene('World').player?.active",timeout=30000);assert q.evaluate(W+'.player.x')>1500
 q.locator('#planet-exit').click();q.wait_for_function("window.__sofiaGame.scene.getScene('World').place==='entrance'&&window.__sofiaGame.scene.getScene('World').player?.active",timeout=30000);assert q.evaluate(W+'.player.x')>1400;report['legacy_cave_backtracking']=True
 q.screenshot(path=str(OUT/'caverna-regreso-secuencial.png'));assert not errors,errors;report['browser_errors']=errors;(OUT/'authoring-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
