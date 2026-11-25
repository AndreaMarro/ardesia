"""Real legacy consumers: preserve domain, reject a tiny false exact choice.

CRIC_LEGACY_AUDIT_DATA_APP may select the integrator's immutable package/assets
while the candidate decoder code is tested from this isolated worktree.
"""
from copy import deepcopy
import hashlib,importlib,importlib.util,json,os,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
DATA_APP=Path(os.environ.get('CRIC_LEGACY_AUDIT_DATA_APP',APP)).resolve()
FAMILIES=[('isochoric_heat','isochoric-heat-153'),('isobaric_monatomic_heat','isobaric-monatomic-heat-154'),
          ('compression_heating','compression-heating-157'),('reversible_isothermal_entropy','reversible-isothermal-entropy-186'),
          ('entropy_hot_cold','entropy-hot-cold-187')]

def module_and_package(name,batch):
    m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
    p=json.loads((DATA_APP/'editorial/batches'/(batch+'.json')).read_text())
    b=json.loads((DATA_APP/'editorial/batches'/(batch+'-bindings.json')).read_text())
    return m,p,b

class LegacyExactLiterals(unittest.TestCase):
    def test_each_consumer_keeps_tiny_decimal_residue_exact(self):
        for name,batch in FAMILIES:
            m,_,_=module_and_package(name,batch)
            for text,want in [('2.0000000000000000001',sp.Rational(20000000000000000001,10**19)),
                              ('0.99999999999999999',sp.Rational(99999999999999999,10**17)),
                              ('(2.0000000000000000001-2)*1000000000',sp.Rational(1,10**10))]:
                with self.subTest(module=name,literal=text):self.assertEqual(m.exact_literal(text),want)

    def test_pi_radical_rational_and_existing_decimal_grammar_stays_compatible(self):
        for name,batch in FAMILIES:
            m,_,_=module_and_package(name,batch)
            for text,want in [('2π/3 + √4',2*sp.pi/3+2),('p/2',sp.pi/2),('16√2',16*sp.sqrt(2)),
                              ('r(10000)',100),('.125',sp.Rational(1,8)),('-2/3',-sp.Rational(2,3)),
                              ('0.1234567890123',sp.Rational(1234567890123,10**13)),('1000000000',10**9)]:
                with self.subTest(module=name,literal=text):self.assertEqual(m.exact_literal(text),want)

    def test_raw_ast_integer_float_width_and_radical_limits_do_not_expand(self):
        bad=['1'*61,'1+'*27+'1','1000000001','0.1234567890123456','r(10001)','r(-1)','r(1/2)',
             '1/0','2**100','1e-2','1_0','__import__(1)','x','True','NaN']
        for name,batch in FAMILIES:
            m,_,_=module_and_package(name,batch)
            for text in bad:
                with self.subTest(module=name,literal=text):
                    with self.assertRaises((ValueError,SyntaxError,TypeError,RecursionError)):m.exact_literal(text)

    def test_all_five_existing_frozen_packages_still_verify(self):
        for name,batch in FAMILIES:
            m,p,b=module_and_package(name,batch);results=m.verify(p,b,DATA_APP/'editorial/assets')
            with self.subTest(module=name):
                self.assertEqual(len(results),16);self.assertTrue(all(row['ok'] for row in results),results)

    def test_tiny_false_choice_is_rejected_with_all_edition_tokens_replaced(self):
        for name,batch in FAMILIES:
            m,p,b=module_and_package(name,batch);p,b=deepcopy(p),deepcopy(b);row=p['records'][6]
            value='1.0000000000000000001*('+row['answer']['value']+')'
            row['answer']['value']=value;row['answer']['options'][0]=value
            next(link for link in b if link['id']==row['id'])['candidateSha256']=digest(row)
            tokens={r['id']:sig for r,link,sig,assets,errors in reviewed_rows(p,b,{},m.EXPECTED_IDS,DATA_APP/'editorial/assets')}
            with patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b)),patch.dict(m.REVIEWED_CANDIDATES,tokens):
                result=next(r for r in m.verify(p,b,DATA_APP/'editorial/assets') if r['id']==row['id'])
            with self.subTest(module=name):
                self.assertFalse(result['ok']);self.assertTrue(any('result mismatch' in e for e in result['errors']),result)

    def test_helper_byte_drift_changes_each_record_even_with_unchanged_results(self):
        source=APP/'tools/corpus_engineering/exact_arithmetic_literals.py'
        self.assertTrue(source.is_file(),'Shared exact decoder dependency has not been introduced')
        with tempfile.TemporaryDirectory() as directory:
            file=Path(directory)/source.name;file.write_bytes(source.read_bytes()+b'\n# Independent dependency-drift probe.\n')
            spec=importlib.util.spec_from_file_location('legacy_exact_literal_drift_probe',file)
            variant=importlib.util.module_from_spec(spec);spec.loader.exec_module(variant)
            pin=hashlib.sha256(file.read_bytes()).hexdigest()
            for name,batch in FAMILIES:
                m,p,b=module_and_package(name,batch);before=m.verify(p,b,DATA_APP/'editorial/assets')
                with patch.object(m,'exact_literal',variant.exact_literal):after=m.verify(p,b,DATA_APP/'editorial/assets')
                with self.subTest(module=name):
                    self.assertTrue(all(row['ok'] for row in after));self.assertNotEqual(before,after)
                    for old,new in zip(before,after):
                        self.assertNotEqual(old['reviewDependencySha256'],new['reviewDependencySha256'])
                        self.assertEqual(new['reviewDependencySha256']['exact_arithmetic_literals.py'],pin)

if __name__=='__main__':unittest.main()
