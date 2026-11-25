"""Independent source-first U5-04 thermal and entropy review; no candidate authoring imports."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-04.json'
FAMILY='reversible-isothermal-entropy'
EXPECTED_IDS={f"AR-u5-{FAMILY}-{n:02}" for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L10' for n in range(1,17)}
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



def entropy(heat,temperature):
    heat,temperature=map(sp.sympify,(heat,temperature))
    if heat<=0 or temperature<=0:raise ValueError('Positive reversible heat absorption and absolute temperature required')
    return sp.cancel(heat/temperature)

def heat_inverse(change,temperature):
    change,temperature=map(sp.sympify,(change,temperature))
    if change<=0 or temperature<=0:raise ValueError('Positive entropy transfer and temperature required')
    return change*temperature

@lru_cache(maxsize=1)
def oracle():
    heat,T,S,k1,k2,q=sp.symbols('heat T S k1 k2 q',positive=True)
    law=sp.integrate(1/T,(q,0,heat));assert law==heat/T
    unique([T*S,S/T,T/S,1/(T*S),T+S],sp.solve(sp.Eq(S,law),heat)[0])
    ratio=sp.cancel(law.subs({heat:k1*heat,T:k2*T})/law)
    unique([k1/k2,k1*k2,k2/k1,k1*k1/k2,k1-k2],ratio)
    assert law+(-heat/T)==0 and law>0
    aa,bb=entropy(600,300),entropy(1,1);assert (aa,bb)==(2,1)
    gain,offset=calibrate(aa,bb,5,3);assert (gain,offset)==(2,1)
    assert entropy(sp.Rational(601,2),sp.Rational(301,2))==sp.Rational(601,301)
    beta=sp.symbols('beta',positive=True);assert sp.cancel(law.subs(heat,beta*T))==beta
    Q=SI.Quantity;assert (Q(600,'J')/Q(300,'K')).to('J/K').magnitude==2
    assert heat_inverse(2,300)==600
    return [aa,'J/K','No: il sistema aumenta di Q_rev/T e la sorgente diminuisce dello stesso valore','Da 2 a 4 J/K',heat_inverse(aa,300),sp.Rational(600,1)/aa,entropy(600,600)/aa,4-aa,'Q_rev = T ΔS','κ₁/κ₂',bb/aa,(aa+bb)/2,(sp.Rational(1,1)/(aa/2))/300,heat_inverse(sp.Rational(3,3),1),heat_inverse((9-offset)/gain,300),'Infinite: ogni T>0 con Q_rev=βT']

MANUAL=['La definizione reversibile è ΔS=∫δQ_rev/T. A T costante positiva si ottiene Q_rev/T=600/300=2 J/K, aumento dell’entropia del sistema.', 'Entropia ha unità J/K, dimensione energia per temperatura. J è calore ed energia, non entropia; K è soltanto temperatura. Nessuna lettera scelta senza opzioni. Le alternative candidate sono state poi lette integralmente: unica unità compatibile J/K.', 'Reversibilità significa produzione interna nulla, non entropia del sistema invariata. Con Q_rev>0, ΔS_sistema=Q_rev/T>0; la sorgente reversibile alla stessa temperatura perde −Q_rev/T. La somma universo è zero nel modello completo.', 'A T=300 K, Q da 600 a 1200 J dà ΔS da 2 a 4 J/K. Raddoppia il trasferimento entropico, senza produzione interna nel processo reversibile.', 'Q_rev=TΔS=300 K·2 J/K=600 J. Si usa la temperatura assoluta, non una lettura Celsius.', 'T=Q_rev/ΔS=600/(2 J/K)=300 K. Denominatori non nulli garantiti da Q_rev>0 e ΔS>0.', 'A=600/300=2 J/K; B=600/600=1 J/K. Rapporto 1/2: stessa energia trasferita a temperatura maggiore porta meno entropia.', 'Proposta 4 J/K−corretto 2 J/K=+2 J/K. Lo scarto è distinto dall’entropia prodotta, nulla per ipotesi reversibile.', 'Moltiplicare ΔS=Q_rev/T per T dà Q_rev=TΔS, energia in J e positiva sul ramo assegnato.', 'ΔS_B/ΔS_A=(κ₁Q_rev/(κ₂T))/(Q_rev/T)=κ₁/κ₂, con fattori positivi e temperature assolute.', 'A=2 J/K; B con Q=1 J e T=1 K dà 1 J/K. Rapporto 1/2. Il sistema non è descritto come gas classico: non si applicano capacità termiche non assegnate a 1 K.', 'Media (2+1)/2=3/2 J/K. Il quoziente degli ingressi medi Q=601/2 J e T=301/2 K dà 601/301 J/K, altra operazione.', 'Bersaglio (1/2)·2=1 J/K con Q_B=1 J dà T_B=1 K. Rapporto T_B/T_A=1/300, puro; T_B resta positivo.', 'Da S_A=6 e ΔS_A=2 J/K: a=3 K/J. S_B=3 dà ΔS_B=1 J/K. Con T_B=1 K segue Q_B=1 J.', 'a=(5−3)/(2−1)=2 K/J; b=1. S_C=9 dà ΔS_C=(9−1)/2=4 J/K. T_C=300 K: Q_C=1200 J.', 'Vincolo Q_rev=(2 J/K)T fra processi. Sostituzione dà ΔS=2 J/K per qualunque T>0; la misura non aggiunge equazione indipendente. Infinite coppie, ad esempio (Q=600 J,T=300 K) e (Q=2 J,T=1 K).']

DISTRACTORS=['0 è totale sistema+sorgente;−2 inverte calore;180000 è prodottoJ K;600J è energia.', 'J energia,K temperatura,W potenza,K/J inverso; J/K non identifica da sola entropia e capacità.', 'Produzione zero non impone ΔS individuale zero; sorgente perde quanto sistema riceve.', '1 rende inverso Q;8 introduce quadrato;2 ignora Q;0 confonde totale e sistema.', 'T/ΔS=150 haK²/J;2 e300 copiano numeri senza unità corrette.', '0 confonde T eΔT;1200 è prodotto con unitàJ²/K;reciproco èK⁻¹.', '2 inverte confronto;1 ignora T;1/4 e4 applicano quadrato.', '−2 cambia ordine;4 copia proposta;0 la accetta;2 puro è rapporto e non scartoJ/K.', 'ΔS/T haJ/K²;T/ΔS haK²/J;1/(TΔS) haJ⁻¹;somma è disomogenea.', 'Prodotto rende diretta T;reciproco scambia ingressi;quadrato conta Q due volte;differenza dà0 per prove uguali.', '1/600 segue soloQ;300 segue solo inversaT;2 reciproco;600 inverte rapporto deiQ.', '601/301 usa ingressi medi;3 omette metà;1/2 è metà differenza;2 ignora B.', '300 reciproco;1/600 copia rapportoQ;1/2 bersaglio entropia;2 inverte solo bersaglio.', '3J usa display comeJ/K senza guadagno;300J usa T diA;2J copia ΔS_A.', '1350 ometteb;600 tornaA;900 usa3J/K anziché4;4J copia numero diΔS.', '600J/300K e2J/1K sono due esempi distinti;T=0 escluso;la misura ridondante non limita a due coppie.']

ASSUMPTIONS=['Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. I display ove presenti sono letture continue; guadagno positivo e offset con unità esplicite.', 'Trasformazione ideale reversibile isoterma a T>0 assoluta costante, Q_rev>0 assorbito. Sorgente alla stessa temperatura nel limite reversibile; produzione nulla. Si calcola variazione del sistema, non totale, senza imporre volume o lavoro nulli. A1 K non si assume gas classico né capacità non assegnate. Il vincolo fra preparazioni non è una legge temporale entro la singola prova.']

UNITS={1: 'J/K', 2: 'J/K', 3: 'J/K', 4: 'J/K', 5: 'J', 6: 'K', 7: '', 8: 'J/K', 9: 'J', 10: '', 11: '', 12: 'J/K', 13: '', 14: 'J', 15: 'J', 16: ''}

NUMERIC_UNITS={1: 'J/K', 5: 'J', 6: 'K', 14: 'J'}

SUFFIX={8: ' J/K', 12: ' J/K', 15: ' J'}

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

SVG_REVIEW='XML e PNG nativo integrale letti. Freccia schematica600J da sorgente300K a sistema300K nel limite reversibile. Barre con segno−2 e+2J/K lunghezze200 a origine comunex320; totalezero. Pannello separato di prove del solo sistema2/1/3/2J/K con larghezze240/120/180. Zero centrale sotto l’asse, altre etichette non attraversate. Nessuna identità fra media e totale.'

NON_NUMERIC_DISTRACTORS={8: {'2'}}

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


CANDIDATE_REF='1597d4ac6e806f078da028774ceb3051a8b9e0b6'

SOURCE_READING='Primaria indipendente80 prompt-only U5-04 prima di candidati, opzioni o chiavi: SHA256 004be03cceb688102d1fd50cfb07cf059633b87b608ffc149f19a1a8a4831c95. Shard intero SHA256 dd52bd4155f765395f5cd10f89259dd35a1dab194da5942ee067e73578a1ff16. Poi lettura individuale completa dei16 candidati, ogni opzione/blocco/formula/hint/feedback/metadato/didascalia, confronto con derivazioni e dati finali; cinque SVG XML e rendering QuickLook integrali realmente letti sotto mutex e guardia2GiB. ROOT byte-identico al pin B finale. Lezioni reali C3-L01/L05/L06/L09/L10 rilette; nessun autore importato, nessuna approvazione da chiavi.'

REVIEWED_PACKAGE_SHA256='f539d8c0b347f00b3899272d001bd71d5a736e29e9bd63359c8524c1fa969b4b'

REVIEWED_BINDINGS_SHA256='a4cb613aa1cf58b21952a79fdd518abc8153c9801b35ac0aeae8156ff2f0c019'

REVIEWED_CANDIDATES={'AR-u5-reversible-isothermal-entropy-01': 'db31ac9ed2c73d6c6c2dfd99095352bc569bb0122162db237005e92406233f73', 'AR-u5-reversible-isothermal-entropy-02': 'e3a66b25b7b6daca4728856dfe127be4f76cdd7bf4e39dbc9e677ed6adc577c8', 'AR-u5-reversible-isothermal-entropy-03': '2e2c520947d489b5d534dd237b243538f988a0275f9498636c81807c38bb68ac', 'AR-u5-reversible-isothermal-entropy-04': 'd7db9b871f3285a0d3fefd6eee55447acb8f40ddfa887ed0cfe341d8dce1adf4', 'AR-u5-reversible-isothermal-entropy-05': '94a1b59fc9fbd560e3dea0c44540027f773af1b1fc33a68d1b95b741d5a39d60', 'AR-u5-reversible-isothermal-entropy-06': '63447881585b2c8e414c75c4f437ced1bc2c985e10b0f4a9bb3ca65b63dd7e5b', 'AR-u5-reversible-isothermal-entropy-07': 'b3459413b051e825f77c58b105250884efa3aa3a549c898e8109edb7249827fd', 'AR-u5-reversible-isothermal-entropy-08': '6d6f6e60baf0644b66ff3357cb4aa962db38e304bf7bc364b28f310943177a1d', 'AR-u5-reversible-isothermal-entropy-09': 'eaffca7a852cf31934307440036dd15604257cf477f6ffa58e31e4c024f25396', 'AR-u5-reversible-isothermal-entropy-10': '4c1ba23d1b829125c36fa8648587289926df26cddcf5ce788e01c92d6001c6b3', 'AR-u5-reversible-isothermal-entropy-11': 'f079b778a91cfc3826818aec75de13146f910880087026e7041565fc59c0ea09', 'AR-u5-reversible-isothermal-entropy-12': '906f53f2c69bc1ecef562f2f4a25e18cc52f542cdd0b644f828f4e68d922afee', 'AR-u5-reversible-isothermal-entropy-13': 'a4963b4aada7da83277d5bd5eff928076898099cda2506c74e6eb67b9f51c41a', 'AR-u5-reversible-isothermal-entropy-14': '46d010404ac9a51ccf7aa7d7c1d529e1827cb22c67ccb0e66b12c66319e509b6', 'AR-u5-reversible-isothermal-entropy-15': 'bda5609d1c3b830ebbaa1de9892632b2f860c42f67b7a45f90273594f10d03bf', 'AR-u5-reversible-isothermal-entropy-16': 'b46d0d08c913bb0317db7471ff4f58d76c7883f7bf474d8e1be5e11739d94c48'}

READ_SOURCE_SHA256={'u5-reversible-isothermal-entropy-01': '4596c4df1a4d6d30ff44a27f757a5553808fd3c25549db0b56499cb6cdfdfe20', 'u5-reversible-isothermal-entropy-02': '59f5d412d35a697ec801583cbd69b663561bfc9b6427832384f5163c0890486b', 'u5-reversible-isothermal-entropy-03': 'fc46a2d7ebb4e195e9c5368a11f8fd7028fcc7f85ac5d2df611ec535d1f9c983', 'u5-reversible-isothermal-entropy-04': '74f72852397db084fa9a5629517801b357425cec6747fd19963ad6a703092a3a', 'u5-reversible-isothermal-entropy-05': '20f3030804ede1304953ac31a2df66a2fe351cd4a781ba574b70731bcf29bbe3', 'u5-reversible-isothermal-entropy-06': 'c9f48574ef8147d94d3029c5d594f684d9d8ede7fb16fac4cf6e6f0b5ca55796', 'u5-reversible-isothermal-entropy-07': '2eccd4c572354dad5d9909ab438330193388ff6d5748e5731d6cdf5ae5e069e8', 'u5-reversible-isothermal-entropy-08': '28e8de3b8031f06cfcc2b6cd3ea3ded847e41d71439e70490bcb2d5e36573483', 'u5-reversible-isothermal-entropy-09': 'c330b0a7c77ba7773742a4b77ad5cef4f88b8fa8c9952a2a56738c58332c3089', 'u5-reversible-isothermal-entropy-10': '7aaecd0562a55e5dc430a3f78199d50cbd7876cab2e39fef628eb2dfdfaa5f3f', 'u5-reversible-isothermal-entropy-11': '0be01c5cdc7cb69784c22fa06a7f81ab7cdbfc16dd10e63cc4b025ad5d8e0a72', 'u5-reversible-isothermal-entropy-12': '46859eb79f4a517ce95485e4ee998015a767cd5b3126b24f8d75da030fe2d249', 'u5-reversible-isothermal-entropy-13': 'e30c27139cdda96331273668785cde90a2dfd457b26772d13589a9fdeb3be7cc', 'u5-reversible-isothermal-entropy-14': '3d90c1d19df4195b0aba7e8730bcaa0855a31b3dd3c4724f1fc721a2696d5dde', 'u5-reversible-isothermal-entropy-15': 'ca4473bf8ff3501504e8d18dada758957c6bfec6b0f9b84561151c951212857f', 'u5-reversible-isothermal-entropy-16': '3f32f302ec30a65602e410ef8a76f24ecf68816bfb635f6df1f02d1f19d2fce3'}
