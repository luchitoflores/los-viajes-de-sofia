"""Common combat, actual input, isolated desktop and emulated landscape touch profiles."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/')
S="window.__sofiaGame.scene.getScene('World')"
E=".combat.models.get('caverna-encapuchado')"
out=Path('captures');out.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 errors=[]
 for mobile in ([True] if os.environ.get('SOFIA_COMBAT_MOBILE_ONLY') else [False,True]):
  c=b.new_context(viewport={'width':932 if mobile else 1440,'height':430 if mobile else 960},has_touch=True)
  c.add_init_script("if(!localStorage.getItem('combat-fixture')){localStorage.setItem('combat-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{plato:{introComplete:true,interior:'fuego',interiorX:160,trail:[{interior:null,x:null},{interior:'entrada',x:1120},{interior:'prisioneros',x:1120}],flags:['intro-complete','prisionero_escuchado','lampara_encendida'],equipment:{lamp:{equipped:true,on:true}}}}}))}")
  p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
  def state():return p.evaluate(S+E)
  def finish():
   for _ in range(70):
    if not p.locator('#veil.world-dialog.visible').count():return
    if mobile:p.locator('#panel .bubble-content').tap(position={'x':25,'y':25})
    else:p.keyboard.press('Enter')
    p.wait_for_timeout(70)
   raise AssertionError('Conversation did not finish')
  def click_behavior(behavior):
   target=p.evaluate("behavior=>"+S+".objects.find(o=>o.behavior===behavior).x",behavior)
   if abs(p.evaluate(S+'.player.x')-target)>100:
    key='ArrowRight' if p.evaluate(S+'.player.x')<target else 'ArrowLeft';p.keyboard.down(key);p.wait_for_function("target=>Math.abs("+S+".player.x-target)<95",arg=target,timeout=60000);p.keyboard.up(key);p.wait_for_timeout(150)
   q=p.evaluate("behavior=>{const s="+S+",o=s.objects.find(o=>o.behavior===behavior),v=s.propViews.find(v=>v.id===o.id&&v.obj.type==='Zone').obj.getCenter(),c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),q=c.matrix.transformPoint(v.x-c.scrollX,v.y-c.scrollY);return{x:r.left+q.x*r.width/s.scale.width,y:r.top+q.y*r.height/s.scale.height}}",behavior)
   p.mouse.click(q['x'],q['y'])
  try:
   p.goto(URL,wait_until='domcontentloaded');p.wait_for_selector('[data-action="continue-mode"]',timeout=300000);p.locator('[data-action="continue-mode"]').click();p.wait_for_selector('#veil.world-dialog.visible',timeout=60000)
   assert p.locator('[data-dialogue-speaker="encapuchado"]').count()==1;assert p.evaluate(S+".conversationTargets().some(c=>c.characterId==='encapuchado')");assert 'No deberías' in p.locator('#dialogue-text').get_attribute('aria-label');assert state()['status']=='inactive';p.wait_for_timeout(2500);assert state()['heroHp']==3;finish();p.wait_for_function(S+E+".status==='active'")
   # No input: slow dark spheres eventually cause a real defeat.
   p.wait_for_selector('[data-run="combat-retry"]',timeout=90000);assert state()['status']=='retry';assert not state()['projectiles'];p.locator('[data-run="combat-retry"]').click();assert state()['heroHp']==3
   # Opening inventory freezes timing and projectiles.
   p.locator('[data-tab="inventory"]').click();p.wait_for_selector('#collection-close');before=state();p.wait_for_timeout(900);assert state()==before
   p.locator('#collection-close').click();p.wait_for_function("!document.getElementById('veil').classList.contains('visible')")
   if mobile:
    p.wait_for_selector('#context-weapon:not([hidden])')
    for _ in range(30):
     if state()['status']!='active':break
     p.locator('#context-weapon').tap();p.wait_for_timeout(600)
   else:p.keyboard.down('f');p.wait_for_function(S+E+".status==='defeated'",timeout=30000);p.keyboard.up('f')
   p.wait_for_function(S+E+".status==='defeated'",timeout=10000);finish();assert state()['projectiles']==[];assert p.evaluate(S+'.player.alpha')==1
   saved=p.evaluate("JSON.parse(localStorage.getItem('sofia-universe-progress-v1')).worlds.plato")
   assert saved['combats']['caverna-encapuchado']=={'state':'defeated','attempts':1};assert 'encapuchado_vencido' in saved['flags'];assert 'aventura_platon_completada' not in saved['flags'];assert not saved['memories']
   p.screenshot(path=str(out/('combat-mobile.png' if mobile else 'combat-desktop.png')))
   p.reload(wait_until='domcontentloaded');p.wait_for_selector('[data-action="continue-mode"]',timeout=300000);p.locator('[data-action="continue-mode"]').click();p.wait_for_function(S+E+".status==='defeated'",timeout=30000);assert not p.locator('#veil.world-dialog.visible').count();assert p.locator('#context-weapon').is_hidden()
   if not mobile:
    click_behavior('examinar-fuego');p.wait_for_selector('#veil.world-dialog.visible',timeout=30000);finish()
    click_behavior('fuego-prisioneros');p.wait_for_function(S+".dataDef.name.startsWith('B ·')",timeout=30000);click_behavior('prisioneros-fuego');p.wait_for_function(S+".dataDef.name.startsWith('C ·')&&"+S+E+".status==='defeated'",timeout=30000);assert state()['projectiles']==[]
    p.goto(URL+'#/edicion?world=plato&scene=fuego',wait_until='domcontentloaded');p.wait_for_selector('#combat-editor summary',timeout=120000);p.locator('#combat-editor summary').first.click();assert p.locator('[data-combat="hp"]').input_value()=='3';assert p.locator('[data-combat="attack.interval"]').input_value()=='2.1';assert p.locator('[data-combat="beforeDialogue"]').input_value()=='encapuchado-inicio'
   print('Combat verified:', 'emulated touch' if mobile else 'desktop keyboard',flush=True)
  except:
   p.screenshot(path=str(out/'combat-failure.png'));print(p.locator('#panel').inner_text(),flush=True);print(p.evaluate(S+E+'??null'),flush=True);print(errors,flush=True);raise
  c.close()
 # Same controller, two data-defined appearances, no game save writes.
 c=b.new_context(viewport={'width':1280,'height':900},has_touch=True);p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.goto(URL+'playground.html');p.wait_for_function('window.__mechanicsScene?.ship?.active',timeout=300000);p.locator('[data-mode="combat"]').click();p.wait_for_timeout(300)
 L='window.__mechanicsScene';assert p.evaluate(L+'.combat.configs.length')==2;p.keyboard.down('f');p.wait_for_function(L+".combat.models.get('lab-hood').status==='defeated'",timeout=30000);p.keyboard.up('f')
 p.keyboard.down('ArrowRight');p.wait_for_function(L+'.actor.x>610',timeout=30000);p.keyboard.up('ArrowRight');p.keyboard.down('f');p.wait_for_function(L+".combat.models.get('lab-generic').status==='defeated'",timeout=30000);p.keyboard.up('f')
 p.locator('[data-mode="movement"]').click();assert p.evaluate(L+'.combat') is None;assert p.evaluate("localStorage.getItem('sofia-universe-progress-v1')") is None;assert not errors,errors
 p.goto(URL+'#/edicion?world=plato&scene=fuego',wait_until='domcontentloaded');p.wait_for_selector('#combat-editor summary',timeout=300000);p.locator('#combat-editor summary').first.click();assert p.locator('[data-combat="hp"]').input_value()=='3';assert p.locator('[data-combat="attack.interval"]').input_value()=='2.1'
 (out/'combat-validation.json').write_text(json.dumps({'desktop':not bool(os.environ.get('SOFIA_COMBAT_MOBILE_ONLY')),'emulated_touch':True,'physical_phone_tested':False,'retry':True,'pause':True,'persistence':True,'two_playground_instances':True,'browser_errors':errors},indent=2));b.close()
