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
FAMILY='wave-phase-time'
EXPECTED_IDS={f'AR-u4-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C5-L01'

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

    frequency,t,N,a,b=sp.symbols('frequency t N a b',positive=True)
    # Unwrapped magnitude at a fixed sensor, not motion of a crest.
    law=sp.simplify(2*sp.pi*frequency*t/(2*sp.pi))
    inv=sp.solve(sp.Eq(N,law),frequency)[0];invt=sp.solve(sp.Eq(N,law),t)[0]
    ratio=sp.simplify(law.subs({frequency:a*frequency,t:b*t})/law)
    unique([N/t,N*t,t/N,2*sp.pi*N/t,N/t**2],inv)
    unique([a*b,a/b,b/a,a*b*b,a+b],ratio)
    f=lambda u,v:law.subs({frequency:u,t:v})
    first,second=f(2,3),f(4,2)
    gain,offset=calibrate(first,second,13,17);assert(gain,offset)==(2,1)
    third=(25-offset)/gain
    assert f(3,sp.Rational(5,2))-(first+second)/2==sp.Rational(1,2)
    assert f(2,sp.Rational(3,4))==sp.Rational(3,2)
    c=sp.Symbol('c',positive=True)
    positive=sp.solve(sp.Eq(law.subs(frequency,c*t).subs(c,sp.Rational(2,3)),6),t)
    assert positive==[3]
    q=SI.Quantity
    assert (q(2,'Hz')*q(3,'s')).to('').magnitude==6
    assert (1/q(Fraction(2,5),'s')).to('Hz').magnitude==Fraction(5,2)
    return [first,'numero puro (giri)',1/sp.Rational(2,5),'Da 6 a 3 giri',inv.subs({N:first,t:3}),invt.subs({N:first,frequency:2}),f(2,1)/first,12-first,'f = N / Δt','κ₁ κ₂',second/first,(first+second)/2,invt.subs({N:sp.Rational(4,3)*first,frequency:4})/3,inv.subs({N:24/(18/first),t:2}),inv.subs({N:third,t:4}),positive[0]]

MANUAL=['f=2 Hz, Δt=3 s: N=6 giri.', 'N è puro, etichettato in giri; Hz·s=1.', 'T=2/5 s dà f=1/T=5/2 Hz, senza approssimazioni.', 'f da 2 a 1 a Δt=3 dà N da 6 a 3 giri.', 'f=N/Δt=6/3=2 Hz.', 'Δt=N/f=6/2=3 s.', 'Δt_B=1 a f=2 dà N_B=2; rapporto 2/6=1/3.', 'e=12−6=+6 giri.', 'f=N/Δt; nessun 2π aggiunto dopo aver convertito la fase in giri.', 'rapporto κ₁κ₂.', 'B con f=4, Δt=2 dà N_B=8, rapporto 4/3.', 'media (6+8)/2=7 giri. Ingressi medi f=3, Δt=5/2 danno 15/2, maggiore per 1/2.', 'target N_B=8 a f_B=4 richiede Δt_B=2 s; rapporto con 3 s pari a 2/3.', 'gain 18/6=3; S_B=24 dà N_B=8, Δt_B=2 porta f_B=4 Hz.', 'gain (17−13)/(8−6)=2, offset 1. S_C=25 dà N_C=12, Δt_C=4 porta f_C=3 Hz.', 'f=cΔt con c=2/3 s⁻² rende N=c(Δt)². Dato N=6, (Δt)²=9 s² e Δt=3 s positiva, f=2 Hz. Vincolo fra prove, non frequenza variabile nel tempo della stessa prova.']
DISTRACTORS=['3 copia tempo; 2/3 divide; 12 raddoppia; 1/6 reciproco. La fase accumulata non è spazio percorso.', 'Hz frequenza, s durata, m lunghezza, m/s velocità. Il prodotto Hz·s è puro senza obbligo di integralità.', '2/5 copia T, 5 dimezza T prima di invertire, 2 copia numeratore, 5/4 usa periodo doppio. Il dato richiede stessa configurazione e verso.', '12 inverte effetto; 3/2 dimezza due volte; 6 ignora variazione; 0 fuori f, t>0.', '18 moltiplica; zero è fase residua modulo uno e perde i sei giri accumulati.', '1/2 s solo un periodo; 12 moltiplica per frequenza anziché dividere.', '3 reciproco; 2 N_B; 1 ignora durata; 1/9 potenza quadratica non presente.', '−6 ordine inverso; 12 proposta; 3 dimezza scarto; 0 ridurrebbe modulo uno perdendo errore.', 'NΔt e Δt/N tempi; 2πN/Δt pulsazione; N/Δt² tempo inverso quadrato. Nessuna di queste isola f.', 'Quozienti invertono un fattore diretto; durata quadrata indebita; somma due per stati identici.', '3/4 reciproco; 2 solo f; 2/3 solo durata; 8 fase finale non rapporto.', '14 somma; 7/2 doppia metà; 2 differenza; 15/2 modello agli ingressi medi, maggiore 1/2.', '3/2 reciproco; 4/3 solo target; 2 numero della durata B; 1/3 produrrebbe 4 giri.', 'S 24 trattato come N porta 12 Hz, triplo. Rimuovere gain prima di dividere per durata.', 'f 2, 4, 6 con durata 4 s producono S 17, 33, 49; 25/4 Hz ignora gain e offset e produce S 51.', 'Nove è durata al quadrato; ramo negativo viola durata e frequenza positive. Nessun mezzo da integrare perché f è costante per prova.']
ASSUMPTIONS=['Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Solo 03: periodo completo T=2/5 s, ritorno alla stessa configurazione e allo stesso verso; frequenza costante f=1/T, non confondere mezzo periodo.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.', 'Sensore fisso, onda armonica, f e durata positivi, frequenza costante entro intervallo. N=fΔt misura reale di fase non ridotta, non intero dei soli cicli completati. Caso 03 usa periodo completo, stesso stato e stesso verso. I vincoli legano prove, mai f variabile nel tempo della singola osservazione.']
UNITS={1: '', 2: '', 3: 'Hz', 4: '', 5: 'Hz', 6: 's', 7: '', 8: '', 9: 'Hz', 10: '', 11: '', 12: '', 13: '', 14: 'Hz', 15: 'Hz', 16: 's'}
NUMERIC_UNITS={5: 'Hz', 6: 's', 14: 'Hz', 16: 's'}
SUFFIX={1: ' giri', 3: ' Hz', 8: ' giri', 12: ' giri', 15: ' Hz'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'EXACT_MANUAL_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Timeline a 120 px/s, sei caselle 60 px per periodi 1/2 s: 3 s danno 6 giri. Secondo pannello stessa f 2 Hz: 60+30 px rappresentano 3/4 s, 1+1/2 giri. Nel grafico finale origine(100, 1350), endpoint(460, 1110), scale 120 px/s e 40 px/giro; punti(3/4, 3/2), (1, 2), (3, 6) sulla retta N=2Δt. Nessun arrotondamento di fase.'

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


CANDIDATE_REF='98211c55303c351d0334c2cdcdf50a04aa5a827a'
SOURCE_READING='All 80 B135–139 U4-01 original prompts individually read and independent per-ID derivations persisted before opening any B candidate. Handoffs exposed only commits, files and general assumptions, no numeric result or key. Reviewer authored distinct A130–134 and knows oscillator laws from that work; no claim of ignorance of the physics. All 16 final candidate records, options, blocks, hints, feedback, metadata and figure captions read completely, with full SVG XML and native rendering. Never imports authoring. Existing C5-L01/L02/L03/L04/L05 and C1-L003/L005/L006/L008 lessons reread during this U4 work.'
REVIEWED_PACKAGE_SHA256='330b1546b465dc5a97f3e652b5b4a7e214bf23ba3b39136970a027d8929c5bc3'
REVIEWED_BINDINGS_SHA256='32aa22cbe5e4d1a1549b0c3fcd974012d070ec3f184c12290f52afa635aa5b00'
REVIEWED_CANDIDATES={'AR-u4-wave-phase-time-01': '62cd47bb8d7eefa2e53893ffff7355b4bda87cb5b8c5a78086288f8ef71f4781', 'AR-u4-wave-phase-time-02': '87304308be2b15624e7505de47a15496fe3dacef2a70a6fe2b9fbdaab216898b', 'AR-u4-wave-phase-time-03': 'e1c605ab6e19dc95ec30e2cbaf303254990f279a458a3f1754e914faa27673f4', 'AR-u4-wave-phase-time-04': '48abb39952fb8cf46f9d8c5037587b18b528fd7567b756802781a6a60583bd9f', 'AR-u4-wave-phase-time-05': 'e54ff9c1801cf5f729806cf104ae0df6c7ab9bd7fc0afded68b6b8d19b08b618', 'AR-u4-wave-phase-time-06': '720119b336b16287724c8e728ac8be2af73a6081fc495454da5790241f9297cc', 'AR-u4-wave-phase-time-07': '1e9a89102532e9540d8c5c7ebce9650851434572692bfcc7c77ae689343948fe', 'AR-u4-wave-phase-time-08': 'cbd75069a2d1a6592603c75d0e71dbd2ed553c390df4e4bdacbe75e7792fdef6', 'AR-u4-wave-phase-time-09': 'dc2e254f53a93252720c84c4edff04218b33bef3bf98e6f023c40950c7d63fe6', 'AR-u4-wave-phase-time-10': 'fa7b0de888829ce96cf766c9cd79bc2a464263933766fac1b175596c7fda76be', 'AR-u4-wave-phase-time-11': '3d028b15f449c5d70d945a2d8dc03daedeca657ba62381fac47d6c6f4c4825e7', 'AR-u4-wave-phase-time-12': 'd43bea3ccd0528d53120c76e487ceaf20c10dd02f03936c6a6d66735e870300c', 'AR-u4-wave-phase-time-13': 'efc241b23d565fb3d9453f4423a7afa8243c14e57c6ff4ac7c4522beada4801a', 'AR-u4-wave-phase-time-14': 'c00d7f95e49112594d2fe3b956b56dd56e5bdc99ee1ebac3167bcdee01886509', 'AR-u4-wave-phase-time-15': '1134a3293fcba6c2c8ac6e0760a7c2d7c1ec073aebbf9e4159fd02bbbbb4f649', 'AR-u4-wave-phase-time-16': 'a544240472b12eeb5cd04939d373c33c751b066cdbfd6d3fea0397c225fb6beb'}
READ_SOURCE_SHA256={'u4-wave-phase-time-01': '22089c907652bfd52a20ccc29280fb28ee76b54259213f373e332e5232e4b47e', 'u4-wave-phase-time-02': 'ce843b880de2630280b6394fcc444211f83cd7a13a25f341731962eedc928347', 'u4-wave-phase-time-03': 'ad645b163b3bd23f7430283c65d1251b13c42d677e90c8fcbba96e4cf7e01f3a', 'u4-wave-phase-time-04': 'a24b2227b27fd8f3c3a80caa8e2fc8bb6c1d7130fb93fafa0fd0883757fcc303', 'u4-wave-phase-time-05': '023e1cecf3decd7ee223e4a8f4c2aaad953c61f76191eacb044e61ab6bd9ad8a', 'u4-wave-phase-time-06': '30828395e0cd2d528e261db09f452ad22f57849bcc33348b730d53d441ea44e4', 'u4-wave-phase-time-07': '5c57a776df0612fd579b32bf57e72e4f400ed566dd24fe83dbd430c306d38451', 'u4-wave-phase-time-08': '971538a98671153c12020e66d624d6e198d4f9ec912754cf13fea92494972bc6', 'u4-wave-phase-time-09': 'cecb6d38d69c3d0a7692bac607be4af83013e60403706f8f734bcb05f092f235', 'u4-wave-phase-time-10': 'ae8c551027e6dbc7f95eb8f64df152c5e22fb91d1db76c2eb6a36b20ac807f62', 'u4-wave-phase-time-11': 'e3fea3d05baf1f9f44929a267fe73df70ef4f149b3f2ae15080fb7d80df80e72', 'u4-wave-phase-time-12': 'c5740dcb039e52452cd0fe11ce55fc6184f4de234e6071296f3d6a27079b8386', 'u4-wave-phase-time-13': '28549887a5e162cc3b254de9ae0b20d73e0cca9a2837d06acb066b0cf922330f', 'u4-wave-phase-time-14': '48123e8f5755b5df4c4d628286f0354c0edf51efce90d8fae4843e8d60837fd6', 'u4-wave-phase-time-15': 'e598eedd9422950ee9178118c407936467c5dc09bb6f1d8ecdb6913ec53fcb83', 'u4-wave-phase-time-16': '30bd65dd6a12cb458daecd987ba93e5b719b6f3d0739fbc6846e30cca268fa9e'}
