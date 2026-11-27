from pathlib import Path
import subprocess,sys,json
OUT=Path(__file__).resolve().parent
subprocess.run([sys.executable,'-B',str(OUT/'collect.py')],check=True)
for name,out in [('census-arrows.mjs','actual-arrow-census.json'),('fallback-probe.mjs','actual-fallback-probe.json')]:
 run=subprocess.run(['node',str(OUT/name)],capture_output=True,text=True,check=True,timeout=45);(OUT/out).write_text(json.dumps(json.loads(run.stdout),ensure_ascii=False,indent=2)+'\n');print(name,'exit0')
