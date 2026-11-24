from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,math
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:5174/');W="window.__sofiaGame.scene.getScene('World')";P="window.__sofiaGame.scene.getScene('Planet')"
w=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'));events=['event:'+id+':'+e['id'] for id,r in w['interiors'].items() for e in r.get('events',[])]
errors=[];report={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':932,'height':430},has_touch=True)
 fixture={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'entrada','interiorX':900,'flags':['lampara_encendida','prisionero_liberado','sombras_comprendidas']+events,'equipment':{'lamp':{'equipped':True,'on':False}}}}}
 context.add_init_script("if(!localStorage.getItem('travel-lamp')){localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',"+json.dumps(json.dumps(fixture))+");localStorage.setItem('travel-lamp','1')}")
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(URL);page.locator('[data-action=continue-mode]').click(timeout=120000);page.wait_for_function(W+'.player?.active',timeout=60000)
 def item(id):
  point=page.evaluate("()=>{const s="+W+",c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),z=s.propViews.find(v=>v.id==='"+id+"'&&v.obj.type==='Zone').obj,a=z.getCenter(),p=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}")
  page.touchscreen.tap(point['x'],point['y'])
 def go(id,scene):
  item(id);page.wait_for_function(W+".sys.isActive()&&"+W+".dataDef.name==='"+w['interiors'][scene]['name']+"'",timeout=25000);page.wait_for_timeout(450);assert page.locator('#context-controls').get_attribute('data-lamp')=='off',scene;assert page.evaluate(W+'.heldLamp.prop.visible');assert bool(page.evaluate(W+'.companion?.active')==True)==(scene in w['journey']['companion']['scenes']);print('off in '+scene,flush=True)
 for id,scene in [('entrada-prisioneros','prisioneros'),('prisioneros-fuego','fuego'),('fuego-ascenso','ascenso'),('ascenso-salida','salida'),('salida-ascenso','ascenso'),('ascenso-prisioneros','fuego'),('fuego-prisioneros','prisioneros'),('prisioneros-entrada','entrada')]:go(id,scene)
 report['lamp_off_persists_A_B_C_D_E_and_real_return_history']=True
 assert not page.evaluate(W+'.companion?.active');report['companion_stays_in_configured_cave_rooms']=True
 # Keyboard and mouse still operate beside the new touchscreen controls.
 page.keyboard.press('l');page.wait_for_timeout(150);assert page.locator('#context-controls').get_attribute('data-lamp')=='on';page.locator('#context-secondary:visible, #context-primary[data-action=lamp]:visible').first.click();page.wait_for_timeout(150);assert page.locator('#context-controls').get_attribute('data-lamp')=='off';report['mouse_and_keyboard_lamp']=True
 context.close();context=browser.new_context(viewport={'width':932,'height':430},has_touch=True)
 context.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'earth',worlds:{earth:{flags:['camera-introduction-seen']}}}))")
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(URL);page.locator('[data-action=continue-mode]').click(timeout=120000);page.wait_for_function(P+'.player?.active',timeout=60000);page.wait_for_timeout(300)
 before=page.evaluate(P+'.bodyState.angle');rect=page.locator('#joystick').bounding_box();x=rect['x']+rect['width']/2;y=rect['y']+rect['height']/2;cdp=context.new_cdp_session(page);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+rect['width']*.3,'y':y}]});page.wait_for_timeout(900);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});after=page.evaluate(P+'.bodyState.angle');assert abs(after-before)>.1;assert page.evaluate(P+'.bodyState.height')==0;report['radial_joystick_keeps_surface_physics']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/lamp-travel-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report),flush=True);browser.close()
