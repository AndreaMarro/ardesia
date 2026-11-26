"""Independent exact primary for author-supplied input pairs, before candidates.

Models below are derived from the frozen original problem data. No authoring
module, future candidate, future answer or SVG is imported or inspected.
"""
from pathlib import Path
from fractions import Fraction
import fcntl,hashlib,json,shutil,subprocess,sys
BASE=Path(__file__).resolve().parent
APP=BASE.parents[2]
INPUT_SHA='8fdfbe4be78939411e5e83c0dfc9c82d6e238c68309f2bd501b9ab946e0d41fd'
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 assert shutil.disk_usage(APP).free>=2*1024**3
 import sympy as s
 import pint
 q=pint.UnitRegistry(non_int_type=Fraction)
 raw=(BASE/'input-projection.json').read_bytes();assert sha(raw)==INPUT_SHA
 projection=json.loads(raw);rows={r['originalInputProjection']['id']:r for r in projection['records']}
 r=s.symbols('r',positive=True);t=s.symbols('t',real=True);n=s.symbols('n',nonnegative=True);a=s.symbols('a',real=True)
 p=100/r**s.Rational(3,2)
 assert s.diff(p,r).is_negative
 assert s.simplify(p.subs(r,s.Rational(9,4)))==s.Rational(800,27)
 assert p.subs(r,4)==s.Rational(25,2)
 assert p.subs(r,1)==100 and 100/s.Rational(9,4)>p.subs(r,s.Rational(9,4))
 assert (q.Quantity(100,'kPa')/q.Quantity(Fraction(9,4),'')**Fraction(3,2)).dimensionality==q.Quantity(1,'Pa').dimensionality
 force=(q.Quantity(2,'microcoulomb')*q.Quantity(3,'m/s')*q.Quantity(1,'tesla')).to('micronewton')
 assert force.magnitude==6
 assert 6*s.sin(s.pi/6)==3 and 6*s.sin(s.pi/2)==6
 assert [6*s.sin(x)for x in (0,s.pi/2,s.pi)]==[0,6,0]
 assert (s.Matrix([0,0,-1]).cross(s.Matrix([1,0,0])))==s.Matrix([0,-1,0])
 assert [4*s.cos(s.pi*x)for x in (s.Rational(1,2),1)]==[0,-4]
 assert [3*s.sin(2*s.pi*x)for x in (s.Rational(1,4),s.Rational(3,4))]==[3,-3]
 assert (q.Quantity(2,'1/s')*q.Quantity(1,'s')).dimensionless
 assert [4*abs(s.cos(s.pi*x))for x in (s.Rational(1,2),1)]==[0,4]
 assert 2*2**2*(1+s.cos(s.pi))==0 and 2*2**2*(1+s.cos(2*s.pi))==16
 assert [100*2**(-s.Integer(x))for x in (2,3)]==[25,s.Rational(25,2)]
 assert [64*2**(-s.Integer(x))for x in (2,4)]==[16,4]
 assert (q.Quantity(1,'1/m')*q.Quantity(1,'m')).dimensionless
 assert (q.Quantity(1,'s')/q.Quantity(1,'s')).dimensionless
 target30=s.Rational(1,3);target45=s.sqrt(2)/3
 assert s.sin(s.pi/6)/s.Rational(3,2)==target30
 assert s.simplify(s.sin(s.pi/4)/s.Rational(3,2)-target45)==0
 assert 0<target30<target45<1
 # Independent rational proof of finite angle brackets, not a claim that the
 # original learner received the Taylor method or a sine table.
 pi_lo=s.Rational(314159,100000);pi_hi=s.Rational(3927,1250)
 assert pi_lo<s.pi<pi_hi
 def sine_interval(degrees):
  lo=s.Rational(degrees)*pi_lo/180;hi=s.Rational(degrees)*pi_hi/180
  assert 0<lo<hi<s.Rational(1,2)
  lower=lo-lo**3/6+lo**5/120-lo**7/5040
  upper=hi-hi**3/6+hi**5/120
  assert 0<lower<upper<1
  return lower,upper
 brackets=[]
 for low,high,target in [('19.47','19.48',target30),('28.12','28.13',target45)]:
  ll,lu=sine_interval(low);hl,hu=sine_interval(high)
  assert lu<target and hl>target
  brackets.append({'lowerAngleDegrees':low,'upperAngleDegrees':high,
                   'lowerAngleSineUpperBound':str(lu),'upperAngleSineLowerBound':str(hl),
                   'targetSine':str(target),'proof':'Alternating sine series S7 lower/S5 upper, rational pi bounds; sine monotone on [0,90°]. Reviewer evidence only.'})
 exact={
 'SIM-C3-L07-05':[s.Rational(800,27),s.Rational(25,2)],
 'SIM-C4-L09-02':[s.Integer(3),s.Integer(6)],
 'SIM-C5-L01-01':[s.Integer(0),s.Integer(-4)],
 'SIM-C5-L02-03':[s.Integer(3),s.Integer(-3)],
 'SIM-C5-L03-02':[s.Integer(0),s.Integer(4)],
 'SIM-C5-L07-02':[s.Integer(25),s.Rational(25,2)],
 'SIM-C5-L08-02':[s.Integer(16),s.Integer(4)],
 'SIM-C5-L09-02':[180*s.asin(target30)/s.pi,180*s.asin(target45)/s.pi]}
 finite={'SIM-C3-L07-05':['29.63','12.5'],'SIM-C4-L09-02':['3','6'],
 'SIM-C5-L01-01':['0','-4'],'SIM-C5-L02-03':['3','-3'],
 'SIM-C5-L03-02':['0','4'],'SIM-C5-L07-02':['25','12.5'],
 'SIM-C5-L08-02':['16','4'],'SIM-C5-L09-02':['19.5','28.1']}
 out=[]
 for id,row in rows.items():
  control=row['originalInputProjection']['control']
  low,high,step=[s.Rational(str(control[k]))for k in ('min','max','step')]
  points=[s.Rational(x)for x in row['selectedAssessmentInputs']]
  assert len(set(points))==2
  for x in points:assert low<=x<=high and ((x-low)/step).is_Integer
  out.append({'id':id,'inputPoints':row['selectedAssessmentInputs'],'domainAndGridVerified':True,
              'exactSolutions':[str(x)for x in exact[id]],'finiteNumberExamples':finite[id],
              'unit':row['originalInputProjection']['measure']['unit'],'sourceVersion':row['originalInputProjection']['version'],
              'sourceRecordSha256':row['originalRecordSha256'],'futureEditionRead':'NOT_RUN','UI':'NOT_RUN','activityCredit':0})
 # Rational guarantees for the proposed finite inputs, using the actual .5%
 # relative tolerance only as a parser check, not proof of learner support.
 assert abs(s.Rational('29.63')-s.Rational(800,27))==s.Rational(1,2700)
 assert s.Rational(1,2700)<s.Rational(1,200)*s.Rational(800,27)
 assert s.Rational('0.03')<s.Rational('19.47')/200
 assert s.Rational('0.03')<s.Rational('28.12')/200
 report={'phase':'INDEPENDENT_EXACT_PRIMARY_BEFORE_NEW_CANDIDATES','inputProjectionSha256':INPUT_SHA,
 'records':sorted(out,key=lambda r:r['id']),'sineBracketProofs':brackets,
 'versions':{'SymPy':s.__version__,'Pint':pint.__version__},
 'mathChecks':'Independent exact physical laws, units, phases, signs, inverse domains, grid membership and finite angle brackets asserted above.',
 'manualityLimit':'Finite input acceptance does not supply learner support. The separate author must put the needed division/rounding or sine table/bracketing procedure in the actual new edition; this primary does not approve it.',
 'newCandidatesRead':0,'newCandidatesWritten':0,'UI':'NOT_RUN','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 blob=(json.dumps(report,sort_keys=True,ensure_ascii=False,indent=2)+'\n').encode();pout=BASE/'exact-primary.json'
 if pout.exists():assert pout.read_bytes()==blob,'Frozen primary drift'
 else:pout.write_bytes(blob)
 # Only the first-party installed original laws are evaluated AFTER the exact
 # primary is saved. No future assessment selection or author code is loaded.
 (BASE/'installed-comparison-inputs.json').write_text(json.dumps([{'id':x['id'],'inputs':x['inputPoints'],'expectedIndependentNumeric':[float(s.N(v,17))for v in exact[x['id']]],'finiteNumberExamples':x['finiteNumberExamples']}for x in report['records']],indent=2)+'\n')
 print('EXACT_PRIMARY',sha(blob),'records',len(out))
if __name__=='__main__':
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX);main()
