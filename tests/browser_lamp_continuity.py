from playwright.sync_api import sync_playwright
from pathlib import Path
import json
W="window.__sofiaGame.scene.getScene('World')";KEY='sofia-universe-progress-v1';errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1440,'height':960},has_touch=True);p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 seed={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'entrada','interiorX':120,'flags':[]}}}
 c.add_init_script("if(!localStorage.getItem('lamp-test')){localStorage.setItem('lamp-test','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify("+json.dumps(seed)+"))}")
 def ready(prefix):p.wait_for_function("window.__sofiaGame?.scene.getScene('World')?.player?.active&&"+W+".dataDef.name.startsWith('"+prefix+" ·')",timeout=120000)
 def finish():
  for _ in range(60):
   if not p.locator('#veil.visible').count():return
   choices=p.locator('#panel button:not([hidden]):visible')
   if choices.count():choices.first.click()
   else:p.keyboard.press('Enter')
  raise AssertionError('Dialogue never ended')
 def light():
  p.wait_for_timeout(180)
  a=p.evaluate("()=>{const s="+W+",c=s.roomLight.texture.context,x=Math.round(s.player.x-s.cameras.main.scrollX),y=Math.round(s.player.y-65-s.cameras.main.scrollY);return{near:c.getImageData(x,y,1,1).data[3],far:c.getImageData(1220,80,1,1).data[3]}}")
  assert a['near']<10 and a['far']>230,a
 p.goto('http://127.0.0.1:4173/');ready('A');p.locator('[data-action="continue-mode"]').click();p.wait_for_selector('#dialogue-text');finish();assert p.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')).worlds.plato.flags.includes('lampara_encendida')")
 p.wait_for_timeout(250);q=p.evaluate("()=>{const s="+W+",v=s.propViews.find(v=>v.id==='entrada-prisioneros'&&v.obj.type==='Zone').obj,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),a=v.getCenter(),t=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+t.x*r.width/s.scale.width,y:r.top+t.y*r.height/s.scale.height}}")
 p.mouse.click(q['x'],q['y']);ready('B');finish();light();p.screenshot(path='captures/lampara-segunda-habitacion.png');p.keyboard.down('ArrowRight');p.wait_for_timeout(1000);p.keyboard.up('ArrowRight');light();p.reload();ready('B');p.locator('[data-action="continue-mode"]').click();finish();light();report['observation_lights_lamp_and_second_room_tracks_after_reload']=True;print('New journey and reload passed',flush=True)
 old=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'));old['dialogues']['entrada-observacion'].pop('reward',None);old['interactions']['entrada-prisioneros'].pop('requires',None);old['interiors']['prisioneros']['events']=[e for e in old['interiors']['prisioneros']['events'] if e['id']!='recuperar-lampara'];old['dialogues']['entrada-observacion']['nodes']['oscuro']['text']='Texto editado del autor que debe conservarse.'
 p.evaluate("w=>new Promise((resolve,reject)=>{const r=indexedDB.open('sofia-world-editor');r.onsuccess=()=>{const db=r.result,t=db.transaction('worlds','readwrite');t.objectStore('worlds').put(w);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)}})",old)
 p.add_init_script("localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{plato:{introComplete:true,interior:'prisioneros',interiorX:130,flags:['event:entrada:primer-pensamiento']}}}))")
 p.set_viewport_size({'width':932,'height':430});p.reload();ready('B');p.locator('[data-action="continue-mode"]').click();p.wait_for_timeout(300);finish();light();assert p.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')).worlds.plato.flags.includes('lampara_encendida')");p.screenshot(path='captures/lampara-partida-recuperada-movil.png');report['old_draft_and_dark_saved_room_recover_without_restart']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/lamp-continuity-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
