from pathlib import Path
import sys,json
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');sys.path.insert(0,str(A))
from tools.corpus_engineering import c2_hydrostatic_reading_four_draft_review_a as v
r=v.report();(v.BASE/'independent-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print('Four distinct draft math/text reviews; eight installed tasks;76 legal states;UI_NOT_RUN')
