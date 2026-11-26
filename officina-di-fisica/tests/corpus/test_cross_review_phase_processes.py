"""Reproducible independent173–177 phase-process heat audits, never importing candidate authoring."""
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
FAMILIES=[('subzero_ice_melting','subzero-ice-melting-173'),('steam_condensation_cooling','steam-condensation-cooling-174'),('ice_final_temperature','ice-final-temperature-175'),('warm_water_and_ice','warm-water-and-ice-176'),('freezing_time','freezing-time-177')]
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
    false_proof='Il cambiamento di fase non richiede energia quando la temperatura resta costante; massa e calore specifico sono sempre la stessa grandezza.'
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

class CrossReviewPhaseProcesses(unittest.TestCase):
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
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b')
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
        file=APP/'editorial/reviews/primary-calorimetry-173-177-before-candidates-20261125.md'
        self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),'ea13a6d7b6eca676daa520594e324f8c84aaabe64114d375dc3eabf35f47e2d9')
        text=file.read_text();self.assertEqual(text.count('## u5-'),80)
        self.assertEqual(text.count('### Derivazione indipendente'),80)
        self.assertFalse(text.endswith('\n\n'))
        self.assertTrue(all(line==line.rstrip() for line in text.splitlines()))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,270),st.integers(1,6))
    def test_ice_warming_fusion_inverse_and_scaling(self,mass,theta,factor):
        m=module('subzero_ice_melting');mass=sp.Integer(mass);theta=sp.Integer(theta)
        energy=m.heat(mass,theta)
        self.assertEqual(energy,mass*(2*theta+300));self.assertEqual(m.inverse_mass(energy,theta),mass)
        self.assertEqual(m.heat(factor*mass,theta),factor*energy)
        self.assertEqual((energy/mass-300)/2,theta)
        self.assertGreater(energy,300*mass)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,95),st.integers(1,6))
    def test_condensation_cooling_signed_heat_and_liquid_margin(self,mass,interval,factor):
        m=module('steam_condensation_cooling');mass=sp.Integer(mass);interval=sp.Integer(interval)
        energy=m.heat(mass,interval);self.assertEqual(energy,mass*(2400+4*interval))
        self.assertEqual(m.inverse_mass(energy,interval),mass)
        self.assertEqual(m.heat(factor*mass,interval),factor*energy)
        self.assertTrue(m.liquid_interval_ok(interval,100))
        self.assertLess(-energy,0);self.assertEqual((-energy)+energy,0)
        self.assertTrue(m.liquid_interval_ok(150,200));self.assertFalse(m.liquid_interval_ok(200,200))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,99),st.integers(1,6))
    def test_complete_fusion_then_liquid_warming(self,mass,interval,factor):
        m=module('ice_final_temperature');mass=sp.Integer(mass);interval=sp.Integer(interval)
        energy=m.total_heat(mass,interval);self.assertEqual(m.increment(energy,mass),interval)
        self.assertEqual(m.increment(factor*energy,factor*mass),interval)
        self.assertEqual(energy,300*mass+4*mass*interval)
        self.assertGreater(energy,300*mass);self.assertLess(energy,700*mass)
        # Ratios of Celsius readings are reference-dependent; differences are not.
        self.assertNotEqual(sp.Rational(50,5),(50+sp.Rational(27315,100))/(5+sp.Rational(27315,100)))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,30),st.integers(1,6))
    def test_warm_water_and_ice_conservation_and_inverse(self,ice,excess,factor):
        m=module('warm_water_and_ice');ice=sp.Integer(ice);warm=2*ice+excess
        theta=m.increment(warm,ice)
        self.assertTrue(0<theta<50)
        self.assertEqual(4*warm*(50-theta),ice*(300+4*theta))
        self.assertEqual(m.warm_inverse(ice,theta),warm)
        self.assertEqual(m.increment(factor*warm,factor*ice),theta)
        self.assertGreater(200*warm,300*ice)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,6))
    def test_freezing_time_net_power_and_stopping_state(self,mass,power,factor):
        m=module('freezing_time');mass=sp.Integer(mass);power=sp.Integer(power)
        time=m.duration(mass,power)
        self.assertEqual(time*power,380*mass);self.assertEqual(m.inverse_mass(time,power),mass)
        self.assertEqual(time,80*mass/power+300*mass/power)
        self.assertEqual(m.duration(factor*mass,factor*power),time)
        self.assertGreater(time,0)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,80))
    def test_redundant_constraints_preserve_continuous_nonidentifiability(self,scale):
        s=sp.Integer(scale)
        self.assertEqual(module('ice_final_temperature').increment(320*s,s),5)
        self.assertEqual(module('warm_water_and_ice').increment(4*s,s),25)
        self.assertEqual(module('freezing_time').duration(s,10*s),38)
        self.assertEqual(module('subzero_ice_melting').heat(1,10),320)
        self.assertEqual(module('steam_condensation_cooling').heat(1,25),2500)

    def test_domains_physical_roots_and_temperature_offsets(self):
        for theta in [0,-1,sp.Rational(27315,100),300]:
            with self.assertRaises(ValueError):module('subzero_ice_melting').heat(1,theta)
        for energy,mass in [(300,1),(700,1),(299,1),(701,1),(800,0)]:
            with self.assertRaises(ValueError):module('ice_final_temperature').increment(energy,mass)
        for warm,ice in [(3,2),(1,1),(0,1),(4,0)]:
            with self.assertRaises(ValueError):module('warm_water_and_ice').increment(warm,ice)
        for theta in [0,50,60]:
            with self.assertRaises(ValueError):module('warm_water_and_ice').warm_inverse(1,theta)
        for mass,power in [(0,1),(1,0),(-1,1),(1,-1)]:
            with self.assertRaises(ValueError):module('freezing_time').duration(mass,power)
        self.assertEqual(module('subzero_ice_melting').oracle()[15],10)
        self.assertEqual(module('steam_condensation_cooling').oracle()[15],25)

    def test_safe_ast_units_and_oracle_not_generated_answer(self):
        for name,_ in FAMILIES:
            m=module(name)
            for bad in ['__import__("os")','x','1/0','2**10000','r(-1)','9'*100,'1+'*40+'1']:
                with self.assertRaises((ValueError,SyntaxError,ZeroDivisionError)):m.exact_literal(bad)
            self.assertEqual(m.exact_literal('49/8'),sp.Rational(49,8))
            self.assertEqual(m.SI.Quantity(1,'J/g').to('J/kg').magnitude,1000)
        # Alter each actual constitutive helper after discarding the cache. The
        # independent expected energy/balance assertions must expose the fault.
        for name,func in [('subzero_ice_melting','heat'),('steam_condensation_cooling','heat'),('ice_final_temperature','increment'),('warm_water_and_ice','increment'),('freezing_time','duration')]:
            m=module(name);m.oracle.cache_clear()
            original=getattr(m,func)
            with patch.object(m,func,side_effect=lambda *args,_original=original,**kwargs:_original(*args,**kwargs)+1):
                with self.assertRaises(AssertionError):m.oracle()
            m.oracle.cache_clear();self.assertEqual(len(m.oracle()),16)

    def test_scientific_svg_intrinsic_scales_and_single_arrowhead(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        def xml(name):return ET.parse(APP/'editorial/assets'/f'{name}-progressive.svg').getroot()
        def bars(name,height):return [Fraction(r.attrib['width']) for r in xml(name).findall('.//s:rect',ns)if r.attrib.get('height')==str(height)]
        self.assertEqual(bars('subzero-ice-melting',34),[24,360,24,360])
        self.assertEqual(bars('subzero-ice-melting',30),[192,408,300])
        self.assertEqual(bars('steam-condensation-cooling',34),[360,15,360,15])
        self.assertEqual(bars('steam-condensation-cooling',30),[200,416,308])
        self.assertEqual(bars('ice-final-temperature',34),[300,20,300,20])
        self.assertEqual(bars('ice-final-temperature',30),[20,200,110])
        self.assertEqual(bars('warm-water-and-ice',34),[320,240,80,175,100,Fraction(275,2)])
        self.assertEqual(bars('freezing-time',34),[80,300,80,300,64,240,64,240])
        for name in ['subzero-ice-melting','steam-condensation-cooling','ice-final-temperature','warm-water-and-ice','freezing-time']:
            for path in xml(name).findall('.//s:path',ns):
                if 'marker-end' in path.attrib:self.assertEqual(path.attrib['d'].count('M'),1)
            texts=' '.join(''.join(e.itertext())for e in xml(name).findall('.//s:text',ns))
            self.assertNotIn('px',texts)
        for name,expected in [('subzero-ice-melting','M100 320L120 220H420'),('steam-condensation-cooling','M100 220H460L475 320'),('ice-final-temperature','M100 320H400L420 220'),('freezing-time','M100 160L164 320H404')]:
            self.assertIn(expected,[p.attrib.get('d')for p in xml(name).findall('.//s:path',ns)])

if __name__=='__main__':unittest.main()
