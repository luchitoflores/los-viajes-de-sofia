from playwright.sync_api import sync_playwright
import json
W="window.__sofiaGame.scene.getScene('World')"
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1280,'height':900})
 c.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify({version:1,last:'plato',worlds:{plato:{introComplete:true,flags:['prisionero_liberado','primer_ascenso_completado'],interior:'ascenso',interiorX:100}}}))")
 p=c.new_page();p.goto('http://127.0.0.1:4173/',wait_until='domcontentloaded');p.wait_for_function("window.__sofiaGame?.scene.getScene('World')?.player?.active",timeout=120000);p.locator('[data-action="continue-mode"]').click()
 p.evaluate(f"()=>{{window.groundSamples=[];const s={W};s.events.on('postupdate',()=>{{window.groundSamples.push({{x:s.player.x,y:s.player.y,g:s.groundAt(s.player.x),cy:s.companion?.y,cg:s.follower?s.groundAt(s.follower.x):null}})}})}}")
 p.keyboard.down('ArrowRight');p.wait_for_function(W+'.player.x>900',timeout=15000);p.keyboard.up('ArrowRight');p.keyboard.down('ArrowLeft');p.wait_for_function(W+'.player.x<150',timeout=15000);p.keyboard.up('ArrowLeft');samples=p.evaluate('groundSamples');result={'samples':len(samples),'hero_error':max(abs(s['y']-s['g']) for s in samples),'companion_error':max(abs(s['cy']-s['cg']) for s in samples if s['cy'] is not None),'highest':min(s['y'] for s in samples)};print(json.dumps(result),flush=True);assert result['hero_error']<1;assert result['companion_error']<1;assert result['highest']<220;b.close()
