from pathlib import Path
import subprocess,sys,json
ROOT=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica');OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
before=runtime_fingerprint(ROOT);assert before['sha256']=='3713dfb21a6b3ebad42f8bf24b163af7646793fb5327b1b3ae5d543391c0bfe1'
for name,expected,label in [('fallback-probe-before-dom-stub.mjs',1,'actual-dom-bootstrap-negative'),('fallback-probe.mjs',0,'actual-fallback-positive')]:
 r=subprocess.run(['node',str(OUT/name)],capture_output=True,text=True,timeout=45);(OUT/(label+'-stdout.txt')).write_text(r.stdout);(OUT/(label+'-stderr.txt')).write_text(r.stderr);assert r.returncode==expected,(label,r.returncode)
 if not expected:(OUT/'actual-fallback-probe.json').write_text(json.dumps(json.loads(r.stdout),ensure_ascii=False,indent=2)+'\n')
assert runtime_fingerprint(ROOT)==before
print('Expected bootstrap negative retained; actual SVG producer exit0; no browser UI observed')
