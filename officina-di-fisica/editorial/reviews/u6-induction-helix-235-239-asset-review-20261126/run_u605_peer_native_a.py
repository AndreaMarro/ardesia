from pathlib import Path
import subprocess,json,hashlib,time
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/u6-induction-helix-235-239-asset-review-20261126';D.mkdir(exist_ok=True)
for batch in ['faraday-average-emf-235','motional-emf-236','motional-induced-current-237','induced-transferred-charge-238','magnetic-helix-pitch-239']:
 begin=time.monotonic();r=subprocess.run(['node','/private/tmp/render_u605_peer_a.mjs',batch],capture_output=True,text=True);B=D/batch;B.mkdir(exist_ok=True);(B/'stdout.log').write_text(r.stdout);(B/'stderr.log').write_text(r.stderr);(B/'process-result.json').write_text(json.dumps({'scope':'Independent reviewer actual SVG-only subprocess result; no product UI or human approval','returncode':r.returncode,'elapsedSeconds':time.monotonic()-begin,'scriptSha256':hashlib.sha256(Path('/private/tmp/render_u605_peer_a.mjs').read_bytes()).hexdigest()},indent=2)+'\n');print(batch,'ACTUAL_SUBPROCESS_EXIT',r.returncode,flush=True)
 if r.returncode:raise SystemExit(r.returncode)
