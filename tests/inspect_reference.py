import sys
sys.stdout.reconfigure(encoding="utf-8")
from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('captures');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True,timeout=30000,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000})
 hits=[]
 page.on('response',lambda r: hits.append(r.url) if 'genial' in r.url and ('api' in r.url or '.json' in r.url) else None)
 try:
  page.goto('https://view.genially.com/6587a334899e670015f70abd',wait_until='domcontentloaded',timeout=60000)
  page.wait_for_timeout(9000)
  text=page.locator('body').inner_text();(out/'genially-reference.txt').write_text(text,encoding='utf-8');print(text[:18000],flush=True)
  page.screenshot(path=str(out/'genially-reference.png'),full_page=True)
  print('FRAMES',json.dumps([f.url for f in page.frames]),flush=True)
  print('DATA',json.dumps(hits),flush=True)
 except Exception as e: print('REFERENCE ERROR',str(e),flush=True)
 b.close()
