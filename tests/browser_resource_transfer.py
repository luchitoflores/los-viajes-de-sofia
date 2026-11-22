from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173');P="window.__sofiaGame.scene.getScene('Planet')";errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960});p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 def boot(page):
  page.goto(URL,wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000);page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;page.locator('[data-tab="editor"]').click()
 boot(p);p.locator('#world-library').click();p.locator('[data-library-asset="cast-plat"]').click();p.wait_for_timeout(500);p.locator('#object-kind').select_option('asset:cast-plat');p.locator('#object-name').fill('Mi personaje');p.locator('[data-tool="object"]').click();p.wait_for_timeout(500)
 pos=p.evaluate("()=>{const s=window.__sofiaGame.scene.getScene('Planet'),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),p=c.matrix.transformPoint(490-c.scrollX,-85-c.scrollY);return{x:r.left+p.x*r.width/s.scale.width,y:r.top+p.y*r.height/s.scale.height}}")
 p.mouse.click(pos['x'],pos['y']);p.wait_for_function(P+".objects.some(o=>o.label==='Mi personaje')")
 with p.expect_download() as download:p.locator('[data-e="export"]').click()
 data=json.loads(Path(download.value.path()).read_text(encoding='utf-8'));assert data['resources']['cast-plat']['src']=='assets/cast-plat.png'
 # Exercise migration of an existing version-1 editor database without deleting its worlds.
 fresh=b.new_context(viewport={'width':1440,'height':960});fresh.add_init_script("if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');const r=indexedDB.open('sofia-world-editor',1);r.onupgradeneeded=()=>r.result.createObjectStore('worlds',{keyPath:'id'});r.onsuccess=()=>{const db=r.result,tx=db.transaction('worlds','readwrite');tx.objectStore('worlds').put({id:'retained-record',value:'preserved'});db.close()}}")
 q=fresh.new_page();q.on('pageerror',lambda e:errors.append(str(e)));boot(q)
 q.locator('#import-input').set_input_files({'name':'planet.json','mimeType':'application/json','buffer':json.dumps(data).encode()});q.wait_for_function(P+".objects.some(o=>o.label==='Mi personaje')",timeout=30000)
 assert q.evaluate(P+".views.get("+json.dumps(next(o['id'] for o in data['objects'] if o['label']=='Mi personaje'))+").texture.key==='library-cast-plat'")
 q.reload(wait_until='domcontentloaded');q.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000);q.locator('[data-action="start"]').click();q.locator('[data-run="choice-0"]').click() if q.locator('[data-run="choice-0"]').count() else None;q.locator('[data-tab="editor"]').click();assert q.locator('#object-kind option[value="asset:cast-plat"]').count()==1
 migration=q.evaluate("()=>new Promise((resolve,reject)=>{const r=indexedDB.open('sofia-world-editor');r.onerror=reject;r.onsuccess=()=>{const db=r.result,tx=db.transaction('worlds'),read=tx.objectStore('worlds').get('retained-record');read.onsuccess=()=>{resolve({version:db.version,record:read.result.value,resources:db.objectStoreNames.contains('resources')});db.close()}}})")
 assert migration=={'version':3,'record':'preserved','resources':True},migration;assert not errors,errors
 report={'legacy_export_embeds_resources':True,'fresh_profile_import':True,'resource_survives_reload':True,'database_upgrade_preserves_worlds':True,'browser_errors':errors};Path('captures/resource-transfer-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
