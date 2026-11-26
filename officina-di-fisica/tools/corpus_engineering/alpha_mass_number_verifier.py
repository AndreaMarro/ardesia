"""Independent source-first nuclear laws; no candidate authoring imports.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
INDEPENDENT_MODELS_IMPLEMENTATION_SHA256='58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc'
CANDIDATE_REF='6dfc55df252c3e2123f764e39420da423f65789d'
PRIMARY_SHA256='51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L08', 'actualLessonPrerequisites': {'C5-L08': []}, 'title': 'Una popolazione di nuclei che cambia nel tempo'}
FAMILY='alpha-mass-number'
BATCH='alpha-mass-number-254'
ASSET_NAME='alpha-mass-number-progressive.svg'
REVIEWED_PACKAGE_SHA256='06485db4f43a9fef1fc9f67c58f9fdb3b36d7410443ee149f0e3bad97eb05e1e'
REVIEWED_BINDINGS_SHA256='99221c29d83fabf471be714181212089c6d636464053372360fdd61cdbb48802'
SOURCE_REFERENCE='Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.'
FALSE_PROOF='Ogni particella alfa toglie due nucleoni al numero di massa del figlio.'
SVG_MUTATION=(b'width="324"', b'width="325"')
SVG_LABEL_MUTATION=(b'A = 4, Z = 2', b'A = 3, Z = 2')
EXPECTED_MAPPING={1: ('C5-L08', ['C1-L001', 'C5-L08']), 2: ('C5-L08', ['C1-L001', 'C5-L08']), 3: ('C5-L08', ['C1-L001', 'C5-L08']), 4: ('C5-L08', ['C1-L001', 'C5-L08']), 5: ('C5-L08', ['C1-L001', 'C5-L08']), 6: ('C5-L08', ['C1-L001', 'C5-L08']), 7: ('C5-L08', ['C1-L001', 'C5-L08']), 8: ('C5-L08', ['C1-L001', 'C5-L08']), 9: ('C5-L08', ['C1-L001', 'C5-L08']), 10: ('C5-L08', ['C1-L001', 'C5-L08']), 11: ('C5-L08', ['C1-L001', 'C5-L08']), 12: ('C5-L08', ['C1-L001', 'C5-L08']), 13: ('C5-L08', ['C1-L001', 'C5-L08']), 14: ('C5-L08', ['C1-L001', 'C5-L08']), 15: ('C5-L08', ['C1-L001', 'C5-L08']), 16: ('C5-L08', ['C1-L001', 'C5-L08'])}
NUMERIC_UNITS={1: '1', 5: '1', 6: '1', 14: '1', 15: '1', 16: '1'}
OPTION_SUFFIX={7: '', 8: '', 11: '', 12: '', 13: ''}
UNITS={1: 'dimensionless', 2: 'dimensionless', 3: 'dimensionless', 4: 'dimensionless', 5: 'dimensionless', 6: 'dimensionless', 7: 'dimensionless', 8: 'dimensionless', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'dimensionless', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'dimensionless'}
MANUAL=['Ogni α porta via quattro nucleoni. Nel bilancio idealizzato A_f=A₀−4 n=220−4=216, numero puro intero positivo. Il solo bilancio non garantisce che una specifica catena isotopica esista o sia energeticamente consentita.', 'Il numero di massa è il conteggio dei nucleoni e ha unità 1, non kg né unità di massa atomica. Non coincide con la massa fisica comprensiva dell’energia di legame.', 'La particella α è un nucleo di elio con 4 nucleoni e 2 protoni: il figlio haA−4 eZ−2. Conservazione di carica e numero di nucleoni fissa entrambi i decrementi.', 'A n=1 fisso il decremento resta 4. Da A₀ 220 a 224, A_f passa da 216 a 220: aumenta di 4, non viene moltiplicato per 224/220 senza considerare l’offset.', 'Riporto a sinistra i quattro nucleoni per decadimento: A₀=A_f+4 n=216+4=220. Il risultato è intero e soddisfa A₀>4 n.', 'Isolo n=(A₀−A_f)/4=(220−216)/4=1. Un valore positivo non intero non sarebbe un conteggio di decadimenti ammissibile.', 'Con n_B 2, A_f, B=220−8=212. Il rapporto 212/216 si riduce dividendo per 4 a 53/54.', 'Il corretto è 216, quindi 432−216=+216. È una sovrastima del numero finale di nucleoni nel bilancio.', 'La forma inversa èA₀=A_f+4 n. Sommare il numero di α senza il fattore 4 non ricostruisce il numero di nucleoni portati via.', 'Il rapporto è(κ₁A₀−4κ₂n)/(A₀−4 n). Occorre che κ₁A₀ eκ₂n restino interi positivi e che il nuovo numeratore siapositivo; i soli fattori reali positivi non bastano.', 'Nuova parametrizzazione finale: A dà 216; B ha A₀=228, n=2 e dà 220. Il rapporto 220/216 è 55/54. La primaria originale conserva A₀=10, n=2 e 1/108: nessun suo risultato è stato ritaggato.', 'Dai risultati finali 216 e 220 la media è 218. Gli ingressi medi A₀=224, n=3/2 darebbero formalmente 218 per affinità della legge, ma n=3/2 non descrive una catena. La primaria originale resta immutata sul diverso genitore B con A₀=10.', 'Il bersaglio finale è (55/54)·216=220. Con B iniziale a 228 occorre perdere otto nucleoni, cioè n_B=2; il rapporto degli eventi è due. La nuova parametrizzazione è derivata nuovamente dai dati finali, non ricavata dalla chiave.', 'Il riferimento 216→648 dà g=3. La nuova lettura 660 indica A_f=220; con n=2 ricostruisco A₀=228. La primaria conserva il diverso display 6 della fonte originale.', 'I riferimenti finali 216→433 e 220→441 danno g=2 e b=1. In C la lettura 441 indica A_f=220; con n=1 il genitore è 224. La stessa lettura di B non impone lo stesso A₀, perché cambia n.', 'Il vincolo A₀=220 n trasforma il bilancio in A_f=216 n. La misura 216 impone n 1 e A₀ 220, soluzione intera positiva unica, con A₀>4 n.']
DISTRACTORS=['219 sottrae un solo nucleone, 218 soltanto i protoni, 224 aggiunge i quattro emessi e 55 divide A₀ per quattro. Il corretto è il conteggio 216.', 'kg misura massa fisica, C carica, Bq attività e J energia. Il numero di nucleoni resta puro e distinto dalla massa comprensiva del legame.', 'Scambiare quattro e due confonde nucleoni e protoni. Conservare A o aumentare Z viola il bilancio del figlio; γ lascerebbe entrambi invariati.', '212 diminuisce anziché aumentare; 224 omette l’α, 216 ignora il nuovo A₀ e 432 raddoppia senza motivo.', '212 ripete la perdita, 217 riaggiunge un solo nucleone e 864 moltiplica per quattro. L’inversa deve sommare i nucleoni emessi.', 'Quattro conta nucleoni anziché eventi; 55 usa soltanto A₀/4 e 16 moltiplica la perdita per quattro. Non si arrotondano conteggi frazionari.', '54/53 inverte B/A; 1/2 scambia il doppio degli eventi per un’inversa del figlio. Uno ignora la perdita ulteriore e due fa crescere il residuo.', '−216 inverte lo scarto, due è rapporto, 432 la proposta e zero non la verifica. La proposta supera il genitore pur dichiarando sole perdite α.', 'Il segno meno ripete la perdita; i quozienti non riaggiungono nucleoni e A_f+n confonde numero di eventi e nucleoni per evento.', 'Prodotti e quozienti dei soli κ perdono la differenza. Il segno più aggiunge gli emessi al figlio; la somma dei fattori dà due per prove identiche.', '54/55 inverte il rapporto; 57/55 confronta i genitori 228/220, due confronta gli eventi e uno presume una compensazione non esatta.', '436 somma, due prende la semidifferenza e 216 o 220 ripete un solo figlio. La coincidenza affine agli ingressi medi non rende fisico n=3/2.', 'Un evento darebbe figlio 224; un mezzo inverte il rapporto. 55/54 e 54/55 sono confronti fra numeri di massa, non fra eventi.', '668 tratta D come A_f e predice D=1980; 220 copia il figlio e 212 sottrae ancora gli otto emessi.', '449/2 omette l’offset ed è non intero; 444 omette g dopo b e 220 copia il figlio. Con n diverso la stessa lettura finale non impone lo stesso genitore.', 'Due eventi darebbero 432; 216 copia A_f e un mezzo viola l’interezza. Il vincolo non rende ridondante la misura assoluta.']
ASSUMPTIONS=['Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.', 'Catena α assegnata; compatibilità energetica e dei numeri atomici assunta, non dedotta da A₀>4 n. Conteggi interi positivi e figlio A_f=A₀−4 n>0. Nuovo genitore B 228 nei 11–15 dichiarato e ricalcolato; numero di massa distinto da massa fisica.']
PEDAGOGY=['Legge motivata e valore medio distinto da singolo esito.', 'Unità ricostruita e conteggio distinto dal tasso.', 'Caso autonomo o legge riconosciuta senza risposta già anticipata.', 'Confronto controllato a un parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con denominatori e domini verificati.', 'Due uscite calcolate prima del rapporto.', 'Differenza ordinata distinta dal rapporto puro.', 'Inversa simbolica e dimensioni esplicite.', 'Fattori nella legge effettiva, non in un’analogia impropria.', 'Entrambi i nuovi ingressi considerati.', 'Media delle uscite e ammissibilità degli ingressi medi distinte.', 'Bersaglio ricostruito prima dell’inversa.', 'Guadagno rimosso prima del bilancio fisico.', 'Due riferimenti distinti identificano guadagno e offset.', 'Vincolo o caso autonomo risolto prima di decidere unicità e dominio.']
EXPECTED_IDS={'AR-u7-alpha-mass-number-09', 'AR-u7-alpha-mass-number-10', 'AR-u7-alpha-mass-number-01', 'AR-u7-alpha-mass-number-04', 'AR-u7-alpha-mass-number-06', 'AR-u7-alpha-mass-number-12', 'AR-u7-alpha-mass-number-02', 'AR-u7-alpha-mass-number-16', 'AR-u7-alpha-mass-number-15', 'AR-u7-alpha-mass-number-03', 'AR-u7-alpha-mass-number-13', 'AR-u7-alpha-mass-number-05', 'AR-u7-alpha-mass-number-07', 'AR-u7-alpha-mass-number-08', 'AR-u7-alpha-mass-number-11', 'AR-u7-alpha-mass-number-14'}
REVIEWED_CANDIDATES={'AR-u7-alpha-mass-number-01': 'f9dd41a4b8e55dfd16ce2574cae7fc1087868adde134671869d525848140c080', 'AR-u7-alpha-mass-number-02': 'bcccf65ffdbcf041c58da8a980c59720011159fcf0d4664fabf266f8352e807f', 'AR-u7-alpha-mass-number-03': '6e55019ffb30eb1a26ecc5a239be09fc7870b595dada2fb52b7f0feefaa3b9a3', 'AR-u7-alpha-mass-number-04': '22d8a1d354605000cf01c58783f0aa9ec7a383db38de70db31b0f318aee940eb', 'AR-u7-alpha-mass-number-05': '7fb5d38cc9538520d7d4214dfec92ac0210cba438a883e9e06bf976590a2d83b', 'AR-u7-alpha-mass-number-06': 'a70eca4d19a68c1b33b94a6c3226dfa560f5c6f56bb69fdc3837b5d570c5d9a3', 'AR-u7-alpha-mass-number-07': 'e085b42ebe5bdbd7ed7025da016cc4c249f8928f08743046af233e01a3b4b107', 'AR-u7-alpha-mass-number-08': 'fa474281cd3cf0f9400b70ae61a1c4855f88a8d855c146cf8f6c68ba33ef91f0', 'AR-u7-alpha-mass-number-09': '24fef95add0d2912f2737aac70a94f5fe794166ed665b5d90e44c1c3d3b582cb', 'AR-u7-alpha-mass-number-10': '50ff64a2468c009a4a6cf243148e3e4501ac50fb9e28fe9411222afe9343dca4', 'AR-u7-alpha-mass-number-11': 'ba44094c22b2e38158626de4d0944d4095d3dab3d16dc54871ffcde9414f24c6', 'AR-u7-alpha-mass-number-12': 'a2693437a774feb0c90d3e1f94bf5f69e6c695637b23c8207e4c6fc41ff11a94', 'AR-u7-alpha-mass-number-13': '43efb3fa9bcf5e53a24629abb07e107d7c480a757eee75ef490f88cc8122b8b5', 'AR-u7-alpha-mass-number-14': '5c1e6caf29031072da5a41170d566ecda0173789a3f5bffaf4273158bbd3d8b8', 'AR-u7-alpha-mass-number-15': 'c178ae17f6f87e93ddf8853343cb92f31574a7c4a88dc3b9a6086aae0824d8ac', 'AR-u7-alpha-mass-number-16': 'ed36a5ed1acb29f0a4023705c7860ccf24adc821631d8ca2b7bc03840da231c4'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1600, 1)), (Fraction(150, 1), Fraction(1320, 1), Fraction(330, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1420, 1), Fraction(327, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1220, 1), Fraction(324, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(250, 1), Fraction(275, 1), Fraction(26, 1)), (Fraction(370, 1), Fraction(800, 1), Fraction(5, 1)), (Fraction(150, 1), Fraction(1000, 1), Fraction(4, 1)), (Fraction(350, 1), Fraction(275, 1), Fraction(26, 1)), (Fraction(260, 1), Fraction(900, 1), Fraction(5, 1)), (Fraction(350, 1), Fraction(195, 1), Fraction(26, 1)), (Fraction(250, 1), Fraction(195, 1), Fraction(26, 1)), (Fraction(480, 1), Fraction(700, 1), Fraction(5, 1))}
REQUIRED_LINES={(Fraction(260, 1), Fraction(994, 1), Fraction(260, 1), Fraction(1006, 1)), (Fraction(145, 1), Fraction(1000, 1), Fraction(550, 1), Fraction(1000, 1)), (Fraction(144, 1), Fraction(800, 1), Fraction(156, 1), Fraction(800, 1)), (Fraction(144, 1), Fraction(700, 1), Fraction(156, 1), Fraction(700, 1)), (Fraction(150, 1), Fraction(1005, 1), Fraction(150, 1), Fraction(630, 1)), (Fraction(480, 1), Fraction(994, 1), Fraction(480, 1), Fraction(1006, 1)), (Fraction(370, 1), Fraction(994, 1), Fraction(370, 1), Fraction(1006, 1)), (Fraction(144, 1), Fraction(900, 1), Fraction(156, 1), Fraction(900, 1))}
REQUIRED_SVG_TEXTS=('Il bilancio dei nucleoni nelle α', '1 · La particella α porta quattro nucleoni', 'p', 'p', 'n', 'n', 'Due protoni e due neutroni: A = 4, Z = 2', 'Nel figlio: A diminuisce di 4 e Z di 2.', 'Schema dei conteggi, non delle dimensioni nucleari.', '2 · Perdita di nucleoni, A₀ = 220', 'Nucleoni emessi: 4n', 'n (eventi)', '1', '4', '2', '8', '3', '12', '0', '3 · Numeri finali assoluti e la loro media', 'A: 220, n = 1 · B: 228, n = 2', 'A', '216', 'B', '220', 'Media', '218', 'Origine a zero e scala comuni alle tre barre.', 'La media fra catene non è una catena con n = 3/2.')
GEOMETRY_REVIEW='XML e PNG indipendente 640×1600 letti per intero. Schema con due protoni e due neutroni, esplicitamente non una scala di dimensioni nucleari. Punti discreti di perdita4n: origine(150,1000),110 coordinate/evento e25/nucleone, punti(1,4),(2,8),(3,12); bordo0 aperto. Barre finali a zero comune,scala3/2 per unità A:324/330/327 per216/220/218. Nessuna base troncata o falsa amplificazione della differenza.'
DECIMAL_REGRESSION_NUMBER=8

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
import sympy as sp

def _finite_exact(value):
    if isinstance(value,(float,bool)):
        raise ValueError('exact finite real input required')
    try:
        value=sp.sympify(value,strict=True)
    except (TypeError,ValueError,sp.SympifyError) as error:
        raise ValueError('invalid exact input') from error
    if value.atoms(sp.Float) or value.free_symbols or value.is_number is not True or value.is_real is not True or value.is_finite is not True:
        raise ValueError('exact finite real input required')
    return value

def _positive(value):
    value=_finite_exact(value)
    if value.is_positive is not True:
        raise ValueError('positive input required')
    return value

def _integer(value):
    value=_positive(value)
    if value.is_integer is not True:
        raise ValueError('positive integer count required')
    return value

def calibrate(y1,s1,y2,s2,snew):
    y1,y2=map(_positive,(y1,y2))
    s1,s2,snew=map(_finite_exact,(s1,s2,snew))
    if sp.simplify(y2-y1)==0:
        raise ValueError('two distinct physical references required')
    gain=_positive(sp.simplify((s2-s1)/(y2-y1)))
    offset=_finite_exact(sp.simplify(s1-gain*y1))
    output=_positive(sp.simplify((snew-offset)/gain))
    return gain,offset,output

def solve(a0,n):
    a0,n=map(_integer,(a0,n))
    return _integer(sp.simplify(a0-4*n))

def inverse_first(output,n):
    output,n=map(_integer,(output,n))
    return _integer(sp.simplify(output+4*n))

def inverse_second(output,a0):
    output,a0=map(_integer,(output,a0))
    return _integer(sp.simplify((a0-output)/4))

def constrained_count(output):
    output=_integer(output)
    n=_integer(sp.simplify(output/216))
    return n,220*n
def _rational_exact(value):
    exact=_finite_exact(value)
    if exact.is_Rational is not True:
        raise ValueError('Exact rational input required by this SI arithmetic helper')
    return Fraction(int(exact.p),int(exact.q))
def equivalent_literal(wanted):
    wanted=sp.Rational(_rational_exact(wanted))
    return f"{2*wanted.p}/{2*wanted.q}"
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)
def alternative_identity(option):
    if not isinstance(option,str) or len(option)>120:raise ValueError('Bounded literal quantity string required')
    units={' milioni di nuclei':('nuclear_count',sp.Integer(10**6)),
      ' nuclei':('nuclear_count',sp.Integer(1)),
      ' Bq':('rate',sp.Integer(1)),' s⁻¹':('rate',sp.Integer(1)),
      ' nuclei/s':('rate',sp.Integer(1)),
      ' h':('time',sp.Integer(3600)),' s':('time',sp.Integer(1)),
      '':('dimensionless',sp.Integer(1))}
    for suffix,(dimension,scale) in sorted(units.items(),key=lambda item:-len(item[0])):
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
        return dimension,sp.simplify(value*scale)
    return None

@lru_cache(maxsize=1)
def oracle():
    a0,n=sp.symbols('a0 n',integer=True,positive=True)
    assert sp.solve(sp.Eq(sp.Symbol('af'),a0-4*n),a0)==[sp.Symbol('af')+4*n]
    assert SI.Quantity(4,'dimensionless').dimensionality==SI.Quantity(1,'dimensionless').dimensionality
    first=solve(220,1);second=solve(228,2);assert(first,second)==(216,220)
    fit=calibrate(first,433,second,441,441);assert fit==(2,1,220)
    expected=[first,'1, conteggio di nucleoni','A diminuisce di 4 e Z diminuisce di 2','Da 216 a 220',inverse_first(first,1),inverse_second(first,220),solve(220,2)/first,432-first,'A₀ = A_f + 4n','(κ₁A₀ − 4κ₂n) / (A₀ − 4n)',second/first,(first+second)/2,inverse_second(sp.Rational(55,54)*first,228),inverse_first(sp.Rational(660,3),2),inverse_first(fit[2],1),constrained_count(first)[0]]
    for k,v in {1:216,5:220,6:1,7:sp.Rational(53,54),8:216,11:sp.Rational(55,54),12:218,13:2,14:228,15:224,16:1}.items():assert sp.simplify(expected[k-1]-v)==0
    assert sp.Rational(224)-4*sp.Rational(3,2)==218
    try:solve(224,sp.Rational(3,2))
    except ValueError:pass
    else:raise AssertionError('Formal mean of alpha counts must not define a third chain')
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_parent_decay_derivative_cumulative_complement_activity_weighted_mixture_integer_nuclear_bookkeeping_and_calibration",
            "Pint_exact_time_half_life_hour_second_Bq_inverse_time_count_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "modelsBeforeCandidateKeys":{"path":"editorial/reviews/u7-nuclear-250-254-independent-models.py","sha256":INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,"commit":"aca104f3"},"postReadNumericGuardHardening":"Only sympify strict=True added after candidate reading to reject strings without evaluation; all constitutive/inverse/calibration function AST bodies remain identical to pre-key snapshot. Snapshot preserved unchanged.","primaryBeforeCandidateKeys":{"path":"editorial/reviews/u7-nuclei-250-254-primary-source-only-20261126.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U7-02","U2-01")
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
    with tempfile.TemporaryDirectory(prefix='independent-nuclear-label-mutation-') as directory:
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
