"""Independent U4-01 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U4-01.json'
FAMILY='wave-phase-space'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C5-L02'

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

    d,L,n,a,b=sp.symbols('d L n a b',positive=True)
    # Same-time subtraction removes temporal phase and common initial phase.
    wave_number=2*sp.pi/L
    law=sp.simplify(wave_number*d/(2*sp.pi))
    inv=sp.solve(sp.Eq(n,law),d)[0];invL=sp.solve(sp.Eq(n,law),L)[0]
    ratio=sp.simplify(law.subs({d:a*d,L:b*L})/law)
    unique([d/L,2*sp.pi*d/L,L/d,d*L,d-L],law)
    unique([n*L,L/n,n/L,2*sp.pi*n*L,n*L*L],inv)
    unique([a/b,a*b,b/a,a/b**2,a+b],ratio)
    f=lambda u,v:law.subs({d:u,L:v})
    first,second=f(1,4),f(3,6)
    gain,offset=calibrate(first,second,sp.Rational(3,2),2);assert(gain,offset)==(2,1)
    third=(3-offset)/gain
    assert f(6,4)==sp.Rational(3,2) # full real phase, deliberately beyond one turn
    assert f(2,5)-(first+second)/2==sp.Rational(1,40)
    assert sp.simplify(law.subs(d,L/4))==sp.Rational(1,4)
    q=SI.Quantity
    assert (q(1,'m')/q(4,'m')).to('').magnitude==Fraction(1,4)
    return [first,'numero puro (giri)','ν = Δs / λ','Da 1/4 a 3/2 giri',inv.subs({n:first,L:4}),invL.subs({n:first,d:1}),f(1,1)/first,sp.Rational(1,2)-first,'Δs = ν λ','κ₁ / κ₂',second/first,(first+second)/2,invL.subs({n:2*first,d:3})/4,inv.subs({n:sp.Rational(3,2)/(sp.Rational(3,4)/first),L:6}),inv.subs({n:third,L:2}),'Infinite coppie']

MANUAL=['Δs=1 m, λ=4 m dà ν=1/4 giri e |Δφ|=π/2 rad.', 'fase in giri è adimensionale, ricavata come rapporto di lunghezze; il radiante è pure un’etichetta adimensionale ma il valore numerico cambia per 2π.', 'ν=Δs/λ, non 2πΔs/λ quando l’uscita è in giri.', 'Δs=6 a λ=4 dà ν=3/2 giri, non 1/2 dopo una riduzione non richiesta; da 1/4 è fattore 6.', 'Δs=νλ=(1/4)·4=1 m.', 'λ=Δs/ν=1/(1/4)=4 m.', 'λ=1 a Δs=1 dà ν_B=1, rapporto con 1/4 uguale a 4.', 'e=1/2−1/4=+1/4 giri.', 'Δs=νλ; se dato |Δφ| in radianti, Δs=|Δφ|λ/(2π).', 'rapporto ν_B/ν_A=κ₁/κ₂.', 'Δs_B=3, λ_B=6 dà ν_B=1/2, rapporto 2.', 'media (1/4+1/2)/2=3/8 giri; ingressi medi Δs=2, λ=5 danno 2/5, maggiore per 1/40.', 'target ν_B=1/2 a Δs_B=3 impone λ_B=6 m, rapporto 6/4=3/2.', 'gain (3/4)/(1/4)=3; S_B=3/2 dà ν_B=1/2. λ_B=6 porta Δs_B=3 m.', 'gain (2−3/2)/(1/2−1/4)=2, offset 1. S_C=3 dà ν_C=1; λ_C=2 m porta Δs_C=2 m.', 'Δs=λ/4 rende ν=1/4 per ogni λ>0. La misura è ridondante, infinite coppie positive; non periodicità modulo né scelta di un intero.']
DISTRACTORS=['1/2 richiede 2 m; 4 inverte il rapporto; 1 giro richiede 4 m; 2π è conversione angolare non valore di ν.', 'm, s, Hz, m/s sono dimensioni spaziali o temporali diverse dal rapporto puro. Un giro vale 2π radianti e può essere frazionario.', '2πΔs/λ è fase in radianti; reciproco inverte; prodotto è area e differenza lunghezza.', '1/2 perde il giro intero; 1/24 inverte dipendenza; 6 copia metri e invariata ignora distanza nuova.', 'λ/ν=16 m inverte l’operazione. Con fase non ridotta nota non si aggiungono multipli arbitrari di λ.', '1/4 m moltiplica anziché dividere; λ non è l’ampiezza trasversale.', '1/4 segue λ direttamente; 1 ignora variazione; 2 radice indebita; 16 quadrato indebito.', '−1/4 ordine inverso; 1/2 proposta; 0 accetta; 3/4 somma.', 'λ/ν non isola Δs; ν/λ lunghezza inversa; νλ² area; 2πνλ riconverte indebitamente i giri.', 'Prodotto rende λ diretta; rapporto inverso scambia stati; quadrato aggiunto; somma due per stati identici.', '3 solo separazione, 3/2 solo λ; 1/2 è sia ν_B sia reciproco del rapporto; 6 copia λ_B numerica.', '3/4 somma; 3/16 doppia metà; 1/4 sola A; 2/5 modello agli ingressi medi con differenza 1/40.', '2/3 reciproco, 2 target, 3 solo separazione, 1/2 ignora nuova separazione.', 'S 3/2 interpretato come ν dà 9 m; gain 3 è da rimuovere prima di moltiplicare per λ6 m.', 'A λ2 m, separazioni 1, 3, 4, 6 danno S 2, 4, 5, 7. La misura ν_C 1 non va cancellata modulo un giro.', 'Infinite scale positive soddisfano Δs=λ/4. Le opzioni una o due coppie contano soltanto esempi; l’opzione nessuna coppia è contraddetta da ogni esempio positivo, e la coppia nulla viola il dominio.']
ASSUMPTIONS=['Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.', 'Onda armonica progressiva singola in mezzo omogeneo; confronto simultaneo lungo propagazione, λ e Δs positivi. ν=|Δφ|/(2π) reale non ridotto, non conteggio intero. Nessuna fase iniziale aggiuntiva di sorgenti distinte; stati diversi possono cambiare lunghezze.']
UNITS={1: '', 2: '', 3: '', 4: '', 5: 'm', 6: 'm', 7: '', 8: '', 9: 'm', 10: '', 11: '', 12: '', 13: '', 14: 'm', 15: 'm', 16: ''}
NUMERIC_UNITS={5: 'm', 6: 'm', 14: 'm'}
SUFFIX={1: ' giri', 8: ' giri', 12: ' giri', 15: ' m'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 16: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Profilo coseno illustrativo con creste a 80/400 px, λ320 px=4 m a 80 px/m; punto 160 px a un metro è al passaggio per lo zero, fase 1/4 giro. Segmenti 80/320 px danno rapporto 1/4. Grafico ν contro Δs da(80, 1330) a(560, 1090): 80 px/m e 160 px/giro, punti(1, 1/4), (4, 1), (6, 3/2); nessuna riduzione modulo uno.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u4-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILL:errors.append('Independent real course or primary skill mismatch')
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


CANDIDATE_REF='b0631eac235f0e61d325503f2570baa8c5b6a5c1'
SOURCE_READING='All 80 B135–139 U4-01 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A130–134 and knows oscillator laws from that work; no claim of ignorance of the physics. All 16 final candidate records, options, blocks, hints, feedback, metadata and figure captions read completely, with full SVG XML and native rendering. Never imports authoring. Existing C5-L01/L02/L03/L04/L05 and C1-L003/L005/L006/L008 lessons reread during this U4 work.'
REVIEWED_PACKAGE_SHA256='e885ffae22e0d2f35efcbb9202552f4e5f61596c0e29baf7c53b0f29f1fce1df'
REVIEWED_BINDINGS_SHA256='11e78d07b5124633b0074e70f31fac845b56e53135388da7d219770dd964aaf0'
REVIEWED_CANDIDATES={'AR-u4-wave-phase-space-01': '45314f4d2f02d301bd1ca6b4bea3e3f89b2aebf9798483934905ff50b4fb4d0f', 'AR-u4-wave-phase-space-02': 'b48cba9de2d3c48257dedc9ffa83224da66e535b413b1c6014e7eaad3ff3ab4d', 'AR-u4-wave-phase-space-03': 'f3abea29ee8a5657f5e242c6060b664ca7f718a954646a8ec480b64070edb9b6', 'AR-u4-wave-phase-space-04': '9f406393a0b9ef4c6ce18eb93f90859ac157a85521241489d4af58da42cd6972', 'AR-u4-wave-phase-space-05': '63135e0bebfae99ab80f730e888833d4933919c2aeff849d09d261f69b4dc008', 'AR-u4-wave-phase-space-06': '8c45ec2b0cc58e19a88634b70b4e54c0f0f9b7022337535a99acc5595aefd646', 'AR-u4-wave-phase-space-07': '2fd161e820fdc69703a4eb5d24628bea8e0aa6f359e93087f6a17d8015275e0c', 'AR-u4-wave-phase-space-08': 'f541b2d4d8e7ba514f41d040a4f360b1a59dd9b440a4b4dcee13629d5b8cdab0', 'AR-u4-wave-phase-space-09': '6b85eb8ed3e4fca0dded78565a521861981355e370a560d1a64561b7d4387609', 'AR-u4-wave-phase-space-10': 'd673fb1a68c18200b2642a1d2a11a370255b939e06843bba236a3f31f1db341f', 'AR-u4-wave-phase-space-11': '1e1ea7021e5d0d772ae2ea779c5be6ffc1b6a75984e44d4cc2665020e6ece131', 'AR-u4-wave-phase-space-12': '00bd9a1aaa01d69f91e87e70305512ffa138250df5dfb7112d0f135e1a4e5696', 'AR-u4-wave-phase-space-13': '1578901f823014141b3eb1ab785a58f10595f6cee998f132acac7dbde1476e39', 'AR-u4-wave-phase-space-14': '6f07a25440e9ff670548813479c377d63bb4b08976dc6015fd630478f380f1b6', 'AR-u4-wave-phase-space-15': 'e96558d949beef6630bc5c4c1813ca9d37303084932989fab44ead2443301940', 'AR-u4-wave-phase-space-16': '9e29c3ec3abd2a9f38b75f4e5fcb24592c1bddf3dcb9c2c436c1aec86e6f5d97'}
READ_SOURCE_SHA256={'u4-wave-phase-space-01': 'e1a66aa5bc4bfa392e5f5dd0469680d473771a75837e791823b53c513f8245e1', 'u4-wave-phase-space-02': '3922455e27cf5756c99d6acfb5bc160ee81bbff709502ce315f77831144d6ad7', 'u4-wave-phase-space-03': '41be0787ebfc315ba776925ac1712ecdb31609cb3ed02af64594cba781b42e54', 'u4-wave-phase-space-04': '3c895094339dca18e9e10f30525afd0b6a5fe6d2f4c4702d3dc2c78591558fe1', 'u4-wave-phase-space-05': '3f9f6d50ad4cd3fe8b00ddc7487d8423da441e6a10aed85b640b094df536e3fc', 'u4-wave-phase-space-06': 'f306c42ded9ba36cd7a9cb8685246c6d7c90d3cfd318bf27474778fd57c4cf28', 'u4-wave-phase-space-07': '5c0bc12a0cd97f99ba2b2deb070cae4770e10e3747096146c977c25726338398', 'u4-wave-phase-space-08': 'b4b6effbf0a2bc146981f383a14c12f9cd22f41deaf525155b4bee4e3cd88317', 'u4-wave-phase-space-09': '0c8bad78d55095a27e73ac1fef1705819264f28cffa0d0a2c9a61250b0d4a5ee', 'u4-wave-phase-space-10': 'f3ef90254d23ed9fe1e806f195497d3fad56e1c5b30ee28e555d6d09e8789e93', 'u4-wave-phase-space-11': '3284c1c1ef774bc71a573f168ae63b1e79e8d64d8b839c649f8bf856418198cb', 'u4-wave-phase-space-12': '6fc1196ecc4e620f8bd327568868499fd31ba6c294ab9afc734e76b4921a4776', 'u4-wave-phase-space-13': '58ad8102e49bdd326e0acb44c65634513752b50cd079b1eaa5c490628472ddb8', 'u4-wave-phase-space-14': 'ae41acb97f35ab2e947aa40880d75816e1a85b46e8c41e0327036920790d900d', 'u4-wave-phase-space-15': '36935ef08cb965223173946d0ad1682c1a44e3854e116973ce5c71db1293eb99', 'u4-wave-phase-space-16': '908bc97d68d968cfa3105566f1c9da2e167a59c8faa257d523ec35f3cdfa9e6c'}
