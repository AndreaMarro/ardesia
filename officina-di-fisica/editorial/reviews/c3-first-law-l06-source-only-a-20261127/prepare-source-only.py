"""No Root blocks, source keys, formula or worked solution enter this allowlist."""
from pathlib import Path
import hashlib,json,subprocess
D=Path(__file__).resolve().parent;APP=D.parents[2]
SRC=APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127/original-source.verbatim.json'
assert hashlib.sha256(SRC.read_bytes()).hexdigest()=='2738799d5195ca5eda77c4dce1cdc79f708237e5660bb9cabcc7fac4f80ea3ff'
ALLOWED=('id','title','summary','interpretation','control','measure','transferPrompt','skill','section','prerequisites','apparatus','version')
rows=[{k:r[k]for k in ALLOWED if k in r}for r in json.loads(SRC.read_bytes())if r['id'].startswith('SIM-C3-L06-')]
assert len(rows)==4
(D/'source-prompts-allowlist.json').write_text(json.dumps(dict(sourceRef='5d1dc8dc7b601aef959d10d564c75462be74708d',sourcePath='officina-di-fisica/content/esperienze-C3.json',sourceWholeSha256=hashlib.sha256(SRC.read_bytes()).hexdigest(),allowlist=ALLOWED,excluded=['formula','substitution','references','blocks','review','drafts'],records=rows),ensure_ascii=False,sort_keys=True,indent=2)+'\n')
print('Four source prompts frozen; no candidate opened')
