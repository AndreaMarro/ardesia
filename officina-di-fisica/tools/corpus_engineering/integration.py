"""Exercise the canonical import in disposable SQLite, preserving every published byte."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import re

from .pipeline import canonical, digest, sha
from .runtime_fingerprint import assert_bundled_runtime

APP = Path(__file__).resolve().parents[2]
CODE = '''
import json,sys
from server import store
from tools.corpus_engineering.draft_import import import_drafts
from tools.corpus_engineering.pipeline import canonical,digest
store.initialize()
package=json.load(open(sys.argv[1]))
with store.connect() as db:
 before=store.published(db)
 ids=[r['id'] for r in package['records']]
 live_before={key:(head[0] if (head:=db.execute('SELECT live FROM heads WHERE id=?',(key,)).fetchone()) else None) for key in ids}
 versions_before={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 first=import_drafts(db,{'id':'owner','role':'autore'},package)
 second=import_drafts(db,{'id':'owner','role':'autore'},package)
 after=store.published(db)
 assert store.encode(before)==store.encode(after)
 count=len(package['records'])
 assert first['saved']==count and second['saved']==0 and second['unchanged']==count
 assert all(db.execute('SELECT live FROM heads WHERE id=?',(key,)).fetchone()[0]==live_before[key] for key in ids)
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==payload for key,payload in versions_before.items())
 print(canonical({'schemaVersion':'1.0.0','packageSha256':digest(package),
  'beforePublishedCount':len(before),'afterPublishedCount':len(after),
  'beforePublishedSha256':digest(before),'afterPublishedSha256':digest(after),
  'firstImport':first,'repeatedImport':second,'verifiedIds':ids,
  'preservedLiveHeads':sum(v is not None for v in live_before.values()),'preservedHistoricalVersions':len(versions_before),
  'publication':'DRAFT','database':'disposable_sqlite','humanApproval':'NOT_RUN'}))
'''


def exercise(batch="units-001"):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}",batch):raise ValueError("Invalid batch ID")
    package=APP/"editorial/batches"/(batch+".json")
    return exercise_package(package)


def exercise_package(package):
    assert_bundled_runtime(APP)
    package=Path(package).resolve()
    with tempfile.TemporaryDirectory(prefix="cric-integration-") as home:
        run = subprocess.run([sys.executable, "-c", CODE, str(package)], cwd=APP,
            env={**os.environ, "ASTRA_DATA": home, "ASTRA_HOSTED": "0", "ASTRA_EXTENSIONS": str(APP/"extensions")}, capture_output=True, text=True, timeout=60)
    if run.returncode: raise ValueError(run.stdout + run.stderr)
    return json.loads(run.stdout)


COHORT_CODE = r'''
import json,sys
from server import store
from server.domain import assessment,error_diary
from tools.corpus_engineering.draft_import import import_drafts,material
from tools.corpus_engineering.pipeline import canonical,digest
store.initialize()
packages=[json.load(open(path)) for path in json.loads(sys.argv[1])]
rows=[row for package in packages for row in package['records']]
assert len({row['id'] for row in rows})==len(rows)
with store.connect() as db:
 before=store.published(db)
 versions_before={(r['id'],r['v']):r['payload'] for r in db.execute('SELECT id,v,payload FROM versions')}
 live_before={row['id']:head[0] if (head:=db.execute('SELECT live FROM heads WHERE id=?',(row['id'],)).fetchone()) else None for row in rows}
 attempts_before=db.execute('SELECT count(*) FROM attempts').fetchone()[0]
 first=[import_drafts(db,{'id':'owner','role':'autore'},package) for package in packages]
 second=[import_drafts(db,{'id':'owner','role':'autore'},package) for package in packages]
 assert sum(row['saved'] for row in first)==len(rows)
 assert all(row['saved']==0 for row in second)
 assert sum(row['unchanged'] for row in second)==len(rows)
 after=store.published(db)
 assert store.encode(before)==store.encode(after)
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',key).fetchone()[0]==payload for key,payload in versions_before.items())
 for row in rows:
  head=db.execute('SELECT live,draft FROM heads WHERE id=?',(row['id'],)).fetchone()
  assert head['live']==live_before[row['id']] and head['draft'] is not None
  saved=json.loads(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',(row['id'],head['draft'])).fetchone()[0])
  assert material(saved)==material(row)
 objects={row['id']:row for row in [*before,*rows]}
 # A revised lesson must preserve the entry points of every existing experiment,
 # including experiments that are not themselves part of this import cohort.
 experiments=[row for row in objects.values() if row.get('kind')=='experiment']
 for experiment in experiments:
  lesson=objects[experiment['skill']]
  assert lesson['course']==experiment['course'] and experiment['topic'] in lesson.get('coverage',[])
  assert any(block.get('type')=='text' and block['text'].startswith(experiment['anchor'])
    for block in lesson['blocks']), 'Lost experiment paragraph: '+experiment['id']
 questions=[row for row in rows if row['kind']=='question']
 available=[row for row in objects.values() if row.get('kind')=='question' and not row.get('exam')]
 proofs=[]
 for row in questions:
  assert row['skill'] in objects
  assert all(key in objects for key in [*row.get('prerequisites',[]),*row.get('reuse',[])])
  assert assessment.matches(row['answer'],row['answer']['value'])
  if row['answer']['type']=='choice':
   assert all(not assessment.matches(row['answer'],value) for value in row['answer']['options'] if value!=row['answer']['value'])
  else:
   assert all(not assessment.matches(row['answer'],value) for value in ['NaN','Infinity','-Infinity'])
  pool=[candidate for candidate in available if candidate['skill']==row['skill']]
  retest=error_diary.choose_retest(row,pool,{row['id']},{row['family']})
  assert retest is not None and retest['family']!=row['family'] and retest['skill']==row['skill'] and not retest.get('exam')
  next_retest=error_diary.choose_retest(row,[q for q in pool if q['family']!=retest['family']],{row['id'],retest['id']},{row['family'],retest['family']})
  assert next_retest is not None and next_retest['family'] not in (row['family'],retest['family'])
  def attempt(stamp,seq,family,aided=0):return {'stamp':stamp,'seq':seq,'family':family,'aided':aided,'correct':1,'skill':row['skill']}
  error={'stamp':100,'seq':1,'family':row['family']}
  repeated=attempt(101,2,row['family'])
  assert error_diary.follow_up(error,[repeated])['transferAt'] is None
  assisted=attempt(102,3,retest['family'],1)
  support=error_diary.follow_up(error,[repeated,assisted])
  assert support['transferAt'] is None and support['assistedAfter']==1
  autonomous=attempt(103,4,retest['family'])
  immediate=error_diary.follow_up(error,[repeated,assisted,autonomous])
  assert immediate['transferAt']==103 and immediate['delayedAt'] is None
  delayed=attempt(103+error_diary.TRANSFER_INTERVAL,5,next_retest['family'])
  observed=error_diary.follow_up(error,[repeated,assisted,autonomous,delayed])
  assert observed['delayedAt']==delayed['stamp']
  trace=assessment.trace([repeated,assisted,autonomous,delayed])[row['skill']]
  assert trace['families']==3 and trace['aided']==1 and trace['state']=='risultati stabili'
  proofs.append({'id':row['id'],'candidateSha256':digest(row),'skill':row['skill'],'family':row['family'],
   'retestId':retest['id'],'delayedRetestId':next_retest['id'],'grading':True,'graphReferences':True,
   'repetitionIsNotTransfer':True,'assistanceIsNotAutonomy':True,'delayedDistinctTransfer':True})
 attempts_after=db.execute('SELECT count(*) FROM attempts').fetchone()[0]
 assert attempts_after==attempts_before
 print(canonical({'schemaVersion':'1.0.0','packageCount':len(packages),'candidateCount':len(rows),
  'firstImportSaved':sum(row['saved'] for row in first),'repeatedImportSaved':sum(row['saved'] for row in second),
  'repeatedImportUnchanged':sum(row['unchanged'] for row in second),
  'beforePublishedCount':len(before),'afterPublishedCount':len(after),
  'beforePublishedSha256':digest(before),'afterPublishedSha256':digest(after),
  'preservedHistoricalVersions':len(versions_before),'preservedLiveHeads':sum(v is not None for v in live_before.values()),
  'learnerAttemptsBefore':attempts_before,'learnerAttemptsAfter':attempts_after,'records':proofs,
  'preservedExperimentEntryPoints':len(experiments),
  'learningEvidence':'synthetic_private_fixtures_only','humanApproval':'NOT_RUN',
  'newPublications':0,'database':'disposable_sqlite'}))
'''


def exercise_registry():
    """Coexistence of all registered drafts, with bounded imports and private domain fixtures."""
    from .batches import load_registry,load_activity_registry
    from .runtime_fingerprint import runtime_fingerprint
    assert_bundled_runtime(APP)
    registry_file=APP/'editorial/batches/registry.json'
    registry_bytes=registry_file.read_bytes();registry_sha=sha(registry_bytes)
    protocol_sha=sha(Path(__file__).read_bytes())
    with tempfile.TemporaryDirectory(prefix='cric-registry-integration-') as home:
        # Both loaders validate one immutable private snapshot, never two live revisions.
        snapshot=Path(home)/'registry.json';snapshot.write_bytes(registry_bytes)
        names=[spec['id'] for spec in load_registry(snapshot)]
        names+=list(dict.fromkeys(spec['revisionPackage'] for spec in load_activity_registry(snapshot) if spec.get('revisionPackage')))
        paths=[APP/'editorial/batches'/(name+'.json') for name in names]
        package_checksums={name:sha(path.read_bytes()) for name,path in zip(names,paths)}
        runtime=runtime_fingerprint(APP)
        run=subprocess.run([sys.executable,'-c',COHORT_CODE,json.dumps([str(path) for path in paths])],cwd=APP,
          env={**os.environ,'ASTRA_DATA':str(Path(home)/'data'),'ASTRA_HOSTED':'0','ASTRA_EXTENSIONS':str(APP/'extensions')},
          capture_output=True,text=True,timeout=max(60,2*len(paths)))
    if run.returncode:raise ValueError(run.stdout+run.stderr)
    if (package_checksums!={name:sha(path.read_bytes()) for name,path in zip(names,paths)}
      or registry_sha!=sha((APP/'editorial/batches/registry.json').read_bytes()) or runtime!=runtime_fingerprint(APP)
      or protocol_sha!=sha(Path(__file__).read_bytes())):
        raise ValueError('Registry, packages or runtime changed during coexistence verification')
    result=json.loads(run.stdout)
    result.update(registryFileSha256=registry_sha,packageFileSha256ByBatch=package_checksums,
      protocolSha256=protocol_sha,runtimeFingerprint=runtime)
    return result


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument("--output", type=Path, required=True)
    group=parser.add_mutually_exclusive_group()
    group.add_argument("--batch", default="units-001")
    group.add_argument("--registry", action="store_true")
    args = parser.parse_args()
    result = exercise_registry() if args.registry else exercise(args.batch)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(canonical(result) + "\n")
    print(canonical({"drafts": result.get("firstImportSaved",result.get("firstImport",{}).get("saved")), "unchangedPublished": result["afterPublishedCount"]}))
