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
CANDIDATE_REF='65fb52b17dca66e9e5afd2dbae94e5c486eef242'
PRIMARY_SHA256='51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2'
LESSON_REFERENCE={'sourceRef': '5d1dc8dc7b601aef959d10d564c75462be74708d', 'gitPath': 'officina-di-fisica/content/C5.json', 'sourceSha256': 'dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422', 'primarySkill': 'C5-L08', 'actualLessonPrerequisites': {'C5-L08': []}, 'title': 'Una popolazione di nuclei che cambia nel tempo'}
FAMILY='radioactive-activity'
BATCH='radioactive-activity-251'
ASSET_NAME='radioactive-activity-progressive.svg'
REVIEWED_PACKAGE_SHA256='844c90d4f89ad63fa48ce4549cbea7562a6d923c0e0d9ea72f44d84cc12455c1'
REVIEWED_BINDINGS_SHA256='08d2f515d3baee10c8a48e80f0345771c824014ec354d6c3f3d6e9ec05020206'
SOURCE_REFERENCE='Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.'
FALSE_PROOF='Il numero di nuclei coincide numericamente con l’attività indipendentemente dall’emivita.'
SVG_MUTATION=(b'width="280"', b'width="281"')
SVG_LABEL_MUTATION=(b'\xf0\x9d\x92\x9c\xe2\x82\x98 = 7 Bq', b'\xf0\x9d\x92\x9c\xe2\x82\x98 = 8 Bq')
EXPECTED_MAPPING={1: ('C5-L08', ['C1-L001', 'C5-L08']), 2: ('C5-L08', ['C1-L001', 'C5-L08']), 3: ('C5-L08', ['C1-L001', 'C5-L08']), 4: ('C5-L08', ['C1-L001', 'C5-L08']), 5: ('C5-L08', ['C1-L001', 'C5-L08']), 6: ('C5-L08', ['C1-L001', 'C5-L08']), 7: ('C5-L08', ['C1-L001', 'C5-L08']), 8: ('C5-L08', ['C1-L001', 'C5-L08']), 9: ('C5-L08', ['C1-L001', 'C5-L08']), 10: ('C5-L08', ['C1-L001', 'C5-L08']), 11: ('C5-L08', ['C1-L001', 'C5-L08']), 12: ('C5-L08', ['C1-L001', 'C5-L08']), 13: ('C5-L08', ['C1-L001', 'C5-L08']), 14: ('C5-L08', ['C1-L001', 'C5-L08']), 15: ('C5-L08', ['C1-L001', 'C5-L08']), 16: ('C5-L08', ['C1-L001', 'C5-L08'])}
NUMERIC_UNITS={1: 'Bq', 5: 'nuclei', 6: 's', 14: 'nuclei', 15: 'nuclei'}
OPTION_SUFFIX={7: '', 8: ' Bq', 11: '', 12: ' Bq', 13: ''}
UNITS={1: 'becquerel', 2: 'becquerel', 3: 'dimensionless', 4: 'becquerel', 5: 'dimensionless', 6: 'second', 7: 'dimensionless', 8: 'becquerel', 9: 'dimensionless', 10: 'dimensionless', 11: 'dimensionless', 12: 'becquerel', 13: 'dimensionless', 14: 'dimensionless', 15: 'dimensionless', 16: 'dimensionless'}
MANUAL=['La relazione fisica èA=(ln 2)N/T½. Soltanto nella convenzione numerica assegnata sostituisco ln 2≈7/10: A≈(7/10)·20/2=7 Bq. Il razionale è esatto nel modello di calcolo approssimato, non un’identità ln 2=7/10.', 'L’attività ha dimensione tempo⁻¹ e unità Bq=s⁻¹, accompagnata dal significato trasformazioni medie per secondo. Non è il numero di nuclei e non è energia.', 'Nel β⁺ un protone nucleare si trasforma in neutrone emettendo un positrone e un neutrino elettronico: p→n+e⁺+ν_e. A resta invariato e Z diminuisce di 1. Per nuclei isolati la possibilità energetica richiede una transizione consentita, non segue dal solo bilancio.', 'A emivita fissata A è proporzionale a N. Da 20 a 40 nuclei l’attività raddoppia da 7 a 14 Bq nella convenzione 7/10.', 'Isolo N=AT½/(7/10). Sostituendo 7 Bq e 2 s ottengo 14·10/7=20 nuclei, conteggio intero positivo.', 'Isolo T½=(7/10)N/A. Con 20 nuclei e 7 Bq ottengo 14/7=2 s, positivo e con unità s.', 'N resta 20 ma l’emivita passa da 2 a 4 s. Il rapporto A_B/A_A è 2/4=1/2; B ha 7/2 Bq nel modello numerico.', 'A corretto 7 Bq, proposto 14 Bq: lo scarto proposto−corretto è+7 Bq. Il proposto ha omesso il dimezzamento dovuto a 2 s.', 'La forma fisica inversa èN=AT½/ln 2; usando la sola approssimazione prescritta diventa N≈10 AT½/7. Il prodotto A T½ è un conteggio e deve produrre un intero positivo se N è trattato come conteggio esatto.', 'Sostituzione e cancellazione danno A_B/A_A=κ₁/κ₂. Il fattore comune ln 2 cancella anche senza approssimarlo. κ₁N deve restare intero positivo; il solo κ₁>0 non autorizza nuclei frazionari.', 'A=7 Bq, B=(7/10)·1/1=7/10 Bq. Il rapporto è 1/10: il conteggio diminuisce di 20 volte mentre dimezzare l’emivita raddoppia la costante di decadimento.', 'La media delle letture è(7+7/10)/2=77/20 Bq. Non sostituisco medie degli ingressi: darebbero 49/10 Bq e N=21/2 non è neppure un conteggio intero ammissibile.', 'Il rapporto richiesto è 1/10; con N_B/N_A=1/20, l’identità 1/10=(1/20)/(T_B/T_A) impone T_B/T_A=1/2.', 'Il riferimento 7 Bq corrisponde a 21, quindi a=3 unità strumentali/Bq. La lettura 21/10 dàA=7/10 Bq; con T½=1 s, N=(7/10)/(7/10)=1 nucleo.', 'Le uscite fisiche 7 e 7/10 Bq producono 15 e 12/5. a=(15−12/5)/(7−7/10)=2, b=1. Dalla lettura 29 ricavoA 14 Bq; con 2 s N=14·2·10/7=40 nuclei.', 'Il vincolo dimensionato èN=(10 s⁻¹)T½. Nel modello 7/10 l’attività diventa 7 Bq indipendente da N: tutte le coppie (N, T½)=(k, k/10 s), k intero positivo, soddisfano i dati. Infinite numerabili, non un continuo di conteggi; con ln 2 esatto non sarebbe esattamente 7 Bq.']
DISTRACTORS=['14 omette la divisione per T; 10 omette η e 20 copia il conteggio. Sette Bq è un tasso medio istantaneo, non sette eventi certi in un secondo.', 'Bq ha dimensione s⁻¹. s, J, C e m indicano tempo, energia, carica e lunghezza; nessuna è un’unità di attività.', 'Il β⁻ converte un neutrone, α espelle quattro nucleoni e γ non cambia Z. Un elettrone orbitale espulso non descrive il β⁺ nucleare consentito.', '7/2 inverte la dipendenza da N; 28 introduce il quadrato; 7 ignora la nuova popolazione e 40 copia N senza il fattore temporale.', '10 omette T; 14 omette la divisione per η e darebbe 49/10 Bq; 49/5 moltiplica invece di dividere per η.', 'Mezzo secondo darebbe 28 Bq; quattro secondi darebbero 7/2 Bq. Venti copia N come se fosse una durata.', 'Due rende diretta la dipendenza da T; un quarto quadra il fattore, quattro ne inverte il quadrato e uno ignora il parametro.', '−7 Bq inverte lo scarto; due è il rapporto; 14 Bq ripete la proposta e zero la accetta senza verifica.', 'Moltiplicare per η ripete la riduzione. Dividere ancora per T dà dimensione s⁻²; introdurre T² lascia una durata non richiesta.', 'Il prodotto rende T diretto e il reciproco scambia gli stati. Il quadrato di κ₁ altera la legge; la somma dà due per prove identiche.', 'Dieci inverte il rapporto; 1/20 segue soltanto N; 1/2 segue T nel verso diretto sbagliato. Uno confonde un evento con un tasso unitario.', '77/10 somma, 63/20 prende la semidifferenza e 7/10 ripete B. 49/10 è soltanto l’estensione formale agli ingressi medi non interi.', 'Due inverte le durate; 1/10 copia il target del tasso e 1/20 il rapporto dei conteggi. Durate uguali darebbero 7/20 Bq in B.', 'Tre nuclei omette g e predice D=63/10; due predice D=21/5. Il numero strumentale 21/10 non è un conteggio già decodificato.', '580/7 omette entrambe le correzioni del display. Ottanta omette g dopo b e predice D=57; venti ripete il riferimento D=15.', 'Una o due coppie non esauriscono le scelte intere. L’opzione «Nessuna coppia» è confutata dagli esempi; un continuo includerebbe N frazionario, escluso.']
ASSUMPTIONS=['Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Caso autonomo β⁺ energeticamente consentito nel nucleo. Un protone diventa neutrone con emissione di positrone e neutrino elettronico: A invariato, Z diminuito di uno. Non si afferma il decadimento di un protone libero e non si usa il modello numerico η=7/10.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.', 'Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.']
PEDAGOGY=['Legge motivata e valore medio distinto da singolo esito.', 'Unità ricostruita e conteggio distinto dal tasso.', 'Caso autonomo o legge riconosciuta senza risposta già anticipata.', 'Confronto controllato a un parametro fissato.', 'Prima inversa reinserita nella relazione diretta.', 'Seconda inversa con denominatori e domini verificati.', 'Due uscite calcolate prima del rapporto.', 'Differenza ordinata distinta dal rapporto puro.', 'Inversa simbolica e dimensioni esplicite.', 'Fattori nella legge effettiva, non in un’analogia impropria.', 'Entrambi i nuovi ingressi considerati.', 'Media delle uscite e ammissibilità degli ingressi medi distinte.', 'Bersaglio ricostruito prima dell’inversa.', 'Guadagno rimosso prima del bilancio fisico.', 'Due riferimenti distinti identificano guadagno e offset.', 'Vincolo o caso autonomo risolto prima di decidere unicità e dominio.']
EXPECTED_IDS={'AR-u7-radioactive-activity-08', 'AR-u7-radioactive-activity-06', 'AR-u7-radioactive-activity-10', 'AR-u7-radioactive-activity-13', 'AR-u7-radioactive-activity-09', 'AR-u7-radioactive-activity-11', 'AR-u7-radioactive-activity-03', 'AR-u7-radioactive-activity-01', 'AR-u7-radioactive-activity-02', 'AR-u7-radioactive-activity-07', 'AR-u7-radioactive-activity-04', 'AR-u7-radioactive-activity-12', 'AR-u7-radioactive-activity-14', 'AR-u7-radioactive-activity-05', 'AR-u7-radioactive-activity-16', 'AR-u7-radioactive-activity-15'}
REVIEWED_CANDIDATES={'AR-u7-radioactive-activity-01': 'c0775baff6ea8407ed9d1d1a46ca2cb40c32a99f0c8d1b4b86580b48e504b884', 'AR-u7-radioactive-activity-02': '60194985fad5cff9f8f032461e8d7e47772aac7bcd1bd3a32b3529d2e921cf4b', 'AR-u7-radioactive-activity-03': '4aecb7309bc7e64788aca006f7ed55d45c2091498afe0fa05cfa807086253069', 'AR-u7-radioactive-activity-04': '88536cef72af76b101f407bdcd30112fef1c2dfa76112a89fabebc851bf1f4ec', 'AR-u7-radioactive-activity-05': 'e4d6047fd69b31d28fb7233dbf6563827d7480840bcebacb4243e7c60c85617b', 'AR-u7-radioactive-activity-06': '402fa418231093472da64af6be6e7f56d044fd8c2c2644fd554e98e44134c60e', 'AR-u7-radioactive-activity-07': 'b8992da4a9b77ed90ad4c1c94febba910a5b866284f51b8e048bd28eb94eef0b', 'AR-u7-radioactive-activity-08': '2b862c0bf043dff7eb3e1b1a7f85330824ed94cd3cf4c5a798a67463261f1ec1', 'AR-u7-radioactive-activity-09': '3f94edddee85b712607250755ed5de7ce7cde1c725f662328a03a7652cd4a828', 'AR-u7-radioactive-activity-10': '697d001ef0f874d656d33f00c1c8abb91401ce97a3a2b56fb848d27d261ff08f', 'AR-u7-radioactive-activity-11': 'cb7569860544a2e619d86bf887f7d3c2e1cb724162db6b64be14832f2bd4e555', 'AR-u7-radioactive-activity-12': 'c2795030cc0b8969902549cd79bd45201179960d49e1c6c575d749e166375be3', 'AR-u7-radioactive-activity-13': '6b445de19d863355053512a45bd5e6ac03ba8dabe05c622ee9f98a6a1dddffce', 'AR-u7-radioactive-activity-14': 'b3dde364c199958e72b9661b2b3596cd8263c335da99302e2fc679e3efa72230', 'AR-u7-radioactive-activity-15': '382640fa3fa45828435cdfbcb212d437db856a095d50e9eb868b08d623b7b02d', 'AR-u7-radioactive-activity-16': 'a959573c72b2c6b729660af922ba373d321d79a0d47cb1deb5e74e342547be85'}
REQUIRED_RECTS={(Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1600, 1)), (Fraction(150, 1), Fraction(1220, 1), Fraction(280, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1420, 1), Fraction(154, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1320, 1), Fraction(28, 1), Fraction(30, 1))}
REQUIRED_PATHS={'M0 0L8 4L0 8Z'}
REQUIRED_CIRCLES={(Fraction(170, 1), Fraction(245, 1), Fraction(8, 1)), (Fraction(215, 1), Fraction(281, 1), Fraction(8, 1)), (Fraction(190, 1), Fraction(965, 1), Fraction(5, 1)), (Fraction(350, 1), Fraction(281, 1), Fraction(8, 1)), (Fraction(305, 1), Fraction(317, 1), Fraction(8, 1)), (Fraction(430, 1), Fraction(755, 1), Fraction(5, 1)), (Fraction(350, 1), Fraction(353, 1), Fraction(8, 1)), (Fraction(350, 1), Fraction(245, 1), Fraction(8, 1)), (Fraction(170, 1), Fraction(317, 1), Fraction(8, 1)), (Fraction(310, 1), Fraction(860, 1), Fraction(5, 1)), (Fraction(260, 1), Fraction(317, 1), Fraction(8, 1)), (Fraction(215, 1), Fraction(245, 1), Fraction(8, 1)), (Fraction(260, 1), Fraction(281, 1), Fraction(8, 1)), (Fraction(215, 1), Fraction(353, 1), Fraction(8, 1)), (Fraction(305, 1), Fraction(281, 1), Fraction(8, 1)), (Fraction(230, 1), Fraction(930, 1), Fraction(5, 1)), (Fraction(270, 1), Fraction(895, 1), Fraction(5, 1)), (Fraction(170, 1), Fraction(281, 1), Fraction(8, 1)), (Fraction(215, 1), Fraction(317, 1), Fraction(8, 1)), (Fraction(150, 1), Fraction(1000, 1), Fraction(4, 1)), (Fraction(350, 1), Fraction(317, 1), Fraction(8, 1)), (Fraction(350, 1), Fraction(825, 1), Fraction(5, 1)), (Fraction(390, 1), Fraction(790, 1), Fraction(5, 1)), (Fraction(470, 1), Fraction(720, 1), Fraction(5, 1)), (Fraction(260, 1), Fraction(353, 1), Fraction(8, 1)), (Fraction(170, 1), Fraction(353, 1), Fraction(8, 1)), (Fraction(260, 1), Fraction(245, 1), Fraction(8, 1)), (Fraction(305, 1), Fraction(353, 1), Fraction(8, 1)), (Fraction(305, 1), Fraction(245, 1), Fraction(8, 1))}
REQUIRED_LINES={(Fraction(145, 1), Fraction(1000, 1), Fraction(550, 1), Fraction(1000, 1)), (Fraction(150, 1), Fraction(1005, 1), Fraction(150, 1), Fraction(630, 1)), (Fraction(144, 1), Fraction(860, 1), Fraction(156, 1), Fraction(860, 1)), (Fraction(470, 1), Fraction(994, 1), Fraction(470, 1), Fraction(1006, 1)), (Fraction(310, 1), Fraction(994, 1), Fraction(310, 1), Fraction(1006, 1)), (Fraction(144, 1), Fraction(720, 1), Fraction(156, 1), Fraction(720, 1))}
REQUIRED_SVG_TEXTS=('Dai genitori presenti all’attività', '1 · Conteggio presente e tasso medio', 'N = 20 nuclei · T = 2 s', 'Legge fisica: 𝒜 = (ln 2) N/T', 'Modello numerico: η = 7/10, 𝒜ₘ = 7 Bq', 'Il coefficiente assegnato approssima ln 2.', '2 · Solo alcuni N interi, a T = 2 s', '𝒜ₘ (Bq)', 'N (nuclei)', '20', '7', '40', '14', '0', '3 · Due preparazioni e la media dei tassi', 'A: N = 20, T = 2 s · B: N = 1, T = 1 s', 'A', '7 Bq', 'B', '7/10 Bq', 'Media', '77/20 Bq', 'Le tre attività hanno origine e scala comuni.', 'Un valore medio in Bq non è un conteggio intero.')
GEOMETRY_REVIEW='XML e PNG indipendente 640×1600 letti per intero. Venti cerchi nel primo pannello. Grafico discreto a T2s: x150+8N,y1000−20A_m, punti N5,10,…,40 con A_m=7N/20; origine aperta per N>0. Barre a scala40 per Bq:280/28/154 per7,7/10,77/20. La distinzione tra legge fisica e coefficiente numerico è visibile.'
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

# Physical coefficient is ln2; numerical source convention explicitly assigns7/10.
def solve(n,half,coefficient=sp.Rational(7,10)):
    n=_integer(n)
    half,coefficient=map(_positive,(half,coefficient))
    return sp.simplify(coefficient*n/half)

def inverse_first(output,half,coefficient=sp.Rational(7,10)):
    output,half,coefficient=map(_positive,(output,half,coefficient))
    return _integer(sp.simplify(output*half/coefficient))

def inverse_second(output,n,coefficient=sp.Rational(7,10)):
    output,coefficient=map(_positive,(output,coefficient))
    n=_integer(n)
    return _positive(sp.simplify(coefficient*n/output))

def constrained_family(n):
    n=_integer(n)
    return n,sp.Rational(1,10)*n,solve(n,sp.Rational(1,10)*n)
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
    n,t=sp.symbols('n t',positive=True)
    physical=sp.log(2)*n/t
    assert sp.simplify(physical*t/n-sp.log(2))==0
    value=(SI.Quantity(Fraction(7,10)*20,'dimensionless')/SI.Quantity(2,'second')).to('becquerel')
    first=solve(20,2);second=solve(1,1)
    assert value.magnitude==first==7 and second==sp.Rational(7,10)
    fit=calibrate(first,15,second,sp.Rational(12,5),29);assert fit==(2,1,14)
    expected=[first,'Bq','Un protone diventa neutrone, emettendo positrone e neutrino elettronico','Da 7 Bq a 14 Bq',inverse_first(first,2),inverse_second(first,20),solve(20,4)/first,14-first,'N = 𝒜_m T / η','κ₁ / κ₂',second/first,(first+second)/2,inverse_second(first/10,1)/2,inverse_first(sp.Rational(21,10)/3,1),inverse_first(fit[2],2),'Infinite coppie discrete, con N intero positivo']
    for k,v in {1:7,5:20,6:2,7:sp.Rational(1,2),8:7,11:sp.Rational(1,10),12:sp.Rational(77,20),13:sp.Rational(1,2),14:1,15:40}.items():assert sp.simplify(expected[k-1]-v)==0
    for count in (1,2,20):assert constrained_family(count)[2]==7
    try:solve(sp.Rational(21,2),sp.Rational(3,2))
    except ValueError:pass
    else:raise AssertionError('A formal mean count is not one integer specimen')
    assert sp.Rational(7,10)*sp.Rational(21,2)/sp.Rational(3,2)==sp.Rational(49,10)
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
