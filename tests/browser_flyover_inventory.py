from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
P="window.__sofiaGame.scene.getScene('Planet')";F="window.__sofiaGame.scene.getScene('Spaceflight')"
OUT=Path('captures');OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':960},has_touch=True)
 seed={'version':1,'last':'earth','worlds':{'earth':{'introComplete':True,'flags':['camera-introduction-seen']},'plato':{'introComplete':False,'planet':{'collected':['vase']}},'sartre':{'introComplete':True}}}
 context.add_init_script("if(!localStorage.getItem('flyover-test')){localStorage.setItem('flyover-test','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify("+json.dumps(seed)+"))}")
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4181/'),wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=120000);page.locator('[data-action="continue-mode"]').click()
 def point(id):
  return page.evaluate(f"id=>{{const s={P},v=s.hotspots.get(id).getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(v.x-c.scrollX,v.y-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}",id)
 for target,direction in [('sartre',1),('earth',-1),('plato',1)]:
  page.wait_for_function(P+'.player?.active&&'+P+'.sys.isActive()',timeout=60000)
  page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship');s.cancelWalk();s.bodyState.angle=(o.angleDeg+10)*Math.PI/180}}")
  page.wait_for_timeout(1500);ship=page.evaluate(P+".objects.find(o=>o.kind==='ship').id");q=point(ship)
  (page.mouse.click if direction==1 else page.touchscreen.tap)(q['x'],q['y']);page.wait_for_selector('[data-planet="'+target+'"]',timeout=30000);page.locator('[data-planet="'+target+'"]').click()
  page.wait_for_function(F+'.sys.isActive()',timeout=30000);assert page.evaluate(F+'.direction')==direction
  if target!='plato':
   page.wait_for_function(F+".currentStop==='plato'",timeout=15000);assert page.evaluate(F+".children.list.some(o=>o.getData('flyover-world')==='plato')")
   page.wait_for_timeout(500);page.screenshot(path=str(OUT/f'flyover-{target}.png'))
  page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
  assert page.evaluate(F+'.overflown')==([] if target=='plato' else ['plato'])
  if target!='plato':assert not page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1')).worlds.plato.introComplete")
  print(target+' flight verified',flush=True)
 # Meet the host only after actually landing: flying over it did not do this.
 page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.id==='philosopher');s.cancelWalk();s.bodyState.angle=(o.angleDeg+5)*Math.PI/180}}")
 page.wait_for_timeout(1000);q=point('philosopher');page.mouse.click(q['x'],q['y']);page.wait_for_selector('#veil.world-dialog.visible',timeout=20000)
 for _ in range(16):
  if not page.locator('#veil.visible').count():break
  page.keyboard.press('Enter');page.wait_for_timeout(70)
 # The earlier vase appears while the newly collected scroll executes its real action.
 page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.id==='scroll');s.cancelWalk();s.bodyState.angle=(o.angleDeg+5)*Math.PI/180}}")
 page.wait_for_timeout(1200);q=point('scroll');page.mouse.click(q['x'],q['y']);page.wait_for_selector('#veil.world-dialog.visible',timeout=20000)
 for _ in range(8):
  if not page.locator('#veil.visible').count():break
  page.keyboard.press('Enter');page.wait_for_timeout(70)
 page.locator('[data-tab="inventory"]').click();page.wait_for_selector('[data-inventory]');assert page.locator('[data-inventory]').count()==2
 page.locator('[data-inventory]').filter(has_text='Pergamino de preguntas').click();assert 'razones' in page.locator('#panel').inner_text();page.locator('#inventory-back').click()
 page.locator('[data-inventory]').filter(has_text='Ánfora').click();assert 'muchas maneras' in page.locator('#panel').inner_text();page.screenshot(path=str(OUT/'inventory-object-meaning.png'));page.locator('#collection-close').click()
 # Reorder through the real editor and save; reload must preserve it.
 page.locator('[data-tab="editor"]').click();page.wait_for_selector('#travel-order-editor summary');page.locator('#travel-order-editor summary').click()
 page.locator('[data-reorder="sartre"][data-step="1"]').click();page.locator('#core-play').click();page.wait_for_selector('dialog[open]');page.locator('[data-exit="save"]').click();page.wait_for_function("!document.body.classList.contains('core-mode')",timeout=30000)
 page.reload(wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=120000);page.locator('[data-action="continue-mode"]').click()
 page.locator('[data-tab="galaxy"]').click();page.wait_for_selector('[data-planet="sartre"]');ids=page.locator('[data-planet]').evaluate_all('(els)=>els.map(e=>e.dataset.planet)');assert ids[:4]==['earth','plato','camus','sartre'],ids;page.locator('[data-run="resume"]').click()
 page.set_viewport_size({'width':932,'height':430});page.wait_for_timeout(500);page.locator('[data-tab="inventory"]').tap();page.wait_for_selector('[data-inventory]');assert page.locator('[data-inventory]').count()==2
 page.screenshot(path=str(OUT/'inventory-landscape.png'));assert not errors,errors
 print('Inventory, real collect, reload, editable travel order and emulated landscape touch verified',flush=True);browser.close()
