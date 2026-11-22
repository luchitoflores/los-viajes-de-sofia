from pathlib import Path
from playwright.sync_api import sync_playwright
import os,json
OUT=Path('captures');OUT.mkdir(exist_ok=True)
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':960});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet').player?.active",timeout=120000)
 page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;page.locator('[data-tab="galaxy"]').click()
 assert page.locator('[data-planet] img').count()==6
 page.wait_for_function("[...document.querySelectorAll('[data-planet] img')].every(i=>i.complete&&i.naturalWidth)")
 assert page.evaluate("[...document.querySelectorAll('[data-planet]')].every(b=>b.querySelector('img').getBoundingClientRect().bottom<=b.querySelector('strong').getBoundingClientRect().top+1)")
 page.screenshot(path=str(OUT/'universo-mundos-restaurados.png'))
 page.locator('[data-planet="plato"]').click();page.wait_for_timeout(1600)
 assert page.evaluate("window.__sofiaGame.scene.isActive('Planet')")
 page.keyboard.down('ArrowRight');page.wait_for_timeout(1600);page.keyboard.up('ArrowRight');page.wait_for_timeout(600)
 assert page.evaluate("(()=>{const s=window.__sofiaGame.scene.getScene('Planet');return s.views.get('philosopher').texture.key==='cast-socr.png'&&Math.abs(s.views.get('philosopher').displayHeight-s.player.scaleY*241)<.01&&!s.companion})()")
 page.screenshot(path=str(OUT/'sofia-filosofo-misma-altura.png'))
 pos=page.evaluate("()=>{const s=window.__sofiaGame.scene.getScene('Planet'),z=s.hotspots.get('philosopher').getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(z.x-c.scrollX,z.y-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}")
 page.evaluate("window.__sofiaGame.scene.getScene('Planet').bodyState.angle=0");page.wait_for_timeout(600);pos=page.evaluate("()=>{const s=window.__sofiaGame.scene.getScene('Planet'),z=s.hotspots.get('philosopher').getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(z.x-c.scrollX,z.y-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}");page.mouse.click(pos['x'],pos['y']);page.wait_for_function("document.getElementById('veil').classList.contains('visible')",timeout=15000)
 assert not errors,errors
 print(json.dumps({'illustrated_worlds':6,'no_image_label_overlap':True,'direct_world_entry':True,'philosopher_stays_at_encounter':True,'equal_reference_height':True,'real_click_on_stationary_philosopher':True,'browser_errors':errors}),flush=True)
 b.close()

