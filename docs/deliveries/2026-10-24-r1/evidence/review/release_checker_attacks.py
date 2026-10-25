import importlib.util,json,hashlib,tempfile,sys
from pathlib import Path
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'bin/web'))
spec=importlib.util.spec_from_file_location('independent_release_checker',ROOT/'bin/web/check_teaching_candidate.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
sha=lambda b:hashlib.sha256(b).hexdigest();result=[]
def fixture(root):
 c=root/'candidate';(c/'public/esperienza').mkdir(parents=True)
 for n,v in {'public/index.html':'<!doctype html><title>Independent</title>','public/esperienza/index.html':'<!doctype html><title>Independent lesson</title>','public/robots.txt':'User-agent: *\nDisallow: /\n','public/_headers':m.exported_headers(),'public/source-manifest.json':json.dumps({'examples':[{'id':'independent-draft','editorialStatus':'DRAFT','contentSHA256':'c'*64}]})}.items():(c/n).write_text(v)
 empty=sha(b'');assets={str(p.relative_to(c)):sha(p.read_bytes())for p in c.rglob('*')if p.is_file()};manifest={'assetsSha256':assets,'source':{'commit':'6f19b1956cedbebf36a5cf097af66e47ed8acecd','sourceTreeSha256':empty,'trackedDiffSha256':empty,'sourceFileCount':0},'privateBeta':False,'privateDataIncluded':False};(c/'candidate-manifest.json').write_text(json.dumps(manifest));(c/'source-manifest.json').write_text(json.dumps({'files':{},'sha256':empty}));return c
def rehash(c,n):
 p=c/'candidate-manifest.json';d=json.loads(p.read_text());d['assetsSha256'][n]=sha((c/n).read_bytes());p.write_text(json.dumps(d))
with tempfile.TemporaryDirectory(dir=OUT,prefix='release-probe-') as folder:
 root=Path(folder);c=fixture(root);baseline=m.check(c);result.append({'case':'independent control fixture','technicalStatus':baseline['technicalStatus'],'releaseStatus':baseline['releaseStatus'],'humanStatus':baseline['humanReview']['status']})
 token='gh'+'p_'+'z'*40;p=c/'public/source-manifest.json';v=json.loads(p.read_text());v['examples'][0]['privateNote']=token;p.write_text(json.dumps(v));rehash(c,'public/source-manifest.json');r=m.check(c);result.append({'case':'credential inside untrusted draft metadata','technicalStatus':r['technicalStatus'],'errors':r['errors'],'credentialValueEchoedInResult':token in json.dumps(r)})
 p.unlink();outside=root/'outside.json';outside.write_text(json.dumps({'examples':[{'id':'outside','editorialStatus':'DRAFT','privateNote':'OUTSIDE_SENTINEL'}]}));p.symlink_to(outside);rehash(c,'public/source-manifest.json');r=m.check(c);result.append({'case':'rejected symlink special metadata still read outside candidate','technicalStatus':r['technicalStatus'],'errors':r['errors'],'outsideSentinelEchoedInResult':'OUTSIDE_SENTINEL'in json.dumps(r)})
 p.unlink();p.write_text(json.dumps({'examples':[]}));rehash(c,'public/source-manifest.json');manifest=json.loads((c/'candidate-manifest.json').read_text());manifest['assetsSha256']=[];(c/'candidate-manifest.json').write_text(json.dumps(manifest))
 try:m.check(c);result.append({'case':'malformed manifest assets array','uncaughtException':None})
 except Exception as e:result.append({'case':'malformed manifest assets array','uncaughtException':type(e).__name__})
(OUT/'release-checker-attacks.json').write_text(json.dumps({'checks':result,'scope':'synthetic local fixture, no real credentials; any token output recorded only as a boolean, not copied'},indent=2)+'\n');print(json.dumps(result,indent=2))
