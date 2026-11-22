from playwright.sync_api import sync_playwright
import json
from pathlib import Path
W="window.__sofiaGame.scene.getScene('World')"
w=json.loads(Path('public/worlds/sartre.json').read_text(encoding='utf-8'));x=next(i['x'] for i in w['interiors']['cafe']['items'] if i['id']=='cafe-pairs-table')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':900},has_touch=True)
 seed={'version':1,'last':'sartre','worlds':{'sartre':{'introComplete':True,'flags':['cafe-heard'],'interior':'cafe','interiorX':x-45}}}
 c.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify("+json.dumps(seed)+"))")
 p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.goto('http://127.0.0.1:4173/',wait_until='domcontentloaded');p.wait_for_function("window.__sofiaGame?.scene.getScene('World')?.player?.active",timeout=120000);p.locator('[data-action="continue-mode"]').click();p.wait_for_timeout(600)
 def table():
  q=p.evaluate(f"()=>{{const s={W},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),v=s.propViews.find(v=>v.id==='cafe-pairs-table'&&v.obj.type==='Zone').obj.getCenter(),a=c.matrix.transformPoint(v.x-c.scrollX,v.y-c.scrollY);return{{x:r.left+a.x*r.width/s.scale.width,y:r.top+a.y*r.height/s.scale.height}}}}")
  p.touchscreen.tap(q['x'],q['y']);p.wait_for_selector('[data-run="play-activity"]')
 table();assert p.locator('#panel button:not([hidden])').all_inner_texts()==['Sí','No'];assert not p.locator('[data-left]').count();p.locator('[data-run="leave-activity"]').click();assert not p.locator('#veil.visible').count();table();p.locator('#dialogue-text').dispatch_event('dialogue-reveal');p.keyboard.press('Enter');assert p.locator('[data-run="play-activity"]').evaluate('e=>e===document.activeElement');assert not p.locator('[data-left]').count();p.keyboard.press('Enter');p.wait_for_selector('[data-left]');assert not errors;Path('captures/activity-invitation-validation.json').write_text(json.dumps({'yes_no_only':True,'no_keeps_progress':True,'enter_requires_choice':True,'yes_opens_existing_activity':True,'browser_errors':errors}),encoding='utf8');print('Activity invitation passed',flush=True);b.close()
