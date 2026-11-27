from pathlib import Path
import subprocess,sys,json
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127'
for group in ['draft-l002-02','draft-l002-03','draft-l003-01','original-stevino-correct-physics-rejected','original-stevino-installed-grader-accepted']:
 r=subprocess.run([sys.executable,'-B',str(D/'run-group-analysis.py'),group],cwd=A)
 if r.returncode!=0:raise SystemExit(r.returncode)
