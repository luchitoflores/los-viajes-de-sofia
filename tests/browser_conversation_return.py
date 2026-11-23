from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,time
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/');KEY='sofia-universe-progress-v1';W="window.__sofiaGame.scene.getScene('World')";errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1440,'height':900},has_touch=True);c.add_init_script("if(!localStorage.getItem('marker-fixture')){localStorage.setItem('marker-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{plato:{introComplete:true,flags:['lampara_encendida','prisionero_liberado','primer_ascenso_completado','prisionero_acepta','sombras_comprendidas'],interior:'prisioneros',interiorX:100}}}))}")
 p=c.new_page();p.on('pageerror',lambda e:(errors.append(str(e)),print('ERROR',str(e),flush=True)))
 def start():
  print('loading fixture',flush=True)
  p.goto(URL+'?markers='+str(time.monotonic())+'#/jugar',wait_until='domcontentloaded');print('document loaded',flush=True);p.screenshot(path='captures/conversation-loading.png');p.wait_for_selector('[data-menu="continue"]',timeout=120000);p.locator('[data-menu="continue"]').click();print('continued',flush=True);p.wait_for_timeout(1000);print(p.evaluate("window.__sofiaGame.scene.getScenes(true).map(s=>({key:s.sys.settings.key,name:s.dataDef?.name}))"),flush=True);p.screenshot(path='captures/conversation-continued.png');p.wait_for_function(W+".sys.isActive()",timeout=15000);p.evaluate("void "+W+".player.setX("+W+".objects.find(o=>o.id==='prisionero-se-queda').x-160)");p.wait_for_timeout(300);print('fixture ready',flush=True)
 def finish():
  for _ in range(80):
   if not p.locator('#veil.world-dialog.visible').count():return
   choices=p.locator('#panel button:not([hidden])')
   if choices.count():choices.first.click()
   else:p.keyboard.press('Enter')
   p.wait_for_timeout(70)
  raise AssertionError('conversation did not finish')
 start();p.wait_for_selector('#dialogue-text');finish();assert p.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')).worlds.plato.flags.includes('regreso_caverna_completado')")
 marker=p.locator('[data-conversation="companion"]');marker.wait_for();marker.click();p.wait_for_selector('#dialogue-text');finish();flags=p.evaluate("JSON.parse(localStorage.getItem('"+KEY+"')).worlds.plato.flags");assert 'decision_final_prisionero' in flags;assert 'prisionero_se_queda' in flags or 'prisionero_sale' in flags;assert not errors,errors;print(json.dumps({'mandatory_return_dialogue':True,'companion_new_decision_marker':True,'final_decision_recorded':True,'errors':errors}));b.close()
