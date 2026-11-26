"""Distinct individual reviewer; no authoring import and no human approval."""
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import electric_exact_literals as codec
from .electric_exact_literals import exact_literal,numeric_lexeme
from . import radiation_attenuation_review_models as model
SI=pint.UnitRegistry(non_int_type=Fraction)
def unique(values,want):
    if [i for i,v in enumerate(values)if sp.simplify(v-want)==0]!=[0]:raise ValueError('Independent general symbolic laws not unique')
def decode_numeric(raw):
    if raw=='e':return sp.E
    return exact_literal(raw)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json'
FAMILY='infer-attenuation-coefficient'
EXPECTED_IDS={'AR-u7-infer-attenuation-coefficient-06', 'AR-u7-infer-attenuation-coefficient-15', 'AR-u7-infer-attenuation-coefficient-07', 'AR-u7-infer-attenuation-coefficient-04', 'AR-u7-infer-attenuation-coefficient-12', 'AR-u7-infer-attenuation-coefficient-02', 'AR-u7-infer-attenuation-coefficient-09', 'AR-u7-infer-attenuation-coefficient-16', 'AR-u7-infer-attenuation-coefficient-01', 'AR-u7-infer-attenuation-coefficient-08', 'AR-u7-infer-attenuation-coefficient-10', 'AR-u7-infer-attenuation-coefficient-11', 'AR-u7-infer-attenuation-coefficient-13', 'AR-u7-infer-attenuation-coefficient-14', 'AR-u7-infer-attenuation-coefficient-05', 'AR-u7-infer-attenuation-coefficient-03'}
REVIEWED_SKILLS={1: 'C5-L07', 2: 'C5-L07', 3: 'C5-L07', 4: 'C5-L07', 5: 'C5-L07', 6: 'C5-L07', 7: 'C5-L07', 8: 'C5-L07', 9: 'C5-L07', 10: 'C5-L07', 11: 'C5-L07', 12: 'C5-L07', 13: 'C5-L07', 14: 'C5-L07', 15: 'C5-L07', 16: 'C5-L07'}

@lru_cache(maxsize=1)
def oracle():
    I,I0,x,a,d,L,k1,k2=sp.symbols('I I0 x a d L k1 k2',positive=True)
    q=sp.log(I0/I,2)
    unique([q/x,-q/x,x*q,I0/(I*x),q/x**2],q/x)
    unique([I0*2**(-a*d),I0*2**(a*d),I0/(a*d),I0-a*d,2**(-a*d)/I0],I0*2**(-a*d))
    unique([(L-sp.log(k1,2))/(k2*L),k1/k2,k2/k1,(L+sp.log(k1,2))/(k2*L),k1*k2],(L-sp.log(k1,2))/(k2*L))
    d=model.primary_only_derivations()[249]
    out=[d[n]for n in range(1,17)]
    out[1]='cm⁻¹'
    out[2]='α = log₂(I₀ / I) / x'
    out[3]='Da 4 cm⁻¹ a 2 cm⁻¹'
    out[8]='I = I₀ 2^(−ad)'
    out[9]='(L − log₂ κ₁) / (κ₂ L)'
    return out

MANUAL=['La legge I=I₀exp(−μd), I₀64 mW/m², dà a=μ/ln 2=log₂(I₀/I)/d. Con I 4 e d 1 cm, rapporto 64/4=16=2⁴: a 4 cm⁻¹. L’argomento del logaritmo è un rapporto puro, non una intensità dimensionata.', 'a=μ/ln 2 ha inversolunghezza, non il numero normalizzato α. Nella primaria nessuna alternativa era aperta; dopo il congelamento tutte e cinque sono state lette individualmente.', 'La relazione fisica è a=ln(I₀/I)/(d ln 2), con I₀64 mW/m² e 0<I<I₀. In numeri i=I/(1 mW/m²), x=d/(1 cm), a/(1 cm⁻¹)=log₂(64/i)/x. μ=(ln 2)a: non si aggiunge un secondo cm⁻¹ a un a che ha già quell’unità.', 'A d 1 cm, I 4→16 mW/m² riduce log₂(64/I) da 4 a 2, quindi a 4→2 cm⁻¹. Una maggiore intensità trasmessa a parità di incidente e spessore indica minore attenuazione.', 'Da a d=log₂(I₀/I), I=I₀2^{-ad}. Per a 4 cm⁻¹, d 1 cm l’esponente è 4 e I=64/16=4 mW/m². Il prodotto ad è puro.', 'Isolo d=log₂(I₀/I)/a. Con I 4 mW/m², logaritmo 4 e a 4 cm⁻¹, segue d 1 cm. Tutti i denominatori sono positivi finiti.', 'A a 4 cm⁻¹. A I 4 fissata ma d 2 cm, B dàa 2 cm⁻¹. Rapporto 1/2: le prove descrivono coefficienti inferiti diversi, non lo stesso materiale a spessori diversi con identica trasmissione imposta senza spiegazione.', 'Proposto 8 cm⁻¹ meno corretto 4 cm⁻¹=+4 cm⁻¹. Il numero puro 2 è il rapporto delle proposte, non lo scarto del coefficiente.', 'Da a d=log₂(I₀/I), esponenzio: I₀/I=2^{ad}, perciò I=I₀2^{-ad}. Nelle unità assegnate I/(1 mW/m²)=64·2^{-ad}. Con a, d>0 risulta strettamente 0<I<64 mW/m².', 'Con I_B=κ₁I_A e d_B=κ₂d_A, a_B/a_A=[ln(I₀/(κ₁I_A))]/[κ₂ln(I₀/I_A)]=[ln(I₀/I_A)−lnκ₁]/[κ₂ln(I₀/I_A)]. Occorre 0<κ₁I_A<I₀, oltre aκ₂>0. I logaritmi restano esatti; non è una semplice potenzaκ₁/κ₂.', 'A:I 4, d 1→a 4 cm⁻¹. B:I 16, d 2→a=2/2=1 cm⁻¹. Rapporto 1/4. I due cambiamenti riducono entrambi il coefficiente inferito.', 'Media(4+1)/2=5/2 cm⁻¹. Ai dati medi I 10 mW/m², d 3/2 cm si avrebbe(2/3)log₂(32/5) cm⁻¹, forma simbolica esatta diversa. Poiché 4<32/5<8, quel valore è fra 4/3 e 2, quindi inferiore a 5/2 senza calcolatrice.', 'Bersaglioa_B=(1/4)·4=1 cm⁻¹. Con I_B 16 mW/m², log₂(64/16)=2 e d_B=2 cm. Rapporto d_B/d_A=2.', 'Attenzione al testo fonte: la catena S=a_cal·a=μ/(ln 2) confonde la taratura con la definizione della grandezza. Interpreto separatamente a=μ/ln 2 e il modello strumentale inteso D=g a, da rendere esplicito in nuova edizione. Riferimento a 4 e lettura 12→g 3; nuova lettura 3→a 1 cm⁻¹. Con d 2 cm, I=64·2⁻²=16 mW/m². Non approvo la catena letterale ambigua.', 'La fonte scrive la catena S=a_cal·a=μ/(ln 2)+b: la nuova edizione deve separare a=μ/ln 2 dal displayD=g a+b. Nell’interpretazione strumentale: a_A 4, a_B 1, D_A 9, D_B 3→g 2, b 1. D_C 5→a_C 2 cm⁻¹; d 1 cm dàI=64/4=16 mW/m². La precisazione è parte della derivazione, non un’approvazione della prosa fonte.', 'Caso autonomo con fondo: S(d)=I₀exp(−μd)+B. Le differenze 24−16=8 e 16−12=4 eliminano B. Con passo 1 cm, il rapporto delle differenze èexp(−μ·1 cm)=4/8=1/2. Quindi μ=(ln 2)cm⁻¹, a 1 cm⁻¹. Si può verificare I₀32 e B 8: letture 16+8, 8+8, 4+8. Non si applica il rapporto diretto 24/16 perché il fondo non è nullo.']

DISTRACTORS=['a 4 cm^-1:64/4=2^4, d 1.16 copia rapporto, 2→I 16, 8→I 1/4.', 'a inversolunghezza perchéln 2 puro; cm d, 1 alpha, W/m² I, J energia.', 'log 2(I₀/I)/x: rapporto inverso negativo, prodottoconx non inversa, rapporto nonlogaritmo confonde esponente, quadrato assente.', 'a 4→2 a stessod.16 segueIdiretto, 1 proporzione 1/I erronea, 4 ignora, negativo amplifica.', 'I 4=64/16; 16→esponente 2, 1024 segno+, 64 nessunastrato.', 'd 1 cm=4/(4 cm^-1); 4 dà 16 dimezzamenti, 1/4→I 32, 2→1/4.', '1/2 da a 2/a 4; 2 reciproco, 1 forzastesso μ, 1/4 e 4 quadrati.', '+4 cm^-1=8−4; −4 ordine, 2 rapporto, 8 proposta, 0 ignoraverifica I 1/4.', 'I₀2^-ad; segno+ amplifica, 1/ad nonesponenziale, I₀−ad dimensioni diverse, 1/I₀ intensitàinversa.', '(L−log₂κ₁)/(κ₂L); rapporto direttoκ₁/κ₂ falso, κ₂/κ₁ inverso nonsalva, segno+ falso, prodottosenzalog.', '1/4=aB 1/aA 4.4 reciproco, 1/2 solo effetto, 2 rende diretto d, 1 ignora.', '5/2 media 4/1; 3/2 semidifferenza, 5 somma, 4/1 una prova.', 'dB 2 cm, rapporto 2.1→a 2, 4→a 1/2; 1/4 copia target, 1/2 reciproco.', 'g 3, D 3→alpha 1, d 2→I 16; I 1→D 9, 4→D 6. Separata definizione fisicaa da guadagno g.', 'g 2, b 1, D 5→alpha 2, d 1→I 16. Omettereb dà 5/2; I 4→D 9, I 32→D 3.', 'Differenze 8, 4→q 1/2, a 1 cm^-1. A 32, B 8 riproducono 24/16/12; rapporti grezzi 16/24, 12/16 includonoB; a 2 darebbeq 1/4.']

ASSUMPTIONS=['I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'Caso dimensionale autonomo; tutte le alternative confrontate dopo la primaria.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'I₀64 mW/m² fissata e 0<I<I₀, d>0, coefficiente costante entro lastra ma variabile fra preparazioni. a=μ/ln 2 ha cm⁻¹, α=a/(1 cm⁻¹) è puro; display continuo D=gα+b distinto dalla legge fisica. Nel 16 nessuna I₀64: ampiezza A>0 e fondo B≥0 ignoti costanti, tre spessori equidistanti.', 'Caso autonomo S(d)=Aexp(-μd)+B, A>0, B≥0 costanti ignoti; letture 24/16/12 nella stessa unità, d 1/2/3 cm equidistanti. L’incidente 64 non si applica; μ positivo ricostruito dalle differenze.']

UNITS={1: '1/centimeter', 2: '1/centimeter', 3: '', 4: '1/centimeter', 5: 'milliwatt/meter**2', 6: 'centimeter', 7: '', 8: '1/centimeter', 9: 'watt/meter**2', 10: '', 11: '', 12: '1/centimeter', 13: '', 14: 'milliwatt/meter**2', 15: 'milliwatt/meter**2', 16: '1/centimeter'}

NUMERIC_UNITS={1: 'cm⁻¹', 5: 'mW/m²', 6: 'cm', 14: 'mW/m²', 15: 'mW/m²', 16: 'cm⁻¹'}

SUFFIX={8: ' cm⁻¹', 12: ' cm⁻¹'}

NON_NUMERIC_DISTRACTORS={8: {'2'}}

SVG_REVIEW='XML e nuovo native completo 640 × 1600 letti. Prime barre 320/160/80/40/20 per 64/32/16/8/4 a spessori 0, 1/4, 1/2, 3/4, 1 cm; tutte stessa scala 5. Coefficienti a 4/1/5/2 con barre 320/80/200, scala 80. Caso autonomo fondo: barre totali 240/160/120 per 24/16/12, scala 10 e tratto grigio 80 comune perB 8. Contributi blu 160/80/40 per 16/8/4, differenze 8/4 e q 1/2. Nessuna imposizione dell’I₀64 di altre domande.'

CALCULATION_SCOPE={2: 'NO_STUDENT_CALCULATION', 9: 'SYMBOLIC_MANUAL_DERIVATION', 10: 'SYMBOLIC_MANUAL_DERIVATION', 3: 'SYMBOLIC_MANUAL_DERIVATION'}

CANDIDATE_REF='3ed5ca7c8fdd2897e67299294da25ef897b33ac2'

PRIMARY_SHA256='6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08'

REVIEWED_MODEL_SHA256='c74b1d7f639531452c09fc4dc017b6c42d6ca298f58957e09e372092f0ca4b47'

REVIEWED_LITERAL_CODEC_SHA256='b5bee6c1a62197d5ef83e52ca28746344b67d77d2447ea144f582dd76f60bbbc'

REVIEWED_PACKAGE_SHA256='a06756250ef664f727e83cd091eb2cbe07917a55968f8d9ed57f5ac755435764'

REVIEWED_BINDINGS_SHA256='37e9b7b8ad6c98aef0ccdad36bd5b1bf9d3fb5bd53e9221b73090370e8639504'

REVIEWED_CANDIDATES={'AR-u7-infer-attenuation-coefficient-01': 'ec42d3aa67b43cf04aa1d3b2bf954897e4b17f45a2e1930a747873475da342d6', 'AR-u7-infer-attenuation-coefficient-02': '7c58c775d7ff2cd5d47c08c3bcad24625a39b4cbf9e2162eabfeed5ece23561b', 'AR-u7-infer-attenuation-coefficient-03': '8ef6e30c91713614bce578100e1fee4db8df0e556db9dab2cd788bc3a25630b8', 'AR-u7-infer-attenuation-coefficient-04': '9cf19ef1ad1999a57f0cd822817008976e3af74e41cc0747f86f32e1801c0641', 'AR-u7-infer-attenuation-coefficient-05': '475abac15946636d67015012d465754da1fefb7ffc23d9d3fd19515108cb02d7', 'AR-u7-infer-attenuation-coefficient-06': '7e5611617798f990f915e259870e634bd1e755fd0972884e5e72dee8115de67a', 'AR-u7-infer-attenuation-coefficient-07': '8c7758e9f40f4047327cb459e1e461f43b8ef3bd304557cb3944ecd5f4a6239f', 'AR-u7-infer-attenuation-coefficient-08': '8d95b15a8f5d4001639e5b467dcc6b456a6497e93d36e149293af56fd2c7fa90', 'AR-u7-infer-attenuation-coefficient-09': '94800d38f8947db36d00c11508d7cf0be66f82d6fd461476ee515a53bde1a1b9', 'AR-u7-infer-attenuation-coefficient-10': '395be7674ea22d7050f60fcb5aed4317ca94f464b86fbb01505cbbd1ec5deb04', 'AR-u7-infer-attenuation-coefficient-11': '470742decdc46d1c48e91f41d9d9d18b85ceca59815403a7b4320d1de3af3774', 'AR-u7-infer-attenuation-coefficient-12': '93a560da9fa085c464b039d3b9749033605ecbe0b8ba5e93ab9cf3934fde6345', 'AR-u7-infer-attenuation-coefficient-13': 'a2ebf20d01c3a4dc04dea83034449ba539bca0db6bb129608416661037b16900', 'AR-u7-infer-attenuation-coefficient-14': '0b61e2d8948426c7b821afede1604d6980468a5feb422b12fe53dd6f4d087a52', 'AR-u7-infer-attenuation-coefficient-15': '56acd67a4f5f8e9b005f25e348ad0561c40d1eb012b52e30e777c8667c37bbbb', 'AR-u7-infer-attenuation-coefficient-16': '512695c6cd7432e49950981afeb647e858bc8b2e734f59b8b6de2811949a540c'}

READ_SOURCE_SHA256={'u7-infer-attenuation-coefficient-01': '39505106c95ecc814c0937a8306bd8b38c5ee58c56a38ec48f46aee7f6be11da', 'u7-infer-attenuation-coefficient-02': 'ca3bb01db561d0f566c0e88b5a8ca12eb6ebbbbd731dd3f59a448f5220cd3fbd', 'u7-infer-attenuation-coefficient-03': 'cc0067214bc6474d154e49ccf5f32ca747878a5eabd228607cd3a0673d061420', 'u7-infer-attenuation-coefficient-04': '5dcc1a734b9454276acaaec22b5e2a9d3e1d4f73ba36f4c896a662add1f39074', 'u7-infer-attenuation-coefficient-05': 'fe13a13c0fd54acdf5794204b1be9f219cf1a6ca8bd1648f3bce18b321a1580c', 'u7-infer-attenuation-coefficient-06': '48b22cf515f30372c264791c2946e02cfb88b1e70e88296b24447b661fbad560', 'u7-infer-attenuation-coefficient-07': '284212e34bb6873678ff0d11888ffee146396508ff778ebfa1a3ce101de74e9b', 'u7-infer-attenuation-coefficient-08': 'b988150cd9b98c697add032ef4400b7f66405ada94b658ebfbffe0cc9feaba8e', 'u7-infer-attenuation-coefficient-09': '52f962d8bd6d62dd1231ba60c2ce920725b44d9d947a6419e13b6fe86b8bfaa0', 'u7-infer-attenuation-coefficient-10': '02bb3d4aa4221f1eb11867ff4f43c796cb91aa3d3cf4ed20054014789db2f49c', 'u7-infer-attenuation-coefficient-11': '3d4bbcfec1a94aa807ec7947fd44058a478e3d8089b5ad3fc274c49512e47243', 'u7-infer-attenuation-coefficient-12': '9be0bb8eefe2d1b1fcf78b84ce3620d5feab68ce3524cb4fa0c4690d183e0e95', 'u7-infer-attenuation-coefficient-13': '4d91ee3d57681aee6391b0ce16e7e6e26f22360c13fb53437b658cb221dbe5bc', 'u7-infer-attenuation-coefficient-14': 'b79ab0a030e463cd67302ee3d890a31ac45c9dfcc88228c750ada7951fb888be', 'u7-infer-attenuation-coefficient-15': '3ae2f06cddea090335a7c2b98627fcb97249c40c2e6cb9ca9ccee7ef35db6ee7', 'u7-infer-attenuation-coefficient-16': '69ad6d1778b85fb2a631d400ad0c88993c236c2f00539df8b68a8004642ebc5b'}

SOURCE_READING='Tutti80 originali derivati individualmente nella primaria6ead prima di qualsiasi candidata; modelli scritti ed eseguiti sul commit24cf4060 prima di opzioni/chiavi/blocchi/SVG B. Poi tutti16 record di questa famiglia letti integralmente, tutte alternative e cinque figure XML/native nuove lette. Fix autore riletti prima di freeze. Nessun modulo autore o primaria B aperta. Confronto integrato ROOT PENDING, UI prodotto/human NOT_RUN.'

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    asset_root=Path(asset_root) if asset_root is not None else Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle(); common=[]
    if sha(Path(codec.__file__).read_bytes())!=REVIEWED_LITERAL_CODEC_SHA256:common.append('Independent exact literal codec dependency changed')
    if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Reviewed '+FAMILY+' package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Reviewed '+FAMILY+' binding edition changed')
    results=[]
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id=f'u7-{FAMILY}-{n:02}'
        if binding.get('sourceId')!=source_id or binding.get('sourceRef')!=SOURCE_REF or binding.get('sourceSha256')!=READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned '+FAMILY+' source binding mismatch')
        if row.get('course')!='C5' or row.get('skill')!=REVIEWED_SKILLS[n]:errors.append('Independent real course or primary skill mismatch')
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
                exact=decode_numeric(raw)
                if sp.simplify(exact-want)!=0:errors.append('Independent '+FAMILY+' result mismatch')
                if row['answer']['type']=='choice':
                    equivalent=[]
                    for alternative in row['answer']['options']:
                        option=str(alternative).replace('−','-').strip()
                        if option in NON_NUMERIC_DISTRACTORS.get(n,set()):continue
                        if suffix and not option.endswith(suffix):raise ValueError('alternative missing physical unit')
                        if suffix:option=option.removesuffix(suffix).strip()
                        if sp.simplify(decode_numeric(option)-want)==0:equivalent.append(alternative)
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
          'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())},
          'methods':['SymPy_independent_Planck_Beer_and_optical_depth_model','SymPy_inverse_scaling_calibration_and_physical_domain','Pint_Fraction_exact_SI_units','individual_manual_options_feedback_and_SVG_reading'],
          'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),
      'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
      'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE',
      'reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),
      'sourceFirstPrimarySha256':PRIMARY_SHA256,'source':{'commit':SOURCE_REF,'path':SOURCE_PATH,'reference':SOURCE_READING}}
