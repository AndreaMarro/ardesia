from pathlib import Path
import subprocess,sys,json
OUT=Path(__file__).resolve().parent
subprocess.run([sys.executable,'-B',str(OUT/'collect.py')],check=True)
r=subprocess.run(['node',str(OUT/'census-arrows.mjs')],capture_output=True,text=True,check=True,timeout=45)
(OUT/'actual-arrow-census.json').write_text(json.dumps(json.loads(r.stdout),ensure_ascii=False,indent=2)+'\n')
print('actual census exit0')
