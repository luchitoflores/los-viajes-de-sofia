from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
P="window.__sofiaGame.scene.getScene('Planet')";F="window.__sofiaGame.scene.getScene('Spaceflight')";report={};errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':932,'height':430},has_touch=True,reduced_motion='reduce')
 ctx.add_init_script("""if(!localStorage.getItem('sofia-universe-progress-v1'))localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'camus',worlds:{camus:{introComplete:true,flags:['old-camus-flag'],completed:['old-activity'],answers:{old:['item']},choices:{old:'selected'}},sartre:{introComplete:true,flags:['old-sartre-flag'],completed:['old-sartre-activity']}}}));""")
 page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded')
 page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000)
 page.locator('[data-action="continue-mode"]').click()
 def screen(scene,x,y):return page.evaluate(f"()=>{{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);return{{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}")
 def embark():
  page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship'&&o.interaction==='ship');s.cancelWalk();s.bodyState.angle=(o.angleDeg+15)*Math.PI/180}}")
  page.wait_for_timeout(700)
  center=page.evaluate(f"()=>{{const s={P},o=s.objects.find(o=>o.kind==='ship'&&o.interaction==='ship');return s.hotspots.get(o.id).getCenter()}}")
  point=screen(P,center['x'],center['y']);page.touchscreen.tap(point['x'],point['y'])
  page.wait_for_selector('[data-run="resume"]',timeout=15000)
  assert page.locator('[data-run="resume"]').inner_text()=='Bajar de la nave'
 embark();page.route('**/worlds/hegel.json',lambda route:route.fulfill(status=500,content_type='text/plain',body='Fallo de carga de prueba'))
 page.locator('[data-planet="hegel"]').click()
 page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=30000)
 assert page.evaluate(P+'.currentContext.id')=='camus';assert page.evaluate(P+'.player.alpha')==1
 page.unroute('**/worlds/hegel.json');report['failed_destination_restores_visible_hero_and_controls']=True
 embark();page.locator('[data-planet="sartre"]').click()
 page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
 assert page.evaluate(P+'.currentContext.id')=='sartre';assert page.evaluate(P+'.player.alpha')==1
 report['reduced_motion_mobile_touch_flight']=True
 page.emulate_media(reduced_motion='no-preference');embark();page.locator('[data-planet="camus"]').click()
 page.wait_for_function(F+".sys.isActive()&&"+F+".phase==='cruise'",timeout=15000)
 page.screenshot(path='captures/sofia-vuelo-movil.png')
 center=page.evaluate(F+".children.list.find(o=>o.text==='Omitir animación').getCenter()")
 point=screen(F,center['x'],center['y']);page.touchscreen.tap(point['x'],point['y'])
 page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
 assert page.evaluate(P+'.currentContext.id')=='camus';report['skip_animation_with_touch']=True
 start=page.evaluate(P+'.bodyState.angle');page.keyboard.down('ArrowRight');page.wait_for_timeout(350);page.keyboard.up('ArrowRight');assert page.evaluate(P+'.bodyState.angle')>start
 page.reload(wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=60000)
 saved=page.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1')).worlds")
 assert 'old-camus-flag' in saved['camus']['flags'];assert saved['camus']['answers']['old']==['item'];assert saved['camus']['choices']['old']=='selected';assert 'old-activity' in saved['camus']['completed']
 assert 'old-sartre-flag' in saved['sartre']['flags'];assert 'old-sartre-activity' in saved['sartre']['completed'];report['previous_progress_and_controls_preserved']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False
 Path('captures/spaceflight-edges-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
