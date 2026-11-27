import importlib,json,os,sys,tempfile
from pathlib import Path
sys.path.insert(0,str(Path.cwd()))
from tools.corpus_engineering.pipeline import digest,git_bytes,canonical
from tools.corpus_engineering.review_contract import exact_choice_identity
batch=sys.argv[1];family=batch
m=importlib.import_module('tools.corpus_engineering.'+family.replace('-','_')+'_authoring')
p,b=m.assemble(Path('..'),'5d1dc8dc7b601aef959d10d564c75462be74708d')
assert p==json.loads(Path('editorial/batches/'+batch+'.json').read_text()) and b==json.loads(Path('editorial/batches/'+batch+'-bindings.json').read_text())
source={r['id']:r for r in json.loads(git_bytes(Path('..'),b[0]['sourceRef'],b[0]['provenance']['sourcePath']))}
for r,z in zip(p['records'],b):
 assert digest(r)==z['candidateSha256'] and digest(source[z['sourceId']])==z['sourceSha256'] and digest(z['provenance'])==z['provenanceSha256']
 assert z['provenance']['status']=='DRAFT' and z['provenance']['humanApproval']=='NOT_RUN' and z['provenance']['independentReview']=='NOT_RUN'
 if r['answer']['type']=='choice':
  opts=r['answer']['options'];assert len(set(opts))==len(opts)==5 and opts.count(r['answer']['value'])==1
  recognized=[q for o in opts if (q:=exact_choice_identity(o)) is not None];assert len(recognized)==len(set(recognized)),r['id']
with tempfile.TemporaryDirectory(prefix='cric-contact-b-author-') as home:
 os.environ['ASTRA_DATA']=home;os.environ['ASTRA_HOSTED']='0'
 from server import store
 from tools.corpus_engineering.draft_import import import_drafts
 store.initialize()
 with store.connect() as db:
  before=store.published(db);oldheads={r['id']:db.execute('SELECT live FROM heads WHERE id=?',(r['id'],)).fetchone()[0] for r in p['records']};first=import_drafts(db,{'id':'owner','role':'autore'},p);second=import_drafts(db,{'id':'owner','role':'autore'},p);after=store.published(db)
  assert first['saved']==len(p['records']) and second['saved']==0 and second['unchanged']==len(p['records']) and store.encode(before)==store.encode(after)
  assert all(db.execute('SELECT live FROM heads WHERE id=?',(r['id'],)).fetchone()[0]==oldheads[r['id']] for r in p['records'])
  assert all(r['id']==z['sourceId'] and r['baseVersion']==source[r['id']]['version'] and r['version']==r['baseVersion']+1 and r['family']==source[r['id']]['family'] and r['difficulty']==source[r['id']]['difficulty'] and r['prerequisites']==source[r['id']]['prerequisites'] and r.get('exam')==source[r['id']].get('exam') for r,z in zip(p['records'],b))
  out={'scope':'author_structural_checks_only_not_scientific_review','batch':batch,'records':len(p['records']),'sourceRef':b[0]['sourceRef'],'sourcePath':b[0]['provenance']['sourcePath'],'packageSha256':digest(p),'bindingsSha256':digest(b),'regeneration':'identical','bindings':'source_candidate_provenance_matched','recognizedLiteralDuplicates':0,'database':'disposable_sqlite','firstImport':first,'secondImport':second,'publishedCount':len(after),'publishedSha256':digest(after),'publishedBytes':'unchanged','newLiveHeads':0,'existingLiveHeads':'unchanged','sourceVersions':'individual baseVersion preserved','scientificReview':'NOT_RUN','humanApproval':'NOT_RUN','publication':'DRAFT'}
 Path('editorial/author-notes/'+batch+'-structural.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(canonical(out))
