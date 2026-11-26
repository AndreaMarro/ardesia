from pathlib import Path
import subprocess,json,hashlib,time
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/u7-nuclei-optics-255-259-asset-review-20261126';D.mkdir(exist_ok=True)
for batch in ['beta-minus-atomic-number-255','gamma-transition-energy-256','snell-refracted-sine-257','critical-angle-sine-258','thin-lens-real-image-259']:
 begin=time.monotonic();r=subprocess.run(['node','/private/tmp/render_u702_peer_a.mjs',batch],capture_output=True,text=True);B=D/batch;B.mkdir(exist_ok=True);(B/'stdout.txt').write_text(r.stdout);(B/'stderr.txt').write_text(r.stderr);(B/'process-result.json').write_text(json.dumps({'scope':'Independent reviewer actual SVG-only subprocess result; no product UI or human approval','returncode':r.returncode,'elapsedSeconds':time.monotonic()-begin,'scriptSha256':hashlib.sha256(Path('/private/tmp/render_u702_peer_a.mjs').read_bytes()).hexdigest()},indent=2)+'\n');print(batch,'ACTUAL_SUBPROCESS_EXIT',r.returncode,flush=True)
 if r.returncode:raise SystemExit(r.returncode)
