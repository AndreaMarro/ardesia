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
FAMILY='couette-force'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L007'

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

    eta,A,d,v,F,k,l,y=sp.symbols('eta A d v F k l y',positive=True)
    field=v*y/d;stress=eta*sp.diff(field,y);law=A*stress
    inv=sp.solve(sp.Eq(F,law),eta)[0];invV=sp.solve(sp.Eq(F,law),v)[0]
    ratio=sp.simplify(law.subs({eta:k*eta,v:l*v})/law)
    unique([F*d/(A*v),F*A/(d*v),F*v/(A*d),A*v/(F*d),F*d/A],inv)
    unique([k*l,k/l,l/k,k*l*l,k+l],ratio)
    f=lambda visc,speed:law.subs({A:sp.Rational(1,100),d:sp.Rational(1,1000),eta:visc,v:speed})
    first,second=f(1,2),f(2,4)
    gain,offset=calibrate(first,second,41,161);C=(81-offset)/gain
    if (gain,offset,C)!=(2,1,40):raise ValueError('Independent Couette affine calibration failed')
    if (first+second)/2-f(sp.Rational(3,2),3)!=5:raise ValueError('Independent bilinear mean failed')
    x=sp.Symbol('x',positive=True);roots=sp.solve(sp.Eq(20,f(x/2,x)),x)
    if roots!=[2]:raise ValueError('Independent Couette positive root failed')
    u=SI.Quantity
    if (u(1,'Pa*s')*u(Fraction(1,100),'m**2')*u(2,'m/s')/u(1,'mm')).to('N').magnitude!=20:raise ValueError('Independent Couette SI factor failed')
    if (u(Fraction(1,2),'Pa*s**2/m')*u(Fraction(1,100),'m**2')/u(1,'mm')).to('N*s**2/m**2').magnitude!=5:raise ValueError('Independent constrained Couette dimensions failed')
    # Constitutive distinction: stress determines strain rate in fluid, strain in elastic solid.
    tau,mu,E,t=sp.symbols('tau mu E t',positive=True)
    strain=tau*t/mu
    if sp.diff(strain,t)!=tau/mu or sp.diff(tau/E,t)!=0:raise ValueError('Independent constitutive distinction failed')
    numeric_inv=lambda force,speed:inv.subs({F:force,A:sp.Rational(1,100),d:sp.Rational(1,1000),v:speed})
    return [first,'N','Il fluido continua a deformarsi; il solido può equilibrare lo sforzo con una deformazione finita','Da 20 a 40 N',numeric_inv(20,2),invV.subs({F:20,A:sp.Rational(1,100),d:sp.Rational(1,1000),eta:1}),f(1,1)/first,40-first,'η = F d / (A v)','κ₁ κ₂',second/first,(first+second)/2,sp.Integer(2),numeric_inv(240/(60/first),4),numeric_inv(C,2),roots[0]]

MANUAL=['A/d=10⁻²/10⁻³=10 m. Profilo w(y)=vy/d, gradiente v/d; τ=ηv/d e F=τA=20 N per η=1, v=2. Forza liquido −20 N, applicata +20 N sulla stessa piastra.', 'Gradiente v/d ha unità s⁻¹, η Pa·s produce τ Pa e moltiplicare A dà N. Pa è già unità dello sforzo, cioè forza per area; nessun calcolo numerico autonomo richiesto.', 'Fluido τ=ηγ̇ con η finita e τ≠0 impone γ̇≠0, quindi deformazione continua. Solido ideale τ=Gγ, G>0, può equilibrare con γ=τ/G finita. Distinguere tasso s⁻¹ e deformazione pura, nessun calcolo numerico autonomo richiesto.', 'η da 1 a 2 a v=2 e geometria invariata: F 20→40 N. La forza viscosa opposta cambia allo stesso modulo.', 'η=Fd/(Av)=20·0,001/(0,01·2)=1 Pa·s. F/v da solo richiede ancora d/A.', 'v=Fd/(ηA)=20·0,001/(1·0,01)=2 m/s. Coefficiente ηA/d=10 N·s/m, non massa.', 'v=2→1 dimezza gradiente, τ e F:20→10 N. Rapporto 1/2; potenza Fv invece scala 1/4.', 'Forza corretta 20 N; scarto 40−20=+20 N. Forza non bilanciata 40 N romperebbe lo stato stazionario assegnato.', 'Fd=ηAv; dividere per Av>0 dà η=Fd/(Av), unità N·s/m²=Pa·s. Conversione d=1 mm→0,001 m necessaria.', 'F_B=κ₁η_A A κ₂v_A/d; cancellare geometria e dati A restituisce κ₁κ₂.', 'η=2, v=4 danno F 80 N contro 20; rapporto 4. Forza maggiore non significa risultante accelerante.', 'Media(20+80)/2=50 N. Ingressi medi η 3/2, v 3 danno 45 N, inferiori di 5 N.', 'Target 4·20=80 N a η=2 richiede v=4 m/s; rapporto con v_A=2 uguale 2.', 'Gain 60/20=3 N⁻¹; S_B 240→F 80 N. η=80/(10·4)=2 Pa·s.', 'Gain(161−41)/(80−20)=2 N⁻¹, z 1. S_C 81→F 40 N a v=2, quindi η 40/(10·2)=2 Pa·s.', 'η=cv con c 1/2 Pa·s²/m dà F=c(A/d)v². Coefficiente 5 N·s²/m²;20/5=4 m²/s², radice positiva v=2 e η 1. Radice negativa anche η negativa: fuori dominio.']
DISTRACTORS=['La forza esterna non è la risultante. Forza del liquido e applicata agiscono sulla stessa piastra, senza formare una coppia di azione e reazione.', 'Pa misura lo sforzo, Pa·s la viscosità, m/s una velocità e N/m una forza per lunghezza. Omettere A lascia uno sforzo.', 'Il fluido può sostenere pressioni normali e scorrere con η>0. Una risposta statica finita è elastica, non viscosa newtoniana.', '10 usa una dipendenza inversa; 80 quadra il fattore; 20 ignora η; zero non equilibra l’attrito positivo.', 'F/v senza d/A non è viscosità. Moltiplicare per A/d dà unità diverse.', '20 è il numero della forza. F/m non è il passaggio richiesto, perché la forza assegnata non è la risultante.', '2 è il reciproco; 1/4 descrive la potenza Fv; 4 ne è l’inverso; 1 ignora la velocità nuova.', '−20 inverte l’ordine; 40 copia la proposta; 0 la accetta; 10 dimezza lo scarto.', 'Scambiare A e d capovolge la geometria; v al numeratore è errato. La reciproca è 1/η e omettere v altera le dimensioni.', 'I quozienti invertono una dipendenza diretta; κ₂² appartiene alla potenza; la somma darebbe due per stati identici.', '1/4 è il reciproco; 2 varia un dato; 8 quadra v; 80 è la forza numerica finale, non il rapporto.', '100 è la somma; 25 dimezza ancora; 45 usa ingressi medi; 60 è la differenza.', '1/2 è il reciproco; 4 ignora il contributo di η; 1 produrrebbe 40 N; 8 produrrebbe sedici volte F_A.', 'S grezzo 240 trattato come N dà η=6 Pa·s, non 2. Nel confronto varia anche v.', 'Viscosità 1,4,1/2,3 Pa·s a v=2 m/s generano letture 41,161,21,121. Solo 2 Pa·s dà 81.', '4 è il valore numerico di v²; il ramo negativo viola sia v>0 sia η>0. Il coefficiente ha unità fisiche e il vincolo vale fra prove.']
ASSUMPTIONS=['Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.', 'Liquido newtoniano incomprimibile, η>0, piastre piane parallele A=0,01 m², d=1 mm, inferiore ferma, superiore con v>0 costante. Laminare stazionario sviluppato, no-slip, gradiente di pressione assente, bordi trascurati. F è modulo esterno, forza del liquido opposta e risultante tangenziale nulla. Record 03: confronto costitutivo elastico lineare ideale, nessuna soglia.']
UNITS={1: 'N', 2: 'N', 3: '', 4: 'N', 5: 'Pa*s', 6: 'm/s', 7: '', 8: 'N', 9: 'Pa*s', 10: '', 11: '', 12: 'N', 13: '', 14: 'Pa*s', 15: 'Pa*s', 16: 'm/s'}
NUMERIC_UNITS={1: 'N', 5: 'Pa·s', 6: 'm/s', 14: 'Pa·s', 16: 'm/s'}
SUFFIX={8: ' N', 12: ' N', 15: ' Pa·s'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Separazione 180 px a 180 px/mm, frecce velocità a 50 px/(m/s): lunghezze 100,75,50,25 a quote 240,285,330,375 e zero 420; punte su retta da (200,420) a (300,240), profilo esattamente lineare. Diagramma isolato piastra: frecce opposte 100 px a 5 px/N per ±20 N, risultante nulla, non terzo principio. Grafico a η=1: origine(100,1510), v 50 px/(m/s), F 5 px/N, retta fino(300,1310) passa per (2,20),(4,40).'

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


CANDIDATE_REF='bd85f8e9e1d2429d751c817b9e6df6fcbbffdcd5'
SOURCE_READING='All80 original U3-04 prompts in B112–116 individually read from pinned Git source and derivations persisted before candidate packages were opened. No numeric result or key was handed off before source-first derivation for this family. All16 final candidates, every option, formula, hint, feedback and figure caption read in full; scientific SVG XML and full native rendering read. Never imports candidate authoring. Real C2-L005/L006/L007/L008/L009 lessons reread during this U3-04 work. Author correction bd85f8e9 independently reread: only113-16 invalid-root attribution or115-02 stress-unit wording and derived feedback/binding changed; other30 records, all keys/formulas/assets byte-identical.'
REVIEWED_PACKAGE_SHA256='3162c51890e5785c9a79a161f2da49e2347080966019d0b3458f3b827593ef5a'
REVIEWED_BINDINGS_SHA256='f0199634ea1d6823483934ed6a69f29456799490a7f61554ee63b5a47150067b'
REVIEWED_CANDIDATES={'AR-u3-couette-force-01': '75e0478712b60039d27889dea999e9ccb335a4ffdfcc0df950868f612a18c5e1', 'AR-u3-couette-force-02': '0a7a0db18946154790142e5bbaf1a6b532373ca2bd11a2e0c33af91568124402', 'AR-u3-couette-force-03': '0dd70622af2baf595c31a1c38423e13b0e05cd6fc65beb8e53569e8b6d446000', 'AR-u3-couette-force-04': 'bc76db129d1e76a965bf206fd0a42de6724b691096d9dc8e4aac704bdc928a15', 'AR-u3-couette-force-05': 'bcc4ccfb2c644ad8845a7e28d11cd643e2f2c8364034f9d3c052334ee9bf52af', 'AR-u3-couette-force-06': 'f6d550b0af52c88092d00810327735beaa804dc29131ae35f4a38f13e6f0184a', 'AR-u3-couette-force-07': 'd75d9d82bb1add8abadc5aeb5e6aa71a5f68483c80dca0ec47276a7801f355b1', 'AR-u3-couette-force-08': 'ddbe5460e21e84cff0c1e30f97633c69a7d0bfaf54fad462872cd44bf7b42fbf', 'AR-u3-couette-force-09': '19715ab300d4ce1dc1e6410d502821e476faeafa37950a323a2834756e8331e1', 'AR-u3-couette-force-10': 'ce8ac6a1d21fa186164a5297f772e8adfd91371c8562b9f2d2c2101e5c07413b', 'AR-u3-couette-force-11': '8e36c0773f2880a1fbb752acae2b3924270e259419fe7137858b1a5dcc009112', 'AR-u3-couette-force-12': '22035f7bcc5393387aa576123c4f62b89e40e5faed42be463009d1d10eac46da', 'AR-u3-couette-force-13': '838bb488fbfddf9fc6c0dfa5aafc1de6574fc7a88897d7e0aa31bb00a03f08f8', 'AR-u3-couette-force-14': '4b78a86d080a03e244ec5babe0f2783bf53a373c3fddcdf270a62d6ebbbefb84', 'AR-u3-couette-force-15': '6b6fc2c3032481480dde39925ee65b95f9b141273c1ea4b0e942d78df5730a23', 'AR-u3-couette-force-16': '7129931baefaca71f8b9e6c94fa643230eef27fc10f4f0e156205702d587d60b'}
READ_SOURCE_SHA256={'u3-couette-force-01': 'a6cc3bcb38438a73fdfd47c11bd697130e3a915b1562826106004939876a0833', 'u3-couette-force-02': 'bcda8496856556bc73e37b5c95f78bcd847e08aac98d3819d129bb44eedceaf9', 'u3-couette-force-03': 'f5c77c5b57bbe8fea63eeb9c56c9c06336d947b43e6049c798d17b0d7f7cd852', 'u3-couette-force-04': 'e4af820b9a4aaf2f6826db7d55752d21151edacc990bd13b3750da0e15895f78', 'u3-couette-force-05': '37fc02b79506250e0c969ecdfb323a4d92453905d48e86aa2261895a341f78b0', 'u3-couette-force-06': '9e2af366991c2687703b68e73aec7f9990a7f02d37fbb16b6c26ca55b16b0acc', 'u3-couette-force-07': '3ca45cd34969bee1aee63d9403b6ec057fc0ef1858e079e5e53864dda017d540', 'u3-couette-force-08': '8da9cd39f094971ac693f355ded0a99685cc1cc82a6f6b3347de36093b0b6051', 'u3-couette-force-09': '6ee73ca5c3886a562c7cb1d7d6eb5863cd738f2a5e2054e051993bcbab38e725', 'u3-couette-force-10': '4d7ea557979f7866de6fcc636b778ad5b05bb6b71ba7238fdfd659f3333982f7', 'u3-couette-force-11': 'cc83883c246cddf62d69f040a6f80f56476be95678ed0bdf94c0b62366bdfc61', 'u3-couette-force-12': 'c043f6bb79750ca825fd65675e847863b0ef856259254050b61c65ae6ba4ffbe', 'u3-couette-force-13': 'a01a781fecdb5ffec574a002dd00fd73c4e67a6030ce5671458567daccfe1615', 'u3-couette-force-14': 'a5b9be942ab150614aa6542e26e65814f55a029d99412e48d72a72feadebea49', 'u3-couette-force-15': '3ac609ce751ebd68da006eeee41681a7ce51182730a58789add6f251e2d10b45', 'u3-couette-force-16': 'd87a6552e5b870aa94594558045f0e26e947741e75d27f68d74cea7f74737d6b'}
