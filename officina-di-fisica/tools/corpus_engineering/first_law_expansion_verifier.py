"""Independent U5-01 heat/work review, never imports candidate authoring."""
from fractions import Fraction
import ast,re
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-01.json'
FAMILY='first-law-expansion'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L06' for n in range(1,17)}

def exact_literal(raw):
    """Bounded arithmetic AST for rational, pi and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=raw.replace('π','p')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\(|p)', '*',raw)
    if not re.fullmatch(r'[0-9rp()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
        if isinstance(node,ast.Name) and node.id=='p':return sp.pi
        if isinstance(node,ast.Constant) and type(node.value) is int and abs(node.value)<=10**9:return sp.Integer(node.value)
        if isinstance(node,ast.Constant) and type(node.value) is float and len(str(node.value))<=16:
            return sp.Rational(str(node.value))
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            value=visit(node.operand);return value if isinstance(node.op,ast.UAdd) else -value
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            value=visit(node.args[0])
            if value.is_Integer and 0<=value<=10**4:return sp.sqrt(value)
        raise ValueError('unsupported arithmetic node')
    value=visit(tree.body)
    if value.is_real is not True or value.is_finite is not True:raise ValueError('nonreal numeric result')
    return value


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
    Q,W,a,b=sp.symbols('Q W a b',positive=True)
    U=sp.symbols('U',real=True)
    law=Q-W;inverse=sp.solve(sp.Eq(U,law),Q)[0];other=sp.solve(sp.Eq(U,law),W)[0]
    ratio=sp.cancel(law.subs({Q:a*Q,W:b*W})/law)
    unique([U+W,U-W,W-U,2*(U+W),(U+W)/2],inverse)
    unique([(a*Q-b*W)/(Q-W),(a*Q+b*W)/(Q-W),a*b,(a*Q-b*W)/(Q+W),(b*Q-a*W)/(Q-W)],ratio)
    first=law.subs({Q:100,W:40});second=law.subs({Q:200,W:60})
    assert (first,second)==(60,140)
    gain,offset=calibrate(first,second,121,281);assert (gain,offset)==(2,1)
    solved=sp.solve(sp.Eq(60,law.subs(Q,sp.Rational(5,2)*W)),W)[0];assert solved==40
    # Positive heat and outgoing work do not impose a positive change in U.
    assert law.subs({Q:40,W:100})==-60 and law.subs({Q:100,W:100})==0
    assert law.subs({Q:150,W:50})==(first+second)/2==100
    q=SI.Quantity
    assert (q(100,'J')-q(40,'J')).to('J').magnitude==60
    assert (q(60,'J')+q(40,'J')).to('J').magnitude==100
    return [first,'J','È energia trasferita a causa di una differenza di temperatura','ΔU passa da 60 a 160 J',inverse.subs({U:60,W:40}),other.subs({Q:100,U:60}),
      law.subs({Q:100,W:60})/first,120-first,'Q = ΔU + W','(κ₁ Q − κ₂ W) / (Q − W)',second/first,(first+second)/2,
      other.subs({Q:200,U:sp.Rational(7,3)*first})/40,inverse.subs({U:420/(180/first),W:60}),
      inverse.subs({U:(321-offset)/gain,W:40}),solved]


MANUAL=['Sistema chiuso: nessuna variazione di energia cinetica/potenziale macroscopica. Q=100 J entra, W=40 J esce come lavoro: ΔU=100−40=60 J.', 'ΔU è una variazione di energia: J, come Q e W. Non è una temperatura o una potenza.', 'Calore significa trasferimento energetico dovuto a differenza di temperatura. U è proprietà di stato, mentre Q caratterizza un processo e non una sostanza o un contenuto immagazzinato.', 'Q da 100 a 200 J, W=40 J invariato: ΔU da 60 a 160 J. Aggiungere100 J a Q aggiunge100 J a ΔU, non raddoppia l’uscita iniziale.', 'Q=ΔU+W=60+40=100 J. La somma è positiva e ricostruisce il bilancio originale.', 'W=Q−ΔU=100−60=40 J. Il ramo di lavoro uscente positivo richiede Q>ΔU.', 'ΔU_A=100−40=60 J, ΔU_B=100−60=40 J: rapporto 40/60=2/3. Maggiore lavoro uscente lascia meno incremento interno.', 'Proposta 120 J meno corretto 60 J=+60 J. Il valore120 non corrisponde a Q+W=140 J, quindi non si attribuisce impropriamente all’addizione.', 'Isolando Q da ΔU=Q−W si ottiene Q=ΔU+W. ΔU può avere entrambi i segni; Q>0 impone solo ΔU+W>0.', 'Rapporto(κ₁Q−κ₂W)/(Q−W), soltanto con Q≠W. Il numeratore può annullarsi o diventare negativo; positività dei trasferimenti non impone segno a ΔU_B.', 'ΔU_A=60 J, ΔU_B=200−60=140 J. Rapporto140/60=7/3, frazione esatta.', 'Media(60+140)/2=100 J. Gli ingressi medi 150 J e 50 J danno150−50=100 J: coincidenza dovuta alla linearità e uguali pesi.', 'Target(7/3)60=140 J, Q_B=200 J. W_B=200−140=60 J; rapporto 60/40=3/2.', 'q=180/(60 J)=3 J⁻¹. S_B=420 dà ΔU_B=140 J. L’inversa Q_B=140+60=200 J ricostruisce il bilancio.', 'Riferimenti ΔU=60 e 140 J: q=(281−121)/(140−60) J⁻¹=2 J⁻¹, b=1. ΔU_C=(321−1)/2=160 J e Q_C=160+40=200 J; ricostruisce S=321.', 'Q=(5/2)W fra prove: ΔU=(3/2)W=60 J. W=(2/3)60=40 J e Q=100 J, unica coppia positiva. Il fattore 5/2 è puro.']
DISTRACTORS=['Sommare Q e W darebbe 140 J e segno errato del lavoro; cambiare ordine darebbe−60 J. Copiare uno scambio ignora l’altro.', 'Joule misura energia; kelvin, pressione, volume e watt misurano altre grandezze. Tutti i termini del primo principio devono avere dimensione energetica.', 'Un corpo non contiene calore come funzione di stato. Temperatura non è energia, lavoro è un modo diverso di trasferimento e un sistema chiuso può ricevere Q.', 'Raddoppiare60 a 120 J trascura cheW resta fisso; confondereQ con ΔU cancella il lavoro. Il confronto esatto è60→160 J.', 'Sottrarre W da ΔU darebbe 20 J, che nel bilancio produrrebbe−20 J e non60. Moltiplicare energie non conserva le dimensioni.', 'Q+ΔU darebbe 160 J anziché40; ΔU−Q cambierebbe segno. Il valore deve ricostruire100−W=60.', '3/2 è il reciproco e anche il rapporto dei lavori; 1 ignora W maggiore e 2 non soddisfa il bilancio. −2/3 viola il segno di entrambe le variazioni positive assegnate.', '−60 inverte l’ordine, 120 copia proposta, 0 la accetta e 30 dimezza ancora lo scarto. La proposta 120 J non si attribuisce a Q+W, che darebbe 140 J.', 'ΔU−W conta il lavoro con segno errato; W−ΔU inverte il segno dell’accumulo. Doppio e metà della somma non ricostruiscono il bilancio, anche se hanno unità energetiche corrette.', 'Il più al numeratore conta come entrante il lavoro uscente; Q+W al denominatore sostituisce la variazione A con una somma. κ₁κ₂ è la legge di un prodotto, non di una differenza; scambiare κ₁ e κ₂ li assegna agli ingressi sbagliati.', '3/7 reciproco; 2 segue soltanto Q,3/2 soltanto W; 140 è un numero di joule, non il rapporto richiesto.', '200 J somma, 50 J dimezza ancora la media, 80 J è la differenza delle uscite. 150 J è soltanto il calore medio, prima del lavoro medio. Linearità giustifica la coincidenza con gli ingressi medi.', '2/3 inverte il rapporto dei lavori; 7/3 copia il target della variazione interna; 2 produrrebbe W_B=80 J e ΔU_B=120 J. 60 è lavoro in joule, non rapporto.', 'S_B usato come joule darebbe Q=480 J, ignorando guadagno; la differenza interna deve essere sommata al lavoro uscente noto.', '160 J è ΔU_C prima di aggiungere W; 100 J ricostruisce S=121 e 400 J S=721. 401/2 J omette offset e ricostruisce S=322 invece di 321; 200 J restituisce321.', '−40 J viola W>0; 60 J copiaΔU e 100 J copiaQ. 24 J divide60 per 5/2 invece che per 3/2, il coefficiente rimasto dopo aver sottratto W.']
ASSUMPTIONS=['Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.', 'Sistema chiuso, Q>0 entrante e W>0 uscente, nessuna variazione di energia cinetica o potenziale macroscopica. Convenzione ΔU=Q−W; ΔU non è supposta positiva in generale. I rapporti delle variazioni richiedono ΔU_A non nulla e le inverse rispettano i segni degli scambi.']
UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'J', 6: 'J', 7: '', 8: 'J', 9: 'J', 10: '', 11: '', 12: 'J', 13: '', 14: 'J', 15: 'J', 16: 'J'}
NUMERIC_UNITS={1: 'J', 5: 'J', 6: 'J', 11: '1', 13: '1', 14: 'J'}
SUFFIX={8: ' J', 12: ' J', 15: ' J', 16: ' J'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo completo letti. Frecce schematiche separate: Q=100 J entra, W=40 J esce; ΔU=60 J è variazione interna e non un terzo flusso. Barre comuni a 5 px/J: Q: 500 px si ripartisce in ΔU: 300 px e W: 200 px. Media del pannello successivo con scala distinta 3 px/J: variazioni 60 e 140 J in 180 e 420 px, media 100 J in 300 px. Somma e linearità corrette, nessuna interpretazione di Q o W come proprietà di stato.'

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





CANDIDATE_REF='9cb96c690be66263fde908457462b50e33b0063e'
SOURCE_READING='Tutti gli 80 prompt sorgente U5-01 B153–157 letti e derivati individualmente prima di aprire candidate o chiavi. Primaria SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641; esposizione preliminare limitata a commit, file e ipotesi generali, nessun risultato o chiave. Letti tutti i 16 record finali completi, ogni alternativa, formula, hint, feedback e didascalia; figura SVG XML e rendering nativo integrale. Lezioni reali C3-L01/L02/L03/L06 rilette, skill primaria C3-L06 pertinente al primo principio. Il caso03 sul concetto di calore resta qualitativo con prova specifica; il caso10 esplicita Q≠W e non impone segno positivo a ΔU_B. ROOT package/binding e asset byte-identici al commit autore finale. Nessun import di authoring, nessun candidato mutato e nessun finding residuo.'
REVIEWED_PACKAGE_SHA256='3a015b5d6450142c1eb48903bf90e49424bb782a94aa63602b65dacf797ab190'
REVIEWED_BINDINGS_SHA256='efce9bfba93d7ca512ccc34537b70df06166b974b2f12906d40385e0a4968fe4'
REVIEWED_CANDIDATES={'AR-u5-first-law-expansion-01': '80a2ac82e66f0a5be5242b1666a77ee5ef3c004eed6a746a2b7e2013e5d22993', 'AR-u5-first-law-expansion-02': '7b0a94a36c3ae32f26ac989badfe49418889fbbc6abd1ab463187edda02e315b', 'AR-u5-first-law-expansion-03': '0117f4b20cee286c99b05eb576ebcb50d2d1f53334c0803a21fc2b3cba84c6ac', 'AR-u5-first-law-expansion-04': 'ab0a27ef1c601555f9a046e5fe49ece69da4b36946ff567dbfdd6123e9b9afb1', 'AR-u5-first-law-expansion-05': 'd915b36c822e51cda2e5133d5d714a78e27fc7d4a09729a34165e335e2efc64b', 'AR-u5-first-law-expansion-06': '3903d0918d6149e0307c7703773e4b8fcd5a06904bd03f027c61063359dc5af4', 'AR-u5-first-law-expansion-07': '31fad53a5e8f98d6e7606bfc35fa4b5925eae28300e3e63aae8d2cf12b935742', 'AR-u5-first-law-expansion-08': 'ee04b08e4f8c90bc2a019a3b7069dbb18dfb0688a887c268566e85580658389e', 'AR-u5-first-law-expansion-09': '2b104f9f67b44bc2fb5673132d68b39dcdfa7c9159b1ea181536b5c5598a64a0', 'AR-u5-first-law-expansion-10': '3f56af4f65b3b5aa5e64f644bc640c3275d489d8ada305395811bb0b35d4963d', 'AR-u5-first-law-expansion-11': 'a952cfd8a9a2f3a7a5533dd6fc6446aaf6c0bcceade41e0c8aa70c386f99facf', 'AR-u5-first-law-expansion-12': 'f78df98d4b5cf5fb0db3819ab344f149391bf7901b8432fc9732c0c4c81e3570', 'AR-u5-first-law-expansion-13': '6a3afbac7af33ae68a640cbe771d0ba6bcaf32d6cc0fed27c229de1e121a3577', 'AR-u5-first-law-expansion-14': '410a08bae415fd2402e05c41250d0aa9fe302321b387f3ebc4b831db7dc11a49', 'AR-u5-first-law-expansion-15': 'c461c08de9128ae2316cf503474b21bf2efc38306e33195fd725b0b0fac6b155', 'AR-u5-first-law-expansion-16': 'e69ebabeaf5e787ad13374970fb8197efe8b0a56fc32537ad931520bfdc095ce'}
READ_SOURCE_SHA256={'u5-first-law-expansion-01': 'b397f3cb53b55bef09f5c57227d7e12da505ff9a3e0e9b402f8eebd8fb89def6', 'u5-first-law-expansion-02': '2059cc6ba326e0abc1ae6c4b7fc4e2e0071ba7a4e8149f35520b9831757686a7', 'u5-first-law-expansion-03': 'df84f2374553159340555f18fb29f5addee2502aa0103aaf0887dc4842629a89', 'u5-first-law-expansion-04': 'da3c69d970855305a68945d408efd5b298aec912f0d9c1f9ae7d3053e9a5d92f', 'u5-first-law-expansion-05': '71b0e9763db5911488b396a770af9e7ad5e35be78cdcd32caed16c9e5935a601', 'u5-first-law-expansion-06': 'c4b47f0da5505ecf9dbbb2ca91d4023845079e8175bd8134c3409319299882d8', 'u5-first-law-expansion-07': '5f4aec9092343cd4453e0b3fb8b8249026dfb509ba48ff2575179b55586cbd25', 'u5-first-law-expansion-08': '68ebd46d780f01349662c67e6ba32b36cccb00d2276be0fc17114edeea707d4e', 'u5-first-law-expansion-09': '3272dbf2de1996a8597eb39b346c4a6b9ee3d8daab43f2f3ab08b7b52b1c14d0', 'u5-first-law-expansion-10': '004931c0fe464dad98ea0f730c050884841556f87e7267c5f270fc7c61a47e23', 'u5-first-law-expansion-11': '3a0b9d36a9439d6b95d22b54bda681bf04139b335296bb7da1297b1948eae92c', 'u5-first-law-expansion-12': 'b6e324367925a1920db2d8d3bb011c4841cad8b63b2e16b655c8558821206915', 'u5-first-law-expansion-13': 'e3242ea5f0295b2c36e7d71f98968bb796e7fc35191e94228876a8de1e0fa596', 'u5-first-law-expansion-14': 'dcc40c66bc5d91224c5bef66358489184e4c092b1baecd43868454cff4633d2b', 'u5-first-law-expansion-15': '11a95985c56f2432ff9e84f4fb476e358deb9e8acff9cfe0ac459f3b57cd5b65', 'u5-first-law-expansion-16': '0a4dbc2b93bbbe58b8d2cd25b2bdfc8d4f9bda01f0090f400cdfe0962bdfea1b'}
