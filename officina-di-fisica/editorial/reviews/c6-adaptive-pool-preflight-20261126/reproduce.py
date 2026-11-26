"""Read immutable source editions and check the documented C6 transfer pool."""
from pathlib import Path
import collections,json,subprocess
OUT=Path(__file__).resolve().parent;APP=OUT.parents[2];REPO=APP.parent
report=json.loads((OUT/'report.json').read_bytes())
def get(ref,path):return json.loads(subprocess.check_output(['git','show',ref+':'+path],cwd=REPO))
ref=report['rootSourceCommit'];prefix='officina-di-fisica/'
registry=get(ref,prefix+'editorial/batches/registry.json')
batches={b['id']for b in registry['batches']}
for part in ('u7-02','u7-03'):
 receipt=get(ref,prefix+'editorial/reviews/'+part+'-root-integration-20261126/receipt.json')
 batches.update(b['batch']for b in receipt['imports'])
revised=[r for b in sorted(batches)for r in get(ref,prefix+'editorial/batches/'+b+'.json')['records']]
assert len(revised)==len({r['id']for r in revised})==4000
assignment=get(ref,prefix+'editorial/assignments/cric-606-v1.json');paths=collections.defaultdict(set)
for group in assignment['assignments']:
 for source in group['sources']:paths[source['path']].add(source['id'])
cric=[r for path,ids in paths.items()for r in get(report['sourceRef'],path)if r['id']in ids]
assert len(cric)==len({r['id']for r in cric})==606
assert sum(bool(r.get('exam'))for r in cric)==93
pool=[r for r in cric+revised if not r.get('exam')]
for item in report['findings']:
 rows=[r for r in pool if r['skill']==item['skill']]
 assert sorted(r['id']for r in rows)==item['eligibleIds']
 assert sorted({r['family']for r in rows})==item['distinctFamilies']
 assert(len({r['family']for r in rows})>=3)==item['canOfferTwoOtherFamiliesForEachSourceFamily']
print(json.dumps({'sourceRows':4606,'reviewedArdesia':4000,'protectedExamsExcluded':93,'affectedSkills':report['affectedSkills'],'questionCredit':0,'publicationAction':'NONE'}))
