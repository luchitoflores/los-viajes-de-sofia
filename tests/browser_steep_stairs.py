from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os
URL=os.environ.get('SOFIA_URL','http://127.0.0.1:4173/');W="window.__sofiaGame.scene.getScene('World')";w=json.loads(Path('public/worlds/plato.json').read_text());events=['event:'+id+':'+e['id'] for id,r in w['interiors'].items() for e in r.get('events',[])];errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1280,'height':800})
 c.add_init_script("""{const native=requestAnimationFrame.bind(window),cancel=cancelAnimationFrame.bind(window),jobs=new Map();let id=0;window.requestAnimationFrame=fn=>{const key=++id,started=performance.now();const next=t=>{if(!jobs.has(key))return;if(t-started>=49){jobs.delete(key);fn(t)}else jobs.set(key,native(next))};jobs.set(key,native(next));return key};window.cancelAnimationFrame=key=>{const nativeId=jobs.get(key);jobs.delete(key);if(nativeId)cancel(nativeId)}}""")
 fixture={'version':1,'last':'plato','worlds':{'plato':{'introComplete':True,'interior':'ascenso','interiorX':905,'flags':['lampara_encendida','prisionero_liberado']+events,'trail':[{'interior':'prisioneros','x':700}]}}}
 c.add_init_script("localStorage.setItem('sofia-play-mode-v1','free');localStorage.setItem('sofia-universe-progress-v1',"+json.dumps(json.dumps(fixture))+")")
 p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.goto(URL,wait_until='domcontentloaded');p.locator('[data-action=continue-mode]').click(timeout=120000);p.wait_for_function(W+'.player?.active',timeout=60000);p.wait_for_timeout(500)
 def go(id,scene):
  point=p.evaluate("()=>{const s="+W+",c=s.cameras.main,r=s.game.canvas.getBoundingClientRect(),z=s.propViews.find(v=>v.id==='"+id+"'&&v.obj.type==='Zone').obj,a=z.getCenter(),q=c.matrix.transformPoint(a.x-c.scrollX,a.y-c.scrollY);return{x:r.left+q.x*r.width/s.scale.width,y:r.top+q.y*r.height/s.scale.height}}")
  p.mouse.click(point['x'],point['y']);p.wait_for_function(W+".sys.isActive()&&"+W+".dataDef.name==='"+w['interiors'][scene]['name']+"'",timeout=25000);p.wait_for_timeout(500)
 go('ascenso-prisioneros','prisioneros');go('prisioneros-ascenso','ascenso');go('ascenso-salida','salida');assert not errors,errors;report={'descending_and_ascending_steep_stairs_at_emulated_20fps':True,'browser_errors':errors,'physical_phone_tested':False};Path('captures/steep-stairs-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report),flush=True);b.close()
