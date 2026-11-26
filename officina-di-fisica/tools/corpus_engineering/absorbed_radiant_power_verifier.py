"""Independent source-first radiation laws; no candidate authoring imports.
All 80 source-prompt derivations and five numerical models frozen before candidate reading.
Complete final text, distractors, physical hypotheses and full native SVG read separately.
"""
from fractions import Fraction
from functools import lru_cache
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import pint
import sympy as sp
import hypothesis
from .pipeline import canonical,digest,git_bytes,sha
from .review_contract import reviewed_rows
from . import exact_arithmetic_literals as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-01.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='b23231ee65202142c7f6d46957df443d426c54ad7c9dac9b6de9fd21b1ea9a94'
CANDIDATE_REF='8f63b33ab1ed4f6d105b9898322bbeff6ed6c79e'
PRIMARY_SHA256='8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L07', 'actualLessonPrerequisites': {'C5-L06': ['C5-L02', 'C5-L04'], 'C5-L07': ['C5-L06']}}
FAMILY='absorbed-radiant-power'
BATCH='absorbed-radiant-power-244'
ASSET_NAME='absorbed-radiant-power-progressive.svg'
REVIEWED_PACKAGE_SHA256='f14480014181efa50a4f70cb655d2a7c25d37cdd12b66b44f89e8ecaba635c6d'
REVIEWED_BINDINGS_SHA256='4331c0c2fd2d5e1d9a7fa8eb46002ddc2a38b295240be6b18b32611160580cd3'
SOURCE_REFERENCE='P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.'
FALSE_PROOF='La potenza assorbita è sempre P₀τ, indipendentemente dal valore della trasmittanza.'
SVG_MUTATION=(b'width="128"', b'width="129"')
SVG_LABEL_MUTATION=(b'8 W = 4 W + 4 W', b'8 W = 4 W + 5 W')
EXPECTED_MAPPING={1: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 2: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 3: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 4: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 5: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 6: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 7: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 8: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 9: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 10: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 11: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 12: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 13: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 14: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 15: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07']), 16: ('C5-L07', ['C1-L001', 'C5-L04', 'C5-L06', 'C5-L07'])}
NUMERIC_UNITS={1: 'W', 5: 'W', 14: 'W', 15: 'W'}
OPTION_SUFFIX={6: '', 7: '', 8: ' W', 11: '', 12: ' W', 13: '', 16: ''}
UNITS={1: 'watt', 2: 'watt', 3: 'watt', 4: 'watt', 5: 'watt', 6: 'dimensionless', 7: 'dimensionless', 8: 'watt', 9: 'watt', 10: 'dimensionless', 11: 'dimensionless', 12: 'watt', 13: 'dimensionless', 14: 'watt', 15: 'watt', 16: 'dimensionless'}
MANUAL=['Con potenza trasmessa P_t=τP₀ e riflessione trascurabile, conservazione dell’energia dà P_ass=P₀−P_t=P₀(1−τ). Per 8 W e τ=1/2 si assorbono 4 W. È la componente assorbita della radiazione incidente, non automaticamente incremento di energia interna senza altri scambi.', 'Una potenza assorbita è in watt, J/s. La trasmittanza è un rapporto di potenze adimensionale, non l’unità richiesta.', 'P_ass=P₀(1−τ) deriva sottraendo potenza trasmessa da quella incidente nel bilancio senza riflessione. Il dominio 0<τ<1 implica 0<P_ass<P₀.', 'A τ=1/2 fissata P_ass è lineare in P₀: da 8 a 12 W incidenti si passa da 4 a 6 W assorbiti, fattore 3/2.', 'P₀=P_ass/(1−τ)=4/(1/2)=8 W. Il denominatore è strettamente positivo nel dominio dato.', 'τ=1−P_ass/P₀=1−4/8=1/2, adimensionale e fra zero e uno.', 'A=4 W. A P₀=8 W e τ_B=1/4 si ha B=6 W; rapporto B/A=3/2. Ridurre la trasmittanza aumenta l’assorbimento se la riflessione è trascurabile.', 'Proposto 8 W meno corretto 4 W dà +4 W. Usare tutta la potenza incidente ignorerebbe quella trasmessa.', 'P₀=P_ass/(1−τ). Non si divide per τ, che è la frazione trasmessa anziché assorbita; τ=1 non è nel dominio dell’inversa.', 'P_ass, B/P_ass, A=κ₁(1−κ₂τ)/(1−τ). Occorrono 0<τ<1 e 0<κ₂τ<1, oltre a κ₁, κ₂>0. Non si sostituisce 1−τ con un rapporto lineare di τ.', 'A=8·1/2=4 W e B=12·3/4=9 W. Rapporto 9/4; entrambi gli ingressi cambiano.', 'Media uscite=(4+9)/2=13/2 W. I parametri medi P₀=10 W e τ=3/8 darebbero 25/4 W. Media uscite meno modello agli ingressi medi=1/4 W.', 'Il target è (9/4)·4=9 W. Con P₀, B=12 W, 1−τ_B=3/4, τ_B=1/4. Il rapporto τ_B/τ_A è 1/2, non il rapporto degli assorbimenti.', 'P_ass, A=4 W con S=12 dà guadagno 3 per watt. S=27 corrisponde a 9 W assorbiti; τ=1/4 implica P₀=9/(3/4)=12 W.', 'Due riferimenti 4 e 9 W con letture 9 e 19: a=(19−9)/(9−4)=2 per watt, b=1. S_C=13 dà P_ass, C=6 W. Con τ_C=1/2 si ricava P₀, C=12 W.', 'P₀=(16 W)τ porta P_ass=(16 W)τ(1−τ)=4 W. Si ottiene 4τ²−4τ+1=0, cioè (2τ−1)²=0. Unica trasmittanza τ=1/2 nel dominio aperto; è una radice doppia, non due soluzioni distinte.']
DISTRACTORS=['8 W ignora la trasmissione, 16 W supera l’ingresso dividendo perτ, 0 ignora l’assorbimento. τ e 1−τ coincidono solo nel caso particolare 1/2, non come leggi generali.', 'J è energia, W/m² intensità, s tempo e 1 trasmittanza. Moltiplicare per una frazione pura conserva W.', 'P₀τ è trasmessa, P₀/τ eP₀(1+τ) superano l’ingresso, τ/P₀ haW⁻¹. La coincidenza aτ1/2 non rende equivalenti le leggi generali.', '8/3 W inverte 3/2, 9 W applica(3/2)², 12 W ignora la trasmissione e 4 W il nuovo ingresso. Aτfissa la potenza assorbita è lineare inP₀.', '2 W applica di nuovo la riduzione ed è minore dell’assorbita; 4 W ignora la trasmissione e 16 W darebbe 8 W assorbiti. Il denominatore 1−τ è positivo.', '2 viola il dominio, 0 e 1 sono confini esclusi. P_ass/P₀ da solo è frazione assorbita, non sempre trasmittanza; il complemento è indispensabile.', '2/3 è reciproco, 1/2 rapporto delle trasmittanze, 2 il reciproco di queste e 1 ignora il complemento. 4/6 W assorbiti danno 3/2.', '−4 W scambia ordine, 2 è rapporto, 8 W proposta e 0 l’accetta. Lo scarto 4 W mantiene dimensione di potenza.', 'Moltiplicare per 1−τ ripete la riduzione, dividere perτ confonde trasmissione e assorbimento; reciprocoW⁻¹ eP_ass−τ è dimensionalmente incoerente.', 'Prodotto/quoziente dei fattori ignorano il complemento. Il reciproco scambia A/B e la somma fallisce aκ₁=κ₂=1. Occorreκ₂τ_A<1 per un modello assorbente.', '4/9 inverte il rapporto, 3/2 segue soloP₀ e 1/2 soloτ. 3/4 confronta in realtà potenze trasmesse(3 W)/(4 W), non assorbite 9 W/4 W.', '25/4 W usa i dati medi, 13 W somma, 5/2 W semidifferenza e 9 W solo B. Media 13/2 W e modello ai medi 25/4 W differiscono di 1/4 W.', '2 inverteτ_B/τ_A, 9/4 copia il target assorbito e 4/9 il suo reciproco.3/2 è rapporto dei complementi assorbiti, non diτ.', '36 W leggeD 27 come 27 W e prediceD 81; 9/4 W moltiplica perτ invece di dividere per 1−τ; 8 W ripete A e dàD 18. Inversa corretta 12 W.', '13 W ometteb e prediceD 14; 24 W ometteg dopo b; 6 W copiaP_ass. 12 W dà 6 W assorbiti eD 13.', 'τ1/4 e 3/4 danno 3 W nel vincolo, τ2 viola 0<τ<1. Al massimo 4 W il discriminante nullo dà un unico valoreτ1/2 con molteplicità 2, non due trasmittanze distinte.']
ASSUMPTIONS=['P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.', 'P₀>0 e trasmittanza 0<τ<1 finite; τ non è profondità ottica. Il bilancio radiativo trascura riflessione, emissione propria e altri canali, P₀=P_trasm+P_ass. Potenza assorbita distinta da energia o incremento netto di energia interna senza altri scambi. Parametri costanti entro prova; medie e vincolo fra preparazioni. Display continuo con guadagno positivo.']
PEDAGOGY=['Legge motivata e unità normalizzate distinte dalle grandezze fisiche.', 'Dimensione ricostruita e prefisso distinto dall’unità fisica.', 'Caso autonomo o legge riconosciuta dalle ipotesi effettive.', 'Confronto controllato a un solo parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con dominio e unità verificati.', 'Due uscite ricostruite prima del rapporto puro.', 'Differenza ordinata distinta da un rapporto.', 'Inversa simbolica con dimensioni e dominio.', 'Fattori inseriti nella legge effettiva, senza analogie improprie.', 'Entrambi gli ingressi considerati nel nuovo stato.', 'Media delle uscite distinta dagli ingressi medi.', 'Bersaglio ricostruito prima dell’inversa.', 'Taratura rimossa prima dell’inversa fisica.', 'Guadagno e offset identificati da due riferimenti distinti.', 'Vincolo sostituito prima di decidere numero e dominio delle soluzioni.']
EXPECTED_IDS={'AR-u7-absorbed-radiant-power-01', 'AR-u7-absorbed-radiant-power-16', 'AR-u7-absorbed-radiant-power-11', 'AR-u7-absorbed-radiant-power-06', 'AR-u7-absorbed-radiant-power-07', 'AR-u7-absorbed-radiant-power-10', 'AR-u7-absorbed-radiant-power-12', 'AR-u7-absorbed-radiant-power-03', 'AR-u7-absorbed-radiant-power-08', 'AR-u7-absorbed-radiant-power-02', 'AR-u7-absorbed-radiant-power-13', 'AR-u7-absorbed-radiant-power-09', 'AR-u7-absorbed-radiant-power-14', 'AR-u7-absorbed-radiant-power-15', 'AR-u7-absorbed-radiant-power-04', 'AR-u7-absorbed-radiant-power-05'}
REVIEWED_CANDIDATES={'AR-u7-absorbed-radiant-power-01': '66f7f7304b697fb274fee7f58f1c95f6b20cb6c8afc6704a1c83a09012730d45', 'AR-u7-absorbed-radiant-power-02': '24393bad5af88986b0e2a681366d0c6ec028490264676e957414f14ba5bc21e6', 'AR-u7-absorbed-radiant-power-03': '77ccb9eab5fa227288036a39e4f6a28d0fc190e3d572b03b5e7a151f3dd3619f', 'AR-u7-absorbed-radiant-power-04': '39ee723de68a0143008e98f6bbc66645c1a24a968a47d1a81c25c1b574f13fdf', 'AR-u7-absorbed-radiant-power-05': 'd096f5984dd6bd79b1a1ea689f183203da62e540f77cc849329ce3c227b9cbdc', 'AR-u7-absorbed-radiant-power-06': 'b5e427ccdff32f33404643161df490ba27e4e21b43d3e53d628249bb0e9887c8', 'AR-u7-absorbed-radiant-power-07': 'c5c69f3968862e2d8ff1d1cf9a13905f48746933e03b810307557eb0474cbcb7', 'AR-u7-absorbed-radiant-power-08': '56b7405bc144c080ecfee9b72ca8004a7d5201167c7b049498dc4b5b068cffa7', 'AR-u7-absorbed-radiant-power-09': '03512fb3559b1e6829de3d2974e13143d93acc148bbae7bea071a17985eecceb', 'AR-u7-absorbed-radiant-power-10': '00f1fd185cad0815a93fb61071659d92e76fbe54b79f2fb5534fdf6e11ee490a', 'AR-u7-absorbed-radiant-power-11': '65ed9dd91f5157744c88e8da219ef1db32573e336e9747029689f04c5ba56401', 'AR-u7-absorbed-radiant-power-12': 'f7dfd04050de011520f16c8042a53059747c6225834f67a1da1eb3a859062bc2', 'AR-u7-absorbed-radiant-power-13': 'ed1b8d3a4693e6641068d6cdc3bdb52b0fb9b58c9e51f48dd18da72cc14b4718', 'AR-u7-absorbed-radiant-power-14': '94f1216bbbe517e950f53d0562d6ca084b2ac2500eb42d5f423792104325a75b', 'AR-u7-absorbed-radiant-power-15': 'fc3bf8d965a1e844b1b96956bd829b1cdfb46af9708ccc0b4aa5166bb171db5b', 'AR-u7-absorbed-radiant-power-16': '2af5880eb4473008e7b966b38fb0571176b0e33030d2a0e70cd3e5a7650c2eae'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(260, 1), Fraction(160, 1), Fraction(32, 1)), (Fraction(310, 1), Fraction(620, 1), Fraction(160, 1), Fraction(32, 1)), (Fraction(230, 1), Fraction(750, 1), Fraction(240, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(620, 1), Fraction(160, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(1150, 1), Fraction(288, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(750, 1), Fraction(80, 1), Fraction(32, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1480, 1)), (Fraction(150, 1), Fraction(1250, 1), Fraction(208, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(170, 1), Fraction(320, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(1050, 1), Fraction(128, 1), Fraction(32, 1)), (Fraction(150, 1), Fraction(350, 1), Fraction(160, 1), Fraction(32, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES=set()
REQUIRED_LINES=set()
REQUIRED_SVG_TEXTS=('Potenza trasmessa e assorbita', '1 · Il bilancio senza altri canali', 'Ingresso', '8 W', 'Trasmessa', '4 W', 'Assorbita', '4 W', '8 W = 4 W + 4 W; τ = 1/2.', '2 · A P₀ = 8 W, cambia il complemento', 'Blu: trasmessa · Ocra: assorbita', 'τ = 1/2', '4 W', '4 W', 'τ = 1/4', '2 W', '6 W', 'Ogni barra intera rappresenta gli stessi 8 W.', '3 · Due prove e la media assorbita', 'A: 8 W, τ = 1/2 · B: 12 W, τ = 1/4', 'A', '4 W', 'B', '9 W', 'Media', '13/2 W', 'Scala comune alle tre potenze assorbite.', 'P_ass = P₀(1 − τ), non P₀τ.')
GEOMETRY_REVIEW='XML and full 640×1480 native read. Panel 1 uses 40 coordinates/W: 8 W length 320, two 4 W bars 160. Panel 2 at 8 W total has same 40 coordinates/W; segments 160+160 and 80+240 represent transmitted/absorbed 4+4 and 2+6 W. Panel 3 separate common 32 coordinates/W gives lengths 128, 288, 208 for absorbed 4, 9, 13/2 W. Panels explicitly distinguish scenarios; labels and shared origins clear, no overlap or physical-scale defect.'
DECIMAL_REGRESSION_NUMBER=7

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def _finite_exact(value,positive=False):
    """Accept explicit finite real exact numbers, never binary floats or symbols."""
    if type(value) is int:
        exact=sp.Integer(value)
    elif isinstance(value,Fraction):
        exact=sp.Rational(value.numerator,value.denominator)
    elif isinstance(value,sp.Expr):
        exact=value
    else:
        raise ValueError('Finite real exact numeric input required; binary floats are forbidden')
    if (exact.is_number is not True or exact.free_symbols or exact.atoms(sp.Float)
        or exact.is_real is not True or exact.is_finite is not True):
        raise ValueError('Finite real exact numeric input required; binary floats are forbidden')
    if positive and exact.is_positive is not True:raise ValueError('Strict positive finite real exact physical magnitude required')
    return exact
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    values=tuple(_finite_exact(x) for x in (first,second,reference_reading,new_reading,reading_a,reading_b,third_reading))
    first,second,reference_reading,new_reading,reading_a,reading_b,third_reading=values
    if first.is_positive is not True or second.is_positive is not True or sp.simplify(first-second)==0:
        raise ValueError('Two distinct positive finite physical calibration references required')
    if not isinstance(unit,str) or not unit:raise ValueError('Explicit physical unit required for calibration')
    try:SI.Unit(unit)
    except Exception as error:raise ValueError('Known physical unit required for calibration') from error
    gain=sp.simplify(reference_reading/first)
    affine_gain=sp.simplify((reading_b-reading_a)/(second-first))
    _finite_exact(gain,positive=True);_finite_exact(affine_gain,positive=True)
    offset=sp.simplify(reading_a-affine_gain*first)
    decoded=sp.simplify(new_reading/gain);third=sp.simplify((third_reading-offset)/affine_gain)
    _finite_exact(offset);_finite_exact(decoded,positive=True);_finite_exact(third,positive=True)
    physical=(SI.Quantity(reference_reading,'')/SI.Quantity(first,unit)).to('1/('+unit+')')
    if sp.simplify(sp.sympify(physical.magnitude)-gain)!=0:raise ValueError('Independent exact calibration dimensions inconsistent')
    return gain,offset,decoded,third
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    # Explicitly reviewed spellings for the autonomous speed item, not a general parser.
    if FAMILY=='wavelength-in-medium' and number==4:
        known={'2 × 10⁸ m/s':sp.Integer(200000000),'(9/2)× 10⁸ m/s':sp.Integer(450000000),
          '3 × 10⁸ m/s':sp.Integer(300000000),'(3/2)× 10⁸ m/s':sp.Integer(150000000),'0 m/s':sp.Integer(0)}
        if option not in known:raise ValueError('Unreviewed exact speed spelling')
        return known[option]
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    if option in {'2 × 10⁸ m/s','(9/2)× 10⁸ m/s','3 × 10⁸ m/s','(3/2)× 10⁸ m/s','0 m/s'} and FAMILY=='wavelength-in-medium':
        return 'speed',parse_option(4,option)
    units={' nm':('length',sp.Rational(1,10**9)),' m':('length',sp.Integer(1)),
      ' cm²':('area',sp.Rational(1,10**4)),' m²':('area',sp.Integer(1)),
      ' W':('power',sp.Integer(1)),' pW':('power',sp.Rational(1,10**12)),
      ' J':('energy',sp.Integer(1)),'q_E':('energy',sp.Rational(1,10**20)),
      'q_R':('rate',sp.Integer(10**6)),' s⁻¹':('rate',sp.Integer(1)),
      ' V/m':('electric_field',sp.Integer(1)),' m/s':('speed',sp.Integer(1)),
      ' Hz':('frequency',sp.Integer(1)),'':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None

def _transmittance(value):
    value=_finite_exact(value,positive=True)
    if sp.simplify(1-value).is_positive is not True:raise ValueError('Strict transmittance domain zero < T < one required')
    return value
def result(incident,transmittance):
    incident=_finite_exact(incident,positive=True);transmittance=_transmittance(transmittance)
    return sp.simplify(incident*(1-transmittance))
def inverse_first(absorbed,transmittance):
    absorbed=_finite_exact(absorbed,positive=True);transmittance=_transmittance(transmittance)
    return sp.simplify(absorbed/(1-transmittance))
def inverse_second(absorbed,incident):
    absorbed=_finite_exact(absorbed,positive=True);incident=_finite_exact(incident,positive=True)
    return _transmittance(sp.simplify(1-absorbed/incident))
def scaled(incident,transmittance,k1,k2):
    incident=_finite_exact(incident,positive=True);transmittance=_transmittance(transmittance)
    k1=_finite_exact(k1,positive=True);k2=_finite_exact(k2,positive=True);_transmittance(k2*transmittance)
    return sp.simplify(k1*(1-k2*transmittance)/(1-transmittance))
def constrained_transmittances(absorbed):
    absorbed=_finite_exact(absorbed,positive=True);discriminant=sp.simplify(1-absorbed/4)
    if discriminant.is_nonnegative is not True:raise ValueError('Assigned constrained absorbed power cannot exceed four watts')
    if discriminant==0:return (sp.Rational(1,2),)
    return tuple(_transmittance(x) for x in ((1-sp.sqrt(discriminant))/2,(1+sp.sqrt(discriminant))/2))

@lru_cache(maxsize=1)
def oracle():
    pin,tau,absorbed=sp.symbols('pin tau absorbed',positive=True)
    solution=sp.solve(sp.Eq(pin,tau*pin+absorbed),absorbed)[0]
    assert sp.simplify(solution-pin*(1-tau))==0
    physical=(SI.Quantity(8,'watt')*(1-sp.Rational(1,2))).to('watt')
    first=result(8,sp.Rational(1,2));second=result(12,sp.Rational(1,4))
    assert sp.sympify(physical.magnitude)==first==4 and second==9
    fit=calibrate(first,second,12,27,9,19,13,'watt');assert fit==(3,1,9,6)
    expected=[first,'W','P_ass = P₀(1 − τ)','Da 4 W a 6 W',inverse_first(first,sp.Rational(1,2)),inverse_second(first,8),result(8,sp.Rational(1,4))/first,8-first,'P₀ = P_ass / (1 − τ)','κ₁(1 − κ₂τ_A) / (1 − τ_A)',second/first,(first+second)/2,inverse_second(sp.Rational(9,4)*first,12)/sp.Rational(1,2),inverse_first(fit[2],sp.Rational(1,4)),inverse_first(fit[3],sp.Rational(1,2)),constrained_transmittances(4)[0]]
    for n,value in {5:8,6:sp.Rational(1,2),7:sp.Rational(3,2),8:4,11:sp.Rational(9,4),12:sp.Rational(13,2),13:sp.Rational(1,2),14:12,15:12,16:sp.Rational(1,2)}.items():assert sp.simplify(expected[n-1]-value)==0
    assert result(10,sp.Rational(3,8))==sp.Rational(25,4)
    assert sp.expand(16*tau*(1-tau)-(4-16*(tau-sp.Rational(1,2))**2))==0
    assert constrained_transmittances(3)==(sp.Rational(1,4),sp.Rational(3,4))
    assert len(constrained_transmittances(4))==1
    return expected
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
    if tuple(e.text or '' for e in root.iter() if e.tag.endswith('text'))!=REQUIRED_SVG_TEXTS:
        raise ValueError('Independent physical scale or reviewed SVG quantity labels changed')
    text=' '.join(e.text or '' for e in root.iter())
    if 'px/' in text or ' px ' in text:raise ValueError('Intrinsic SVG coordinate units displayed as physical units')
    return GEOMETRY_REVIEW
def verify(package,bindings,asset_root=None):
    if package.get("schema")!="astra/1":raise ValueError("Expected independently reviewed astra/1 package")
    asset_root=asset_root or Path(__file__).resolve().parents[2]/"editorial/assets"
    expected=oracle();originals=source_records();geometry=asset_geometry(asset_root)
    common=[]
    literal_dependency=sha(Path(exact_numbers.__file__).read_bytes())
    if literal_dependency!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append("Independent exact literal dependency edition mismatch")
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append("Independent reviewed package edition mismatch")
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append("Independent reviewed binding edition mismatch")
    records=[]
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u7-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C5" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
        if row["answer"]["type"]=="numeric" and type(value) is not int:
            errors.append("Independent numeric answer must preserve an exact integer JSON value")
        if isinstance(wanted,str):
            if value!=wanted:errors.append("Independent physical conceptual key mismatch")
        else:
            try:
                actual=parse_option(number,str(value)) if row["answer"]["type"]=="choice" else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append("Independent primary physical exact result mismatch")
            except (ValueError,TypeError):errors.append("Independent exact answer or physical unit invalid")
        if not isinstance(wanted,str) and row["answer"]["type"]=="choice":
            values=[identity for option in row["answer"]["options"] if (identity:=alternative_identity(option)) is not None]
            if len(values)!=len(set(values)):errors.append("Equivalent exact numeric choices require editorial review")
        if row["answer"]["type"]=="numeric" and (row["answer"].get("unit")!=NUMERIC_UNITS.get(number) or row["answer"].get("tolerance")!=0):
            errors.append("Independent numeric physical unit mismatch")
        records.append({"id":row["id"],"sourceSha256":b["sourceSha256"],"candidateSha256":digest(row),"reviewedSignature":signature,
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_phase_continuity_Planck_photon_rate_harmonic_average_Poynting_balance_inverse_and_calibration",
            "Pint_exact_wavelength_energy_frequency_power_area_intensity_rate_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","lessonReference":LESSON_REFERENCE,"records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u7-radiation-240-244-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"f5ab7a660506550ea5220cce3e4ba8e3e15584b3"},"primaryBeforeCandidateKeys":{"path":"editorial/reviews/u7-radiation-240-244-primary-source-only.md","sha256":PRIMARY_SHA256}}
def mutation_audit(package,bindings,asset_root):
    """Adversarial checks; temporary token patches never renew frozen reading."""
    import base64
    from copy import deepcopy
    import sys
    import tempfile
    from unittest.mock import patch
    module=sys.modules[__name__];cases=[]
    def retoken(changed,links,key):
        token=next(s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,asset_root) if r["id"]==key)
        with patch.dict(REVIEWED_CANDIDATES,{key:token}),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            return next(r for r in verify(changed,links,asset_root) if r["id"]==key)
    for i,original in enumerate(package["records"]):
        changed,links=deepcopy(package),deepcopy(bindings);row=changed["records"][i];answer=row["answer"]
        answer["value"]=(answer["value"]+1 if answer["type"]=="numeric" else next(o for o in answer["options"] if o!=answer["value"]))
        links[i]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
        reasons=[e for e in result["errors"] if "conceptual key" in e or "exact result mismatch" in e or "exact answer or physical unit invalid" in e]
        if result["ok"] or not reasons:raise AssertionError("Rebound retokenized wrong key escaped independent oracle:"+row["id"])
        cases.append({"case":"wrong_key_rebound_and_all_edition_tokens_replaced","id":row["id"],"rejectedBy":reasons})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if r["answer"]["type"]=="numeric")
    row=changed["records"][idx];row["answer"]["unit"]="kg" if row["answer"]["unit"]!="kg" else "N"
    links[idx]["candidateSha256"]=digest(row);result=retoken(changed,links,row["id"])
    if result["ok"] or "Independent numeric physical unit mismatch" not in result["errors"]:
        raise AssertionError("Rebound retokenized wrong physical unit accepted")
    cases.append({"case":"wrong_unit_rebound_and_retokenized","id":row["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["sourceSha256"]="0"*64;result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned Git source binding mismatch" not in result["errors"]:
        raise AssertionError("Rebound and retokenized false original hash accepted")
    cases.append({"case":"false_source_hash_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U7-01","U2-01")
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed retokenized false source shard accepted")
    cases.append({"case":"false_source_shard_provenance_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed["records"]) if int(r["id"].rsplit("-",1)[1]) in OPTION_SUFFIX and r["answer"]["type"]=="choice")
    row=changed["records"][idx];number=int(row["id"].rsplit("-",1)[1]);wanted=oracle()[number-1]
    duplicate=equivalent_literal(wanted)+OPTION_SUFFIX[number]
    wrong=next(i for i,o in enumerate(row["answer"]["options"]) if o!=row["answer"]["value"])
    row["answer"]["options"][wrong]=duplicate;links[idx]["candidateSha256"]=digest(row)
    result=retoken(changed,links,row["id"])
    if result["ok"] or not any("Equivalent exact numeric choices" in e for e in result["errors"]):
        raise AssertionError("Numerically duplicate distractor accepted after retokenization")
    cases.append({"case":"equivalent_literal_distractor_rebound_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    changed,links=deepcopy(package),deepcopy(bindings)
    false_proof=FALSE_PROOF
    changed["records"][0]["blocks"].append({"type":"text","text":false_proof})
    links[0]["candidateSha256"]=digest(changed["records"][0]);result=verify(changed,links,asset_root)[0]
    if result["ok"] or "Independent reviewed signature mismatch" not in result["errors"]:
        raise AssertionError("Correct key with plausible false physical proof escaped frozen reading")
    cases.append({"case":"correct_key_but_false_physical_proof_rebound","id":result["id"],"rejectedBy":result["errors"]})
    for name,mutate in [("empty",lambda p:p.update(records=[])),("partial",lambda p:p["records"].pop()),
                        ("duplicate",lambda p:p["records"].__setitem__(1,deepcopy(p["records"][0])))]:
        changed=deepcopy(package);mutate(changed)
        try:verify(changed,bindings,asset_root)
        except ValueError:cases.append({"case":name+"_batch","rejectedBy":"complete unique reviewed batch boundary"})
        else:raise AssertionError("Incomplete or duplicate batch accepted:"+name)
    changed,links=deepcopy(package),deepcopy(bindings)
    original=next(a for a in changed["assets"] if a["name"]==ASSET_NAME)
    raw=base64.b64decode(original["data"])
    old,new=SVG_MUTATION
    assert old in raw;raw=raw.replace(old,new,1);oldsha=original["id"];newsha=sha(raw)
    original.update(id=newsha,data=base64.b64encode(raw).decode())
    for row,b in zip(changed["records"],links):
        for block in row["blocks"]:
            if block.get("src")=="/asset/"+oldsha:block["src"]="/asset/"+newsha
        if ASSET_NAME in b.get("assetChecksums",{}):b["assetChecksums"][ASSET_NAME]=newsha
        b["candidateSha256"]=digest(row)
    with tempfile.TemporaryDirectory(prefix="independent-dynamics-svg-mutation-") as home:
        home=Path(home)
        for a in changed["assets"]:(home/a["name"]).write_bytes(base64.b64decode(a["data"]))
        tokens={r["id"]:sig for r,b,sig,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,
                REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as e:
                if "physical scale" not in str(e):raise
                cases.append({"case":"wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced","rejectedBy":str(e)})
            else:raise AssertionError("Wrong physical scale escaped independent geometry")
    changed,links=deepcopy(package),deepcopy(bindings)
    links[0]["provenance"]["independentReview"]="PASS_AI"
    links[0]["provenanceSha256"]=digest(links[0]["provenance"])
    result=retoken(changed,links,changed["records"][0]["id"])
    if result["ok"] or "Independent pinned source provenance mismatch" not in result["errors"]:
        raise AssertionError("Rehashed self-certified author provenance accepted")
    cases.append({"case":"author_self_certification_rehashed_and_retokenized","id":result["id"],"rejectedBy":result["errors"]})
    # Exactly distinguish near-integer/quarter decimal lexemes after every edition guard is replaced.
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=DECIMAL_REGRESSION_NUMBER-1;row=changed['records'][idx];n=idx+1;wanted=sp.Rational(oracle()[idx])
    scale=10**18;integer=wanted*scale
    assert integer.is_Integer and integer>=0
    quotient,remainder=divmod(int(integer)+1,scale)
    decimal=f"{quotient}.{remainder:018d}"+OPTION_SUFFIX[n]
    previous=row['answer']['value'];row['answer']['value']=decimal
    row['answer']['options']=[decimal if o==previous else o for o in row['answer']['options']]
    links[idx]['candidateSha256']=digest(row);result=retoken(changed,links,row['id'])
    if result['ok'] or 'Independent primary physical exact result mismatch' not in result['errors']:
        raise AssertionError('Near-correct decimal rounded into the accepted exact answer')
    cases.append({'case':'decimal_lexeme_below_float_ulp_rebound_and_retokenized','id':row['id'],'lexeme':decimal,'rejectedBy':result['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    idx=next(i for i,r in enumerate(changed['records']) if r['answer']['type']=='numeric')
    row=changed['records'][idx];row['answer']['value']=float(row['answer']['value'])
    links[idx]['candidateSha256']=digest(row);bad=retoken(changed,links,row['id'])
    if bad['ok'] or 'Independent numeric answer must preserve an exact integer JSON value' not in bad['errors']:
        raise AssertionError('Binary float numeric key accepted after all edition guards replaced')
    cases.append({'case':'numeric_JSON_binary_float_rebound_and_retokenized','id':bad['id'],'rejectedBy':bad['errors']})
    changed,links=deepcopy(package),deepcopy(bindings)
    uploaded=next(a for a in changed['assets'] if a['name']==ASSET_NAME)
    raw=base64.b64decode(uploaded['data']);before,after=SVG_LABEL_MUTATION;assert before in raw;raw=raw.replace(before,after,1)
    previous=uploaded['id'];uploaded.update(id=sha(raw),data=base64.b64encode(raw).decode())
    for row,b in zip(changed['records'],links):
        for block in row['blocks']:
            if block.get('src')=='/asset/'+previous:block['src']='/asset/'+uploaded['id']
        if ASSET_NAME in b.get('assetChecksums',{}):b['assetChecksums'][ASSET_NAME]=uploaded['id']
        b['candidateSha256']=digest(row)
    with tempfile.TemporaryDirectory(prefix='independent-radiation-label-mutation-') as directory:
        home=Path(directory)
        for a in changed['assets']:(home/a['name']).write_bytes(base64.b64decode(a['data']))
        tokens={r['id']:s for r,b,s,a,e in reviewed_rows(changed,links,{},EXPECTED_IDS,home)}
        with patch.dict(REVIEWED_CANDIDATES,tokens),patch.multiple(module,REVIEWED_PACKAGE_SHA256=digest(changed),REVIEWED_BINDINGS_SHA256=digest(links)):
            try:verify(changed,links,home)
            except ValueError as error:
                if 'reviewed SVG quantity labels' not in str(error):raise
                cases.append({'case':'wrong_SVG_quantity_label_all_hashes_bindings_and_tokens_replaced','rejectedBy':str(error)})
            else:raise AssertionError('Wrong quantitative label accepted after hostile rebinding')
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
