"""Independent oracles, not production formulas copied as expected outputs.

Usage: python verify_science.py --engine-root /path/to/packages/engine
Conceptual correctness/human approval are not established by arithmetic checks.
"""
import argparse
import copy
import hashlib
import importlib
import json
import math
import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

HERE=Path(__file__).resolve().parent
CHECKS=[]

def check(label,actual,expected,tol=1e-10):
    if isinstance(expected,(float,int)):
        ok=math.isfinite(actual) and math.isclose(actual,expected,rel_tol=tol,abs_tol=tol*max(1e-12,abs(expected)))
    else:
        ok=actual==expected
    CHECKS.append({'id':label,'actual':actual,'expected':expected,'status':'PASS' if ok else 'FAIL'})
    if not ok:
        raise AssertionError(f'{label}: {actual} != {expected}')

def reject(label,fn,payload,error):
    try:
        fn(payload)
    except error:
        CHECKS.append({'id':label,'status':'PASS','expected':'StudyError'})
    else:
        raise AssertionError(label+' accepted invalid input')

def verify_engine(engine):
    sys.path.insert(0,str(engine))
    electrical=importlib.import_module('lessonos.study.electrical')
    waves=importlib.import_module('lessonos.study.waves')
    kinematics=importlib.import_module('lessonos.study.kinematics')
    StudyError=importlib.import_module('lessonos.study.models').StudyError
    dc=electrical.evaluate_dc_circuit
    for topology,expected in [('series',{'r':12.,'i':1.,'p':12.,'currents':[1.,1.],'voltages':[4.,8.],'powers':[4.,8.]}),('parallel',{'r':8/3,'i':4.5,'p':54.,'currents':[3.,1.5],'voltages':[12.,12.],'powers':[36.,18.]})]:
        for sign in [1,-1,0]:
            p={'voltage':12*sign,'resistance1':4,'resistance2':8,'topology':topology}
            before=copy.deepcopy(p)
            got=dc(p)
            check(f'{topology}/{sign}/R',got['equivalentResistanceOhm'],expected['r'])
            check(f'{topology}/{sign}/I',got['currentA'],expected['i']*sign)
            check(f'{topology}/{sign}/P',got['totalPowerW'],expected['p']*sign**2)
            for i,b in enumerate(got['branches']):
                check(f'{topology}/{sign}/I{i}',b['currentA'],expected['currents'][i]*sign)
                check(f'{topology}/{sign}/V{i}',b['voltageV'],expected['voltages'][i]*sign)
                check(f'{topology}/{sign}/P{i}',b['powerW'],expected['powers'][i]*sign**2)
            check(f'{topology}/{sign}/input_unchanged',p,before)
            swapped=dc({**p,'resistance1':8,'resistance2':4})
            check(f'{topology}/{sign}/permutation',swapped['currentA'],got['currentA'])
    for p in [{'voltage':True},{'voltage':float('nan')},{'resistance1':0},{'resistance2':-1},{'voltage':10**1000},{'topology':'arbitrary'},{'resistence1':4}]:
        reject('dc/invalid/'+repr(p)[:60],dc,p,StudyError)
    wave=waves.evaluate_harmonic_wave
    a=wave({'speed':4,'frequency':2,'amplitude':.1,'time':0,'phase':0})
    check('wave/lambda',a['wavelengthM'],2.)
    check('wave/T',a['periodS'],.5)
    check('wave/x_quarter',a['spatialSamples'][8]['displacementM'],.1)
    check('wave/t_quarter',a['temporalSamples'][8]['displacementM'],-.1)
    check('wave/profile_samples',len(a['spatialSamples']),65)
    check('wave/end_x',a['spatialSamples'][-1]['xM'],4.)
    later=wave({'speed':4,'frequency':2,'amplitude':.1,'time':.125,'phase':0})
    check('wave/moving_crest',later['spatialSamples'][16]['displacementM'],.1)
    zero=wave({'amplitude':0})
    check('wave/zero_A',all(x['displacementM']==0 for x in zero['spatialSamples']+zero['temporalSamples']),True)
    transfer=wave({'speed':6,'frequency':4})
    check('wave/transfer_lambda',transfer['wavelengthM'],1.5)
    # New boundary counterexample reported and fixed by B at55dcc3d6.
    # Exactly one million complete periods must restore the zero-phase probe.
    long_time=wave({'speed':4,'frequency':1,'amplitude':1000,'time':1e6,'phase':0})
    check('wave/million_periods_zero',long_time['probeDisplacementM'],0.)
    quarter_phase=wave({'speed':4,'frequency':1,'amplitude':1000,'time':1e6,'phase':math.pi/2})
    check('wave/million_periods_quarter_phase',quarter_phase['probeDisplacementM'],1000.)
    for p in [{'speed':0},{'frequency':0},{'amplitude':-1},{'time':-1},{'frequency':1e12,'time':1},{'phase':8},{'frequency':True},{'frequency':float('inf')}]:
        reject('wave/invalid/'+repr(p),wave,p,StudyError)
    kin=kinematics.evaluate_kinematics
    k=kin({'velocityX':3,'velocityY':4,'accelerationY':-2,'time':2,'duration':4})
    for field,expected in [('positionXM',6),('positionYM',4),('velocityYMS',0),('velocityXMS',3),('speedMS',3)]:
        check('kin/2d/'+field,k[field],expected)
    reverse=kin({'velocityX':6,'accelerationX':-2,'time':4,'duration':4})
    check('kin/reversal/x',reverse['positionXM'],8.)
    check('kin/reversal/vx',reverse['velocityXMS'],-2.)
    check('kin/reversal/displacement_not_path',reverse['displacementM'],8.)
    # Turning point x(3)=9m; then1m back: path10m vs displacement8m.
    check('kin/reversal/independent_path',9+1,10)
    for p in [{'time':5,'duration':4},{'duration':0},{'time':True},{'accelerationX':float('nan')},{'positionX':10**1000}]:
        reject('kin/invalid/'+repr(p)[:60],kin,p,StudyError)
    modules=[electrical,waves,kinematics]
    if (engine/'lessonos/study/thermodynamics.py').exists():
        gas_module=importlib.import_module('lessonos.study.thermodynamics')
        gas=gas_module.evaluate_ideal_gas
        # Exact SI R was derived from NA*kB above, not read from production.
        g=gas({'moles':1,'temperatureK':300,'pressurePa':100000})
        check('gas/volume',g['volumeM3'],.02494338785445972)
        check('gas/litres',g['volumeL'],24.94338785445972)
        g2=gas({'moles':.5,'temperatureK':400,'pressurePa':200000})
        check('gas/transfer',g2['volumeM3'],.00831446261815324)
        double_p=gas({'moles':1,'temperatureK':300,'pressurePa':200000})
        check('gas/double_pressure',double_p['volumeM3'],.01247169392722986)
        for p in [{'moles':0},{'temperatureK':0},{'pressurePa':0},{'temperatureK':True},{'moles':float('nan')},{'pressurePa':10**1000},{'temperatureC':25}]:
            reject('gas/invalid/'+repr(p)[:60],gas,p,StudyError)
        modules.append(gas_module)
    return {m.__name__:hashlib.sha256(Path(m.__file__).read_bytes()).hexdigest() for m in modules}

def verify_content():
    baseline=json.loads((HERE/'baseline.json').read_text())
    index=json.loads((HERE/'content/index.json').read_text())
    check('content/families',len(index['lessons']),38)
    check('content/atomic_denominator',sum(len(f['subtargets']) for f in baseline['families']),200)
    for f in baseline['families']:
        d=json.loads((HERE/'content'/f"{f['id']}.json").read_text())
        check(f"content/{f['id']}/humanApproval",d['humanApproval'],False)
        check(f"content/{f['id']}/editorial",d['editorialStatus'],'DRAFT')
        check(f"content/{f['id']}/different_practice_transfer",d['practice']['prompt']!=d['transfer']['prompt'],True)
    # Values independently computed using exact SI constants, not gas Core import.
    r=Decimal('6.02214076e23')*Decimal('1.380649e-23')
    check('SI/R',float(r),8.31446261815324)
    gas=float(r*Decimal(300)/Decimal(100000))
    gas_transfer=float(r*Decimal('0.5')*Decimal(400)/Decimal(200000))
    pilots=json.loads((HERE/'content/consumer-four.json').read_text())
    for p in pilots:
        expected={'strumenti-meccanica':(.2,.075),'fluidi-termodinamica':(gas,gas_transfer),'elettricita-magnetismo':(1,4.5),'onde-ottica-radiazioni':(2,1.5)}[p['courseId']]
        check(p['courseId']+'/practice',p['practice']['answer']['value'],expected[0])
        check(p['courseId']+'/transfer',p['transfer']['answer']['value'],expected[1])
    # Selected independently recomputed arithmetic across all seven units.
    cases=[('U1/product',.003*20000,60),('U1/sum',.002+.0005,.0025),('U1/density',1.2*.001/.000001,1200),
      ('U1/vectors_dot',3*(-3)+4*4,7),('U1/vectors_cross',3*4-4*(-3),24),
      ('U2/acceleration',2*3,6),('U2/displacement',.5*2*9,9),('U2/projectile_time',math.sqrt(40/10),2),
      ('U2/friction_limit',.4*2*10,8),('U2/energy',2*10*5,100),('U2/spring_energy',.5*100*.2**2,2),
      ('U2/collision',2*3/3,2),('U2/collision_loss',.5*2*9-.5*3*4,3),('U2/impulse',.2*(-5-5),-2),
      ('U2/lever',20*.3/.05,120),('U2/CM',(1*0+3*4)/4,3),('U3/pressure',30/.0002,150000),
      ('U3/hydro',100000+1000*10*2,120000),('U3/float',600/1000,.6),('U3/continuity',4/2*1,2),
      ('U3/bernoulli',1000*(1-4)/2,-1500),('U3/tubes_series',100/2e8,5e-7),('U3/tubes_parallel',100/5e7,2e-6),
      ('U3/surface_energy',.05*.002,.0001),('U4/intensity',12/3/2,2),('U4/inverse_square',8*(2/4)**2,2),
      ('U4/dB',10*math.log10(1e-8/1e-12),40),('U4/sources_dB',10*math.log10(2e-8/1e-12),43.01029995663981),
      ('U5/heat',.2*4200*10,8400),('U5/fusion',.05*334000,16700),('U5/conduction',.5*2*10/.1,100),
      ('U5/work',1e5*(.005-.002),300),('U5/dU',500-300,200),('U5/carnot',1-300/600,.5),
      ('U5/entropy',200/300-200/400,1/6),('U6/coulomb',9e9*1e-6*1e-6/.3**2,.1),
      ('U6/qE',-2e-6*300,-.0006),('U6/potential',2e-6*(4-10),-12e-6),
      ('U6/capacitor_energy',.5*5e-6*100,250e-6),('U6/capacitor_series',2*3/(2+3),1.2),
      ('U6/lorentz',2e-6*3*.5,3e-6),('U6/wire',3*.2*.5,.3),('U6/faraday',100*.01*.2/.1,2),
      ('U7/EM_lambda',299792458/3e8,.9993081933333333),('U7/photon',6.62607015e-34*5e14,3.313035075e-19),
      ('U7/power',1e12*2*1.602176634e-19,3.204353268e-7),('U7/beer',math.exp(-math.log(2)),.5),
      ('U7/decay',800*2**(-6/2),100),('U7/lens',1/(1/10-1/30),15),('U7/lens_virtual',1/(1/10-1/5),-10)]
    for name,a,e in cases:check('arithmetic/'+name,a,e)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--engine-root',type=Path);ap.add_argument('--report',type=Path,default=HERE/'evidence/science-verification.json');a=ap.parse_args()
    verify_content()
    hashes=verify_engine(a.engine_root) if a.engine_root else {}
    report={'observedAt':datetime.now(timezone.utc).isoformat(),'checks':CHECKS,'count':len(CHECKS),'status':'PASS','engineSourceHashes':hashes,
      'limitations':['Arithmetic and finite deterministic contracts only; not human approval.','No medical efficacy, learner calibration, full 200-subtarget assessment coverage, remote integration or UI behavior certified.','Production model expectations are hand-derived constants plus metamorphic properties; no expected value is obtained by calling the function under test.']}
    a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(f"{len(CHECKS)} checks PASS; {a.report}")

if __name__=='__main__':main()
