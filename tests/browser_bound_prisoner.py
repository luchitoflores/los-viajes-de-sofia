from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:5178/');W="window.__sofiaGame.scene.getScene('World')"
Path('captures').mkdir(exist_ok=True);errors=[];report={}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':900},has_touch=True)
 p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(URL+'#/edicion?world=plato&scene=prisioneros')
 p.get_by_text('Estado de la prueba',exact=True).click(timeout=120000)
 p.locator('#core-test-flags').fill('lampara_encendida',timeout=120000);p.locator('#core-test-scene').click()
 p.wait_for_function(W+".propViews.some(v=>v.id==='prisionero-encadenado'&&v.obj.type==='Sprite')",timeout=120000)
 query="()=>{const s="+W+",v=s.propViews.find(v=>v.id==='prisionero-encadenado'&&v.obj.type==='Sprite').obj;return{frame:v.frame.name,y:v.y,scale:v.scaleY,fixed:v.getData('fixed-facing'),flip:v.flipX,key:v.texture.key,playing:v.anims.isPlaying}}"
 print('bound scene loaded',flush=True);initial=p.evaluate(query);assert initial['playing'] and initial['fixed'] and 'prisoner-bound-back' in initial['key']
 frames=set()
 for _ in range(10):
  state=p.evaluate(query);frames.add(state['frame']);assert state['y']==initial['y'] and state['scale']==initial['scale'];p.wait_for_timeout(150)
 assert len(frames)>=3,frames
 assert not p.evaluate(W+".propViews.some(v=>v.id==='prisionero-se-queda')")
 assert not p.evaluate(W+'.companion?.active')
 p.evaluate(W+".faceCharacter('prisionero')");assert p.evaluate(query)['flip']==initial['flip']
 assert not p.evaluate(W+'.dataDef.lighting.lights?.length')
 p.screenshot(path='captures/prisioneros-encadenados-sombras.png')
 report['bound_back_animation_has_distinct_frames_stable_feet_and_fixed_facing']=True
 p.locator('#core-close-preview').click();p.locator('#core-object').select_option('prisionero-encadenado')
 p.wait_for_selector('#world-instance-sprite');assert p.locator('#world-instance-sprite').input_value()=='prisoner-bound-back';assert p.locator('#world-instance-fixed').is_checked()
 p.locator('#world-instance-sprite').select_option('');p.wait_for_function("window.__sofiaGame.scene.getScene('World').propViews.some(v=>v.id==='prisionero-encadenado'&&v.obj.type==='Image')")
 p.locator('#world-instance-sprite').select_option('prisoner-bound-back');p.wait_for_function("window.__sofiaGame.scene.getScene('World').propViews.some(v=>v.id==='prisionero-encadenado'&&v.obj.type==='Sprite')")
 report['appearance_is_editable_per_instance']=True
 # A separate played fixture checks release: never modify the author's real save.
 c2=b.new_context(viewport={'width':932,'height':430},has_touch=True)
 fixture={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'prisioneros','interiorX':230,'flags':['lampara_encendida','prisionero_liberado']}}}
 c2.add_init_script("if(!localStorage.getItem('bound-fixture')){localStorage.setItem('bound-fixture','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',"+json.dumps(json.dumps(fixture))+")}")
 q=c2.new_page();q.on('pageerror',lambda e:(errors.append(str(e)),print('page error',str(e),flush=True)));q.goto(URL);q.locator('[data-action=continue-mode]').click(timeout=120000)
 q.wait_for_function(W+'.companion?.active',timeout=120000)
 assert not q.evaluate(W+".propViews.some(v=>v.id==='prisionero-encadenado')")
 assert q.evaluate(W+".companion.getData('characterId')")== 'prisionero'
 q.screenshot(path='captures/prisionero-liberado-movil.png')
 report['released_same_identity_uses_free_companion_without_bound_duplicate']=True
 assert not errors,errors;report.update(browser_errors=errors,physical_phone_tested=False)
 Path('captures/bound-prisoner-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
