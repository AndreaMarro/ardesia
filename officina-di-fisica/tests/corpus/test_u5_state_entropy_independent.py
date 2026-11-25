"""Source-first independent U5-05 math, domain and adversarial evidence."""
from copy import deepcopy
import importlib,json,subprocess,unittest
from pathlib import Path
from unittest.mock import patch
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering import entropy_state_review as boundary
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.review_contract import reviewed_rows
APP=Path(__file__).resolve().parents[2]
FAMILIES=[('ideal_expansion_entropy','ideal-expansion-entropy-188'),('statistical_entropy','statistical-entropy-189')]
AUDITS={}

def inputs(name,batch):
    module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
    return module,json.loads((APP/'editorial/batches'/(batch+'.json')).read_text()),json.loads((APP/'editorial/batches'/(batch+'-bindings.json')).read_text())

def retokenized(module,package,bindings):
    tokens={r['id']:sig for r,b,sig,a,e in reviewed_rows(package,bindings,{},module.EXPECTED_IDS,APP/'editorial/assets')}
    with patch.multiple(module,REVIEWED_PACKAGE_SHA256=digest(package),REVIEWED_BINDINGS_SHA256=digest(bindings)),patch.dict(module.REVIEWED_CANDIDATES,tokens):return module.verify(package,bindings)

def rebind(row,bindings):next(b for b in bindings if b['id']==row['id'])['candidateSha256']=digest(row)

class StateEntropyIndependent(unittest.TestCase):
    def test_individual_fresh_reports_and_primary_source_hashes(self):
        source=subprocess.check_output(['git','show','5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-05.json'],cwd=APP)
        self.assertEqual(sha(source),'e8f90aea8c862df7110419c599fbd2b7160d32b370a098146feb303553194378')
        records={r['id']:r for r in json.loads(source)}
        primary=APP/'editorial/reviews/primary-u5-05-before-candidates-188-189-20261125.md'
        self.assertEqual(sha(primary.read_bytes()),'582e30b76edaa9d53138240934256a3ff1224966737fcdb7b74defa578b21023')
        for name,batch in FAMILIES:
            m,p,b=inputs(name,batch);fresh=m.report(p,b)
            self.assertEqual(fresh,json.loads((APP/'editorial/reviews'/(batch+'.json')).read_text()))
            self.assertEqual(len(fresh['records']),16);self.assertTrue(all(r['ok'] for r in fresh['records']))
            self.assertEqual(m.READ_SOURCE_SHA256,{k:digest(records[k]) for k in m.READ_SOURCE_SHA256})
            for r in fresh['records']:
                self.assertTrue(r['manualArithmetic']);self.assertTrue(r['distractors']);self.assertEqual((r['humanApproval'],r['publication']),('NOT_RUN','DRAFT'))

    def test_all_32_wrong_keys_are_rejected_even_with_all_edition_tokens_replaced(self):
        for name,batch in FAMILIES:
            m,p,b=inputs(name,batch);cases=[]
            for index,original in enumerate(p['records']):
                q,links=deepcopy(p),deepcopy(b);row=q['records'][index];a=row['answer']
                a['value']=a['value']+1 if a['type']=='numeric' else next(v for v in a['options'] if v!=a['value'])
                rebind(row,links);result=next(r for r in retokenized(m,q,links) if r['id']==row['id'])
                math_errors=[e for e in result['errors'] if e.startswith('Independent ') and any(s in e for s in ('key mismatch','result mismatch','answer or unit invalid'))]
                self.assertFalse(result['ok']);self.assertTrue(math_errors,result)
                cases.append({'id':row['id'],'case':'wrong_key_all_edition_guards_replaced','rejectedBy':math_errors})
            AUDITS[batch]=cases

    def test_decimal_lexemes_remain_exact_and_nearby_false_choice_is_rejected(self):
        self.assertEqual(boundary.exact_literal('2.0000000000000000001'),sp.Rational(20000000000000000001,10**19))
        self.assertNotEqual(boundary.exact_literal('2.0000000000000000001'),2)
        self.assertEqual(boundary.exact_literal('16√2'),16*sp.sqrt(2))
        for bad in ['1/0','r(-1)','2**100','__import__(1)','r(10001)','NaN']:
            with self.assertRaises((ValueError,SyntaxError)):boundary.exact_literal(bad)
        m,p,b=inputs(*FAMILIES[0]);row=p['records'][6];row['answer']['options'][0]=row['answer']['value']='2.0000000000000000001';rebind(row,b)
        result=next(r for r in retokenized(m,p,b) if r['id']==row['id'])
        self.assertIn('Independent exact result mismatch',result['errors']);self.assertFalse(result['ok'])

    def test_rebound_source_wrong_units_false_explanations_and_equivalent_choices_reject(self):
        for name,batch in FAMILIES:
            m,p,b=inputs(name,batch)
            q,links=deepcopy(p),deepcopy(b);links[0]['sourceSha256']='0'*64
            self.assertIn('Independent pinned source binding mismatch',retokenized(m,q,links)[0]['errors'])
            q,links=deepcopy(p),deepcopy(b);row=q['records'][0];row['answer']['unit']='K';rebind(row,links)
            self.assertIn('Independent numeric unit or exact tolerance mismatch',retokenized(m,q,links)[0]['errors'])
            q,links=deepcopy(p),deepcopy(b);row=q['records'][0];row['blocks'].append({'type':'text','text':'Ogni processo isotermo ha sempre variazione di entropia nulla.'});rebind(row,links)
            self.assertIn('Independent reviewed signature mismatch',m.verify(q,links)[0]['errors'])
            q,links=deepcopy(p),deepcopy(b);row=q['records'][6];row['answer']['options'][1]=row['answer']['value']+'.0' if name.startswith('ideal') else '0.5';rebind(row,links)
            result=next(r for r in retokenized(m,q,links) if r['id']==row['id'])
            self.assertFalse(result['ok']);self.assertIn('Independent equivalent numeric alternatives',result['errors'])
            for mode in ['empty','partial','duplicate']:
                q=deepcopy(p)
                if mode=='empty':q['records']=[]
                elif mode=='partial':q['records'].pop()
                else:q['records'][1]=deepcopy(q['records'][0])
                with self.assertRaises(ValueError):m.verify(q,b)

    def test_domains_zero_baselines_integer_inverse_and_system_boundaries(self):
        a,_,_=inputs(*FAMILIES[0]);b,_,_=inputs(*FAMILIES[1])
        for B,r in [(0,2),(2,0),(-1,2),(2,-1)]:
            with self.assertRaises(ValueError):a.entropy(B,r)
        for bad in [sp.I,sp.oo,-sp.oo,sp.nan]:
            for B,r in [(bad,2),(2,bad)]:
                with self.assertRaises(ValueError):a.entropy(B,r)
            with self.assertRaises(ValueError):a.inverse_ratio(bad,2)
            with self.assertRaises(ValueError):a.inverse_B(bad,2)
        for S,r in [(0,1),(2,1),(2,sp.Rational(1,2)),(-2,2)]:
            with self.assertRaises(ValueError):a.inverse_B(S,r)
        self.assertEqual(a.inverse_B(-2,sp.Rational(1,2)),2)
        self.assertEqual(a.inverse_ratio(0,2),1)
        for ni,nf in [(0,2),(1,0),(sp.Rational(1,2),2),(-1,2)]:
            with self.assertRaises(ValueError):b.coefficient(ni,nf)
        with self.assertRaises(ValueError):b.final_count(2,sp.Rational(7,2))
        with self.assertRaises(ValueError):b.scaled_ratio(2,2,1,1)
        with self.assertRaises(ValueError):b.scaled_ratio(2,8,sp.Rational(1,3),1)
        self.assertEqual(b.final_count(8,-2),2)
        self.assertEqual(b.scaled_ratio(2,8,sp.Rational(1,4),sp.Rational(1,2)),sp.Rational(1,2))
        self.assertEqual(a.oracle()[-1],8);self.assertEqual(a.entropy(4,8),12)

    @settings(max_examples=60,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(-5,5))
    def test_ideal_exact_expansion_compression_and_inverse(self,B,power):
        a,_,_=inputs(*FAMILIES[0]);B=sp.Integer(B);r=sp.Integer(2)**power;S=a.entropy(B,r)
        self.assertEqual(S,B*power);self.assertEqual(a.inverse_ratio(S,B),r)
        if power:self.assertEqual(a.inverse_B(S,r),B)
        self.assertEqual(a.entropy(B,r)+a.entropy(B,1/r),0)

    @settings(max_examples=60,derandomize=True,deadline=None)
    @given(st.integers(1,50),st.integers(0,6),st.integers(1,20))
    def test_integer_common_scale_invariance_and_inverse(self,initial,power,scale):
        b,_,_=inputs(*FAMILIES[1]);final=initial*2**power
        self.assertEqual(b.coefficient(initial,final),power)
        self.assertEqual(b.coefficient(initial*scale,final*scale),power)
        self.assertEqual(b.final_count(initial,power),final)
        self.assertEqual(b.coefficient(final,initial),-power)

    def test_model_faults_cannot_be_masked_by_authored_keys(self):
        a,p,b=inputs(*FAMILIES[0]);a.oracle.cache_clear()
        with patch.object(a,'entropy',side_effect=lambda B,r:sp.sympify(B)*r):
            with self.assertRaises(AssertionError):a.verify(p,b)
        a.oracle.cache_clear()
        m,p,b=inputs(*FAMILIES[1]);m.oracle.cache_clear()
        with patch.object(m,'coefficient',side_effect=lambda initial,final:sp.sympify(final)/initial):
            with self.assertRaises(AssertionError):m.verify(p,b)
        m.oracle.cache_clear()

if __name__=='__main__':unittest.main()
