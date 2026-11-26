"""Independent individual review, no candidate authoring import."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import induction_helix_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent symbolic alternatives not unique as general laws')
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-05.json'
FAMILY='motional-emf'
EXPECTED_IDS={'AR-u6-motional-emf-09', 'AR-u6-motional-emf-13', 'AR-u6-motional-emf-06', 'AR-u6-motional-emf-01', 'AR-u6-motional-emf-16', 'AR-u6-motional-emf-02', 'AR-u6-motional-emf-10', 'AR-u6-motional-emf-04', 'AR-u6-motional-emf-12', 'AR-u6-motional-emf-08', 'AR-u6-motional-emf-11', 'AR-u6-motional-emf-03', 'AR-u6-motional-emf-15', 'AR-u6-motional-emf-14', 'AR-u6-motional-emf-05', 'AR-u6-motional-emf-07'}
REVIEWED_SKILLS={n:'C4-L10'for n in range(1,17)}

@lru_cache(maxsize=1)
def oracle():
    B,L,v,E,k1,k2=sp.symbols('B L v E k1 k2',positive=True)
    unique([B*L*v,B*v/L,B*L/v,L*v/B,B*L*v*v],B*L*v)
    unique([E/(L*v),E*L*v,L*v/E,E*v/L,E/v],E/(L*v))
    unique([k1*k2,k1/k2,k2/k1,k1*k1*k2,k1+k2],k1*k2)
    d=model.primary_only_derivations()[236]
    out=[d[n]for n in range(1,17)]
    out[1]='V'
    out[2]='E = B L v'
    out[3]='Da 3 V a 3/2 V'
    out[8]='B = E / (L v)'
    out[9]='κ₁ κ₂'
    return out

MANUAL=['Per asta, velocità e campo mutuamente perpendicolari, il modulo della f.e.m. motrice è E=BLv. Si può ricavare da ∫(v×B)·dℓ o dal flusso BA della superficie del circuito con dA/dt=Lv. Con L=1/2 m, B=2 T, v=3 m/s: E=3 V. La forza magnetica sui portatori fissa il verso; qui si chiede solo il modulo.', 'La grandezza richiesta ha dimensione tensione, V=J/C=Wb/s. Nella primaria le alternative non erano aperte; dopo il congelamento tutte e cinque sono state lette e confrontate individualmente.', 'La geometria ortogonale dà E=BLv. Con L=1/2 m assegnata, la legge numerica nelle unità SI è E[V]=B[T]v[m/s]/2. Il coefficiente fisico è una lunghezza, non un numero puro universale. Verificherò le cinque espressioni effettive soltanto dopo la freeze.', 'B passa da 2 a 1 T a v=3 m/s e L=1/2 m invariati. E passa da 3 a 3/2 V: il fattore è 1/2, lineare in B. Le due preparazioni hanno geometria invariata.', 'Isolo B=E/(Lv). I dati 3 V, 1/2 m e 3 m/s danno B=3/(3/2)=2 T. Denominatore positivo e non nullo; unità V·s/m²=T.', 'Isolo v=E/(BL). Con E 3 V, B 2 T, L 1/2 m si ha v=3 m/s. È il modulo della velocità dell’asta nella direzione dichiarata, non il segno di un potenziale agli estremi.', 'A: E=3 V. B con v=1 m/s e B 2 T dà 1 V. Rapporto E_B/E_A=1/3, puro; non è inverso della velocità.', 'Proposta 6 V meno corretto 3 V=+3 V. Due è il rapporto puro, mentre lo scarto è ancora una tensione.', 'Da E=BLv ricavo B=E/(Lv), con L=1/2 m e v>0. Conservare L nell’inversa dimensionale evita di trattare E/v come un campo: E/v ha T·m, non T.', 'B_B=κ₁B_A e v_B=κ₂v_A a L invariata: E_B/E_A=κ₁κ₂. Si confrontano moti preparati distinti, con le tre direzioni ancora ortogonali e tutti i moduli positivi.', 'A ha E_A=3 V. B ha E_B=(1 T)(1/2 m)(4 m/s)=2 V. Rapporto 2/3, combinazione dei fattori 1/2 di B e 4/3 di v.', 'Media delle uscite(3+2)/2=5/2 V. Agli ingressi medi B=3/2 T e v=7/2 m/s, la legge dà 21/8 V. Media meno risultato ai dati medi=20/8−21/8=−1/8 V; nessuna approssimazione richiesta.', 'Bersaglio(2/3)·3=2 V e B_B=1 T. v_B=E/(BL)=2/(1/2)=4 m/s. Rapporto v_B/v_A=4/3. Il campo dimezzato richiede compensazione anche della velocità.', 'Il riferimento E_A 3 V con lettura 9 fissa a_cal=3 unità/V. Lettura 6 dà E_B 2 V. Con v 4 m/s e L 1/2 m, B_B=2/(2)=1 T.', 'Riferimenti E_A 3 V, E_B 2 V e letture 7, 5: a_cal=(7−5)/(3−2)=2 unità/V, b_cal=1. Lettura 21 decodifica E_C 10 V. Con v 5 m/s, L 1/2 m: B_C=10/(5/2)=4 T.', 'Il vincolo fra preparazioni è B=[(2/3) T/(m/s)]v. Per w=v/(1 m/s)>0, E/(1 V)=w²/3. La misura 3 V implica w²9: radici±3, soltanto w 3 è ammessa. v=3 m/s e B=2 T. Il vincolo non è una rampa temporale del campo dentro un singolo esperimento.']

DISTRACTORS=['3 V=2·(1/2)·3.6 omette mezzo metro, 1 omette v, 0 confonde quasi aperto con assenza di f.e.m.', 'V=Wb/s=T·m²/s; N forza, T campo, Wb flusso, A corrente.', 'BLv segue area spazzata Lv dt. Bv/L perde L² rispetto alla legge, BL/v inverte v, Lv/B inverte B, BLv² aggiunge rapidità.', '3→3/2 V.6 inverte il campo, 3 ignora, 3/4 quadra e 0 richiederebbe parametro nullo o geometria diversa.', 'B 3/(3/2)=2 T.1 omette L e produrrebbe 3/2 V, 1/2 reciproco, 9 moltiplica numeri.', 'v 3/(2·1/2)=3 m/s.6 raddoppia erroneamente e produce 6 V, 1/3 reciproco, 1 copia BL.', '1/3 da 1 V/3 V.3 reciproco, 1/9 quadrato, 9 reciproco del quadrato, 1 ignora.', '+3 V=6−3.−3 ordine inverso, 2 rapporto, 6 proposta, 0 accettazione senza legge.', 'B=E/(Lv).ELv non isola, Lv/E è T⁻¹, Ev/L altera v ed E/v ha T·m.', 'κ₁κ₂: entrambi ingressi moltiplicano. Quozienti invertono una dipendenza, κ₁² aggiunge potenza, somma fallisce a fattori 1.', '2/3 da 2 V/3 V.3/2 reciproco, 1/2 solo B, 4/3 solo v, 1 falsa compensazione.', '5/2 V media di 3 e 2.21/8 usa ingressi medi, 5 somma, 1/2 semidifferenza, 3 prima lettura.', 'v_B 4 m/s per bersaglio 2 V, rapporto 4/3.3/4 reciproco, 2/3 copia E, 1/2 B, 2 darebbe 3 V.', 'g 3 V⁻¹, D 6→2 V eB 1 T.3 T salta guadagno e predice 18; 2 T copia E; 1/4 T darebbeD 3/2.', 'g 2 V⁻¹, b 1, D 21→10 V, B 4 T.21/5 salta offset, D 22; 8 T salta guadagno; 10 T copia E.', 'u²9, ramo u 3: v 3 m/s, B 2 T.−3 viola modulo, 9 non estrae radice, 2 copia B, infinite non rispetta misura 3 V.']

ASSUMPTIONS=['Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Si chiede la dimensione della grandezza nominata, senza valori numerici o modello di moto specifico; i cinque distrattori sono stati letti dopo la primaria.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.', 'Sbarretta di lunghezza 1/2 m, campo e moto mutuamente perpendicolari; misura ad alta impedenza, corrente trascurabile, regime quasistazionario ed effetti di bordo trascurati. Moduli reali finiti positivi; stessa lunghezza nelle prove e nessun generatore implicito.']

UNITS={1: 'volt', 2: 'volt', 3: 'volt', 4: 'volt', 5: 'tesla', 6: 'meter/second', 7: '', 8: 'volt', 9: 'tesla', 10: '', 11: '', 12: 'volt', 13: '', 14: 'tesla', 15: 'tesla', 16: 'meter/second'}

NUMERIC_UNITS={1: 'V', 5: 'T', 6: 'm/s', 14: 'T', 15: 'T'}

SUFFIX={8: ' V', 12: ' V'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite rapidità'}}

SVG_REVIEW='XML e native indipendente completo 640 × 1500 letti. Campo entrante e moto a destra danno v×B verso l’alto per cariche positive: estremo a positivo. Guide aperte e freccia v separata. Grafico a B 2 T, L 1/2 m: origine(130, 880), x=130+100 v[m/s], y=880−80 E[V], punto(430, 640)=(3 m/s, 3 V), estremo(530, 560)=(4, 4). Barre 300/200/250 da 150 rappresentano 3/2/5/2 V, scala 100 coordinate/V; seconda prova delle barre usa B 1 T, non il campo fissato del grafico.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='defc0f1a10821559bca06fede1c2e2ca1ce5d2b4'

PRIMARY_SHA256='c0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc'

REVIEWED_MODEL_SHA256='ffcffcf42b8f76159845cb9be8f16cb3529b50c5bb37790b7785ee032ed1b020'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='b2487fbe1fa7512bdc4572a2c0d490b01312eb6a1c074d6c3773dd619345ed99'

REVIEWED_BINDINGS_SHA256='acfbf7eb4307bdf0f3e92f9a32d5e03240a2d9a0cad7bd6281c97c2f0bc70fa9'

REVIEWED_CANDIDATES={'AR-u6-motional-emf-01': 'a2a08147a1de21d575bb50e62660c8b492409e3405b48a3ee992527428f8a6c9', 'AR-u6-motional-emf-02': 'b5dfdde823b7ccea96483849c6bc6511912886385d701350f7fccdbf14ecbb27', 'AR-u6-motional-emf-03': 'd80083546084cc3a8e683b7784f6edbe683e6da0c059f5187737135baf7395e5', 'AR-u6-motional-emf-04': '631b8f6d0fa472c088346eada87633d488461ec07a3e6a736ce3a94a278a1153', 'AR-u6-motional-emf-05': '6cf25d8fd61e08420d0aaed50c186ebce6907e6346de9a596e48685f051432f8', 'AR-u6-motional-emf-06': 'a481f382822ec6c78a9d83be177caa6cf37d67a71acd151e538465ca6255e059', 'AR-u6-motional-emf-07': 'b88949950f140294227fa3c0e24ea3e7686558715361cb24fcc06851f78942e5', 'AR-u6-motional-emf-08': '89d5992a0e8055b4753938abf438f0ce86c20ba6abf85b270ec7338571f03926', 'AR-u6-motional-emf-09': '70a4278e48b22619aa68b5abdbcb18c0cdbbf8f95bde4c082d0266ec4759a4fe', 'AR-u6-motional-emf-10': '9d03bd12c98c75380f5782993e488460f473d041217b36f871ca66955bc90e6f', 'AR-u6-motional-emf-11': '80703648582a38b443403b5b6a0d95ecfee6b56f2549559ef7b9c2d838d2c42b', 'AR-u6-motional-emf-12': 'd2cfeb3cc22acd24e048d5057b2757a37c80ea1bb22d71fb4ab03ed4a33d6795', 'AR-u6-motional-emf-13': '9f8759f27645ff5848d5f5bd3b6b4e40447b8f3f3df779d55a4ffece2bce5dcc', 'AR-u6-motional-emf-14': '33f8b75170901c4edc550669aa36bb5875fbed2c640ca493e7fb305f03719d79', 'AR-u6-motional-emf-15': 'fe92241e22d1dd8b8d8f9b306c558d23c832ec4649802f8425a4346af3201657', 'AR-u6-motional-emf-16': '6793e62b2adf0758632adaf627753738946ffcc8f3d7c8e01818da3df0c4ae3a'}

READ_SOURCE_SHA256={'u6-motional-emf-01': '2a48bef71bf06504795b6d32a1fbc4a83fad979b3fc43122d75e6ecbe8c770b7', 'u6-motional-emf-02': '979ad6a1bd0fb6490a84df32ea20ed9a820f3b03b57d96dab68a7bae19b535a2', 'u6-motional-emf-03': 'f724f042bdae8b008789140a33279ae47c23024e5f0b9b8c0794759c9e22ee71', 'u6-motional-emf-04': '2ded1acd97aebc83665ea74874c1b2d0e6f2f36e40ec9877a55d5302f21ba490', 'u6-motional-emf-05': 'daa0106974db065a1ef7b4901522ad26b881c52c1405f4eec3421bde98bcc583', 'u6-motional-emf-06': '60195999adec6a4022451a696bef20326e56cab4740db4f779ddf7ff899d0870', 'u6-motional-emf-07': '78a9481acb145109b027c017f4f07a5a00b7ec197a5b51d698362cd7d5980419', 'u6-motional-emf-08': 'b6c2e0f73fda27eb2f62860fe48e6ad5f26457d820dd6abd7e613fd9d02bed6d', 'u6-motional-emf-09': '20270a7644bc2543bf7c88d097153c7c7f1816ec2b7726418374856b685c8299', 'u6-motional-emf-10': '6dc8aef80fcd639a818f45c79ac9d7764a4c1504b63f2afd392141cd19566bb8', 'u6-motional-emf-11': '3a956a05f562ae2985350b7a926c6bcbce3c3f0cd72fd4484081ea32c346b2c2', 'u6-motional-emf-12': '3a6854f4c86ac74b61b3d23a570e1117cf55704d02cb7433f8a564e782ad8aff', 'u6-motional-emf-13': '59218d9d404279fa95e3df98c26463a1f689ef9b6d13d9c77e072290312909a2', 'u6-motional-emf-14': '7d4279032226536a6aa67389af9a0dc6eb06228611f764d985a4812ad88151f3', 'u6-motional-emf-15': '910eb995bdf620138759bf52dfbd5e1c7edad3d6287c554682fa982a30df8b71', 'u6-motional-emf-16': 'c0af6afe60b3f7b3e3efe45b0fb4489625ac49b677981e8b7283969bf5e3852c'}

SOURCE_READING='Tutti gli 80 originali derivati nella primaria c0d2 prima di candidate; modelli indipendenti scritti ed eseguiti sul commit d7389745 prima di aprire qualsiasi candidato B. Successivamente letti integralmente tutti i 16 prompt, opzioni, blocchi, formule, hint, feedback e metadata finali di questa famiglia, più XML e nuovo native completo indipendente. Eventuali fix autore riletti selettivamente prima del congelamento. Nessun modulo autore o primaria B importata/letta; UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'

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
          'methods':['SymPy_independent_Faraday_Ohm_Lorentz_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
