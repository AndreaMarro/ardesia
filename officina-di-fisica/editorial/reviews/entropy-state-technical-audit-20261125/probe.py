"""Independent bounded technical audit. No browser, DB, authoring import or publication."""
import argparse,fcntl,hashlib,json,os,shutil,sys
from pathlib import Path

EXPECTED={
 'ideal_expansion_entropy_verifier.py':'5b70840793f29949183f67361dad3e01c43ba23a6b0cd0d8dd19dc7cbd93066e',
 'statistical_entropy_verifier.py':'992b79d3d8a3aded75dc46ba1e791ed4c372ec353f9de76bfdd070e4ef3780c3',
 'entropy_state_review.py':'f75450bbf820fd030b618625bbecba044092df7bef895d31ea2d8cd9f8bc82cf'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('app',type=Path);args=parser.parse_args()
    app=args.app.resolve();lock=open('/private/tmp/cric-bounded-local-work.lock','a');fcntl.flock(lock,fcntl.LOCK_EX)
    free=shutil.disk_usage(app).free
    if free<2*1024**3:raise ValueError('FAIL_CLOSED free<2GiB')
    sys.dont_write_bytecode=True;sys.path.insert(0,str(app))
    files={n:app/'tools/corpus_engineering'/n for n in EXPECTED}
    hashes=lambda:{n:hashlib.sha256(p.read_bytes()).hexdigest() for n,p in files.items()}
    if hashes()!=EXPECTED:raise ValueError('Audited code edition changed')
    import sympy as sp
    from tools.corpus_engineering import ideal_expansion_entropy_verifier as a,statistical_entropy_verifier as b,entropy_state_review as boundary
    from tools.corpus_engineering.entropy_hot_cold_verifier import exact_literal as legacy_literal
    checks=0
    for ni in range(1,9):
        for nf in range(1,9):
            z=b.coefficient(ni,nf)
            assert b.final_count(ni,z)==nf,(ni,nf,z)
            assert sp.simplify(b.coefficient(nf,ni)+z)==0
            checks+=2
    for ni,nf,k1,k2,want in [(2,8,sp.Rational(1,4),sp.Rational(1,2),sp.Rational(1,2)),(2,8,sp.Rational(1,4),1,0),(8,2,1,1,1),(3,9,2,2,1)]:
        assert b.scaled_ratio(ni,nf,k1,k2)==want;checks+=1
    for args in [(0,1),(1,0),(-1,2),(2,sp.Rational(3,2)),(sp.I,2),(sp.oo,2),(sp.nan,2)]:
        try:b.coefficient(*args)
        except ValueError:pass
        else:raise AssertionError(('Invalid multiplicities accepted',args))
        checks+=1
    for args in [(2,sp.Rational(1,2)),(2,sp.Rational(7,2)),(1,sp.I),(1,sp.oo),(1,sp.nan),(0,1)]:
        try:b.final_count(*args)
        except ValueError:pass
        else:raise AssertionError(('Invalid inverse count accepted',args))
        checks+=1
    for bad in [sp.I,sp.oo,-sp.oo,sp.nan]:
        for fn,args in [(a.entropy,(bad,2)),(a.entropy,(2,bad)),(a.inverse_B,(bad,2)),(a.inverse_B,(2,bad)),(a.inverse_ratio,(bad,2)),(a.inverse_ratio,(2,bad))]:
            try:fn(*args)
            except ValueError:pass
            else:raise AssertionError(('Invalid finite-real domain accepted',fn.__name__,args))
            checks+=1
    for ni,nf in [(1,3),(3,2),(3,5)]:assert b.coefficient(ni,nf).is_Integer is False
    valid={'2.0000000000000000001':sp.Rational('2.0000000000000000001'),'.125':sp.Rational(1,8),'000.50':sp.Rational(1,2),'3/2':sp.Rational(3,2),'2√3':2*sp.sqrt(3),'r(10000)':100,'-2/3':-sp.Rational(2,3)}
    for raw,want in valid.items():assert boundary.exact_literal(raw)==want,(raw,want)
    invalid=['1_0','1e-2','1/0','r(10001)','r(-1)','r(1/2)','__import__(1)','2**100','x','True','(1+'*30+'1'+')'*30]
    for raw in invalid:
        try:boundary.exact_literal(raw)
        except (ValueError,SyntaxError,TypeError,RecursionError):pass
        else:raise AssertionError(('Invalid literal accepted',raw))
    assert legacy_literal('2.0000000000000000001')==2
    assert boundary.exact_literal('2.0000000000000000001')!=2
    ideal=list(map(str,a.oracle()));statistical=list(map(str,b.oracle()))
    assert ideal==['2','J/K','È uguale e positiva nei due percorsi','Da 2 a 4 J/K','2','2','2','2','B = ΔS ln 2 / ln r','κ₁ ln(κ₂ r_A) / ln r_A','4','5','2','4','4','8']
    assert statistical==['2','1','ΔS = k_B ln2','Da 2 a 3','8','2','1/2','2','Ω_f = Ω_i 2^z','[ln R + ln(κ₁/κ₂)] / ln R','1/2','3/2','1/2','2','16','Infinite coppie intere positive']
    assert a.entropy(3,sp.Rational(1,2))==-3 and a.inverse_B(-3,sp.Rational(1,2))==3 and a.inverse_ratio(0,2)==1
    if hashes()!=EXPECTED:raise ValueError('Audited code changed during probe')
    print(json.dumps({'phase':'TECHNICAL_CODE_AUDIT_ONLY','reviewer':'AI distinct from module author/root and candidate authors A/B','files':EXPECTED,
      'independentDomainAndInverseAssertions':checks,'nonintegerCoefficientExamples':3,'decoderValidExactCases':len(valid),'decoderInvalidCasesRejected':len(invalid),
      'idealOracle16Compared':ideal,'statisticalOracle16Compared':statistical,'signedCompressionAndZeroChangeChecked':True,
      'newDecoderPreservesExactDecimal':True,'legacyParserRiskReproduced':True,'finiteRealFixVerified':True,
      'resourceGuard':{'lock':'/private/tmp/cric-bounded-local-work.lock','minimumFreeGiB':2,'observedFreeGiB':round(free/1024**3,3)},
      'probeSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'outcome':'NO_REMAINING_CODE_BLOCKER_IDENTIFIED_WITHIN_SCOPE',
      'limits':['Not a full independent scientific rereading of all32 candidate blocks/feedback/assets or source-first chronology.','No nativeSVG/productUI/browser/DB/import/fullsuite performed in this audit.','Root own8tests/import receipts are separate evidence, not recounted as reviewer executions.','Legacy decoder copies remain a bounded arithmetic implementation risk; no frozen candidate defect demonstrated and no withdrawal/publication action.'],
      'humanApproval':'NOT_RUN','publicationAction':'NONE','activityCredit':0},ensure_ascii=False,indent=2))

if __name__=='__main__':main()
