"""Independent U3-05 full-record review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-05.json'
FAMILY='drop-detachment'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}
REVIEWED_SKILL='C2-L010'

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

    gamma,r,rho,g,V,k,l,c=sp.symbols('gamma r rho g V k l c',positive=True)
    law=sp.solve(sp.Eq(rho*g*V,2*sp.pi*r*gamma),V)[0]
    inv=sp.solve(sp.Eq(V,law),r)[0]
    ratio=sp.simplify(law.subs({r:k*r,gamma:l*gamma})/law)
    unique([2*sp.pi*r*gamma/(rho*g),4*sp.pi*r*gamma/(rho*g),2*sp.pi*r*r*gamma/(rho*g),rho*g/(2*sp.pi*r*gamma),2*sp.pi*r*gamma],law)
    unique([rho*g*V/(2*sp.pi*gamma),2*sp.pi*gamma/(rho*g*V),rho*g*V/gamma,rho*g/(2*sp.pi*gamma*V),rho*V/(2*sp.pi*gamma)],inv)
    unique([k*l,k/l,l/k,k*k*l,k+l],ratio)
    f=lambda a,b:sp.simplify(law.subs({r:sp.Rational(a)/1000,gamma:sp.Rational(b)/1000,rho:1000,g:10})*10**9)
    A,B=f(1,20),f(2,25)
    gain,offset=calibrate(A,B,1+8*sp.pi,1+20*sp.pi);assert(gain,offset)==(2,1)
    C=(1+16*sp.pi-offset)/gain
    assert (A+B)/2-f(sp.Rational(3,2),sp.Rational(45,2))==sp.pi/4
    constrained=law.subs(r,c*gamma)
    roots=sp.solve(sp.Eq(constrained.subs({c:sp.Rational(1,20),rho:1000,g:10}),4*sp.pi/10**9),gamma)
    assert roots==[sp.Rational(1,50)]
    q=SI.Quantity
    assert q(1,'microliter').to('m**3').magnitude==Fraction(1,10**9)
    assert (q(1,'N')/(q(1000,'kg/m**3')*q(10,'m/s**2'))).to('m**3').magnitude==Fraction(1,10000)
    rad_from=lambda volume,tension:sp.simplify(inv.subs({V:volume/10**9,gamma:sp.Rational(tension)/1000,rho:1000,g:10})*1000)
    tension_inv=sp.solve(sp.Eq(V,law),gamma)[0]
    tension_from=lambda volume,rad:sp.simplify(tension_inv.subs({V:volume/10**9,r:sp.Rational(rad)/1000,rho:1000,g:10})*1000)
    return [A,'µL','V_lim = 2 π r γ / (ρ g)','Da 4π a 8π µL',rad_from(A,20),tension_from(A,1),f(1,25)/A,8*sp.pi-A,'r = ρ g V_lim / (2 π γ)','κ₁ κ₂',B/A,(A+B)/2,tension_from(B,2)/20,rad_from(30*sp.pi/(12*sp.pi/A),25),rad_from(C,20),roots[0]*1000]

MANUAL=['V_lim=2πrγ/(ρg). r=10⁻³ m,γ=1/50 N/m danno F_max=4π·10⁻⁵ N; V=4π·10⁻⁹ m³=4π µL. π rimane esatto.', '1 µL=10⁻⁶ L=10⁻⁹ m³=1 mm³. [F/(ρg)]=L³. Nessun calcolo numerico autonomo richiesto, conversione giustificata esattamente.', 'Alla soglia ρgV_lim=2πrγ. Dividere per ρg dà V_lim=2πrγ/(ρg), senza assegnare forma sferica alla goccia.', 'r da 1 a 2 mm con γ=20: V passa da 4π a 8π µL, fattore due dal perimetro.', 'r=ρgV/(2πγ). I π si cancellano: (4π·10⁻⁵ N)/(4π·10⁻² N/m)=10⁻³ m=1 mm.', 'γ=ρgV/(2πr)=1/50 N/m=20 mN/m. Non richiede π decimale né raggio sferico equivalente.', 'γ da 20 a 25 a r fisso: volumi 4π e 5π µL, rapporto 25/20=5/4.', 'Proposta 8π meno corretto 4π dà +4π µL. A 8π µL il peso sarebbe doppio del sostegno massimo assegnato.', 'r=ρgV_lim/(2πγ). Forza divisa per tensione N/(N/m) dà m; r entra linearmente e non richiede radice.', 'Con r_B=κ₁r_A,γ_B=κ₂γ_A, coefficiente 2π/(ρg) comune: rapporto κ₁κ₂.', 'B r=2,γ=25 dà V=π·2·25/5=10π µL; rapporto 10π/(4π)=5/2.', 'Media (4π+10π)/2=7π µL. Ingressi medi r=3/2,γ=45/2 danno 27π/4; differenza π/4 µL.', 'B volume target 10π, r=2: γ=25. Rapporto γ_B/γ_A=25/20=5/4, dopo rimozione del fattore due del bordo.', 'A V=4π,S=12π: q=3 µL⁻¹. B S=30π dà V=10π; γ=25 porta r=2 mm. Lettura continua non intera.', 'A/B V=4π,10π e S=1+8π,1+20π: q=2 µL⁻¹,z=1. C S=1+16π dà V=8π; γ=20 implica r=2 mm.', 'r=cγ con c=1/20 m²/N: V=2πcγ²/(ρg). V=4π µL dà γ²=1/2500 N²/m²; ramo positivo γ=1/50 N/m=20 mN/m e r=1 mm.']
DISTRACTORS=['8π raddoppia di nuovo la forza, 2π perde il due, 4 perde π, π/4 rovescia il fattore. La geometria del volume non è quella del bordo.', 'mm lunghezza, mm² area, mN forza, Pa pressione. Densità e gravità convertono peso in volume.', '4π aggiunge interfaccia non assegnata; r² trasforma perimetro in area; reciproco volume inverso; senza ρg resta forza.', '16π usa r²,32π usa r³,2π inversa,4π ignora il nuovo bordo.', 'Un raggio ricavato dal volume di sfera risolverebbe un altro modello e non il raggio del sostegno.', 'Omettere π lascerebbe un π spurio; dividere per area darebbe pressione invece di tensione.', '4/5 reciproco,25 copia γ,5/2 introduce anche bordo doppio,1 ignora la modifica.', '−4π inverte ordine,8π proposta,12π somma,zero accetta un peso doppio della soglia.', 'Reciproco lunghezza inversa; senza 2π coefficiente geometrico errato; V al denominatore o assenza di g altera unità.', 'Quozienti rendono inversi fattori diretti; κ₁² usa area, somma dà due per prove identiche.', '2/5 reciproco,2 solo r,5/4 solo γ,10π volume numerico non rapporto.', '14π somma,3π semidifferenza,10π sola B;27π/4 modello agli ingressi medi.', '5/2 trascura r,2 copia r,4/5 reciproco,1/2 manterrebbe volume iniziale.', 'Il rapporto fra letture identifica volumi, non direttamente raggi quando cambia γ. π si cancella dopo la taratura, senza approssimazioni.', 'r=1,4,1/2,5/2 con γ=20 darebbero S=1+8π,1+32π,1+4π,1+20π, non S_C.', 'Radice negativa viola sia γ>0 sia r>0; c è dimensionato e il vincolo fra prove non una legge universale del bordo.']
ASSUMPTIONS=['Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.', 'Soglia prescritta F_max=2πrγ, r raggio del bordo e non della goccia, altre forze tranne peso trascurate, aria senza spinta. ρ=1000 kg/m³,g=10 m/s²,γ uniforme positiva, crescita lenta. ρgV_lim=F_max è modello ideale, non legge universale di distacco reale; forma e collo non dedotti. Valori costanti entro ogni prova.']
UNITS={1: 'microliter', 2: 'microliter', 3: 'microliter', 4: 'microliter', 5: 'mm', 6: 'mN/m', 7: '', 8: 'microliter', 9: 'mm', 10: '', 11: '', 12: 'microliter', 13: '', 14: 'mm', 15: 'mm', 16: 'mN/m'}
NUMERIC_UNITS={5: 'mm', 6: 'mN/m', 14: 'mm', 16: 'mN/m'}
SUFFIX={1: ' µL', 8: ' µL', 12: ' µL', 15: ' mm'}
CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}
SVG_REVIEW='XML e rendering completo letti. Raggio del bordo 40 px a 40 px/mm, goccia dichiarata senza scala volumetrica. Frecce 100 px uguali e opposte per F₀=π/25 mN=4π·10⁻⁵ N. Barre da zero 160/400 px a 40 px per π µL rappresentano 4π/10π µL; non r³. Nessun raggio della goccia dedotto dal profilo schematico.'

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


CANDIDATE_REF='c6cc7dc06c70c2780168a32fb6400a5f5f487987'
SOURCE_READING='All80 original B125–129 U3-05 prompts individually read and independent derivations saved before opening candidate packages. Author handoffs supplied only commits, files and general model assumptions, no numeric results or answer keys. All16 final records including every option, block, hint, feedback, metadata and figure caption read in full, plus complete SVG XML and native rendering. Never imports authoring. C2-L001/L002/L004/L010 are existing course lessons; primary skill C2-L010 addresses surface forces and energy.'
REVIEWED_PACKAGE_SHA256='ba9c341e271aaa540fa1f287555c9cb759adc23d1fc00e0115228fe3148198f1'
REVIEWED_BINDINGS_SHA256='5e00c4efed5def756eb9a506c7ce7e485596ab3881e8ba1f77073ae627cc9fc8'
REVIEWED_CANDIDATES={'AR-u3-drop-detachment-01': '863d8dd2e83f8eb9003321589298f253f2496a4efce9b594ea705ef37ee7bf92', 'AR-u3-drop-detachment-02': '90b04571bc4808d655e7794aa40cffec58a8d11c22629f19d4ed7362e1e83e7c', 'AR-u3-drop-detachment-03': '114d63791ce3773eff743ded97d4d0110178f36cc70b13e4e377762325a70a24', 'AR-u3-drop-detachment-04': '56e81ee2667cf46c7522ad50d841b8b8ee8fc065b18dfb8b0ed75acd3f2c3dc0', 'AR-u3-drop-detachment-05': 'ba655ab79da2ef5e10902c9742a5aa589d84e8acecab57adbb151b231984904e', 'AR-u3-drop-detachment-06': '8d45b5f1c521ba2f31fc2bd661a8c8adc2bd3994ded48f2e375274486f72455c', 'AR-u3-drop-detachment-07': 'adec587677129ed5b2a8890a0dce8466dde64ea0cf2158f0a54ef7ed93ef92de', 'AR-u3-drop-detachment-08': 'c2eeabd05336518e4efec4d89f85c6af2fa04fc1fede79276c7babecec572102', 'AR-u3-drop-detachment-09': '8ec8650ee109bf93ac59673aafd2f3270d6ff1be0fe648bf37f30ee3aa2f96a9', 'AR-u3-drop-detachment-10': '424632f5a9856eba85604b28b2ff96b35769bac79b2de88f81c9d03da3e31b3a', 'AR-u3-drop-detachment-11': '1398f9520483ed51a578b3209dbf3bcc3ca7b6a5c2fdb4e95b23830e3a6a20d9', 'AR-u3-drop-detachment-12': '277f5f0204c739c0906ac4bb30a7738e80047221919a85fbc0ad676d001a659c', 'AR-u3-drop-detachment-13': '398e3496ffd63713a420f14e946528ff2ff11781cff2fbf4a049d876649ed1f7', 'AR-u3-drop-detachment-14': '9f087fc07beb3ed3a9faae7c743fa29ffb6c96abe77a6edc5e1ba858c2a5d60a', 'AR-u3-drop-detachment-15': '55ff659a9639ab4de16e95938ad2ff014ee32c3e94c1f339f0c73e1fb1668ab1', 'AR-u3-drop-detachment-16': '393e79f67688e61b8d7b0a35dfc28dec2ed37699dd62b1f26c8649f987183e45'}
READ_SOURCE_SHA256={'u3-drop-detachment-01': '5507317bdb5ba4a733c44ca3be4a91a575c13a42c993cce47661b6cc3e822cab', 'u3-drop-detachment-02': 'be23fabe161f5bffb2afe4a9ca8c6dfc940ec8338258055e3b86c93fc455dd3c', 'u3-drop-detachment-03': '0da9fc08f42363cc4099c3aa282efca32c95303973e0662dbeed6a263f064116', 'u3-drop-detachment-04': '0eab0e8941a3cf7c194f0313c9ffc5521e77d4b3bb72abb05838e6172c1bd735', 'u3-drop-detachment-05': '245a7ae5319b6de944f955b3167543f72568912d7754260374b0b7666f30091d', 'u3-drop-detachment-06': '0c16013c65c18eb2cc215afbc6f2902bcbb4e7c329566707750993f038df2e83', 'u3-drop-detachment-07': '01eb11eb2801ffcb6d7696dfad0e4a926807d12ab8263519646b5ad6804fd290', 'u3-drop-detachment-08': '4161a8bf826972d029e5c6827c2efe1c9889a07a46e2fc02c97d9df9432d0b66', 'u3-drop-detachment-09': 'e99916c8c024fb7cf836aa3e5e3672aefcf177ed064ed9434db4406170cd0dc3', 'u3-drop-detachment-10': '93fda5f94050a6b72f109c929d82357c75f86ca6a783eedff6df47586e5a1d2d', 'u3-drop-detachment-11': '4a1539991b581f2dbffb46afa38b81b13f8705c7d6d63cc92ec204e26041c83a', 'u3-drop-detachment-12': '3c9e3865ff7c35d0ce322040e03db6abd292795de262831d3f07c843ca298ab0', 'u3-drop-detachment-13': '36bb0a2506a36ccf8abd63b21cf07a0fc89997f27542ac385c98c61dbb3454e7', 'u3-drop-detachment-14': 'a48711845c93980fec8caa6efb90012a9878eb5d21c5613d17a5159befc43c98', 'u3-drop-detachment-15': '1a4b98ba6e805833579385f70e14eae5c8e931b080495a7bdea8bd8d10120c72', 'u3-drop-detachment-16': 'e65118fadf78c25c42b905d3bf1dde212eb7c35db8a4c502d85d477c001cb7ac'}
