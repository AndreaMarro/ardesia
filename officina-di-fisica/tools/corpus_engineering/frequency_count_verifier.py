"""Separate reviewer of16frequency/count tasks; integer counts remain explicit.

No candidate-authoring import; derive from elapsed cycle durations and inverse
mean duration. Freeze only after all16read and the author's units fix12reread.
"""
from fractions import Fraction
import json
from pathlib import Path
import pint
import sympy as sp
from .pipeline import canonical,digest,sha
from .review_contract import reviewed_rows

SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json'
CANDIDATE_REF='62a02ed5cb0f145707bba33b92c15cea00d12876'
EXPECTED_IDS={f'AR-u2-frequency-count-{n:02}' for n in range(1,17)}
REVIEWED_PACKAGE_SHA256='e95c601571e5f1753391fbb39b37e0fb9720e16496f0b317ce4a01ecafc2e073'
REVIEWED_BINDINGS_SHA256='7dcd55bbcbeba4f2fe4193457fe1ce4dde5527facb449f4d4e96c8369011df94'
REVIEWED_CANDIDATES={
 "AR-u2-frequency-count-01": "60ddcb0426017b3b3b6aa986cc5f95761fa962783ea42ff482f30ec27a42afb8",
 "AR-u2-frequency-count-02": "e7baa3577983493b283a194583b23710b100f0703c77f055155c0f03db5bf6a6",
 "AR-u2-frequency-count-03": "b47172c709dcae67121f774987c42d6b0bfed2e261d5fc09bfcfd2d73714c193",
 "AR-u2-frequency-count-04": "a2e1dd318253b9f50164a7bc69ac273b4a5c5914b8b713366d831c11f4cebb41",
 "AR-u2-frequency-count-05": "ac8adcd2cf61404a650560584d81b900277e2893a15a7b561f20612bc2dc37c0",
 "AR-u2-frequency-count-06": "bb99cc15f67761e8eb06caea02fcab65714eb0868817a751d3ea17731810a800",
 "AR-u2-frequency-count-07": "6073c263fa94830cca4ad07dc068506ef4bd9788bc13e46b41391f772e09f265",
 "AR-u2-frequency-count-08": "58fb8bd4c68ee3b256a2caf0650a08673d2dcd75e6a68de386836347b517c1be",
 "AR-u2-frequency-count-09": "82e57f71d18042014f830a35601e459dc7a4821ef9dd0b060792f326df330239",
 "AR-u2-frequency-count-10": "10bd47f1ca3b4cdbf22b56f90d36a48e600d0debfcaec8291f43f1ced8160ac3",
 "AR-u2-frequency-count-11": "0a60119507a9b3d7396f90b0f207932d0ac21ad6223eef1b6952392a1ba539f0",
 "AR-u2-frequency-count-12": "d884793d11c626cda326743d91e48be86e9da9d8432d8793ed8fbf2a7040c578",
 "AR-u2-frequency-count-13": "b26015ff5aeb346ed17cda028c46a33d601450ec5b0ef7e530b3bf9d7a217cc0",
 "AR-u2-frequency-count-14": "6af65fece803131d42ba7635208181cfd1c50e30a6576847cb4d556d08c1d4b9",
 "AR-u2-frequency-count-15": "eec299d58fd38c63a8f6655682f56050f998f8940eb622b863960abfec07ec73",
 "AR-u2-frequency-count-16": "5a6941062befc054e36d3513117845aac66bfc351ea0c1c3aede4d74ab046a86"
}

# Original row digests independently compared with the pinned Git blob before freeze.
READ_SOURCE_SHA256={
 "u2-frequency-count-01": "b8123c4f62ebf681d7fe756eff5f20146b6c8042063abdb8b60e2d71036655d8",
 "u2-frequency-count-02": "184c88c0dcafdcfde41e25a4a9631bdd259987b83dcd3fdea9fc2b6a11b46c05",
 "u2-frequency-count-03": "d9e09593c4ee755901f886ac664b6b6096da49ffaddbf8fc8da8a91744c6e726",
 "u2-frequency-count-04": "213320d070d0358de5e1a44f64bac33b1b9cf39ef66b35e7e037e471e18eada8",
 "u2-frequency-count-05": "1b54dd8123db3f92998528b6fb3f02b2aa8837f96045467524b37eb8716656d4",
 "u2-frequency-count-06": "be5b2e170d7e74ea9f4a041e3d759621bbfc415ba755a106306cd99a8c450255",
 "u2-frequency-count-07": "a7ea6fa8af7e5796d41b055bfed5a716c9ceda86c5ce0a976eeda03826384256",
 "u2-frequency-count-08": "4b8458284486151933568a71fd2b03ed9d3bc46df8472e15a074ac2c59190726",
 "u2-frequency-count-09": "2e863a0c7abdcec5c2cbd78e32d613e7e789058aba16ef9a417569ff8fea3ba5",
 "u2-frequency-count-10": "51f33e60a873073bb2884a46a9eab8547f8e532f34ea7c613cbabf1009f481f6",
 "u2-frequency-count-11": "4c95351d2fc91fd42efabb80ca251350885a77c448e4aeb48ee4f1a02253c2eb",
 "u2-frequency-count-12": "689caadaeb4e1658e5854f77a679de768f194b5c1e872bdc7874699cf5f01756",
 "u2-frequency-count-13": "c78ebb7e077d066e75529be7e6055893b5bc23af25fc19766300b6cfebb33f27",
 "u2-frequency-count-14": "a761fb354645a140e58f47cdd6d689331e5055342560c32fa88a1dacbda4de4f",
 "u2-frequency-count-15": "48d92b6c1b0f798d1493f224ee064527f943e7fd1d9fd82b6b80ed60014e9e5d",
 "u2-frequency-count-16": "6890e8a38513f59d77ab36799230ba42102021acc3c9ffce22963863dc3c104f"
}

def oracle():
    N=sp.Symbol('N',positive=True,integer=True)
    duration,f=sp.symbols('duration f',positive=True)
    # N completed cycles delimit N elapsed durations. Their mean is total/N;
    # repetitions per unit time are its reciprocal, even for unequal durations.
    mean_duration=duration/N
    rate=sp.cancel(1/mean_duration)
    elapsed=sp.symbols('d1:4',positive=True)
    if sp.simplify(1/(sum(elapsed)/3)-rate.subs({N:3,duration:sum(elapsed)}))!=0:raise ValueError('Cycle duration derivation failed')
    count_inverse=sp.solve(sp.Eq(f,rate),N)[0]
    time_inverse=sp.solve(sp.Eq(f,rate),duration)[0]
    def freq(n,t):return rate.subs({N:n,duration:t})
    first,second=freq(2,2),freq(6,4)
    Q=SI.Quantity
    first_units=(Q(2,'')/Q(2,'s')).to('Hz')
    gain=(Q(3,'')/first_units).to('s')
    decoded=(Q(Fraction(9,2),'')/gain).to('Hz')
    decoded_count=(decoded*Q(4,'s')).to('dimensionless').magnitude
    if first_units.magnitude!=1 or gain.magnitude!=3 or decoded_count!=6:raise ValueError('Pint exact count/frequency/gain dimensions failed')
    c,d=sp.symbols('c d',real=True)
    calibration=sp.solve([sp.Eq(c*first+d,3),sp.Eq(c*second+d,4)],(c,d))
    final_f=(5-calibration[d])/calibration[c]
    target_time=time_inverse.subs({N:6,f:sp.Rational(3,2)*first})
    k1,k2=sp.symbols('k1 k2',positive=True)
    if sp.simplify(rate.subs({N:k1*N,duration:k2*duration})/rate-k1/k2)!=0:raise ValueError('Independent scaling failed')
    # Positivity is insufficient for completed-cycle counts.
    def count_allowed(number):return sp.Rational(number)>0 and sp.Rational(number).q==1
    if not count_allowed(sp.Rational(3,2)*2) or count_allowed(sp.Rational(1,4)*2):raise ValueError('Integer scaling-domain check failed')
    n=sp.Symbol('n',positive=True,integer=True)
    if freq(n,n)!=1:raise ValueError('Discrete infinite family failed')
    if sp.Rational(8,6)-(first+second)/2!=sp.Rational(1,12):raise ValueError('Aggregate versus equal-weight mean failed')
    return [first,'Hz','f=N/t','Raddoppia da 1 a 2 Hz',count_inverse.subs({f:1,duration:2}),
      time_inverse.subs({N:2,f:1}),freq(2,4)/first,2-first,'N=ft','κ₁/κ₂',
      second/first,(first+second)/2,target_time/2,sp.Rational(decoded_count),final_f*2,'Infinite']

MANUAL=[
 'N2,t2s→2/(2s)=1Hz;tre marcatori stessa fase delimitano due intervalli,non tre cicli.',
 'Conteggio adimensionale diviso durata:1/s,unita Hz;nessun2π per contarecicli.',
 'N durate di ciclo sommano t;durata media t/N e suo reciproco N/t;solo moto regolare permette un periodo comune.',
 'Due osservazioni2s:2/2=1Hz,4/2=2Hz;rapporto2.',
 'N=ft=(1s−1)(2s)=2,intero positivo;nessun arrotondamento consentito al conteggio.',
 'ft=N→t=N/f=2/(1s−1)=2s;1s e tempo medio di un solo ciclo.',
 'N2fisso,t2→4s:1→1/2Hz,rapporto1/2 positivo.',
 'Frequenza corretta1Hz,proposta2Hz:scarto+1Hz,non durata o conteggio.',
 'Moltiplicare f=N/t per t: N=ft;dimensione1;richiede ft intero positivo.',
 'κ1N/(κ2t) divisoN/t→κ1/κ2;κ1N intero positivo. PerN2,κ1=3/2 ammessoN3;κ1=1/4esclusoN1/2.',
 'fA2/2=1Hz,fB6/4=3/2Hz;rapporto3/2,conteggi2e6sempreinteri.',
 'Media[1+(3/2)]/2=(5/2)/2=5/4Hz;aggregato8/(6s)=4/3Hz,scarto1/12Hz. Denominatore2s+4sesplicito nel fix.',
 'TargetfB(3/2)*1Hz=3/2Hz;tB6/(3/2)=6*2/3=4s;rapportotB/tA=2.',
 'fA1Hz,c3/(1Hz)=3s;S9/2→fB(9/2)/(3s)=3/2Hz;N_B(3/2)*4=6intero.',
 'c(4−3)/(3/2−1)=1/(1/2)=2s,d3−2*1=1;S5→fC(5−1)/(2s)=2Hz;N_C2*2=4intero.',
 'N=(1s−1)t fa f1Hz;N=npositivo intero→t=ns,infinitacoppiediscrete. (1/2,1/2s) vietata;zero vietato.',
]
DISTRACTORS=[
 '2Hz ripete conteggio; t/N1s e tempo medio per ciclo,con stesso numero ma diversa dimensione.',
 's periodo,m/svelocita,mlunghezza,1puro;nessunaunitafrequenza fraqueste.',
 't/N duratamedia,Nt tempo,N2/t fattoreNextra,1/(Nt) sbaglia monotonia inN.',
 '4Hz ripete nuovoN,1/2segue periodo invecefreq,negativo non e un conteggio positivo.',
 'N1 confonde reciprofreq con conteggio,N4 applica un altro2; dati incompatibili non si rendono validi arrotondando.',
 '1s manca fattoreN;f/N non e durata; totalet=2s distinto dal periodo del moto regolare.',
 '2 e rapporto tempi;1ignora durata;4introduce quadrato;−1/2viola frequenze positive.',
 '−1ordineinverso;2ripeteproposta;1secondo non e1Hz;valorenumerico1nonrende scarto un conteggio.',
 'f/t dimensioneT−2,t/f T2,1/(ft) reciproco sbagliato purdimensione1,f+tsomma dimensioniincompatibili.',
 'κ1κ2sbagliaeffettotempo,κ2/κ1inverte,κ1quadrato sovraconta,κ1+κ2da2aidentita invece1.',
 '3consideraNsoltanto,2t soltanto,6moltiplica ifattori,2/3inverte;Nfrazionario non inferito da3/2Hz.',
 '1o3/2singola prova,5/2somma,4/3aggregato con pesitemporali;mediadiN4et3s e la stessaaggregazione,non richiesta.',
 'tB6s manterrebbef1Hz,tB2s darebbef3Hz;4s e durataassoluta,non rapporto4.',
 'S9/2comeHz da18cicli;arrotondare f3/2Hz cambia osservazione. Deve essere interoNfinale,nonf.',
 'N1,2,3,5 in2s dannoS2,3,4,6;soltantoN4daS5. EntrambiS eN puri ma significati diversi.',
 'Nessuna/una/due contraddicefamiglia n=1,2,3,...;tutte reali positive includeNnoninteroe coppie nonvincolate.',
]
ASSUMPTIONS=['ConteggioNinteropositivo di ciclicompleti su intervallot>0 delimitato dalla stessa fase;frequenzamedia positiva,non frequenzaangolare orientata.']*16
ASSUMPTIONS[2]+=' Definizione media valida per ripetizionianche non perfettamente regolari;reciproco e durata mediaper ciclo.'
ASSUMPTIONS[9]+=' κ1,κ2>0 maκ1Ndeve restareintero:fattoreκ1non necessariamenteintero.'
ASSUMPTIONS[11]+=' Uguale peso statisticoalleprove,nonpesitemporali;conteggiintegrali distinti.'
ASSUMPTIONS[13]+=' Scale strumentale comune,guadagnopositivoc,offsetnullo;lettureSpossonofrazionarie.'
ASSUMPTIONS[14]+=' Due frequenzedistinte identificanoc,d;daticompatibilicon conteggiofinaleintero.'
ASSUMPTIONS[15]+=' VincoloN=(1s−1)t eNinteropositivo:infinitenumerabile di coppie,noncontinuoreale libero.'
UNITS={n:'Hz' for n in range(1,17)}
UNITS.update({5:'',6:'s',7:'',8:'Hz',9:'',10:'',11:'',13:'',14:'',15:'',16:''})
NUMERIC_UNITS={1:'Hz',5:'1',6:'s',8:'Hz',13:'1',14:'1'}
SUFFIX={12:' Hz'}


def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed frequency package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed frequency binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u2-frequency-count-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned frequency source binding mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent frequency conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-');suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing unit')
                if suffix:raw=raw.removesuffix(suffix)
                if len(raw)>80 or sp.Rational(raw)!=sp.Rational(want):errors.append('Independent frequency count/duration result mismatch')
            except (ValueError,TypeError):errors.append('Independent frequency exact answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent frequency numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,
         'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),
         'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
         'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
         'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
         'methods':['SymPy_inverse_mean_cycle_duration','SymPy_independent_inverse_and_affine_calibration','Pint_Fraction_exact_frequency_count_dimensions','separate_integer_domain_distractor_and_SVG_reading'],
         'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':'Derived from N elapsed cycle durations after reading16originals; all16candidates read,12reread after units fix; phase markers and time scale independently checked'}}
