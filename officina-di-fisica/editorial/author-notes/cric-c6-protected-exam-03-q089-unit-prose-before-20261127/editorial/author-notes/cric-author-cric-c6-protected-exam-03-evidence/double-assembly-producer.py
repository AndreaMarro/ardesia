from pathlib import Path
import importlib,json,sys
from tools.corpus_engineering.pipeline import canonical
batch=sys.argv[1];m=importlib.import_module('tools.corpus_engineering.'+batch.replace('-','_')+'_authoring');a,b=m.assemble(Path('..'),'5d1dc8dc7b601aef959d10d564c75462be74708d');c,d=m.assemble(Path('..'),'5d1dc8dc7b601aef959d10d564c75462be74708d');assert canonical(a)==canonical(c) and canonical(b)==canonical(d);Path('editorial/batches/'+batch+'.json').write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');Path('editorial/batches/'+batch+'-bindings.json').write_text(canonical(b)+'\n');print(batch,str(len(a['records']))+' genuine drafts;two assemblies byte-identical;SCI/human NOT_RUN',flush=True)
