"""Isolated saved-game fixtures; never touches the author's browser profile."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4181/')
W="window.__sofiaGame.scene.getScene('World')"
OUT=Path('captures');OUT.mkdir(exist_ok=True)
world=json.loads(Path('public/worlds/plato.json').read_text(encoding='utf8'))
flags=['lampara_encendida','aventura_platon_completada','prisionero_liberado','prisionero_sale','decision_final_prisionero']
flags += ['event:'+room+':'+e['id'] for room,data in world['interiors'].items() for e in data.get('events',[])]
seed={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'flags':flags,'interior':'salida','interiorX':300},'sartre':{'introComplete':True}}}
errors=[];report={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':960},has_touch=True)
 context.add_init_script("sessionStorage.setItem('loads',String(Number(sessionStorage.getItem('loads')||0)+1));if(!localStorage.getItem('qa-seeded')){localStorage.setItem('qa-seeded','1');localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',JSON.stringify("+json.dumps(seed)+"))}")
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='domcontentloaded');page.wait_for_selector('[data-action="continue-mode"]',timeout=120000);page.locator('[data-action="continue-mode"]').click()
 page.wait_for_function(W+".player?.active&&"+W+".sys.isActive()",timeout=120000)
 page.wait_for_timeout(500);print('Playing',flush=True)
 page.locator('[data-tab="philosophers"]').click();page.wait_for_selector('[data-author="plato"]');assert page.locator('[data-author="sartre"]').count()==1
 assert page.locator('.unknown-author').count()>0
 page.locator('[data-author="sartre"]').click();assert '1905' in page.locator('#panel').inner_text();assert 'Obras' in page.locator('#panel').inner_text()
 page.locator('[data-collection-tab="memories"]').click();page.wait_for_selector('[data-knowledge]');assert 'Platón' in page.locator('#panel').inner_text()
 page.locator('[data-knowledge]').filter(has_text='Pergamino de conocimiento').click();assert 'caverna' in page.locator('#panel').inner_text().lower()
 page.screenshot(path=str(OUT/'pergamino-platon-recuperado.png'));page.locator('#collection-close').click();report['retrospective_scroll_and_global_met_authors']=True;print('Collections verified',flush=True)
 page.keyboard.down('ArrowUp');page.wait_for_function(W+'.jumpState.airborne',timeout=10000);page.keyboard.up('ArrowUp');page.wait_for_function('!'+W+'.jumpState.airborne',timeout=5000);report['actual_keyboard_jump']=True
 portal=page.evaluate(W+".propViews.filter(v=>v.id==='salida-planeta').map(v=>({type:v.obj.type,alpha:v.obj.alpha,open:v.obj.getData('portal-open')}))")
 assert any(v.get('open') for v in portal),portal;report['completed_portal_open']=True
 page.locator('[data-tab="editor"]').click();page.wait_for_selector('#core-play');page.wait_for_timeout(1200)
 loads=page.evaluate("sessionStorage.getItem('loads')");page.locator('#core-play').click();page.wait_for_selector('body:not(.core-mode)',timeout=15000)
 assert page.evaluate("sessionStorage.getItem('loads')")==loads;assert not page.locator('dialog[open]').count();report['clean_editor_close_without_reload']=True
 page.locator('[data-tab="editor"]').click();page.wait_for_selector('#core-play');page.wait_for_timeout(900)
 page.locator('#core-object').select_option('salida-planeta');page.wait_for_selector('#core-object-tooltip');old=page.locator('#core-object-tooltip').input_value()
 page.locator('#core-object-tooltip').fill('Cambio para descartar');page.locator('#core-object-form button[type="submit"]').click();page.wait_for_timeout(1600)
 page.locator('#core-play').click();page.wait_for_selector('dialog[open]');page.locator('[data-exit="discard"]').click();page.wait_for_timeout(1000)
 assert page.evaluate("sessionStorage.getItem('loads')")==loads
 page.locator('[data-tab="editor"]').click();page.wait_for_selector('#core-object');page.locator('#core-object').select_option('salida-planeta');page.wait_for_selector('#core-object-tooltip');assert page.locator('#core-object-tooltip').input_value()==old
 page.locator('#core-play').click();page.wait_for_timeout(500);report['discard_restores_previous_design']=True;print('Discard verified',flush=True)
 page.locator('[data-tab="editor"]').click();page.wait_for_selector('#core-object');page.locator('#core-object').select_option('salida-planeta');page.wait_for_selector('#core-object-tooltip')
 page.locator('#core-object-tooltip').fill('Portal editado y conservado');page.locator('#core-play').click();page.wait_for_selector('dialog[open]');page.locator('[data-exit="save"]').click();page.wait_for_function("!document.body.classList.contains('core-mode')",timeout=30000)
 page.wait_for_function(W+'.player?.active&&'+W+'.sys.isActive()',timeout=30000);assert page.evaluate("sessionStorage.getItem('loads')")==loads;report['save_unsent_form_and_return_without_browser_reload']=True;print('Save verified',flush=True)
 page.locator('[data-tab="editor"]').click();page.wait_for_selector('#core-object');page.locator('#core-object').select_option('salida-planeta');page.wait_for_selector('#core-object-tooltip');assert page.locator('#core-object-tooltip').input_value()=='Portal editado y conservado'
 page.locator('#core-scene-settings').click();page.wait_for_selector('#scene-physical-floor');page.locator('#scene-physical-floor').fill('685');page.locator('#scene-settings-form button[type="submit"]').click();page.wait_for_timeout(1800)
 page.wait_for_function(W+'.dataDef.floor===685',timeout=30000)
 page.locator('#core-play').click();page.wait_for_selector('dialog[open]');page.locator('[data-exit="save"]').click();page.wait_for_function("!document.body.classList.contains('core-mode')",timeout=30000);page.wait_for_function(W+'.player?.active&&'+W+'.sys.isActive()',timeout=30000)
 assert page.evaluate(W+'.dataDef.floor')==685;report['lower_floor_editor_save_and_execution']=True
 page.set_viewport_size({'width':932,'height':430});page.wait_for_timeout(700)
 r=page.locator('canvas').bounding_box();x=r['x']+r['width']*.4;y=r['y']+r['height']*.7
 touch=page.context.new_cdp_session(page);touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});touch.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-65}]});touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 page.wait_for_function(W+'.jumpState.airborne',timeout=5000);page.wait_for_function('!'+W+'.jumpState.airborne',timeout=5000);report['mobile_landscape_real_touch_swipe_jump']=True
 assert not errors,errors
 report['physical_phone_tested']=False
 (OUT/'travel-collections-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False),flush=True)
 browser.close()
