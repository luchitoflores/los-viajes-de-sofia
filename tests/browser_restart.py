from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
P="window.__sofiaGame.scene.getScene('Planet')";U='sofia-universe-progress-v1';L='sofia_phaser_real_v02';R='sofia-polis-radial-v1'
report={};errors=[]
def planet():
 def obj(kind,angle,id):return {'id':id,'kind':kind,'label':'Mi '+kind,'angleDeg':angle,'height':0,'scale':1,'rotation':0,'flip':False,'interaction':'ship' if kind=='ship' else 'talk','to':'library','collision':False,'collisionWidth':40,'collisionHeight':50}
 return {'version':1,'angle':1.2,'collected':['old-collectible'],'discovered':['old-discovery'],'returnAnchor':None,'objects':[obj('ship',-26,'my-ship'),obj('philosopher',0,'philosopher')]}
rooms={'library':{'items':[{'id':'author-vase','type':'vase','x':500,'y':470,'label':'Objeto del autor'}],'regions':[{'id':'floor','type':'floor','x':0,'y':470,'w':1900,'h':70}]}}
free={'version':1,'last':'sartre','worlds':{'sartre':{'introComplete':True,'flags':['intro-complete','cafe-complete','choice-complete'],'completed':['cafe-pairs'],'choices':{'young-person-choice':'care'}},'kant':{'introComplete':True,'flags':['intro-complete','kant-duty']}},'characterMemory':{'sartre':['sartre:arrival']},'journeys':[]}
story={'version':1,'last':'kant','worlds':{'kant':{'introComplete':True,'flags':['intro-complete','kant-duty']},'hegel':{'introComplete':True,'flags':['intro-complete'],'choices':{'previous-choice':'keep'}}},'characterMemory':{'kant':['kant:arrival']}}
legacy={'level':'polis','flags':{'freed':True,'caveCompleted':True,'plato':True},'learned':['opinion','doubt'],'met':['plat','desc'],'memories':['light'],'seen':['polis'],'positions':{},'userScenes':rooms}
seeds={U:json.dumps(free),U+'-story':json.dumps(story),L:json.dumps(legacy),L+'-story':json.dumps(legacy),R:json.dumps(planet()),R+'-story':json.dumps(planet()),'sofia-play-mode-v1':'free'}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 ctx=b.new_context(viewport={'width':1440,'height':960},has_touch=True);ctx.add_init_script("if(!localStorage.getItem('test-restart-seeded')){const s="+json.dumps(seeds)+";for(const [k,v] of Object.entries(s))localStorage.setItem(k,v);localStorage.setItem('test-restart-seeded','1')}")
 page=ctx.new_page();page.on('pageerror',lambda e:(errors.append(str(e)),print(str(e),flush=True)))
 def ready():page.wait_for_function("window.__sofiaGame?.scene.getScene('Planet')?.player?.active",timeout=120000)
 def raw(key):return page.evaluate('(key)=>localStorage.getItem(key)',key)
 def saved(key):return json.loads(raw(key))
 def resume():
  if page.locator('[data-action="continue-mode"]').is_visible():page.locator('[data-action="continue-mode"]').click()
  elif page.locator('body.story-selecting').count():
   id=page.evaluate(P+'.currentContext?.id??"plato"');page.locator(f'[data-planet="{id}"]').click();page.wait_for_function("document.body.classList.contains('ship-cinematic')");page.wait_for_function("!document.body.classList.contains('ship-cinematic')",timeout=60000)
 def open_reset(scope):page.locator('#pause').click();page.locator('[data-action="restart-menu"]').click();page.locator(f'[data-action="restart-{scope}"]').click()
 def confirm():
  with page.expect_navigation(wait_until='domcontentloaded'):page.locator('[data-action="confirm-restart"]').click()
  ready();page.wait_for_selector('[data-planet="plato"]' if page.evaluate("localStorage.getItem('sofia-play-mode-v1')")=="story" else '[data-action="continue-mode"]')
 def switch(mode):
  page.locator('#pause').click();page.locator('[data-action="play-modes"]').click()
  with page.expect_navigation(wait_until='domcontentloaded'):page.locator(f'[data-action="mode-{mode}"]').click()
  ready();page.wait_for_timeout(200)
  if mode=='story':page.wait_for_selector('[data-planet="plato"]');resume()
 page.goto(os.environ.get('SOFIA_URL','http://127.0.0.1:4173/'),wait_until='domcontentloaded');ready();resume()
 # Diseños del autor en IndexedDB: el reinicio de progreso nunca debe borrarlos.
 page.evaluate("""async()=>{const w=await(await fetch('worlds/sartre.json')).json();w.title='Mi edición de Sartre';await new Promise((resolve,reject)=>{const r=indexedDB.open('sofia-world-editor',3);r.onsuccess=()=>{const d=r.result,t=d.transaction(['worlds','resources'],'readwrite');t.objectStore('worlds').put(w);t.objectStore('resources').put({src:'assets/polis-vase.png',kind:'vase',width:34,height:44,label:'Mi recurso'},'author-resource');t.oncomplete=()=>{d.close();resolve()};t.onerror=reject}})}""")
 def designs():return page.evaluate("""()=>new Promise((resolve,reject)=>{const r=indexedDB.open('sofia-world-editor',3);r.onsuccess=()=>{const d=r.result,t=d.transaction(['worlds','resources'],'readonly'),a=t.objectStore('worlds').get('sartre'),b=t.objectStore('resources').get('author-resource');t.oncomplete=()=>{resolve([a.result.title,b.result.label]);d.close()};t.onerror=reject}})""")
 other=raw(U+'-story');open_reset('world');page.screenshot(path='captures/confirmar-reinicio.png');page.locator('[data-action="cancel-restart"]').click();assert saved(U)['worlds']['sartre']['choices']['young-person-choice']=='care';report['cancel_preserves_progress']=True
 open_reset('world');confirm();p=saved(U)['worlds'];assert not p['sartre']['introComplete'];assert not p['sartre']['completed'];assert not p['sartre']['choices'];assert 'kant-duty' in p['kant']['flags'];assert raw(U+'-story')==other;assert saved(L)['flags']['freed'];assert designs()==['Mi edición de Sartre','Mi recurso'];report['world_reset_preserves_other_world_mode_and_editor']=True
 resume();switch('story');assert page.evaluate(P+'.currentContext.id')=='kant';page.locator('[data-tab="galaxy"]').click();assert page.locator('[data-planet="hegel"]').is_enabled();assert page.locator('[data-planet="heidegger"]').is_disabled();assert page.locator('.world-lock').count()==3
 assert page.locator('[data-planet]').evaluate_all("nodes=>nodes.map(n=>n.dataset.planet)")==['plato','kant','hegel','heidegger','sartre','camus'];page.locator('[data-run="resume"]').click()
 open_reset('world');confirm();assert not saved(U+'-story')['worlds']['kant']['introComplete'];assert saved(U+'-story')['worlds']['hegel']['choices']['previous-choice']=='keep';resume();page.locator('[data-tab="galaxy"]').click();assert page.locator('[data-planet="hegel"]').is_disabled();assert page.locator('[data-planet="kant"]').is_enabled();assert page.locator('.world-lock').count()==4;page.screenshot(path='captures/historia-planetas-con-candado.png');page.locator('[data-run="resume"]').click();report['story_world_reset_relocks_later_planets_preserving_their_progress']=True
 free_before=raw(U);open_reset('mode');assert 'todos los mundos' in page.locator('#panel').inner_text();confirm();assert raw(U)==free_before;assert not saved(L+'-story')['flags'];assert saved(L+'-story')['userScenes']==rooms;assert not saved(R+'-story')['collected'];assert saved(R+'-story')['objects']==planet()['objects'];assert designs()==['Mi edición de Sartre','Mi recurso'];resume()
 page.set_viewport_size({'width':932,'height':430});page.locator('[data-tab="galaxy"]').click();assert page.locator('.world-lock').count()==5;assert page.locator('[data-planet="plato"]').is_enabled()
 page.wait_for_function("[...document.querySelectorAll('[data-planet] img')].every(i=>i.complete&&i.naturalWidth>0)")
 box=page.locator('[data-planet="kant"] .world-lock').bounding_box();assert box and box['width']>=45;page.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2);assert page.locator('#veil.visible').count();assert page.evaluate(P+'.currentContext') is None;page.screenshot(path='captures/candados-historia-movil.png');page.locator('[data-run="resume"]').click();report['mode_reset_preserves_layout_and_locks_five_planets']=True;report['mobile_lock_is_visible_and_touch_cannot_enter']=True
 switch('free');assert page.evaluate(P+'.currentContext.id')=='sartre';page.locator('[data-tab="galaxy"]').click();assert page.locator('.world-lock').count()==0;assert page.locator('[data-planet]:disabled').count()==0;page.locator('[data-run="resume"]').click();story_before=raw(U+'-story');open_reset('mode');confirm();assert raw(U+'-story')==story_before;assert 'sartre' not in saved(U)['worlds'];assert 'kant' not in saved(U)['worlds'];assert saved(L)['userScenes']==rooms;assert saved(R)['objects']==planet()['objects'];assert designs()==['Mi edición de Sartre','Mi recurso'];report['free_mode_reset_is_independent_and_preserves_authored_content']=True
 page.reload(wait_until='domcontentloaded');ready();assert 'sartre' not in saved(U)['worlds'];assert not saved(L)['flags'];report['autosave_does_not_restore_erased_progress_after_reload']=True
 assert not errors,errors;report['browser_errors']=errors;report['physical_phone_tested']=False;Path('captures/restart-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report),flush=True);b.close()
