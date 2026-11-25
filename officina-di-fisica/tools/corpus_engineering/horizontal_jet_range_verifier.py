"""Independent full-record fluid review; never imports candidate authoring."""
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U3-03.json'
FAMILY='horizontal-jet-range'
EXPECTED_IDS={f'AR-u3-{FAMILY}-{n:02}' for n in range(1,17)}

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

@lru_cache(maxsize=1)
def oracle():
    g,h,H,v,t,R=sp.symbols('g h H v t R',positive=True)
    # Candidate symbols: h is head, H is the hole's height over ground.
    speed=sp.solve(sp.Eq(g*h,v*v/2),v)[0]
    flight=sp.solve(sp.Eq(H-g*t*t/2,0),t)[0]
    law=sp.simplify(speed*flight)
    inverse=sp.solve(sp.Eq(R*R,4*h*H),h)[0]
    k,l=sp.symbols('k l',positive=True)
    ratio=sp.simplify(law.subs({h:k*h,H:l*H})/law)
    for opts,want in [([2*sp.sqrt(h*H),sp.sqrt(2*g*h),2*g*sp.sqrt(h*H),2*h*H,sp.sqrt(h*H)],law),
                      ([R*R/(4*H),R/(4*H),4*R*R/H,4*H/(R*R),R*R*H/4],inverse),
                      ([sp.sqrt(k*l),k*l,k/l,sp.sqrt(k/l),k+l],ratio)]:
        if [i for i,x in enumerate(opts) if sp.simplify(x-want)==0]!=[0]:raise ValueError('Jet symbolic alternatives not unique')
    F=lambda head,height:law.subs({h:head,H:height})
    A,B=F(1,4),F(4,8)
    q,z=sp.symbols('q z',real=True)
    cal=sp.solve([sp.Eq(q*A+z,9),sp.Eq(q*B+z,1+16*sp.sqrt(2))],(q,z))
    C=sp.simplify((17-cal[z])/cal[q])
    if (cal[q],cal[z],C)!=(2,1,8):raise ValueError('Jet exact radical affine calibration failed')
    mean=sp.simplify((A+B)/2)
    if mean!=2+4*sp.sqrt(2) or sp.simplify(mean**2)!=36+16*sp.sqrt(2) or not (2<sp.Rational(3,2)**2):raise ValueError('Jet manual mean-radical bound failed')
    Z=sp.Symbol('Z',positive=True)
    square=sp.expand(law.subs(h,Z-H)**2)
    if sp.simplify(Z*Z-square-(2*H-Z)**2)!=0:raise ValueError('Jet geometric upper range bound failed')
    for height in [2,8]:
        if F(10-height,height)!=8:raise ValueError('Complementary-hole equal ranges failed')
    if sp.simplify(speed.subs({h:8})/speed.subs({h:2}))!=2 or sp.simplify(flight.subs({H:2})/flight.subs({H:8}))!=sp.Rational(1,2):raise ValueError('Equal ranges must retain unequal speeds and times')
    x=sp.Symbol('x',positive=True)
    if sp.simplify(law.subs({h:x/4,H:x}))!=x:raise ValueError('Jet positive absolute-value branch failed')
    # The SVG's quadratic Bezier P0=(200,350), P1=(300,350), P2=(400,550).
    s=sp.Symbol('s',real=True)
    px=(1-s)**2*200+2*s*(1-s)*300+s*s*400
    py=(1-s)**2*350+2*s*(1-s)*350+s*s*550
    time=2*s;world_x=(px-200)/50;world_y=(550-py)/50
    if sp.simplify(world_x-2*time)!=0 or sp.simplify(world_y-(4-time*time))!=0:raise ValueError('Jet SVG complete quadratic trajectory failed')
    u=SI.Quantity
    velocity_square=(2*u(2,'m/s**2')*u(1,'m')).to('m**2/s**2')
    time_square=(2*u(4,'m')/u(2,'m/s**2')).to('s**2')
    range_square=(velocity_square*time_square).to('m**2')
    inferred_head=(u(4,'m')**2/(4*u(4,'m'))).to('m')
    gain=(u(12,'')/u(4,'m')).to('1/m')
    if (velocity_square.magnitude,time_square.magnitude,range_square.magnitude,inferred_head.magnitude,gain.magnitude)!=(4,4,16,1,3):raise ValueError('Pint Fraction efflux/flight/range units failed')
    return [A,'m','R = 2√(hH)','Da4 a8 m',inverse.subs({R:4,H:4}),'Gittate uguali; velocità maggiore da A',F(1,1)/A,8-A,'h = R²/(4H)','√(κ₁ κ₂)',sp.simplify(B/A),mean,sp.Integer(2),inverse.subs({R:8*sp.sqrt(2),H:8}),inverse.subs({R:C,H:4}),sp.Integer(4)]


MANUAL=['Nel candidato h è battente e H quota del foro; ruoli trasposti esplicitamente rispetto alla fonte. v₀=√(2gh), t=√(2H/g), quindi R=2√(hH)=2√4=4 m. Esempio SVG g=2 dà v₀=2 m/s e t=2 s.', 'R=v₀t ha dimensione L. Anche √(hH) è lunghezza; g si cancella ma non si cancella la dimensione. La scelta m richiede il solo riconoscimento dimensionale.', 'Moto verticale con velocità iniziale nulla: y(t)=H−gt²/2. Il primo impatto ha t=√(2H/g)>0; x=v₀t e Torricelli danno R=2√(hH). La stessa g governa entrambe le fasi.', 'h da 1 a 4 m a H=4 m raddoppia v₀, lascia t costante e porta R da 4 a 8 m. Le superfici sono a quote H+h=5 e 8 m, non a una quota totale comune.', 'R²=4hH, quindi h=R²/(4H)=16/(4·4)=1 m. Superficie ricostruita 5 m sul suolo.', 'Con superficie Z=10 m, foro A a H_A=2 ha h_A=8; foro B a H_B=8 ha h_B=2. Prodotti entrambi 16 m² e gittate 8 m. v_A/v_B=√(8/2)=2, t_A/t_B=√(2/8)=1/2. Questa chiave era anticipata nel messaggio autore e viene qui ricalcolata dalle leggi.', 'h=1 m fisso, H da 4 a 1 m lascia v₀ costante, dimezza t e R: 4→2 m, rapporto 1/2. Anche la superficie si abbassa per mantenere il battente.', 'Corretto 4 m; proposta meno corretto 8−4=+4 m. Con H=4 m, una gittata 8 m richiederebbe h=4 m anziché 1.', 'Quadrare R positivo dà R²=4hH; dividere per 4H positivo isola h=R²/(4H), dimensione L²/L=L.', 'h e H scalano separatamente: R_B²/R_A²=κ₁κ₂. Per le distanze positive il rapporto è √(κ₁κ₂).', 'A R=4 m; B hH=32 m²→R=2√32=8√2 m. Rapporto a 4: 2√2, il cui quadrato è 8.', 'Media (4+8√2)/2=2+4√2 m. Ingressi medi h=5/2 m,H=6 m danno 2√15. Quadrato della media corretta 36+16√2<60 perché √2<3/2 (8<9); non serve un decimale.', 'Target 2√2·4=8√2 m, quadrato 128 m². h_B=4 m richiede H_B=128/(4·4)=8 m, rapporto a 4 uguale 2; superficie B a 12 m.', 'q=12/(4 m)=3 m⁻¹. S_B=24√2→R_B=8√2 m, quadrato 128; H_B=8 m→h_B=128/32=4 m.', 'Differenze ΔS=2(8√2−4) e ΔR=(8√2−4) m, non nulle perché 128≠16. q=2 m⁻¹, offset 1; S_C=17→R_C=8 m, H_C=4 m→h_C=4 m.', 'Vincolo h=H/4: R=2√(H²/4)=|H|. Solo nel dominio H>0 si semplifica in H; R=4 m dà H=4 e h=1 m, unica coppia positiva.']
DISTRACTORS=['h e H non si sommano per ottenere R; la somma è quota della superficie. g non numerica non impedisce il calcolo, perché è la stessa in efflusso e caduta.', 'm/s velocità, s tempo, m² area e 1 puro. Cancellazione di g non rende R adimensionale.', '√(2gh) è velocità, fattore g residuo cambia dimensioni, 2hH area e √(hH) manca del fattore 2.', '16 linearità falsa in h, 4 ignora, 2 inverte, 4√2 corrisponde a h soltanto doppio.', 'R/(4H) puro; senza 4 si avrebbe h=4 m e R=8 m. Quote ricostruite entrambe positive.', 'Gittate uguali non implicano velocità uguali: tempi diversi. Guardare soltanto un’altezza ignora l’altra; entrambe le quote di foro restano fra 0 e Z.', '2 reciproco, 1/4 linearità falsa nel tempo, 1 ignora caduta più breve; segno negativo incompatibile con distanze.', '−4 ordine invertito, 8 proposta, 0 accetta, 2 dimezza; tempo non può raddoppiare a H e g fissi.', 'R/(4H) puro; 4R²/H fattore 16; 4H/R² lunghezza inversa; R²H/4 volume. Nessuna g residua.', 'Prodotto senza radice riguarda R²; quozienti rendono inverso un fattore geometrico; somma dà 2 per prove identiche.', '8 rapporto dei quadrati; √2 sola caduta; reciproco inverte; 4 non combina i fattori 4 e 2 con la radice.', '4+8√2 somma; 1+2√2 metà aggiuntiva; 2√15 ingressi medi; 2√2 rapporto invece di media in metri.', '8 quota finale numerica, 2√2 target di R, 4 solo battente, 1/2 reciproco.', 'Usare S_B direttamente come R triplica R e moltiplica h per 9: 36 m. Rimuovere q prima di quadrare.', 'Con H=4 m, h=1,2,8,16 m danno S=9,1+8√2,1+16√2,33, non 17.', '√(H²)=|H| su tutti i reali. H negativa non è foro sopra il suolo. Il dominio positivo è necessario per unica coppia h=1,H=4.']
ASSUMPTIONS=['Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse. Nel solo record 06 la superficie è mantenuta a quota totale Z=10 m e i fori sono rispettivamente a 2 e 8 m. La gittata comune non impone v uguali.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.', 'Piccolo foro orizzontale, grande serbatoio di liquido incomprimibile, istante quasi stazionario e battente costante durante il volo nel modello. Superficie e getto alla stessa pressione assoluta, fase liquida mantenuta, nessuna macchina o perdita prima del getto; aria, ostacoli e interazioni fra getti trascurati dopo. g>0 uniforme comune alle due fasi, H>0 quota del foro, h>0 battente, R primo impatto sul suolo piano. Nel candidato i simboli h/H sono esplicitamente scambiati rispetto alla fonte; le grandezze fisiche restano le stesse.']
UNITS={1: 'm', 2: 'm', 3: 'm', 4: 'm', 5: 'm', 6: 'm', 7: '', 8: 'm', 9: 'm', 10: '', 11: '', 12: 'm', 13: '', 14: 'm', 15: 'm', 16: 'm'}
NUMERIC_UNITS={1: 'm', 5: 'm', 14: 'm', 16: 'm'}
SUFFIX={8: ' m', 12: ' m', 15: ' m'}
SVG_REVIEW='XML e rendering completo letti. g=2 m/s²; superficie y=300, foro (200,350), suolo y=550, scala 50 px/m: h=1 m,H=4 m. Bezier quadratica P0=(200,350),P1=(300,350),P2=(400,550): in coordinate fisiche x=4s,y=4−4s²,t=2s, cioè x=2t,y=4−t². Tutta la curva, non solo tre punti, rispetta gravità g=2 e tangente iniziale orizzontale. Freccia 60 px a 30 px/(m/s). Caso separato Z=10 m e fori a 2/8 m: due barre uguali 240 px a 30 px/m per R=8 m, non due velocità uguali. Limite geometrico indipendente R²=Z²−(2H−Z)²≤Z² per 0<H<Z, massimo R=Z al mezzo.'

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
          'calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'SYMBOLIC_MANUAL_DERIVATION' if n in (3,9,10) else 'EXACT_MANUAL_CALCULATION',
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'methods':['SymPy_independent_Bernoulli_continuity_or_ballistic_motion','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}

CANDIDATE_REF='76cb7deccd2651e4f0687f2fb4a576e910eaca1b'
SOURCE_READING='All 80 original U3-03 prompts in these five families individually read and solved before opening candidate packages. Disclosure: prior author handoff already exposed 104-06 equal ranges and doubled A speed, plus qualitative information about radicals, a quartic and renamed h/H. These facts independently rederived from source models; no claim of wholly blind key reading for 104-06. All 16 final candidate records, alternatives, hints, feedback and scientific SVG XML/native rendering read before freezing. Never imports candidate authoring; real C2-L005/L006 lessons reread.'
REVIEWED_PACKAGE_SHA256='37266e4111fb94b50f6e4cdc0e999ba73136d06d82c2091021af8815b2230296'
REVIEWED_BINDINGS_SHA256='cd51de44532aad3755c7bc09adb0872ecac8b40e68666dbfe5bc842d4e1a0fdc'
REVIEWED_CANDIDATES={'AR-u3-horizontal-jet-range-01': '490563310950b83f651bbed1414d392fbb5fe57b77d0a15494449a4f45905c2d', 'AR-u3-horizontal-jet-range-02': '4d069152ec700a23ec233855646d385b4cdc2cf3ac21a4ce222a1c2e2ce5711e', 'AR-u3-horizontal-jet-range-03': 'b6766755bcc842d055508a2adeec918323195078e5919cc6ba23e4cf2ed19ac3', 'AR-u3-horizontal-jet-range-04': '412618eed903651f1d3537e95a7c69469bf9899dd83c742780d5153b2766cc83', 'AR-u3-horizontal-jet-range-05': '81315ca78d540b68771823a7aa9d46ad606f028da0428422491863b2e97c3d78', 'AR-u3-horizontal-jet-range-06': 'a65324bf7b9f62d88a171c7f57be5c4f9d4892d7bb6a81e5766e8a93b832d465', 'AR-u3-horizontal-jet-range-07': '82bea5a2ce06942d0bc1d1ff42ce51fd758e147b9bdd1121ec595467334d4278', 'AR-u3-horizontal-jet-range-08': '82981e4b3c8cb00b1a0c116b191a5dfce3fa9fde032a6ba4a33b134e2adcd046', 'AR-u3-horizontal-jet-range-09': 'c6a998c72704431361ecc8924751239e38f28c73064d0dcbd1cae93530798300', 'AR-u3-horizontal-jet-range-10': '1f9aa9f47ab2b4a43a7189e61274425003760a9108e910f28ba9549cfc7c9c3c', 'AR-u3-horizontal-jet-range-11': 'ef8a618360b7d7401b78aadbdf2fce5259e7bdb72c18165455bf0db2f31eaf94', 'AR-u3-horizontal-jet-range-12': '7f85ad082f8efb84c4e5051f60cd222399d368390d73c04f63c42c6d7ea5bfb4', 'AR-u3-horizontal-jet-range-13': 'bc2572d9a4a729d7e6ca4e6106d3665d7d2fcdde0de4a90381bc89bed228b6b4', 'AR-u3-horizontal-jet-range-14': '8634f01bad003aab63d2244dddaa3dfb3c2b84f1070987c26ff09bf4d34fff29', 'AR-u3-horizontal-jet-range-15': '73c35f007b781792e465b6c3e99e869cdc2e557d5ace9c049db672e3faeea90e', 'AR-u3-horizontal-jet-range-16': '24f7af43d22b46932b34867e2843ec2e5308886c082bb1214b040d5bc43edc56'}
READ_SOURCE_SHA256={'u3-horizontal-jet-range-01': 'cdd1213224b06a7fb02e8be1951a8aadf2b182acf52a9a41460232e0a4c7d11f', 'u3-horizontal-jet-range-02': '3ef34c71e0253420a4454f8bc459a8e2ef1f84951ea86240a35f2b2d3357bd31', 'u3-horizontal-jet-range-03': '6f2bc78c974405909b309ece92d55dacb80baad39bd0bbed0a403f99048c8c9b', 'u3-horizontal-jet-range-04': '0a1548d749f355d253096e98383b4529e43dc0891cdef3e68e76cd63b5c59160', 'u3-horizontal-jet-range-05': '950da15d164bfe544bf854c30c759fde4abe539f85f35f093655adb54d2ef07d', 'u3-horizontal-jet-range-06': '096123760e3c76e06b83d3718a4ef501871b857c909be3f5603128ae18e726a3', 'u3-horizontal-jet-range-07': '1f3c1128d9801f497bdcd0559911319991d9739cdafbc16fcd1ac684f206bf73', 'u3-horizontal-jet-range-08': '5d91fe4be2536ac8966107f8bb2c095ff27da84d643c6f3f549619f7b1625331', 'u3-horizontal-jet-range-09': 'd736b7acb8138c8830e6e0e5ae9d358f8a5ef7a7b46e07aa1d346535851b5192', 'u3-horizontal-jet-range-10': '0af1a4c0dc456e7e0c65e8458a095b5fd7bc2177280dc287523a04d2fd12cf9b', 'u3-horizontal-jet-range-11': '8be9430b1e776178f474840bb21c8a2ee81c9b61ca707db3e304c19ab1aaf345', 'u3-horizontal-jet-range-12': 'b8b15e4291346f592eaa3893aed5f209f5a8c0d34ca9230508d2f60c1c08773c', 'u3-horizontal-jet-range-13': '5690097a49c097510e021e293bd4b4c72d5d66c5710a973b1389d10175b41d2f', 'u3-horizontal-jet-range-14': '242f0346ff889694d82f3f47b2a6184aa85880ba53faf0e642d77125fd815ec9', 'u3-horizontal-jet-range-15': '456337c8efd89baec04e0ebc80408439ad428bfc95a038dc8b4bbaf0a59a1d30', 'u3-horizontal-jet-range-16': 'f3023a88e674bb55c6b81bb57af332da750eb443e818c91b004f8f21e4e0f373'}
