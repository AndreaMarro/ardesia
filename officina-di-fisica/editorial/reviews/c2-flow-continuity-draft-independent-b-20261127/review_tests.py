"""Independent exact task arithmetic and record/binding identity; no browser."""
import hashlib,json,unittest
from fractions import Fraction as F
from decimal import Decimal,localcontext,ROUND_HALF_UP
from pathlib import Path

HERE=Path(__file__).resolve().parent
PACK=json.loads((HERE/'candidate-package.json').read_text())
BINDS=json.loads((HERE/'candidate-bindings.json').read_text())
OLD=json.loads((HERE/'original-C2.json').read_text())
ACTUAL=json.loads((HERE/'installed.json').read_text())['results']
canon=lambda o:json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
sha=lambda b:hashlib.sha256(b).hexdigest()

class Review(unittest.TestCase):
    def test_bindings_and_source_identity(self):
        self.assertEqual(sha((HERE/'candidate-package.json').read_bytes()),'c54a02b832d1a54e7401180e917ed550e5b483329e11599d65149f4b469cdfa5')
        self.assertEqual(sha((HERE/'candidate-bindings.json').read_bytes()),'728e87d7ca4b8ba0b725b69a657150784d243211b45fd5a9d4b0b88aff82fd3c')
        self.assertEqual(len(PACK['records']),5)
        for row,b in zip(PACK['records'],BINDS,strict=True):
            old=next(r for r in OLD if r['id']==row['id'])
            self.assertEqual(row['id'],b['id'])
            self.assertEqual(sha(canon(row)),b['candidateSha256'])
            self.assertEqual(sha(canon(old)),b['sourceSha256'])
            self.assertEqual(row['baseVersion'],old['version'])
            self.assertEqual(row['version'],old['version']+1)
            for key in ['id','course','skill','apparatus','control','measure','formula','references','substitution','transferPrompt']:
                self.assertEqual(row[key],old[key],(row['id'],key))

    def check_tasks(self,suffix,points,expected,unit,model):
        identifier='SIM-C2-L005-'+suffix
        result=next(r for r in ACTUAL if r['id']==identifier)
        self.assertEqual([F(str(x)) for x in result['points']],points)
        self.assertEqual(len(result['assessment']),2)
        for x,y,t,display in zip(points,expected,result['assessment'],result['answerDisplays'],strict=True):
            self.assertEqual(model(x),y)
            self.assertEqual(F(display.replace(',','.')),y)
            self.assertEqual(t['unit'],unit)
        # Every legal installed display agrees with the independently supplied law.
        for state in result['states']:
            value=state['measurement']['reading'].removesuffix(' '+unit).replace(',','.')
            exact=model(F(str(state['x'])))
            with localcontext() as context:
                context.prec=50
                decimal=Decimal(exact.numerator)/Decimal(exact.denominator)
                rounded=decimal.quantize(Decimal(1).scaleb(decimal.adjusted()-3),rounding=ROUND_HALF_UP) if decimal else Decimal(0)
            # This is the declared four-significant-digit reading format,
            # not a tolerance on the physical law or a claim of exact binary arithmetic.
            self.assertEqual(F(value),F(rounded))

    def test_01_volume(self):
        self.check_tasks('01',[F(6),F(7)],[F(24),F(28)],'mL/s',lambda x:4*x)

    def test_02_mass(self):
        self.check_tasks('02',[F(3),F(5,2)],[F(12,5),F(2)],'kg/s',lambda x:F(4,5)*x)
        self.assertEqual(F(800)*F(3,1000),F(12,5))

    def test_03_area(self):
        self.check_tasks('03',[F(6),F(5)],[F(4),F(24,5)],'cm/s',lambda x:F(24)/x)
        self.assertEqual(F(6-5,6),F(1,6))
        self.assertEqual((F(24,5)-4)/4,F(1,5))

    def test_04_mean(self):
        self.check_tasks('04',[F(10),F(6)],[F(5),F(3)],'cm/s',lambda x:x/2)
        # Equal-area coordinate u=r²/R²: exact trapezoids integrate a linear profile.
        for n in [1,2,3,7,20]:
            total=sum(((1-F(i,n))+(1-F(i+1,n)))*F(1,2*n) for i in range(n))
            self.assertEqual(total,F(1,2))
        row=next(r for r in PACK['records'] if r['id'].endswith('04'))
        self.assertIn('newtoniano',row['blocks'][0]['text'])
        self.assertIn('pienamente sviluppato',row['blocks'][0]['text'])
        self.assertIn('sezione circolare',row['blocks'][0]['text'])

    def test_05_branch(self):
        self.check_tasks('05',[F(8),F(6)],[F(4),F(6)],'mL/s',lambda x:12-x)
        for q in range(13):self.assertEqual(q+(12-q),12)

    def test_final_manual_identity(self):
        self.assertEqual(sha((HERE/'manual-final.md').read_bytes()),'9215159d95e20b4e3e9c13314d6403e2a176178996ec35b874192a568bc4c759')
        text=(HERE/'manual-final.md').read_text()
        self.assertNotIn('Con il tubo fermo',text)
        self.assertIn('Con la velocità media impostata a zero',text)

if __name__=='__main__':unittest.main()
