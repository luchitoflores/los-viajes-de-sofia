from playwright.sync_api import sync_playwright
from pathlib import Path
import json
P="window.__sofiaGame.scene.getScene('Planet')";W="window.__sofiaGame.scene.getScene('World')";errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':960},has_touch=True)
 c.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');if(!localStorage.getItem('motion-fix-seed')){localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{}}));localStorage.setItem('motion-fix-seed','1')}")
 p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 def ready():p.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active&&window.__sofiaGame.scene.getScene('Planet').sys.isActive()",timeout=120000)
 def stationary():
  p.wait_for_timeout(200);a=p.evaluate(P+'.bodyState.angle');p.wait_for_timeout(900);assert abs(p.evaluate(P+'.bodyState.angle')-a)<.00001
 def finish():
  for _ in range(100):
   if not p.locator('#veil.visible').count():return
   choices=p.locator('#panel button:not([hidden]):visible')
   if choices.count():choices.first.click()
   else:p.keyboard.press('Enter')
  raise AssertionError('Dialogue did not end')
 p.goto('http://127.0.0.1:4173/');ready();p.locator('[data-action="continue-mode"]').click();stationary();p.locator('[data-conversation="philosopher"]').click();p.wait_for_selector('#dialogue-text');finish();stationary()
 p.locator('#pause').click();p.locator('[data-action="continue"]').click();stationary();report['menu_and_dialogue_clicks_do_not_walk']=True
 p.keyboard.down('ArrowRight');p.wait_for_timeout(200);p.evaluate("window.dispatchEvent(new Event('blur'))");stationary();p.keyboard.up('ArrowRight');report['blur_clears_held_direction']=True
 p.locator('#planet-view').click();p.wait_for_timeout(1500)
 q=p.evaluate("()=>{const s="+P+",v=s.hotspots.get('cave'),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),a=v.getCenter(),t=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height}}")
 p.mouse.click(q['x'],q['y']);p.wait_for_function(W+'.sys.isActive()',timeout=30000);finish();p.wait_for_timeout(300)
 q=p.evaluate("()=>{const s="+W+",v=s.propViews.find(v=>v.id==='entrada-prisioneros'&&v.obj.type==='Zone').obj,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),a=v.getCenter(),t=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height}}")
 p.touchscreen.tap(q['x'],q['y']);p.wait_for_function(W+".dataDef.name.startsWith('B ·')",timeout=20000);report['click_and_touch_enter_connected_scenes']=True;print('Motion, blur and connected scenes passed',flush=True)
 world=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'));dialogue=world['dialogues'][world['intro']];node=dialogue['nodes'][dialogue['start']];node['text']='Este texto largo permite comprobar que Sofía conversa sin que la caja crezca ni aparezca una barra. '*18
 p.evaluate("w=>new Promise((resolve,reject)=>{const r=indexedDB.open('sofia-world-editor');r.onsuccess=()=>{const db=r.result,t=db.transaction('worlds','readwrite');t.objectStore('worlds').put(w);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)}})",world)
 p.add_init_script("localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{}}))")
 p.set_viewport_size({'width':932,'height':430});p.reload();ready();p.locator('[data-action="continue-mode"]').click();p.locator('[data-conversation="philosopher"]').click();p.wait_for_selector('#dialogue-text');p.wait_for_timeout(80)
 box=p.locator('#panel').bounding_box();p.wait_for_timeout(250);assert p.locator('#panel').bounding_box()['height']==box['height'];assert int(p.locator('#dialogue-text').get_attribute('data-pages'))>1
 for _ in range(4):
  p.keyboard.press('Enter');p.wait_for_timeout(40);p.keyboard.press('Enter');p.wait_for_timeout(40)
  assert p.locator('#panel').bounding_box()['height']==box['height']
  assert p.locator('#panel').evaluate("e=>[e,...e.querySelectorAll('.bubble-content,p,.row')].every(n=>n.scrollHeight<=n.clientHeight+2)")
 box=p.locator('#panel').bounding_box();assert box['y']>=0 and box['y']+box['height']<=430
 p.screenshot(path='captures/dialogo-paginado-estable-movil.png');finish();stationary();report['long_dialogue_fixed_page_no_scroll_landscape']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/dialogue-motion-fix-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
