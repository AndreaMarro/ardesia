"""Root independent ideal-gas state entropy model, primary frozen before A188."""
from functools import lru_cache
import sys
import sympy as sp
from . import entropy_state_review as boundary
from .entropy_hot_cold_verifier import unique,calibrate
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U5-05.json'
PRIMARY_SHA256='582e30b76edaa9d53138240934256a3ff1224966737fcdb7b74defa578b21023'
CANDIDATE_REF='4bfa274ece45a81f0640f9ca96472cec77dd3185'
FAMILY='ideal-expansion-entropy'
EXPECTED_IDS={f'AR-u5-{FAMILY}-{n:02}' for n in range(1,17)}

def finite_reals(*values):
    values=tuple(map(sp.sympify,values))
    if any(v.is_real is not True or v.is_finite is not True for v in values):raise ValueError('Finite real model quantities required')
    return values

def entropy(B,r):
    B,r=finite_reals(B,r)
    if B<=0 or r<=0:raise ValueError('Positive fixed sample B and positive volume ratio required')
    return sp.expand_log(B*sp.log(r)/sp.log(2),force=True)

def inverse_B(change,r):
    change,r=finite_reals(change,r)
    if r<=0 or r==1 or change*sp.log(r)<=0:raise ValueError('Inverse requires r>0, r!=1 and compatible entropy sign')
    return sp.simplify(change*sp.log(2)/sp.log(r))

def inverse_ratio(change,B):
    change,B=finite_reals(change,B)
    if B<=0:raise ValueError('Positive B required')
    return 2**(change/B)

@lru_cache(maxsize=1)
def oracle():
    B,r,k1,k2=sp.symbols('B r k1 k2',positive=True);S=sp.symbols('S',real=True)
    law=B*sp.log(r)/sp.log(2);inverse=sp.solve(sp.Eq(S,law),B)[0]
    unique([S*sp.log(2)/sp.log(r),S*sp.log(r)/sp.log(2),sp.log(r)/(S*sp.log(2)),S/(sp.log(2)*sp.log(r)),S+sp.log(r)],inverse)
    ratio=sp.cancel(law.subs({B:k1*B,r:k2*r})/law)
    unique([k1*sp.log(k2*r)/sp.log(r),k1*k2,k1/k2,k1*sp.log(r)/sp.log(k2*r),k1+k2],ratio)
    aa,cc=entropy(2,2),entropy(4,4);assert (aa,cc)==(2,8)
    assert entropy(3,sp.Rational(1,2))==-3 and entropy(3,1)==0
    gain,offset=calibrate(aa,cc,5,17);assert (gain,offset)==(2,1)
    assert sp.simplify(3*sp.log(3)-5*sp.log(2))==sp.log(sp.Rational(27,32))
    Q=boundary.SI.Quantity
    assert (Q(24,'dimensionless')/Q(3,'K/J')).to('J/K').magnitude==8
    assert (Q(6,'dimensionless')/Q(2,'J/K')).to('K/J').magnitude==3
    Btwo=sp.solve(sp.Eq(B+2*B,12),B)[0];assert Btwo==4
    assert (Btwo+2*Btwo)-Btwo==8 # gas plus source, not gas alone
    return [aa,'J/K','È uguale e positiva nei due percorsi','Da 2 a 4 J/K',inverse_B(2,2),inverse_ratio(2,2),entropy(2,4)/aa,4-aa,'B = ΔS ln 2 / ln r','κ₁ ln(κ₂ r_A) / ln r_A',cc/aa,(aa+cc)/2,inverse_ratio(4*aa,4)/2,inverse_B(24/(6/aa),4),inverse_B((9-offset)/gain,2),3*Btwo-Btwo]

NUMERIC_UNITS={1:'J/K',5:'J/K',6:'1',11:'1',13:'1',14:'J/K'}
UNITS={n:('1' if n in (6,7,10,11,13) else 'J/K') for n in range(1,17)}
SUFFIX={n:' J/K' for n in (8,12,15,16)}
DIMENSIONLESS_DISTRACTORS={8:{'2'}}
EXACT_READ_EXPRESSIONS={'3 ln 3 / ln 2':3*sp.log(3)/sp.log(2)}
ASSUMPTIONS='Closed ideal-gas sample with fixed n within each process; initial/final equilibrium at the same positive absolute temperature. B=nR ln2>0. Different B compares separate preparations. Entropy is a state function, not actual irreversible heat divided by T. Volume ratios are positive, inverse B and nonzero baseline ratios exclude r=1. Two-step case: one reversible isothermal doubling with one source, then isolated rigid-container free expansion by four; ideal mechanical devices add no entropy.'
SVG_REVIEW='Full XML and author-native PNG independently read. Equal-section volumes1L/2L have widths100/200. Common-origin bars90/360/225 represent2/8/5J/K. Separate signed bars+300/-100/+200 fromx250 representgas+12/source-4/total+8J/K, common scale25; no source/total sign confusion, all labels readable. This is asset-only reading, not product UI.'
DISTRACTORS=[
'4 replaces a logarithm by r;0 confuses isothermal with isentropic;-2 is compression, not doubling.',
'J is energy,K temperature,W power,m³ volume; log ratios preserve the J/K of B.',
'Zero production in a reversible complete process does not imply zero gas entropy. Same endpoints rule out unequal gas changes; Q_actual/T is invalid for arbitrary irreversible paths.',
'One and eight imply inverse or quadratic dependence on B; unchanged two ignores sample size; zero ignores expansion.',
'B equals2 at r2;4 and1 spuriously multiply/divide by volume ratio. r1 would not identify B.',
'One is the log coefficient;4 doubles it;1/2 reverses sign;r0 invalid.',
'4 copies the argument instead of its exponent;1/2 reverses the ratio;negative sign impossible for two expansions.',
'-2 reverses subtraction;4 copies proposal;0 accepts error;bare2 is a dimensionless ratio, not an entropy difference.',
'Only multiplication by ln2 and division by lnr isolate B. Reciprocal has K/J; addition mixes dimensions.',
'Linear κ factors fail logarithmic scaling. Reciprocal logs reverse comparison and can diverge when new entropy is zero; sum fails identical-sample test.',
'2 counts only one change;8 omits baseline division;1/4 reverses ratio.',
'10 omits division by2;5/2 divides twice;4 is not mean;model at mean inputs gives ln27/ln2, not ln32/ln2.',
'4 is target factor or final r, not r_C/r_A;1/2 reverses comparison;1 misses target.',
'12 interprets the display as entropy;8 stops before dividing by two doublings;2 predicts display12.',
'9/2 omits offset, predicts10;8 omits gain;2 and3 predict5 and7.',
'0 wrongly treats free expansion as reversible;4 is first step only;6 halves datum without balance;12 ignores source loss.'
]

def verify(package,bindings,asset_root=None):return boundary.verify(sys.modules[__name__],package,bindings,asset_root)
def report(package,bindings,asset_root=None):return boundary.report(sys.modules[__name__],package,bindings,asset_root)

# Frozen after complete independent source-first and candidate/asset reading.
MANUAL=['Usare B=nR ln2: ΔS=B ln(r)/ln2. A r=2 il rapporto dei logaritmi vale1, quindi ΔS=2 J/K. Nessun valore decimale di ln2 è necessario.', 'ΔS è entropia, dimensione energia/temperatura, J/K. B ha le stesse unità; ln di un rapporto positivo è adimensionale. Non confondere ΔS con il suo coefficiente normalizzato.', 'L’entropia del gas è funzione di stato: stessi stati iniziale e finale implicano identica variazione positiva nR ln(V_B/V_A). L’irreversibilità cambia la produzione totale gas+ambiente, non questa differenza. Non usare Q_irrev/T come variazione del gas.', 'A r=2, ΔS=B: passando B2→4 J/K si passa ΔS2→4 J/K. È proporzionalità a B a rapporto di volumi fissato. Cambiare B confronta campioni/preparazioni, non cambia n dello stesso campione chiuso.', 'B=ΔS ln2/lnr; a r=2 ottengo B=2 J/K. In generale questa inversione richiede r≠1: a r=1 si misura sempre zero e B non è identificabile.', 'Da ΔS/B=lnr/ln2 segue r=2^(ΔS/B). Il rapporto è1, perciò r=2>0. Un rapporto di volumi è adimensionale, non un volume assoluto.', 'A:ΔS2. B:ΔS=2 ln4/ln2=4. Il rapporto B/A è2, poiché ln4=2ln2. Si raddoppia il numero di raddoppi, non il valore di r stesso.', 'Valore corretto2 J/K; proposta4 J/K; scarto proposto−corretto=+2 J/K. L’errore non è−2 e non è la proposta stessa.', 'B=ΔS ln2/lnr con r>0 e r≠1. B>0 impone che ΔS e lnr abbiano lo stesso segno. Il testo fonte dà solo r>0: richiedere esplicitamente il ramo identificabile nel candidato; a r=1, ΔS=0 rende indeterminata B.', 'Divido ΔS_B=κ1B ln(κ2r)/ln2 per ΔS_A=B lnr/ln2: rapporto κ1 ln(κ2r)/lnr, valido per r>0, κ2r>0, r≠1, κ1>0. Il rapporto può anche essere zero o negativo secondo il volume finale; non è κ1κ2. Evidenziare il denominatore non nullo nel candidato.', 'A:2·1=2 J/K; B:4·2=8 J/K. Rapporto8/2=4. I cambiamenti di campione e rapporto di volumi sono entrambi applicati prima di dividere.', 'Prima2, seconda8 J/K: media(2+8)/2=5 J/K. Le medie degli ingressi B3 e r3 darebbero3ln3/ln2, che non è il conto richiesto e non va approssimato numericamente.', 'Target4·2=8 J/K. Con B_B4, ln(r_B)/ln2=8/4=2, quindi r_B4. Il rapporto richiesto r_B/r_A=4/2=2, distinto dal rapporto degli incrementi di volume.', 'Taratura positiva senza offset:6/2=3 unità strumentali per(J/K). Nuova entropia24/3=8 J/K. A r4 si hanno due raddoppi, perciò B8/2=4 J/K. La taratura è una conversione, non una nuova legge termodinamica.', 'Riferimenti ΔS_A2 e ΔS_B8 J/K, letture5 e17: a=(17−5)/(8−2)=12/6=2 K/J nelle unità del display; b=5−2·2=1. Lettura9 dà ΔS=(9−1)/2=4 J/K. A r2 segue B4 J/K. Sottrarre l’offset prima di dividere.', 'Stesso gas: prima r2, poi r4, totale r8 e ΔS_gas=3B=12 J/K, dunque B4 J/K. Primo tratto reversibile: gas+4 e sorgente−4, totale0. Espansione libera ideale isolata: ΔU0, quindi T invariata, Q=W=0 ma ΔS_gas=2B=8 J/K. La sorgente non partecipa al secondo tratto. Aumento complessivo8 J/K, non12 e non0.']
REVIEWED_PACKAGE_SHA256='a27330a461bffe1f75ca72f263d3df020fb02a14f5190b98aeba7adbe1ee7915'
REVIEWED_BINDINGS_SHA256='66e3572def81150c6d9d1ce6154a77e626ce4f62cc3edb25fcf94eb2fd913377'
REVIEWED_CANDIDATES={'AR-u5-ideal-expansion-entropy-01': '8eaae88541cd603a95919ea724ff37a53ab1d3fa55be01d31013f6260062fdc2', 'AR-u5-ideal-expansion-entropy-02': '220232cc2597942760363e6b97a84e8d679d543668c5db636462b9c3ec88c16c', 'AR-u5-ideal-expansion-entropy-03': '9c082cc294545e3bdd528afa8f6a47009de1fbddae3c2d3b4246ecf917cb8343', 'AR-u5-ideal-expansion-entropy-04': '9fe3463cb6e4bb5a5caf7bfc7dc5adbb866438e36827bd42e06c8570041e6b28', 'AR-u5-ideal-expansion-entropy-05': '0dd18642127f93c29645ce3fcf9bb3bbc6e0b25011a4c54784718cc5e20a70b7', 'AR-u5-ideal-expansion-entropy-06': '4c2d3c641a8b947e2b5a20e7542a823282cb0cb78cce6c1f1655cee525580e66', 'AR-u5-ideal-expansion-entropy-07': 'd1224412569bd4767eee8c84a5a1789e83168010281f2cd7c51dabc295d66755', 'AR-u5-ideal-expansion-entropy-08': '69cd0bd6169ec2d9e8db898015c8feed251db0c5bc263078a9c916724c7e501c', 'AR-u5-ideal-expansion-entropy-09': 'd56c840437f555a30be6e1de9f45e5fe148817dee418b4c4ccfd36b83ed17905', 'AR-u5-ideal-expansion-entropy-10': '798857c87ba8df329dc2dd0ee3952eac01c07b03fdf2c508ad711b90258d99c1', 'AR-u5-ideal-expansion-entropy-11': '7b38473ceeec0513e2ffea92bca41b9de38c3c797dc30d706a284fbe456358e5', 'AR-u5-ideal-expansion-entropy-12': '073edb221af5919e5f6d3955c254aa67e2e78beb37a68d8fa647c700ff4b7e51', 'AR-u5-ideal-expansion-entropy-13': 'ccd3e4241d359e1387dfd8640abd3de4001899c82e5cc77146f6535d37523505', 'AR-u5-ideal-expansion-entropy-14': 'cbba1a59075f497a5f96f031fe81ce16328affe0e012ed773f5711f01df0d4e2', 'AR-u5-ideal-expansion-entropy-15': 'f551e18ad41a15f6112926e4dc33301c18ca1bd3f8cf3ef2d8384b3fe6179667', 'AR-u5-ideal-expansion-entropy-16': 'cc235ef3da949fea9f6de53de5ad944c768c0aaf5ba2f4204270bbf0ae832809'}
READ_SOURCE_SHA256={'u5-ideal-expansion-entropy-01': '199a4736ef0488286bb331a7d0af612968f87749ba3fe433fecb90ec8d24ee28', 'u5-ideal-expansion-entropy-02': 'b0b28a1d825417cd30c699d6ed1701963bf6a789a4ec19f8d5fe871364e61ef0', 'u5-ideal-expansion-entropy-03': '77b87e71991f32cd99abc09044179fc0aea379962938fe85b1a6743e0b23d318', 'u5-ideal-expansion-entropy-04': '50a38ce0fde7b014b00c489c64a6ea2c79db83fc3a1d790d9a49953a82df2d8e', 'u5-ideal-expansion-entropy-05': '9b16603194b0da26c2b45b313c878e326b4c6274af6ea3d6ae66f8ddce04bd9c', 'u5-ideal-expansion-entropy-06': 'cfae0068dcba9096e7f348d9903a9264cfad58e6284cd110ed3a63f9fc5ac499', 'u5-ideal-expansion-entropy-07': 'b59fb5b53467075adff7c45e54e83f35c1023916cdd567ad3248399cf2e72e3f', 'u5-ideal-expansion-entropy-08': '4cfc31b62450afc55a096842a95ec4cd02f9ae4199b595108787386bc6590712', 'u5-ideal-expansion-entropy-09': 'e8cbb158cbc3eaeebc9f6f8ab9457dddc9374dbb75101de6ed20a7e988aaa9d7', 'u5-ideal-expansion-entropy-10': '61bb38d7ce61a208d2638f28b7cc76cdf76dbf26550bea710f1f7a21c00c21bd', 'u5-ideal-expansion-entropy-11': '56fd8788973e4af6c593d8b498544e94067826f165708bffa745174c170b1c25', 'u5-ideal-expansion-entropy-12': 'c8e3b0cfda3ec01890bbdad4de96cca6b82dc3b6bb9b379fbb0d881dc0611210', 'u5-ideal-expansion-entropy-13': '9b1949474f2b061ad4076a4868e44f0989834ae510c380134e371fdb8dba7a81', 'u5-ideal-expansion-entropy-14': 'a9d350625eff368f93af6f36aaf4442795ce027de3c5f79d9df95452b369b81c', 'u5-ideal-expansion-entropy-15': '69603ebe0f12ab756e534e024ef3d64bf688ad1a21bf478cc5f0290d37ee938f', 'u5-ideal-expansion-entropy-16': '063b89aff1e471e1ebd9977558228f9e03da573c5b2cf22f32c0872aa2d98de1'}
