import json,math,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SOFIA_URL','http://127.0.0.1:5173')
OUT=Path('captures');OUT.mkdir(exist_ok=True)
SCENE="window.__sofiaGame.scene.getScene('Planet')"
errors=[];report={}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,timeout=30000,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':960},has_touch=True)
 page=context.new_page()
 page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR:',e,flush=True)))
 page.goto(BASE,wait_until='domcontentloaded',timeout=120000)
 page.wait_for_function("window.__sofiaGame?.scene?.isActive('Planet')",timeout=120000)
 page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None
 page.wait_for_timeout(800)
 print('Phaser running',flush=True)
 page.screenshot(path=str(OUT/'polis-cercana.png'))
 start=page.evaluate(f'{SCENE}.bodyState.angle')
 page.keyboard.down('ArrowRight')
 page.wait_for_function(f'{SCENE}.bodyState.angle >= {start+2*math.pi}',timeout=120000)
 page.keyboard.up('ArrowRight')
 end=page.evaluate(f'{SCENE}.bodyState.angle')
 assert end-start>=2*math.pi
 page.keyboard.down('ArrowLeft')
 page.wait_for_function(f'{SCENE}.bodyState.angle <= {start}',timeout=120000)
 page.keyboard.up('ArrowLeft')
 page.wait_for_function(f'!{SCENE}.cursors.left.isDown && !{SCENE}.cursors.right.isDown')
 stopped=page.evaluate(f'{SCENE}.bodyState.angle');assert stopped<=start
 page.wait_for_timeout(200);assert abs(page.evaluate(f'{SCENE}.bodyState.angle')-stopped)<1e-7
 report['keyboard_release_stops']=True
 report['clockwise_degrees']=(end-start)*180/math.pi
 report['counterclockwise_degrees']=(end-page.evaluate(f'{SCENE}.bodyState.angle'))*180/math.pi
 print('360 degrees in both directions verified',flush=True)
 page.keyboard.press('Space');page.wait_for_timeout(300)
 assert page.evaluate(f'{SCENE}.bodyState.height')==0
 report['no_unrequested_jump']=True
 def travel(degrees):
  angle=page.evaluate(f'{SCENE}.bodyState.angle');target=degrees*math.pi/180
  diff=math.atan2(math.sin(target-angle),math.cos(target-angle));key='ArrowRight' if diff>0 else 'ArrowLeft'
  page.keyboard.down(key)
  page.wait_for_function(f'Math.abs(Math.atan2(Math.sin({SCENE}.bodyState.angle-{target}),Math.cos({SCENE}.bodyState.angle-{target}))) < .025',timeout=45000)
  page.keyboard.up(key)
 travel(0);page.keyboard.press('e');page.locator('[data-action="reasons"]').click();page.locator('[data-action="close"]').click()
 report['philosopher']=True
 travel(85);page.keyboard.press('e');page.locator('[data-action="close"]').click()
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia-polis-radial-v1')).collected.includes('scroll')")
 report['collectible']=True
 for angle,interior in [(190,'entrance'),(35,'library')]:
  travel(angle);before=page.evaluate(f'{SCENE}.bodyState.angle');page.keyboard.press('e')
  page.wait_for_function(f"window.__sofiaGame.scene.isActive('World') && window.__sofiaGame.scene.getScene('World').place==='{interior}'",timeout=30000)
  page.wait_for_function("window.__sofiaGame.scene.getScene('World').player?.body?.enable",timeout=30000);page.wait_for_timeout(700)
  page.screenshot(path=str(OUT/f'interior-{interior}.png'))
  if interior=='entrance':page.keyboard.press('e')
  else:page.locator('#planet-exit').click()
  page.wait_for_function("window.__sofiaGame.scene.isActive('Planet')",timeout=30000)
  after=page.evaluate(f'{SCENE}.bodyState.angle')
  assert abs(before-after)<1e-8,(before,after)
  report['return_'+interior]=True
 print('Interactions, cave, library and exact returns verified',flush=True)
 page.locator('#planet-view').click();page.wait_for_timeout(1300)
 page.screenshot(path=str(OUT/'polis-completa.png'))
 assert page.evaluate(f'{SCENE}.cameras.main.zoom')<.4
 # The actual terrain image never rotates: the body changes world coordinates and the camera compensates.
 assert page.evaluate(f"{SCENE}.children.list.find(o=>o.texture?.key==='planet-terrain.png').rotation") == 0
 page.locator('[data-tab="editor"]').click();page.wait_for_timeout(1200)
 assert page.evaluate(f"{SCENE}.views.get('scroll').visible")
 def world_screen(x,y):
  return page.evaluate(f'''() => {{ const s={SCENE},c=s.cameras.main,r=s.game.canvas.getBoundingClientRect();const point=c.matrix.transformPoint(({x})-c.scrollX,({y})-c.scrollY);const inv=c.getWorldPoint(point.x,point.y);if(Math.hypot(inv.x-({x}),inv.y-({y}))>1)throw Error('Projection mismatch');return {{x:r.left+point.x/s.scale.width*r.width,y:r.top+point.y/s.scale.height*r.height}};}}''')
 def palette_drop(kind,degrees,touch=False):
  before=page.evaluate(f'{SCENE}.objects.length');bounds=page.locator(f'#planet-palette [data-kind="{kind}"]').bounding_box();assert bounds
  source={'x':bounds['x']+bounds['width']/2,'y':bounds['y']+bounds['height']/2};a=degrees*math.pi/180;target=world_screen(math.sin(a)*500,-math.cos(a)*500)
  if touch:
   client=context.new_cdp_session(page)
   client.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':source['x'],'y':source['y'],'id':1}]})
   for i in range(1,13):client.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':source['x']+(target['x']-source['x'])*i/12,'y':source['y']+(target['y']-source['y'])*i/12,'id':1}]})
   client.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});client.detach()
  else:
   page.mouse.move(source['x'],source['y']);page.mouse.down();page.mouse.move(target['x'],target['y'],steps=16);page.mouse.up()
  page.wait_for_timeout(150)
  assert page.evaluate(f'{SCENE}.objects.length')==before+1
  result=page.evaluate(f'{SCENE}.objects.at(-1)');assert abs(result['angleDeg']-degrees)<1;assert result['height']==0
  return result
 added=palette_drop('tree',105)
 palette_drop('house',-115,True)
 report['mouse_palette_drag']=True;report['touch_palette_drag']=True
 for key,value in [('angleDeg','120'),('height','18'),('scale','0.8'),('rotation','12'),('collisionWidth','45'),('collisionHeight','28')]:
  page.locator('#radial-'+key).fill(value);page.locator('#radial-'+key).press('Tab')
 page.locator('#radial-collision').check();page.locator('#radial-flip').check()
 edited=page.evaluate(f'{SCENE}.objects.at(-1)');assert edited['angleDeg']==120 and edited['height']==18 and edited['scale']==.8 and edited['collision'] and edited['flip']
 # Drag the independent placed sprite itself over the circular surface.
 center=page.evaluate(f"{SCENE}.views.get({json.dumps(edited['id'])}).getCenter()")
 source=world_screen(center['x'],center['y']);a=145*math.pi/180;target=world_screen(math.sin(a)*500,-math.cos(a)*500)
 page.mouse.move(source['x'],source['y']);page.mouse.down();page.mouse.move(target['x'],target['y'],steps=14);page.mouse.up();page.wait_for_timeout(150)
 assert abs(page.evaluate(f'{SCENE}.objects.at(-1).angleDeg')-145)<2
 report['surface_drag_and_properties']=True
 print('Mouse drag, touch drag and radial properties verified',flush=True)
 with page.expect_download() as download:page.locator('[data-e="export"]').click()
 exported=download.value.path();layout=json.loads(Path(exported).read_text(encoding='utf-8'));assert layout['format']=='sofia-radial-planet'
 n=page.evaluate(f'{SCENE}.objects.length');page.locator('#delete-selection').click();assert page.evaluate(f'{SCENE}.objects.length')==n-1
 page.locator('[data-e="undo"]').click();assert page.evaluate(f'{SCENE}.objects.length')==n
 page.locator('#import-input').set_input_files({'name':'planet.json','mimeType':'application/json','buffer':json.dumps(layout).encode()})
 page.wait_for_timeout(200);assert page.evaluate(f'{SCENE}.objects.length')==len(layout['objects'])
 page.screenshot(path=str(OUT/'editor-radial.png'))
 report['editor_export_import_undo']=True
 page.locator('[data-e="close"]').click();page.wait_for_timeout(300)
 current=page.evaluate(f'{SCENE}.bodyState.angle');page.reload(wait_until='domcontentloaded');page.wait_for_function("window.__sofiaGame?.scene?.isActive('Planet')",timeout=120000)
 page.locator('[data-action="start"]').click();page.locator('[data-run="choice-0"]').click() if page.locator('[data-run="choice-0"]').count() else None;assert abs(page.evaluate(f'{SCENE}.bodyState.angle')-current)<1e-7
 assert page.evaluate(f'{SCENE}.objects.length')==len(layout['objects'])
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia-polis-radial-v1')).collected.includes('scroll')")
 assert page.evaluate("JSON.parse(localStorage.getItem('sofia_phaser_real_v02')).met.includes('socr')")
 assert not page.evaluate(f"{SCENE}.views.get('scroll').visible")
 report['reload_persistence']=True
 assert not errors,errors
 report['browser_errors']=errors
 Path('captures/validation.json').write_text(json.dumps(report,indent=2),encoding='utf8')
 print(json.dumps(report,indent=2),flush=True)
 browser.close()


