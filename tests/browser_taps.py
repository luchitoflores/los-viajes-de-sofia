from pathlib import Path
from playwright.sync_api import sync_playwright
import os,math,json
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:5173');OUT=Path('captures');OUT.mkdir(exist_ok=True)
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')"
errors=[];report={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':960})
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 def ready(scene):page.wait_for_function(f"window.__sofiaGame?.scene?.isActive('{scene}') && window.__sofiaGame.scene.getScene('{scene}').player?.active",timeout=60000)
 def point(scene,x,y):
  return page.evaluate(f'''() => {{const s={scene},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);return {{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}}}''')
 def click(scene,x,y,touch=False):
  pos=point(scene,x,y)
  assert 0<pos['x']<page.viewport_size['width'] and 0<pos['y']<page.viewport_size['height'],pos
  (page.touchscreen.tap if touch else page.mouse.click)(pos['x'],pos['y'])
 def close():page.locator('[data-action="close"]').click()
 def radial(deg):
  page.evaluate(f"() => {{const s={P};s.cancelWalk();s.bodyState.angle={deg}*Math.PI/180;s.bodyState.height=0;s.bodyState.grounded=true}}")
  page.wait_for_timeout(900)
 def tap_planet_item(id):
  box=page.evaluate(f"{P}.hotspots.get('{id}').getCenter()")
  click(P,box['x'],box['y'])
 page.goto(URL,wait_until='domcontentloaded');ready('Planet');page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;page.wait_for_timeout(600)
 assert page.locator('#left,#right,#action,#jump').count()==0
 assert not page.locator('#controls').is_visible()
 assert page.evaluate(f"{P}.player.scaleX")==118/241
 # The baked scenery remains in place; its independent invisible Zones receive the taps.
 assert page.evaluate(f"!{P}.views.get('temple').visible && {P}.hotspots.get('temple').visible && {P}.scenery.visible")
 page.locator('#planet-view').click();page.wait_for_timeout(1400)
 start=page.evaluate(f'{P}.bodyState.angle')
 for deg in [60,140,220,300,343]:
  a=math.radians(deg);click(P,math.sin(a)*460,-math.cos(a)*460)
  page.wait_for_function(f"Math.abs(Math.atan2(Math.sin({P}.bodyState.angle-{a}),Math.cos({P}.bodyState.angle-{a})))<.012 && {P}.destination===null",timeout=30000)
 assert page.evaluate(f'{P}.bodyState.angle')-start>math.pi*1.98
 assert page.evaluate(f'{P}.bodyState.height')==0
 print('Órbita completa por toques verificada',flush=True)
 report['orbit_with_taps_degrees']=(page.evaluate(f'{P}.bodyState.angle')-start)*180/math.pi
 page.locator('#planet-view').click();page.wait_for_timeout(1000)
 radial(-35);tap_planet_item('philosopher');page.wait_for_selector('#veil.visible',timeout=10000)
 page.locator('[data-action="reasons"]').click();close();report['walk_to_character_and_talk']=True
 radial(55);tap_planet_item('scroll');page.wait_for_selector('#veil.visible',timeout=10000);close()
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia-polis-radial-v1')).collected.includes('scroll')")
 assert page.evaluate(f"!{P}.hotspots.get('scroll').visible")
 report['tap_collectible']=True
 radial(10);tap_planet_item('temple');ready('World')
 assert page.evaluate(f"{W}.place")== 'library'
 assert page.evaluate(f"{W}.player.scaleX")==118/241
 # Click the papyrus diagram drawn into the central table, not a superimposed scroll.
 click(W,800,345);page.wait_for_selector('#veil.visible',timeout=12000);close()
 assert page.evaluate(f"!{W}.propViews.some(v=>v.id==='library-scroll' && v.obj.type==='Image')")
 page.screenshot(path=str(OUT/'biblioteca-taps.png'))
 page.locator('#planet-exit').click();ready('Planet');radial(160);tap_planet_item('cave');ready('World')
 assert page.evaluate(f"{W}.place")== 'entrance'
 click(W,350,325);page.wait_for_selector('#veil.visible',timeout=10000);close()
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia_phaser_real_v02')).flags.lamp")
 assert page.evaluate(f"!{W}.propViews.some(v=>v.id==='lamp' && v.obj.type==='Image')")
 report['painted_lamp_hotspot']=True;print('Objetos ilustrados y puertas por clic verificados',flush=True)
 click(W,650,460);page.wait_for_function(f'Math.abs({W}.player.x-650)<5 && {W}.destination===null',timeout=10000)
 click(W,180,460);page.wait_for_function(f'Math.abs({W}.player.x-180)<5 && {W}.destination===null',timeout=10000)
 before=page.evaluate(f'{W}.player.y');page.keyboard.press('Space');page.wait_for_timeout(400);assert page.evaluate(f'{W}.player.y')==before
 report['tap_destination_and_reverse']=True;report['no_jump']=True
 bounds=page.evaluate(f'''() => {{const t={W}.textures;return [0,1,2,3,4,5].map(i=>{{const c=t.get('sofia-stable-'+i).getSourceImage(),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>10){{top=Math.min(top,y);bottom=Math.max(bottom,y)}}return {{top,bottom}}}})}}''')
 assert max(b['bottom']-b['top'] for b in bounds)-min(b['bottom']-b['top'] for b in bounds)<=2,bounds
 assert max(b['bottom'] for b in bounds)-min(b['bottom'] for b in bounds)<=1,bounds
 report['stable_frames']=bounds
 page.screenshot(path=str(OUT/'caverna-taps.png'))
 page.locator('[data-tab="editor"]').click();click(W,350,325)
 assert page.locator('#prop-integrated').is_checked()
 page.locator('#hit-w').fill('130');page.locator('#hit-w').press('Tab')
 assert page.evaluate(f"{W}.objects.find(o=>o.id==='lamp').hotspot.w")==130
 page.locator('[data-e="close"]').click();report['editable_invisible_zone']=True;print('Destino, tamaño estable y zona editable verificados',flush=True)
 # Preserve collisions authored in the side-scene editor while removing jump controls.
 page.evaluate(f"{W}.attachCollision({{id:'test-wall',type:'solid',x:250,y:350,w:40,h:120}})")
 click(W,650,460);page.wait_for_function(f'{W}.player.x>210',timeout=7000);page.wait_for_timeout(500)
 assert page.evaluate(f'{W}.player.x')<235
 page.evaluate(f'{W}.cancelWalk()');report['solid_collision_preserved']=True
 # Continue in a touch device context, retaining discoveries.
 touch=browser.new_context(viewport={'width':932,'height':430},is_mobile=True,has_touch=True,storage_state=context.storage_state())
 page=touch.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='domcontentloaded');ready('World');page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;page.wait_for_timeout(700)
 assert page.locator('#joystick').is_visible()
 click(W,420,460,True);page.wait_for_function(f'Math.abs({W}.player.x-420)<5 && {W}.destination===null',timeout=12000)
 report['finger_tap_destination']=True
 box=page.locator('#joystick').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
 cdp=page.context.new_cdp_session(page)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+box['width']*.3,'y':y}]})
 start_x=page.evaluate(f'{W}.player.x');page.wait_for_function(f'{W}.player.x>{start_x+100}',timeout=7000)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(400)
 stopped=page.evaluate(f'{W}.player.x');page.wait_for_timeout(500);assert abs(page.evaluate(f'{W}.player.x')-stopped)<2
 assert page.locator('#joystick').get_attribute('aria-valuenow')=='0'
 report['analog_joystick_and_release']=True
 click(W,350,325,True);page.wait_for_selector('#veil.visible',timeout=10000)
 assert not page.locator('#joystick').is_visible()
 frozen=page.evaluate(f'{W}.player.x');page.touchscreen.tap(20,200);page.wait_for_timeout(300)
 assert abs(page.evaluate(f'{W}.player.x')-frozen)<2
 assert page.evaluate(f"{W}.player.anims.currentAnim.key")=='sofia-idle'
 close();report['finger_tap_object_and_dialogue_freeze']=True
 page.screenshot(path=str(OUT/'movil-joystick.png'))
 assert not errors,errors
 report['browser_errors']=errors;(OUT/'tap-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True)
 browser.close()
