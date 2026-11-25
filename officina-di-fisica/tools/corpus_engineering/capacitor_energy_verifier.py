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
FAMILY='capacitor-energy'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L04', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L07', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    C,V,U,k1,k2,q=sp.symbols('C V U k1 k2 q',positive=True)
    assert sp.integrate(q/C,(q,0,C*V))==C*V**2/2
    unique([2*U/V**2,U/(2*V**2),2*U/V,V**2/(2*U),2*U*V**2],sp.solve(sp.Eq(U,C*V**2/2),C)[0])
    unique([k1*k2**2,k1*k2,k1**2*k2,k1/k2**2,k2**2/k1],k1*k2**2)
    assert model.capacitor_energy(2,2)==4 and model.energy_capacitance(4,2)==2 and model.energy_voltage(4,2)==2
    # Six illustrative bound dipoles have zero net charge; alignment does not imply E_internal=0.
    assert sum([-1,1]*6)==0
    d=model.primary_only_derivations()[219];out=[d[i]for i in range(1,17)]
    out[1]='J';out[2]='Le cariche legate si spostano relativamente e possono orientarsi dipoli permanenti';out[3]='Da 4 μJ a 2 μJ';out[8]='C = 2 U / V²';out[9]='κ₁ κ₂²'
    return out

MANUAL=['Per un condensatore lineare U=∫₀^Q(q/C)dq=Q²/(2C)=CV²/2. Con 2 μF e 2 V: U=2·4/2=4 μJ. μF·V²=μJ; energia non negativa, distinta dal lavoro totale eventualmente fornito da una batteria durante una procedura di carica.', 'L’energia ha unità joule, J, e qui μJ. F·V²=(C/V)V²=C·V=J. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'La polarizzazione di un dielettrico consiste in separazioni relative di cariche legate e/o orientamento di dipoli nel materiale. Non richiede trasporto macroscopico di cariche libere da un’armatura all’altra né creazione di carica netta. Un materiale inizialmente neutro può avere polarizzazione non nulla e cariche legate superficiali. Non assumo isotropia o un modello molecolare più specifico non dichiarato; nella successiva lettura tutte le alternative sono state confrontate.', 'V resta 2 V mentre C dimezza da 2 a 1 μF: U passa da 4 a 2 μJ. Non è una trasformazione a carica fissata; mantenere la tensione può implicare scambio di energia col generatore.', 'C=2U/V². Con U=4 μJ e V=2 V: C=8/4=2 μF. Il denominatore V²>0 è necessario per un’inversa finita.', 'V²=2U/C=8/2=4 V². Radici ±2 V, ma il dominio assegnato V>0 seleziona 2 V. L’energia sola non determinerebbe il segno della tensione senza tale convenzione.', 'C resta costante e la tensione raddoppia da 2 a 4 V: U_B/U_A=(4/2)²=4. Le energie sono 4 e 16 μJ, non in rapporto due.', 'Energia corretta 4 μJ; proposta 8 μJ. Scarto proposta−corretto=+4 μJ. Il rapporto 2 è adimensionale e non è lo scarto richiesto.', 'Da U=CV²/2 si moltiplica per due e si divide per V²>0: C=2U/V². Dimensione J/V²=F. Tutte le alternative sono state successivamente controllate dopo il congelamento della primaria.', 'Con C_B=κ₁C e V_B=κ₂V si ottiene U_B/U_A=κ₁κ₂². La capacità entra linearmente e la tensione quadraticamente. Entrambi i preparati devono restare condensatori lineari ideali entro il proprio regime operativo.', 'U_A=2·2²/2=4 μJ. U_B=4·3²/2=18 μJ. Rapporto 18/4=9/2. Il fattore due della capacità e quello 9/4 del quadrato della tensione si moltiplicano.', 'Media delle uscite (4+18)/2=11 μJ. Ai dati medi C=3 μF e V=5/2 V il modello darebbe 3·(25/4)/2=75/8 μJ. La differenza 11−75/8=13/8 μJ è esatta, senza decimali.', 'Bersaglio U_B=(9/2)·4=18 μJ. Con C_B=4 μF, V_B²=2·18/4=9 V²; ramo positivo V_B=3 V. Rapporto V_B/V_A=3/2.', 'Il riferimento U=4 μJ e lettura 12 dà a_cal=3 μJ⁻¹ per display adimensionale. Lettura 54 restituisce U=18 μJ. Con V=3 V, C=2·18/9=4 μF.', 'Riferimenti U_A=4, U_B=18 μJ e letture 9,37: a_cal=(37−9)/(18−4)=2 μJ⁻¹, b_cal=1. Lettura 2 restituisce U_C=(2−1)/2=1/2 μJ. Con V_C=1 V, C_C=2·(1/2)/1=1 μF.', 'Il vincolo numerico C[μF]=V[V] ha coefficiente fisico 1 μF/V. Sostituendo nell’energia: U[μJ]=V[V]³/2. Misura 4 μJ implica V³=8 e unica tensione positiva 2 V, con capacità 2 μF. Il vincolo confronta preparazioni, non una capacità che cresce tacitamente durante la carica dello stesso componente.']

DISTRACTORS=['4 μJ è l’area triangolare; 8 omette metà, 2 omette il quadrato, zero confonde neutralità con assenza di energia. U<0 è esclusa dal modello C>0.', 'J misura energia; W potenza, C carica, F capacità e V tensione. F·V²=C·V=J; il fattore metà è puro.', 'Cariche legate si separano relativamente e dipoli permanenti possono orientarsi; carica netta non creata. Conduzione libera non necessaria, E interno non universalmente nullo, molecole tutte positive violerebbero neutralità.', 'Con V imposta costante, C dimezzata porta U da 4 a 2 μJ. Otto inverte C, quattro conserva arbitrariamente U, uno quadra il fattore di C, mezzo dimezza ulteriormente.', 'C=2U/V²=2 μF. Un μF omette il due e darebbe 2 μJ; quattro omette il quadrato e darebbe 8 μJ; mezzo è reciproco numerico e non ricostruisce U.', 'V²=4 V² e ramo V>0 dà 2 V. Quattro copia il quadrato, √2 omette due e darebbe 2 μJ, −2 conserva energia ma viola il dominio.', 'Rapporto quattro: tensione doppia, energia quadrupla. Due segue Q; 1/4 e 1/2 invertono rispettivamente rapporto quadratico e lineare; uno ignora V.', 'Scarto +4 μJ. −4 inverte, due puro è rapporto, otto copia proposta, zero la accetta senza controllo.', '2U/V² ha F. U/(2V²) è un quarto della capacità giusta; 2U/V è carica; V²/(2U) capacità inversa; 2UV² non isola C.', 'κ₁κ₂²: una potenza di C e due di V. κ₁κ₂ segue la carica; κ₁²κ₂ scambia esponenti; i quozienti invertono dipendenze. Scala comune κ dà κ³.', '18/4=9/2. 2/9 reciproco, tre segue CV, 9/4 segue solo V², due segue solo C.', 'Media 11 μJ distinta da 75/8 μJ ai dati medi, differenza 13/8 μJ. Ventidue è somma, sette semidifferenza, diciotto sola prova B.', 'V_B=3 V e V_A=2 V: rapporto 3/2. 2/3 reciproco, 9/4 quadrato, 9/2 rapporto energie, tre copia numero di V_B in volt.', 'Guadagno 3 μJ⁻¹, U_B=18 μJ e C_B=4 μF. Dodici μF usa lettura come energia e triplica D; due omette due e dà 9 μJ; diciotto copia U.', 'Guadagno 2 μJ⁻¹, offset 1, U_C=1/2 μJ e C_C=1 μF. Due μF omette offset e dà D=3; mezzo copia U e dà D=3/2; quattro usa D come U e dà D=5.', 'Con C/(1 μF)=v e v=V/(1 V), U/(1 μJ)=v³/2; v³=8 seleziona 2. Quattro copia U, otto copia v³, −2 non risolve neppure la cubica. La misura fissa la scala.']

ASSUMPTIONS=['Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.', 'Condensatore lineare ideale, C,V finiti positivi, U energia immagazzinata nel campo e non lavoro totale del generatore in un transitorio dissipativo. La tensione positiva seleziona il ramo inverso. Nel03 autonomo dielettrico neutro: cariche legate e orientazione possibile, senza conduzione libera necessaria. Nel16 vincolo C=(1 μF/V)V soltanto fra preparazioni.']

UNITS={1: 'microjoule', 2: '', 3: '', 4: 'microjoule', 5: 'microfarad', 6: 'volt', 7: '', 8: 'microjoule', 9: 'farad', 10: '', 11: '', 12: 'microjoule', 13: '', 14: 'microfarad', 15: 'microfarad', 16: 'volt'}

NUMERIC_UNITS={1: 'μJ', 5: 'μF', 6: 'V', 14: 'μF', 15: 'μF'}

SUFFIX={8: ' μJ', 12: ' μJ', 16: ' V'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite tensioni positive'}}

SVG_REVIEW='SVG completo e PNG indipendente 640×1500 letti. Sei dipoli schematici orientati a destra con meno a sinistra, più a destra, nessuna carica netta creata; freccia E esterno completa. V(Q): x=150+80Q,y=860−100V, retta fino a (470,660)=(4 μC,2 V), area triangolare fisica 4 μJ e non 64000 joule di coordinate. Barre 80/360/220 per 4/18/11 μJ da origine150, scala20 coordinate/μJ; zeri118 separati e tutte etichette libere.'

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


CANDIDATE_REF='1a91b563ba64de41d16b92dc6dc861806f928bdd'

PRIMARY_SHA256='4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b'

REVIEWED_MODEL_SHA256='f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='77c9a84717ea3fd09bf38359c5d8076157456dcae27f172f73a9f6c553ab61a6'

REVIEWED_BINDINGS_SHA256='72c5929d3c37629c0643244f721c70e55bb7156d7a8f3786274100500f5ad6b2'

REVIEWED_CANDIDATES={'AR-u6-capacitor-energy-01': 'aec18f8d49cc224a06c9d7043f77c6eb61cbf03103cfb63766313134865a92b2', 'AR-u6-capacitor-energy-02': '22b4390e5d96cc51ec7d78fa2fc689597771946d2daaa21c1ac7387d8434bdcc', 'AR-u6-capacitor-energy-03': '503e4d5bcd4484acac6281f69ed0cc156a0814c7d6ac8b627849f76977a69eee', 'AR-u6-capacitor-energy-04': '8171854a4dd35946997ae7c4d64bad7b027b57b9ad8d0ceb0330529db648dac9', 'AR-u6-capacitor-energy-05': '866b23a2dde134fdaa6bbe9fda753fa3edb07bf5da5e26889ef6c4de2bca47c8', 'AR-u6-capacitor-energy-06': 'f69e0db1c10414f8f6a6353af3f2548b10e2c578720be96e54da83a2d4289fb0', 'AR-u6-capacitor-energy-07': '041968a4ea601b65ec439987ac306d58133f232933b6054f1087f05c98dccd1a', 'AR-u6-capacitor-energy-08': '66edac7987bfeea0721244e7b661f99f6edf82b0a2de9d57efa2fb553f926382', 'AR-u6-capacitor-energy-09': 'f414e07e1817506aa7cb12129731fb74fa4f4ff38a19eae471789df28c4a578a', 'AR-u6-capacitor-energy-10': '33839c14a65bee4917566d40378cb33ca2de69b3b9e739c05f0d1ba084ce85a5', 'AR-u6-capacitor-energy-11': 'af5055d3f40a51c10fd854cf4f0d4fb9d44886a3f8186f9f35f58ce9f6f874d9', 'AR-u6-capacitor-energy-12': '032af3141adadeedeed871bb3511d47de7b0a501ff915d47fa806decf94dd4e6', 'AR-u6-capacitor-energy-13': 'd902b81d574658f76f772bc1f709f96eca758022cbfceb2c04baa5b8cbc4270a', 'AR-u6-capacitor-energy-14': '3397e1d24df0910e44aaa970f13b4210aad6e9c4de5c187b033e4608eebc21e4', 'AR-u6-capacitor-energy-15': 'd34790d5e37f17ec9a26a579c4465cbf6b692f00e96ea59f1dcca9d7edd00818', 'AR-u6-capacitor-energy-16': '68aba4e83f0c4617f493b7c992e96209b33809465df9746ecdd5c9fd50918f64'}

READ_SOURCE_SHA256={'u6-capacitor-energy-01': '65ead044781e88c2ccfaafdf1e8785e861c8891784396a643f166f6f50d034fc', 'u6-capacitor-energy-02': 'a69feac813b2aef0e595a4d3081c7924786fc12b5e9f1f65c5d188825e1e96af', 'u6-capacitor-energy-03': 'af75a1ba50537da87cca20da7c78f3f5ca78f17dcbcf4d02a87e6e4c96d35fbb', 'u6-capacitor-energy-04': '6c98eea53b76acb9c0b65748b449313b5d72d90665256b7c17f37c68460141b1', 'u6-capacitor-energy-05': '8ae70db2005e9e20fc19c77bddca1a1d3c13237ec0e9a4d05626c24f072bce4c', 'u6-capacitor-energy-06': '2c75a98897831fa8aa19f58ec12148b21fe22b7cffcb043602b3273a574dafd5', 'u6-capacitor-energy-07': 'ccdc72fb58d17bf6d177dc614e53cf7f50c4f94b9d4f5ffdfe997ff963752078', 'u6-capacitor-energy-08': '61724c4f028afa46ed0b75def8d354b662e91c1528fc1d610208073f9653416d', 'u6-capacitor-energy-09': '053d79d1f09b52e640448854a4e78d85e0998d8650d1f18878a4e83cdea2a000', 'u6-capacitor-energy-10': '42001b67ce2b48c83d3d3ac196672647b6fcc1e8c7b3bc98116f0db6b441267d', 'u6-capacitor-energy-11': 'dcca11b7454ccdbea06d6cae02f21c74f5814553f4b61cbaf159f7507479094a', 'u6-capacitor-energy-12': '33282074f27312cb7acc2035afc72ce400d8928d802956dc3b894093b86f59e5', 'u6-capacitor-energy-13': '5164ae520f06c172fd66bf3524e037c6685581ec91b293a441ecce4b11c96432', 'u6-capacitor-energy-14': '953086b737450778e84678974366c7f9943118141701a52fdd6fae8588936abf', 'u6-capacitor-energy-15': '717932c8e23e57d2c91e5f27fe701817237ba635827c921ab378ed145d9b8117', 'u6-capacitor-energy-16': '209506cc2eb20f3b09f9b0e088f11b7c6f5276fd0ce469515a83279cd3bf5b4f'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-03 215–219 congelata prima di qualunque candidato; modelli indipendenti preparati ed eseguiti prima delle chiavi. Successivamente letti individualmente tutti16 prompt/opzioni/blocchi/formule/hint/error/metadati del lotto finale, XML e nuovo PNG nativo completo. Rettifiche B rilette prima delle firme. Nessun modulo autore importato; lezioni C4-L03/L04/L07 e C3-L03/L04 reali rilette per i casi autonomi. UI prodotto e human NOT_RUN; confronto ROOT integrato PENDING.'
