"""Run the existing Root contract on an isolated copy, without registry writes."""
from pathlib import Path
import sys,ast,json,subprocess,tempfile,hashlib
root=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');sys.path.insert(0,str(root))
from tools.corpus_engineering.batches import reviewed_supplemental_practice
from tools.corpus_engineering.pipeline import sha,digest
app=Path.cwd();home=app/'editorial/reviews/c6-transfer-v1-independent-evidence';original=subprocess.check_output(['git','show','5a4945bf:officina-di-fisica/tools/corpus_engineering/batches.py']);actual=(root/'tools/corpus_engineering/batches.py').read_bytes()
def node(raw):return next(n for n in ast.parse(raw).body if isinstance(n,ast.FunctionDef)and n.name=='reviewed_supplemental_practice')
assert ast.dump(node(actual),include_attributes=False)==ast.dump(node(original),include_attributes=False)
raw=(home/'final-package.json').read_bytes();review=(app/'editorial/supplemental/c6-transfer-v1/independent-review.json').read_bytes();package=json.loads(raw);decision=json.loads(review);ids={r['id']for r in package['records']}
with tempfile.TemporaryDirectory()as tmp:
 base=Path(tmp);folder=base/'editorial/supplemental/c6-transfer-v1';folder.mkdir(parents=True);(folder/'package.json').write_bytes(raw);(folder/'independent-review.json').write_bytes(review);spec={'id':'c6-transfer-v1','questionIds':sorted(ids),'packageSha256':sha(raw),'reviewSha256':sha(review)};result=reviewed_supplemental_practice({'supplementalPractice':[spec]},base);assert result['c6-transfer-v1']['ids']==ids
 # Even with candidate and envelope checksums renewed, an exam cannot be admitted by this practice contract.
 mutated=json.loads(raw);mutated['records'][0]['exam']=1;modified_review=json.loads(review);modified_review['records'][0]['candidateSha256']=digest(mutated['records'][0]);newraw=json.dumps(mutated,ensure_ascii=False).encode();newreview=json.dumps(modified_review,ensure_ascii=False).encode();(folder/'package.json').write_bytes(newraw);(folder/'independent-review.json').write_bytes(newreview);spec.update(packageSha256=sha(newraw),reviewSha256=sha(newreview));modified_review['packageSha256']=sha(newraw);newreview=json.dumps(modified_review,ensure_ascii=False).encode();(folder/'independent-review.json').write_bytes(newreview);spec['reviewSha256']=sha(newreview)
 try:reviewed_supplemental_practice({'supplementalPractice':[spec]},base)
 except ValueError as error:assert 'Invalid individual'in str(error)
 else:raise AssertionError('Rehashed protected exam entered practice')
print(json.dumps({'canonicalContract':'reviewed_supplemental_practice','canonicalFunctionAST':'identical to frozen Root5a4945bf','positiveDecisions':len(ids),'rehashedExamRejected':True,'realRootRegistryWrites':0,'publicationAction':'NONE','humanApproval':'NOT_RUN'}))
