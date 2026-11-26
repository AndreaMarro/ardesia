from pathlib import Path
import subprocess,json,hashlib,time
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/u7-photons-attenuation-245-249-asset-review-20261126';D.mkdir(exist_ok=True)
for batch in ['photon-packet-wavelength-245','beer-transmitted-intensity-246','optical-depth-247','two-layer-transmission-248','infer-attenuation-coefficient-249']:
 begin=time.monotonic();r=subprocess.run(['node','/private/tmp/render_u701_peer_a.mjs',batch],capture_output=True,text=True);B=D/batch;B.mkdir(exist_ok=True);(B/'stdout.txt').write_text(r.stdout);(B/'stderr.txt').write_text(r.stderr);(B/'process-result.json').write_text(json.dumps({'scope':'Independent reviewer actual SVG-only subprocess result; no product UI or human approval','returncode':r.returncode,'elapsedSeconds':time.monotonic()-begin,'scriptSha256':hashlib.sha256(Path('/private/tmp/render_u701_peer_a.mjs').read_bytes()).hexdigest()},indent=2)+'\n');print(batch,'ACTUAL_SUBPROCESS_EXIT',r.returncode,flush=True)
 if r.returncode:raise SystemExit(r.returncode)
