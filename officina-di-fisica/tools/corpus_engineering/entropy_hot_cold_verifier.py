"""Independent source-first U5-04 thermal and entropy review; no candidate authoring imports."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json'
FAMILY='entropy-hot-cold'
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L10' for n in range(1,17)}


def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]



def total_entropy(heat,cold,hot):
    heat,cold,hot=map(sp.sympify,(heat,cold,hot))
    if heat<=0 or not 0<cold<hot:raise ValueError('Spontaneous positive heat from strictly hotter positive reservoir required')
    return sp.cancel(heat/cold-heat/hot)

def cold_inverse(change,hot,heat=600):
    change,hot,heat=map(sp.sympify,(change,hot,heat))
    if change<=0 or hot<=0 or heat<=0:raise ValueError('Positive entropy production, hot temperature and heat required')
    return sp.cancel(heat/(change+heat/hot))

def hot_inverse(change,cold,heat=600):
    change,cold,heat=map(sp.sympify,(change,cold,heat))
    if cold<=0 or heat<=0 or not 0<change<heat/cold:raise ValueError('Strict finite hot-temperature inverse bound required')
    return sp.cancel(heat/(heat/cold-change))

@lru_cache(maxsize=1)
def oracle():
    Q,Tc,Th,S,a,b,k1,k2=sp.symbols('Q Tc Th S a b k1 k2',positive=True)
    law=Q/Tc-Q/Th;inv=sp.solve(sp.Eq(S,law),Tc)[0]
    unique([Q/(S+Q/Th),Q/S,Q/(S-Q/Th),(S+Q/Th)/Q,Th+Q/S],inv)
    ratio=(a/k1-b/k2)/(a-b)
    unique([ratio,k1/k2,k2/k1,(k1*a-k2*b)/(a-b),k1*k2],ratio)
    # Ordered reservoirs: write hot=cold+gap to prove strict production.
    gap=sp.symbols('gap',positive=True);assert sp.factor(law.subs(Th,Tc+gap))==Q*gap/(Tc*(Tc+gap))
    aa,bb=total_entropy(600,200,400),total_entropy(600,300,600);assert (aa,bb)==(sp.Rational(3,2),1)
    assert total_entropy(600,300,400)==sp.Rational(1,2) and total_entropy(600,200,600)==2
    assert total_entropy(600,250,500)==sp.Rational(6,5)
    gain,offset=calibrate(aa,bb,4,3);assert (gain,offset)==(2,1)
    assert sp.cancel(law.subs(Tc,Th/2))==Q/Th
    Qsi=SI.Quantity;assert (Qsi(600,'J')/Qsi(200,'K')-Qsi(600,'J')/Qsi(400,'K')).to('J/K').magnitude==Fraction(3,2)
    assert cold_inverse(aa,400)==200 and hot_inverse(aa,200)==400
    return [aa,'J/K','Il freddo acquista Q/T_c, maggiore del modulo Q/T_h perso dal caldo','Da 3/2 a 1/2 J/K',cold_inverse(aa,400),hot_inverse(aa,200),total_entropy(600,200,600)/aa,3-aa,'T_c = Q / (ΔS_tot + Q/T_h)','(a/κ₁ − b/κ₂)/(a − b)',bb/aa,(aa+bb)/2,hot_inverse(sp.Rational(2,3)*aa,300)/400,cold_inverse(sp.Rational(3,3),600),cold_inverse((2-offset)/gain,400),sp.Rational(600,1)/aa]

MANUAL=['Il caldo perde 600 J a 400 K: ΔS_h=−3/2 J/K. Il freddo riceve 600 J a 200 K: ΔS_c=3 J/K. Totale +3/2 J/K; energia totale conservata ma entropia prodotta positiva.', 'La somma delle variazioni entropiche è in J/K. I 600 J sono energia trasferita, non l’unità di entropia. Senza opzioni non si sceglie una lettera. Le alternative candidate sono state poi lette integralmente: unica unità compatibile J/K.', 'Il trasferimento reale è irreversibile per differenza finita di temperature. Le variazioni dei serbatoi si calcolano con percorsi reversibili di confronto, −600/T_h e +600/T_c. Poiché T_h>T_c>0, la somma è positiva nonostante −600+600=0 in energia.', 'Con T_h=400 K: a T_c=200 K, ΔS=3−3/2=3/2 J/K; a 300 K, 2−3/2=1/2 J/K. L’aumento si riduce di un fattore 3 pur restando positivo.', '600/T_c=ΔS+600/T_h=3/2+3/2=3 J/K, dunque T_c=200 K, inferiore a 400 K.', '600/T_h=600/T_c−ΔS=3−3/2=3/2 J/K, dunque T_h=400 K. In generale serve 0<ΔS<600/T_c per T_h finita e positiva maggiore di T_c.', 'T_c=200 K fisso, T_h=600 K: ΔS_B=3−1=2 J/K. Rapporto rispetto a 3/2 pari a 4/3.', 'Proposta 3 J/K−corretto 3/2 J/K=+3/2 J/K. La proposta ha omesso il contributo negativo della sorgente calda.', 'T_c=600 J/[ΔS_tot+600 J/T_h]. Il denominatore è J/K, positivo e maggiore di 600 J/T_h per ΔS_tot>0: la soluzione è minore di T_h.', 'Rapporto [1/(κ₁T_c)−1/(κ₂T_h)]/[1/T_c−1/T_h]. Ogni prova richiede 0<T_c<T_h e 0<κ₁T_c<κ₂T_h; i 600 J si cancellano. Nel candidato a=1/T_c,A e b=1/T_h,A: la stessa legge diventa (a/κ₁−b/κ₂)/(a−b).', 'A=3/2 J/K; B con T_c=300 K,T_h=600 K dà 2−1=1 J/K. Rapporto 2/3.', 'Media (3/2+1)/2=5/4 J/K. Temperature medie 250 K e 500 K darebbero 600/250−600/500=6/5 J/K; differenza 1/20 J/K.', 'Target (2/3)·(3/2)=1 J/K. Con T_c=300 K: 600/T_h=2−1=1 J/K, T_h,B=600 K. Rapporto con 400 K pari a 3/2.', 'Da S_A=9/2 e ΔS_A=3/2 J/K: a=3 K/J. S_B=3 dà ΔS_B=1 J/K. T_h=600 K implica 600/T_c=2 J/K, T_c=300 K.', 'a=(4−3)/(3/2−1)=2 K/J; b=1. S_C=2 implica ΔS_C=1/2 J/K. T_h=400 K: 600/T_c=1/2+3/2=2 J/K, T_c=300 K.', 'Vincolo T_c=T_h/2: ΔS_tot=1200/T_h−600/T_h=600/T_h. Misura 3/2 J/K implica T_h=400 K e T_c=200 K, coppia positiva unica. Il dato non è ridondante a differenza del vincolo nel record18616.']

DISTRACTORS=['−3/2 cambia segno;0 confonde energia edentropia;9/2 somma moduli;600 copiajoule.', 'J energia,K temperatura,W potenza,J K prodotto non quoziente;entropia non capacità pur con stessa dimensione.', 'Il freddo aumenta e il caldo diminuisce;Q/T_c>Q/T_h garantisce totale positivo senza creare energia.', '3J/K copia guadagno iniziale;0 richiede uguaglianza;−1/2 viola verso caldo-freddo.', '400K annulla saldo;Q/ΔS omette perdita calda;sottrarla nel denominatore lo annulla qui.', 'Sommare il totale al guadagno dà400/3K<200K;eguaglianza ΔS=Q/T_c mandaT_h all’infinito.', '3/4 reciproco;3/2 segueT_h;2 copia nuovaΔS;1 ignora la perdita modificata.', '−3/2 inverte sottrazione;3 copia proposta;0 la accetta;2 è rapporto puro.', 'Omettere il caldo dàQ/ΔS;segno meno non inverte la legge;reciproco haK⁻¹;ultimaT_c>T_h.', 'Sempliciκ₁/κ₂ perdono pesi a,b;moltiplicareκ invece di dividere viola temperatura al denominatore.', '3/2 reciproco;1 ignora fattore comune;2 e1/2 non ricostruiscono i bilanci.', '6/5 usa temperature medie;5/2 somma;1/4 metà differenza;3/2 ignoraB.', '2/3 e1/2 darebbero caldo sotto300K;2 dà800K→5/4J/K;3 dà1200K→3/2J/K.', '150K prendeD comeΔS;600K annulla saldo;400K dà1/2J/K eD3/2,non3.', '240K ometteb;200K dàD4;400K dàD1;600K viola ordine termico.', '−400 viola T>0;200K dà3J/K e600K1J/K;una misura determina la scala positiva.']

ASSUMPTIONS=['Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Due sorgenti ideali a temperature assolute costanti T_h>T_c>0; Q=600 J dal caldo al freddo spontaneamente. Nessun altro scambio, lavoro o accumulo nel collegamento. Trasferimento reale irreversibile; ΔS delle sorgenti da stati con percorsi reversibili equivalenti. Sistema complessivo isolato, energia conservata ed entropia totale positiva. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.']

UNITS={1: 'J/K', 2: 'J/K', 3: 'J/K', 4: 'J/K', 5: 'K', 6: 'K', 7: '', 8: 'J/K', 9: 'K', 10: '', 11: '', 12: 'J/K', 13: '', 14: 'K', 15: 'K', 16: 'K'}

NUMERIC_UNITS={5: 'K', 6: 'K', 14: 'K'}

SUFFIX={1: ' J/K', 8: ' J/K', 12: ' J/K', 15: ' K', 16: ' K'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='XML e PNG nativo integrale letti. Freccia600J dal caldo400K al freddo200K, schematica. Barre con segno−3/2,+3,+3/2J/K lunghezze120,240,120 a origine comune320 e scala80coordinate/(J/K). Ultima media3/2,1,5/4J/K lunghezze240,160,200 scala160. Due pannelli distinti; testo non sovrapposto agli assi né alle origini.'

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite temperature positive'}}

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
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
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


CANDIDATE_REF='1a451db18348236f976b811568a1cbd34092efdb'

SOURCE_READING='Primaria indipendente80 prompt-only U5-04 prima di candidati, opzioni o chiavi: SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Shard intero SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Poi lettura individuale completa dei16 candidati, ogni opzione/blocco/formula/hint/feedback/metadato/didascalia, confronto con derivazioni e dati finali; cinque SVG XML e rendering QuickLook integrali realmente letti sotto mutex e guardia2GiB. ROOT byte-identico al pin B finale. Lezioni reali C3-L01/L05/L06/L09/L10 rilette; nessun autore importato, nessuna approvazione da chiavi.'

REVIEWED_PACKAGE_SHA256='39e706ec374d69ffd76865da07e9fc11ac5d747519680fb8e630c18e80d80f81'

REVIEWED_BINDINGS_SHA256='5b04f72784917f66eca5b0c040fe0208ae92498434785e75f5a40e6af8670f02'

REVIEWED_CANDIDATES={'AR-u5-entropy-hot-cold-01': '4f94b29816281697d5b03fec6868b2ca4d54bf5455dc6d2de0d68f4bcc6335a9', 'AR-u5-entropy-hot-cold-02': '594c876dff841f9f08c69294f226471182fd5f59312000f6f0d32c85c03e18bc', 'AR-u5-entropy-hot-cold-03': '2b307bcdaa6c53ddf7e15f8f3e4a9cf933e2f305b3bd780483b17f815944eb49', 'AR-u5-entropy-hot-cold-04': 'fbe2cb9b4f2b98aa14bb20670548fdc033c05577c5005bf1b619742930fffd13', 'AR-u5-entropy-hot-cold-05': 'd96ad77600c4ecf68ff43c3a09ee2bcfe92849376724edb41a2cd33fc6a621d9', 'AR-u5-entropy-hot-cold-06': '3d060418c663785ba9c6eed19e933cac3ace47c134a49bade00efb0044f18e24', 'AR-u5-entropy-hot-cold-07': '27561446a33b49e448ef2d53bc69ebe968506ad21926e7e31bd935cd919b294f', 'AR-u5-entropy-hot-cold-08': '48b6b59eee106c9d827b74dc38605283fd1f74b27749ece3fca40fda10a97bc0', 'AR-u5-entropy-hot-cold-09': 'fab77da8e1d8915b1c04d25523c0c334d2ed64a868e340b26829c252d9fd225b', 'AR-u5-entropy-hot-cold-10': 'd50bafa43efa4422bf62ffc5550677d3f6397d34397b8b3ec0623cc1f0eaed1a', 'AR-u5-entropy-hot-cold-11': '07dc5c0311cf53bd3915649b0002921cacc0dac37ceddee7c113f245d7063f99', 'AR-u5-entropy-hot-cold-12': '5ed2455d40f6203115cabb276cdf72cce1edaa8326cec16f86e0905a702af472', 'AR-u5-entropy-hot-cold-13': '01070d3daf02a5f79c7fd77d187ded101dce4ff32fafb848e2744733760c57bc', 'AR-u5-entropy-hot-cold-14': 'e737bede34a85dc47b6b7714f5fc2d8ceb0ed730acd3a123cfcc9ad2eda483b2', 'AR-u5-entropy-hot-cold-15': '7148184aab4da2faa1a192a87c21b64f7bab34f969135f9d76e5569aac1f6575', 'AR-u5-entropy-hot-cold-16': '1d765c81bcde203abb6b2a01b8f82da9072f388f6ce38bbc17fb974bd8aa5982'}

READ_SOURCE_SHA256={'u5-entropy-hot-cold-01': 'dc39bd76a732397d558a262d9a6050aef52d96777780b890ef848718bafb2d31', 'u5-entropy-hot-cold-02': '0d8118c292adc25608769e653ccbf44bc8d74c0e0e7575edd19b622a1e12d29b', 'u5-entropy-hot-cold-03': '64ba15d26da0464acf1c55a15684960d2eeaa1e6e723137dfd24b5fb93c97f17', 'u5-entropy-hot-cold-04': '67b3122c281a8f12fe58ae084663cb644e81ef1133165a2d6277bd935a388424', 'u5-entropy-hot-cold-05': '5d57484410330f79980ffde3e71022a7e81877c32161737a0006f748e4858309', 'u5-entropy-hot-cold-06': '5686d613021e94ac051dc3ab56ac5fef1c370bae98a800526d6978e839467f68', 'u5-entropy-hot-cold-07': '55d0fe29bfdf5d2b9096c556d5d4b978e01a36fb4c818a66bdefd1df3929b600', 'u5-entropy-hot-cold-08': 'e721d3878305fc64b418a83e42af365b29fe2648db50f06e0868c60471aa46f7', 'u5-entropy-hot-cold-09': 'cdfe3171acd41a0f81bbddad854884c9d8941265e3a2519c0b0c6593805b36d9', 'u5-entropy-hot-cold-10': '3909184712749b1bffe97b3758b0a7bff0bffff257770e8b8d6b0186cdcace9a', 'u5-entropy-hot-cold-11': '1c1959976c1dcbef99a3d32ffdb1008e73c49aeadee1074b8bca7db0dc641599', 'u5-entropy-hot-cold-12': '247086858791c59955e7395ed676d4125b5cad6264432e9fd54c73ae6e209f7e', 'u5-entropy-hot-cold-13': '109bc2cefb382a7ffed15eda41d9c9cb11d4ad7a080560167c3c5f1748995aa9', 'u5-entropy-hot-cold-14': '2e5925fdece0a9f20900b317c030a3c34c2ab15b55c76f24291180b8342964ca', 'u5-entropy-hot-cold-15': '008a08d1fc3f5270cff149e4d2a25095e31f936cf57b01abc36dc492caeff744', 'u5-entropy-hot-cold-16': 'b00b962103c3d9bed8969f0222911e6400747d6d7506cd6984b11d0dcfa28e62'}
