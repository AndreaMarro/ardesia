"""Reproducible independent125–129 surface-force and energy audits, never importing candidate authoring."""
import base64
from copy import deepcopy
import importlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
REPO=APP.parent
FAMILIES=[('alveolar_surfactant_balance','alveolar-surfactant-balance-125'),('two_droplet_pressure','two-droplet-pressure-126'),('capillary_rise','capillary-rise-127'),('drop_detachment','drop-detachment-128'),('droplet_fragmentation','droplet-fragmentation-129')]
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
    false_proof='Conservare il volume conserva sempre la superficie; il joule è un newton per metro e Laplace da sola dimostra stabilità clinica di un alveolo reale.'
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
    row['answer']['unit']='Hz';rebind(row,links)
    result=next(r for r in verify_with_replaced_tokens(module,changed,links) if r['id']==row['id'])
    errors=[e for e in result['errors'] if 'numeric unit mismatch' in e]
    if result['ok'] or not errors:raise AssertionError('Wrong numeric physical unit escaped oracle')
    cases.append({'case':'correct_number_wrong_unit_with_all_edition_guards_replaced','id':row['id'],'rejectedBy':errors})
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


class CrossReviewSurfaceModelsTests(unittest.TestCase):
    def test_all_eighty_reports_satisfy_canonical_record_identity(self):
        from tools.corpus_engineering.batches import assert_record_identity
        count=0
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                fresh=module.report(package,bindings)
                saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text())
                count+=len(fresh['records'])
                assert_record_identity(fresh['records'],module.EXPECTED_IDS,package,bindings)
                assert_record_identity(saved['records'],module.EXPECTED_IDS,package,bindings)
                self.assertEqual(saved,fresh)
        self.assertEqual(80,count)

    def test_independent_oracles_and_edition_integrity(self):
        for name,batch in FAMILIES:
            with self.subTest(batch=batch):
                module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
                package,bindings=reviewed_inputs(module,batch)
                result=audit(module,package,bindings)
                self.assertEqual(24,result['passed'])


from fractions import Fraction
from hypothesis import given,settings,strategies as st
import sympy as sp
import xml.etree.ElementTree as ET

class SurfaceModelPhysicalProperties(unittest.TestCase):
    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,30),st.integers(1,30),st.integers(1,10))
    def test_equal_internal_pressures_and_scale_invariance(self,tension,small,extra,scale):
        large=small+extra;relative=Fraction(small,large)
        required=tension*relative
        self.assertGreater(relative,0);self.assertLess(relative,1)
        self.assertEqual(2*required/small,Fraction(2*tension,large))
        self.assertEqual(required/relative,tension)
        self.assertEqual(Fraction(small*scale,large*scale),relative)
        # Common external pressure changes neither required tension nor difference.
        external=100000
        self.assertEqual(external+2*required/small,external+Fraction(2*tension,large))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,30),st.integers(1,30),st.integers(1,10))
    def test_curvature_difference_inverse_and_sign(self,tension,small,extra,scale):
        large=small+extra
        delta=2*tension*(Fraction(1,small)-Fraction(1,large))
        self.assertGreater(delta,0);self.assertLess(delta,Fraction(2*tension,small))
        self.assertEqual(1/(delta/(2*tension)+Fraction(1,large)),small)
        self.assertEqual(1/(Fraction(1,small)-delta/(2*tension)),large)
        changed=2*tension*(Fraction(1,small*scale)-Fraction(1,large*scale))
        self.assertEqual(changed/delta,Fraction(1,scale))
        self.assertEqual(-delta,2*tension*(Fraction(1,large)-Fraction(1,small)))

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(1,30),st.integers(1,10),st.integers(1,10))
    def test_capillary_height_geometry_and_nonidentifiability(self,tension,radius,a,b):
        height=Fraction(tension,5*radius)
        self.assertEqual(5*radius*height,tension)
        changed=Fraction(tension*a,5*radius*b)
        self.assertEqual(changed/height,Fraction(a,b))
        self.assertEqual(Fraction(50*radius,5*radius),10)
        # Dimensionless force balance after canceling common positive pi.
        self.assertEqual(2*radius*tension,10*radius*radius*height)
        self.assertEqual(Fraction(tension,5*2*radius),height/2)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,10),st.integers(1,10))
    def test_prescribed_detachment_force_not_sphere_volume(self,radius,tension,a,b):
        coefficient=Fraction(radius*tension,5) # volume in units pi microliter
        changed=Fraction(radius*a*tension*b,5)
        self.assertEqual(changed/coefficient,a*b)
        self.assertEqual(5*coefficient/tension,radius)
        self.assertEqual(5*coefficient/radius,tension)
        self.assertEqual(Fraction(2*radius*tension,1000000),10000*coefficient/Fraction(10**9))
        self.assertEqual(Fraction(2*radius*tension,5),2*coefficient)
        # Sphere scaling would be cubic; this prescribed rim law is linear.
        self.assertNotEqual(Fraction(2*radius*tension,5),8*coefficient)

    @settings(max_examples=40,derandomize=True,deadline=None)
    @given(st.integers(1,30),st.integers(1,12),st.integers(1,8))
    def test_integer_fragmentation_volume_area_energy_and_work(self,radius,root,scale):
        count=root**3;child=Fraction(radius,root)
        self.assertEqual(count*child**3,radius**3)
        area_final=count*child**2
        self.assertEqual(area_final,radius**2*root)
        initial=Fraction(radius**2,25) # energies in pi microjoule
        final=Fraction(area_final,25)
        self.assertEqual(final/initial,root)
        self.assertEqual(final-initial,initial*(root-1))
        self.assertGreaterEqual(final-initial,0)
        self.assertEqual(Fraction((radius*scale)**2*root,25)/final,scale**2)
        self.assertEqual(count, int(count))
        if count==1:self.assertEqual(final-initial,0)

    def test_all_pinned_original_source_hashes_match_git_bytes(self):
        import subprocess
        source_path='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-05.json'
        ref='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
        originals=json.loads(subprocess.check_output(['git','show',ref+':'+source_path],cwd=REPO))
        original_hashes={row['id']:digest(row) for row in originals}
        count=0
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            self.assertEqual(len(module.READ_SOURCE_SHA256),16)
            for source_id,frozen in module.READ_SOURCE_SHA256.items():
                self.assertEqual(original_hashes[source_id],frozen)
                count+=1
        self.assertEqual(count,80)

    def test_numeric_choice_alternatives_have_one_exact_solution(self):
        count=0
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            package,bindings=reviewed_inputs(module,batch)
            expected=module.oracle()
            for row in package['records']:
                n=int(row['id'].rsplit('-',1)[1]);want=expected[n-1]
                if row['answer']['type']!='choice' or isinstance(want,str):continue
                suffix=module.SUFFIX.get(n,'')
                matches=[]
                for option in row['answer']['options']:
                    raw=option.replace('−','-')
                    if suffix:
                        self.assertTrue(raw.endswith(suffix));raw=raw.removesuffix(suffix)
                    value=module.exact_literal(raw.strip())
                    if sp.simplify(value-want)==0:matches.append(option)
                self.assertEqual(matches,[row['answer']['value']],row['id'])
                count+=1
        self.assertGreaterEqual(count,25)

    def test_bounded_pi_radical_arithmetic_without_eval(self):
        for name,batch in FAMILIES:
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            self.assertEqual(module.exact_literal('0.5'),sp.Rational(1,2))
            self.assertEqual(module.exact_literal('2π/25'),2*sp.pi/25)
            self.assertEqual(module.exact_literal('-4π'),-4*sp.pi)
            self.assertEqual(module.exact_literal('2√5/5'),2*sp.sqrt(5)/5)
            for raw in ['1/0','r(-1)','10**1000000','__import__(1)','r(1,2)','[1,2]','nan','1e1000','r(10001)','p(1)','p.__class__']:
                with self.assertRaises((ValueError,SyntaxError)):module.exact_literal(raw)

    def test_all_five_svg_scales_and_energy_distinction(self):
        ns={'s':'http://www.w3.org/2000/svg'}
        def svg(f):return ET.parse(APP/'editorial/assets'/f'{f}-progressive.svg')
        def elems(tree,tag):return tree.findall('.//s:'+tag,ns)
        def widths(tree):return {int(e.attrib['y']):int(e.attrib['width']) for e in elems(tree,'rect') if 'y' in e.attrib}
        surf=svg('alveolar-surfactant-balance')
        self.assertEqual([int(c.attrib['r']) for c in elems(surf,'circle')[:2]],[40,80])
        paths=[p.attrib.get('d') for p in elems(surf,'path')]
        self.assertIn('M100 1340L500 1140',paths)
        self.assertEqual(Fraction(1340-1240,5),40*Fraction(300-100,400))
        pressure=svg('two-droplet-pressure')
        self.assertEqual([int(c.attrib['r']) for c in elems(pressure,'circle')],[25,100])
        self.assertEqual(widths(pressure),{660:200,750:50,840:150,1115:100,1205:40,1295:60})
        capillary=svg('capillary-rise')
        columns=[e for e in elems(capillary,'rect') if e.attrib.get('fill')=='#a7d8ec']
        self.assertEqual([(int(e.attrib['width']),int(e.attrib['height'])) for e in columns],[(40,200),(40,200),(80,100)])
        drop=svg('drop-detachment');self.assertEqual(widths(drop),{1200:160,1330:400})
        self.assertEqual(Fraction(160,40),4);self.assertEqual(Fraction(400,40),10)
        self.assertIn('M320 205H360',[p.attrib.get('d') for p in elems(drop,'path')])
        fragment=svg('droplet-fragmentation')
        self.assertEqual([int(c.attrib['r']) for c in elems(fragment,'circle')],[50]+[25]*8)
        self.assertEqual(Fraction(8*25**3,50**3),1)
        self.assertEqual(Fraction(8*25**2,50**2),2)
        w=widths(fragment);self.assertEqual([w[y] for y in(1050,1160,1270)],[100,200,100])
        self.assertEqual(w[1160]-w[1050],w[1270])

if __name__=='__main__':unittest.main()
