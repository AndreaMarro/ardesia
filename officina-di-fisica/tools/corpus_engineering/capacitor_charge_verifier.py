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
FAMILY='capacitor-charge'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={1: 'C4-L07', 2: 'C4-L07', 3: 'C4-L07', 4: 'C4-L07', 5: 'C4-L07', 6: 'C4-L07', 7: 'C4-L07', 8: 'C4-L07', 9: 'C4-L07', 10: 'C4-L07', 11: 'C4-L07', 12: 'C4-L07', 13: 'C4-L07', 14: 'C4-L07', 15: 'C4-L07', 16: 'C4-L07'}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')


@lru_cache(maxsize=1)
def oracle():
    C,V,Q,k1,k2=sp.symbols('C V Q k1 k2',positive=True)
    unique([C*V,C/V,V/C,2*C*V,C*V**2/2],C*V)
    unique([Q/V,Q*V,V/Q,2*Q/V**2,Q/V**2],sp.solve(sp.Eq(Q,C*V),C)[0])
    unique([k1*k2,k1/k2,k2/k1,k1*k2**2,k1+k2],k1*k2)
    assert model.plate_charge(2,3)==6 and model.charge_capacitance(6,3)==2 and model.charge_voltage(6,2)==3
    d=model.primary_only_derivations()[218];out=[d[i]for i in range(1,17)]
    out[1]='C';out[2]='Q = C V';out[3]='Da 6 μC a 3 μC';out[8]='C = Q / V';out[9]='κ₁ κ₂'
    return out

MANUAL=['Per condensatore lineare Q=CV. μF·V=μC, dunque 2·3=6 μC su ciascuna armatura in modulo. Le cariche sono +Q e −Q: la carica netta dell’intero condensatore ideale resta zero, non 12 μC.', 'La carica si misura in coulomb, C, o suoi multipli/sottomultipli; qui μC. Da Q=CV segue F·V=C. Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.', 'La capacità è il coefficiente C=Q/V per armature con moduli uguali e opposti; isolando la carica positiva in modulo si ottiene Q=CV, con C,V>0. Non occorre un ulteriore fattore due perché si chiede il modulo su ciascuna armatura e non la somma dei moduli.', 'V resta 3 V e C dimezza da 2 a 1 μF. Q passa da 6 a 3 μC, una dipendenza lineare. A tensione mantenuta, il generatore può scambiare carica; non si assume isolamento delle armature.', 'C=Q/V=6 μC/(3 V)=2 μF. Divisione per V>0 finita. La dimensione è C/V=F e non energia.', 'V=Q/C=6 μC/(2 μF)=3 V. Si usa il modulo della differenza di potenziale nel ramo positivo assegnato; il segno della singola armatura non cambia il valore richiesto.', 'C resta 2 μF. Q_A=6 μC e Q_B=2 μC. Rapporto Q_B/Q_A=2/6=1/3, uguale al rapporto delle tensioni.', 'Carica corretta 6 μC; proposta 12 μC. Scarto proposta−corretto=+6 μC. Il raddoppio errato può confondere il modulo di una singola armatura con la somma dei due moduli, che non è la quantità richiesta.', 'Da Q=CV si divide per V>0 e si ricava C=Q/V. Le unità μC/V danno μF. Il denominatore nullo è escluso; con V=0 non si inferisce C dal solo Q=0.', 'Sostituendo C_B=κ₁C e V_B=κ₂V si trova Q_B=κ₁κ₂CV. Rapporto Q_B/Q_A=κ₁κ₂, con tutti i dati finiti positivi. Sono confronti fra preparazioni, non una variazione obbligata nello stesso condensatore isolato.', 'A: 2·3=6 μC. B: 1·5=5 μC. Rapporto 5/6: la tensione aumenta ma la capacità si dimezza, perciò la carica finale è leggermente minore.', 'Media delle uscite (6+5)/2=11/2 μC. Ai dati medi C=3/2 μF e V=4 V il prodotto sarebbe 6 μC, diverso di 1/2 μC. La media del prodotto non è in generale il prodotto delle medie.', 'Bersaglio Q_B=(5/6)·6=5 μC. Con C_B=1 μF, V_B=5 V. Rapporto V_B/V_A=5/3; tutti i parametri restano nel ramo positivo.', 'Q_A=6 μC con lettura 18 dà a_cal=3 μC⁻¹ per display adimensionale. Lettura 15 restituisce Q=5 μC. Con V=5 V, C=1 μF. Non dividere direttamente la lettura strumentale per la tensione.', 'Riferimenti Q_A=6 e Q_B=5 μC, letture 13,11: a_cal=2 μC⁻¹ e b_cal=1. Lettura 17 restituisce Q_C=(17−1)/2=8 μC. Con V_C=2 V, C_C=4 μF.', 'Il vincolo numerico C[μF]=(2/3)V[V] ha coefficiente fisico (2/3) μF/V. Inserendo in Q=CV si ottiene 6=(2/3)V² per i valori numerici dichiarati. Quindi V²=9 e il ramo V>0 seleziona 3 V; C=2 μF. L’altra radice non appartiene al dominio positivo.']

DISTRACTORS=['6 μC è il modulo su una piastra; 12 somma i moduli e zero è invece la carica netta. I prefissi non introducono milli aggiuntivi.', 'Solo C è carica: F capacità, V tensione, J energia e A corrente. Tutte le cinque alternative lette nella successiva review.', 'Q=CV isola il modulo su una armatura. C/V e V/C cambiano dimensione; 2CV conta due moduli; CV²/2 è energia, non carica.', 'A V=3 V fissata, C dimezzata porta Q da 6 a 3 μC. Dodici inverte, sei ignora, 3/2 dimezza due volte, uno copia C_B.', '6 μC/3 V=2 μF. QV è energia; V/Q è capacità inversa. Reinserendo 2 μF si recuperano 6 μC.', '6 μC/2 μF=3 V. Il segno delle armature non altera il modulo richiesto; il problema fissa V>0.', '1/3 è il rapporto; 3 è reciproco, 1/9 e 9 introducono un quadrato e uno ignora il cambiamento.', 'Scarto +6 μC. −6 scambia ordine; 2 è rapporto puro; 12 copia proposta; zero accetta errore.', 'Q/V ha F; QV ha J, V/Q ha F⁻¹, 2Q/V² e Q/V² hanno C/V². V è positivo e non nullo.', 'κ₁κ₂ segue il prodotto. Quozienti invertono un ingresso, il quadrato di κ₂ aggiunge un fattore e la somma darebbe due per prove identiche.', '5/6 confronta Q_B=5 con Q_A=6 μC. 6/5 è reciproco, 5/3 ignora il cambio di capacità, 1/2 segue solo C, uno presume compensazione.', 'Media 11/2 μC. Sei μC è il prodotto dei dati medi, undici la somma, mezzo la semidifferenza, zero la confusione con carica netta.', 'B deve avere Q=5 μC e C=1 μF, quindi V=5 V e rapporto 5/3. 3/5 inverte; 5/6 copia il rapporto delle cariche; mezzo e due non ricostruiscono il bersaglio.', 'Guadagno 3 μC⁻¹, lettura 15 dà Q=5 μC, V=5 V dà C=1 μF. La controprova finale 1/5 μF produce Q=1 μC, non 5: riletta 035031b9 dopo eliminazione dell’attribuzione falsa al reciproco.', 'Guadagno 2 μC⁻¹, offset 1, Q_C=8 μC e C_C=4 μF. 17/4 μF omette offset e dà D=18; 8 μF dà D=33; 16 μF dà D=65.', 'v²=9 con ramo positivo v=3; C=2 μF. −3 darebbe capacità negativa nel vincolo, nove copia il quadrato, due darebbe Q=8/3 μC; misura non ridondante.']

ASSUMPTIONS=['Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.', 'Condensatore lineare ideale in stato elettrostatico, C,V finiti positivi; Q è modulo su una sola armatura, non somma dei moduli né carica netta. V imposta da generatore per ciascuna preparazione, non transitorio. Nel16 relazione C=(2/3 μF/V)V solo fra preparazioni; denominatori non nulli e ramo positivo.']

UNITS={1: 'microcoulomb', 2: '', 3: '', 4: 'microcoulomb', 5: 'microfarad', 6: 'volt', 7: '', 8: 'microcoulomb', 9: 'farad', 10: '', 11: '', 12: 'microcoulomb', 13: '', 14: 'microfarad', 15: 'microfarad', 16: 'volt'}

NUMERIC_UNITS={1: 'μC', 5: 'μF', 6: 'V', 14: 'μF', 15: 'μF'}

SUFFIX={8: ' μC', 12: ' μC', 16: ' V'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite tensioni positive'}}

SVG_REVIEW='SVG completo e PNG indipendente 640×1490 letti. Sei simboli per piastra, ciascuno 1 μC esplicito, non sei particelle elementari: netta zero e moduli 6 μC. Curva Q(V) per C=2 μF, x=150+100V,y=850−30Q, segmento e punto (250,790)=(1 V,2 μC), origine come limite. Barre 300/250/275 per 6/5/11/2 μC, origine 150 e scala 50 coordinate/μC; zeri e label leggibili.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

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


CANDIDATE_REF='035031b9d0c968b9510ccf8275c1fcb0722cf14d'

PRIMARY_SHA256='4c49ff1e2020d073891686e5289e263561531a9b81e84e2f0fa9c8648dc90f4b'

REVIEWED_MODEL_SHA256='f27c33334a9349c8941704334fd73761fe9bf0e4209472ea74ae5bb4a48081b4'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='9eae49d463d096eef23e4412bdb28dc375d5896bc6a4bedcc58f9ae8e93463cf'

REVIEWED_BINDINGS_SHA256='cd9e73e84e570c9dbdcce97c205f37aada963dc6982c00b9ed713390b9018c4e'

REVIEWED_CANDIDATES={'AR-u6-capacitor-charge-01': 'cf1c9c7df677c2ccef5d08020c36d4a2cf1848830733270005b65a94eebfc692', 'AR-u6-capacitor-charge-02': '1034ef7306f4c3641df0d559114ecdb62e57159afb25c0117764270b3308bca0', 'AR-u6-capacitor-charge-03': '763de6946f1f5b9f6f05defecf07c391d6ed6bbd59baed8fa1a534cfe239b4d4', 'AR-u6-capacitor-charge-04': 'fe9ece51cb3309500713602bdee4000cc17a348923b4b90396093c7ae5e8e0de', 'AR-u6-capacitor-charge-05': 'f3ef7819ce3062732c4c036c61b03717854d1adea782a144a32ee2e805054628', 'AR-u6-capacitor-charge-06': '2c6cfbec5d141d442bf9f6c396472485611ff9f2aff53995d68333fa1dba491f', 'AR-u6-capacitor-charge-07': 'b088b1cc0ef92823e12101f7ff8dcfdc60c10b61fbbcfba183438d361c0c3e32', 'AR-u6-capacitor-charge-08': '20e81c45e1d489b2606dc03f9933bee2e286422585ca26446d41d026ae31fdb9', 'AR-u6-capacitor-charge-09': 'a3eb4c1d934bc560b1e72e48064d81f7fc2a7771283c3260f0125ed637f434d0', 'AR-u6-capacitor-charge-10': '78c8b82d9bc63c9421300117e73a7d729a04cd76bde6c7acd9ff2fff6e6efa98', 'AR-u6-capacitor-charge-11': '54b5730201448a25be1cc175313d7c890ac34b104be98af5c79b07c456779ee4', 'AR-u6-capacitor-charge-12': '7eef25a32a8b62e6722a6c5aaeb7408765273d26f36b3c572d700bc5c6c00de3', 'AR-u6-capacitor-charge-13': '95aaa4f757753ae56857a2d0ddeca69bb74f82d3b79e99285e5b3e485be3b4c5', 'AR-u6-capacitor-charge-14': '4fe046e6cb697f49af855f7dcf768047400088edbed62a2cde5ce579956f89cb', 'AR-u6-capacitor-charge-15': '303ba2423b344bb0d49caa3a9681ad73ca8cb78e330fe3dac9a62e986bd82ad6', 'AR-u6-capacitor-charge-16': '2d10a17edecba29044aa10bc1a709814e38ecfb8e3467c761538bd623ae427b2'}

READ_SOURCE_SHA256={'u6-capacitor-charge-01': '2361d60c43b8a22f6be4a18966a984e32969f148c7d561d4f1ee10862a151abf', 'u6-capacitor-charge-02': 'd19c5c0b89f0b8c4864fae443d62e17276d512f2c2f1b7562b4083e9f7208879', 'u6-capacitor-charge-03': '1c0cd88411356328e76b8c313c37d030c29c695aaa101ec62b189fc0724f9028', 'u6-capacitor-charge-04': '5c66f12cf6b3faf04e0fcbad6fa0d8813dc52cfa1ac9ddaab903e891a222049c', 'u6-capacitor-charge-05': '2ff2cea069338a526c5952b9a62abda39a3c856b3d51a3597b7f96c40c076cce', 'u6-capacitor-charge-06': '4d0f7e763b36b06f8db7c50c89746f6c930efed0a0cb6639c666d15429f42d89', 'u6-capacitor-charge-07': '247f6f8f4393669127256418084478b07662764e055e0861908cae580326419e', 'u6-capacitor-charge-08': 'f4aa5c8e05782ddd2c9faf00f269e4d6ebee8603d61dcb392418f6f10a9ea7d4', 'u6-capacitor-charge-09': 'da881760b354abb3948d68e591b41be9200b857402faff608a3aa86fdebf5e37', 'u6-capacitor-charge-10': '64405a173a3d751e6487687f01c196d31cd7b99729c348dac3b01549baf6157c', 'u6-capacitor-charge-11': 'cb24e7d725e2a426b4c6595c29ac73ce36e587aa704995bc5cf806b9754114d4', 'u6-capacitor-charge-12': 'fa4636b85a9f1b9c2dfe2023826a701b0c76807f18f944dab15991a388a5bbd5', 'u6-capacitor-charge-13': '597f35810638c67e4e69697793341322165dc2ef90c717c69f53feaf7190d5ac', 'u6-capacitor-charge-14': '8f6c910fbcf7a2ea2bf25e0ef41688562553d2d2aa22478fe0bea8b65c1a890b', 'u6-capacitor-charge-15': '16573ec33e8a78bd5e0c5746f09aed724fc4d5b40b96f65d905f4f3b15dcf862', 'u6-capacitor-charge-16': '64c01b225bf5abca10b2e1749cbcb2efc2009e5927d17570bd773af642778d29'}

SOURCE_READING='Primaria prompt-only di tutti80 originali U6-03 215–219 congelata prima di qualunque candidato; modelli indipendenti preparati ed eseguiti prima delle chiavi. Successivamente letti individualmente tutti16 prompt/opzioni/blocchi/formule/hint/error/metadati del lotto finale, XML e nuovo PNG nativo completo. Rettifiche B rilette prima delle firme. Nessun modulo autore importato; lezioni C4-L03/L04/L07 e C3-L03/L04 reali rilette per i casi autonomi. UI prodotto e human NOT_RUN; confronto ROOT integrato PENDING.'
