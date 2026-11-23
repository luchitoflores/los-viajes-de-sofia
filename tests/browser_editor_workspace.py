from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:5173/')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1600,'height':1000});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(URL+'#/edicion?world=plato&scene=fuego');p.wait_for_selector('#core-canvas-toolbar',timeout=120000);p.wait_for_function("window.__sofiaGame?.scene.getScene('World')?.sys.isActive()",timeout=120000);p.wait_for_timeout(1000)
 W="window.__sofiaGame.scene.getScene('World')"
 def pt(x,y):return p.evaluate("([x,y])=>{const s="+W+",c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),t=c.matrix.transformPoint(x-c.scrollX,y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height}}",[x,y])
 def tap(x,y):
  a=pt(x,y);p.mouse.click(a['x'],a['y'])
 n=p.evaluate(W+'.objects.length');p.locator('#object-name').fill('Personaje de prueba');options=p.locator('#object-kind option').evaluate_all("opts=>opts.map(o=>o.value)");character=next((o for o in options if o.startswith('character:')),options[-1]);p.locator('#object-kind').select_option(character);p.locator('#scene-place-resource').click();p.wait_for_timeout(600);tap(430,560);assert p.evaluate(W+'.objects.length')==n+1;tap(650,560);assert p.evaluate(W+'.objects.length')==n+1
 p.evaluate(W+".selectForEdit("+W+".objects.find(o=>o.label==='Personaje de prueba').id)");p.wait_for_timeout(100)
 p.once('dialog',lambda d:d.dismiss());p.locator('#scene-delete').click();assert p.evaluate(W+'.objects.length')==n+1
 p.once('dialog',lambda d:d.accept());p.locator('#scene-delete').click();assert p.evaluate(W+'.objects.length')==n
 p.locator('[data-e="undo"]').click();assert p.evaluate(W+'.objects.length')==n+1
 p.locator('#scene-redo').click();assert p.evaluate(W+'.objects.length')==n
 p.locator('[data-zone-type="solid"]').click();a=pt(600,430);z=pt(680,520);p.mouse.move(a['x'],a['y']);p.mouse.down();p.mouse.move(z['x'],z['y'],steps=8);p.mouse.up();assert p.evaluate(W+".regions.some(r=>r.type==='solid'&&r.x>590)")
 a=p.locator('#core-canvas-toolbar').bounding_box();c=p.locator('#stage').bounding_box();assert a['y']+a['height']<=c['y']+1;p.screenshot(path='captures/editor-reorganizado.png')
 # Touch emulation: add once, then touch somewhere else without duplicating.
 p.locator('[data-edit-mode="object"]').click();p.wait_for_timeout(600);n=p.evaluate(W+'.objects.length');cdp=p.context.new_cdp_session(p);cdp.send('Emulation.setTouchEmulationEnabled',{'enabled':True})
 for x in [760,900]:
  a=pt(x,560);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a['x'],'y':a['y']}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 assert p.evaluate(W+'.objects.length')==n+1;cdp.send('Emulation.setTouchEmulationEnabled',{'enabled':False})
 # Re-entering a scene must not duplicate actions or lose native controls.
 p.locator('#core-scene').select_option('prisioneros');p.wait_for_selector('#scene-place-resource');p.wait_for_timeout(700);assert p.locator('#scene-redo').count()==1;assert p.locator('[data-e="save"]').count()==1
 p.set_viewport_size({'width':932,'height':600});p.wait_for_timeout(500);a=p.locator('#core-canvas-toolbar').bounding_box();c=p.locator('#stage').bounding_box();assert a['y']+a['height']<=c['y']+1;p.screenshot(path='captures/editor-reorganizado-compacto.png');assert not errors,errors
 # Surface uses the same one-shot placement and history, and ignores clicks in forms.
 p.set_viewport_size({'width':1600,'height':1000});p.locator('#core-scene').select_option('surface');p.wait_for_function("window.__sofiaGame.scene.getScene('Planet')?.sys.isActive()",timeout=120000);p.wait_for_timeout(1000);P="window.__sofiaGame.scene.getScene('Planet')";n=p.evaluate(P+'.objects.length');p.locator('[data-edit-mode=object]').click();p.wait_for_timeout(600);p.locator('#object-name').fill('radial');p.locator('#object-name').click();assert p.evaluate(P+'.objects.length')==n
 a=p.evaluate("()=>{const s="+P+",c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),t=c.matrix.transformPoint(s.player.x-c.scrollX,s.player.y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height}}");p.mouse.click(a['x'],a['y']);p.mouse.click(a['x']+30,a['y']);assert p.evaluate(P+'.objects.length')==n+1;p.locator('[data-e=undo]').click();assert p.evaluate(P+'.objects.length')==n;p.locator('#scene-redo').click();assert p.evaluate(P+'.objects.length')==n+1;assert not errors,errors
 p.locator('#core-test-scene').click();p.wait_for_selector('body.core-scene-preview');assert not p.locator('#core-canvas-toolbar').is_visible();p.locator('#core-close-preview').click();p.wait_for_selector('#core-canvas-toolbar');assert p.locator('#scene-redo').count()==1
 print(json.dumps({'scene_trial':True,'radial_insertion_and_history':True,'single_insertion_mouse_touch':True,'delete_confirm_cancel':True,'undo_redo':True,'rectangle':True,'toolbar_outside_canvas':True,'scene_remount':True,'errors':errors}));b.close()
