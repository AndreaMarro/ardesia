"""Root independent Boltzmann multiplicity model, primary frozen before B189."""
from functools import lru_cache
import sys
import sympy as sp
from . import entropy_state_review as boundary
from .entropy_hot_cold_verifier import unique,calibrate
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-05.json'
PRIMARY_SHA256='582e30b76edaa9d53138240934256a3ff1224966737fcdb7b74defa578b21023'
CANDIDATE_REF='aeb9e7f01d9eb0a0020be3d7ef0e9ba55c08e4be'
FAMILY='statistical-entropy'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}

def coefficient(initial,final):
    initial,final=map(sp.sympify,(initial,final))
    if any(v.is_Integer is not True or v<=0 for v in (initial,final)):raise ValueError('Microstate multiplicities must be positive integers')
    return sp.expand_log(sp.log(final/initial)/sp.log(2),force=True)

def final_count(initial,z):
    initial,z=map(sp.sympify,(initial,z))
    if initial.is_Integer is not True or initial<=0 or z.is_real is not True:raise ValueError('Positive integer initial count and real coefficient required')
    result=sp.simplify(initial*2**z)
    if result.is_Integer is not True or result<=0:raise ValueError('Entropy inverse is incompatible with positive integer microstates; do not round')
    return result

def scaled_ratio(initial,final,k1,k2):
    initial,final,k1,k2=map(sp.sympify,(initial,final,k1,k2))
    base=coefficient(initial,final)
    if base==0 or k1<=0 or k2<=0:raise ValueError('Nonzero baseline coefficient and positive scales required')
    return sp.simplify(coefficient(k2*initial,k1*final)/base)

@lru_cache(maxsize=1)
def oracle():
    ni,nf,k1,k2=sp.symbols('ni nf k1 k2',positive=True);z=sp.symbols('z',real=True)
    inverse=sp.solve(sp.Eq(z,sp.log(nf/ni)/sp.log(2)),nf)[0]
    unique([ni*2**z,ni*z,2**z/ni,ni/2**z,ni+2**z],inverse)
    R=sp.symbols('R',positive=True)
    ratio=(sp.log(R)+sp.log(k1/k2))/sp.log(R)
    assert sp.simplify(sp.expand_log(sp.log(R*k1/k2)/sp.log(R)-ratio,force=True))==0
    unique([ratio,k1/k2,k2/k1,(sp.log(R)-sp.log(k1/k2))/sp.log(R),k1*k2],ratio)
    assert sp.expand_log(sp.log(2*ni)-sp.log(ni),force=True)==sp.log(2)
    aa,bb=coefficient(2,8),coefficient(1,2);assert (aa,bb)==(2,1)
    assert coefficient(8,2)==-2 and coefficient(3,3)==0
    gain,offset=calibrate(aa,bb,5,3);assert (gain,offset)==(2,1)
    assert final_count(8,-2)==2 and scaled_ratio(2,8,sp.Rational(1,4),sp.Rational(1,2))==sp.Rational(1,2)
    Q=boundary.SI.Quantity
    assert (Q(2,'J/K')/Q(1,'J/K')).to('dimensionless').magnitude==2
    n=sp.symbols('n',integer=True,positive=True);assert sp.expand_log(sp.log(4*n/n)/sp.log(2),force=True)==2
    return [aa,'1','ΔS = k_B ln2','Da 2 a 3',final_count(2,2),sp.Integer(8)/2**2,bb/aa,4-aa,'Ω_f = Ω_i 2^z','[ln R + ln(κ₁/κ₂)] / ln R',bb/aa,(aa+bb)/2,(sp.Integer(2)/2**(aa/2))/2,final_count(1,3/(6/aa)),final_count(2,(7-offset)/gain),'Infinite coppie intere positive']

NUMERIC_UNITS={n:'1' for n in (1,5,6,14)}
UNITS={n:('J/K' if n==3 else '1') for n in range(1,17)}
SUFFIX={}
DIMENSIONLESS_DISTRACTORS={}
EXACT_READ_EXPRESSIONS={}
ASSUMPTIONS='Boltzmann model S=k_B lnΩ with equiprobable microstates within each macrostate and k_B>0 in J/K. Ω_i,Ω_f are positive integer multiplicities, not simultaneously present particles. Comparing macrostates does not imply an isolated spontaneous process; z may be negative, zero, nonintegral or positive. Inverse counts must remain positive integers without rounding. Baseline z!=0 for ratios, scaled counts must be integers even for rational positive scale factors. Case16 leaves a positive integer scale, hence countably infinite solutions rather than a continuous family.'
SVG_REVIEW='Full XML and author-native PNG independently read:2/8 circles are alternatives, not particles. Fixed referenceΩ_i2 showsΩ2/4/8 andz0/1/2. Common-origin bars240/120/180 representz2/1/3/2. Table has integer pairs(1,4),(2,8),(3,12), coefficient2, no fractional interpolation. All labels visible. Asset-only independent reading, not product UI.'
DISTRACTORS=[
'4 is count ratio before log;3 omits initial entropy;6 subtracts counts;-2 reverses states.',
'J/K belongs to ΔS, not z;J,K,K^-1 do not survive cancelling units;dimensionless does not imply integer.',
'Doubling multiplicity adds k_Bln2;2S_i failsΩ_i1,zero ignores doubling,negative reverses order,2k_B substitutes2 forln2.',
'4 doubles z instead ofΩ;1 reverses change;2 ignores second case;6 multiplies exponents.',
'4 omits initial multiplicity;2 copies initial;6 adds instead of multiplying.',
'32 multiplies by4;4 is ratio rather than initial;8 givesz0.',
'2 reverses B/A;1 ignores ratio change;1/4 halves twice;negative reverses sign.',
'-2 reverses difference;4 copies proposal;0 accepts it;6 adds rather than subtracts.',
'Multiplication by z is not exponential inversion;reciprocals swap inputs or sign;sum does not reconstruct ratio.',
'Bare κ ratios ignore logarithms;minus inverts scale effect;product fails common scaling invariance.',
'2 reverses comparison;1/4 follows final count only;1 ignores change;negative flips sign.',
'3 omits division2;1/2 is half-difference;2 or1 copy one input;mean3/2 need not be an integer count.',
'2 reverses ratio;1 givesz0;1/4 requires forbiddenΩ_i1/2;4 givesz-2.',
'8 uses raw display asz;1 givesz0;3 copies reading;4 predictsD6.',
'16sqrt2 omits offset and is not an integer;8 copies only ratio;32 givesD9;4 givesD3.',
'(2,8) is only one example;four is ratio not number of solutions;none contradicts explicit examples;arbitrary positive reals violate integer counts.'
]

def verify(package,bindings,asset_root=None):return boundary.verify(sys.modules[__name__],package,bindings,asset_root)
def report(package,bindings,asset_root=None):return boundary.report(sys.modules[__name__],package,bindings,asset_root)

# Frozen after complete independent source-first and candidate/asset reading.
MANUAL=['Il coefficiente z=ΔS/(k_Bln2)=ln(Ω_f/Ω_i)/ln2. Con8/2=4=2², z2. Si usa un rapporto di conteggi, non ln8 soltanto.', 'z è adimensionale perché ΔS e k_Bln2 sono entrambi in J/K. L’entropia ΔS da sola resta dimensionata. L’unità corretta è1, non J/K.', 'Raddoppiare Ω produce ΔS=k_B[ln(2Ω)−lnΩ]=k_Bln2. La variazione è additiva costante, non il raddoppio dell’entropia iniziale.', 'Prima Ωf/Ωi=4 dà z2; dopo16/2=8 dà z3. L’aumento è1; il rapporto delle uscite è3/2. Distinguere aumento del conteggio da aumento del suo logaritmo.', 'Ω_f=Ω_i2^z. A z2, Ω_i2: Ω_f=2·4=8 microstati, intero positivo. Una soluzione reale non intera non sarebbe ammessa come conteggio nel modello.', 'Ω_i=Ω_f/2^z=8/4=2. Il reciproco del rapporto o la sottrazione dei conteggi non invertono il logaritmo.', 'A:log2(8/2)=2; B:log2(8/4)=1. Rapporto1/2. Aumentare il conteggio iniziale a finale fissato riduce la variazione, non il numero finale.', 'Correttoz2, proposta4: scarto+2, privo di unità. Non sono2 J/K; per ottenere l’entropia occorre moltiplicare per k_Bln2.', 'Ω_f=Ω_i exp(ΔS/k_B)=Ω_i2^z con z=ΔS/(k_Bln2). Ω_i e Ω_f devono essere interi positivi; z può essere non intero in generale. Non imporre z intero senza dati aggiuntivi.', 'Rapporto delle uscite=ln[(κ1Ω_f)/(κ2Ω_i)]/ln(Ω_f/Ω_i). Occorrono Ω_f≠Ω_i per la divisione, e i conteggi nuovi devono restare interi positivi. I fattoriκ possono essere razionali; il vincolo è sui prodotti. Non equivale aκ1/κ2 e non dipende dal solo logaritmo dei fattori.', 'A:Ωf8/Ωi2 dà z2. B:2/1 dà z1. Rapporto1/2, esatto. Le due distribuzioni hanno conteggi diversi e non si sostituisce la differenza Ωf−Ωi al rapporto.', 'Le due letture sono2 e1, media3/2. Non si mediaΩf eΩi prima del logaritmo; i medi5 e3/2 darebbero log2(10/3), diverso dalla media richiesta.', 'Targetz=2·(1/2)=1. Con Ωf_B2, 2/Ωi_B=2¹, dunque Ωi_B1. Rapporto richiesto Ωi_B/Ωi_A=1/2; nuovo conteggio resta intero.', 'Ref z2 con lettura6: a3. Lettura nuova3 dà z1. A Ωi1, Ωf=1·2¹=2. Non leggere3 come un conteggio di microstati.', 'RefA z2→5, refB z1→3: a=(5−3)/(2−1)=2 e b=1. Nuova lettura7 dà z=(7−1)/2=3. Con Ωi2, Ωf=2·2³=16. L’offset è essenziale; il conteggio finale è intero.', 'Ωf=4Ωi implica z=ln4/ln2=2 automaticamente. La misura non aggiunge un vincolo indipendente. Tutte le coppie(Ωi,Ωf)=(N,4N), N intero positivo, sono soluzioni: infinite numerabili. Non descrivere una famiglia continua, perché il dominio dei conteggi è discreto.']
REVIEWED_PACKAGE_SHA256='f6a8827cfd161695ffbb7e828eec1b0180ff363e3b74cfbcc934a8dbf60c3e4c'
REVIEWED_BINDINGS_SHA256='54a5e5b35248ef0ffac6be89f52cdf729847643b2881209fbb7874a308842276'
REVIEWED_CANDIDATES={'AR-u5-statistical-entropy-01': '878ac4369627394891bb1aee9e26e5ca34b0e49fb7044dabbcdecbea7dfbddbf', 'AR-u5-statistical-entropy-02': '08c335509dfe01b4a495f652cf7630bace86b6d47b97171569ac9fbedc9d6380', 'AR-u5-statistical-entropy-03': 'b285c08e7f3cda47c219e60c3653694aa81582c3077b005b440acbf42cde4d61', 'AR-u5-statistical-entropy-04': '62d2bf36f329c9838021b402ec6e6c03dcf3874622fd149249ac801daca55c91', 'AR-u5-statistical-entropy-05': '13d958f970e2553c6d7bd7d2f76e9d3c68b56c2f2f5b52874cd6dc7fe3e5328d', 'AR-u5-statistical-entropy-06': 'd2b792784b42bcf7774e315c9aaf5319ff802b8b572369340313eb9f45c1b91d', 'AR-u5-statistical-entropy-07': '646115946b9e0f0cb5f7e07a2504437a54750a2e284a77ad87c8da31ca024583', 'AR-u5-statistical-entropy-08': '9a0fdf9452e7e79e5e6e3aa723a29dcdecedf9539623ee9de2ea16c3508e6f28', 'AR-u5-statistical-entropy-09': 'ec30ee69a18ecff66d5f601beb566acfc51f6334118ac484fbe5b12727776936', 'AR-u5-statistical-entropy-10': 'd7947b9d86a566e540622c02a22dc97f34aca0b1d436b2e2786f7cab147b1f36', 'AR-u5-statistical-entropy-11': 'a1865f942526d588c8a745d0ed806a8074353b90ec39eb659bba7181885ca6d8', 'AR-u5-statistical-entropy-12': '8677628630a5c8fd85caa9badf1bfce4e17ed59dc0f27d8c337e02e35e2dc0da', 'AR-u5-statistical-entropy-13': 'b177d11fd88970946b086045bd8ce6f2a424797357d0bfb17aa01c9278441783', 'AR-u5-statistical-entropy-14': '5f2f06ddc0c8dddaec0016cdf97aa23f478ce48723b03b2e9f5b1dc9476df098', 'AR-u5-statistical-entropy-15': '3ddcaf69c41964b929979ea850c4dc7be253dff4e7b260568d876dd69b5afd1c', 'AR-u5-statistical-entropy-16': 'ccb40bb2be0b3012f0efc70f00b9032e28a5bee7f90fb4a98151c1e4d9f6552c'}
READ_SOURCE_SHA256={'u5-statistical-entropy-01': '9f5b27db39750790260def98dda55cf866c23fc8d705494af56e1185e9915ad1', 'u5-statistical-entropy-02': '1a5f1b4f988aa7d9a7bf6237d06eb61161f4186c1a9573ca7fecc9536ee5ab05', 'u5-statistical-entropy-03': 'bb714c038eee0386e95e4e674fa1227b31233afb8b29b86f465b8f3e9df398f2', 'u5-statistical-entropy-04': '096d5bba0173cb2229d15e3efc14fb1b0c580a69e4ef3109b62ee0b7c224208e', 'u5-statistical-entropy-05': '9f31b49c27b3060be56891added83b0349226d98d561c60b3783cd1bb48b19a1', 'u5-statistical-entropy-06': 'b410693776d8817399ec5b12e55bebc7b25cee6956cc359033301c2836a83c54', 'u5-statistical-entropy-07': 'e03d41c89d3996faf02f4e2c4b682f9e00cae359dc6f617485a871def41a5288', 'u5-statistical-entropy-08': '4f1f4b26f7883d8e7e0a483ae141fa6f0252992a4a4d66c341c9fc8563d0258f', 'u5-statistical-entropy-09': '7028216f8fe438dbf177059e57f82187fc7ba87d02cdd897c3f1658460cb4d31', 'u5-statistical-entropy-10': 'c53215f14f46c172532b74714d89b125f249150ccc68c55ad1a5597adcf20a11', 'u5-statistical-entropy-11': '8a845701ccb32ffe7a76556120674cc04d8dbb01a019fe09cf644b8d53a73518', 'u5-statistical-entropy-12': '88dc4424df5a85c93b14c22b75cf7797d41da6eeb2c4aee9369bbf2caf749bb2', 'u5-statistical-entropy-13': '4a6b527aecee0e9c0e978b71122f578d753fa8b0236288627f804f429ac113d0', 'u5-statistical-entropy-14': '4f73ee86319ee01bccf8b12e95100892254ac352bf5d32f9b382fa59eaea2751', 'u5-statistical-entropy-15': 'b8389356e9dea295353901635fc0a7337942e7c9ffb42e138cf26f406349ff0d', 'u5-statistical-entropy-16': '11d757165676f7e275cf5d98e83b301013b129ee42fb4f3a423701b50561bc2e'}
