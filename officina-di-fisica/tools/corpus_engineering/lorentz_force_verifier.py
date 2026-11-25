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
from . import dielectric_lorentz_review_models as model
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'
FAMILY='lorentz-force'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L09', 2: 'C4-L09', 3: 'C4-L09', 4: 'C4-L09', 5: 'C4-L09', 6: 'C4-L09', 7: 'C4-L09', 8: 'C4-L09', 9: 'C4-L09', 10: 'C4-L09', 11: 'C4-L09', 12: 'C4-L09', 13: 'C4-L09', 14: 'C4-L09', 15: 'C4-L09', 16: 'C4-L09'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    F,q,B,k1,k2=sp.symbols('F q B k1 k2',positive=True)
    unique([F/(q*B),q*B/F,F*B/q,F/B,F/(q*B**2)],F/(q*B))
    unique([k1*k2,k1/k2,k2/k1,k1**2*k2,k1+k2],k1*k2)
    vx,vy,vz,bx,by,bz=sp.symbols('vx vy vz bx by bz',real=True)
    velocity=sp.Matrix([vx,vy,vz]);field=sp.Matrix([bx,by,bz]);assert sp.expand(q*velocity.cross(field).dot(velocity))==0
    assert sp.Matrix([1,0,0]).cross(sp.Matrix([0,0,-1]))==sp.Matrix([0,1,0])
    assert model.magnetic_force(2,3)==6 and model.speed_from_force(6,3)==2 and model.field_from_force(6,2)==3
    d=model.primary_only_derivations()[229];out=[d[i]for i in range(1,17)]
    out[1]='N';out[2]='Il modulo della velocità';out[3]='Da 6 μN a 3 μN';out[8]='v = F_B / (|q| B)';out[9]='κ₁ κ₂'
    return out

MANUAL=['Il modulo della forza magnetica è |q|vB sinθ. Qui θ=90° e q=1 μC, dunque F_B=|q|vB. Un μC·un km/s·un mT=10⁻⁶·10³·10⁻³ N=1 μN. Per v=2 km/s e B=3 mT, F_B=6 μN. Il verso richiederebbe vettori orientati e regola del prodotto vettoriale, non determinabile dai soli moduli.', 'Si chiede una forza, unità newton N e qui μN. C·(m/s)·T=N, perché T=N·s/(C·m). Le cinque alternative non sono state aperte; i prefissi non alterano la dimensione. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'La forza è q v×B, perpendicolare alla velocità: la potenza istantanea F·v=0. L’energia cinetica e quindi il modulo della velocità restano costanti per una particella ideale di massa fissata soggetta soltanto al campo magnetico statico. Il vettore velocità può cambiare direzione; senza la condizione v⊥B non si impone un moto puramente circolare: può essere elicoidale. Le alternative effettive saranno lette successivamente.', 'B=3 mT e q fissati, v scende da 2 a 1 km/s mantenendosi perpendicolare. F_B passa da 6 a 3 μN, dipendenza lineare dalla rapidità. Confronto fra stati o preparazioni, non decelerazione causata dal solo campo magnetico.', 'Da F_B=|q|vB segue v=F_B/(|q|B). Nelle unità assegnate con q=1 μC, v[km/s]=F_B[μN]/B[mT]. Quindi v=6/3=2 km/s. Denominatore B positivo e non nullo.', 'B=F_B/(|q|v). Con forza 6 μN e v=2 km/s, B=3 mT. È modulo del campo, non una componente con segno; la carica positiva fissa il verso della forza solo dopo specificare le direzioni di v e B.', 'A dà F_A=2·3=6 μN; B dà F_B=2·1=2 μN. Rapporto 2/6=1/3, puro. La rapidità resta uguale, cambia soltanto il modulo del campo fra le preparazioni.', 'Corretto 6 μN e proposta 12 μN. Scarto proposto meno corretto=+6 μN. Il rapporto due è adimensionale e non lo scarto; non si introduce un fattore due nella legge qvB.', 'L’inversa fisica è v=F_B/(|q|B), nel caso perpendicolare. Con q=1 μC e le unità numeriche dichiarate diventa v[km/s]=F_B[μN]/B[mT]. F/B da solo in SI non è una velocità se si omette il fattore |q|: la scorciatoia dipende dalla carica e dai prefissi assegnati.', 'Con q e θ=90° invariati, v_B=κ₁v_A e B_B=κ₂B_A danno rapporto dei moduli F_B,B/F_B,A=κ₁κ₂. Sono confronti tra preparazioni; il campo magnetico da solo non porta la stessa particella da una rapidità all’altra compiendo lavoro. Fattori e moduli restano finiti positivi nel regime del modello.', 'A: F_A=2·3=6 μN. B: F_B=1·4=4 μN. Rapporto 4/6=2/3; fattore 1/2 della rapidità e fattore 4/3 del campo si moltiplicano.', 'Media dei moduli (6+4)/2=5 μN. Ai dati medi v=3/2 km/s e B=7/2 mT, il prodotto darebbe 21/4 μN, differente di 1/4 μN. Non è una media di vettori con direzioni non specificate, ma delle letture positive richieste.', 'Bersaglio F_B,B=(2/3)·6=4 μN, nuova v=1 km/s. Serve B_B=4 mT e rapporto B_B/B_A=4/3. Non si copia il rapporto delle forze perché varia anche la rapidità.', 'Riferimento forza 6 μN e lettura 18: guadagno 3 unità/μN. Lettura 12 decodifica forza 4 μN. Con B=4 mT e q=1 μC, l’inversa dà v=1 km/s. Il display non misura la rapidità direttamente.', 'Forze di riferimento 6 e 4 μN e letture 13 e 9: guadagno (13−9)/(6−4)=2 unità/μN, offset 1. Lettura 41 indica F=(41−1)/2=20 μN. Con B=5 mT, v=20/5=4 km/s.', 'Il vincolo fra preparazioni è v=(2/3 km/s per mT)B. Scrivendo b=B/(1 mT), la forza in μN è (2/3)b². Misura 6 implica b²=9; il ramo B>0 seleziona B=3 mT e v=2 km/s. Non è un campo che aumenta temporalmente con la velocità: un B variabile richiederebbe altri effetti non presenti nel modello.']

DISTRACTORS=['q 1 μC, v 2 km/s, B 3 mT perpendicolari: F 6 μN. Kilo e milli si compensano; sei N perde il prefisso micro della carica, dodici duplica, tre omette v 2. Direzione da prodotto vettoriale, non dal modulo.', 'N misura forza. C·(m/s)·T=N; T campo, C carica, J lavoro, V tensione. Forza e campo non sono la stessa grandezza.', '(v×B)·v=0 implica potenza e variazione di K nulle: rapidità costante. Il vettore v può ruotare, posizione cambia, accelerazione generalmente ruota. Moto parallelo è caso particolare, non proprietà universale.', 'v dimezzata a B e angolo invariati porta 6→3 μN. 12 inverte, 3/2 quadra, 6 ignora e 0 richiederebbe v 0 o direzione parallela, esclusi.', 'v=F/(|q|B)=2 km/s. 18 moltiplica numeri, mezzo reciproco, sei copia la forza senza campo; prefissi vanno convertiti tutti.', 'B=F/(|q|v)=3 mT. 12 prodotto, 1/3 reciproco, 6 copia F; segnonon dedotto dal modulo. Direzione richiede dati vettoriali.', 'B ridotto 3→1 mT dà F 6→2 μN e rapporto 1/3. Tre reciproco, 1/9 e 9 quadrati, uno ignora B.', 'Scarto+6 μN.−6 inverte, due rapporto, 12 proposta, zero confonde potenza magnetica nulla con forza nulla.', 'F/(|q|B) ha m/s. Il reciproco ha s/m; FB/|q| e F/(|q|B²) alterano dimensioni; F/B ha C·m/s. Rapidità modulo non prende segno di q.', 'κ₁κ₂ segue prodotto vB. Quozienti invertono dipendenze, κ₁²introduce quadrato, somma fallisce prove identiche. Entrambe velocità nel regime nonrel dichiarato.', 'F_A 6, F_2=4 μN→2/3; 3/2 reciproco, mezzo solo v, 4/3 solo B, uno compensa senza dati.', 'Media 5 μN distinta da 21/4 ai dati medi: media meno risultato ai dati medi=−1/4.10 somma, uno semidifferenza, zero usa cancellazione vettoriale invece media moduli.', 'Bersaglio 4 μN e v 1 richiedono B 4 mT: rapporto 4/3; 3/4 reciproco, 2/3 copia rapporto di F, mezzo solo v, 2 darebbe F 6 μN.', 'Guadagno 3 μN⁻¹, D 12→F 4, B 4→v 1 km/s. 3 tratta D come F, 4 copia F, 1/4 predice F 1 e D 3.', 'Guadagno 2 μN⁻¹, offset 1, D 41→F 20, B 5→v 4 km/s. 41/10 omette l’offset e D 42; 8 omette il guadagno; 20 copia F.', 'β=B/(1 mT)>0 porta F/(1 μN)=(2/3)β²=6→β²9→β 3, v 2 km/s.−3 viola i moduli, 9 copia quadrato, 2 copia v; misura fissa scala.']

ASSUMPTIONS=['Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Caso autonomo: particella carica, non necessariamente q=+1 μC, soggetta soltanto a campo magnetico uniforme statico; nessun campo elettrico, altre forze o radiazione. Modello classico, massa positiva costante. Il prodotto vettoriale è ortogonale a v anche con componente parallela a B: K e rapidità si conservano. Non si impone qui v perpendicolare a B né un valore numerico della carica.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.', 'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel 03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo 16 soltanto fra preparazioni.']

UNITS={1: 'micronewton', 2: 'micronewton', 3: '', 4: 'micronewton', 5: 'kilometer/second', 6: 'millitesla', 7: '', 8: 'micronewton', 9: 'meter/second', 10: '', 11: '', 12: 'micronewton', 13: '', 14: 'kilometer/second', 15: 'kilometer/second', 16: 'millitesla'}

NUMERIC_UNITS={1: 'μN', 5: 'km/s', 6: 'mT', 14: 'km/s', 15: 'km/s'}

SUFFIX={8: ' μN', 12: ' μN'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite intensità di campo'}}

SVG_REVIEW='XML completo e PNG nativo 640 × 1480 letti: q positiva, v verso destra, B entrante dà F verso l’alto; due frecce separate con punte complete e rettangolo ortogonalità, lunghezze non confrontabili fra unità diverse esplicitate. Barre 300/200/250 per 6/4/5 μN da origine 150, comune 50 coordinate/μN. Grafico indipendente con B 3 mT, q 1 μC: x=150+160 v, y=1310−30 F, segmento(470, 1130)=(2 km/s, 6 μN); origine aperta esclusa da v>0. Nessuna traiettoria rettilinea inferita dal disegno.'

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


CANDIDATE_REF='d08b78557da6988f0264890c7c1994789f744533'

PRIMARY_SHA256='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a'

REVIEWED_MODEL_SHA256='42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='de63741a3beb8f0f46c208549d909e1c7a89377259bc92a807245ff3f26da9df'

REVIEWED_BINDINGS_SHA256='7e9837a066eda6b0fc8db9e292ba4d4c65ea3ac5a86830ea2c2e4ba08b64419d'

REVIEWED_CANDIDATES={'AR-u6-lorentz-force-01': '3b7ed645e0b10cfb9290d97ecdb115f547093251b7ef9ef2ddc833dc5683359f', 'AR-u6-lorentz-force-02': 'ad7332520a0f31ef03e2da13e94739b43e2ffbb5da71bdddcfa968b599e7f644', 'AR-u6-lorentz-force-03': '7841815a72deb46ccc24fbd590f2e2b414ae9bf8162129e91b00a80d503f1bcf', 'AR-u6-lorentz-force-04': 'eb2200670fdb34be1f38651b927492cbdfd7fe27191d6e50dd14cf859efbf4e1', 'AR-u6-lorentz-force-05': '754d4ad0f915044f3a3650557ee64584530300e38558a7d37a0ac4faf80dbd73', 'AR-u6-lorentz-force-06': '2b957771da2cbaf80175bec0786cf52ada3533ae7d934cd5feaae6f080865832', 'AR-u6-lorentz-force-07': '19e0e0bfc56a683f352f58323545084b7c979c940771cc22c2b23156b037ae67', 'AR-u6-lorentz-force-08': 'd1ce3ccbd8c3128e5de6ed3e059e460ac92764a590d18780a0e20ee05756244f', 'AR-u6-lorentz-force-09': '092061b68865fd5fde9c0b2702aea762055c042d469b394e871c196e84b5bfc1', 'AR-u6-lorentz-force-10': '219669a0d69cfbe07683af9be02cf03e65be451b5d0d53952e24a154f1d07b8a', 'AR-u6-lorentz-force-11': '0865a338a9fd61cd76ade5e36dc842d6834ef0305c540c4d85da07526631d2d4', 'AR-u6-lorentz-force-12': '4308c02757eed0d0792a4836e743d68589e86122b254126c5dd99796e553af9c', 'AR-u6-lorentz-force-13': 'f621ed1ebed23c95a8b2509f1937ac35e50d9b8efe2a6caf2cb6d0f63c90d467', 'AR-u6-lorentz-force-14': 'd4622a1229040a946243aa81d51e088f0beea6d3a288b4c5f09af597f92a6ef9', 'AR-u6-lorentz-force-15': 'c622fbb72916b5f06a5bfa0d9dc1c6f7fd9a727faf4aa95aa33b303dd38f9f23', 'AR-u6-lorentz-force-16': '947ae9291d896676eec80a8e77f3a11ba663bf89a33f5b7930dd99f37ea2f1b0'}

READ_SOURCE_SHA256={'u6-lorentz-force-01': '3b2b0026a861552586486e88d10d76bdcf7203139b9d5313c50f879b69de8ca0', 'u6-lorentz-force-02': '66435370cd5be35309bc41575a61d43a2688c5100d2810e9be5f0deea5d1963a', 'u6-lorentz-force-03': 'b5d41d1ec100cb0dbbdc4fe7f5acdc8feefc13afecfa18381260a12f8f233e67', 'u6-lorentz-force-04': 'f77c3d729ecfcdafcf693586eee30a69c370e5752805005093e053c6fa0c2bdc', 'u6-lorentz-force-05': 'ed9b48b559947fbd9651a5d952f3bf7c6ed7d3178e8bacf56d5b830c942ef47f', 'u6-lorentz-force-06': 'e93292fa0efb6dc553f70fe24c1df506a57096f766799a6ee9721e4a12fc9239', 'u6-lorentz-force-07': 'f9e9b1a34487aa8172ae7046f83b76ba48d9279507c6c7ce4ca3480900479857', 'u6-lorentz-force-08': 'fb91e244b5cae6e34e62a4f89a67c7911acfef674bfc53015559666f4160e06b', 'u6-lorentz-force-09': 'd64dadb0801bde68b769a5f4c89eb97eaa31a9bd9ce83e19e706aca9429ce92d', 'u6-lorentz-force-10': 'e9dc31edb9d5a3d4ccce3ec5cbc0dbebf4a15402eb5d1595d6bc4b0b718879f6', 'u6-lorentz-force-11': '6c6ed4acb602a552cf1d93c33fb0483b7d021fef273eb33afab8261e39f60816', 'u6-lorentz-force-12': '7f69bfb98718034d24bdf9421b407f2c0dbd9075b465407ab9efa562500fe66e', 'u6-lorentz-force-13': 'c9f0a98d2f42930d26fccc20c456b5263ec26fcf1065365c44c074c3c8503784', 'u6-lorentz-force-14': 'be086ba66243e0d0a3d433fbabeec0aa44ddae0efcbedffb76f2695f92354cdb', 'u6-lorentz-force-15': 'df2536c4d156a7d9b56ba8316380d0758a7a211a62f44ffe91adb63d1b8bee5f', 'u6-lorentz-force-16': '86a5dcce4c3784f6ca9539cdfa14d5585fe952c10f39a6a0078506188166a394'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-04 B225–229 congelata prima di qualunque candidato. Successiva lettura allowlist di tutti80 prompt finali, poi modelli indipendenti scritti ed eseguiti realmente prima delle chiavi. Solo dopo sono stati letti individualmente tutti16 record finali completi, opzioni, formule, hint, feedback, metadata, XML e nuovo PNG nativo integrale. Nessuna esposizione anticipata a chiavi, nessun modulo autore importato o primaria B aperta. UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'
