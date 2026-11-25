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
CANDIDATE_REF='1713e2030d2b037bea9d1664d156e277fca2b4fb'
PRIMARY_SHA256='12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a'
FAMILY='coulomb-force'
BATCH='coulomb-force-190'
ASSET_NAME='coulomb-force-progressive.svg'
REVIEWED_PACKAGE_SHA256='4aa37481b34376e8bae21480932c5c1570f5674127b631e4ea78e3906245b806'
REVIEWED_BINDINGS_SHA256='5b9ba2e22d46666cbb50331bce87fdb48054c8fa7d7cd35454939ddb142d1d43'
SOURCE_REFERENCE='Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.'
FALSE_PROOF='Raddoppiare la distanza raddoppia la forza repulsiva.'
SVG_MUTATION=(b'width="320"', b'width="321"')
EXPECTED_MAPPING={1: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 2: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 3: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 4: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 5: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 6: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 7: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 8: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 9: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 10: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 11: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 12: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 13: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 14: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 15: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01']), 16: ('C4-L01', ['C1-L001', 'C1-L002', 'C4-L01'])}
NUMERIC_UNITS={1: 'N', 5: 'μC', 6: 'cm', 11: '1', 14: 'μC'}
OPTION_SUFFIX={7: '', 8: ' N', 12: ' N', 13: '', 15: ' μC', 16: ' cm'}
UNITS={1: 'newton', 2: 'newton', 3: 'newton', 4: 'newton', 5: 'microcoulomb', 6: 'centimeter', 7: 'dimensionless', 8: 'newton', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton', 13: 'dimensionless', 14: 'microcoulomb', 15: 'microcoulomb', 16: 'centimeter'}
MANUAL=['Legge di Coulomb nel vuoto: F=kₑQq/r², modulo positivo e repulsivo per entrambe le cariche positive. Q=1 μC=10⁻⁶ C, q=10⁻⁶ C, r=3 cm=3·10⁻² m. Il numeratore è 9·10⁻³ N·m² e r²=9·10⁻⁴ m²: F=10 N. Il valore kₑ è quello assegnato dal modello, senza attribuirgli esattezza sperimentale universale. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'La forza ha unità N=kg·m/s². Nella legge, (N·m²/C²)·C·C/m² lascia N. Senza le alternative non si sceglie una stringa, ma questa è la dimensione necessaria. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Con x=Q/(1 μC)>0 e y=r/(1 cm)>0, F=(90 N)x/y²: 9·10⁹·10⁻⁶·10⁻⁶/10⁻⁴=90. Si conserva la distinzione fra grandezze dimensionali e i loro valori numerici. In SI resta F=kₑQq/r², non una formula che perde i prefissi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A: F=90·1/3²=10 N. B: F=90·2/3²=20 N. A distanza uguale e q fisso la dipendenza da Q è lineare: la forza raddoppia e resta repulsiva. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Isolo Q=Fr²/(kₑq) in SI. Nelle unità assegnate x=(F/N)y²/90=10·9/90=1; quindi Q=1 μC. Tutti i fattori divisori sono positivi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Isolo r=√(kₑQq/F)>0. In centimetri y²=90·1/10=9, quindi y=3 e r=3 cm. La radice negativa non è una distanza; il punto r=0 è escluso dalla legge puntiforme. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A dà 10 N; B a 6 cm dà 90/36=5/2 N. Il rapporto F_B/F_A=(5/2)/10=1/4. Raddoppiare la distanza divide per quattro, non per due. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Il valore corretto è 10 N. Proposta meno corretto: 20−10=+10 N. Il rapporto due è una quantità diversa dallo scarto richiesto. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Da F=kₑQq/r² segue Q=Fr²/(kₑq). Se si usano valori numerici nelle unità dichiarate, Q/(1 μC)=(F/N)[r/(1 cm)]²/90. Il risultato è positivo per F,r,q positivi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Sostituisco Q_B=κ₁Q_A e r_B=κ₂r_A: F_B/F_A=κ₁/κ₂². Se le due cariche e le distanze restano nel dominio positivo, non cambia il carattere repulsivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A: F_A=10 N. B con 2 μC e 1 cm dà F_B=90·2=180 N. Il rapporto è 180/10=18: un fattore due nella carica e nove nella distanza inversa al quadrato. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Le uscite sono 10 e 180 N: media=(10+180)/2=95 N. Ai valori medi Q=3/2 μC e r=2 cm si avrebbe 90(3/2)/4=135/4 N, diverso. La media delle forze non è una forza ai dati medi. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Il bersaglio è 18·10=180 N. Con Q_B=2 μC, y_B²=90·2/180=1; r_B=1 cm. Dividendo per r_A=3 cm ottengo r_B/r_A=1/3. È il ramo positivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Il riferimento dà F_A=10 N e lettura 30, quindi a_cal=3 per N nella stessa unità strumentale. Lettura 540 decodifica F_B=180 N. Con r_B=1 cm, Q_B/(1 μC)=180/90=2: Q_B=2 μC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'I riferimenti danno 10 e 180 N. Il guadagno è (361−21)/(180−10)=340/170=2 per N; offset b_cal=21−2·10=1. Lettura 41 dà F_C=(41−1)/2=20 N. A 3 cm, Q_C/(1 μC)=20·9/90=2: Q_C=2 μC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Il vincolo dimensionato è Q=γr, γ=(1/3) μC/cm, non un numero senza unità in una relazione SI. Con y=r/(1 cm)>0 si ha x=y/3 e F/N=90(y/3)/y²=30/y. Misura 10 N impone y=3: r=3 cm e Q=1 μC. Una sola distanza positiva; il fattore y cancellato non può essere zero. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.']
DISTRACTORS=['90 perde r²; 30 usa una sola potenza; un campo N/C non è una forza. 1 N non ricostruisce il valore con i prefissi assegnati.', 'N/C campo, J energia, C carica e V potenziale. Il lavoro è associato a uno spostamento; energia potenziale e forza non sono identiche.', 'Una potenza sola di ρ perde il quadrato; prodotto cresce con r, reciproco inverte Q; 1/90 inverte il coefficiente.', '5 N rende inverso Q; 40 usa Q²; 10 ignora il cambio; zero non rispetta cariche positive finite.', '1/3 μC usa fρ/90 anziché fρ²/90 e predice 10/3 N; 3 μC predice30 N. Non si divide invece per ρ in questa attribuzione.', '9 cm omette la radice e produce10/9 N; −3 cm non è distanza; 1/3 cm dà810 N.', '1/2 perde quadrato,4 inverte rapporto,1 ignora distanza e−1/4 contraddice moduli positivi.', '−10 scambia ordine,20 copia proposta,0 la accetta e2 è rapporto privo di N.', 'Una sola potenza r cambia unità; reciproco ha C⁻¹; r² al denominatore non inverte legge; fattore2 è arbitrario.', 'Quoziente senza quadrato perde una potenza, prodotto rende diretta distanza; reciproco scambia C/A; Q² non appartiene a Coulomb con q fisso.', '2 segue Q soltanto;9 segue soltanto distanza;6 perde il quadrato;1/18 inverte il rapporto.', '135/4 N è risposta ai dati medi;190 non divide per2;85 è semidifferenza;10 ripete A.', '3 inverte1/3;1/9 è rapporto dei quadrati;2 e18 copiano fattori di Q e F.', '6 μC usa540 come N, ignorando gain3;1 torna ad A;18 copia rapporto di forza senza geometria.', '41/20 μC omette offset e produce42;1 ripete A;4 rimuove b ma non a e produce81;20 copia N come μC.', '1 cm dà30 N;9 cm dà10/3 N;−3 escluso e non infinite perché rimane1/ρ.']
ASSUMPTIONS=['Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.', 'Cariche puntiformi positive fisse nel vuoto, q=1 μC e k_e=9·10⁹ N·m²/C² assegnato come modello; modulo repulsivo su Q, Q>0 e r>0. Prefissi µC e cm convertiti separatamente. Display continuo, guadagno positivo; vincolo Q=γr fra configurazioni, non movimento entro una prova.']
PEDAGOGY=['Legge e grandezza richiesta motivate prima dei numeri; prefissi e natura scalare/vettoriale espliciti.', 'Controllo dimensionale indipendente e scelta unica fra alternative effettivamente lette.', 'Legge o caso concettuale derivati senza usare la chiave come prova; opzioni lette dopo la primaria.', 'Confronto controllato con distinzione fra sorgente variata e totale.', 'Inversa derivata prima di sostituire; controllo del dominio positivo.', 'Seconda inversa con ramo fisico o riferimento del potenziale dichiarato.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza distinto dal rapporto e unità mantenute.', 'Inversa simbolica con cancellazione dimensionale e divisioni lecite.', 'Fattori sostituiti nel modello completo, inclusi i pesi delle sorgenti.', 'Entrambi i parametri variati ricostruiti prima del rapporto.', 'Media delle uscite verificata separatamente dai dati medi; prove distinte.', 'Bersaglio ricostruito prima dell’inversa e rapporto distinto dal valore.', 'Display continuo decodificato prima dell’inversa fisica.', 'Guadagno e offset ricavati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra configurazioni sostituito prima di decidere unicità o famiglia continua.']
EXPECTED_IDS={'AR-u6-coulomb-force-16', 'AR-u6-coulomb-force-12', 'AR-u6-coulomb-force-04', 'AR-u6-coulomb-force-09', 'AR-u6-coulomb-force-10', 'AR-u6-coulomb-force-15', 'AR-u6-coulomb-force-13', 'AR-u6-coulomb-force-14', 'AR-u6-coulomb-force-02', 'AR-u6-coulomb-force-06', 'AR-u6-coulomb-force-03', 'AR-u6-coulomb-force-11', 'AR-u6-coulomb-force-01', 'AR-u6-coulomb-force-08', 'AR-u6-coulomb-force-05', 'AR-u6-coulomb-force-07'}
REVIEWED_CANDIDATES={'AR-u6-coulomb-force-01': 'c9348f937ea15f8abd82cb0985ffdaa658faccba2a8fdfd94e083d016a3d3153', 'AR-u6-coulomb-force-02': '4b2fd87e5f28f285193dd21e0d1e921f66bbf4b5adb3123b5740c774fef6281a', 'AR-u6-coulomb-force-03': 'a82cbff7e0496f2db5d1d759192134d15afa2331080a2334d2e8f00f6c1aa1e9', 'AR-u6-coulomb-force-04': 'c47bd890622e04abe59435b7552a64dd9d0513de4abc614717216cf2da3e82b9', 'AR-u6-coulomb-force-05': '5912ce84eb421e9e2b93c1912d50e28f762b0f61e3da37d5c9e7b9b76dcbfecf', 'AR-u6-coulomb-force-06': '29a822df4508b1754e71f57b2c696750a28ee0abaf68afe364f10fd22f991ee0', 'AR-u6-coulomb-force-07': '908b9457cb7dafc756babbc00c6f6d7a1c17ad8122ec7a6fce2bce14754820be', 'AR-u6-coulomb-force-08': '7dfe572626f027673ae1baa574ea7a4e3390d2876e521334455ef9e55ba7dec3', 'AR-u6-coulomb-force-09': '32ad441ca629519427dc7d5821845ee5ef317c9104e31f821f1780e7d1b0d484', 'AR-u6-coulomb-force-10': 'adabdcbe6734374056d01bfb549ea6743b2a26dadc282f9336bdb5702dc6dea8', 'AR-u6-coulomb-force-11': 'df5cb54a31308c50243b7f38044903916c4dc5fd64c79f18aab56babb1a1f1df', 'AR-u6-coulomb-force-12': '7000a9d8d165e94fab0b267794e6c8c4b4b5c2f027dbb01d54520043075aa2f3', 'AR-u6-coulomb-force-13': '4b6140497aaf624d1e7a05a5cdaa0fc26348e514fd3a82aad9dba72be3c473db', 'AR-u6-coulomb-force-14': '751e772638da74854d5893869a5059ee3049724f5fb068dcf8335b914a2e02d3', 'AR-u6-coulomb-force-15': 'f0729bf2954fe3c3cb14238288b3a0b32f76bda70463b320d41712c58b23980d', 'AR-u6-coulomb-force-16': 'd8b72d13cb877e432c310d690a949970fc6d07ff03cc7798c800903830d1c203'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(540, 1), Fraction(320, 1), Fraction(38, 1)), (Fraction(150, 1), Fraction(1127, 1), Fraction(190, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(985, 1), Fraction(20, 1), Fraction(34, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1310, 1)), (Fraction(150, 1), Fraction(640, 1), Fraction(80, 1), Fraction(38, 1)), (Fraction(150, 1), Fraction(1056, 1), Fraction(360, 1), Fraction(34, 1))}
REQUIRED_PATHS={'M32 846H608', 'M150 963V1200', 'M366 180H526', 'M110 270H350M110 258V282M350 258V282', 'M150 510V730', 'M32 387H608', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES={(Fraction(110, 1), Fraction(180, 1), Fraction(15, 1)), (Fraction(350, 1), Fraction(180, 1), Fraction(15, 1))}
GEOMETRY_REVIEW='Letti XML e immagine integrale: sorgenti separate240 unità intrinseche per3 cm; sola freccia repulsiva sulla Q destra. Confronto10 e5/2 N con barre320 e80; confronto10/180/95 N con barre20/360/190, origini comuni e scala distinta per pannello. Zero esterno agli assi, simboli puntiformi schematici.'
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

def field_value(source,distance):
    source,distance=map(Fraction,(source,distance))
    if min(source,distance)<=0:raise ValueError('Positive source and separation required')
    k=SI.Quantity(9*10**9,'newton*meter**2/coulomb**2')
    q=SI.Quantity(Fraction(1,10**6),'coulomb');Q=SI.Quantity(source/10**6,'coulomb');r=SI.Quantity(distance/100,'meter')
    return Fraction((k*q*Q/r**2).to('newton').magnitude)
def inverse_source(value,distance):
    value,distance=map(Fraction,(value,distance))
    if min(value,distance)<=0:raise ValueError('Positive force and distance required')
    return value*distance**2/90
def inverse_distance(value,source):
    value,source=map(Fraction,(value,source))
    if min(value,source)<=0:raise ValueError('Positive force and source required')
    return sp.sqrt(sp.Rational(90*source/value))
def scaled(source,distance,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive factors required')
    return field_value(a*source,b*distance)/field_value(source,distance)
def constrained(value):
    value=Fraction(value)
    if value<=0:raise ValueError('Positive force required')
    return 30/value
@lru_cache(maxsize=1)
def oracle():
    F,k,q,Q,r=sp.symbols('F k q Q r',positive=True)
    law=sp.Eq(F,k*q*Q/r**2)
    assert sp.solve(law,Q)==[F*r**2/(k*q)]
    assert sp.solve(law,r)==[sp.sqrt(k*q*Q/F)]
    first=sp.Rational(field_value(1,3));second=sp.Rational(field_value(2,1))
    assert (first,second)==(10,180)
    fit=calibrate(first,second,30,540,21,361,41,'newton')
    assert fit==(3,1,180,20)
    assert field_value(Fraction(3,2),2)==sp.Rational(135,4)
    return [first,'N','f = 90 u / ρ²','Da 10 a 20 N',inverse_source(first,3),inverse_distance(first,1),scaled(1,3,1,2),20-first,'Q = F r² / (k_e q)','κ₁/κ₂²',second/first,(first+second)/2,inverse_distance(18*first,2)/3,inverse_source(fit[2],1),inverse_source(fit[3],3),constrained(10)]

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
