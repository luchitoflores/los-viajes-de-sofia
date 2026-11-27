"""Isolated profiles: walking passages, nonblocking notices, landscape and portrait."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4174/')
W="window.__sofiaGame.scene.getScene('World')"
OUT=Path('captures');OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 for mobile in [False,True]:
  context=browser.new_context(viewport={'width':932 if mobile else 1600,'height':430 if mobile else 800},has_touch=True,reduced_motion='reduce')
  fixture={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'fuego','interiorX':1100,'flags':['lampara_encendida','caverna_acceso_autorizado','primer_ascenso_completado'],'equipment':{'lamp':{'equipped':True,'on':True}},'trail':[{'interior':'prisioneros','x':1100}]}}}
  context.add_init_script("if(!localStorage.getItem('passage-fixture')){localStorage.setItem('passage-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',"+json.dumps(json.dumps(fixture))+")}")
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def room(key):page.wait_for_function(W+f".sys.isActive()&&{W}.dataDef.name.startsWith('{key} ·')",timeout=25000);page.wait_for_timeout(250)
  def click_world(x,y):
   q=page.evaluate(f"p=>{{const s={W},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),v=c.matrix.transformPoint(p.x-c.scrollX,p.y-c.scrollY);return{{x:r.left+v.x*r.width/s.scale.width,y:r.top+v.y*r.height/s.scale.height}}}}",{'x':x,'y':y})
   assert page.evaluate("p=>document.elementFromPoint(p.x,p.y)?.tagName==='CANVAS'",q),q
   (page.touchscreen.tap if mobile else page.mouse.click)(q['x'],q['y'])
  page.goto(URL,wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=120000);page.locator('[data-action="continue-mode"]').click();room('C')
  assert page.evaluate("Math.abs(document.getElementById('stage').getBoundingClientRect().width-innerWidth)<2")
  assert page.evaluate("Math.abs(document.getElementById('stage').getBoundingClientRect().height-innerHeight)<2")
  assert page.locator('#objective').is_hidden()
  # Walk to empty ground beyond the access, not to its click hotspot.
  click_world(1250,450);page.wait_for_timeout(1200)
  assert page.evaluate(W+'.dataDef.name.startsWith("C ·")')
  assert page.evaluate(W+'.player.x')<1220
  assert not page.locator('#veil.visible').count()
  assert page.locator('#toast').is_visible()
  assert page.locator('#toast').evaluate("e=>getComputedStyle(e).pointerEvents")=='none'
  page.wait_for_timeout(2900);assert page.locator('#toast').is_hidden()
  click_world(1050,595);page.wait_for_timeout(700);assert page.evaluate(W+'.player.x')<1150
  # Grant the existing liberation flag through an isolated test fixture, not the author's save.
  page.evaluate("""async()=>{const {notifyObjectiveChange}=await import('/src/engine/objective-notice.ts');const w=await(await fetch('worlds/plato.json')).json();notifyObjectiveChange(w,{flags:[]},{flags:[w.missions[0].flag],introComplete:true})}""")
  assert page.locator('#objective-notice').is_visible()
  click_world(1000,595);page.wait_for_timeout(500);assert page.evaluate(W+'.player.x')<1060
  page.locator('#objective-notice').wait_for(state='hidden',timeout=6000)
  # A new context loads the same chapter with the required story state.
  context.close()
  context=browser.new_context(viewport={'width':932 if mobile else 1600,'height':430 if mobile else 800},has_touch=True,reduced_motion='reduce')
  fixture['worlds']['plato']['flags']+=['prisionero_liberado','encapuchado_vencido']
  context.add_init_script("if(!localStorage.getItem('passage-fixture')){localStorage.setItem('passage-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',"+json.dumps(json.dumps(fixture))+")}")
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(URL,wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=120000);page.locator('[data-action="continue-mode"]').click();room('C')
  click_world(1250,450);room('D')
  assert not page.locator('#veil.visible').count()
  assert page.evaluate(W+'.companion!==null')
  click_world(1100,250);page.wait_for_function(W+'.player.x>1030',timeout=15000)
  point=page.evaluate(f"()=>{{const s={W},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(s.player.x-c.scrollX,s.player.y-110-c.scrollY);return r.top+p.y*r.height/s.scale.height}}")
  assert 0<point<page.viewport_size['height'],point
  page.screenshot(path=str(OUT/('passage-'+('touch' if mobile else 'desktop')+'-ascent.png')))
  click_world(1250,245);room('E')
  # Blue surface portal stays explicit; standing/moving beside it does not exit.
  assert page.evaluate(W+".objects.find(o=>o.id==='salida-planeta').passage??'manual'")=='manual'
  click_world(40,340);room('D');click_world(40,250);room('C')
  assert page.evaluate(W+'.player.x')>1100
  page.set_viewport_size({'width':430,'height':932});page.wait_for_timeout(500)
  assert page.evaluate("Math.abs(document.getElementById('stage').getBoundingClientRect().width-innerWidth)<2")
  assert page.locator('canvas').is_visible()
  assert not errors,errors
  print('PASS:', 'emulated touch' if mobile else 'desktop', 'C blocked/open, D/E/return, companion, notices, landscape + portrait',flush=True)
  context.close()
 # Surface regression: proportional landscape fill still accepts direct touch.
 context=browser.new_context(viewport={'width':932,'height':430},has_touch=True,reduced_motion='reduce')
 context.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'earth',worlds:{earth:{introComplete:true,flags:['camera-introduction-seen']}}}))")
 page=context.new_page();page.goto(URL,wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=120000);page.locator('[data-action="continue-mode"]').click()
 P="window.__sofiaGame.scene.getScene('Planet')"
 page.wait_for_function(P+'.sys.isActive()&&'+P+'.player?.active',timeout=30000);page.wait_for_timeout(500)
 start=page.evaluate(P+'.bodyState.angle')
 q=page.evaluate(f"()=>{{const s={P},a=s.bodyState.angle+.45,radius=Math.hypot(s.player.x,s.player.y),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(Math.sin(a)*radius-c.scrollX,-Math.cos(a)*radius-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 assert 0<q['x']<932 and 0<q['y']<430,q
 page.touchscreen.tap(q['x'],q['y']);page.wait_for_function(P+f'.bodyState.angle>{start+.12}',timeout=12000)
 print('PASS: radial Earth accepts real emulated touch in full landscape',flush=True)
 context.close()
 browser.close()
