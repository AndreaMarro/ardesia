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
CANDIDATE_REF='2ca7a13fa8d183ad41a31d30bc0b90d8e12fe1e8'
PRIMARY_SHA256='12031f00b348d12feff99b677c4031308ed67876612eec5d77fb98df866b037a'
FAMILY='point-electric-field'
BATCH='point-electric-field-191'
ASSET_NAME='point-electric-field-progressive.svg'
REVIEWED_PACKAGE_SHA256='5a760a56ff2be886a4d4da5f1d009bdfb6dc84b30a1cb3b7b4f91ffb83cbbf97'
REVIEWED_BINDINGS_SHA256='67b867f897e65555ea4d600d15660f1132ed8b50762a9263aa0146da41a37d2a'
SOURCE_REFERENCE='Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.'
FALSE_PROOF='Il campo della sorgente dipende dalla massa della carica di prova.'
SVG_MUTATION=(b'width="40"', b'width="41"')
EXPECTED_MAPPING={1: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 2: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 3: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 4: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 5: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 6: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 7: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 8: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 9: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 10: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 11: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 12: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 13: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 14: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 15: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02']), 16: ('C4-L02', ['C1-L001', 'C1-L002', 'C4-L01', 'C4-L02'])}
NUMERIC_UNITS={1: 'N/C', 5: 'nC', 6: 'm', 11: '1', 14: 'nC'}
OPTION_SUFFIX={7: '', 8: ' N/C', 12: ' N/C', 13: '', 15: ' nC', 16: ' m'}
UNITS={1: 'newton/coulomb', 2: 'newton/coulomb', 3: 'newton/coulomb', 4: 'newton/coulomb', 5: 'nanocoulomb', 6: 'meter', 7: 'dimensionless', 8: 'newton/coulomb', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'newton/coulomb', 13: 'dimensionless', 14: 'nanocoulomb', 15: 'nanocoulomb', 16: 'meter'}
MANUAL=['Il campo di una carica puntiforme positiva è radiale uscente; il modulo è E=kₑQ/r². Q=1 nC=10⁻⁹ C rende kₑQ=9 N·m²/C. A r=3 m si ottiene E=9/9=1 N/C. Non si introduce una carica di prova nella definizione della sorgente. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'E è forza per carica di prova: N/C, equivalente a V/m. Le unità della legge sono (N·m²/C²)·C/m²=N/C. Senza alternative si fissa questa dimensione, non una scelta verbatim. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Il prompt concettuale non fornisce alternative né una distribuzione specifica, quindi non determina una sola frase selezionabile. Principi da controllare nella futura candidata: la tangente orientata a una linea indica E, verso della forza su una prova positiva; le linee escono da cariche positive e terminano su negative o all’infinito; non si incrociano dove il campo è definito e non nullo. Un campo elettrostatico non ha linee chiuse di campo non nullo. Le linee sono una rappresentazione, non traiettorie obbligatorie o fili materiali. La futura opzione va letta prima di assegnare un esito concettuale. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A: E=9·1/3²=1 N/C. B con Q=9 nC a 3 m dà E=9·9/9=9 N/C: cresce di un fattore nove, non del suo quadrato. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q=Er²/kₑ. Nelle unità assegnate Q/(1 nC)=(E/(N/C))[r/(1 m)]²/9=1·9/9=1; quindi Q=1 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'r=√(kₑQ/E)>0. Con Q=1 nC ed E=1 N/C, r²=9 m², r=3 m. Non si usa la radice negativa o r=0. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A a 3 m dà E_A=1 N/C; B a 1 m dà E_B=9 N/C. E_B/E_A=9. Il campo aumenta quando ci si avvicina alla sorgente. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'E corretto=1 N/C. Lo scarto ordinato è 2−1=+1 N/C. Non è il rapporto due e non è un errore in unità di forza N. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q=Er²/kₑ in SI; Q/(1 nC)=(E/(N/C))[r/(1 m)]²/9 nelle unità del testo. Il dominio E,r positivi restituisce Q positivo. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'E_B/E_A=κ₁/κ₂² da linearità nella carica e dipendenza inversa dal quadrato della distanza. Carica positiva e distanze positive mantengono il campo radiale uscente. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'A: 1 N/C. B: 9·4/2²=9 N/C. Il rapporto è 9, pur cambiando sia carica sia distanza. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Media=(1+9)/2=5 N/C. Agli ingressi medi Q=5/2 nC, r=5/2 m si avrebbe 9(5/2)/(25/4)=18/5 N/C, non cinque. Tutti i valori si trattano come frazioni esatte. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Target E_B=9 N/C con Q_B=4 nC: r_B²=9·4/9=4 m²; r_B=2 m. Rapporto con r_A=3 m: 2/3. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Riferimento E_A=1 N/C, S=3: a_cal=3 nella scala strumentale per N/C. S=27 decodifica E_B=9 N/C. A r=2 m, Q_B/(1 nC)=9·4/9=4: Q_B=4 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Riferimenti E_A=1 ed E_B=9 N/C: a_cal=(19−3)/(9−1)=2 nella scala strumentale per N/C; b_cal=1. S_C=5 dà E_C=2 N/C. A 3 m, Q_C/(1 nC)=2·9/9=2: Q_C=2 nC. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.', 'Q=γr con γ=(1/3) nC/m. Ponendo y=r/(1 m)>0, Q/(1 nC)=y/3 e E/(N/C)=9(y/3)/y²=3/y. Misura E=1 N/C dà y=3, quindi r=3 m e Q=1 nC. La relazione è fra prove, non una carica che varia lungo il campo di una singola sorgente. Ricalcolo sui dati e sulle condizioni finali effettuato; notazione normalizzata della candidata confrontata con la legge SI.']
DISTRACTORS=['9 N/C omette r²,3 usa solo r; N è forza che richiede q di prova. La direzione uscente segue Q>0.', 'N forza,C carica,J energia,m lunghezza: nessuno da solo forza per carica; V/m è equivalente ma assente.', 'Traiettoria dipende anche da velocità/massa/carica; incrocio dà due direzioni dove E≠0; verso negativo→positivo è invertito; lunghezza arbitraria non misura E.', '1/9 inverte Q,3 usa radice di9,81 usa quadrato di9;1 ignora sorgente nuova.', '1/3 nC usa eρ/9 e dà1/3 N/C;3 nC dà3 N/C; C contro nC cambia10⁹.', '9 m omette radice e dà1/9 N/C;−3 non è distanza;1/3 m dà81 N/C.', '3 omette quadrato,1/3 e1/9 fanno diminuire avvicinandosi,1 ignora cambio.', '−1 inverte ordine,2 copia proposta,0 la accetta;2 puro è rapporto.', 'Perdere r o mantenerlo al denominatore cambia inversione/unità; reciproco C⁻¹, fattore2 arbitrario.', 'κ₁/κ₂ perde quadrato; prodotto rende diretto r; reciproco inverte rapporto e κ₁² altera linearità della sorgente.', '4 segue Q,9/4 segue geometria,6 perde quadrato e1/9 inverte confronto.', '18/5 è modello ai dati medi;10 somma;4 semidifferenza;1 solo A. Prove separate non sorgenti simultanee.', '3/2 reciproco,4/9 quadrati delle distanze,4 e9 copiano fattori.', '12 nC usa display27 come campo;1 nC predice9/4 N/C;9 copia campo.', '5/2 nC omette b e predice D6;1 torna A;4 non divide a e dà9;5 copia display e dà11.', '1 m dà3 N/C,9 m dà1/3;−3 escluso. Il vincolo non cancella tutta la distanza.']
ASSUMPTIONS=['Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.', 'Sorgente puntiforme Q>0 fissa nel vuoto, k_e assegnato9·10⁹, r>0 e campo radiale uscente. Campo della sorgente distinto dalla forza su prova eventuale. Linee tangenti al campo non nullo, non traiettorie obbligatorie. Display continuo con guadagno positivo; vincolo Q=γr fra preparazioni.']
PEDAGOGY=['Legge e grandezza richiesta motivate prima dei numeri; prefissi e natura scalare/vettoriale espliciti.', 'Controllo dimensionale indipendente e scelta unica fra alternative effettivamente lette.', 'Legge o caso concettuale derivati senza usare la chiave come prova; opzioni lette dopo la primaria.', 'Confronto controllato con distinzione fra sorgente variata e totale.', 'Inversa derivata prima di sostituire; controllo del dominio positivo.', 'Seconda inversa con ramo fisico o riferimento del potenziale dichiarato.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza distinto dal rapporto e unità mantenute.', 'Inversa simbolica con cancellazione dimensionale e divisioni lecite.', 'Fattori sostituiti nel modello completo, inclusi i pesi delle sorgenti.', 'Entrambi i parametri variati ricostruiti prima del rapporto.', 'Media delle uscite verificata separatamente dai dati medi; prove distinte.', 'Bersaglio ricostruito prima dell’inversa e rapporto distinto dal valore.', 'Display continuo decodificato prima dell’inversa fisica.', 'Guadagno e offset ricavati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra configurazioni sostituito prima di decidere unicità o famiglia continua.']
EXPECTED_IDS={'AR-u6-point-electric-field-12', 'AR-u6-point-electric-field-07', 'AR-u6-point-electric-field-14', 'AR-u6-point-electric-field-16', 'AR-u6-point-electric-field-03', 'AR-u6-point-electric-field-15', 'AR-u6-point-electric-field-11', 'AR-u6-point-electric-field-01', 'AR-u6-point-electric-field-05', 'AR-u6-point-electric-field-10', 'AR-u6-point-electric-field-08', 'AR-u6-point-electric-field-13', 'AR-u6-point-electric-field-06', 'AR-u6-point-electric-field-09', 'AR-u6-point-electric-field-04', 'AR-u6-point-electric-field-02'}
REVIEWED_CANDIDATES={'AR-u6-point-electric-field-01': '4f13bda674cdcdd4020770a771e43cfab35697b645effabc8026e0b4eb019c1b', 'AR-u6-point-electric-field-02': '2fdbdcf75a39eb93aecaedf5f78ddc9fc11e66f61430a53ec2701d43de37cba5', 'AR-u6-point-electric-field-03': '1c8da04d563e312b4331a6ca7992d2c3eaa6d24ad8ce6de5d2c3a6dd697f65e5', 'AR-u6-point-electric-field-04': '0bebc18931d25024a0c24419fa91c4071c449bc3163103c3afbf2577075515cd', 'AR-u6-point-electric-field-05': '6e3bd7416fed1ae825983513a8398cc2c458aa7846e0dc5a51d4475e3923fc85', 'AR-u6-point-electric-field-06': '32a002820e67b1fc40bff9a2761d06f19a53e75b285d0814e6c3cc1ecf349bbd', 'AR-u6-point-electric-field-07': 'b348ab96b8d5d29ea4838f75b5354ea5429655508f422ba27999eb7cf6551e4a', 'AR-u6-point-electric-field-08': '32d9c8e67bdc51417b936e4b831cb8de5e368f116e307fc0e30a73344042eac5', 'AR-u6-point-electric-field-09': 'c04407a4cbfdf8e891a3f984df5e9db2a1028ab0882d0554ddb8ae02c3a5279d', 'AR-u6-point-electric-field-10': '5d0c148b0ae8541bdba79ca0f44049b8d0bfa1ba0b184751bf0e23a4eed387de', 'AR-u6-point-electric-field-11': 'c51487a4c08d325a427cfb38e6291ac03d53c9284438a22136ad7ceaac1e9782', 'AR-u6-point-electric-field-12': '9a6127170138509acde3168b3187b021c5ab229147100ab8984d95ac17da002e', 'AR-u6-point-electric-field-13': '363946a2aac7a2958b91fb4d8e3c9b793769f56aafbaca1f71dbe11f3c83afb6', 'AR-u6-point-electric-field-14': '3d32a24cbeb2a308ffd764405ca2fd0ffbf6d2e1646efbce37e9be8d3a7627fb', 'AR-u6-point-electric-field-15': '51d3042ec865d489b86db197e47c2968e62746625b006d5b16af666ac29d467f', 'AR-u6-point-electric-field-16': '96c10f1c27d23badd05eca40f201e65aebcfd2bee9af17a494488ea87d511110'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(540, 1), Fraction(40, 1), Fraction(38, 1)), (Fraction(150, 1), Fraction(1127, 1), Fraction(200, 1), Fraction(34, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1310, 1)), (Fraction(150, 1), Fraction(985, 1), Fraction(40, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(640, 1), Fraction(360, 1), Fraction(38, 1)), (Fraction(150, 1), Fraction(1056, 1), Fraction(360, 1), Fraction(34, 1))}
REQUIRED_PATHS={'M355 180H515', 'M150 510V730', 'M32 387H608', 'M32 846H608', 'M150 963V1200', 'M110 270H350M110 258V282M350 258V282', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES={(Fraction(110, 1), Fraction(180, 1), Fraction(15, 1)), (Fraction(350, 1), Fraction(180, 1), Fraction(4, 1))}
GEOMETRY_REVIEW='XML e rendering intero letti: distanza240 per3 m; freccia locale del campo uscente dichiarata schematica. Barre40/360 per1/9 N/C; confronto finale40/360/200 per1/9/5 N/C, zero comune e40 unità intrinseche perN/C. Nessun testo tagliato o intersezione di etichette con assi.'
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
    return Fraction((k*SI.Quantity(source/10**9,'coulomb')/SI.Quantity(distance,'meter')**2).to('newton/coulomb').magnitude)
def inverse_source(value,distance):
    value,distance=map(Fraction,(value,distance))
    if min(value,distance)<=0:raise ValueError('Positive field and distance required')
    return value*distance**2/9
def inverse_distance(value,source):
    value,source=map(Fraction,(value,source))
    if min(value,source)<=0:raise ValueError('Positive field and source required')
    return sp.sqrt(sp.Rational(9*source/value))
def scaled(source,distance,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive factors required')
    return field_value(a*source,b*distance)/field_value(source,distance)
def constrained(value):
    value=Fraction(value)
    if value<=0:raise ValueError('Positive field required')
    return 3/value
@lru_cache(maxsize=1)
def oracle():
    E,k,Q,r=sp.symbols('E k Q r',positive=True)
    law=sp.Eq(E,k*Q/r**2)
    assert sp.solve(law,Q)==[E*r**2/k]
    assert sp.solve(law,r)==[sp.sqrt(k*Q/E)]
    assert SI.Unit('newton/coulomb').dimensionality==SI.Unit('volt/meter').dimensionality
    first=sp.Rational(field_value(1,3));second=sp.Rational(field_value(4,2))
    assert (first,second)==(1,9)
    fit=calibrate(first,second,3,27,3,19,5,'newton/coulomb');assert fit==(3,1,9,2)
    assert field_value(Fraction(5,2),Fraction(5,2))==Fraction(18,5)
    return [first,'N/C','La tangente alla linea dà la direzione del campo e due linee non si incrociano nel punto','Da 1 a 9 N/C',inverse_source(first,3),inverse_distance(first,1),scaled(1,3,1,Fraction(1,3)),2-first,'Q = E r² / k_e','κ₁/κ₂²',second/first,(first+second)/2,inverse_distance(9*first,4)/3,inverse_source(fit[2],2),inverse_source(fit[3],3),constrained(1)]

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
