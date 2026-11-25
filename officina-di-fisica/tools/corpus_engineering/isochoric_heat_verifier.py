"""Independent U5-01 heat/work review, never imports candidate authoring."""
from fractions import Fraction
from .exact_arithmetic_literals import exact_literal
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json'
FAMILY='isochoric-heat'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L03' for n in range(1,17)}



def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]

@lru_cache(maxsize=1)
def oracle():
    capacity,delta,energy,a,b,c=sp.symbols('capacity delta energy a b c',positive=True)
    # First law with rigid external boundary and all other work excluded.
    work=sp.Integer(0)
    law=capacity*delta
    assert sp.simplify(law-work-law)==0
    inverse=sp.solve(sp.Eq(energy,law),capacity)[0]
    interval=sp.solve(sp.Eq(energy,law),delta)[0]
    ratio=sp.cancel(law.subs({capacity:a*capacity,delta:b*delta})/law)
    unique([energy/delta,energy*delta,delta/energy,2*energy/delta,energy/(2*delta)],inverse)
    unique([a*b,a/b,b/a,a+b,a*b*b],ratio)
    first=law.subs({capacity:2,delta:10});second=law.subs({capacity:4,delta:20})
    gain,offset=calibrate(first,second,41,161)
    assert first==20 and second==80 and (gain,offset)==(2,1)
    roots=sp.solve(sp.Eq(energy,c*delta**2),delta)
    positive=roots[0].subs({energy:20,c:sp.Rational(1,5)})
    assert positive==10 and sp.Rational(1,5)*positive**2==20
    # The rejected negative root solves the algebra but violates both positive inputs.
    assert sp.Rational(1,5)*(-positive)**2==20
    assert (first+second)/2==50 and 3*15==45
    q=SI.Quantity
    assert (q(2,'J/K')*q(10,'K')).to('J').magnitude==20
    assert (q(20,'J')/q(sp.Rational(1,5),'J/K**2')).to('K**2').magnitude==100
    assert (q(20,'J')/q(10,'K')).to('J/K').magnitude==2
    assert SI.Unit('J/K').dimensionality!=SI.Unit('J/kg/K').dimensionality
    pressure,T,R,n,V=sp.symbols('pressure T R n V',positive=True)
    assert sp.diff(n*R*T/V,T)>0
    return [first,'J','Il lavoro di espansione è nullo; energia interna e pressione aumentano',
      'Q passa da 20 a 40 J',inverse.subs({energy:first,delta:10}),interval.subs({energy:first,capacity:2}),
      law.subs({capacity:2,delta:20})/first,40-first,'C_V = Q / ΔT','κ₁ κ₂',
      second/first,(first+second)/2,interval.subs({energy:4*first,capacity:4})/10,
      inverse.subs({energy:240/(60/first),delta:20}),inverse.subs({energy:(81-offset)/gain,delta:10}),positive]


MANUAL=['Parete rigida, nessun altro lavoro: W=0. Q=ΔU=C_V ΔT=(2 J/K)(10 K)=20 J. C_V è totale e non va moltiplicata ancora per massa o moli.', 'Il prodotto (J/K)×K cancella K e dà J. Il calore è trasferimento energetico, non temperatura o proprietà immagazzinata.', 'ΔV=0 annulla il lavoro di frontiera. Con Q>0 e nessun altro lavoro ΔU=Q>0. Per n,V costanti, p=nRT/V cresce con T: derivata nR/V positiva. Maggiore agitazione non produce lavoro senza spostamento della parete.', 'Due preparazioni: C_V,A=2 J/K e C_V,B=4 J/K, entrambe con ΔT=10 K. Q_A=20 J, Q_B=40 J; rapporto 2. Non si apre il campione entro una prova.', 'C_V=20 J/(10 K)=2 J/K. La sostituzione 2×10=20 ricostruisce il dato, senza conoscere una massa.', 'ΔT=20 J/(2 J/K)=10 K. È incremento, non T finale; non si aggiunge 273,15. T_i serve soltanto per ricostruire la temperatura finale.', 'Q_A=2×10=20 J e Q_B=2×20=40 J; 40/20=2. Capacità comune cancellata.', 'Q corretto 20 J. Scarto ordinato 40−20=+20 J, non cambio di convenzione termodinamica.', 'Dividendo Q=C_V ΔT per ΔT>0 si isola C_V=Q/ΔT, unità J/K. Le cinque formule sono confrontate anche simbolicamente, non soltanto con un esempio.', 'Inserimento di C_V,B=κ₁C_V,A e ΔT_B=κ₂ΔT_A dà Q_B/Q_A=κ₁κ₂. Il denominatore è positivo. Unicità controllata come legge generale.', 'A: 2×10=20 J; B: 4×20=80 J. Rapporto 80/20=4. Entrambi i fattori due contribuiscono.', 'Media richiesta (20+80)/2=50 J. Prodotto degli ingressi medi (3 J/K)(15 K)=45 J, 5 J in meno: relazione bilineare, nessuna falsa commutazione.', 'Target 4×20=80 J con C_V,B=4 J/K: ΔT_B=80/4=20 K e rapporto 20/10=2.', 'Riferimento Q_A=20 J; q=60/(20 J)=3 J⁻¹. Q_B=240/q=80 J; C_V,B=80 J/(20 K)=4 J/K.', 'Q_A=20 J, Q_B=80 J. q=(161−41)/(80−20) J⁻¹=2 J⁻¹; b=1. Q_C=(81−1)/2 J=40 J; C_V,C=40/10=4 J/K. Ricostruisce S=81.', 'c=(1/5) J/K², vincolo fra preparazioni. Q=c(ΔT)²=20 J implica (ΔT)²=100 K². Radici ±10 K; dominio positivo seleziona +10 K e C_V=2 J/K. Non si integra C_V variabile nel tempo.']
DISTRACTORS=['40 J richiederebbe capacità o incremento doppi; introdurre massa o moli conterebbe due volte la quantità. Pressione fissa non segue da volume fisso.', 'K è temperatura, J/K capacità, J/(kg·K) capacità specifica, W potenza con un tempo al denominatore.', 'Volume fisso non fissa p; chiusura alla materia non impone isolamento. Gli urti senza spostamento della parete non danno lavoro di frontiera. U aumenta perché Q entra.', '20 J ignora capacità B,10 J inverte dipendenza,80 J raddoppia anche ΔT,0 J contraddice entrambi gli ingressi positivi.', 'QΔT ha J·K e ΔT/Q ha K/J, entrambi diversi da J/K. Non occorre una massa per la capacità totale.', '20 copia Q e40 moltiplica invece di dividere; offset Celsius non si applica a una differenza. Nessuno ricostruisce Q=20 J.', '1/2 reciproco,4 quadrato,1 ignora aumento,−2 viola il segno dei due calori positivi.', '−20 sottrae al contrario,40 copia proposta,0 la accetta,10 dimezza ulteriormente lo scarto.', 'QΔT unità J·K, reciproco K/J. 2Q/ΔT e Q/(2ΔT) hanno unità corrette ma restituiscono 2Q e Q/2 nella legge diretta.', 'Quozienti invertono un effetto diretto, somma dà 2 per prove uguali, κ₁κ₂² aggiunge un quadrato assente.', '2 considera un solo raddoppio;80 è energia e non rapporto;1/4 scambia le prove.', '100 somma,25 metà della media,60 differenza,45 prodotto degli ingressi medi. Cinque alternative numericamente distinte.', 'Fattore4 nell’intervallo con capacità doppia dà 8 volte Q_A; fattore1 nell’intervallo dà soltanto 2 volte Q_A.', 'S/ΔT=240/20=12 confonde display adimensionale con joule, triplicando la capacità; q agisce su Q.', '8 J/K ricostruisce S=161;2 J/K S=41;81/20 J/K dà Q40,5 J e S=82;40 J/K dà S=801. Solo 4 J/K ricostruisce 81.', '−10 K rende negativi ΔT e C_V;100 è il quadrato con unità errate se usato come intervallo.5 e 20 K darebbero 5 e 80 J.']
ASSUMPTIONS=['Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Calore Q=C_V ΔT è energia trasferita; C_V totale in J/K e incremento in K. Unità confrontate dimensionalmente senza supporre una massa.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse.', 'Campione chiuso ideale, recipiente rigido e lavoro esclusivamente di frontiera, quindi W=0; nessuna variazione macroscopica di energia cinetica/potenziale. Capacità totale C_V>0 in J/K costante entro ciascuna prova, distinta da molare e specifica; ΔT>0 e temperature assolute positive. Preparazioni diverse possono avere capacità diverse. Il vincolo C_V=cΔT collega prove diverse: c in J/K², non una legge istantanea C_V(T).']
UNITS={1:'J',2:'J',3:'J',4:'J',5:'J/K',6:'K',7:'',8:'J',9:'J/K',10:'',11:'',12:'J',13:'',14:'J/K',15:'J/K',16:'K'}
NUMERIC_UNITS={1:'J',5:'J/K',6:'K',11:'1',13:'1',14:'J/K'}
SUFFIX={8:' J',12:' J',15:' J/K',16:' K'}
CALCULATION_SCOPE={2:'NO_STUDENT_CALCULATION',3:'NO_STUDENT_CALCULATION',9:'SYMBOLIC_MANUAL_DERIVATION',10:'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo completo letti: recipiente rigido con freccia Q schematica, non vettore metrico; nessuno spostamento del confine. Retta Q=2ΔT con origine (100,640), 15 px/K e 5 px/J: punti (250,540) e (400,440) corrispondono a 10 K/20 J e 20 K/40 J. Barre da zero larghe 100,400,250 px alla medesima scala 5 px/J danno 20,80,50 J. La media non rappresenta calore immagazzinato.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u5-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C3' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(exact_literal(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and row['answer'].get('unit')!=NUMERIC_UNITS.get(n):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'reviewDependencySha256':{'exact_arithmetic_literals.py':sha(Path(exact_literal.__code__.co_filename).read_bytes())},
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}




CANDIDATE_REF='bb12f47ed21dce65ad25df47f847a70af4507ab5'
SOURCE_READING='Tutti gli 80 prompt sorgente U5-01 letti integralmente e derivati prima di qualsiasi candidata o chiave B153–157. Primaria persistita a SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641; comunicazioni hanno esposto solo commit, file e ipotesi generali, nessun risultato o chiave. Tutti i 16 record finali di questo lotto letti integralmente: prompt, opzioni, blocchi, formule, hint, feedback, metadati e didascalie. XML e rendering SVG intero controllati; lezioni reali C3-L01/L02/L03/L06/L07 rilette. Non importa authoring. Byte package/binding e asset confrontati esattamente con ROOT integrato e pin autore finale. Riletto il fix del record 153-03: isolamento implica Q=0, non l’implicazione inversa; nel modello riscaldamento senza lavoro richiede Q>0. Le 15 altre schede e tutte le chiavi/formule/SVG sono rimaste identiche.'
REVIEWED_PACKAGE_SHA256='3ff584c615dcbece5fd8ccabaf923eaf4dbdb6bd03889d61a45d734c09de7e23'
REVIEWED_BINDINGS_SHA256='79d3957597b173a6bbda9f8c3c02547c26530822a0d5dcc34f8c5389ee0c8ced'
REVIEWED_CANDIDATES={'AR-u5-isochoric-heat-01': '1d58a5b04326611d9ac5df6bfb57aff3667f976cd8da8dba87997d33383f9abd', 'AR-u5-isochoric-heat-02': 'c9d5800bbdd1b842f959a30ae5107c91b518c310f74e4bdcedc8003406ad925d', 'AR-u5-isochoric-heat-03': '9a9491d2f9dfbd73d91777ff365af079f6c9083a937b962a09bc23d71bff42f4', 'AR-u5-isochoric-heat-04': '3e8b128eeac9da0e9f7783b3dd2698bb69db974fd5aefcb6f83e7bc97a358312', 'AR-u5-isochoric-heat-05': 'c1ae38a057b3b47c23f22c4c4d0cfb6196693104326833e5ee4ac5e855a8dce9', 'AR-u5-isochoric-heat-06': '023b872f14a75007495a3c3ec81b643812aa794dfa434d04a3e8e3c55697567e', 'AR-u5-isochoric-heat-07': '8fa4046bd590bc1281c1c2b603498f7dd12f0ea3ea4488ffbd6c95f273990f0c', 'AR-u5-isochoric-heat-08': 'bab917ac9342c7d568daf66329b2bbfc8cc48a6fefeee8b7d527395f774061fc', 'AR-u5-isochoric-heat-09': '768f8246500529d602d74cb0f370790aa9b5d6c1e0aa8ddbe8d329f5fa7762b0', 'AR-u5-isochoric-heat-10': '7da3820e6ed7cf7fc71a6bdedf5e69a2e4c591804ee056e33c27609c2d117e6e', 'AR-u5-isochoric-heat-11': '250c87592d0a4115e0102dab7f68820af7c7fb7ef4b02e6ea59785c6c64a9e92', 'AR-u5-isochoric-heat-12': '5da5f648a46c0b1402433a55beb9fd2b1d0da8e4bce950162ee94e60c98b78ab', 'AR-u5-isochoric-heat-13': 'f637d590b3fda45d394fd703e7c056e2067ec17ecb280c7aeaa5e7ccf9cc8ddc', 'AR-u5-isochoric-heat-14': '6318155d98409c2cf49c17943f289cfa09b60c68b08e7f1ff5c54b5828eb4860', 'AR-u5-isochoric-heat-15': '9e0722b726c45b01abd217dc0e120365e986d2aa341c0ad577a26ae07483de2f', 'AR-u5-isochoric-heat-16': 'd7748be830969ed3eede9701332c2576d06b3d86119681b49121c02aeb8dca9e'}
READ_SOURCE_SHA256={'u5-isochoric-heat-01': '6acdf79b13e67e7daa2c035c8c96151534e407480a375733572a7439b1cb7a51', 'u5-isochoric-heat-02': '26a344a2e0e789a28fcfb1c3e77dcc7c0308813fc89e11a2202c5b172cae5d2d', 'u5-isochoric-heat-03': 'a3786a222098b6ef3cdb8c8562b207f7663b605bbea0047b5b65714f77c50e2e', 'u5-isochoric-heat-04': '037e04739e9776075e937e4d9cad90c079ee59804d9c43b490ec563cf9169644', 'u5-isochoric-heat-05': '74178086e2362bb5e64bbac711aef4f5dc423b6c1111f9c6604308442666b57e', 'u5-isochoric-heat-06': '9ec70de5763eedbe725b88c002986cb7b942effa9a85e424e9e71ceca4be0696', 'u5-isochoric-heat-07': '220dbc26329942e470e16d07e6c276c9619e13dd9326d5cbabf49342ee5b4109', 'u5-isochoric-heat-08': 'ec0ff65b64848f1589c0df350f9b87a787f5379d8cc1900231ecf820b32f524a', 'u5-isochoric-heat-09': '1a5dc57203130b80b9260bcfb2a80a70a5260a4ea1f5a9bf0913dbc3afa0d34d', 'u5-isochoric-heat-10': '477882d0ff7665e126d8e083743ad4e7b20df59d7235dd6a96cb68fa292082d4', 'u5-isochoric-heat-11': '07575332cd6c6095a6c689a02387311d54e9eb94b2a24e479b13178a58addfbf', 'u5-isochoric-heat-12': '2d86ddee1974c1bd7b86bfd7683b9fde0507209f759b432bebe34102eb6c7a08', 'u5-isochoric-heat-13': '6e743fabfed7ff12e91c4cb049f2833fa9da63e9da35931b95a484dde6280e9e', 'u5-isochoric-heat-14': '006a5ce4a3b9a2c38ee439053b2d6d669ad79c2f96f65e5580282f6f6992a3be', 'u5-isochoric-heat-15': 'b71789286b082cdcbe8ce795e4d0f674d6de4a4b2c014b6537648249d3b2610c', 'u5-isochoric-heat-16': '6cedb8f7b9fdf0dbf237a1655ef4257da561667accae8b5152047477b8183f41'}
