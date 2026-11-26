"""Independent source-first electrostatic review; never imports authoring.
Per-ID frozen signatures follow complete text, source and full native SVG reading.
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
from . import entropy_state_review as exact_numbers
SI=pint.UnitRegistry(non_int_type=Fraction)
SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-01.json'
EXACT_LITERAL_DEPENDENCY_SHA256='f75450bbf820fd030b618625bbecba044092df7bef895d31ea2d8cd9f8bc82cf'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
CANDIDATE_REF='303633531a2f63db14279ee443b2de70eba3aaa7'
PRIMARY_SHA256='12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a'
FAMILY='symmetric-electric-potential'
BATCH='symmetric-electric-potential-194'
ASSET_NAME='symmetric-electric-potential-progressive.svg'
REVIEWED_PACKAGE_SHA256='169bc53f48a039bc77199d5ca629c4241e89ffa8f7ddfd1e868b8162f8fc22b6'
REVIEWED_BINDINGS_SHA256='b9d51ba5c7ec22d2ecb102ae67068a7fc2f3967f97f9a2d5d08fafc758553e75'
SOURCE_REFERENCE='Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.'
FALSE_PROOF='Se il campo nel punto medio è nullo, il potenziale riferito all’infinito deve essere nullo.'
SVG_MUTATION=(b'width="216"', b'width="217"')
EXPECTED_MAPPING={1: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 2: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 3: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 4: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 5: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 6: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 7: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 8: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 9: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 10: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 11: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 12: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 13: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 14: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 15: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03']), 16: ('C4-L03', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02', 'C4-L03'])}
NUMERIC_UNITS={1: 'V', 5: 'nC', 14: 'nC'}
OPTION_SUFFIX={6: ' V', 7: '', 8: ' V', 11: '', 12: ' V', 13: '', 15: ' nC', 16: ' nC'}
UNITS={1: 'volt', 2: 'volt', 3: 'volt', 4: 'volt', 5: 'nanocoulomb', 6: 'volt', 7: 'dimensionless', 8: 'volt', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'volt', 13: 'dimensionless', 14: 'nanocoulomb', 15: 'nanocoulomb', 16: 'nanocoulomb'}
MANUAL=['Il potenziale è scalare e i due contributi hanno lo stesso zero all’infinito. A 3 m ciascuno dà 3 V per nC: V_P=3(Q₁+Q₂) nelle unità dichiarate. Per1 e2 nC la somma è9 V. Non si sottraggono potenziali perché le sorgenti stanno su lati diversi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Potenziale totale in volt, V=J/C=N·m/C. La somma di due potenziali conserva questa unità; N/C descriverebbe campo, non V_P. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Caso speciale: due cariche uguali positive simmetriche rispetto al punto medio P. I contributi vettoriali del campo sono opposti e si cancellano, E(P)=0. I potenziali scalari sono entrambi positivi e si sommano: V(P)=2kₑQ/a>0, a distanza comune dalle sorgenti, zero all’infinito. Campo nullo non impone potenziale nullo; non si deduce stabilità di una carica di prova senza ulteriori condizioni. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A:3(1+2)=9 V. B:3(2+2)=12 V. Il nuovo valore è4/3 del precedente, perché cambia un solo addendo, non l’intera somma. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Da V_P=3(Q₁+Q₂) nelle unità nC/V segue Q₁/(1 nC)=(V_P/(1 V))/3−Q₂/(1 nC). Con9 V e Q₂=2 nC resta1 nC. Il residuo deve essere strettamente positivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Caso speciale di cambio dello zero, senza muovere cariche: si sottrae V_P=18 V a tutti i potenziali. V′_R=V_R−V_P=6−18=−12 V e V′_P=0. Campo, differenze di potenziale e lavoro elettrico restano invariati; non si è prodotto uno stato fisico nuovo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A:9 V. B con Q₁=Q₂=1 nC dà6 V. Rapporto6/9=2/3: dimezzare un solo contributo non dimezza il totale. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Corretto V_P=9 V. Proposta18 meno corretto9=+9 V. È differenza scalare di potenziali con medesimo riferimento, non campo elettrico o rapporto puro. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'In SI Q₁=(3 m)V_P/kₑ−Q₂. In unità numeriche Q₁/(1 nC)=(V_P/(1 V))/3−Q₂/(1 nC). Richiede V_P>kₑQ₂/(3 m) per restare nel dominio Q₁>0. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'V_P,B/V_P,A=(κ₁Q₁+κ₂Q₂)/(Q₁+Q₂). I contributi sono pesati con le cariche originali; un fattore comune κ dà κ, non κ². Riferimento e distanze restano comuni nelle due prove. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A:3(1+2)=9 V. B:3(2+3)=15 V. Rapporto15/9=5/3, considerando entrambe le cariche cambiate. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Media=(9+15)/2=12 V. Le cariche medie3/2 e5/2 nC sommano4 nC e danno12 V: uguaglianza giustificata dalla linearità della somma, non assunta per ogni modello. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Target(5/3)·9=15 V. Con Q₁,B=2 nC la somma richiesta è5 nC, quindi Q₂,B=3 nC. Il rapporto con Q₂,A=2 nC è3/2, non il valore3 della carica B. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A dà9 V e S=27: a_cal=3 per volt. S_B=45 indica15 V. Con Q₂,B=3 nC, Q₁,B=15/3−3=2 nC, positivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Riferimenti9 e15 V: a_cal=(31−19)/(15−9)=2 per volt, b_cal=1. S_C=49 decodifica V_C=(49−1)/2=24 V. Con Q₂,C=5 nC, Q₁,C=24/3−5=3 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q₁=Q₂/2 dà somma(3/2)Q₂; V_P=(9/2)[Q₂/(1 nC)] V. Misura9 V impone Q₂=2 nC e Q₁=1 nC, unica coppia positiva. La carica elettrica del modello non è un conteggio intero di microstati e il vincolo non introduce una libertà di scala dopo la misura. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.']
DISTRACTORS=['3 è differenza anziché somma;18 aggiunge2;zero è possibile perE con sorgenti uguali simmetriche ma non perV positivo a zero infinito.', 'J energia,N/C campo,C carica,N forza: la somma di volt conserva V.', 'Campo vettoriale si cancella,potenziali positivi no;posizioni opposte non invertono segno scalare;V non ha verso.', '18 raddoppia termineQ₂ fisso,6 diminuisce contro aumentoQ₁,9 ignora cambio,27 fattore non giustificato.', '3 copia somma e dà15 V,5 aggiunge Q₂ e dà21 V;0 viola positività e dà6 V.', '12 perde segno,6 vecchiozero,24 somma costante,0 annulla differenza fraP eR.', '3/2 reciproco,1/2 segue soloQ₂,1 ignora cambio,2 cresce mentreQ₂ cala.', '−9 ordine invertito,18 proposta,0 accetta errore;2 rapporto senzaV.', 'Più non isolaQ₁,reciproco C⁻¹, V−Q₂ unità diverse;d al denominatore inversa errata.', 'Prodotto/quoziente soliκ perdono pesi;differenza può annullaredenominatore per cariche uguali;reciproco inverte.', '3/5 reciproco,2 soloQ₁,3/2 soloQ₂,1 ignora crescite.', '24 somma non media,3 semidifferenza,9/15 solo singole prove;medieingressi coincidono perlinearità.', '2/3 reciproco,5/3 copiapotenziali,2 primacarica,3 copiavaloreQ₂ senza rapporto.', '12 nC usa45 comeV;5 copiasomma;3 copiaQ₂ e dà18V/D54.', '19/6 ometteb e dà50;5 copiaQ₂ e dà61;8 copiasomma e dà79;1 dà37.', '1 nC dà9/2 V,3 dà27/2;negativo viola dominio;non infinite perchéV cresce con scala.']
ASSUMPTIONS=['Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.', 'Due sorgenti positive fisse nel vuoto entrambe a3 m daP, stesso zero all’infinito e k_e assegnato9·10⁹. V scalare non richiede angolo fra posizioni. Caso03 sorgenti uguali opposte: E0 ma Vpositivo; nessuna stabilità dedotta. Caso06 nuovo gauge sottrae18 V senza cambiare campo/differenze. Inverse con residuo positivo, display continuo.']
PEDAGOGY=['Legge e grandezza richiesta motivate prima dei numeri; prefissi e natura scalare/vettoriale espliciti.', 'Controllo dimensionale indipendente e scelta unica fra alternative effettivamente lette.', 'Legge o caso concettuale derivati senza usare la chiave come prova; opzioni lette dopo la primaria.', 'Confronto controllato con distinzione fra sorgente variata e totale.', 'Inversa derivata prima di sostituire; controllo del dominio positivo.', 'Seconda inversa con ramo fisico o riferimento del potenziale dichiarato.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza distinto dal rapporto e unità mantenute.', 'Inversa simbolica con cancellazione dimensionale e divisioni lecite.', 'Fattori sostituiti nel modello completo, inclusi i pesi delle sorgenti.', 'Entrambi i parametri variati ricostruiti prima del rapporto.', 'Media delle uscite verificata separatamente dai dati medi; prove distinte.', 'Bersaglio ricostruito prima dell’inversa e rapporto distinto dal valore.', 'Display continuo decodificato prima dell’inversa fisica.', 'Guadagno e offset ricavati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra configurazioni sostituito prima di decidere unicità o famiglia continua.']
EXPECTED_IDS={'AR-u6-symmetric-electric-potential-14', 'AR-u6-symmetric-electric-potential-07', 'AR-u6-symmetric-electric-potential-09', 'AR-u6-symmetric-electric-potential-15', 'AR-u6-symmetric-electric-potential-10', 'AR-u6-symmetric-electric-potential-11', 'AR-u6-symmetric-electric-potential-04', 'AR-u6-symmetric-electric-potential-13', 'AR-u6-symmetric-electric-potential-03', 'AR-u6-symmetric-electric-potential-08', 'AR-u6-symmetric-electric-potential-06', 'AR-u6-symmetric-electric-potential-05', 'AR-u6-symmetric-electric-potential-16', 'AR-u6-symmetric-electric-potential-12', 'AR-u6-symmetric-electric-potential-02', 'AR-u6-symmetric-electric-potential-01'}
REVIEWED_CANDIDATES={'AR-u6-symmetric-electric-potential-01': 'c4fba3f0bce8ebb717d8c38dcb4c0aefc90ea2cfad4f0f3db885fecdd90cef20', 'AR-u6-symmetric-electric-potential-02': '4ff78eb4c1c43c5c672761dc04b2fdef6982b5cf06f7d74ba7ce20684f4899ae', 'AR-u6-symmetric-electric-potential-03': 'ae3969ab81f0d5072ac5bbcb4c5e6127616856a50adaaa578a67b6dae0d52fbd', 'AR-u6-symmetric-electric-potential-04': '0d4e67b77373708c8dbd090722dd8b54026276787378a835784d270f761a2006', 'AR-u6-symmetric-electric-potential-05': 'c3835b40406f3140a49691e3125bffba0505e1f1ac6ab4113dd65938110473d3', 'AR-u6-symmetric-electric-potential-06': 'f86e447bc3da5ad9d0bc6b5c57c101fd87d0bad4f276f7ebc6d46bd9410afe16', 'AR-u6-symmetric-electric-potential-07': '3791236dc3a7afb77d61e38c9c19146ecc096de0f732c2e84a8c0792b8b831b5', 'AR-u6-symmetric-electric-potential-08': '601b1e5d54c9b6c4d386f9d646ea3c754d2bfaeda0817c55c3c9781ae1d08ada', 'AR-u6-symmetric-electric-potential-09': '30b4c17bd18e5e743e74fd7a003721a6b1a2c23cf76df46f429fb151fdbdf737', 'AR-u6-symmetric-electric-potential-10': 'e01bed4b3b63ac187a2f6794fdcb05fa631c1181ed48a80e8f2ea9d491b8f207', 'AR-u6-symmetric-electric-potential-11': '9fc13a9c00475df78ca66cc3ba022cb83538f2eea13be8ea885a0a6133a5de48', 'AR-u6-symmetric-electric-potential-12': 'bb1475e3689aeaf1f65f76b7eb98556fcfd6e51ea5f7889846fd9b4f88258065', 'AR-u6-symmetric-electric-potential-13': '26eb108162805e211f4d780cb38d48d95e64e827170f9ccc4ef5ad83be78cda8', 'AR-u6-symmetric-electric-potential-14': '9af404bf5f536ee769bc46b5db519232ef754fd6bf5903e442ad6fa515c75383', 'AR-u6-symmetric-electric-potential-15': 'e85d2b8630b275262a95aceb9922b8358235616b7376f73a8353603a7daa517e', 'AR-u6-symmetric-electric-potential-16': '093d200c8b4dcd7d390bd302fc876a69a546b9e7eb02e93f52607dd9042a5f08'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(985, 1), Fraction(216, 1), Fraction(34, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1310, 1)), (Fraction(150, 1), Fraction(1056, 1), Fraction(360, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1127, 1), Fraction(288, 1), Fraction(34, 1))}
REQUIRED_PATHS={'M300 565H180', 'M300 565H420', 'M32 846H608', 'M32 396H608', 'M110 250H300M110 239V261M300 239V261', 'M300 250H490M490 239V261', 'M150 963V1200', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES={(Fraction(490, 1), Fraction(165, 1), Fraction(15, 1)), (Fraction(300, 1), Fraction(165, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(165, 1), Fraction(15, 1))}
GEOMETRY_REVIEW='XML e immagine integrale letti: distanze190/190 per3 m, sola somma scalare nel primo schema. Due frecce distinte dal puntoP lunghe120 in versi opposti per1 N/C uguali; totaleE0 distinto daV6 V. Barre216/360/288 per9/15/12 V con scala24, assi/etichette separati.'
DECIMAL_REGRESSION_NUMBER=8

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def equivalent_literal(wanted):
    wanted=sp.Rational(wanted)
    return f"{2*wanted.p}/{2*wanted.q}"
def calibrate(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading,unit):
    q,z=sp.symbols("q z",real=True)
    first,second=sp.Rational(first),sp.Rational(second)
    gain=sp.cancel(sp.Rational(reference_reading)/first)
    decoded=sp.cancel(sp.Rational(new_reading)/gain)
    fit=sp.solve([sp.Eq(q*first+z,reading_a),sp.Eq(q*second+z,reading_b)],(q,z))
    assert first!=second and gain>0 and fit[q]>0
    physical=(SI.Quantity(Fraction(reference_reading),"")/SI.Quantity(Fraction(first),unit)).to("1/("+unit+")")
    assert sp.simplify(sp.Rational(physical.magnitude)-gain)==0
    return gain,fit[z],decoded,sp.cancel((third_reading-fit[z])/fit[q])
def parse_option(number,option):
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)

def alternative_identity(option):
    for suffix in (' N/C',' μC',' nC',' cm',' V',' N',' m',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def field_value(first,second):
    first,second=map(Fraction,(first,second))
    if min(first,second)<=0:raise ValueError('Both sources positive required')
    k=SI.Quantity(9*10**9,'newton*meter**2/coulomb**2')
    return Fraction((k*SI.Quantity((first+second)/10**9,'coulomb')/SI.Quantity(3,'meter')).to('volt').magnitude)
def inverse_first(value,second):
    value,second=map(Fraction,(value,second))
    if min(value,second)<=0 or value<=3*second:raise ValueError('Potential must exceed known positive source contribution')
    return value/3-second
def scaled(first,second,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return field_value(a*first,b*second)/field_value(first,second)
def gauge(value,reference):return Fraction(value)-Fraction(reference)
def constrained(value):
    value=Fraction(value)
    if value<=0:raise ValueError('Positive potential required')
    return 2*value/9
@lru_cache(maxsize=1)
def oracle():
    V,k,l,r,d=sp.symbols('V k first second d',positive=True)
    law=sp.Eq(V,k*l/d+k*r/d)
    assert sp.solve(law,l)==[V*d/k-r]
    first=sp.Rational(field_value(1,2));second=sp.Rational(field_value(2,3));assert (first,second)==(9,15)
    fit=calibrate(first,second,27,45,19,31,49,'volt');assert fit==(3,1,15,24)
    assert field_value(Fraction(3,2),Fraction(5,2))==12
    assert 9*Fraction(1,3)**2-9*Fraction(1,3)**2==0 and field_value(1,1)==6
    return [first,'V','In P il campo è nullo e il potenziale è positivo','Da 9 a 12 V',inverse_first(first,2),gauge(6,18),scaled(1,2,1,Fraction(1,2)),18-first,'Q₁ = V_P d / k_e − Q₂','(κ₁ Q₁ + κ₂ Q₂) / (Q₁ + Q₂)',second/first,(first+second)/2,inverse_first(sp.Rational(5,3)*first,2)/2,inverse_first(fit[2],3),inverse_first(fit[3],5),constrained(9)]

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    if rects!=REQUIRED_RECTS or paths!=REQUIRED_PATHS or circles!=REQUIRED_CIRCLES:
        raise ValueError('Independent physical scale or radial geometry changed')
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
        errors.extend(common);number=int(row["id"].rsplit("-",1)[1]);source_id="u6-"+FAMILY+f"-{number:02}"
        source=originals[source_id];provenance=b.get("provenance",{})
        if b.get("sourceId")!=source_id or b.get("sourceRef")!=SOURCE_REF or b.get("sourceSha256")!=digest(source):
            errors.append("Independent pinned Git source binding mismatch")
        if (provenance.get("sourcePath")!=SOURCE_PATH or provenance.get("sourceRef")!=SOURCE_REF or provenance.get("sourceId")!=source_id
            or provenance.get("sourceReasoningTask")!=source["descriptors"]["reasoningTask"] or provenance.get("sourceProvenance")!=source.get("provenance")
            or b.get("provenanceSha256")!=digest(provenance) or provenance.get("humanApproval")!="NOT_RUN" or provenance.get("status")!="DRAFT"
            or provenance.get("independentReview")!="NOT_RUN"):
            errors.append("Independent pinned source provenance mismatch")
        skill,prerequisites=EXPECTED_MAPPING[number]
        if row.get("course")!="C4" or row.get("skill")!=skill or row.get("prerequisites")!=prerequisites or row.get("reuse")!=["C6"] or row.get("error",{}).get("target")!=skill:
            errors.append("Independent reviewed course or actual lesson mapping mismatch")
        wanted=expected[number-1];value=row["answer"]["value"]
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
          "reviewDependencySha256":{"entropy_state_review.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_Coulomb_radial_field_scalar_potential_superposition_inverse_gauge_and_calibration",
            "Pint_exact_charge_force_field_potential_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"entropy_state_review.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-electrostatics-190-194-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-01","U2-01")
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
    return {"scope":"independent_oracle_integrity_and_manual_review_boundary_mutation_tests","cases":cases,"caseCount":len(cases),
            "allRejected":True,"frozenSignaturesRestored":True,"humanApproval":"NOT_RUN","publication":"DRAFT"}
