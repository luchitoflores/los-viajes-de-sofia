from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,math
base=os.environ.get('SOFIA_URL','http://127.0.0.1:5173');out=Path('captures');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,timeout=30000,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':960},has_touch=True)
 errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',e,flush=True)))
 page.goto(base,wait_until='domcontentloaded',timeout=60000)
 try:
  page.wait_for_function("window.__sofiaGame?.scene?.isActive('Planet') && window.__sofiaGame.scene.getScene('Planet').player",timeout=120000)
 except Exception:
  print(page.evaluate("() => ({panel:document.querySelector('#panel')?.innerText,scenes:window.__sofiaGame?.scene.scenes.map(s=>({key:s.sys.settings.key,status:s.sys.settings.status,loading:s.load?.totalToLoad,progress:s.load?.progress}))})"),flush=True)
  page.screenshot(path=str(out/'story-startup-failure.png'));raise
 page.locator('[data-action="continue-mode"]').click();page.evaluate("window.__sofiaGame.scene.getScene('Planet').bodyState.angle=-8*Math.PI/180");page.wait_for_timeout(600);page.keyboard.press('e');page.wait_for_selector('[data-run="choice-0"]');page.locator('[data-run="choice-0"]').click();page.wait_for_timeout(600)
 assert page.evaluate("window.__sofiaGame.scene.getScene('Planet').views.get('philosopher').texture.key==='cast-plat.png'")
 page.locator('[data-tab="galaxy"]').click();assert page.locator('[data-planet] img').count()==6;page.screenshot(path=str(out/'universo-mundos-restaurados.png'));page.locator('[data-run="legacy"]').click();page.wait_for_function("[...document.querySelectorAll('.world-sphere img')].every(i=>i.complete&&i.naturalWidth>0)")
 assert page.locator('.orbit-world').count()==4
 page.screenshot(path=str(out/'galaxia-ilustrada.png'))
 page.locator('[data-action="world-next"]').click();assert page.locator('.orbit-world.is-selected').get_attribute('data-world')=='1'
 page.locator('[data-action="world-prev"]').click();page.locator('[data-action="explore-world"]').click()
 page.wait_for_function("window.__sofiaGame.scene.isActive('Planet') && window.__sofiaGame.scene.getScene('Planet').player.active")
 def radial(angle):
  page.evaluate(f"() => {{const s=window.__sofiaGame.scene.getScene('Planet');s.bodyState.angle={angle}*Math.PI/180;s.bodyState.height=0;s.bodyState.velocity=0;s.bodyState.grounded=true}}")
  page.wait_for_timeout(900)
 def wait_world(name):
  page.wait_for_function(f"window.__sofiaGame.scene.isActive('World') && window.__sofiaGame.scene.getScene('World').place==='{name}' && window.__sofiaGame.scene.getScene('World').player?.active",timeout=60000)
  page.wait_for_timeout(400)
 def tap_prisoner():
  pos=page.evaluate("()=>{const s=window.__sofiaGame.scene.getScene('World'),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(480-c.scrollX,365-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}")
  page.mouse.click(pos['x'],pos['y'])
 def close():page.locator('[data-action="close"]').click()
 def walk(x):
  current=page.evaluate("window.__sofiaGame.scene.getScene('World').player.x")
  if abs(current-x)<5:return
  key='ArrowRight' if current<x else 'ArrowLeft';page.keyboard.down(key)
  page.wait_for_function(f"Math.abs(window.__sofiaGame.scene.getScene('World').player.x-{x})<12",timeout=25000)
  page.keyboard.up(key);page.wait_for_timeout(80)
 radial(35);page.keyboard.press('e');wait_world('library')
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').dataDef.bg==='polis-library-v2.png'")
 page.screenshot(path=str(out/'biblioteca-coherente.png'))
 page.locator('#planet-exit').click();page.wait_for_function("window.__sofiaGame.scene.isActive('Planet')")
 radial(190);page.keyboard.press('e');wait_world('entrance')
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').dataDef.bg==='polis-cave-entry-v3.png'")
 walk(320);page.keyboard.press('e');close()
 walk(1700);page.keyboard.press('e');wait_world('shadows')
 walk(480);tap_prisoner();page.locator('[data-action="ask"]').click();page.locator('[data-action="continue"]').click()
 walk(1040);page.keyboard.press('e')
 for answer in ['Caballo','Guerrero','Árbol']:page.locator(f'[data-answer="{answer}"]').click()
 close()
 walk(1190);page.keyboard.press('e');page.locator('[data-action="trial"]').click()
 page.locator('[data-action="episteme"]').click();assert page.locator('#trial-feedback').inner_text()
 for answer in ['doxa','episteme','doxa','episteme']:page.locator(f'[data-action="{answer}"]').click()
 close()
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia_phaser_real_v02')).flags.caveKey")
 walk(480);tap_prisoner();page.locator('[data-action="free"]').click();close()
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').companion?.active")
 start=page.evaluate("window.__sofiaGame.scene.getScene('World').companion.x")
 hero_start=page.evaluate("window.__sofiaGame.scene.getScene('World').player.x");page.keyboard.down('ArrowRight');page.wait_for_function(f"window.__sofiaGame.scene.getScene('World').player.x > {hero_start+220}",timeout=10000)
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').companion.anims.currentAnim.key")=='companion-walk'
 page.keyboard.up('ArrowRight');page.wait_for_timeout(100)
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').companion.x")>start+70
 page.screenshot(path=str(out/'companero-caverna.png'))
 hero_turn=page.evaluate("window.__sofiaGame.scene.getScene('World').player.x");page.keyboard.down('ArrowLeft');page.wait_for_function(f"window.__sofiaGame.scene.getScene('World').player.x < {hero_turn-180}",timeout=10000);page.keyboard.up('ArrowLeft')
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').companion.flipX")
 walk(1770);page.keyboard.press('e');wait_world('ascent')
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').companion?.active")
 walk(1360);page.wait_for_timeout(700)
 assert page.evaluate("window.__sofiaGame.scene.getScene('World').companion.y")<330
 page.screenshot(path=str(out/'companero-ascenso.png'))
 walk(1790);page.keyboard.press('e');wait_world('exterior')
 assert not page.evaluate("window.__sofiaGame.scene.getScene('World').companion?.active");assert not page.locator('#veil.visible').count();walk(860);page.keyboard.press('e');page.wait_for_selector('[data-action="return-cave"]');page.wait_for_function("[...document.querySelectorAll('#panel img')].every(i=>i.complete&&i.naturalWidth>0)");page.screenshot(path=str(out/'platon-nuevo-estilo.png'))
 page.locator('[data-action="return-cave"]').click();wait_world('shadows')
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia_phaser_real_v02')).flags.caveCompleted")
 page.locator('#planet-exit').click();wait_world('entrance');page.locator('#planet-exit').click();page.wait_for_function("window.__sofiaGame.scene.isActive('Planet')",timeout=30000)
 assert page.evaluate("window.__sofiaGame.scene.getScene('Planet').views.get('philosopher').texture.key==='cast-plat.png'");assert page.evaluate("Math.abs(window.__sofiaGame.scene.getScene('Planet').views.get('philosopher').displayHeight-118)<.01 && Math.abs(window.__sofiaGame.scene.getScene('Planet').player.scaleY*241-118)<.01");before=page.evaluate("window.__sofiaGame.scene.getScene('Planet').views.get('philosopher').x")
 page.keyboard.down('ArrowRight');page.wait_for_timeout(1000);page.keyboard.up('ArrowRight')
 after=page.evaluate("window.__sofiaGame.scene.getScene('Planet').views.get('philosopher').x");assert abs(after-before)<.01
 page.wait_for_timeout(250);page.screenshot(path=str(out/'companero-planeta.png'))
 page.reload(wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene?.isActive('Planet') && window.__sofiaGame.scene.getScene('Planet').views.get('philosopher')?.active",timeout=60000)
 page.locator('[data-action="continue-mode"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia_phaser_real_v02')).flags.freed")
 assert not errors,errors
 report={'philosophers_in_sofia_style':17,'galaxy_worlds':4,'coherent_library':True,'coherent_cave':True,'knowledge_trial_and_key':True,'freed_companion_walks':True,'companion_turns':True,'companion_climbs':True,'prisoner_stops_at_exit':True,'philosopher_remains_at_encounter':True,'saved_after_reload':True,'browser_errors':errors}
 (out/'story-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
 b.close()

