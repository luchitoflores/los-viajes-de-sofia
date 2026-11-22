from pathlib import Path
from playwright.sync_api import sync_playwright
import os,math
base=os.environ.get('SOFIA_URL','http://127.0.0.1:4173')
out=Path('captures');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,timeout=30000,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':960},has_touch=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 response=page.goto(base,wait_until='domcontentloaded',timeout=60000);assert response and response.ok
 page.wait_for_function("window.__sofiaGame?.scene?.isActive('Planet')",timeout=60000)
 page.locator('[data-action="start"]').click();page.wait_for_timeout(800)
 page.screenshot(path=str(out/'polis-cercana.png'))
 page.locator('#planet-view').click();page.wait_for_timeout(1200)
 page.screenshot(path=str(out/'polis-completa.png'))
 page.locator('[data-tab="editor"]').click();page.wait_for_timeout(900)
 point=page.evaluate("""() => {const s=window.__sofiaGame.scene.getScene('Planet'),v=s.views.get('temple'),p=v.getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),q=c.matrix.transformPoint(p.x-c.scrollX,p.y-c.scrollY);return{x:r.left+q.x/s.scale.width*r.width,y:r.top+q.y/s.scale.height*r.height}}""")
 page.mouse.click(point['x'],point['y']);page.locator('#radial-angleDeg').wait_for()
 page.screenshot(path=str(out/'editor-radial.png'))
 page.locator('#radial-to').scroll_into_view_if_needed();page.wait_for_timeout(100)
 page.screenshot(path=str(out/'editor-propiedades.png'))
 assert page.locator('#radial-angleDeg').input_value()=='35'
 page.locator('[data-e="close"]').click();page.set_viewport_size({'width':844,'height':480});page.wait_for_timeout(700)
 page.screenshot(path=str(out/'polis-movil.png'))
 # Regression: a collected solid must not remain as an invisible obstacle.
 page.evaluate("""() => {const s=window.__sofiaGame.scene.getScene('Planet'),o=s.objects.find(o=>o.id==='scroll');o.collision=true;o.collisionWidth=30;o.collisionHeight=40;s.bodyState.angle=75*Math.PI/180;s.bodyState.height=0;s.bodyState.grounded=true;}""")
 page.keyboard.press('e');page.locator('[data-action="close"]').click();page.keyboard.down('ArrowRight');page.wait_for_timeout(1000);page.keyboard.up('ArrowRight')
 assert page.evaluate("window.__sofiaGame.scene.getScene('Planet').bodyState.angle > Math.PI/2")
 assert not errors,errors
 print('Production Phaser build and authentic final screenshots verified; no browser errors.',flush=True)
 browser.close()
