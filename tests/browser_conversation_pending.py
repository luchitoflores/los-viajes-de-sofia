from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,time
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/');KEY='sofia-universe-progress-v1';W="window.__sofiaGame.scene.getScene('World')";errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1440,'height':900},has_touch=True);c.add_init_script("if(!localStorage.getItem('marker-fixture')){localStorage.setItem('marker-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{plato:{introComplete:true,flags:['lampara_encendida'],interior:'prisioneros',interiorX:100}}}))}")
 p=c.new_page();p.on('pageerror',lambda e:(errors.append(str(e)),print('ERROR',str(e),flush=True)))
 def start():
  print('loading fixture',flush=True)
  p.goto(URL+'?markers='+str(time.monotonic())+'#/jugar',wait_until='domcontentloaded');print('document loaded',flush=True);p.screenshot(path='captures/conversation-loading.png');p.wait_for_selector('[data-menu="continue"]',timeout=120000);p.locator('[data-menu="continue"]').click();print('continued',flush=True);p.wait_for_timeout(1000);print(p.evaluate("window.__sofiaGame.scene.getScenes(true).map(s=>({key:s.sys.settings.key,name:s.dataDef?.name}))"),flush=True);p.screenshot(path='captures/conversation-continued.png');p.wait_for_function(W+".sys.isActive()",timeout=15000);p.evaluate("void "+W+".player.setX("+W+".objects.find(o=>o.id==='prisionero-encadenado').x-160)");p.wait_for_timeout(300);print('fixture ready',flush=True)
 def finish():
  for _ in range(80):
   if not p.locator('#veil.world-dialog.visible').count():return
   choices=p.locator('#panel button:not([hidden])')
   if choices.count():choices.first.click()
   else:p.keyboard.press('Enter')
   p.wait_for_timeout(70)
  raise AssertionError('conversation did not finish')
 marker=p.locator('[data-conversation="prisionero-encadenado"]');start();print(p.evaluate(W+".conversationTargets().map(t=>({id:t.id,pending:t.pending}))"),flush=True);p.screenshot(path='captures/conversation-before.png');marker.wait_for();print('marker ready',flush=True);assert p.locator('.talk-ring').count()==0
 head=p.evaluate("()=>{const s="+W+",v=s.conversationTargets().find(t=>t.id==='prisionero-encadenado').view,c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),a=c.matrix.transformPoint(v.x-c.scrollX,v.y-v.displayHeight-c.scrollY);return r.top+a.y*r.height/s.scale.height}");box=marker.bounding_box();assert box['y']+box['height']<=head+2
 marker.click();print('clicked',flush=True);p.wait_for_selector('#dialogue-text');gap=p.evaluate("Math.abs("+W+".player.x-"+W+".objects.find(o=>o.id==='prisionero-encadenado').x)");assert gap>=90,gap;finish();print('finished first',flush=True);p.wait_for_selector('[data-conversation="prisionero-encadenado"]',state='detached');assert p.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')).worlds.plato.dialogueRead.prisionero.length")>0
 start();p.wait_for_timeout(400);assert marker.count()==0
 # Unlock a new, authored entry without altering the real user's profile.
 p.add_init_script("(()=>{const k='"+KEY+"',s=JSON.parse(localStorage.getItem(k));s.worlds.plato.flags.push('sombras_comprendidas');localStorage.setItem(k,JSON.stringify(s))})()");start();marker.wait_for();box=marker.bounding_box();p.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2);p.wait_for_selector('#dialogue-text');finish();assert not errors,errors;p.screenshot(path='captures/conversacion-indicador-superior.png');print(json.dumps({'marker_above_head':True,'no_ground_ring':True,'approach_gap':gap,'read_hides_and_survives_reload':True,'new_event_returns_marker':True,'touch_conversation':True,'errors':errors}));b.close()
