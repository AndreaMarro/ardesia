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
CANDIDATE_REF='29f65ee547627d10b0cca687b3fe19d3f05b4a32'
PRIMARY_SHA256='51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L08', 'actualLessonPrerequisites': {'C5-L08': []}, 'title': 'Una popolazione di nuclei che cambia nel tempo'}
FAMILY='radioisotope-mixture'
BATCH='radioisotope-mixture-253'
ASSET_NAME='radioisotope-mixture-progressive.svg'
REVIEWED_PACKAGE_SHA256='ddf3ea2e824d69f773ef995c32545bfb7093e0139802e1b5cdb2e07b34b192c8'
REVIEWED_BINDINGS_SHA256='29f26b0f1e0922ba5b4edf7f381b3b9b82aa193b06ffa7c0ba6a5ba3492657ff'
SOURCE_REFERENCE='Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.'
FALSE_PROOF='Dopo una ora entrambe le attività iniziali si dimezzano,anche se la seconda emivita è30 minuti.'
SVG_MUTATION=(b'width="150"', b'width="151"')
SVG_LABEL_MUTATION=(b'8 Bq', b'9 Bq')
EXPECTED_MAPPING={1: ('C5-L08', ['C1-L001', 'C5-L08']), 2: ('C5-L08', ['C1-L001', 'C5-L08']), 3: ('C5-L08', ['C1-L001', 'C5-L08']), 4: ('C5-L08', ['C1-L001', 'C5-L08']), 5: ('C5-L08', ['C1-L001', 'C5-L08']), 6: ('C5-L08', ['C1-L001', 'C5-L08']), 7: ('C5-L08', ['C1-L001', 'C5-L08']), 8: ('C5-L08', ['C1-L001', 'C5-L08']), 9: ('C5-L08', ['C1-L001', 'C5-L08']), 10: ('C5-L08', ['C1-L001', 'C5-L08']), 11: ('C5-L08', ['C1-L001', 'C5-L08']), 12: ('C5-L08', ['C1-L001', 'C5-L08']), 13: ('C5-L08', ['C1-L001', 'C5-L08']), 14: ('C5-L08', ['C1-L001', 'C5-L08']), 15: ('C5-L08', ['C1-L001', 'C5-L08']), 16: ('C5-L08', ['C1-L001', 'C5-L08'])}
NUMERIC_UNITS={1: 'Bq', 5: 'Bq', 6: 'Bq', 14: 'Bq', 15: 'Bq', 16: 'Bq'}
OPTION_SUFFIX={7: '', 8: ' Bq', 11: '', 12: ' Bq', 13: ''}
UNITS={1: 'becquerel', 2: 'becquerel', 3: 'becquerel', 4: 'becquerel', 5: 'becquerel', 6: 'becquerel', 7: 'dimensionless', 8: 'becquerel', 9: 'becquerel', 10: 'dimensionless', 11: 'dimensionless', 12: 'becquerel', 13: 'dimensionless', 14: 'becquerel', 15: 'becquerel', 16: 'becquerel'}
MANUAL=['In 1 h il primo compie una emivita e il secondo due. Le attività residue sono 8/2=4 e 8/4=2 Bq, che sommo perché indipendenti e senza contributi dei figli: 6 Bq.', 'La somma di attività ha unità Bq=s⁻¹; non si sommano emivite né si interpreta la somma come numero di nuclei.', 'La legge a 1 h èA_tot=A₁/2+A₂/4. I fattori diversi appartengono alle due emivite; un’unica emivita efficace costante non descrive in generale tutta la miscela.', 'A₁ passa da 8 a 16 Bq iniziali: la sua parte finale passa da 4 a 8, mentre la seconda resta 2. A_tot passa da 6 a 10 Bq, aumenta di 4 Bq e non raddoppia.', 'Sottraggo il contributo noto A₂/4=2 Bq dalla misura 6: A₁/2=4, quindi A₁=8 Bq. La positività richiede A_tot>A₂/4.', 'Sottraggo A₁/2=4 Bq: A₂/4=2, quindi A₂=8 Bq. La positività richiede A_tot>A₁/2.', 'A_tot, A=6; con A₂, B 16 la seconda parte vale 4 e la prima 4, dunque B 8 Bq. Rapporto 8/6=4/3.', 'Il proposto 12 meno il corretto 6 vale+6 Bq. Raddoppiare il risultato non è giustificato dalla somma delle attività iniziali.', 'Isolo A₁=2(A_tot−A₂/4)=2 A_tot−A₂/2. Non distribuisco il fattore 2 in modo asimmetrico e impongo la differenza positiva.', 'Il quoziente è(κ₁A₁/2+κ₂A₂/4)/(A₁/2+A₂/4), equivalente a(2κ₁A₁+κ₂A₂)/(2 A₁+A₂). Nessuna cancellazione autorizza κ₁+κ₂.', 'Raddoppiano entrambe le attività iniziali. Per linearità la somma finale passa da 6 a 12 Bq e il rapporto è 2.', 'Medio le due letture 6 e 12: 9 Bq. Qui la legge è lineare in entrambi gli ingressi, quindi coincide anche con la lettura agli ingressi medi 12 e 12 Bq; questa coincidenza ha una ragione strutturale, non vale per ogni modello.', 'Il target è 12 Bq. Il nuovo primo contributo è 16/2=8, perciò il secondo deve essere 4 e A₂, B=16 Bq. Rispetto agli 8 iniziali il rapporto richiesto è 2.', 'Dal riferimento 6 Bq→18 ricavo a=3. La lettura 36 dà 12 Bq; noto A₂ 16, sottraggo 4 e moltiplico per 2: A₁=16 Bq.', 'Riferimenti 6 e 12 Bq: a=(25−13)/(12−6)=2 e b=1. La lettura 21 dà 10 Bq; con A₂ 8, A₁=2(10−2)=16 Bq.', 'Il vincolo A₁=A₂=x dàA_tot=3 x/4. Da 6 Bq ricavo x=8 Bq, soluzione positiva unica. Le attività sono medie continue, non conteggi interi di nuclei.']
DISTRACTORS=['Otto dimezza entrambi una volta, 16 omette il decadimento e quattro o due conserva una sola specie. Le emivite non si sommano.', 'J, s, C e m misurano altre grandezze. La somma di attività conserva Bq e non rivela da sola energia o popolazione totale.', 'Un denominatore comune imporrebbe uguali emivite. Il prodotto ha dimensione Bq²; scambiare due e quattro assegna le frazioni alla specie sbagliata.', '12 raddoppia anche il secondo contributo, tre dimezza il totale, sei ignora il nuovo ingresso e venti raddoppia ancora l’uscita nuova.', 'Quattro è la parte finale del primo; 12 gli attribuisce tutto il totale e 16 duplica l’inversa. Il residuo noto va sottratto prima della ricostruzione.', 'Due è la parte finale del secondo, quattro usa una sola emivita e 24 ignora il primo. Occorre totale>A₁/2, non soltanto totale positivo.', '3/4 inverte il confronto; due raddoppia anche il primo, 1/2 fa calare una somma con ingresso crescente e uno ignora la modifica.', '−6 inverte lo scarto, due è rapporto, 12 la proposta e zero non la verifica. Il totale iniziale 16 Bq è diverso da quello a un’ora.', 'Il segno più riaggiunge il contributo noto; dividere per due ripete la perdita. 4 A_tot−A₂ usa il peso sbagliato e 2 A_tot omette la seconda specie.', 'Prodotti e quozienti dei soli κ non sono somme. La loro media semplice e il rapporto senza peso due ignorano i contributi al tempo finale.', 'Un mezzo è reciproco, quattro moltiplica i due raddoppi come contributi moltiplicativi. Uno ignora la modifica e 3/2 non ricostruisce 12/6.', '18 somma, tre prende la semidifferenza e sei o dodici ripete una sola prova. Qui la linearità giustifica la coincidenza con gli ingressi medi.', 'Rapporto uno darebbe 10 Bq, quattro ne darebbe 16 e 3/2 ne darebbe 11. Un mezzo inverte il rapporto richiesto.', '64 usa D come totale e predice D=108; otto copia la parte finale e 24 omette il secondo contributo, predicendo D=48.', '17 omette b e predice D=22; 36 omette g dopo b e predice D=41. Otto lascia il primo contributo al tempo finale.', 'Sei darebbe totale 9/2, quattro darebbe tre e 12 darebbe nove Bq. L’uguaglianza iniziale non implica contributi finali uguali.']
ASSUMPTIONS=['Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.', 'Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.']
PEDAGOGY=['Legge motivata e valore medio distinto da singolo esito.', 'Unità ricostruita e conteggio distinto dal tasso.', 'Caso autonomo o legge riconosciuta senza risposta già anticipata.', 'Confronto controllato a un parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con denominatori e domini verificati.', 'Due uscite calcolate prima del rapporto.', 'Differenza ordinata distinta dal rapporto puro.', 'Inversa simbolica e dimensioni esplicite.', 'Fattori nella legge effettiva, non in un’analogia impropria.', 'Entrambi i nuovi ingressi considerati.', 'Media delle uscite e ammissibilità degli ingressi medi distinte.', 'Bersaglio ricostruito prima dell’inversa.', 'Guadagno rimosso prima del bilancio fisico.', 'Due riferimenti distinti identificano guadagno e offset.', 'Vincolo o caso autonomo risolto prima di decidere unicità e dominio.']
EXPECTED_IDS={'AR-u7-radioisotope-mixture-04', 'AR-u7-radioisotope-mixture-11', 'AR-u7-radioisotope-mixture-09', 'AR-u7-radioisotope-mixture-02', 'AR-u7-radioisotope-mixture-08', 'AR-u7-radioisotope-mixture-13', 'AR-u7-radioisotope-mixture-16', 'AR-u7-radioisotope-mixture-10', 'AR-u7-radioisotope-mixture-06', 'AR-u7-radioisotope-mixture-07', 'AR-u7-radioisotope-mixture-03', 'AR-u7-radioisotope-mixture-15', 'AR-u7-radioisotope-mixture-12', 'AR-u7-radioisotope-mixture-14', 'AR-u7-radioisotope-mixture-05', 'AR-u7-radioisotope-mixture-01'}
REVIEWED_CANDIDATES={'AR-u7-radioisotope-mixture-01': 'ae884c4712f00d96c778e57d86aa09d03b09892b95b8e41ab2d746e0e459ba84', 'AR-u7-radioisotope-mixture-02': 'c8bbc7550ae63259709778c55ae3e76be6537a84deb49138b27e7d4b5a765a26', 'AR-u7-radioisotope-mixture-03': 'bf37c468a0dfb3cf29f796d589c4651296be6b0be4d614a992489946930c2e14', 'AR-u7-radioisotope-mixture-04': 'bbb1f1b6beee35444ced093e82f7c89e28e893459cbf0f90262eab3c50c4571a', 'AR-u7-radioisotope-mixture-05': '59a46d2a46b0bb5981df7508eec5224920d6e3d240915c7fc64ef3ed6735d3c3', 'AR-u7-radioisotope-mixture-06': '7104ad456156b49f4aeee2d3f86d33af200aa9492b9ffee99124e3dd8705b15f', 'AR-u7-radioisotope-mixture-07': '7a665fd12e4df0b4a7bb5631f4c419b5f9e34273191cb27b8b5aa669dd8055ca', 'AR-u7-radioisotope-mixture-08': '7493dd0bc376f4f8d437750056da9961dfec99fe83c5be49d15529769cf59a9a', 'AR-u7-radioisotope-mixture-09': 'e9df2808f6dfa3415573b9ff15c4fd0343a9791605bcc24ac3c18567d5c010e3', 'AR-u7-radioisotope-mixture-10': 'cd0d116126c7060395110889b3e757ba66385bdd2b4ae96ced2017610195820c', 'AR-u7-radioisotope-mixture-11': '24eef1b8b9ee9a37eb3d47917a39db4c8cc2652f3dcd4fb74f215a621ac9d0fe', 'AR-u7-radioisotope-mixture-12': 'd7705e3d6f38c71a4b4bf58487ca0680dd533e0e1742b1b2e40bf1ea4cd0ff65', 'AR-u7-radioisotope-mixture-13': '107486517becd34d8813d69e9cae01d6330b13587452f805279515ad28d4c3c7', 'AR-u7-radioisotope-mixture-14': 'bb9639cbbed86f43b9863792a5e7d82b4e7b77b56c6105766b73669f34c8c384', 'AR-u7-radioisotope-mixture-15': '64a76c3de957c07b195192755cce8ee28c52f010bef93687dd93bb2fd6008b20', 'AR-u7-radioisotope-mixture-16': 'b34f86f713a9749f58e4872eecb67c210b4b3327029b91823fc340bdb0db2c3d'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1600, 1)), (Fraction(310, 1), Fraction(200, 1), Fraction(160, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1220, 1), Fraction(150, 1), Fraction(30, 1)), (Fraction(230, 1), Fraction(330, 1), Fraction(40, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1320, 1), Fraction(300, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(200, 1), Fraction(160, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1420, 1), Fraction(225, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(330, 1), Fraction(80, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(310, 1), Fraction(820, 1), Fraction(5, 1)), (Fraction(470, 1), Fraction(700, 1), Fraction(5, 1)), (Fraction(150, 1), Fraction(940, 1), Fraction(4, 1))}
REQUIRED_LINES={(Fraction(145, 1), Fraction(1000, 1), Fraction(550, 1), Fraction(1000, 1)), (Fraction(150, 1), Fraction(940, 1), Fraction(470, 1), Fraction(700, 1)), (Fraction(144, 1), Fraction(820, 1), Fraction(156, 1), Fraction(820, 1)), (Fraction(150, 1), Fraction(1005, 1), Fraction(150, 1), Fraction(630, 1)), (Fraction(470, 1), Fraction(994, 1), Fraction(470, 1), Fraction(1006, 1)), (Fraction(144, 1), Fraction(700, 1), Fraction(156, 1), Fraction(700, 1)), (Fraction(310, 1), Fraction(994, 1), Fraction(310, 1), Fraction(1006, 1)), (Fraction(144, 1), Fraction(940, 1), Fraction(156, 1), Fraction(940, 1))}
REQUIRED_SVG_TEXTS=('Due genitori, due contributi di attività', '1 · Una ora, due emivite diverse', 'Blu: primo genitore · Ocra: secondo genitore', '0 h', '8 Bq', '8 Bq', '1 h', '4 Bq', '2 Bq', 'T½ del primo: 1 h · T½ del secondo: 30 min', '2 · Varia solo A₁; A₂ resta 8 Bq', 'A_tot dopo 1 h (Bq)', 'A₁ (Bq)', '0', '8', '6', '16', '10', '2', '3 · Due preparazioni e la media del totale', 'A: A₁ = A₂ = 8 Bq · B: A₁ = A₂ = 16 Bq', 'A', '6 Bq', 'B', '12 Bq', 'Media', '9 Bq', 'Le tre barre del totale hanno la stessa scala.', 'Nel grafico, A₁ = 0 è solo un limite di bordo.')
GEOMETRY_REVIEW='XML e PNG indipendente 640×1600 letti per intero. Primo pannello scala20 coordinate/Bq:8+8 iniziali,4+2 finali. Grafico a A₂8Bq: x150+20A₁,y1000−30A_tot, retta A_tot=A₁/2+2, punti(8,6),(16,10), intercetta2 aperta al bordo A₁0. Barre finali scala25 per Bq:150/300/225 per6/12/9. Pesi e legende corretti.'
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

def solve(a1,a2):
    a1,a2=map(_positive,(a1,a2))
    return sp.simplify(a1/2+a2/4)

def inverse_first(output,a2):
    output,a2=map(_positive,(output,a2))
    return _positive(sp.simplify(2*(output-a2/4)))

def inverse_second(output,a1):
    output,a1=map(_positive,(output,a1))
    return _positive(sp.simplify(4*(output-a1/2)))

def equal_activity(output):
    output=_positive(output)
    return sp.simplify(4*output/3)
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
    hour=SI.Quantity(1,'hour');half2=SI.Quantity(30,'minute')
    assert(hour/half2).to('dimensionless').magnitude==2
    value=(SI.Quantity(8,'becquerel')/2+SI.Quantity(8,'becquerel')/4).to('becquerel')
    first=solve(8,8);second=solve(16,16);assert value.magnitude==first==6 and second==12
    fit=calibrate(first,13,second,25,21);assert fit==(2,1,10)
    expected=[first,'Bq','A_tot = A₁/2 + A₂/4','Da 6 Bq a 10 Bq',inverse_first(first,8),inverse_second(first,8),solve(8,16)/first,12-first,'A₁ = 2 (A_tot − A₂/4)','(2κ₁A₁ + κ₂A₂) / (2A₁ + A₂)',second/first,(first+second)/2,inverse_second(2*first,16)/8,inverse_first(sp.Rational(36,3),16),inverse_first(fit[2],8),equal_activity(first)]
    for k,v in {1:6,5:8,6:8,7:sp.Rational(4,3),8:6,11:2,12:9,13:2,14:16,15:16,16:8}.items():assert sp.simplify(expected[k-1]-v)==0
    assert solve(12,12)==(first+second)/2==9
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
