from pathlib import Path
from fractions import Fraction as F
import hashlib,json,subprocess,sys,os,math,shutil
D=Path(__file__).resolve().parent;APP=Path('/private/tmp/cric-wave-zero-readout-20261127/officina-di-fisica');MANUAL=Path('/private/tmp/cric-resident-integrator/officina-di-fisica/editorial/reviews/c2-density-pressure-manual-20261127.md')
FINAL='d8ae8d076a9f734a5681ff22d42d66722265f1c15d21286636169d25df03d126';RUNTIME='3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251';H=lambda b:hashlib.sha256(b).hexdigest();J=lambda p:json.loads(p.read_bytes())
def main():
 assert H(MANUAL.read_bytes())==H((D/'final-author-manual.verbatim.md').read_bytes())==FINAL
 for i in J(D/'git-inputs.json')['inputs']:
  assert H((D/i['snapshot']).read_bytes())==i['sha256'];assert(APP/str(Path(i['path']).relative_to('officina-di-fisica'))).read_bytes()==(D/i['snapshot']).read_bytes()
 def fp():return json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=APP))
 before=fp();assert before['sha256']==RUNTIME
 assert shutil.disk_usage('/private/tmp').free>=2*1024**3
 with(D/'installed-tasks.raw.json').open('w')as out,(D/'installed-tasks.stderr.txt').open('w')as err:r=subprocess.run(['node',str(D/'collect-installed-tasks.mjs'),str(APP)],cwd=APP,stdout=out,stderr=err,timeout=60)
 assert r.returncode==0;actual=J(D/'installed-tasks.raw.json');assert len(actual['records'])==5
 answers={'SIM-C2-L001-01':([F(6)/F(1,10),F(6)/F(4,5)],'cm³'),
 'SIM-C2-L001-02':([F(1)*F(6,2),F(1)*F(4,2)],'Pa'),
 'SIM-C2-L001-03':([F(5,2)*6,F(5,2)*5],'g'),
 'SIM-C2-L001-04':([F(10)/F(5,10000)/1000,F(10)/F(7,10000)/1000],'kPa'),
 'SIM-C2-L001-05':([F(100)+F(1000)*10*1/1000,F(90)+F(1000)*10*1/1000],'kPa')}
 literal=[['60','7.5'],['3','2'],['15','12.5'],['20','14.286'],['110','100']];records=[]
 for i,row in enumerate(actual['records']):
  expected,unit=answers[row['id']];assert len(row['actualAssessment'])==2
  for j,t in enumerate(row['actualAssessment']):
   assert math.isclose(t['value'],float(expected[j]),rel_tol=1e-10,abs_tol=1e-10)
   assert math.isclose(row['atAssignedControls'][j]['output']['y'],float(expected[j]),rel_tol=1e-10,abs_tol=1e-10)
   assert t['unit']==unit and t['prompt'];v=F(literal[i][j]);assert abs(v-expected[j])<=max(F(1,1000000),abs(expected[j])*F(5,1000))
  records.append({'id':row['id'],'actualInstalledTaskAnswersExact':[str(x)for x in expected],'numericInputs':literal[i],'unit':unit,'actualPrompts':[t['prompt']for t in row['actualAssessment']],'actualInstalledTasksMatch':True})
 assert 100==14*7+2
 assert [(20//7,20%7),(60//7,60%7),(40//7,40%7),(50//7,50%7)]==[(2,6),(8,4),(5,5),(7,1)]
 assert F(14286,1000)-F(100,7)==F(1,3500)
 assert abs(F(14286,1000)-F(100,7))/F(100,7)==F(1,50000)<F(5,1000)
 assert F(5,2)*F(1,1000)/F(1,1000000)==2500
 assert F(10)/(F(100,7)*1000)==F(7,10000)
 assert F(1)*F(6,2)==3 and F(1)*F(4,2)==2
 # Genuine counterexample to the omitted hypothesis: Couette-Poiseuille.
 U=F(6,100);h=F(2,100);eta=F(1);G=F(200)
 assert eta*(U/h+G*h/(2*eta))==5
 assert eta*(U/h)==3
 initial=(D/'initial-author-manual.verbatim.md').read_text();final=(D/'final-author-manual.verbatim.md').read_text()
 section=lambda text,k:text.split('## `'+k+'`',1)[1].split('\n## ',1)[0]
 for ident in ['SIM-C2-L001-01','SIM-C2-L001-03','SIM-C2-L001-05']:assert section(initial,ident)==section(final,ident)
 assert 'pressione costante lungo la direzione dello scorrimento'in final and 'effetti di bordo trascurabili'in final
 assert r'A=(a/10000)\,\mathrm{m^2}'in final
 assert fp()==before and H(MANUAL.read_bytes())==FINAL
 result={'finalManualSha256':FINAL,'actualNodeExitCode':0,'actualInstalledRecords':5,'actualInstalledTasks':10,'runtimeSha256':RUNTIME,'runtimeBeforeAfterIdentical':True,'records':records,'exactAdditionalChecks':{'pressureInputRelativeError':'1/50000','densitySI':'2500 kg/m^3','couetteOmittedGradientCounterexample':'WithU0.06m/s,h0.02m,eta1Pa*s,dp/dx200Pa/m,upperstress5Pa ratherthan3Pa. Finalmanualexcludesit.','physicalAreaAt7cm2':'7/10000 m²'},'firstThirdFifthSectionsByteUnchanged':True,'newBrowser':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (D/'review-analysis.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':main()
