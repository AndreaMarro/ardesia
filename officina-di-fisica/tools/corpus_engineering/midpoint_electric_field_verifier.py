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
CANDIDATE_REF='2bc133eade6c14f82c3f959e6364df013863235f'
PRIMARY_SHA256='12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a'
FAMILY='midpoint-electric-field'
BATCH='midpoint-electric-field-193'
ASSET_NAME='midpoint-electric-field-progressive.svg'
REVIEWED_PACKAGE_SHA256='8ad3562b749b0441928686d17ad27a1dd8391da1f9a536580a227742d4131d48'
REVIEWED_BINDINGS_SHA256='2ae0bde4e995ab002994038f3c3f07e3f428fbf01b4d1093e2b480375d904dad'
SOURCE_REFERENCE='Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.'
FALSE_PROOF='Essendo positive entrambe le cariche, i due campi nel punto medio vanno sempre sommati come moduli.'
SVG_MUTATION=(b'M270 535H486', b'M270 535H487')
EXPECTED_MAPPING={1: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 2: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 3: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 4: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 5: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 6: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 7: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 8: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 9: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 10: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 11: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 12: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 13: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 14: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 15: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 16: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02'])}
NUMERIC_UNITS={1: 'N/C', 5: 'nC', 6: 'nC', 11: '1', 13: '1', 14: 'nC'}
OPTION_SUFFIX={7: '', 8: ' N/C', 12: ' N/C', 15: ' nC', 16: ' nC'}
UNITS={1: 'newton/coulomb', 2: 'newton/coulomb', 3: 'newton/coulomb', 4: 'newton/coulomb', 5: 'nanocoulomb', 6: 'nanocoulomb', 7: 'dimensionless', 8: 'newton/coulomb', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton/coulomb', 13: 'dimensionless', 14: 'nanocoulomb', 15: 'nanocoulomb', 16: 'nanocoulomb'}
MANUAL=['Asse positivo verso destra. A P il contributo della carica positiva a sinistra è verso destra, quello della carica positiva a destra è verso sinistra. A 1 m, E_x=kₑ(Q_s−Q_d)/(1 m)²=9(3−1) N/C=+18 N/C. Il segno viene dalla somma vettoriale, non dai soli segni delle cariche. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'La componente E_x ha unità N/C=V/m, identica al modulo del campo ma con segno orientato. Non è un potenziale in volt o una forza in newton. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'E_x=kₑQ_s/(1 m)²−kₑQ_d/(1 m)². Nelle unità assegnate E_x/(N/C)=9[(Q_s−Q_d)/(1 nC)]. Q_s>Q_d>0 assicura E_x>0: qui il modulo coincide con la componente positiva, ma la sottrazione resta essenziale. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A: 9(3−1)=18 N/C. B: 9(5−1)=36 N/C, quindi raddoppia. Non cresce nel rapporto 5/3, perché il contributo destro rimane sottratto e fisso. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q_s=Q_d+E_x(1 m)²/kₑ. Con Q_d=1 nC ed E_x=18 N/C, il contributo aggiuntivo è 2 nC: Q_s=3 nC, maggiore del dato destro. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q_d=Q_s−E_x(1 m)²/kₑ. Con Q_s=3 nC ed E_x=18 N/C si sottraggono 2 nC e resta Q_d=1 nC. In generale serve 0<E_x<kₑQ_s/(1 m)² per Q_d>0. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A dà 18 N/C. In B Q_s=3 e Q_d=2 nC, quindi E_x=9 N/C. Rapporto 9/18=1/2: aumentare il contributo opposto riduce il campo netto. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'E_x corretto=18 N/C, proposta36 N/C. Scarto ordinato=36−18=+18 N/C. Il rapporto due non ha unità e non è questa differenza. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q_s=Q_d+E_x(1 m)²/kₑ in SI; in nC si usa Q_s/(1 nC)=Q_d/(1 nC)+(E_x/(N/C))/9. Il più rimuove dalla somma orientata il contributo negativo noto. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'E_x,B/E_x,A=(κ₁Q_s−κ₂Q_d)/(Q_s−Q_d), con κ₁Q_s>κ₂Q_d>0 oltre ai fattori positivi. Il dominio deve valere anche in B; la sola positività dei κ non lo garantisce. Un fattore comune κ rende il rapporto κ. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A:18 N/C. B con Q_s=7,Q_d=3 nC:9(7−3)=36 N/C. Rapporto2, non 7/3 o il rapporto delle somme delle cariche. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Media=(18+36)/2=27 N/C. Le cariche medie 5 e 2 nC danno 9(5−2)=27 N/C: la coincidenza segue dalla linearità della componente in entrambe le cariche a distanze fisse. Non è una proprietà universale delle medie di ogni formula. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Target E_x,B=36 N/C. Nuovo Q_s=7 nC: Q_d,B=7−36/9=3 nC, rispettando 7>3>0. Rapporto con Q_d,A=1 nC uguale3. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Riferimento E_x,A=18 N/C, S=54: a_cal=3 nella scala strumentale per N/C. S=108 decodifica36 N/C. Con Q_d=3 nC, Q_s=3+36/9=7 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Riferimenti18 e36 N/C: a_cal=(73−37)/(36−18)=2 nella scala strumentale per N/C; b_cal=1. S_C=19 dà E_x,C=9 N/C. Q_d=1 nC impone Q_s=1+9/9=2 nC, nel dominio 2>1>0. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q_s=3Q_d rende E_x=9(3−1)[Q_d/(1 nC)] N/C=18[Q_d/(1 nC)] N/C. Misura18 N/C determina Q_d=1 nC e Q_s=3 nC, unica coppia positiva. Il vincolo non cancella la scala perché la componente resta lineare nella carica. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.']
DISTRACTORS=['36 somma moduli,−18 inverte asse/sottrazione;27 e9 omettono sorgente;prodotto non sovrappone.', 'N forza,C carica,V potenziale,J energia; componente conserva N/C.', 'Somma perde verso destro,scambio dàsegno opposto,prodotto e quadrato non sono sovrapposizione lineare.', '30 scala tutto5/3 ignorando termine fisso;54 somma45+9;18 ignora cambio;9 diminuisce senza ragione.', '2 copia differenza,1 sottrae invece di aggiungere Q_d e annulla totale;18 copia campo.', '5 nC aggiunge differenza e inverte campo,0 viola Q_d>0;2 dà9 N/C. Radice o carica negativa non seconda soluzione.', '2 segue Q_d ma perde segno,1 ignora cambio,1/3 non ricostruisce differenze,negativo viola ramo.', '−18 inverte ordine,36 proposta,0 accetta errore;2 è rapporto puro.', 'Meno Q_d sbaglia inversa,reciproco C⁻¹ non sommabile;campo+carica eterogenei;d² errato altera unità.', 'Soli fattori perdono pesi;somme ignorano verso;reciproco C/A scambiato;dominioC esplicitamente controllato.', '7/3 solo sinistra,3 solo destra,10/4 somme senza segni,1/2 reciproco.', '54 somma non media,9 semidifferenza,18/36 solo una prova. Coincidenza ai dati medi dimostrata da linearità.', '2 copia bersaglio,7/3 sinistra,4 differenza,1/3 reciproco.', '15 nC usa108 come campo e differenza12;4 copia differenza;3 annulla campo ed esce ramo.', '37/18 omette b e predice20;1 annulla campo;3 predice37;4 predice55.', '3 e2 nC danno54/36 N/C;negativo viola positività;non infinite perché resta scala lineare.']
ASSUMPTIONS=['Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.', 'Due sorgenti positive fisse a1 m dai lati opposti diP, asse+x destra. Q_s>Q_d>0 e componente totale positiva; contributi radiali opposti, non somma di moduli. Fattori positivi devono mantenere κ₁Q_s>κ₂Q_d anche inC; inverse con residuo positivo. Display continuo, distanze e zero numerico comuni.']
PEDAGOGY=['Legge e grandezza richiesta motivate prima dei numeri; prefissi e natura scalare/vettoriale espliciti.', 'Controllo dimensionale indipendente e scelta unica fra alternative effettivamente lette.', 'Legge o caso concettuale derivati senza usare la chiave come prova; opzioni lette dopo la primaria.', 'Confronto controllato con distinzione fra sorgente variata e totale.', 'Inversa derivata prima di sostituire; controllo del dominio positivo.', 'Seconda inversa con ramo fisico o riferimento del potenziale dichiarato.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza distinto dal rapporto e unità mantenute.', 'Inversa simbolica con cancellazione dimensionale e divisioni lecite.', 'Fattori sostituiti nel modello completo, inclusi i pesi delle sorgenti.', 'Entrambi i parametri variati ricostruiti prima del rapporto.', 'Media delle uscite verificata separatamente dai dati medi; prove distinte.', 'Bersaglio ricostruito prima dell’inversa e rapporto distinto dal valore.', 'Display continuo decodificato prima dell’inversa fisica.', 'Guadagno e offset ricavati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra configurazioni sostituito prima di decidere unicità o famiglia continua.']
EXPECTED_IDS={'AR-u6-midpoint-electric-field-08', 'AR-u6-midpoint-electric-field-11', 'AR-u6-midpoint-electric-field-16', 'AR-u6-midpoint-electric-field-12', 'AR-u6-midpoint-electric-field-15', 'AR-u6-midpoint-electric-field-06', 'AR-u6-midpoint-electric-field-07', 'AR-u6-midpoint-electric-field-10', 'AR-u6-midpoint-electric-field-13', 'AR-u6-midpoint-electric-field-05', 'AR-u6-midpoint-electric-field-02', 'AR-u6-midpoint-electric-field-09', 'AR-u6-midpoint-electric-field-14', 'AR-u6-midpoint-electric-field-04', 'AR-u6-midpoint-electric-field-01', 'AR-u6-midpoint-electric-field-03'}
REVIEWED_CANDIDATES={'AR-u6-midpoint-electric-field-01': '14b7d39d852661827b0a11cf91e44ea4183b21d60efe92735122140b206df5c3', 'AR-u6-midpoint-electric-field-02': '2366944a1e68db01563dcaa6cf6b8cea5850a4ff734693988b06ff28641cddf8', 'AR-u6-midpoint-electric-field-03': '1d7fbc4a93523eaa9fab9c8849ff7697940840d18a54e9c9b833a2363b542912', 'AR-u6-midpoint-electric-field-04': '2e56f4276ced723a26c6394a0549f868b2d737fee3f52051df85be17f933edd7', 'AR-u6-midpoint-electric-field-05': 'a4045caaf14a83261b4d99eaa3529ccdabe2f23b6ed8976afdc36829a6709fcd', 'AR-u6-midpoint-electric-field-06': 'f5339b507663bb5027e6312c2fe066878e9cd4befa5323b8a9ba8e74466592f5', 'AR-u6-midpoint-electric-field-07': 'a7e3a554339a5ed33005ceb8aa437b79a47c9fd21069a15c02bb91ed8bae3a1a', 'AR-u6-midpoint-electric-field-08': 'e6d16e5b841f4291454e13ce64389c69ecbf36c2bec38d2755fde96c85e54db9', 'AR-u6-midpoint-electric-field-09': '1bb77d98517a195b5226c3b7797ccadd8ec14353f2752dca1446ffc9a201938f', 'AR-u6-midpoint-electric-field-10': 'b991d66a1783b396a6218b2006ebba6c826ab6dcc948d59395fe15068222f808', 'AR-u6-midpoint-electric-field-11': 'b5e38249862fa347b0b738d140d571cc881bb8f0c5a31e93855fa3dffe0955d5', 'AR-u6-midpoint-electric-field-12': 'f1fbef3a0b864551b2402e63ee8785e7f785c8ddd3ced22eb9aab18731996d8b', 'AR-u6-midpoint-electric-field-13': '7df19fe84d28f87068d06db832ae5cf03a07c56040bcba130c1d29d2d856715a', 'AR-u6-midpoint-electric-field-14': '7df76289d4793d538b9408e507bfb80bccc059376f8c78f00c718f23036c652f', 'AR-u6-midpoint-electric-field-15': 'fedf3d5ccc29a0360da25514cad9d6d927417cefb69ba9789ff705238b8f3905', 'AR-u6-midpoint-electric-field-16': 'bef14154a80c48fc79f4c8d2eb4dfe7cd2fc5b2c800732ece2b990a52eba753b'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1128, 1), Fraction(270, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1057, 1), Fraction(360, 1), Fraction(34, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1310, 1)), (Fraction(150, 1), Fraction(986, 1), Fraction(180, 1), Fraction(34, 1))}
REQUIRED_PATHS={'M270 695H414', 'M270 615H198', 'M32 367H608', 'M32 854H608', 'M110 250H300M110 239V261M300 239V261', 'M300 250H490M490 239V261', 'M150 966V1200', 'M270 490V735', 'M0 0L10 5L0 10Z', 'M270 535H486'}
REQUIRED_CIRCLES={(Fraction(490, 1), Fraction(165, 1), Fraction(15, 1)), (Fraction(300, 1), Fraction(165, 1), Fraction(4, 1)), (Fraction(110, 1), Fraction(165, 1), Fraction(15, 1))}
GEOMETRY_REVIEW='Letti XML/render integrali: sorgenti a190 unità daP su entrambi i lati per1 m. Diagramma valori con origine x270: frecce+216/−72/+144 per+27/−9/+18 N/C, scala8; marker separati e versi corretti. Barre180/360/270 per18/36/27, scala10; zeri fuori dagli assi.'
DECIMAL_REGRESSION_NUMBER=7

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

def field_value(left,right):
    left,right=map(Fraction,(left,right))
    if not left>right>0:raise ValueError('Strictly ordered positive sources required')
    k=SI.Quantity(9*10**9,'newton*meter**2/coulomb**2')
    # Each radial vector is computed with its own sign at P; separation is 1 m.
    a=k*SI.Quantity(left/10**9,'coulomb')/SI.Quantity(1,'meter')**2
    b=-k*SI.Quantity(right/10**9,'coulomb')/SI.Quantity(1,'meter')**2
    return Fraction((a+b).to('newton/coulomb').magnitude)
def inverse_left(value,right):
    value,right=map(Fraction,(value,right))
    if min(value,right)<=0:raise ValueError('Positive field and known right source required')
    return right+value/9
def inverse_right(value,left):
    value,left=map(Fraction,(value,left))
    if min(value,left)<=0 or value>=9*left:raise ValueError('Field strictly between zero and known left contribution required')
    return left-value/9
def scaled(left,right,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return field_value(a*left,b*right)/field_value(left,right)
def constrained(value):
    value=Fraction(value)
    if value<=0:raise ValueError('Positive field required')
    return value/18
@lru_cache(maxsize=1)
def oracle():
    E,k,l,r,d=sp.symbols('E k left right d',positive=True)
    law=sp.Eq(E,k*l/d**2-k*r/d**2)
    assert sp.solve(law,l)==[E*d**2/k+r]
    assert sp.solve(law,r)==[-E*d**2/k+l]
    first=sp.Rational(field_value(3,1));second=sp.Rational(field_value(7,3));assert (first,second)==(18,36)
    fit=calibrate(first,second,54,108,37,73,19,'newton/coulomb');assert fit==(3,1,36,9)
    assert field_value(5,2)==27
    return [first,'N/C','e = 9 (u − v)','Da 18 a 36 N/C',inverse_left(first,1),inverse_right(first,3),scaled(3,1,1,2),36-first,'Q_s = Q_d + E_x d² / k_e','(κ₁ Q_s − κ₂ Q_d) / (Q_s − Q_d)',second/first,(first+second)/2,inverse_right(2*first,7),inverse_left(fit[2],3),inverse_left(fit[3],1),constrained(18)]

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
