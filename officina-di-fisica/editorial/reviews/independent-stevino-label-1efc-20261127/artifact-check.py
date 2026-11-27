from pathlib import Path
import json,hashlib,math
BASE=Path(__file__).resolve().parent
INDEX='2edd5fa7804bed789272d37bf6b197a6191f244b12178846c949db5fccd07372'
RUNTIME='1efcd26bbb078453b75be5fbd1502b95cf07c0ffabb4112a4e4cf78170ff46aa'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def semantic(r):
 if r['sourceCandidateCommit']!='3abd7dce2c2d837c903c9e17ac1d7fd0aa08dcca'or r['runtimeSha256']!=RUNTIME or r['before']!=r['after']or r['before']['sha256']!=RUNTIME or r.get('failure')or r['pageErrors']:raise ValueError('Actual source/epoch failed')
 wanted={(w,v,h)for w in[320,1280]for v in['orbit','side','top','diagram']for h in([0,.05,1,1.95,2]if v=='diagram'else[0])}
 if len(r['cases'])!=16 or{(x['width'],x['view'],x['h'])for x in r['cases']}!=wanted:raise ValueError('Exactactual16statecoverage required')
 for x in r['cases']:
  if not x['technicalOk']or x['layout']['axe']or x['layout']['scroll']>x['width']+1 or x['noWebGL']!=(x['view']=='diagram')or float(x['inputs']['h'])!=x['h']or x['inputs']['rho']!='1000'or x['inputs']['p0']!='100':raise ValueError('Actualrequestedcontrols/layout differ')
  frac={0:[100000,1],.05:[200981,2],1:[109810,1],1.95:[238259,2],2:[119620,1]}[x['h']]
  if x['exactAbsolutePaFraction']!=frac or[x['actual']for x in x['raw']]!=x['expected']:raise ValueError('Actualpressure differs')
  if x['noWebGL']:
   texts=x['svg']['texts'];a=[z for z in texts if z['text']=='A'];surface=[z for z in texts if z['text']=='superficie']
   if len(a)!=1 or len(surface)!=1 or a[0]['x']!=132 or a[0]['y']!=62+52.5*x['h']or surface[0]['x']!=84 or surface[0]['y']!=34:raise ValueError('Actualreviewedprobeidentity/labelposition differs')
 if len(r['gradedProfiles'])!=8 or{(x['width'],x['view'])for x in r['gradedProfiles']}!={(w,v)for w in[320,1280]for v in['orbit','side','top','diagram']}:raise ValueError('Actualgradedprofiles incomplete')
 for x in r['gradedProfiles']:
  if[z['phase']for z in x['stages']]!=[1,2,3,4]or[z['independentExact']for z in x['responses']]!=[5,2]or any(not z['accepted'].startswith('Corretto. ')or not z['rejected'].startswith('Rivedi il calcolo. ')for z in x['responses']):raise ValueError('Actualsourcegrading/stages differs')
 if len(r['resourceObservations'])!=16 or any(x['freeBytes']<2147483648 for x in r['resourceObservations']):raise ValueError('Actualdiskguard incomplete')
 return True

def review(base=BASE):
 base=Path(base)
 if sha(base/'actual-proof-index.json')!=INDEX:raise ValueError('Independentactuallyreadproof commitment differs')
 idx=json.loads((base/'actual-proof-index.json').read_bytes())
 for name,pin in idx['files'].items():
  p=base/name
  if p.is_symlink()or sha(p)!=pin:raise ValueError('Independentproof missing/changed:'+name)
 r=json.loads((base/'actual-ui-16/consumer.json').read_bytes());terminal=json.loads((base/'terminal-receipt.json').read_bytes());semantic(r)
 if terminal['actualExitCode']!=0 or terminal['error']is not None or terminal['before']!=terminal['after']or terminal['before']['sha256']!=RUNTIME or terminal['protocolSha256']!=sha(base/'browser-focused.mjs')or r['protocolSha256']!=terminal['protocolSha256']:raise ValueError('Realterminal/protocol differs')
 return{'ok':True,'scope':'FOCUSED16_NOT_WHOLE035','actualCases':16,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
if __name__=='__main__':print(json.dumps(review()))
