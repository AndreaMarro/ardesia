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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json'
FAMILY='series-parallel-resistor-network'
EXPECTED_IDS={f'AR-u6-{FAMILY}-{n:02}'for n in range(1,17)}
REVIEWED_SKILLS={n:'C4-L06'for n in range(1,17)}

def numbers(*values):
    if any(type(x) is bool or not isinstance(x,(int,Fraction,sp.Expr)) for x in values):
        raise ValueError('Numeric exact objects required; raw text is decoded only by the bounded AST codec')
    values=tuple(map(sp.sympify,values))
    if any(x.is_number is not True or x.is_real is not True or x.is_finite is not True or x.has(sp.Float) for x in values):
        raise ValueError('Finite real exact numeric parameters required; use lexical rationals, not binary floats')
    return values

def positive(*values):
    values=numbers(*values)
    if any(x<=0 for x in values):raise ValueError('Strictly positive physical parameters required')
    return values

def unique(options,want):
    if [i for i,x in enumerate(options)if sp.simplify(x-want)==0]!=[0]:raise AssertionError('Independent symbolic alternatives not unique')

def calibrate(x1,x2,y1,y2):
    x1,x2,y1,y2=numbers(x1,x2,y1,y2)
    if x1<=0 or x2<=0 or x1==x2:raise ValueError('Distinct positive reference outputs required')
    gain=sp.cancel((y2-y1)/(x2-x1));offset=sp.cancel(y1-gain*x1)
    if gain<=0:raise ValueError('Positive nonzero display gain required')
    return gain,offset

def network(shared,other):
    shared,other=positive(shared,other)
    return shared+shared*other/(shared+other)

def inverse_shared(total,other):
    total,other=positive(total,other)
    return (total-2*other+sp.sqrt(total**2+4*other**2))/2

def inverse_other(total,shared):
    total,shared=positive(total,shared)
    if not shared<total<2*shared:raise ValueError('Positive finite other branch requires shared<total<2shared')
    return shared*(total-shared)/(2*shared-total)

@lru_cache(maxsize=1)
def oracle():
    r,R,T,k1,k2=sp.symbols('r R T k1 k2',positive=True)
    law=r+r*R/(r+R);assert sp.cancel(law-r*(r+2*R)/(r+R))==0
    unique([law,2*r+R,r*R/(2*r+R),1/(2/r+1/R),r+R],law)
    discriminant=T**2+4*R**2;root=(T-2*R+sp.sqrt(discriminant))/2
    assert sp.simplify(root**2+(2*R-T)*root-T*R)==0
    assert sp.expand(discriminant-(T-2*R)**2)==4*T*R and (4*T*R).is_positive
    unique([root,(T-2*R-sp.sqrt(discriminant))/2,T-R,T*R/(T+R),(T+2*R+sp.sqrt(discriminant))/2],root)
    scaled=sp.cancel(law.subs({r:k1*r,R:k2*R})/law)
    preferred=k1*(k1*r+2*k2*R)*(r+R)/((k1*r+k2*R)*(r+2*R))
    unique([preferred,k1*k2,k1/k2,(k1*r+k2*R)/(r+R),1/k1],scaled)
    assert sp.cancel(sp.solve(sp.Eq(T,law),R)[0]-r*(T-r)/(2*r-T))==0
    aa,bb=network(2,2),network(3,6);assert(aa,bb)==(3,5)
    gain,offset=calibrate(aa,bb,7,11);assert(gain,offset)==(2,1)
    assert network(sp.Rational(5,2),4)==sp.Rational(105,26)
    assert inverse_shared(3,2)==2 and inverse_shared(5,6)==3 and inverse_shared(6,4)==4
    assert inverse_other(3,2)==2
    assert [3**2+4*2**2,5**2+4*6**2,6**2+4*4**2]==[25,169,100]
    Q=SI.Quantity;assert (Q(Fraction(2),'ohm')+Q(Fraction(2),'ohm')*Q(Fraction(2),'ohm')/(Q(Fraction(2),'ohm')+Q(Fraction(2),'ohm'))).to('ohm').magnitude==3
    return [aa,'Ω','T = r + r R / (r + R)','Da 3 a 5/3 Ω',inverse_shared(3,2),inverse_other(3,2),network(2,1)/aa,6-aa,'r = (T − 2R + √(T² + 4R²)) / 2','κ₁ (κ₁ r + 2κ₂ R) (r + R) / [(κ₁ r + κ₂ R) (r + 2R)]',bb/aa,(aa+bb)/2,sp.Integer(3),inverse_shared(sp.Rational(15,3),6),inverse_shared((13-offset)/gain,4),sp.Integer(2)]

MANUAL=['Ridurre prima il parallelo r||R=rR/(r+R), poi aggiungere il primo r in serie: S=r+rR/(r+R)=r(r+2 R)/(r+R). Per r=R=2 Ω: parallelo 1 Ω e totale 3 Ω. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Il totale S è resistenza, quindi Ω; somma e quoziente sono dimensionalmente coerenti perché rR/(r+R) ha Ω. Nella primaria prompt-only le alternative non erano aperte; nella successiva revisione tutte e cinque sono state lette e confrontate: solo Ω è resistenza. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'La topologia contiene un primo r in serie con due rami r e R fra la stessa coppia di nodi. Legge corretta S=r+rR/(r+R), non una serie di tre né un parallelo di tre. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Entrambi i resistori denominati r cambiano insieme da 2 a 1 Ω; R resta 2 Ω. Totale iniziale 3 Ω; finale 1+2/3=5/3 Ω. Non si cambia soltanto il resistore in serie. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Con S=3 Ω, R=2 Ω, moltiplico S(r+R)=r²+2 rR: r²+(2 R−S)r−SR=0 ⇒r²+r−6=(r−2)(r+3)=0. Radici 2 e−3 Ω: solo r=2 Ω è positiva e dà la rete richiesta. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Ponendo P=S−r, il parallelo soddisfa P=rR/(r+R). Si ricava R=r(S−r)/(2 r−S). ConS 3, r 2 Ω ottengo 2·1/1=2 Ω. In generale, per r, R finiti positivi occorre r<S<2 r. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'A=3 Ω. B con r 2, R 1 Ω:2+2/3=8/3 Ω. Rapporto(8/3)/3=8/9. Entrambi i resistori r restano 2 Ω. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Corretto 3 Ω, proposta 6 Ω: scarto+3 Ω. Sei sarebbe la serie di tutti e tre, una topologia diversa. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'S(r+R)=r²+2 rR ⇒r²+(2 R−S)r−SR=0. Discriminante(2 R−S)²+4 SR=S²+4 R². Radice positiva r=[S−2 R+√(S²+4 R²)]/2; l’altra è negativa perché il prodotto delle radici è−SR<0. Per S, R>0 esiste una sola r>0; le unità sotto radice sono Ω². Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Con r_B=κ₁r, R_B=κ₂R, S_B=κ₁r+(κ₁κ₂rR)/(κ₁r+κ₂R). Rapporto S_B/S_A ottenuto dividendo per r+rR/(r+R), equivalente a κ₁(κ₁r+2κ₂R)(r+R)/[(κ₁r+κ₂R)(r+2 R)]. Nessun denominatore nullo con dati positivi. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'A:3 Ω. B r 3, R 6 Ω:3+18/9=5 Ω. Rapporto 5/3. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Media delle uscite(3+5)/2=4 Ω. Ai dati medi r=5/2, R=4 Ω, S=5/2+20/13=105/26 Ω;105/26−4=1/26 Ω. Non si usa il modello sulle medie al posto della media richiesta. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Bersaglio(5/3)·3=5 Ω, con r_B 3 Ω. Il parallelo deve valere 2 Ω:2=3 R/(3+R)⇒R=6 Ω. Rapporto con R_A 2 Ω:3. Si ha 3<S 5<6, quindi dominio inverso rispettato. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'S_A 3 Ω con lettura 9 dà a=3 Ω⁻¹. Lettura 15 indica S 5 Ω, R 6 Ω. Equazione r²+7 r−30=(r−3)(r+10)=0; solo r=3 Ω positiva. È il valore di entrambi i resistori uguali. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'R_A 3 eR_B 5 Ω con letture 7,11 danno a=2 Ω⁻¹, b=1. Lettura 13 indica S 6 Ω, R 4 Ω. Equazione r²+2 r−24=(r−4)(r+6)=0, quindi r=4 Ω; radice−6 non fisica. Nella candidata la stessa resistenza totale della primaria è indicata con T.', 'Vincolo r=R=x>0. Il parallelo è x/2 e il totale 3 x/2. Misura 3 Ω impone x=2 Ω: seconda resistenza R 2 Ω e i due r anch’essi 2 Ω. Unica soluzione positiva. Nella candidata la stessa resistenza totale della primaria è indicata con T.']

DISTRACTORS=['6 Ω mette tutti gli elementi in serie; 2/3 Ω li mette tutti in parallelo; 1 Ω omette il resistore esterno; 2 Ω omette il blocco in parallelo.', 'S misura conduttanza, A corrente, V tensione e Ω² un prodotto privo del necessario denominatore. T è qui una resistenza, non una temperatura.', '2r+R tratta i tre elementi come serie; 1/(2/r+1/R) li pone tutti in parallelo; rR/(2r+R) altera il blocco; r+R elimina un ramo.', '2 Ω modifica soltanto il resistore esterno; 3/2 Ω scala anche R, rimasta invariata; 3 Ω ignora la modifica; 4 Ω aumenta mentre entrambe le occorrenze di r diminuiscono.', '−3 Ω è la radice negativa esclusa dalla passività; r=1 Ω dà T=5/3 Ω; r=3 Ω dà 21/5 Ω. Il totale non è una serie semplice r+R.', 'R=1 Ω dà T=8/3 Ω e R=3 Ω dà 16/5 Ω. I confini T=r e T=2r sono esclusi per un ramo R finito e positivo.', '9/8 è il reciproco; 1/2 segue soltanto R; 2/3 copia il valore numerico del parallelo finale in Ω; 1 ignora la variazione.', '−3 Ω inverte lo scarto; 6 Ω copia la proposta; zero la accetta; 2 è un rapporto adimensionale e non lo scarto.', 'Il segno meno davanti alla radice seleziona una resistenza negativa; T−R impone una falsa serie; TR/(T+R) impone un parallelo inesistente; +2R cambia il coefficiente della quadratica.', 'Prodotto e quoziente dei soli fattori omettono i pesi e le due occorrenze di r; il rapporto delle somme descrive un’altra rete; 1/κ₁ inverte anche una scalatura uniforme.', '3/5 è il reciproco; 3/2 segue soltanto r; 3 segue soltanto R; 2 confronta i blocchi in parallelo e omette il tratto esterno.', '105/26 Ω applica il modello ai dati medi; 8 Ω omette la divisione per due; 1 Ω è metà della differenza; 3 Ω ripete la prima prova. La differenza fra i due tipi di media è 1/26 Ω.', '1/3 è il reciproco; 5/3 copia il rapporto dei totali; 6 copia il valore numerico finale di R in Ω; 3/2 segue soltanto r. Il bersaglio rispetta r<T<2r.', '−10 Ω è la radice negativa; 5 Ω copia il totale; r=2 Ω con R=6 Ω dà T=7/2 Ω e lettura 21/2, non 15.', '6 Ω dà T=42/5 Ω; 2 Ω dà 10/3 Ω; 3 Ω dà 33/7 Ω; −6 Ω è l’altra radice, esclusa dalla passività.', '1 Ω copia il solo parallelo della prova corretta; 3 Ω copia il totale; −2 Ω non è passivo. La misura di T fissa la scala dopo il vincolo r=R.']

ASSUMPTIONS=['Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.', 'Resistori ohmici passivi positivi finiti e temperatura fissata; un elemento r esterno in serie con blocco r||R. Cambiare r modifica entrambe le occorrenze, non la topologia. T è resistenza totale candidata, corrispondente alla S/Rtot della primaria; R è soltanto il parametro del ramo. Inversa per R richiede r<T<2 r, inversa per r ha unica radice positiva per T, R>0.']

UNITS={1: 'ohm', 2: 'ohm', 3: 'ohm', 4: 'ohm', 5: 'ohm', 6: 'ohm', 7: '', 8: 'ohm', 9: 'ohm', 10: '', 11: '', 12: 'ohm', 13: '', 14: 'ohm', 15: 'ohm', 16: 'ohm'}

NUMERIC_UNITS={1: 'Ω', 5: 'Ω', 14: 'Ω', 6: 'Ω'}

SUFFIX={8: ' Ω', 12: ' Ω', 15: ' Ω', 16: ' Ω'}

NON_NUMERIC_DISTRACTORS={8: {'2'}, 16: {'Infinite resistenze positive'}}

SVG_REVIEW='XML e rendering nativo indipendente completo letti. Il resistore r esterno precede il nodo (300,240); i rami r e R condividono quel nodo e (550,240). Nel secondo pannello i segmenti 80+40 e 120+80 rappresentano 2+1 e 3+2 Ω con scala 40 coordinate/Ω. Nel terzo le barre 180,300,240 rappresentano 3,5,4 Ω con scala 60 coordinate/Ω. La didascalia distingue esplicitamente le scale fra pannelli; la scala è comune soltanto entro ciascun pannello. Gli zeri a x=125 sono liberi dagli assi.'

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


CANDIDATE_REF='8c30df9ded9344adddd257b241fbd103d3532fe1'

PRIMARY_SHA256='e8b27ab57d7cae8ac419227900fbb28282555d33ba3c3265e0e55199e19378bd'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='13109bdd5206ed33036194dbb4f5f05382e780581958924c009528be0528f626'

REVIEWED_BINDINGS_SHA256='a64b8a65f671b4969ed2d66fc3e165c8cae227b6ee6a37748bf75cf3b67d1c75'

REVIEWED_CANDIDATES={'AR-u6-series-parallel-resistor-network-01': '96416ad20861ad9fcea5a95cab7e4703aa28758bf1d6370172071e8301920747', 'AR-u6-series-parallel-resistor-network-02': '21dc8a283d17d13ce45ac3b0a8d924d02dce41ba0034571777618ee8f15db1ef', 'AR-u6-series-parallel-resistor-network-03': '3e319c805c3b0943a94ef43f3df238c99bdd5978655072e49d982f9c1f335d8b', 'AR-u6-series-parallel-resistor-network-04': 'dd749d314703c5c808fe00cbd72176568100618fa62b2f4ed536507f860bc8ad', 'AR-u6-series-parallel-resistor-network-05': 'a6c8213eab880f05f16c33392447402c65668328782a8703df14d1a841ab1bfb', 'AR-u6-series-parallel-resistor-network-06': '110853621595d72d41f50f6b5ff14b63e04642aee724fba9556509ad1a74abf4', 'AR-u6-series-parallel-resistor-network-07': '5536c7be9d68a9ce5197d261e59434f3f6338112b164a4e42981089587d30401', 'AR-u6-series-parallel-resistor-network-08': '69fb5bf7dceff79a4408ba7107e084e890cf18001131bb432e3a9384c1d03259', 'AR-u6-series-parallel-resistor-network-09': '0feb9db842ccae47798dc585def098959e538707437b545bd9040300e1dd8c80', 'AR-u6-series-parallel-resistor-network-10': '605d5d0711d0ab06a17cbf546d1cfe6733dfdbe218661a9d1435eedc0cde6420', 'AR-u6-series-parallel-resistor-network-11': '0198b3c2823d1a3f899f60aa4745ec0768569ad7ad3c471067216d01a3f06baf', 'AR-u6-series-parallel-resistor-network-12': '1d307e825514325a879fefbea73e1665eefd8a792add868fe984084350f40401', 'AR-u6-series-parallel-resistor-network-13': 'b1d18455a2d2bdce304d5cc46088ae478c733c354942813ecec7e7fd0b1ec16a', 'AR-u6-series-parallel-resistor-network-14': '8e60f53cb15ab7acf817bc6ddc3560e57c5ae7d200dc495602b9800cb9ed71a1', 'AR-u6-series-parallel-resistor-network-15': 'efc78ee5cf857f930cd1632e0ec0f839d44ba173655f446178ef202a2473918c', 'AR-u6-series-parallel-resistor-network-16': '98987bd98d480f1313995a74e83a70dc66f237233555314d1c0d9db02f5baf2c'}

READ_SOURCE_SHA256={'u6-series-parallel-resistor-network-01': '8cc97952bd0d4e4997a2ff620912e8da1e864ef6c665f04eff8a801959d33a25', 'u6-series-parallel-resistor-network-02': '1137d0a57c604863ba0f2266f0718ea5a081c7aa85c5eae7a9f92f449ae886d0', 'u6-series-parallel-resistor-network-03': 'f442e1a8c05beb6adeffd11cc7cc1c97a0645aaf6afcb0b79297092039f40562', 'u6-series-parallel-resistor-network-04': 'd486967cbf5146cd2279a28558b8471af336e357ab6208b4a919911551254ef2', 'u6-series-parallel-resistor-network-05': 'e804edb323fc7e7b59ef9ead640424c92b9595033b5f2edb7cd38ed6cf1073d8', 'u6-series-parallel-resistor-network-06': '0beac09ea91fe6e1134af73f44f6b0cf53389a3dcf346caf89df17a739e2c579', 'u6-series-parallel-resistor-network-07': 'f3cbcce31803d24c0752c34ddeed7b759fd46656a99897388e9a60718e8e27d9', 'u6-series-parallel-resistor-network-08': '3bd475921ee07e16d7e8bc06cefd5f3eb8b1d192f517444232a3ddcc3c55723c', 'u6-series-parallel-resistor-network-09': 'b094f1f26aee3fde46a17fe416776c4cc26a71fa12ba7eca23838036eadbf489', 'u6-series-parallel-resistor-network-10': 'e48ca988230b5b6cca2c8dce65132692d0ffea72f61ce4780ff05ad870a1bffa', 'u6-series-parallel-resistor-network-11': '097725a5cd6151cd8e400d3a382a869cce3d973f79aa8118ad29ae11975ab122', 'u6-series-parallel-resistor-network-12': 'cf77d20cb5a171f8843af9ed895c93dc54f961be9b89d937e14368372e6f2b83', 'u6-series-parallel-resistor-network-13': '5f2c1cd98c2cb07e83f4b53d37983f4e9acf699fb22d29838c79d94262bf446a', 'u6-series-parallel-resistor-network-14': '8daa1e01e769fea42fd0cdfbf2168fb5296db9f0a483cf64be4da3a39af383ba', 'u6-series-parallel-resistor-network-15': '013f8ae92efc6463542f13f763738ae7d1ec1049e84fb68ec6bb3f4d9643bf96', 'u6-series-parallel-resistor-network-16': '35f6e3bb6b139edb112943baf5dc57a1d98d8e296b874249ae164cf5a038d7df'}

SOURCE_READING='Tutti gli 80 originali U6-02 B205–209 sono stati letti e derivati da prompt e dati prima di candidati, alternative o chiavi. La primaria e8b27ab5 resta immutata. Successivamente ogni campo di ciascun record finale, tutte le alternative e i cinque SVG XML/native completi sono stati letti separatamente. Le correzioni B sono state rilette prima del congelamento; nessun modulo autore importato. Catalogo reale C4-L05/L06 riletto. UI del prodotto e approvazione umana NOT_RUN. Nessun push o upload durante il vincolo operativo ROOT.'
