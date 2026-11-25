from playwright.sync_api import sync_playwright
import json,os
P="window.__sofiaGame.scene.getScene('Planet')";F="window.__sofiaGame.scene.getScene('Spaceflight')"
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':960},has_touch=True)
 c.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'earth',worlds:{earth:{introComplete:true,flags:['camera-introduction-seen']},plato:{introComplete:true}}}))")
 p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4181/'),wait_until='domcontentloaded');p.wait_for_selector('[data-action="continue-mode"]',timeout=120000);p.locator('[data-action="continue-mode"]').click()
 for target,direction in [('plato',1),('earth',-1)]:
  p.wait_for_function(P+'.player?.active&&'+P+'.sys.isActive()',timeout=60000)
  p.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship');s.cancelWalk();s.bodyState.angle=(o.angleDeg+10)*Math.PI/180}}")
  p.wait_for_timeout(1500)
  q=p.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship'),v=s.hotspots.get(o.id).getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(v.x-c.scrollX,v.y-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
  (p.mouse.click if direction==1 else p.touchscreen.tap)(q['x'],q['y'])
  p.wait_for_selector('[data-planet="'+target+'"]',timeout=30000);p.locator('[data-planet="'+target+'"]').click()
  p.wait_for_function(F+'.sys.isActive()',timeout=30000);assert p.evaluate(F+'.direction')==direction
  p.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
  print(target+': direction '+str(direction)+' verified',flush=True)
 assert not errors,errors
 b.close()
