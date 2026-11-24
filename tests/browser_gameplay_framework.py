from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/');out=Path('captures');out.mkdir(exist_ok=True);errors=[];report={};S='window.__mechanicsScene'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':900},has_touch=True);p=c.new_page();p.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)));p.goto(URL+'playground.html');p.wait_for_function(S+'?.ship?.active',timeout=120000);p.wait_for_timeout(400);p.screenshot(path=str(out/'framework-idle.png'))
 assert p.evaluate(S+'.actor.motion')=='idle';assert p.evaluate(S+'.ship.scaleY')>0
 def hold(keys,t=400):
  for key in keys:p.keyboard.down(key)
  p.wait_for_timeout(t)
 def release(keys):
  for key in keys:p.keyboard.up(key)
  p.wait_for_timeout(100)
 hold(['ArrowRight'],300);walk=p.evaluate(S+'.actor.vx');release(['ArrowRight']);hold(['ArrowLeft','Shift'],450);run=abs(p.evaluate(S+'.actor.vx'));assert run>walk*1.5;assert p.evaluate(S+'.ship.anims.currentAnim.key')=='sofia-run';frame=p.evaluate(S+'.ship.texture.key');p.wait_for_timeout(130);assert p.evaluate(S+'.ship.texture.key')!=frame;p.screenshot(path=str(out/'framework-run.png'));release(['ArrowLeft','Shift']);report['real_running_animation_and_multiplier']=True
 hold(['c'],500);assert p.evaluate(S+'.actor.motion')=='crouch';assert p.evaluate(S+'.actor.y')==460;assert p.evaluate(S+'.ship.texture.key').startswith('sofia-crouch');p.screenshot(path=str(out/'framework-crouch.png'));release(['c']);assert p.evaluate(S+'.actor.motion')=='idle';report['crouch_and_feet_pivot']=True
 hold(['ArrowUp'],250);assert p.evaluate(S+'.actor.y')<420;assert p.evaluate(S+'.ship.texture.key').startswith('sofia-jump');p.screenshot(path=str(out/'framework-jump.png'));p.wait_for_timeout(1200);assert p.evaluate(S+'.actor.grounded');release(['ArrowUp']);report['jump_gravity_landing_and_no_auto_repeat']=True
 p.locator('#cap-jump').uncheck();p.keyboard.press('ArrowUp');p.wait_for_timeout(250);assert p.evaluate(S+'.actor.grounded');assert not p.locator('[data-dir=jump]').is_visible();p.locator('#cap-jump').check();report['capability_toggle']=True
 p.locator('#tool-light').tap();p.wait_for_timeout(200);assert p.locator('#tool-light').get_attribute('aria-pressed')=='false';p.locator('#tool-light').tap();p.wait_for_timeout(200);assert p.locator('#tool-light').get_attribute('aria-pressed')=='true';report['flashlight_toggle']=True
 p.locator('#jumpSpeed').fill('620');p.locator('#jumpSpeed').dispatch_event('input')
 with p.expect_download() as dl:p.locator('#preset-export').click()
 preset=json.loads(Path(dl.value.path()).read_text());assert preset['jumpSpeed']==620;p.locator('#preset-default').click();p.locator('#preset-import').set_input_files({'name':'movement.json','mimeType':'application/json','buffer':json.dumps(preset).encode()});p.wait_for_function("document.getElementById('preset-status').textContent.includes('aplicado')");assert p.locator('#jumpSpeed').input_value()=='620';report['preset_export_import']=True
 # Real touch emulation: joystick plus held run button, same pure controller.
 p.set_viewport_size({'width':932,'height':430});p.locator('#reset').click();p.locator('#expand-screen').click();p.wait_for_timeout(400);cdp=c.new_cdp_session(p);r=p.locator('#analog-stick').bounding_box();q=p.locator('[data-dir=run]').bounding_box();a={'x':r['x']+r['width']/2,'y':r['y']+r['height']/2,'id':1};z={'x':q['x']+q['width']/2,'y':q['y']+q['height']/2,'id':2};before=p.evaluate(S+'.actor.x');cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[a,z]});a['x']+=r['width']*.3;cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[a,z]});p.wait_for_timeout(400);assert p.evaluate(S+'.actor.motion')=='run';p.screenshot(path=str(out/'framework-mobile-controls.png'));cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});assert p.evaluate(S+'.actor.x')>before;report['multi_touch_run_and_analog']=True
 p.evaluate('document.exitFullscreen()');p.wait_for_timeout(200);p.locator('[data-avatar=ship]').click();p.locator('[data-mode=fallacies]').click();p.keyboard.down(' ');p.wait_for_timeout(500);p.keyboard.up(' ');assert p.evaluate(S+'.bullets.length')>0;report['existing_ship_and_projectile_mode']=True
 p.locator('#preset-save').click();assert json.loads(p.evaluate("localStorage.getItem('sofia-gameplay-movement-v1')"))['jumpSpeed']==620;p.reload();p.wait_for_function(S+'?.ship?.active',timeout=60000);assert p.locator('#jumpSpeed').input_value()=='620';report['local_preset_survives_reload']=True
 assert p.evaluate("localStorage.getItem('sofia-universe-progress-v1')")==None;assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;(out/'gameplay-framework-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report),flush=True);b.close()
