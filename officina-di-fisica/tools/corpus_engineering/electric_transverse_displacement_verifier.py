"""Independent source-first electric review; no candidate authoring imports."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json'
FAMILY='electric-transverse-displacement'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={n:'C4-L02'for n in range(1,17)}
def unique(options,want):
    if [i for i,item in enumerate(options) if sp.simplify(item-want)==0]!=[0]:
        raise ValueError('Independent symbolic alternatives not unique as general laws')

def calibrate(first,second,reading_first,reading_second):
    gain,offset=sp.symbols('gain offset',real=True)
    result=sp.solve([sp.Eq(gain*first+offset,reading_first),sp.Eq(gain*second+offset,reading_second)],(gain,offset))
    if result[gain]<=0:raise ValueError('Independent calibration gain not positive')
    return result[gain],result[offset]




def displacement(field,duration):
    field,duration=map(sp.sympify,(field,duration))
    if any(x.is_real is not True or x.is_finite is not True or x<=0 for x in (field,duration)):raise ValueError('Finite positive constant field and elapsed duration required')
    return field*duration**2/2 # q=1 microcoulomb,m=1 g,E in kN/C

def inverse_field(distance,duration):
    distance,duration=map(sp.sympify,(distance,duration))
    if any(x.is_real is not True or x.is_finite is not True or x<=0 for x in (distance,duration)):raise ValueError('Finite positive displacement and duration required')
    return 2*distance/duration**2

@lru_cache(maxsize=1)
def oracle():
    q,E,m,t,s,k1,k2=sp.symbols('q E m t s k1 k2',positive=True)
    tau=sp.symbols('tau',nonnegative=True)
    acceleration=q*E/m;velocity=sp.integrate(acceleration,(tau,0,t));law=sp.integrate(acceleration*tau,(tau,0,t));assert law==q*E*t**2/(2*m)
    unique([law,q*E*t/m,q*E/(2*m*t**2),q*E*t**2/m,m*E*t**2/(2*q)],law)
    inv=sp.solve(sp.Eq(s,law),E)[0];unique([2*m*s/(q*t**2),m*s/(q*t**2),2*m*s*t**2/q,q*s/(2*m*t**2),2*m*s/(q*t)],inv)
    unique([k1*k2**2,k1*k2,k1**2*k2,k1/k2**2,k2**2/k1],sp.cancel(law.subs({E:k1*E,t:k2*t})/law))
    aa,bb=displacement(2,1),displacement(1,2);assert(aa,bb)==(1,2)
    gain,offset=calibrate(aa,bb,3,5);assert(gain,offset)==(2,1)
    assert displacement(sp.Rational(3,2),sp.Rational(3,2))==sp.Rational(27,16)
    T=sp.symbols('T',positive=True);prepared=2*T;assert displacement(prepared,T)==T**3
    assert sp.solve(sp.Eq(T**3,1),T)==[1]
    # A ramp E=2*tau instead would integrate to y(T)=T^3/3, a different problem.
    ramp=sp.integrate((T-tau)*2*tau,(tau,0,T));assert ramp==T**3/3
    Q=SI.Quantity;assert (Q(1,'microcoulomb')*Q(2,'kilonewton/coulomb')/Q(1,'gram')).to('meter/second**2').magnitude==2
    assert inverse_field(1,1)==2
    return [aa,'m','s = q E t² / (2 m)','Da 1 a 2 m',inverse_field(1,1),sp.Integer(1),displacement(2,3)/aa,2-aa,'E = 2 m s / (q t²)','κ₁ κ₂²',bb/aa,(aa+bb)/2,sp.Integer(2),inverse_field(sp.Rational(6,3),2),inverse_field((2-offset)/gain,1),sp.Integer(1)]

def decode_read_quantity(raw):
    return exact_literal(raw)

MANUAL=['qE=2 mN e m=1 g danno a_y=2 m/s². Con y_0=v_y0=0, s=a_y t²/2=1 m a t=1 s; v_x non entra nella componente y.', 'La dimensione qEt²/m è C·(N/C)·s²/kg=m. Lette tutte le alternative dopo la primaria: solo m è una lunghezza, non m/s, m/s² o un campo.', 'Newton lungo y: a_y=qE/m costante. Integrando prima v_y=a_y t e poi y=a_y t²/2, con iniziali nulle: s=qEt²/(2m). È una componente di spostamento, non la lunghezza della traiettoria.', 'A t=1 s e stessa massa/carica, E da 2 a 4 kN/C raddoppia a_y e s da 1 a 2 m. La dipendenza dal campo è lineare.', 'E=2ms/(qt²): s=1 m e t=1 s danno 2 kN/C. Denominatori q,t² positivi e unità coerenti.', 't²=2ms/(qE)=1 s². La durata è la radice positiva t=1 s; −1 s non è il tempo trascorso del modello.', 'Con E fermo a 2 kN/C, t da 1 a 3 s produce s_B/s_A=3²=9. Il corpo resta esplicitamente entro il campo per tutto l’intervallo.', 'Il corretto è 1 m; proposta 2 m meno corretto dà +1 m. Il rapporto puro 2 è un’altra grandezza.', 'Da 2ms=qEt² divido per qt²>0: E=2ms/(qt²). La dimensione kg·m/(C·s²)=N/C conferma l’inversa.', 'Con E_B=κ₁E_A e t_B=κ₂t_A la sostituzione nella legge quadratica dà s_B/s_A=κ₁κ₂². Campo costante separatamente entro entrambe le prove.', 'A: E=2,t=1 dà s_A=1 m. B: E=1,t=2 dà s_B=2 m. Rapporto 2, metà campo per quattro dal tempo.', 'Media delle deviazioni: (1+2)/2=3/2 m. Ingressi medi E=3/2 e t=3/2 danno 27/16 m; 3/2=24/16, quindi la differenza è 3/16 m. Nessun decimale necessario.', 'B deve dare 2 m nel campo dimezzato a 1 kN/C: t_B²=2s_B/a_y=4 s², dunque t_B=2 s e t_B/t_A=2.', 'A s=1 m dà guadagno 3 m⁻¹. D_B=6 implica s_B=2 m. Durata 2 s: E_B=2s_B/t_B²=1 kN/C nei numeri normalizzati.', 'Riferimenti s=1,2 m con D=3,5: guadagno 2 m⁻¹ e offset 1. D_C=2 dà s_C=1/2 m; a t=1 s richiede E_C=1 kN/C.', 'Si prepara E=βT con β=2 kN/(C·s), poi E è costante per 0≤τ≤T. Alla fine s(T)=qβT³/(2m)=(1 m/s³)T³. s=1 m impone T³=1 s³ e unico T=1 s. Integrare E=βτ sarebbe un altro modello e darebbe un coefficiente un terzo, non la stessa prova.']

DISTRACTORS=['Il dato E2 non è lo spostamento; omettere il mezzo dà2 m; usare una durata lineare cambia dimensioni e iniziali.', 'm/s e m/s² descrivono velocità/accelerazione, N forza, N/C campo: soltanto m è lo spostamento.', 'Tempo lineare manca un fattore temporale; tempo al denominatore inverte crescita; omettere mezzo duplica; scambiare q e m altera unità.', 'Quattro anziché2 raddoppierebbe due volte il campo; mezzo rende inversa la dipendenza; uno ignora la variazione.', '1 kN/C produce1/2 m;4 kN/C produce2 m. Il fattore2 del moto da fermo è necessario.', '−1 non è durata;2 s darebbero4 m;1/2 s darebbe1/4 m. Non si ricava il tempo senza radice.', '3 tratta t linearmente;1 ignora il tempo;1/9 inverte;81 eleva al quadrato due volte il fattore3.', '−1 inverte ordine,2 m copia proposta,0 accetta errore,2 puro è rapporto e non differenza.', 'Prima alternativa omette2; moltiplicare per t² aggiunge quattro potenze temporali rispetto al campo; solo t lascia un tempo spurio; scambiare q/m altera dimensioni.', 'κ₁κ₂ perde un fattore di tempo; κ₁²κ₂ assegna quadrato al campo; entrambi i quozienti invertono una dipendenza diretta.', '1/2 segue solo campo;1 tratta tempo linearmente;4 segue solo t²;8 raddoppia campo invece di dimezzarlo.', '27/16 usa ingressi medi;3 non dimezza;1/2 è metà differenza;2 copia B.', '4 copia rapporto dei quadrati;1/2 inverte;√2 ignora il campo dimezzato;1 darebbe1/2 m anziché2.', 'Campo3 usa D6 come metri;2 darebbe s4 e D12;1/2 darebbe s1 e D3.', 'Campo2 omette offset e prediceD3;1/2 predice3/2;4 predice5;0 predice1 e viola E>0.', '−1 non risolve T³=1 ed è negativo;2 dà8 m;1/2 dà1/8 m; infinite durate è falso perché la cubica è strettamente crescente sul ramo positivo.']

ASSUMPTIONS=['Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti.', 'Campo esterno uniforme costante entro prova, q+1 μC e m1 g, piano xy orizzontale con altre forze a risultante nulla nel piano. y0=vy0=0, vx iniziale positivo e costante; s è componente y, non cammino. Corpo sempre nella regione e regime non relativistico dichiarato. Durate positive e unità SI coerenti. Il tempo preparato T è distinto dal tempo interno τ; E=βT resta fissato durante il moto.']

UNITS={1: 'm', 2: 'm', 3: 'm', 4: 'm', 5: 'kilonewton/coulomb', 6: 's', 7: '', 8: 'm', 9: 'newton/coulomb', 10: '', 11: '', 12: 'm', 13: '', 14: 'kilonewton/coulomb', 15: 'kilonewton/coulomb', 16: 's'}

NUMERIC_UNITS={1: 'm', 5: 'kN/C', 6: 's', 14: 'kN/C'}

SUFFIX={8: ' m', 12: ' m', 15: ' kN/C', 16: ' s'}

NON_NUMERIC_DISTRACTORS={8: {'2'},16:{'Infinite durate positive'}}

SVG_REVIEW='XML e PNG nativo integrale letti. Vista dall’alto, qpositiva, forza +y e vx +x; frecce schematiche di unità diverse e punte fuori dal corpo. Curva M100830Q300830500590: t=2u,y=4u²=t² m, con campo2 kN/C e a2 m/s²; punti(1,1),(2,4) coerenti. È legge oraria, non traiettoria. Barre1,2,3/2m larghe160,320,240 da origine130; B ha campo diverso dalla curva. Zeri non coperti dagli assi.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 3: 'SYMBOLIC_MANUAL_DERIVATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION'}

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u6-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C4' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];value=row['answer']['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent '+FAMILY+' conceptual key mismatch')
        else:
            try:
                raw=numeric_lexeme(value).replace('−','-').strip();suffix=SUFFIX.get(n,'')
                if suffix==' giri' and raw.endswith(' giro'):raw=raw.removesuffix(' giro')+' giri'
                if suffix and not raw.endswith(suffix):raise ValueError('missing physical unit')
                if suffix:raw=raw.removesuffix(suffix).strip()
                if len(raw)>60:raise ValueError('literal too long')
                exact=decode_read_quantity(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_read_quantity(option)-want)==0:equivalent.append(alternative)
                    if equivalent!=[value]:errors.append('Independent '+FAMILY+' numeric alternatives not unique')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent '+FAMILY+' answer or unit invalid')
        if row['answer']['type']=='numeric' and (row['answer'].get('unit')!=NUMERIC_UNITS.get(n) or row['answer'].get('tolerance')!=0):errors.append('Independent '+FAMILY+' numeric unit mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,
          'ok':not errors,'errors':errors,'expectedExact':str(want),
          'dimension':{str(k):str(v) for k,v in SI.Unit(UNITS[n]).dimensionality.items()},
          'manualArithmetic':MANUAL[n-1],'physicalAssumptions':ASSUMPTIONS[n-1],'distractors':DISTRACTORS[n-1],
          'pedagogicalReview':'Consegna, tutti i passaggi, alternative, hint e feedback letti separatamente; procedura manuale esatta e condizioni controllate. '+MANUAL[n-1],
          'scientificAssetReview':SVG_REVIEW if assets else 'Nessuna figura collegata a questo record; testi e formule letti integralmente.',
          'calculationScope':CALCULATION_SCOPE.get(n,'EXACT_MANUAL_CALCULATION'),
          'verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE',
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes())},
          'methods':['SymPy_independent_conservation_and_constitutive_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}


CANDIDATE_REF='16e815a385061fd23fc62bef7271cf040b06c29c'

PRIMARY_SHA256='3531bf38e7970d52ba36b9193b48827d0a59b7f8d5c364705e0ff60809e268e9'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='60c99ce495cbb2e19e4807841c3f86263013fed5ff7593e16f16be16c73c0892'

REVIEWED_BINDINGS_SHA256='ee43cfb9f982e5336f29633a2c60c7c2dd0c63c9f00a237202c0305334ed629f'

REVIEWED_CANDIDATES={'AR-u6-electric-transverse-displacement-01': 'bb355fff16cec7435fb5df5c53e661fd39c846e6e9588bc35b5a8e92fa27e9b6', 'AR-u6-electric-transverse-displacement-02': 'cee9c3dd5652e258fb50863122945d3207e1dc86145fd332d9568c40497e13ab', 'AR-u6-electric-transverse-displacement-03': '69e7da5ea83df5d70a5ee27f35c7a2e15824c86b9128b0ecb26fab2ad0aa99b5', 'AR-u6-electric-transverse-displacement-04': 'acbdf40e72a86f27b381fff36fc61ed018245e4638c901dbad9df8c9286e119f', 'AR-u6-electric-transverse-displacement-05': 'ab2fd4713d62575ffbe79f7a9eb5782976aba401b508727e2383b0bef14cf727', 'AR-u6-electric-transverse-displacement-06': '4a80e3a386291368abf8ccf9c18fa6600514617aca8481b1b7e242feb6028e04', 'AR-u6-electric-transverse-displacement-07': 'd3eaf400834a7c3ce7a472f123c0968555588631564e56920becad231cba1d2c', 'AR-u6-electric-transverse-displacement-08': 'b82109fe1b4926acd19401c4a28042df5ccb9d08d2842a3500dc69779c5f5a69', 'AR-u6-electric-transverse-displacement-09': '87a06c8b69b8fe79ef92c7b6831763859eaa338992fb4e814f8d3dd9aab66899', 'AR-u6-electric-transverse-displacement-10': 'b89bab7ced5bf9d38603a92ac5ead2642d6a056224409692fc81c06a85634ed3', 'AR-u6-electric-transverse-displacement-11': '307f20b89e742902a79a4ec0afa6ae27afa6d9f8742528b360b945f4721f4f0f', 'AR-u6-electric-transverse-displacement-12': '4a6c78f48bec212bbb40a194c6bbd6e66a25806cf5487463e275ea838ddf65ec', 'AR-u6-electric-transverse-displacement-13': '467535d56474fb9ff67843cfe4dea188b56b12b700df9dbe4b2dd49629a15e82', 'AR-u6-electric-transverse-displacement-14': 'ec8506fde71f51b4c4b4e5dcb3692ef5eeea9be40936fc0c134095bf6256c0df', 'AR-u6-electric-transverse-displacement-15': 'd79368c87617a7fa934ed1bf42c8ac66443a686b2b0e77883ab8b184e90d00e0', 'AR-u6-electric-transverse-displacement-16': '4ffbccc4cb3282bc172b85d4ee6b03314a47e5d1080b961db8941bde46655027'}

READ_SOURCE_SHA256={'u6-electric-transverse-displacement-01': '3c0ed943eb784852eae4229724217ceadbf69e79b4b87f57023fa56135ef5514', 'u6-electric-transverse-displacement-02': '4e3acaa7098cd49f29d03b0b1d4cf859fd0e2775fd378aa60c9b68e70723f79c', 'u6-electric-transverse-displacement-03': '04e2b979f4131152eb6d0c8a96e4415be09f1ad1be551136de547826e242e37f', 'u6-electric-transverse-displacement-04': '2808fa7dbac78af413dce1cdeaec287c65fdff6c293871b4f17c6bf290dab406', 'u6-electric-transverse-displacement-05': '2d802af8e92780f102144ddb5ead77cd22d94ffb8f0a783b1a3c1b3c60c085c8', 'u6-electric-transverse-displacement-06': 'b8b5658449d4da71209458acc19e58b19135927b854f13c4ddac7578c5d15e41', 'u6-electric-transverse-displacement-07': '1d6fbc656b33987db31f5a916c1a5dbf547782bd8af8652ed7d6f20a0e6e8bcc', 'u6-electric-transverse-displacement-08': '32503a1a430ef721ff3dbb483ce07794450886e48f0f69ddcac38376150a8093', 'u6-electric-transverse-displacement-09': '921ac8645149c6ed5e49b519ddc86246d9f4459487c98170f76d1375a6912cd8', 'u6-electric-transverse-displacement-10': '8926211be428b14ea60c14f00cd023ea14f45349d2a4905e331099d7188efa2b', 'u6-electric-transverse-displacement-11': 'f4aa5a5d4d27f3a912e08648eeae2663bde5f3c66dc316dfc11b47759b6bcb25', 'u6-electric-transverse-displacement-12': '7a9d1ec821b62912d9c7cd03caec6d2a89d1aa72c35e2490e67cb8ceb1aa9035', 'u6-electric-transverse-displacement-13': '0567fd3bf2462783f0e54e4bd53075b28ed418ae61376e895d9029e5ba523494', 'u6-electric-transverse-displacement-14': '92b522339e228e1d2602868303d0b9ba171136a39274190f2d04dacc82702f05', 'u6-electric-transverse-displacement-15': '4046689f731b2bd0f76b450ee99fab0ee0351cb10bc33c51e444794a9ebfec7f', 'u6-electric-transverse-displacement-16': 'da7fb7ffa64bc0e3dc99c751c462aa0ecd8c19ee1d9f3f682723b29ddd88af3a'}

SOURCE_READING='Primaria indipendente3531 congelata dopo tutti80 originali prompt-only, prima delle candidate. Poi letti integralmente i16 record finali del lotto, tutte opzioni, blocchi, formule, hint/error, metadati, XML e rendering nativo completo realmente prodotto. Nessun autore importato. Lezioni reali C4-L02/L03 e prerequisiti di meccanica riletti; ipotesi e casi speciali confrontati individualmente. Byte congelati soltanto dopo lettura finale; UI prodotto NOT_RUN.'
