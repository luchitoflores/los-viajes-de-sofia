from playwright.sync_api import sync_playwright
from pathlib import Path
import json
W="window.__sofiaGame.scene.getScene('World')";errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1440,'height':960},has_touch=True);p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 seed={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'fuego','interiorX':850,'flags':['lampara_encendida']}}};c.add_init_script("if(!localStorage.getItem('fire-exit-test')){localStorage.setItem('fire-exit-test','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify("+json.dumps(seed)+"))}")
 def room(prefix):return p.evaluate(W+".dataDef.name.startsWith('"+prefix+" ·')")
 def finish():
  for _ in range(70):
   if not p.locator('#veil.visible').count():return
   choices=p.locator('#panel button:not([hidden]):visible')
   if choices.count():choices.first.click()
   else:p.keyboard.press('Enter')
  raise AssertionError('Dialogue loop')
 def item(id,touch=False):
  p.wait_for_timeout(250);q=p.evaluate("()=>{const s="+W+",v=s.propViews.find(v=>v.id==='"+id+"'&&v.obj.type==='Zone').obj,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),a=v.getCenter(),t=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height}}")
  (p.touchscreen.tap if touch else p.mouse.click)(q['x'],q['y'])
 def go(id,prefix,touch=False):
  for _ in range(4):
   item(id,touch);p.wait_for_function(W+".dataDef.name.startsWith('"+prefix+" ·')||!!document.querySelector('#veil.visible')",timeout=15000)
   finish()
   if room(prefix):return
  raise AssertionError('Cannot reach '+prefix)
 p.goto('http://127.0.0.1:4173/');p.wait_for_selector('[data-action="continue-mode"]',timeout=120000);p.locator('[data-action="continue-mode"]').click();item('fuego-ascenso');p.wait_for_selector('#dialogue-text',timeout=12000);assert 'libera' in p.locator('#dialogue-text').get_attribute('aria-label');finish();assert room('C');report['clear_requirement_before_liberation']=True
 old=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'));old['interiors']['fuego']['items']=[o for o in old['interiors']['fuego']['items'] if o['id']!='fuego-ascenso'];del old['interactions']['fuego-ascenso'];p.evaluate("w=>new Promise(resolve=>{const r=indexedDB.open('sofia-world-editor');r.onsuccess=()=>{const db=r.result,t=db.transaction('worlds','readwrite');t.objectStore('worlds').put(w);t.oncomplete=()=>{db.close();resolve()}}})",old)
 seed['worlds']['plato']['flags']+=['sombras_comprendidas','prisionero_liberado'];p.add_init_script("localStorage.setItem('sofia-universe-progress-v1',JSON.stringify("+json.dumps(seed)+"))");p.set_viewport_size({'width':932,'height':430});p.reload();p.wait_for_selector('[data-action="continue-mode"]',timeout=120000);p.locator('[data-action="continue-mode"]').click();assert p.evaluate(W+'.companion?.active');p.screenshot(path='captures/fuego-arco-hacia-ascenso.png');go('fuego-ascenso','D',True);assert p.evaluate(W+'.companion?.active');report['old_saved_fire_room_crosses_painted_arch_with_prisoner']=True
 go('ascenso-prisioneros','C',True);assert abs(p.evaluate(W+'.player.x')-1130)<40;report['return_uses_actual_previous_scene_and_position']=True
 go('fuego-ascenso','D',True);go('ascenso-salida','E',True);assert p.evaluate(W+'.companion?.active');report['next_room_walks_stairs_and_reaches_first_light']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/fire-exit-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
