from playwright.sync_api import sync_playwright
from pathlib import Path
import json
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1440,'height':960});p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto('http://127.0.0.1:4173/#/edicion?world=sartre');p.wait_for_selector('#core-new-world',timeout=120000);p.locator('#core-new-world').click();p.locator('#new-world-title').fill('Mundo local de prueba');p.locator('#new-world-author').fill('Autor de prueba');p.locator('#new-world-author-id').fill('autor-local-prueba');p.locator('#new-world-form button[type="submit"]').click();p.wait_for_function("document.querySelector('#core-world')?.selectedOptions[0].textContent==='Mundo local de prueba'",timeout=60000);id=p.locator('#core-world').input_value();p.reload();p.wait_for_function("id=>document.querySelector('#core-world')?.value===id",arg=id,timeout=120000);p.wait_for_selector('#editor:not([hidden])');assert not p.locator('#core-status.error').count()
 for route in ['dialogos','preguntas','edicion']:
  p.evaluate("hash=>location.hash=hash",'/'+route+'?world='+id);p.wait_for_function("id=>document.querySelector('#core-world')?.value===id",arg=id);p.wait_for_timeout(300);assert not p.locator('#core-status.error').count()
 p.screenshot(path='captures/mundo-local-sin-error-json.png');assert not errors,errors;Path('captures/local-world-json-validation.json').write_text(json.dumps({'new_world_reload_all_authoring_routes':True,'browser_errors':errors}));print('Local world survives reload and all authoring routes',flush=True);b.close()
