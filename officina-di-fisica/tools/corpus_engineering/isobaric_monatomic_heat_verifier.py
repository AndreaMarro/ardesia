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
FAMILY='isobaric-monatomic-heat'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILLS={n:'C3-L03' for n in range(1,17)}

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
    g,d,Q,a,b,c=sp.symbols('g d Q a b c',positive=True)
    # Three translational quadratic degrees supply Cv; isobaric boundary work
    # follows p(Vf-Vi)=nR(Tf-Ti), with the same closed sample in one trial.
    cv=3*sp.Rational(1,2)*g
    internal=cv*d;work=g*d;law=sp.expand(internal+work)
    assert sp.simplify(law-sp.Rational(5,2)*g*d)==0
    assert sp.simplify((law-internal)/d-g)==0
    inverse=sp.solve(sp.Eq(Q,law),g)[0]
    interval=sp.solve(sp.Eq(Q,law),d)[0]
    ratio=sp.cancel(law.subs({g:a*g,d:b*d})/law)
    unique([2*Q/(5*d),2*Q/(3*d),Q/d,5*Q/(2*d),Q/(5*d)],inverse)
    unique([a*b,a/b,b/a,a+b,sp.Rational(5,2)*a*b],ratio)
    first=law.subs({g:2,d:10});second=law.subs({g:4,d:20})
    gain,offset=calibrate(first,second,101,401)
    assert first==50 and second==200 and (gain,offset)==(2,1)
    special=internal.subs({g:2,d:2});assert special==6
    assert work.subs({g:2,d:2})==4 and law.subs({g:2,d:2})==10
    positive=sp.solve(sp.Eq(Q,law.subs(g,c*d)),d)[0].subs({Q:50,c:sp.Rational(1,5)})
    assert positive==10 and sp.Rational(5,2)*sp.Rational(1,5)*(-positive)**2==50
    assert (first+second)/2==125 and law.subs({g:3,d:15})==sp.Rational(225,2)
    q=SI.Quantity
    assert (Fraction(5,2)*q(2,'J/K')*q(10,'K')).to('J').magnitude==50
    assert (q(50,'J')/(Fraction(5,2)*q(Fraction(1,5),'J/K**2'))).to('K**2').magnitude==100
    assert SI.Unit('J/mol/K').dimensionality!=SI.Unit('J/K').dimensionality
    return [first,'J',special,'Passa da 50 a 100 J',inverse.subs({Q:50,d:10}),interval.subs({Q:50,g:2}),
      law.subs({g:2,d:20})/first,100-first,'nR = 2Q / (5ΔT)','κ₁ κ₂',second/first,(first+second)/2,
      interval.subs({Q:4*first,g:4})/10,inverse.subs({Q:600/(150/first),d:20}),
      inverse.subs({Q:(201-offset)/gain,d:10}),positive]

MANUAL=['Tre gradi traslazionali classici danno C_V=(3/2)nR. Per isobara lenta pΔV=nRΔT, quindi W=nRΔT e Q=ΔU+W=(5/2)nRΔT. Con nR=2 J/K e ΔT=10 K: ΔU=30 J,W=20 J,Q=50 J.', '(5/2) è puro; (J/K)×K dà J. Le moli sono già comprese in nR e non si moltiplica ancora per n.', 'Domanda speciale su ΔU: C_V=(3/2)(2 J/K)=3 J/K. ΔU=(3 J/K)(2 K)=6 J. Per controllo, W=4 J e Q=10 J. U dipende solo da T nel modello, quindi C_VΔT si usa anche sul percorso isobaro.', 'Campioni distinti nR=2 e 4 J/K, stessa ΔT=10 K: Q_A=50 J, Q_B=100 J. R universale resta uguale; cambia n fra preparazioni, mai durante una singola prova chiusa.', 'nR=2Q/(5ΔT)=100 J/(50 K)=2 J/K. Q/ΔT=5 J/K sarebbe C_p totale, non nR.', 'C_p=(5/2)(2 J/K)=5 J/K. ΔT=50 J/(5 J/K)=10 K. Non si determina T finale senza T iniziale, né si applica un offset alla differenza.', 'A:50 J,B:100 J. Rapporto 100/50=2; il coefficiente cinque mezzi e nR si cancellano.', 'Q corretto 50 J, proposta 100 J. Scarto ordinato 100−50=+50 J, distinto da ΔU e già comprensivo del lavoro di espansione.', 'Dalla legge Q=(5/2)nRΔT si moltiplica per 2/5 e si divide per ΔT>0: nR=2Q/(5ΔT), unità J/K. Tutte le alternative sono confrontate simbolicamente.', 'Sostituzioni nR_B=κ₁nR_A, ΔT_B=κ₂ΔT_A: rapporto κ₁κ₂. Il cinque mezzi compare sopra e sotto e si cancella.', 'Q_A=(5/2)2×10=50 J e Q_B=(5/2)4×20=200 J; rapporto4, prodotto dei due raddoppi.', 'Media(50+200)/2=125 J. Modello agli ingressi medi nR=3 J/K e ΔT=15 K dà (5/2)3×15=225/2 J, inferiore di 25/2 J.', 'Target 4×50=200 J, C_p,B=(5/2)4=10 J/K. ΔT_B=200/10=20 K e rapporto 20/10=2.', 'q=150/(50 J)=3 J⁻¹. S_B=600→Q_B=200 J. nR_B=2×200/(5×20)=4 J/K. Il display non è direttamente un’energia.', 'Riferimenti 50 e 200 J: q=(401−101)/(200−50) J⁻¹=2 J⁻¹,b=1. Q_C=(201−1)/2=100 J. nR_C=2×100/(5×10)=4 J/K, ricostruisce S=201.', 'Vincolo fra preparazioni nR=cΔT con c=(1/5) J/K². Q=(5/2)c(ΔT)²=50 J→(ΔT)²100 K². Radici ±10 K, dominio positivo seleziona 10 K e nR=2 J/K; capacità costanti entro la prova.']
DISTRACTORS=['30 J è ΔU,20 J è W; usare capacità isocora per Q omette il lavoro uscente. Il prodotto nR include già la quantità.', 'J/K capacità totale,K temperatura,W potenza,J/(mol·K) capacità molare. Nessuna durata compare nella legge.', '10 J risponde a Q,4 J a W;0 confonde isobara con isoterma,12 raddoppia ΔU. Il fatto che C_V sia definita a volume costante non vincola il percorso della differenza di U ideale.', '50 J ignora n diverso,25 inverte dipendenza,200 aggiunge un raddoppio di ΔT,0 viola il riscaldamento.', 'Q/ΔT=5 J/K è C_p. Coefficiente tre mezzi tratterebbe Q come variazione interna; non è il dato chiesto.', '25 K usa nR invece di C_p;50/3 K usa C_V e confonde Q con ΔU. Offset Celsius non cambia intervalli.', '1/2 reciproco,4 quadrato,1 nessun cambiamento,−2 incompatibile con entrambi i calori positivi.', '−50 ordine inverso,100 proposta,0 la accetta,25 metà dello scarto.', '2Q/(3ΔT) usa C_V, Q/ΔT dà C_p;5Q/(2ΔT) non inverte 5/2, Q/(5ΔT) perde 2.', 'Quozienti invertono dipendenze; somma dà 2 per prove identiche; residuo 5/2 ignora la cancellazione del coefficiente comune.', '2 considera un solo raddoppio,200 J è uscita B e non rapporto,1/4 inverte A e B.', '250 somma,125/2 metà della media,150 differenza,225/2 uscita sugli ingressi medi. Sono cinque valori esatti distinti.', 'Fattore 4 nell’intervallo con quantità doppia darebbe 8 volte Q_A; fattore 1 soltanto 2 volte Q_A.', '600 trattato come J dà nR=12 J/K; Q_B/ΔT_B=10 J/K è C_p,B, non nR_B.', 'nR=2, 8, 5 J/K ricostruiscono S=101, 401, 251. nR=201/50 J/K omette offset, Q=100,5 J→S=202. Solo 4 J/K ricostruisce 201.', '−10 K rende ΔT e nR negativi;100 è il quadrato;5 K dà 25/2 J,20 K dà 200 J. Vincolo fra campioni non è n(T) durante il percorso.']
ASSUMPTIONS=['Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso. Il caso 03 domanda ΔU, non Q, e fornisce la capacità totale C_V.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso.', 'Campione chiuso di gas ideale monoatomico classico, capacità costanti nell’intervallo; isobara lenta con pistone senza attrito e p interna uguale a p esterna al limite quasi statico. Solo lavoro di frontiera, nessuna variazione macroscopica di energia cinetica/potenziale; nR>0, ΔT>0, temperature assolute positive. n è costante entro una prova; preparazioni distinte possono avere n diverso. c in J/K² collega preparazioni, non una quantità variabile nel tempo entro il campione.']
UNITS={1:'J',2:'J',3:'J',4:'J',5:'J/K',6:'K',7:'',8:'J',9:'J/K',10:'',11:'',12:'J',13:'',14:'J/K',15:'J/K',16:'K'}
NUMERIC_UNITS={1:'J',5:'J/K',6:'K',11:'1',13:'1',14:'J/K'}
SUFFIX={3:' J',8:' J',12:' J',15:' J/K',16:' K'}
CALCULATION_SCOPE={2:'NO_STUDENT_CALCULATION',9:'SYMBOLIC_MANUAL_DERIVATION',10:'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering nativo intero letti. Capacità totali C_V=3 J/K e C_p=5 J/K con nR=2 J/K: barre 150/250 px alla scala 50 px per J/K. Pannello energetico Q=50 J in 400 px, ΔU=30 J in 240 px e W=20 J in 160 px: somma esatta e stessa scala 8 px/J. Caso 03 distinto a ΔT=2 K: Q=10, ΔU=6, W=4 J hanno barre 250/150/100 px a 25 px/J. Non si confrontano lunghezze di pannelli con scale diverse.'

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





CANDIDATE_REF='dfc34fd8b11d7caa2ad82fdbe504091afa936143'
SOURCE_READING='Tutti gli 80 prompt sorgente U5-01 letti integralmente e derivati prima di qualsiasi candidata o chiave B153–157. Primaria persistita a SHA256 d83997999a82d8d5af694a69f3bad9ca41ecb7e3a7557d9dc24938312dde3641; comunicazioni hanno esposto solo commit, file e ipotesi generali, nessun risultato o chiave. Tutti i 16 record finali di questo lotto letti integralmente: prompt, opzioni, blocchi, formule, hint, feedback, metadati e didascalie. XML e rendering SVG intero controllati; lezioni reali C3-L01/L02/L03/L06/L07 rilette. Non importa authoring. Byte package/binding e asset confrontati esattamente con ROOT integrato e pin autore finale. Separati il calore isobaro (5/2)nRΔT e la variazione interna (3/2)nRΔT del caso 03, senza attribuire il percorso isocoro alla differenza di U.'
REVIEWED_PACKAGE_SHA256='79564c9a929233f79b7d0fce1357b0a8e362f66152a66ad01c51af9ea9d2b941'
REVIEWED_BINDINGS_SHA256='85ce7ae6214f038bf254e71067149a7b7c838fb8f80627da46c1da0acd3a7534'
REVIEWED_CANDIDATES={'AR-u5-isobaric-monatomic-heat-01': '0714e202e74d6652ed6288d627d7c16c66f06bf596c501fe1f4e800d662a8f3a', 'AR-u5-isobaric-monatomic-heat-02': '0351fb06312fdd87da23ed9077f8eb1ad390a216013bcbde8a9d43c7beb73e15', 'AR-u5-isobaric-monatomic-heat-03': '315516271be7fb943804e79e4b14a18faa2bfe34fba0e708289fc57cf83281f6', 'AR-u5-isobaric-monatomic-heat-04': '1d9cad2dcd9a1efadaedc6060b1acb435b6852962dd4a08526e41e8e77d0f4b8', 'AR-u5-isobaric-monatomic-heat-05': 'caa839b16cefe2c413f176297e5c4ddd29aeca6d6837145733ec04703725e902', 'AR-u5-isobaric-monatomic-heat-06': 'e688c4dd071d7f478ced8d8f7d9ee95b9b4e5b0c43796a90d12e906612fabd54', 'AR-u5-isobaric-monatomic-heat-07': 'b2b3c4c68852e914cceb7ef614efd23b1bcaa0524fbd76d71919dad112c93bbd', 'AR-u5-isobaric-monatomic-heat-08': 'd0ea34ec464df8c941e615b342a0585e9f43a59cddfa3c706a6762df7f9d2a43', 'AR-u5-isobaric-monatomic-heat-09': 'c8df264283ca1c426dba6478408339a082ffcdc795f4996e752868acd76127c8', 'AR-u5-isobaric-monatomic-heat-10': 'a5306a6ec365e55db826b2e83d76ce1b7181dd551193073c01881ad79bea0790', 'AR-u5-isobaric-monatomic-heat-11': '877e5f550b4d76bc082d3091f96071aaf962d136a1392bfe0aedd978f40f83dd', 'AR-u5-isobaric-monatomic-heat-12': 'e766cd5cda1d8f47efb34f4b9288fa24a36c7628a42025a9e385193300ee0204', 'AR-u5-isobaric-monatomic-heat-13': 'd90fb4961433dff58a077e89bff9131d0e6a4caab4566e599d153d73960b6235', 'AR-u5-isobaric-monatomic-heat-14': 'e57257c55cb9764a517aebed3d559d8e5f96d5e1937eabb7a65a8df8e4f5b4c0', 'AR-u5-isobaric-monatomic-heat-15': 'bb6442fba4e42adcc379b96f72037a7ff85262ac6db07e2b3d8fb12d64ef7660', 'AR-u5-isobaric-monatomic-heat-16': 'e8f07608a461822166c8f6a363fa6dcaf02b7a1b5049f6f39e2b991e0e6ea8db'}
READ_SOURCE_SHA256={'u5-isobaric-monatomic-heat-01': '010b198d514776c05fad7011f40c57e7ada60b24bfc2f114d8ef43041a448f3d', 'u5-isobaric-monatomic-heat-02': 'ddb8cee7cc9de4c343ef27cdb6fec3b8bf76f7cfb10615b16198f7c2445be2d3', 'u5-isobaric-monatomic-heat-03': '7a0a1e84cde4ef0ee795c54233399b992f987c64447c4bc7eee6e61e392bcee9', 'u5-isobaric-monatomic-heat-04': 'f53353e25e732c057eebb01de447f15d21f08396b20d2cdd2363355b0d8349a1', 'u5-isobaric-monatomic-heat-05': '2867a31afef01c852b768e8c6e2249507015683084b96e0718876d1a7af0a2d1', 'u5-isobaric-monatomic-heat-06': '31a27afef2a119844745e078f3d2cda9bd875d8a500f129f7659cd66bf47e334', 'u5-isobaric-monatomic-heat-07': 'fda0aaea6cfd9b0b320b8fbe7028ea3731742bb359fac4e09810f4fa0f5ba6e3', 'u5-isobaric-monatomic-heat-08': '1877c61d979a8e82793e155e855c75bbd51a5a28efaefbf2727195b8e97bde2f', 'u5-isobaric-monatomic-heat-09': '04b4ecd1bbfba0744e214dac8cd50a7d7fdd4a43f7cc15cae5ce4209acfd7604', 'u5-isobaric-monatomic-heat-10': '82f000cb01dc69ca2262e0f3322865bf64aba7473421ac7e98d0f2d5338293c1', 'u5-isobaric-monatomic-heat-11': 'a5c55bdba4e455ab65e462f1ce73c462f4172795a9e75690007b9586fdfdc28a', 'u5-isobaric-monatomic-heat-12': '92008c53d50b472fc6370e2d4971aff5a34dfe541d25ef5000a5e683cf804ba4', 'u5-isobaric-monatomic-heat-13': 'ba9e663ab20d6c5215b02a90c51053fd053fbc7c597e365a608cd36cd7b1b753', 'u5-isobaric-monatomic-heat-14': '122b7799181f9de59e6c2e7d6c0e1cddf2f36c919ab36935ba194006569aad10', 'u5-isobaric-monatomic-heat-15': 'cb2e36259eadfbc7c1c38171c32168abf1beecd99902e27905435a41a68e9711', 'u5-isobaric-monatomic-heat-16': 'a7e130beaa471a0604e28b67774d8ea7fb0c7c67e42696dc5b64aa92ac9e1100'}
