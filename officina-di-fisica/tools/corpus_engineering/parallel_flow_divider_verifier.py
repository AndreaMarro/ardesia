"""Independent U3-04 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-04.json'
FAMILY='parallel-flow-divider'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L009'

def exact_literal(raw):
    """Bounded arithmetic AST for rational and integer-radical numeric choices."""
    if len(raw)>60:raise ValueError('literal too long')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\()', '*',raw)
    if not re.fullmatch(r'[0-9r()+*/. \-]+',raw):raise ValueError('unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('numeric literal too complex')
    def visit(node):
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

    T,R,S,q1,q2,p,k,l=sp.symbols('T R S q1 q2 p k l',positive=True)
    solved=sp.solve([sp.Eq(q1+q2,T),sp.Eq(R*q1,p),sp.Eq(S*q2,p)],(q1,q2,p),dict=True)[0]
    law=solved[q1]
    inv=sp.solve(sp.Eq(q1,law),R)[0]
    inv2=sp.solve(sp.Eq(q1,law),S)[0]
    ratio=sp.simplify(law.subs({R:k*R,S:l*S})/law)
    unique([T*S/(R+S),T*R/(R+S),T*(R+S)/S,T*S/R,T/(R+S)],law)
    unique([S*(T-q1)/q1,S*q1/(T-q1),q1/S,S*T/q1,S*(T-q1)],inv)
    unique([l*(R+S)/(k*R+l*S),k*(R+S)/(k*R+l*S),l*(k*R+l*S)/(R+S),k/l,(k*R+l*S)/(l*(R+S))],ratio)
    f=lambda a,b:law.subs({T:10,R:a,S:b})
    first,second=f(1,1),f(2,3)
    gain,offset=calibrate(first,second,11,13)
    C=(6-offset)/gain
    if (gain,offset,C)!=(2,1,sp.Rational(5,2)):raise ValueError('Independent affine divider calibration failed')
    if sp.simplify(f(sp.Rational(3,2),2)-(first+second)/2)!=sp.Rational(3,14):raise ValueError('Independent nonlinear divider mean failed')
    if sp.simplify(law.subs(S,R)-T/2)!=0 or sp.simplify(sp.diff(law.subs(S,R),R))!=0:raise ValueError('Independent scale nonidentifiability failed')
    u=SI.Quantity
    if (u(1,'kPa*s/L')*u(5,'L/s')).to('kPa').magnitude!=5:raise ValueError('Independent flow resistance units failed')
    if (u(10,'L/s')).to('m**3/s').magnitude!=Fraction(1,100):raise ValueError('Independent litre conversion failed')
    return [first,'L/s','Q₁ = Q_T R₂ / (R₁ + R₂)','Da 5 a 5/2 L/s',inv.subs({T:10,S:1,q1:5}),inv2.subs({T:10,R:1,q1:5}),f(1,3)/first,10-first,'R₁ = R₂ (Q_T − Q₁) / Q₁','κ₂ U / D',second/first,(first+second)/2,inv2.subs({T:10,R:2,q1:6}),inv.subs({T:10,S:3,q1:6}),inv.subs({T:10,S:1,q1:C}),'Infinite']

MANUAL=['Continuità Q₁+Q₂=10 e cadute R₁Q₁=R₂Q₂. Con R₁=R₂=1, Q₁=Q₂=5 L/s e Δp=5 kPa.', 'Portata volumetrica: [Q]=L³/T. kPa/(kPa·s/L)=L/s, con 1 L/s=10⁻³ m³/s. Nessun calcolo numerico autonomo richiesto.', 'Eliminare Q₂=Q_T −Q₁: R₁Q₁=R₂(Q_T −Q₁), dunque (R₁+R₂)Q₁=R₂Q_T e Q₁=Q_T R₂/(R₁+R₂).', 'R₁ da 1 a 3, R₂=1: Q₁ da 10/2=5 a 10/4=5/2 L/s. Q₂=15/2 e Δp=15/2 kPa; la pompa varia la pressione.', 'Q₂=10−5=5 L/s. R₂Q₂=5 kPa, diviso Q₁=5 L/s restituisce R₁=1 kPa·s/L. Inversa R₁=R₂(Q_T −Q₁)/Q₁.', 'Da Q₁=5 e R₁=1 segue Δp=5 kPa. Q₂=5 L/s, quindi R₂=Δp/Q₂=1 kPa·s/L.', 'R₁=1, R₂=3: Q₁=30/4=15/2 L/s. Rapporto con 5: (15/2)/5=3/2.', 'Riferimento Q₁=5 L/s. Scarto proposto meno corretto 10−5=+5 L/s. Proposta imporrebbe Q₂=0 e cadute discordanti 10 e 0 kPa.', 'Da R₁Q₁=R₂(Q_T −Q₁), dividere per Q₁>0: R₁=R₂(Q_T −Q₁)/Q₁. La differenza deve essere positiva per il secondo ramo.', 'B ha numeratore κ₂R₂ e denominatore D=κ₁R₁+κ₂R₂; A ha U=R₁+R₂. Rapporto κ₂U/D, uguale a uno se κ₁=κ₂.', 'B: Q₁=10·3/(2+3)=6 L/s, Q₂=4. Cadute 2·6=3·4=12 kPa. Rapporto 6/5.', 'Media (5+6)/2=11/2 L/s. Ingressi medi R₁=3/2, R₂=2 danno 40/7 L/s; 40/7−11/2=(80−77)/14=3/14 L/s.', 'Target Q₁=6, Q₂=4 L/s. A R₁, B=2, Δp=12 kPa; R₂, B=12/4=3 kPa·s/L, rapporto rispetto a 1 uguale a 3.', 'Riferimento Q₁=5 e S=15: q=3 s/L. S_B=18 dà Q₁=6, Q₂=4. R₂=3 produce Δp=12 e R₁=12/6=2 kPa·s/L.', 'Riferimenti Q₁=5,6 e S=11,13: q=2 s/L, z=1. S_C=6 dà Q₁=5/2, Q₂=15/2; R₂=1 implica R₁=3 kPa·s/L.', 'Con R₁=R₂=R>0, Q₁=10 R/(2 R)=5 L/s per ogni R. (1,1) e (2,2) sono esempi di infinite coppie, con Δp=5 e 10 kPa; scala non identificata.']
DISTRACTORS=['10 nel solo ramo viola uguaglianza delle cadute e lascia Q₂=0 con resistenza finita; 1 copia la resistenza.', 'kPa pressione; kPa·s/L resistenza; s/L portata inversa; L volume senza tempo.', 'R₁ al numeratore calcola Q₂; somma sopra manca normalizzazione; Q_T/R ha dimensione errata.', '15 supera il totale; 5/3 manterrebbe Δp iniziale fisso; 5 ignora la modifica; zero richiede chiusura limite.', '5 copia Q₁ come resistenza; non si divide Δp per la portata totale per ricostruire un singolo ramo.', 'Usare Q_T al denominatore darebbe 1/2 kPa·s/L, equivalente esterna e non R₂.', '2/3 reciproco; 3 ignora nuova somma; 1/2 scambia l’effetto dei rami; 1 ignora la modifica.', '−5 ordine inverso; 10 proposta; 0 accetta proposta; 5/2 dimezza lo scarto.', 'Rapporto inverso scambia i rami; Q₁/R₂ dimensione errata; omettere −Q₁ perde il secondo ramo; senza Q₁ resta pressione.', 'κ₁ al numeratore segue il ramo sbagliato; D/U rovescia la somma; κ₁/κ₂ omette pesi; ultima reciproca.', '5/6 reciproco; 3/2 e 2/3 seguono singoli fattori; 6 è portata numerica e non rapporto.', '11 somma; 11/4 doppia metà; 40/7 modello agli ingressi medi; 1 differenza.', '1/3 reciproco; 6/5 copia target; R₂=2 dà Q₁=5; R₂=3/2 dà Q₁=30/7.', '18 grezzo supera Q_T e non è portata fisica; prima togliere q, poi imporre positività di entrambe le portate.', 'A R₂=1, R₁=1,2,4,6 generano S=11,23/3,5,27/7; solo 3 dà 6.', 'Una e due confondono esempi con cardinalità; nessuna è falsa per R=1; coppia nulla fuori dominio. Una pressione aggiuntiva fisserebbe R.']
ASSUMPTIONS=['Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.', 'Pompa a portata totale imposta 10 L/s, pressione adattabile fra prove. Due rami lineari positivi fra gli stessi nodi, stessa quota, regime stazionario incomprimibile senza accumulo o percorsi aggiuntivi. Valori costanti entro ciascuna prova; 0<Q₁<Q_T.']
UNITS={1: 'L/s', 2: 'L/s', 3: 'L/s', 4: 'L/s', 5: 'kPa*s/L', 6: 'kPa*s/L', 7: '', 8: 'L/s', 9: 'kPa*s/L', 10: '', 11: '', 12: 'L/s', 13: '', 14: 'kPa*s/L', 15: 'kPa*s/L', 16: ''}
NUMERIC_UNITS={1: 'L/s', 5: 'kPa·s/L', 6: 'kPa·s/L', 14: 'kPa·s/L'}
SUFFIX={8: ' L/s', 12: ' L/s', 15: ' kPa·s/L'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Tre reti schematiche con rami a stesso salto nella prova, non stessa pressione a monte e valle. Frecce singole separate: scala 20 px/(L/s), ingresso 200 px per 10, iniziali 100+100 px per 5+5. Con R₁=3, R₂=1 frecce 50/150 px per 5/2 e 15/2; Δp=15/2 kPa. Barre finali 100+100 e 120+80=200 px per le prove A e B, pressioni 5/12 kPa. Nessuna lettura della resistenza come lunghezza.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u3-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C2' or row.get('skill')!=REVIEWED_SKILL:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=str(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=exact_literal(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
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


CANDIDATE_REF='b27a2ca4dfb6bbf951e5b35cd99a3ab9dd6899f2'
SOURCE_READING='All80 original U3-04 prompts in B112–116 individually read from pinned Git source and derivations persisted before candidate packages were opened. Disclosure: initial author handoff exposed total10 L/s,112-12 means11/2 and40/7,112-16 free common resistance scale and SVG20 px/(L/s) with200=100+100 and200=50+150. Those scales imply112-01 flows5+5 and112-04 flows5/2+15/2. All rederived independently from original conservation equations before opening candidate packages; no wholly blind claim for112-01/04/12/16. All16 final candidates, every option, formula, hint, feedback and figure caption read in full; scientific SVG XML and full native rendering read. Never imports candidate authoring. Real C2-L005/L006/L007/L008/L009 lessons reread during this U3-04 work.'
REVIEWED_PACKAGE_SHA256='28ff37487c5194b02e01e77bf0a480da198b00af574b76d59f773bb3ac356310'
REVIEWED_BINDINGS_SHA256='aa47799aa855d2081c9cb6cf7c70864f15cfedaa97432681bf32c0d243d0653f'
REVIEWED_CANDIDATES={'AR-u3-parallel-flow-divider-01': '9435b19052dfbbee69a40607fba96a0f2e487c50244198640ca865c4823d9b12', 'AR-u3-parallel-flow-divider-02': 'c0051fe19abe5581bc354260ab38296bddc2a66e064c89f4ef008c7ec5d41284', 'AR-u3-parallel-flow-divider-03': '728d8745d810ab8f6968691a40e9eedb5179d7687939ee9d595557260ed0780b', 'AR-u3-parallel-flow-divider-04': '33fe232ceaa903b45e5b28c716fa0e4283e5c8b4e6234c2460f23445780d2569', 'AR-u3-parallel-flow-divider-05': '7bfcccc86a5d1a26bc6d64fee7ca93dd7292e84907e79e4b157af17d48ba290f', 'AR-u3-parallel-flow-divider-06': '7d7154379b8399f05232feec12a655bac8032c14a7cf63a46ce866983b49fd0e', 'AR-u3-parallel-flow-divider-07': '8b040df79bf4dfef8c590d66c3e629c02487182916df893be0f266b69ecc9d47', 'AR-u3-parallel-flow-divider-08': 'e299796505aee6e3d242740b20668d390901839e0de35d5943370bb637615218', 'AR-u3-parallel-flow-divider-09': '482265dad37fa4770cb0a81f8d8989a06de2210d4f17f07aa695e15f4044c0e0', 'AR-u3-parallel-flow-divider-10': '99d86057d8f19e28e602bbd91c545f152a93a4d14836337707497cc9b34bff73', 'AR-u3-parallel-flow-divider-11': 'c8a185f3f868fc273511a11860339240037d662b3bd124831c0fd594af47eff7', 'AR-u3-parallel-flow-divider-12': '2c585c12a4449acf2b2ee0eb3d934f4ca515f1e45ef8ca7f2c6b6f7d0c477244', 'AR-u3-parallel-flow-divider-13': '6f2c054477331ab77676db34da9bc3751811bb9006f1c5398c04fadb1c0f4658', 'AR-u3-parallel-flow-divider-14': 'fd976795dabbd66b7f9d21641dad58193599df9ce08edb98b06030f63034c502', 'AR-u3-parallel-flow-divider-15': '539d10cbc2257a4e86b39ea468b46b072e143ded2b1fcedd90329f4300e86098', 'AR-u3-parallel-flow-divider-16': '55a3900d2b0cb754177cf3fec1e32bda2c2753f1449d804258e9528abf0e1316'}
READ_SOURCE_SHA256={'u3-parallel-flow-divider-01': 'd4c5d4942366f095fce0b1acd74a40e64b8651cdcd7806ed291cafc777bee420', 'u3-parallel-flow-divider-02': 'e08a4a2c9ab286beab7afbd1da03da8cf20ef9fe391c95454e535bd9e37edf4a', 'u3-parallel-flow-divider-03': 'a7332ac75f1da479c5cb0a52d77936fcf10bd4795924076e4291b2aaa45aecc9', 'u3-parallel-flow-divider-04': '648c9e252f0f5d86e09bcdd0db4c53d8261290875eca6a4be8c71fb570bf27e6', 'u3-parallel-flow-divider-05': '539dc7baffaa3bd05b59f2b22cb529869684ccd033b80dff9eebc2e6eddc9968', 'u3-parallel-flow-divider-06': 'f9224992139970765e5f75b93c3fbd727ef9ee1d646f35ca5925cfcb103cb309', 'u3-parallel-flow-divider-07': '41c87a4cc378ef188c034a4177940a756a9c043d881963186d49f139c4ffd269', 'u3-parallel-flow-divider-08': '597a33aed15edfc76acfa661574a94ff3dd3943d9a86e96670e951450fed163f', 'u3-parallel-flow-divider-09': '4c490dd2b1beeefd0ab8af68d6b0697df878513b2889932c2ea070d197f43c77', 'u3-parallel-flow-divider-10': '33f5513e8c46c934c2a89aed35b066234c3d72cac3f293d87c3bfaa451d191a7', 'u3-parallel-flow-divider-11': 'e1734659ca65537a58e4d1adb0eab3900495ca0685967893290f7eaf0d7b2e06', 'u3-parallel-flow-divider-12': '57c76c5efbe570a536229afd4659410daa2c98cd08a436643689ad212d835639', 'u3-parallel-flow-divider-13': 'ddbf4be6254cc550aff2b3d963a7a8ebc831a7227f2a7814f58ed4f0e15271d5', 'u3-parallel-flow-divider-14': '08e8786a4587e62ff5a82cb711595ee339b8dad5fcca715d6c3b586b5ad239f2', 'u3-parallel-flow-divider-15': 'ffb90902b88c83887ba29e3d90d80ecbe2ac3ed32a0c08ff14604822f3e25ac4', 'u3-parallel-flow-divider-16': 'b35640d4dfa95e0c3e6fb8070c6b73ae8da22f475cc5407acc34c2fd67f078bf'}
