from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
P="window.__sofiaGame.scene.getScene('Planet')";KEY='sofia-universe-progress-v1';report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True)
 ctx.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');if(!localStorage.getItem('enter-fixture')){localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'sartre',worlds:{}}));localStorage.setItem('enter-fixture','1')}")
 page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000);page.locator('[data-action="continue-mode"]').click()
 page.evaluate(P+'.bodyState.angle=-8*Math.PI/180');page.wait_for_timeout(750);page.keyboard.press('e');page.wait_for_selector('#dialogue-text')
 def state():return page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}')).worlds.sartre")
 def reveal():
  text=page.locator('#dialogue-text')
  if text.count() and text.inner_text()!=text.get_attribute('aria-label'):
   before=state()['cursors'];page.keyboard.press('Enter');assert text.inner_text()==text.get_attribute('aria-label');assert state()['cursors']==before
 for _ in range(12):
  reveal()
  if page.locator('#panel button:not([hidden])').count()>1:break
  page.keyboard.press('Enter')
 else:raise AssertionError('No se encontró una bifurcación')
 before=state()['cursors'];page.keyboard.press('Enter');assert page.locator('[data-run="choice-0"]').evaluate('b=>b===document.activeElement');assert state()['cursors']==before
 page.keyboard.press('Tab');assert page.locator('[data-run="choice-1"]').evaluate('b=>b===document.activeElement');page.keyboard.press('Enter');report['tab_and_enter_choose_branch']=True
 before=state()['cursors'];page.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',repeat:true,bubbles:true,cancelable:true}))");assert state()['cursors']==before;report['held_enter_does_not_skip']=True
 for _ in range(50):
  if not page.locator('#veil.visible').count():break
  reveal();page.keyboard.press('Enter')
 else:raise AssertionError('Enter no termina la conversación')
 assert state()['introComplete'];report['text_reveal_single_lines_and_feedback_advance']=True
 page.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',repeat:true,bubbles:true,cancelable:true}))");assert not page.locator('#veil.visible').count();report['held_enter_does_not_reopen']=True
 page.locator('#pause').click();page.locator('[data-action="restart-menu"]').click();page.locator('[data-action="restart-world"]').click();assert page.locator('[data-action="cancel-restart"]').evaluate('b=>b===document.activeElement');page.keyboard.press('Enter');assert state()['introComplete'];assert not page.locator('#veil.visible').count();report['restart_native_cancel_focus_preserved']=True
 page.locator('#pause').click();box=page.locator('[data-action="continue"]').bounding_box();page.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2);assert not page.locator('#veil.visible').count();report['mouse_and_emulated_touch_preserved']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/dialogue-enter-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report),flush=True);b.close()
