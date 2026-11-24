from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:5177/')
W="window.__sofiaGame.scene.getScene('World')"
Path('captures').mkdir(exist_ok=True)
report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1600,'height':1000},has_touch=True)
 p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(URL+'#/dialogos?world=plato&scene=entrada')
 p.locator('[data-scene-dialogue="entrada-observacion"] [data-edit-dialogue]').first.click(timeout=120000)
 p.wait_for_selector('.dialogue-workspace');print('visual opened',flush=True)
 p.locator('[data-inline-text]').first.fill('Texto escrito directamente en un bloque visual.')
 assert p.locator('#dialogue-body').input_value().startswith('Texto escrito')
 p.locator('[data-palette=line]').click();p.locator('[data-inline-text]').last.fill('Respuesta de Sofía.')
 p.locator('[data-copy-turn]').click();assert p.locator('[data-turn-id]').count()==3
 p.locator('[data-undo]').click();assert p.locator('[data-turn-id]').count()==2
 p.locator('[data-redo]').click();assert p.locator('[data-turn-id]').count()==3
 ids=p.locator('[data-turn-id]').evaluate_all('(rows)=>rows.map(r=>r.dataset.turnId)')
 p.locator('[data-drag="'+ids[2]+'"]').drag_to(p.locator('[data-turn-id="'+ids[1]+'"]'))
 assert p.locator('[data-turn-id]').evaluate_all('(rows)=>rows.map(r=>r.dataset.turnId)')==[ids[0],ids[2],ids[1]]
 p.locator('[data-select-turn="'+ids[0]+'"]').click()
 print('drag and history passed',flush=True);p.locator('[data-preview-current]').click();p.wait_for_selector('#dialogue-text',timeout=120000)
 assert p.locator('#dialogue-text').get_attribute('aria-label').startswith('Texto escrito')
 p.locator('#core-close-preview').click()
 assert p.locator('[data-turn-id]').count()==3
 p.locator('#dialogue-form button[type=submit]').click()
 p.wait_for_selector('#scene-dialogue-edit:empty',state='attached')
 report['inline_text_drag_duplicate_undo_redo_preview_and_save']=True;print('saved and preview passed',flush=True)
 p.goto(URL+'#/dialogos?world=plato&scene=prisioneros')
 p.locator('[data-scene-dialogue="prisionero"] [data-edit-dialogue]').first.click(timeout=120000)
 p.locator('.dialogue-moments [data-moment="libre"]').click()
 assert p.locator('#dialogue-node').input_value()=='libre'
 p.locator('.dialogue-moments + div > details > summary').click()
 p.locator('[data-moment-name]').fill('Después de quedar libre')
 p.locator('[data-apply-moment]').click()
 assert 'Después de quedar libre' in p.locator('.dialogue-moments').inner_text()
 assert p.locator('.dialogue-connections [data-destination]').count()>0
 p.screenshot(path='captures/dialogue-visual-desktop.png',full_page=True)
 p.set_viewport_size({'width':932,'height':430})
 p.locator('.dialogue-moments [data-moment="libre"]').tap()
 assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 p.screenshot(path='captures/dialogue-visual-mobile.png')
 report['conditional_moments_branch_destinations_and_landscape_touch']=True;print('moments and touch passed',flush=True)
 p.locator('#studio-back-list').click()
 p.locator('[data-scene-dialogue=prisionero] [data-copy-dialogue]').first.click()
 assert 'Copia' in p.locator('#dialogue-title').input_value()
 assert p.locator('[data-turn-id]').count()>=10
 p.locator('[data-run=cancel-authoring]').click()
 p.goto(URL+'#/edicion?world=plato&scene=agora')
 p.locator('#core-test-scene').click(timeout=120000)
 p.wait_for_function(W+'.player?.active&&!document.querySelector("#veil.visible")',timeout=120000)
 p.wait_for_timeout(500)
 floor=p.evaluate(W+'.groundAt('+W+'.player.x)')
 p.keyboard.down('Space');p.wait_for_timeout(220)
 assert p.evaluate(W+'.jumpState.airborne')
 assert p.evaluate(W+'.player.y')<floor-35
 assert 'sofia-jump' in p.evaluate(W+'.player.texture.key')
 p.screenshot(path='captures/sofia-interior-jump.png')
 p.wait_for_timeout(1200);assert not p.evaluate(W+'.jumpState.airborne');assert abs(p.evaluate(W+'.player.y')-floor)<2
 p.keyboard.up('Space');p.wait_for_timeout(100)
 # Actual emulated touch on empty ground: no menu event is injected into the scene.
 point=p.evaluate("()=>{const s="+W+",r=s.game.canvas.getBoundingClientRect(),c=s.cameras.main,q=c.matrix.transformPoint(220-c.scrollX,650-c.scrollY);return{x:r.left+q.x*r.width/s.scale.width,y:r.top+q.y*r.height/s.scale.height}}")
 p.touchscreen.tap(point['x'],point['y']);p.wait_for_timeout(80);p.touchscreen.tap(point['x'],point['y']);p.wait_for_timeout(160)
 assert p.evaluate(W+'.jumpState.airborne')
 p.wait_for_timeout(1200);assert not p.evaluate(W+'.jumpState.airborne')
 p.locator('#core-close-preview').click()
 report['space_jump_animation_landing_hold_and_double_touch']=True
 p.goto(URL+'#/edicion?world=plato&scene=ascenso');p.wait_for_function("document.querySelector('#core-scene')?.value==='ascenso'");p.locator('#core-test-scene').click(timeout=120000);p.wait_for_function(W+".dataDef.name.startsWith('D ·')&&document.body.classList.contains('core-scene-preview')");p.keyboard.down('ArrowRight');p.wait_for_function(W+'.player.x>1060',timeout=20000);p.keyboard.up('ArrowRight');assert p.evaluate(W+'.player.x')>1060;assert abs(p.evaluate(W+'.player.y')-210)<2;report['imported_ascent_is_walkable_without_jump']=True;p.screenshot(path='captures/ascent-author-export.png')
 assert not errors,errors
 report.update(browser_errors=errors,physical_phone_tested=False)
 Path('captures/visual-dialogue-jump-validation.json').write_text(json.dumps(report,indent=2))
 print(json.dumps(report),flush=True);b.close()
