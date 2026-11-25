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
FAMILY='dielectric-connected-charge'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L07', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L07', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    C0,Q,k,Vg,k1,k2=sp.symbols('C0 Q k Vg k1 k2',positive=True)
    unique([Q/(k*Vg),Q*k/Vg,Q*Vg/k,k*Vg/Q,Q/Vg],sp.solve(sp.Eq(Q,k*C0*Vg),C0)[0])
    unique([k1*k2,k1/k2,k2/k1,k1*k2**2,k1+k2],k1*k2)
    assert model.connected_charge(2,2)==8 and model.initial_capacitance(8,2)==2 and model.connected_dielectric_ratio(8,2)==2
    d=model.primary_only_derivations()[226];out=[d[i]for i in range(1,17)]
    out[1]='C';out[2]='V resta 2 V e il modulo Q aumenta';out[3]='Da 8 μC a 16 μC';out[8]='C₀ = Q / (κ V_g)';out[9]='κ₁ κ₂'
    return out

MANUAL=['Generatore ideale collegato mantiene V=2 V durante l’inserimento. La capacità finale è κC₀ e il modulo di carica su una piastra è Q=κC₀V. In unità μF, V e μC, Q[μC]=2 κC₀[μF]. Con C₀=2 μF e κ=2 si trova Q=8 μC; il generatore fornisce la carica libera aggiuntiva.', 'La carica ha unità coulomb C, qui μC. F·V=C dimostra la dimensione dalla legge Q=CV. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'Il vincolo del generatore ideale fissa la differenza di potenziale, mentre può scambiare carica con le armature. A geometria invariata l’inserimento ideale con κ>1 aumenta C e il modulo Q; al confine κ=1 non li cambia. Non si conserva la carica libera di ciascuna piastra come nel caso scollegato e non si crea carica netta dal nulla.', 'κ=2 e V=2 V restano uguali. C₀ passa da 2 a 4 μF, quindi Q passa da 2·2·2=8 a 2·2·4=16 μC. Dipendenza lineare dalla capacità iniziale; sono preparati distinti e non una carica isolata che deve restare uguale.', 'Dalla legge Q=κC₀V si isola C₀=Q/(κV). Con Q=8 μC, κ=2 e V=2 V: C₀=8/4=2 μF. Il denominatore è positivo e la capacità cercata è quella prima dell’inserimento, non la capacità finale 4 μF.', 'κ=Q/(C₀V)=8/(2·2)=2. È puro e soddisfa κ≥1. In generale le misure devono dare Q≥C₀V nel modello di inserimento completo con costante relativa almeno uno.', 'A ha Q_A=8 μC. B con κ=1 e stessa C₀=2 μF ha Q_B=4 μC. Rapporto Q_B/Q_A=1/2; il confine κ=1 è valido e il generatore mantiene ancora 2 V.', 'Q corretto=8 μC e proposta=16 μC. Scarto proposto meno corretto=+8 μC. Il valore non è la carica netta delle due piastre e non si aggiunge un ulteriore fattore due alla carica di una sola armatura.', 'La formula fisica è C₀=Q/(κV), con V=2 V assegnata. La forma per i valori numerici è C₀[μF]=Q[μC]/(2 κ). Il numero 2 non può sostituire una tensione dimensionata fuori da queste unità dichiarate. κ≥1 e V>0 rendono lecita l’inversa.', 'Q_A=κC₀V e Q_B=(κ₂κ)(κ₁C₀)V con lo stesso generatore da 2 V. Il rapporto è κ₁κ₂. Le due costanti relative devono rimanere almeno uno; un fattore comune su entrambi gli ingressi produce un quadrato, senza rendere quadratica la singola legge in C₀.', 'A: Q_A=2·2·2=8 μC. B: Q_B=2·3·1=6 μC. Rapporto 6/8=3/4. Aumentare κ non basta a garantire aumento di Q quando contemporaneamente si dimezza C₀.', 'Media delle uscite=(8+6)/2=7 μC. Ai dati medi C₀=3/2 μF e κ=5/2 si otterrebbe 2·(3/2)·(5/2)=15/2 μC, diverso di 1/2 μC. Si mediano i risultati fisici delle due prove, non prima gli ingressi del prodotto.', 'Bersaglio Q_B=(3/4)·8=6 μC con C₀,B=1 μF. Dalla legge 6=2 κ_B·1 segue κ_B=3. Rapporto κ_B/κ_A=3/2, compatibile con κ_A=2 e κ_B=3.', 'Il riferimento Q_A=8 μC con lettura 24 dà guadagno 3 unità/μC. Lettura 18 indica Q=6 μC. Per κ=3 e V=2 V, C₀=6/(3·2)=1 μF. La taratura agisce sulla carica e non sulla capacità direttamente.', 'Q_A=8 μC e Q_B=6 μC, letture 17 e 13: a_cal=(17−13)/(8−6)=2 unità/μC, b_cal=1. Lettura 33 dà Q_C=(33−1)/2=16 μC. Con κ_C=2 e V=2 V, C₀,C=16/4=4 μF.', 'Il vincolo è C₀=(1 μF)κ, non una capacità adimensionale. Inserendo nella legge a 2 V si ottiene Q[μC]=2 κ². Misura 8 implica κ²=4, radici ±2; solo κ=2 rispetta κ≥1. C₀=2 μF. Il vincolo confronta preparazioni e non una κ temporale durante la carica.']

DISTRACTORS=['C finale 4 μF e Vg 2 V danno 8 μC su una piastra. Quattro ignora κ; due divide il valore iniziale 4 perκ; sedici conta entrambi i moduli. Il generatore trasferisce carica libera.', 'C è l’unità di carica: F·V=C. F, V, J, T sono rispettivamente capacità, tensione, energia, campo. Prefisso micro non cambia dimensione.', 'Con κ>1 il generatore fissa V 2 V, C aumenta e Q aumenta. Polarizzazione non crea libera aggiuntiva; quella passa dal circuito. κ 1 è il caso limite senza aumento, esplicitamente separato nel prompt.', 'C₀ raddoppia, κ e Vg uguali:8→16 μC. Quattro inverte, otto ignora, trentadue quadra il fattore due; due dimezza ulteriormente senza legge.', 'C₀=8/(2·2)=2 μF. Quattro è C finale, otto copia Q, mezzo ricostruisce solo 2 μC e non 8. Denominatori non nulli.', 'κ=8/(2·2)=2. Mezzo è reciproco fuori dominio; quattro copia C finale, sedici non forma il rapporto Q/(C₀Vg).', 'κ_B 1 dà 4 μC contro 8 μC A: rapporto 1/2. Due reciproco, 1/4 quadrato, zero confonde κ 1 con capacità nulla, uno ignora il cambio.', 'Scarto+8 μC. −8 inverte, due è rapporto, 16 copia proposta, zero non verificaQ=κC₀Vg.', 'C₀=Q/(κVg) ha F. Qκ/Vg non annulla κ; QVg/κ ha energia; κVg/Q è capacità inversa; Q/Vg è C finale.', 'κ₁κ₂ segue il prodotto a Vg fisso. Quozienti invertono un ingresso, κ₂² aggiunge potenza; somma è due per prove identiche. Entrambi κ fisici≥1.', 'Q_A 8 e Q_B 6 μC: rapporto 3/4; 4/3 reciproco, mezzo sola C₀, 3/2 soloκ, uno presume compensazione completa.', 'Media 7 μC, prodotto degli ingressi medi 15/2 μC, differenza mezzo. 14 è somma, 1 semidifferenza, zero carica netta del condensatore.', 'Bersaglio 6 μC con C₀1 μF e 2 V richiede κ 3, rapporto 3/2; 2/3 inverte, 3/4 copia rapporto cariche, 2 darebbeκ 4 e 8 μC. Mezzo non raggiunge il bersaglio.', 'Guadagno 3 μC⁻¹, D 18 dà Q 6 μC, κ 3 e 2 V danno C₀1 μF. Tre usa D come Q; due omette numericamente Vg; sei copia Q come capacità.', 'Guadagno 2 μC⁻¹, offset 1, D 33→Q 16 μC→C₀4 μF. 33/8 omette offset e dàD 34; 8 omette Vg, 16 copia Q con altra dimensione.', 'Q/(1 μC)=2 κ² e Q 8 impongono κ²4, κ 2 con C₀2 μF.−2 viola dominio e capacità positiva, 4 copia quadrato, 8 copia Q, nessuna ridondanza.']

ASSUMPTIONS=['Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.', 'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il 03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.']

UNITS={1: 'microcoulomb', 2: 'microcoulomb', 3: '', 4: 'microcoulomb', 5: 'microfarad', 6: '', 7: '', 8: 'microcoulomb', 9: 'farad', 10: '', 11: '', 12: 'microcoulomb', 13: '', 14: 'microfarad', 15: 'microfarad', 16: ''}

NUMERIC_UNITS={1: 'μC', 5: 'μF', 6: '1', 14: 'μF', 15: 'μF'}

SUFFIX={8: ' μC', 12: ' μC'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite costanti relative'}}

SVG_REVIEW='XML completo e PNG nativo 640 × 1480 letti: batteria 2 V collegata con polo lungo positivo verso piastra+; C₀2 μF, κ 2, C 4 μF, Q 8 μC. Barre 320/240/280 per 8/6/7 μC da origine 150, scala 40 coordinate/μC. Grafico a κ 2, Vg 2: x=150+160 C₀, y=1300−20 Q, segmento(470, 1140)=(2 μF, 8 μC), scala indipendente. Originecome limite, zeri e tutte punte leggibili.'

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


CANDIDATE_REF='0e189e8a589fd53f025fd2c84980407db30a339b'

PRIMARY_SHA256='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a'

REVIEWED_MODEL_SHA256='42da25a28a0f45351c833e9c583afeed5f0c615326404dc6ce4e2af1f8df61e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='a4d50565318196b6c2e82fa34fa650853700ec6070b0f349c8ded359a72d1b61'

REVIEWED_BINDINGS_SHA256='b62bb4d5d97b53d567e3eb7015952ab060f83a1b78471ce91bdfc8861905885f'

REVIEWED_CANDIDATES={'AR-u6-dielectric-connected-charge-01': '10f20f6deb43cc38fa5870d68ec988bcbcdab9482ae481ed6fba866b7ad3ab50', 'AR-u6-dielectric-connected-charge-02': '12d337049c702d72eefc3d3897e42f35daa7338f93c383ef886a96f35ebc05aa', 'AR-u6-dielectric-connected-charge-03': '6bddff59fc03f7341ab1ebb09f15205de0e630145e4015cbf7fcc14c8adf8044', 'AR-u6-dielectric-connected-charge-04': '82688c953eeb1bce0ff09356a3356d54301feeaf41b9729fc10a4b151de4282f', 'AR-u6-dielectric-connected-charge-05': 'a81ddf314b5d9ab2a69a7e96e7b42d6ec719f467f9a605bc4b5069ef7aec4aba', 'AR-u6-dielectric-connected-charge-06': '8acca7a9d674fe69e5a59c0628523c6630c69a8646044173909a5f7cb16faf59', 'AR-u6-dielectric-connected-charge-07': 'a797f6e2d4a2d23bb97629e07935c0f28f1a14de10df5d7644c103c47d85a26a', 'AR-u6-dielectric-connected-charge-08': 'cb832371cedbf77265154eb54b3c284dae04071d3c53d717177eb801a37fe2c2', 'AR-u6-dielectric-connected-charge-09': 'b91f48b7715a41f9f6af55913f20c6e1bf5471993a8c64e4782a3e2808a5c306', 'AR-u6-dielectric-connected-charge-10': '32c956067cd7ac02cffd6ee9cd2657c9814c9228128e2a202c677d1bb808ba9f', 'AR-u6-dielectric-connected-charge-11': 'fb7d818b1914535ae52eeed6b339984ec66c224ed631e9e43c4eb2e21cda2540', 'AR-u6-dielectric-connected-charge-12': 'f0eddd31eb5863bdf08a32ffc550ab56c7038a5b326ca94e468dc45d0ccac1ca', 'AR-u6-dielectric-connected-charge-13': '8fcd18d3d2f356b932306e626a728725d21cc439d03308dec61fa31f65ae9544', 'AR-u6-dielectric-connected-charge-14': '753e9e8628251e0e4436633a9cefc723d5b31265a1203ec2ffa0f163cf804f76', 'AR-u6-dielectric-connected-charge-15': 'e190965459556e7ca37b1cfa624d1f67c8af2fce0b596c3fc71bf32f077357b2', 'AR-u6-dielectric-connected-charge-16': 'fc4b25a386f853fa7133c67af804bafae500d219f3ba3e4fff2f7cfcebdf86d0'}

READ_SOURCE_SHA256={'u6-dielectric-connected-charge-01': '0ff225287b2d6d51785f73d2253dca581a5de1a24540c5b7578bf29fada9c26c', 'u6-dielectric-connected-charge-02': '98031b0d245089d51959a7d471a8c5dda19a7cad19e2ee9ddb31611e40b30bb7', 'u6-dielectric-connected-charge-03': '849722b11d92cf5d78f115e7bf400c579d8d56af014d5024308b700629207ee6', 'u6-dielectric-connected-charge-04': '8984f82467960b9d9be99e5bf3f80c1647a0be653efc10fd3453e68f79bac545', 'u6-dielectric-connected-charge-05': '5090661afce43502a9b4970616cacb2457bc9ff02f4d477beeb757c981a641f4', 'u6-dielectric-connected-charge-06': 'd749e4dfc9a10c8d53355641b77df87e427eecb25077f9da662b01a90f1aff67', 'u6-dielectric-connected-charge-07': '2859898d83dddd18aa541b989af7bae83de1a54a685daffebbbe8db9a75d6ee3', 'u6-dielectric-connected-charge-08': 'ac42415bf44114130fcfe8e5872426fad1a273c0ab483e460cb17754ee5031ac', 'u6-dielectric-connected-charge-09': 'f70fa745b8192e04df536423020f09126213434bdc36f4af66a5c301e5c0980f', 'u6-dielectric-connected-charge-10': '6e07709f170b415297d12e452ba127a377e941d9c318d3d206660a252022bf6c', 'u6-dielectric-connected-charge-11': '052a181d84fb0afa0b3e27723db368cb92d8c5b489cdb567eb39bf403d4a222c', 'u6-dielectric-connected-charge-12': '62e1a24de68d96389ab381af41acef9beeef74eb33c0e68c4b95a595afbb7f08', 'u6-dielectric-connected-charge-13': '733d6835739ffaaaeee5aa151abb3dbdc0c85c6704c611a5b5daaf3deb198b0c', 'u6-dielectric-connected-charge-14': '941231f13faf39fba1162ef99ef6b10f203d28874d447e59734a12a9f66a66e9', 'u6-dielectric-connected-charge-15': 'c6b2e38d2bea8414ba7824adcfafdaaa85e4706ecc88d34caa48c1424a6aa540', 'u6-dielectric-connected-charge-16': 'ca15cb80f42381397751b045b2543bd817fe954ad92dc530aa1686dd5123a2d1'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-04 B225–229 congelata prima di qualunque candidato. Successiva lettura allowlist di tutti80 prompt finali, poi modelli indipendenti scritti ed eseguiti realmente prima delle chiavi. Solo dopo sono stati letti individualmente tutti16 record finali completi, opzioni, formule, hint, feedback, metadata, XML e nuovo PNG nativo integrale. Nessuna esposizione anticipata a chiavi, nessun modulo autore importato o primaria B aperta. UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'
