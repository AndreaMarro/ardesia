"""Independent source-first electric review; no candidate authoring imports."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
SI=pint.UnitRegistry(non_int_type=Fraction)
from . import circuit_capacitor_review_models as model
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json'
FAMILY='plane-capacitance'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L04', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L03', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    C,d,e,k1,k2=sp.symbols('C d e k1 k2',positive=True)
    unique([C*d/e,e*d/C,C/(e*d),e/(C*d),C*e*d],C*d/e)
    unique([k1/k2,k1*k2,k2/k1,k1**2/k2,k1/k2**2],k1/k2)
    assert model.plane_capacitance(100,1)==100 and model.plane_area(100,1)==100 and model.plane_gap(100,100)==1
    assert model.uniform_field(40,0,sp.Rational(1,50))==2000
    carrier=sp.symbols('carrier',nonzero=True);E=sp.symbols('E',real=True);assert sp.solve(sp.Eq(carrier*E,0),E)==[0]
    dct=model.primary_only_derivations()[217];out=[dct[i]for i in range(1,17)]
    out[1]='F';out[2]='Il campo elettrico è nullo e il potenziale è uniforme';out[3]='Da 100 pF a 1 pF';out[7]='2000 V/m verso destra';out[8]='C d / ε';out[9]='κ₁ / κ₂';out[15]='Infinite coppie positive'
    return out

MANUAL=['C=εA/d. Con ε=10 pF/m, A=100 cm²=1/100 m² e d=1 mm=1/1000 m, C=10·10 pF=100 pF. Il dielettrico è lineare e il modello trascura il bordo; la geometria deve conservare dimensioni laterali grandi rispetto a d.', 'La capacità ha unità farad, F=Coulomb/Volt; pF è un suo sottomultiplo. Da εA/d si verifica (F/m)·m²/m=F. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'In equilibrio elettrostatico il campo elettrico nel materiale conduttore è nullo; altrimenti le cariche libere continuerebbero a muoversi. Di conseguenza il potenziale è costante nel conduttore connesso e la carica libera netta in eccesso risiede alle superfici. Non estendere automaticamente E=0 a una cavità con cariche interne o all’esterno. La successiva lettura delle cinque alternative conferma la descrizione del campo nullo nel materiale e del potenziale uniforme.', 'A d e ε fissati, C è proporzionale all’area. Da 100 a 1 cm², C passa da 100 a 1 pF, fattore 1/100. L’ipotesi di bordo trascurabile va conservata anche dopo il cambiamento; non basta la sola positività di A e d per garantire una buona approssimazione geometrica reale.', 'A=Cd/ε. Con C=100 pF, d=1 mm e ε=10 pF/m, A=1/100 m²=100 cm². In unità numeriche dichiarate il coefficiente si semplifica: A[cm²]=C[pF]d[mm].', 'd=εA/C. Con ε=10 pF/m, A=1/100 m² e C=100 pF si ottiene d=1/1000 m=1 mm. C,A,ε devono restare positivi finiti; il limite C=0 non è un’inversa ammessa in questo modello.', 'A ed ε restano fissi mentre d raddoppia. C_B/C_A=d_A/d_B=1/2. Capacità iniziale 100 pF e finale 50 pF; non si suppone fissata la carica durante il confronto se il collegamento elettrico non è specificato.', 'Prendo x positivo da sinistra a destra. ΔV=V_destra−V_sinistra=−40 V e Δx=2 cm=1/50 m. E_x=−ΔV/Δx=+2000 V/m, diretto dalla piastra a +40 V verso quella a 0 V. L’uniformità segue dal modello piano senza effetti di bordo.', 'Da C=εA/d si moltiplica per d e si divide per ε>0: A=Cd/ε. Se C è espresso in pF e d in mm, con il valore assegnato di ε la formula per i valori numerici diventa A[cm²]=C[pF]d[mm]. Non confondere questa scorciatoia di unità con la legge dimensionale universale.', 'Con ε invariata, A_B=κ₁A e d_B=κ₂d danno C_B/C_A=κ₁/κ₂. Fattori positivi mantengono i denominatori non nulli; occorre inoltre che entrambe le geometrie restino nel regime di bordo trascurabile.', 'A: 100/1=100 pF. B: 400/2=200 pF. Rapporto 2: l’area fornisce un fattore quattro e la separazione un fattore inverso due.', 'Media delle capacità (100+200)/2=150 pF. Il modello sui dati medi A=250 cm² e d=3/2 mm darebbe 250/(3/2)=500/3 pF. La differenza 500/3−150=50/3 pF è esatta, senza decimalizzazione.', 'Bersaglio C_B=2·100=200 pF con A_B=400 cm². Da d[mm]=A[cm²]/C[pF] si trova d_B=2 mm, quindi d_B/d_A=2. Le due geometrie devono rispettare la stessa approssimazione piana.', 'Il riferimento C=100 pF con lettura 300 dà a_cal=3 pF⁻¹ per display adimensionale. Lettura 600 restituisce C=200 pF. Con d=2 mm si trova A=200·2=400 cm². Prima si rimuove la taratura, poi si usa la legge geometrica.', 'C_A=100 pF, C_B=200 pF; letture 201,401 danno a_cal=2 pF⁻¹ e b_cal=1. Lettura 3 restituisce C_C=(3−1)/2=1 pF. Con d=1 mm, A=1 cm². La validità della geometria piana resta un’ipotesi distinta dalla soluzione algebrica e deve essere conservata nell’edizione.', 'Il vincolo numerico A[cm²]=100 d[mm] ha coefficiente 100 cm²/mm. Allora C[pF]=A/d=100 per ogni d>0 nel modello. La misura è ridondante: infinite coppie (A,d) proporzionali, restringendo eventualmente d al sottoinsieme che conserva dimensioni laterali grandi rispetto alla separazione. Non determina una scala assoluta.']

DISTRACTORS=['100 cm²=1/100 m², d=1/1000 m: A/d=10 m e C=100 pF.10 pF perde un fattore dieci;1 pF usa area1 cm²;100000 pF usa impropriamente d=10⁻⁶ m. La permittività10 pF/m è un dato esatto di modello, non epsilon zero universale.', 'Il farad è C/V. Il coulomb da solo misura carica; V,J,Ω sono tensione,energia,resistenza. Il simbolo C della capacità non cambia la propria unità in coulomb.', 'E=0 nel materiale conduttore in equilibrio e potenziale uniforme nel corpo connesso. Il valore assoluto del potenziale dipende dal riferimento; non è necessariamente zero. Le altre opzioni confondono campo esterno, corrente continua o neutralità con le condizioni necessarie. Le cavità sono esplicitamente escluse. Skill C4-L04 pertinente.', 'Area100→1 cm² con d fisso produce C100→1 pF. Dieci pF usa una radice del fattore d’area;10000 inverte;100 ignora;1/100 applica due volte il fattore. Si conserva il regime di bordo trascurabile dichiarato, non una promessa di esattezza di un condensatore reale finito.', 'A=Cd/ε, risultato100 cm². Nelle unità prescritte il coefficiente si riduce a uno.10 cm² dividerebbe di nuovo per10 dopo la conversione già inclusa;100 m² cambierebbe l’area fisica di10⁴.', 'd=εA/C=1 mm. Il prodotto εA=1/10 pF·m diviso100 pF dà1/1000 m. Un quadrato di area100 cm² ha lato10 cm, quindi il gap1 mm resta piccolo. Nessun denominatore nullo.', 'Rapporto1/2, capacità100 e50 pF. Due rende diretto d; i quadrati non sono nella legge; uno ignora la modifica. Il collegamento al generatore non è necessario per la sola capacità geometrica.', 'Con x verso destra, ΔV=−40 V e Δx=1/50 m. E_x=−ΔV/Δx=2000 V/m verso destra. Sinistra inverte il segno;20 V/m usa2 cm come2 m;zero confonde il dielettrico/spazio interno con il metallo;40 V/m copia il numero della tensione. Skill C4-L03 pertinente.', 'Cd/ε ha m². εd/C e C/(εd) sono puri; ε/(Cd) ha m⁻²; Cεd ha F². Tutte le alternative fisiche sono state lette; la semplificazione numerica A=C d con unità normalizzate non sostituisce la formula dimensionale.', 'Il rapporto èκ₁/κ₂, con entrambe le geometrie ancora ammissibili. Prodotto e reciproco alterano dipendenze;κ₁ è già fattore d’area e non va quadrato come se fosse un lato;κ₂² non segue dalla separazione.', 'C_A100 pF, C_B200 pF: rapporto2. Quattro considera solo area;1/2 considera solo distanza o inverte l’intero rapporto;uno presume erroneamente fattori compensanti uguali.', 'Media150 pF; il modello su area250 cm² e gap3/2 mm darebbe500/3 pF. Le alternative300,50,200 pF sono somma,semidifferenza,sola prova B. La differenza dei due tipi di media è50/3 pF esatta.', 'Bersaglio200 pF con area400 cm² impone gap2 mm e rapporto2. Mezzo inverte;quattro conserverebbe100 pF;uno darebbe400 pF;otto darebbe50 pF. Tutte le controprove ricompongono C=A/d nelle unità definite.', 'Guadagno3 pF⁻¹, lettura600→C200 pF, gap2 mm→area400 cm².1200 usa il display come capacità;100 divide per d e darebbe50 pF;200 copia il numero della capacità senza il fattore del gap.', 'Guadagno2 pF⁻¹ e offset1, lettura3→C1 pF e area1 cm² al gap1 mm.3/2 cm² omette offset e ricostruisce D4;2 cm² omette guadagno e D5;3 cm² usa D come area e D7. Si mantiene l’idealizzazione geometrica esplicita.', 'Il vincolo A=(100 cm²/mm)d fissa C100 pF per un continuo di geometrie. Gli esempi(100,1) e(200,2) nelle unità dichiarate non esauriscono la famiglia; la sola positività non autorizza d arbitrariamente grande rispetto ai lati. La candidata esplicita il vincolo di piastre estese. Nessuna scala assoluta ricavata dalla misura ridondante.']

ASSUMPTIONS=['Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.', 'Condensatore piano lineare, permittività assegnata 10 pF/m, A,d positivi finiti, dimensioni laterali grandi rispetto a d e bordo trascurato in entrambe le preparazioni e nelle inverse. Il03 è autonomamente conduttore in equilibrio: E nullo nel materiale e V uniforme, cavità escluse. Il08 usa campo uniforme, asse da sinistra a destra e ΔV finale meno iniziale.']

UNITS={1: 'pF', 2: '', 3: 'volt/meter', 4: 'pF', 5: 'cm**2', 6: 'mm', 7: '', 8: 'volt/meter', 9: 'meter**2', 10: '', 11: '', 12: 'pF', 13: '', 14: 'cm**2', 15: 'cm**2', 16: ''}

NUMERIC_UNITS={1: 'pF', 5: 'cm²', 6: 'mm', 11: '1', 14: 'cm²', 15: 'cm²'}

SUFFIX={12: ' pF'}

NON_NUMERIC_DISTRACTORS={}

SVG_REVIEW='SVG completo a quattro pannelli e PNG indipendente 640×2040 letti. Primo quote schematiche A=100 cm²,d=1 mm non in scala reciproca. Secondo conduttore E=0 e V uniforme. Terzo +40/0 V e d=2 cm: tre frecce distinte lunghe 205 coordinate a destra, E=2000 V/m, punte tutte visibili. Ultime barre 160/320/240 per 100/200/150 pF, origine 150; zero118 lontano dall’asse.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u6-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C4' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
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
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='2d27216100473a6d81a0774e369b4d9873054b48'

PRIMARY_SHA256='4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b'

REVIEWED_MODEL_SHA256='f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='9e80cd9df7441f20c956a0a851ec59d81bb6129647c3be82021c45b2c528de32'

REVIEWED_BINDINGS_SHA256='c05ad4b636735e678a1a262fd9578a5d0bb4df2c0ded13eb43ae129831175702'

REVIEWED_CANDIDATES={'AR-u6-plane-capacitance-01': 'a725874e7a34a3750fe0cf5e58dba483e000efa5c88f624ecf994498eb86c6f0', 'AR-u6-plane-capacitance-02': 'f505af077a343761f26e636ebe059701b942cc6f5f03b79306077e25b406d666', 'AR-u6-plane-capacitance-03': '3c36bd95b2d7e3fd8b7ec536107fdd7617e4ebd2d25c652bd7dea28253879ffe', 'AR-u6-plane-capacitance-04': '86b0c22690690cc544287e9d1950af32dba44b9cad7c5f2c4fe0059c716fd9bd', 'AR-u6-plane-capacitance-05': '74de4476d58599ec44261288fc56c076fc8affcf1d7534acd2e62f5c3668265e', 'AR-u6-plane-capacitance-06': 'c58b7e0d76c8fb1bdf7706edf04fc33e16aaf3d85df23027c1c8affbce97c001', 'AR-u6-plane-capacitance-07': '618128c1d06baf7817a552716c72773a1a2648c3b118885b194a6866a25d17ba', 'AR-u6-plane-capacitance-08': 'be40975fa3aa7bf40203e396c5bd03c442fc4cd5829862b4fd07edf6feca7912', 'AR-u6-plane-capacitance-09': '0fe343b3fd93a842f2e045346292ca96b53d567f5d34b14e047d58f2c91d5aab', 'AR-u6-plane-capacitance-10': '6ba9e4cef48526f7e947107c760e01d0e9dbc0375b62196b41f896046489b053', 'AR-u6-plane-capacitance-11': '74ff4c48c9c84b522b462784c77f1da9bedb3899e8c52764be1b3fd8184135fe', 'AR-u6-plane-capacitance-12': 'eb5a5acf28aff6a31935c2c0cb7f806f89af2813c880df4c294e22b4ee393ad1', 'AR-u6-plane-capacitance-13': '1c4bf4a97f336bb406637919a74457379189ccbfce06e1ecd209dfedaa4ab418', 'AR-u6-plane-capacitance-14': 'ec2aaf8529ac42266fa8dc9565659f3dd57c3c0b10ba3cde2bc265aa5a565b95', 'AR-u6-plane-capacitance-15': '3981871169b124053aba7386e2982ab2fe0f136a1612047cba04bc01a44a6630', 'AR-u6-plane-capacitance-16': 'c9e8210a4ed75b366b305801f0c7d32a3fe917e04abff482cee42a476c124957'}

READ_SOURCE_SHA256={'u6-plane-capacitance-01': '4ddfbf9a3fdecded46b719bf2a8a5e8641e5474fd42e2eee2292494cfede6121', 'u6-plane-capacitance-02': '2e7b204ae1a7b2da073bd256523aa1b73f77ac289d7fe09f7df2b67052bdf696', 'u6-plane-capacitance-03': 'b6d0271247aedab9d5f441f5fbaec3f5380715e6f4f67e693fb78e22dceaeb4e', 'u6-plane-capacitance-04': '603fda24c0141ee4e2824d0674be41690dcbced945c23a2ac29e183abb3bdc88', 'u6-plane-capacitance-05': '34e0bce5164f90b498ca28585df16f3699a94ea828c2a6deabdbe99d52c4de0f', 'u6-plane-capacitance-06': '13c27d953ed80c2b41191fb8e9f66dc4e949431d79671ec88edc0a8317367740', 'u6-plane-capacitance-07': '44c7c2ac2263ed605d01142d3abf333cc4846012bdfdb3983ee4bcc1b4e93707', 'u6-plane-capacitance-08': '888831f84e1b2e7da3acef1d86542ff8b2a945fe77ee78f6746b840c3301bed8', 'u6-plane-capacitance-09': '353bd8e7c1a265f226e01903606c7bc0d1a596b21648bcf276b56768d45bd09e', 'u6-plane-capacitance-10': 'f8b74384ab1f3ec4f383e1c89209d1acfa59559c2da6bda1bf35c23d70775475', 'u6-plane-capacitance-11': '2092ce5d646d12074b5e1b0c2bd70d329fe7df71d0480779263c292e597baf10', 'u6-plane-capacitance-12': '11426dbbefbee91ccc9ffe9212ef1172ba2fc0afb60105b939411ee3b6ba58a3', 'u6-plane-capacitance-13': 'b3ce027caf1c4a74ee9ade9da43e93f36f926d4d274c10136df49043583bb0a6', 'u6-plane-capacitance-14': '309dffd7ead2cf178cd542690f626ff8735792663ece712f1d1a261d61a50964', 'u6-plane-capacitance-15': '5efb4b661529504f3d85db815e1c9ae52ef816723f5c7e11fb5dd162434f9f03', 'u6-plane-capacitance-16': 'ae1c9667cb1903abe22b2e1412a6cf0b72b414bf3e4e408166df360482b61a51'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-03 215–219 congelata prima di qualunque candidato; modelli indipendenti preparati ed eseguiti prima delle chiavi. Successivamente letti individualmente tutti16 prompt/opzioni/blocchi/formule/hint/error/metadati del lotto finale, XML e nuovo PNG nativo completo. Rettifiche B rilette prima delle firme. Nessun modulo autore importato; lezioni C4-L03/L04/L07 e C3-L03/L04 reali rilette per i casi autonomi. UI prodotto e human NOT_RUN; confronto ROOT integrato PENDING.'
