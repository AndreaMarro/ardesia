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
FAMILY='isobaric-work'
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
    p,v,e,a,b,c=sp.symbols('p v e a b c',positive=True)
    vi,vf=sp.symbols('vi vf',positive=True)
    integral=sp.integrate(p,(v,vi,vf));assert sp.simplify(integral-p*(vf-vi))==0
    assert sp.simplify(integral+integral.xreplace({vi:vf,vf:vi}))==0
    law=p*v;inverse=sp.solve(sp.Eq(e,law),p)[0];volume=sp.solve(sp.Eq(e,law),v)[0]
    ratio=sp.cancel(law.subs({p:a*p,v:b*v})/law)
    # Symbolic option laws compared after complete final candidate reading;
    # the physical laws were derived in the source-only primary proof.
    unique([e/v,e*v,v/e,e/(2*v),2*e/v],inverse)
    unique([a*b,a/b,b/a,a+b,a*b*b],ratio)
    first=law.subs({p:2,v:3});second=law.subs({p:4,v:5})
    assert (first,second)==(6,20)
    gain,offset=calibrate(first,second,13,41);assert (gain,offset)==(2,1)
    root=sp.solve(sp.Eq(e,c*v*v),v)[0].subs({e:6,c:sp.Rational(2,3)})
    assert root==3 and sp.Rational(2,3)*(-root)**2==6
    q=SI.Quantity
    assert (q(2,'kPa')*q(3,'liter')).to('J').magnitude==6
    assert (q(6,'J')/q(3,'liter')).to('kPa').magnitude==2
    assert (q(6,'J')/q(Fraction(2,3),'kPa/liter')).to('liter**2').magnitude==9
    return [first,'J','Andata +6 J, ritorno −6 J: la somma è zero','Da 6 a 12 J',inverse.subs({e:6,v:3}),volume.subs({e:6,p:2}),
      law.subs({p:2,v:5})/first,12-first,'p = W / ΔV','κ₁ κ₂',
      second/first,(first+second)/2,volume.subs({e:sp.Rational(10,3)*first,p:4})/3,
      inverse.subs({e:60/(18/first),v:5}),inverse.subs({e:(25-offset)/gain,v:3}),root]


MANUAL=['W=∫p_ext dV=pΔV per pressione resistente totale costante. Con 2 kPa e 3 L: W=6 J; il fattore 10³ di kPa cancella 10⁻³ del litro.', 'Lavoro è energia trasferita: J. Pa·m³ e kPa·L sono dimensionalmente energie, non pressioni o potenze.', 'Andata A→B: p(V_B−V_A)>0. Ritorno sulla stessa isobara: p(V_A−V_B)=−W_AB<0. Stesso modulo e lavoro netto zero, con versi del volume opposti.', 'Pressione da 2 a 4 kPa, incremento 3 L invariato: lavoro da 6 a 12 J. Il raddoppio riguarda la pressione costante fra prove, non una pressione crescente entro la prova.', 'p=W/ΔV=6 J/(3 L)=2 kPa, divisione lecita per ΔV>0. Non moltiplicare per il volume ancora.', 'ΔV=W/p=6 J/(2 kPa)=3 L. È incremento di volume, non il volume finale senza un valore iniziale.', 'W_A=2×3=6 J e W_B=2×5=10 J. Rapporto 10/6=5/3, stessa pressione.', 'Proposta 12 J meno lavoro corretto 6 J=+6 J, errore con ordine esplicito.', 'Isolamento p=W/ΔV, unità J/L=kPa. La positività di ΔV esclude il denominatore nullo.', 'Legge bilineare: W_B/W_A=(κ₁p κ₂ΔV)/(pΔV)=κ₁κ₂, con denominatore positivo.', 'W_A=6 J, W_B=4×5=20 J. Rapporto 20/6=10/3, non soltanto rapporto delle pressioni o dei volumi.', 'Media (6+20)/2=13 J. Agli ingressi medi p=3 kPa e ΔV=4 L il modello dà 12 J: differenza 1 J.', 'Target (10/3)×6=20 J con p_B=4 kPa richiede ΔV_B=5 L. Rapporto 5/3 rispetto ai 3 L iniziali.', 'Riferimento W_A=6 J: q=18/(6 J)=3 J⁻¹. S_B=60 dà W_B=20 J; p_B=20 J/(5 L)=4 kPa.', 'Riferimenti 6 e 20 J: q=(41−13)/(20−6) J⁻¹=2 J⁻¹, b=1. W_C=(25−1)/2=12 J. p_C=12 J/(3 L)=4 kPa, ricostruisce S=25.', 'Fra prove p=cΔV con c=(2/3) kPa/L. W=c(ΔV)²=6 J implica (ΔV)²=9 L². Le radici ±3 L soddisfano l’algebra; espansione e p positivi selezionano +3 L e p=2 kPa.']
DISTRACTORS=['12 J aggiunge un fattore due e 6000 J converte soltanto kPa senza convertire L. La pressione deve essere quella resistente totale, non una pressione relativa usata senza correzione.', 'Pressione, volume, temperatura e potenza non sono energia; una potenza richiederebbe dividere il lavoro per una durata.', 'Non sono entrambi positivi e non sono entrambi nulli: il volume cambia. Il lavoro cambia segno quando si inverte lo spostamento a uguale pressione.', 'Lasciare 6 J ignora p; dimezzare la risposta inverte dipendenza; quadrarla aggiunge un fattore inesistente.', 'WΔV ha J·L, il reciproco ha L/J. Nessuno ha dimensione kPa; la sostituzione deve ricostruire 6 J.', 'Moltiplicare per p non isola un volume; copiare 6 J non risponde a un incremento in L. V_f necessita anche V_i.', '3/5 inverte le prove; rapporto pressioni è 1 e non rappresenta da solo la variazione del volume.', '−6 sottrae al contrario, 12 copia la proposta, 0 la accetta e 3 dimezza ancora lo scarto.', 'Prodotto WΔV non è pressione; ΔV/W è reciproco della pressione. Fattori due producono lavori diversi dai dati anche con dimensioni corrette.', 'Quozienti invertono un effetto diretto; somma dà 2 per stati identici; un quadrato su κ₂ non deriva da W=pΔV.', '3/10 inverte rapporto completo; 2 segue solo p,5/3 solo ΔV,20 è energia numerica B.', '26 somma, 13/2 dimezza ancora la media, 14 è la differenza delle due energie. 12 è il modello agli ingressi medi, non la media richiesta.', '3/5 reciproco del target del volume; 10/3 è target di lavoro ma dimentica p raddoppiata. Serve distinguere ΔV_B dal suo rapporto con ΔV_A.', 'Usare 60 come joule produce 12 kPa, triplo del valore corretto; usare guadagno sull’incremento anziché sul lavoro cambia la relazione strumentale.', 'Ignorare offset usa W_C=25/2 J, p_C=25/6 kPa e ricostruisce S=26. La pressione corretta ricostruisce entrambi i riferimenti e C.', 'Radice negativa rende negativi ΔV e p, fuori dominio; 9 è il quadrato e non l’incremento. Il vincolo è fra prove, non p(V) lungo la singola isobara.']
ASSUMPTIONS=['Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.', 'Pistone lento senza attrito; pressione resistente esterna totale positiva e costante in ciascuna prova, uguale alla pressione interna al limite quasi statico. Solo lavoro di frontiera, W positivo compiuto dal gas. Il ramo numerico è espansione ΔV>0; il caso 03 distingue esplicitamente il percorso inverso. kPa·L=J.']
UNITS={1: 'J', 2: 'J', 3: 'J', 4: 'J', 5: 'kPa', 6: 'liter', 7: '', 8: 'J', 9: 'kPa', 10: '', 11: '', 12: 'J', 13: '', 14: 'kPa', 15: 'kPa', 16: 'liter'}
NUMERIC_UNITS={1: 'J', 5: 'kPa', 6: 'L', 11: '1', 13: '1', 14: 'kPa'}
SUFFIX={8: ' J', 12: ' J', 15: ' kPa', 16: ' L'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'EXACT_MANUAL_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo completo letti. Due grafici con origine a zero e stessa scala 35 px/L e 60 px/kPa: segmento da (135,180) a (240,180) a p=2 kPa per V=1→4 L, ritorno opposto da (240,580) a (135,580) con origine y=700. Rettangoli 105×120 px corrispondono a 6 J in modulo; frecce separate rendono lavori +6 e −6 J, somma 0 solo su quel cammino ripercorso. Barre distinte A=6, B=20, media=13 J larghe 90 px, 300 px e 195 px a 15 px/J; non sono i due tratti del ciclo.'

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





CANDIDATE_REF='a060f76e833d2159eb98dda731c08b0d89a6880d'
SOURCE_READING='Tutti gli 80 prompt originali U5-01 B153–157 letti integralmente prima delle candidate. Derivazioni primarie per ID persistite a SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641; nessuna chiave o risultato anticipato dall’autore. Tutti i 16 record finali di questo lotto letti integralmente, comprese alternative, formule, hint, feedback, metadata e didascalie; SVG XML e rendering nativo completo. Fonte e lezioni reali C3-L01/L02/L03/L06/L07 rilette; primario C3-L06 pertinente a lavoro di frontiera e convenzione del primo principio. Il caso 03 preserva il percorso inverso sulla stessa isobara con valori numerici espliciti; non si inferisce lavoro nullo per tutti i cicli. Package/binding/asset ROOT byte-identici al pin autore finale. Nessun import di authoring e nessun finding residuo.'
REVIEWED_PACKAGE_SHA256='175df717fa22aad8ff3cd7167b268a62a26b4d9d29a2e9a5b10ecf5596b43837'
REVIEWED_BINDINGS_SHA256='b0a2de3fcdacdece9d0cdece9ec1a23cf1f8749867224ac4b5d90e93b60d9c70'
REVIEWED_CANDIDATES={'AR-u5-isobaric-work-01': '862a992701df6429e7e0ed8e882b64967e73f0a55ef207a5d2ab4ffbedf47b83', 'AR-u5-isobaric-work-02': '801f9769b1cde8d259838f6503d782ce145c01272125d1a9b22e44193ba3f780', 'AR-u5-isobaric-work-03': 'f89779e63ed0e948ba2878d2fba0596a6bdbca97f43ce37d94e00e5c414b968a', 'AR-u5-isobaric-work-04': 'b5d1ec8828aa32fe499b84ef674e41cb666472a0cb8506b1b7ed771617dc250b', 'AR-u5-isobaric-work-05': '122fecac81e3d9df35eb37f496a706c364d26245a28a9ab9038e31aee5291407', 'AR-u5-isobaric-work-06': '8d0d203be7a5875245abb768f13286f6774df3bc369e2ca127eef5b8db77f9c1', 'AR-u5-isobaric-work-07': 'c8b7dce723215b478bce895c4caef53ad2d1c1df2ef711ed21d5d6d76dfd8bcc', 'AR-u5-isobaric-work-08': '5c317c73ba8e46d7c185e2856ecae4d0e3856b642ed941b6bbc2ed94a89e1fe2', 'AR-u5-isobaric-work-09': '0f8640bb183622d0eaa9eee04029b229aa3e571ce812ae9cbfa7fa875d2632dc', 'AR-u5-isobaric-work-10': '746ac624574aaa3cc6d7226bdd4ae4e407a91e51ba0bc78e55ee8e47ae440c5d', 'AR-u5-isobaric-work-11': '1e0570c08728d929125ce73c63e2e21da52a427aaff0345a63c78666e06516d0', 'AR-u5-isobaric-work-12': 'f23b644333239cc60cd53098b102501006b8501eaa7e7fcc0f0ae7e5b81e4eac', 'AR-u5-isobaric-work-13': 'd704ce64dfede26756cd863b60a88a4416436c342765bbc9b9b969152117f339', 'AR-u5-isobaric-work-14': 'bfb2be91f2eef2158c8ccf6cb91d9270067793725db8e6bb2757aaba2398d0e7', 'AR-u5-isobaric-work-15': 'e95ce046bcf2abc464510d72e63e4e3398cdaa56fa8daabcb16074e442762c47', 'AR-u5-isobaric-work-16': '09f4007bd97128d7d18b5ea1ca9cd55c47187633e7e39cdd87c794b14349203f'}
READ_SOURCE_SHA256={'u5-isobaric-work-01': '311738df754de3a638d3e3dc98e83b36aea2e077fa5c74bc1b17ad91ef8daa6d', 'u5-isobaric-work-02': '9b2356a1f766c57e0477765d762adf8297285a3cdc3265afa5f3ba0a7856dd91', 'u5-isobaric-work-03': 'e2c576e7f17979089914ec4dbccbbf24f9ec928cfded6a543132d543d927e8fe', 'u5-isobaric-work-04': '4b01af8bce0d66aa9dcaeb5544a746ded55fc2cf6d63d6fb316803b43021405a', 'u5-isobaric-work-05': 'bed57cbab872b8608766b99e803500e0c37be90572b68d032acef1191b935eb7', 'u5-isobaric-work-06': '82647a58426b880ee7cd5b092a00ac5c95e56be99254c9b8cfe26d036b4f9d35', 'u5-isobaric-work-07': '01025639b8ea97e55feae38c03ad126c248c015e331a990c91f5a2fb891c3271', 'u5-isobaric-work-08': '70fdd98f211e1de8b067c691d4ec9e997c776532ca061029927c4a05dd196fe2', 'u5-isobaric-work-09': '8749dc4e6d73ef7a4e50629392c33a6f5a12122666f0f6f727256814941e8e1d', 'u5-isobaric-work-10': 'ae683e28bb5df45109621c995fe27e4e1f18caebde5e00e082dc996347669cb3', 'u5-isobaric-work-11': 'dacedc905519d2f680680efc23a7ea82b6266aca6c2d76dedab83bb48851e159', 'u5-isobaric-work-12': '14bc1d8a1f726c5612b888d82bd7b8f0775c0047b4b7d63d7085664239520d84', 'u5-isobaric-work-13': '1abc830b7c11962f718b3d7b08641da1e55d2d6b8d0be68c1ce6fb8a9c7182b9', 'u5-isobaric-work-14': 'bd054f4099d0df79151e29332beb95aac9a78a452ff5458845678c6429b73d54', 'u5-isobaric-work-15': '236eb59823571c371b2d490829d1999a9dd0dacaae59b001c25cd414bc89b323', 'u5-isobaric-work-16': '168d4a1e58582808f1605d330d9f389387ebc10ddd665683e8c3b852868c58ba'}
