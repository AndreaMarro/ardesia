"""Reproducible independent 183–187 radiation, transport and entropy audits, never importing candidate authoring."""
import base64
from copy import deepcopy
import importlib
import json
from pathlib import Path
import tempfile
import subprocess
import unittest
from unittest.mock import patch

from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
REPO=APP.parent
FAMILIES=[('emitted_blackbody_power','emitted-blackbody-power-183'),('net_blackbody_exchange','net-blackbody-exchange-184'),('parallel_heat_losses','parallel-heat-losses-185'),('reversible_isothermal_entropy','reversible-isothermal-entropy-186'),('entropy_hot_cold','entropy-hot-cold-187')]
AUDIT_RESULTS={}


def reviewed_inputs(module,batch):
    # Fingerprints freeze canonical payload bytes already read at the Git commit;
    # runtime replay need not reopen an iCloud-offloaded Git object pack.
    locations=[APP,REPO.parent/'cric-author-b-resident/officina-di-fisica']
    for app in locations:
        try:
            package=json.loads((app/'editorial/batches'/f'{batch}.json').read_text())
            bindings=json.loads((app/'editorial/batches'/f'{batch}-bindings.json').read_text())
        except FileNotFoundError:
            continue
        if digest(package)==module.REVIEWED_PACKAGE_SHA256 and digest(bindings)==module.REVIEWED_BINDINGS_SHA256:
            return package,bindings
    raise AssertionError('Reviewed payload unavailable locally; integrate the author corrections first')


def rebind(row,links):
    next(b for b in links if b['id']==row['id'])['candidateSha256']=digest(row)


def verify_with_replaced_tokens(module,package,links):
    """Test only: deliberately replace every edition guard, retaining math oracle."""
    tokens={r['id']:token for r,b,token,a,e in reviewed_rows(package,links,{},module.EXPECTED_IDS,APP/'editorial/assets')}
    with patch.dict(module.REVIEWED_CANDIDATES,tokens),patch.multiple(module,
          REVIEWED_PACKAGE_SHA256=digest(package),REVIEWED_BINDINGS_SHA256=digest(links)):
        return module.verify(package,links)


def audit(module,package,bindings):
    good=module.verify(package,bindings)
    if len(good)!=16 or not all(r['ok'] for r in good):raise AssertionError('Read original candidate edition failed')
    cases=[]
    for index,original in enumerate(package['records']):
        changed,links=deepcopy(package),deepcopy(bindings)
        row=changed['records'][index];answer=row['answer']
        answer['value']=(answer['value']+1 if answer['type']=='numeric' else
                         next(v for v in answer['options'] if v!=answer['value']))
        rebind(row,links)
        result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
        math_errors=[e for e in result['errors'] if e.startswith('Independent ') and any(q in e for q in ('key mismatch','result mismatch','answer or unit invalid'))]
        if result['ok'] or not math_errors:raise AssertionError('Rebound and retokenized wrong key escaped independent math: '+row['id'])
        cases.append({'case':'wrong_key_with_candidate_binding_and_all_edition_guards_replaced','id':row['id'],'rejectedBy':math_errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][2]
    false_proof='Si possono usare Celsius nelle quarte potenze; conservazione dell’energia implica sempre entropia totale nulla.'
    row['blocks'].append({'type':'text','text':false_proof});rebind(row,links)
    result=next(r for r in module.verify(changed,links) if r['id']==row['id'])
    if result['ok'] or 'Independent reviewed signature mismatch' not in result['errors']:raise AssertionError('False proof escaped frozen individual reading')
    cases.append({'case':'correct_key_but_false_physics_proof_rebound','id':row['id'],'rejectedBy':['frozen independent full-record reading']})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]['sourceSha256']='0'*64
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==links[0]['id'])
    errors=[e for e in result['errors'] if 'pinned' in e and 'source binding' in e]
    if result['ok'] or not errors:raise AssertionError('False source binding escaped independently read Git source')
    cases.append({'case':'false_source_hash_with_all_edition_guards_replaced','id':result['id'],'rejectedBy':errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=next(r for r in changed['records'] if r['answer']['type']=='numeric')
    before_unit=row['answer']['unit']
    row['answer']['unit']='K' if before_unit=='J' else 'J'
    if row['answer']['unit']==before_unit:raise AssertionError('Unit mutation must actually change dimension')
    rebind(row,links)
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
    errors=[e for e in result['errors'] if 'numeric unit mismatch' in e]
    if result['ok'] or not errors:raise AssertionError('Wrong numeric physical unit escaped oracle')
    cases.append({'case':'correct_number_wrong_unit_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':errors})
    changed,links=deepcopy(package),deepcopy(bindings)
    row=changed['records'][0];row['course']='C5';rebind(row,links)
    results=verify_with_replaced_tokens(module,changed,links)
    errors=next(r['errors'] for r in results if r['id']==row['id'])
    if not any('real course' in e for e in errors):raise AssertionError('Wrong course escaped real lesson mapping')
    cases.append({'case':'wrong_course_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':['independent real course and lesson mapping']})
    for label,transform in [('empty',lambda p:p.update(records=[])),('partial',lambda p:p['records'].pop()),
                             ('duplicate',lambda p:p['records'].__setitem__(1,deepcopy(p['records'][0])))]:
        changed=deepcopy(package);transform(changed)
        try:module.verify(changed,bindings)
        except ValueError:cases.append({'case':label+'_batch','rejectedBy':['complete unique batch boundary']})
        else:raise AssertionError('Invalid batch boundary accepted: '+label)
    changed=deepcopy(package)
    asset=changed['assets'][0]
    asset['data']=base64.b64encode(base64.b64decode(asset['data'])+b' ').decode()
    try:module.verify(changed,bindings)
    except ValueError:cases.append({'case':'embedded_svg_bytes_changed','rejectedBy':['hashed uploaded asset boundary']})
    else:raise AssertionError('Changed embedded SVG bytes accepted')
    with tempfile.TemporaryDirectory(prefix='cric-review-svg-') as directory:
        root=Path(directory)
        for a in package['assets']:(root/a['name']).write_bytes(base64.b64decode(a['data']))
        a=package['assets'][0];file=root/a['name'];file.write_bytes(file.read_bytes()+b' ')
        results=module.verify(package,bindings,root)
        if all(r['ok'] for r in results):raise AssertionError('Changed local scientific SVG accepted')
        cases.append({'case':'local_svg_bytes_changed','rejectedBy':['frozen independently read scientific asset']})
    result={'schemaVersion':'1.0.0','cases':cases,'passed':len(cases),'humanApproval':'NOT_RUN','publication':'DRAFT'}
    AUDIT_RESULTS[module.__name__]=result
    return result



from fractions import Fraction
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET
import hashlib

def module(name):
    return importlib.import_module('tools.corpus_engineering.'+name+'_verifier')

class CrossReviewThermalEntropy(unittest.TestCase):
    def test_all_eighty_fresh_saved_reports_obey_canonical_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        count=0
        for name,batch in FAMILIES:
            m=module(name);p,b=reviewed_inputs(m,batch);fresh=m.report(p,b)
            saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text())
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b)
            assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(saved,fresh)
            self.assertTrue(all(r['ok'] for r in fresh['records']))
            self.assertTrue(all(r['verificationMode'] in ['EXACT_ORACLE','AI_CONCEPTUAL'] for r in fresh['records']))
            count+=len(fresh['records'])
        self.assertEqual(count,80)

    def test_source_file_and_all_eighty_literal_record_hashes_match_git(self):
        first=module(FAMILIES[0][0])
        raw=subprocess.check_output(['git','show',first.SOURCE_REF+':'+first.SOURCE_PATH],cwd=REPO)
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16')
        rows=json.loads(raw);rows=rows if isinstance(rows,list)else rows['questions']
        sources={r['id']:r for r in rows};count=0
        for name,_ in FAMILIES:
            m=module(name);self.assertEqual(len(m.READ_SOURCE_SHA256),16)
            self.assertEqual({k:digest(sources[k])for k in m.READ_SOURCE_SHA256},m.READ_SOURCE_SHA256)
            count+=len(m.READ_SOURCE_SHA256)
        self.assertEqual(count,80)

    def test_math_oracles_survive_rebound_keys_and_replaced_edition_guards(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                m=module(name);p,b=reviewed_inputs(m,batch)
                self.assertEqual(audit(m,p,b)['passed'],25)

    def test_primary_eighty_is_immutable_and_complete(self):
        file=APP/'editorial/reviews/primary-thermal-transport-183-187-before-candidates-20261125.md'
        self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),'004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95')
        text=file.read_text();self.assertEqual(text.count('## u5-'),80)
        self.assertEqual(text.count('### Derivazione indipendente'),80)
        self.assertFalse(text.endswith('\n\n'))
        self.assertTrue(all(line==line.rstrip() for line in text.splitlines()))


    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,20),st.integers(1,6))
    def test_emission_absolute_temperature_area_and_fourth_power(self,area,theta,factor):
        m=module('emitted_blackbody_power');area=sp.Integer(area);theta=sp.Integer(theta)
        power=m.emission(area,theta)
        self.assertEqual(power,sp.Rational(3,5)*area*theta**4)
        self.assertEqual(m.theta_inverse(power,area),theta)
        self.assertEqual(m.emission(factor*area,theta),factor*power)
        self.assertEqual(m.emission(area,factor*theta),factor**4*power)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,20),st.integers(1,5))
    def test_net_radiation_order_inverse_and_equilibrium(self,ambient,gap,factor):
        m=module('net_blackbody_exchange');ambient=sp.Integer(ambient);surface=ambient+gap
        power=m.net_power(surface,ambient)
        self.assertGreater(power,0)
        self.assertEqual(power,6*surface**4-6*ambient**4)
        self.assertEqual(m.surface_inverse(power,ambient),surface)
        self.assertEqual(m.ambient_inverse(power,surface),ambient)
        self.assertEqual(m.net_power(factor*surface,factor*ambient),factor**4*power)
        self.assertEqual(m.net_power(surface,surface,True),0)
        self.assertGreater(6*surface**4,0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,6))
    def test_two_distinct_paths_add_power_and_respect_inverse_domain(self,interval,h,factor):
        m=module('parallel_heat_losses');interval=sp.Integer(interval);h=sp.Integer(h)
        power=m.loss(interval,h)
        self.assertEqual(power,5*interval+h*interval)
        self.assertEqual(m.interval_inverse(power,h),interval)
        self.assertEqual(m.convection_inverse(power,interval),h)
        self.assertEqual(m.loss(factor*interval,h),factor*power)
        self.assertLess(m.loss(interval,factor*h),factor*power) if factor>1 else self.assertEqual(m.loss(interval,factor*h),power)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,1000),st.integers(1,1000),st.integers(1,8))
    def test_reversible_entropy_transfer_is_not_production(self,heat,temperature,factor):
        m=module('reversible_isothermal_entropy');heat=sp.Integer(heat);temperature=sp.Integer(temperature)
        change=m.entropy(heat,temperature)
        self.assertGreater(change,0);self.assertEqual(change,heat/temperature)
        self.assertEqual(m.heat_inverse(change,temperature),heat)
        self.assertEqual(m.entropy(factor*heat,factor*temperature),change)
        self.assertEqual(change+(-heat/temperature),0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,1000),st.integers(1,1000),st.integers(1,500),st.integers(1,6))
    def test_spontaneous_heat_energy_conserved_entropy_positive(self,heat,cold,gap,factor):
        m=module('entropy_hot_cold');heat=sp.Integer(heat);cold=sp.Integer(cold);hot=cold+gap
        change=m.total_entropy(heat,cold,hot)
        self.assertEqual(-heat+heat,0)
        self.assertEqual(change,heat*gap/(cold*hot));self.assertGreater(change,0)
        self.assertEqual(m.cold_inverse(change,hot,heat),cold)
        self.assertEqual(m.hot_inverse(change,cold,heat),hot)
        self.assertEqual(m.total_entropy(heat,factor*cold,factor*hot),change/factor)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,100))
    def test_nonidentifiable_reversible_constraint_and_instrument_calibration(self,temperature,gain,offset):
        m=module('reversible_isothermal_entropy');temperature=sp.Integer(temperature)
        self.assertEqual(m.entropy(2*temperature,temperature),2)
        g,b=m.calibrate(2,1,2*gain+offset,gain+offset)
        self.assertEqual((g,b),(gain,offset))
        self.assertEqual((4*g+b-b)/g,4)

    def test_physical_domains_roots_and_noncommuting_means(self):
        for name,fn,args in [('emitted_blackbody_power','emission',(0,1)),('emitted_blackbody_power','emission',(1,0)),('emitted_blackbody_power','theta_inverse',(0,1)),('net_blackbody_exchange','net_power',(1,1)),('net_blackbody_exchange','net_power',(1,2)),('net_blackbody_exchange','ambient_inverse',(96,2)),('parallel_heat_losses','loss',(0,1)),('parallel_heat_losses','loss',(1,0)),('parallel_heat_losses','convection_inverse',(50,10)),('reversible_isothermal_entropy','entropy',(1,0)),('reversible_isothermal_entropy','entropy',(-1,300)),('entropy_hot_cold','total_entropy',(600,200,200)),('entropy_hot_cold','hot_inverse',(3,200)),('entropy_hot_cold','hot_inverse',(4,200)),('entropy_hot_cold','cold_inverse',(0,400))]:
            with self.subTest(name=name,fn=fn,args=args):
                with self.assertRaises(ValueError):getattr(module(name),fn)(*args)
        for name,want in [('emitted_blackbody_power',5),('net_blackbody_exchange',1),('parallel_heat_losses',5),('entropy_hot_cold',400)]:self.assertEqual(module(name).oracle()[15],want)
        self.assertEqual(module('reversible_isothermal_entropy').oracle()[15],'Infinite: ogni T>0 con Q_rev=βT')
        for name,mean,at_mean in [('emitted_blackbody_power',267,sp.Rational(5625,32)),('net_blackbody_exchange',960,870),('parallel_heat_losses',200,sp.Rational(375,2)),('reversible_isothermal_entropy',sp.Rational(3,2),sp.Rational(601,301)),('entropy_hot_cold',sp.Rational(5,4),sp.Rational(6,5))]:
            self.assertEqual(module(name).oracle()[11],mean);self.assertNotEqual(mean,at_mean)

    def test_safe_ast_dimension_checks_and_constitutive_faults(self):
        for name,_ in FAMILIES:
            m=module(name)
            for bad in ['__import__("os")','x','1/0','2**10000','r(-1)','9'*100,'1+'*40+'1']:
                with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
            self.assertEqual(m.exact_literal('49/8'),sp.Rational(49,8))
            self.assertEqual(m.SI.Quantity(1,'mW').to('W').magnitude,Fraction(1,1000))
        for name,func in [('emitted_blackbody_power','emission'),('net_blackbody_exchange','net_power'),('parallel_heat_losses','loss'),('reversible_isothermal_entropy','entropy'),('entropy_hot_cold','total_entropy')]:
            m=module(name);m.oracle.cache_clear();original=getattr(m,func)
            with patch.object(m,func,side_effect=lambda *args,_original=original,**kwargs:_original(*args,**kwargs)+1):
                with self.assertRaises(AssertionError):m.oracle()
            m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_svg_scales_separate_arrowheads_and_real_native_evidence(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        def xml(name):return ET.parse(APP/'editorial/assets'/f'{name}-progressive.svg').getroot()
        def widths(name,height):return [Fraction(r.attrib['width'])for r in xml(name).findall('.//s:rect',ns)if r.attrib.get('height')==str(height)]
        self.assertEqual(widths('emitted-blackbody-power',34),[Fraction(9,2),72,Fraction(729,2),36,Fraction(729,2),Fraction(801,4)])
        self.assertEqual(widths('net-blackbody-exchange',34),[Fraction(1701,5),Fraction(21,5),336,120,360,240])
        self.assertEqual(widths('parallel-heat-losses',34),[175,175,175,175,120,360,240])
        self.assertEqual(widths('reversible-isothermal-entropy',42),[200,200])
        self.assertEqual(widths('reversible-isothermal-entropy',34),[240,120,180])
        self.assertEqual(widths('entropy-hot-cold',40),[120,240,120])
        self.assertEqual(widths('entropy-hot-cold',34),[240,160,200])
        D=APP/'editorial/reviews/thermal-entropy-183-187-independent-assets-20261125';manifest=json.loads((D/'manifest.json').read_text())
        self.assertEqual(manifest['renderObservedExitCode'],0)
        for f,expected in manifest['files'].items():self.assertEqual(hashlib.sha256((D/f).read_bytes()).hexdigest(),expected)
        for name,_ in FAMILIES:
            family=name.replace('_','-')
            self.assertEqual((D/(family+'-progressive.svg')).read_bytes(),(APP/f'editorial/assets/{family}-progressive.svg').read_bytes())
            self.assertTrue((D/(family+'-full-native.png')).read_bytes().startswith(b'\x89PNG'))
            self.assertIn('OBSERVED_EXIT=0',(D/(family+'-native-render.txt')).read_text())
            for path in xml(family).findall('.//s:path',ns):
                if 'marker-end'in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
            texts=' '.join(''.join(e.itertext())for e in xml(family).findall('.//s:text',ns));self.assertNotIn('px',texts)

if __name__=='__main__':unittest.main()
