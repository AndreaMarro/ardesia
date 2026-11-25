"""Independent source-first U6-02 laws; no candidate authoring imports.
Signatures identify the complete final text and full native SVG read separately.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-02.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
CANDIDATE_REF='a6d4f710adc944d3ad603f018f013d00a481eecf'
PRIMARY_SHA256='d7ebcced2248cb67371054303db64193683455aecc7acf34a27196c23ba8afb6'
FAMILY='current-charge-time'
BATCH='current-charge-time-202'
ASSET_NAME='current-charge-time-progressive.svg'
REVIEWED_PACKAGE_SHA256='9a94c0e91855ac2ae8bce269ddd9775bf7ba163695c5d7f5479795e06a07fc25'
REVIEWED_BINDINGS_SHA256='e90ae1801799e7a7dbb5f2209a3e7831c891fdafcf28fd5c10cd046cce4b7805'
SOURCE_REFERENCE='Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.'
FALSE_PROOF='Una corrente media3A implica necessariamente una corrente istantanea costante3A durante tutto l’intervallo.'
SVG_MUTATION=(b'M130 850L330 770L530 610', b'M130 850L330 750L530 610')
EXPECTED_MAPPING={1: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 2: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 3: ('C4-L09', ['C1-L002', 'C4-L01', 'C4-L02', 'C4-L05', 'C4-L09']), 4: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 5: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 6: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 7: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 8: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 9: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 10: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 11: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 12: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 13: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 14: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 15: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05']), 16: ('C4-L05', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05'])}
NUMERIC_UNITS={1: 'A', 5: 'mC', 6: 'ms', 14: 'mC'}
OPTION_SUFFIX={7: '', 8: ' A', 11: '', 12: ' A', 13: '', 15: ' mC'}
UNITS={1: 'ampere', 2: 'ampere', 3: 'tesla', 4: 'ampere', 5: 'millicoulomb', 6: 'millisecond', 7: 'dimensionless', 8: 'ampere', 9: 'coulomb', 10: 'dimensionless', 11: 'dimensionless', 12: 'ampere', 13: 'dimensionless', 14: 'millicoulomb', 15: 'millicoulomb', 16: 'millicoulomb'}
MANUAL=['La corrente media orientata è I_media=Q/Δt. Qui Q=6·10⁻³ C e Δt=2·10⁻³ s: i prefissi si cancellano e I_media=3 C/s=3 A. Il verso positivo è coerente con il trasferimento; non si deduce il valore istantaneo in ogni momento. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La dimensione della corrente è carica/tempo: A=C/s. Una carica inC o un intervallo ins non sono da soli una corrente; mC/ms ha scala uguale aC/s. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Caso autonomo magnetico: per un lungo filo rettilineo con corrente continua, trascurando estremi e altri fili, le linee diB sono circonferenze concentriche attorno al filo in piani perpendicolari; il verso segue la mano destra rispetto alla corrente convenzionale. In mezzo uniforme non magnetico il modulo decresce come 1/r. Senza alternative non si inventa una stringa di risposta. Non sono linee radiali del campo elettrico. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 6/2=3 A. B con Q=1 mC nello stesso intervallo 2 ms dà 1/2 A: corrente media sei volte minore. Non cambia il denominatore temporale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Q=I_mediaΔt. Con 3 A e 2 ms, Q=6 mC=6·10⁻³ C. La media basta a ricostruire la carica netta sull’intervallo, senza corrente istantanea costante. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Δt=Q/I_media. Con 6 mC e 3 A si ha Δt=2 ms. Carica e media positive danno un intervallo strettamente positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A:6 mC/2 ms=3 A. B:6 mC/1 ms=6 A. Rapporto 2; il tempo dimezzato raddoppia la media a carica netta uguale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Valore corretto 3 A, proposta 6 A: scarto=+3 A. Il rapporto 2 non è una corrente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Dalla definizione media I_media=Q/Δt segue Q=I_mediaΔt. Ampere per secondi dàcoulomb; ampere permillisecondi dàmillicoulomb. Nessuna ipotesi di costanza istantanea è richiesta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Con Q_B=κ₁Q_A e Δt_B=κ₂Δt_A, I_B/I_A=κ₁/κ₂. Positività dei fattori mantiene gli intervalli ammissibili. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 3 A; B con 12 mC in 3 ms dà 4 A. Rapporto 4/3, includendo sia il raddoppio della carica sia il fattore 3/2 dell’intervallo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media aritmetica delle due correnti medie=(3+4)/2=7/2 A. Non è la media temporale sugli intervalli concatenati, che sarebbe(6+12)mC/(2+3)ms=18/5 A. Anche ai valori medi Q=9 mC e Δt=5/2 ms la legge dà 18/5 A, distinto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio I_B=(4/3)3=4 A. Con Q_B=12 mC serve Δt_B=3 ms. Rapporto Δt_B/Δt_A=3/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 3 A e S 9: a=3 nella scala strumentale perA. S 12 decodifica 4 A; per Δt 3 ms la carica netta è 12 mC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 3 e 4 A, letture 7 e 9: a=2, b=1. S_C 5 decodifica I_C=(5−1)/2=2 A. In 5 ms passano Q_C=10 mC. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo dimensionato Q=(3 mC/ms)Δt=(3 A)Δt rende I_media=3 A per ogni Δt>0. La misura è ridondante: infinite coppie nel modello macroscopico continuo, per esempio(6 mC, 2 ms) e(12 mC, 4 ms). Il dato non impone una corrente istantanea costante. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['3 mA converte Q in C ma lascia il tempo in ms come se fosse in s; 3000 A converte solo il tempo. Il prodotto QΔt non è corrente.', 'C misura carica, s durata, V tensione e Ω resistenza; A=C/s misura la corrente, anche quando è media.', 'Linee radiali confondono B con E. La direzione parallela al filo è errata; una corrente continua non annulla B. Il verso orario richiederebbe corrente entrante.', '18 A rende inversa Q; 3 A ignora la modifica. Uno copia Q nuova e sei copia Q iniziale, senza dividere per la durata.', '3/2 divide per il tempo anziché moltiplicare. Sei C perde il prefisso milli. Il conteggio di elettroni non è determinato senza ulteriori dati sul trasferimento netto.', '18 moltiplica Q e I; 1/2 inverte il rapporto. Due s perde il prefisso milli e una durata negativa esce dal dominio.', '1/2 rende diretta la dipendenza dal tempo; uno ignora la prova nuova. Quattro introduce un quadrato e il negativo viola il verso dichiarato.', '−3 A inverte l’ordine, 6 A copia la proposta, zero la accetta. Due è un rapporto puro.', 'I/Δt ha unità A/s; Δt/I non è una carica. Potenze ulteriori di corrente o tempo alterano le dimensioni.', 'Il prodotto rende diretta la durata; il reciproco inverte B/A. Il tempo al quadrato non compare; la somma dei fattori dà due per prove identiche.', '3/4 è il reciproco, due segue solo Q e 3/2 segue la durata nel verso sbagliato. Uno presume una compensazione che non avviene.', '18/5 A pondera per durata oppure usa gli ingressi medi. Sette somma, 1/2 è semidifferenza e quattro copia B. Le due medie differiscono di 1/10 A.', '2/3 inverte il confronto; due segue solo Q e 4/3 copia le correnti. Un rapporto dei tempi uguale a uno darebbe I_B=6 A.', '36 mC usa D come ampere; quattro copia la corrente e tre la durata. La coincidenza numerica fra D e Q_C in mC non è una legge generale.', '25/2 mC omette b; due copia I e cinque copia lettura o durata. Venti mC sottrae b senza togliere il guadagno e predice D=9.', 'Le singole coppie sono esempi. Q non è libera a durata fissata; il tempo zero è escluso. Il vincolo fra totali non impone I(t) costante.']
ASSUMPTIONS=['Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.', 'Sezione fissata, carica netta positiva in mC e intervallo positivo in ms; corrente media concorde col trasferimento, senza constanza istantanea implicita. Medie di prove con uguale peso statistico distinte da ponderazione temporale. Caso 03 autonomo: corrente convenzionale continua uscente in filo rettilineo molto lungo, estremi/altri fili trascurati; B circolare antiorario. Display continuo e vincolo fra totali delle preparazioni.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge o caso autonomo spiegati prima del confronto con la chiave, senza estendere ipotesi di altri quesiti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa o angolo autonomo con dominio e orientazione espliciti.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-current-charge-time-09', 'AR-u6-current-charge-time-01', 'AR-u6-current-charge-time-03', 'AR-u6-current-charge-time-06', 'AR-u6-current-charge-time-14', 'AR-u6-current-charge-time-02', 'AR-u6-current-charge-time-08', 'AR-u6-current-charge-time-10', 'AR-u6-current-charge-time-05', 'AR-u6-current-charge-time-07', 'AR-u6-current-charge-time-12', 'AR-u6-current-charge-time-15', 'AR-u6-current-charge-time-13', 'AR-u6-current-charge-time-11', 'AR-u6-current-charge-time-04', 'AR-u6-current-charge-time-16'}
REVIEWED_CANDIDATES={'AR-u6-current-charge-time-01': '1d78c47a8274fa6e8ef2fcfd42a97a5c06087b53d185af67f9ff6d18a2b727a1', 'AR-u6-current-charge-time-02': 'd0f8d0b9f3d2eeb56cb27e95155596ca0e0698e0748014c5681c689457dd13e6', 'AR-u6-current-charge-time-03': 'c0560cead916703fc07623c37438faf58de1f5db9d9a66a5160bf5f81a02f023', 'AR-u6-current-charge-time-04': '6173b86cdd8d066534d5601b5ff657f1a99598da867f656a9fcdab4ba9c4c16e', 'AR-u6-current-charge-time-05': '5bef0e4d92aa3a1da97ede7b77c08b74a388db819d66cdecaac550adb32cdedd', 'AR-u6-current-charge-time-06': '885e5ce9bf836d3748be4defbac0fbaefb0eb228f230036163ce4d7ce57c3561', 'AR-u6-current-charge-time-07': 'c377c525bd66804aaf543def33385944f1e04e2160656361d205cbff78e58a55', 'AR-u6-current-charge-time-08': '1267f05b498b5877be624957eaaded37ae350e4ab45f145c24bd6eaf15ae89cb', 'AR-u6-current-charge-time-09': '0079a5254df1374353f061740bb04a75113891d45d1ad91b00cda164d5500562', 'AR-u6-current-charge-time-10': '3f9c1b759eb07dfa5e686218964f71a27c5b385b3d7d220b9b11ce6d65177d87', 'AR-u6-current-charge-time-11': 'ac80f2075280776c78d909e4bfa2102d719a9539aae1d6bb918cc2a381723d10', 'AR-u6-current-charge-time-12': 'def3bc32f4388f80c898ee068740c4772e42bf914f7cc5c197c7b77f8fe1bdcf', 'AR-u6-current-charge-time-13': '2848351f01f1cbbef645f533fba6d4c5cc5d9bb276ab587afea01d7aa0889442', 'AR-u6-current-charge-time-14': '5ad466692fbb31c613c98361a817e0e48ef8794d3b90db90cafa847c6f86d1a1', 'AR-u6-current-charge-time-15': '241b045726eda4f528e271238aeb792772bda01bced98948c475ae2d5fd989d8', 'AR-u6-current-charge-time-16': '3dda4c21e887b430585a4524afe45b4248b6a2d5203fc62909aee4626c69675e'}
REQUIRED_RECTS={(Fraction(100, 1), Fraction(150, 1), Fraction(440, 1), Fraction(70, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(640, 1), Fraction(1500, 1))}
REQUIRED_PATHS={'M32 445H608', 'M130 850L530 610', 'M420 1250A100 100 0 0 0 320 1150', 'M130 770H330V850M130 610H530V850', 'M32 1034H608', 'M320 1350A100 100 0 0 0 420 1250', 'M170 280H465', 'M220 1250A100 100 0 0 0 320 1350', 'M340 130V242', 'M320 1150A100 100 0 0 0 220 1250', 'M130 850L330 770L530 610', 'M130 850V572M130 850H565', 'M0 0L10 5L0 10Z'}
REQUIRED_CIRCLES={(Fraction(320, 1), Fraction(1250, 1), Fraction(5, 1)), (Fraction(320, 1), Fraction(1250, 1), Fraction(18, 1)), (Fraction(320, 1), Fraction(1250, 1), Fraction(100, 1)), (Fraction(530, 1), Fraction(610, 1), Fraction(5, 1)), (Fraction(330, 1), Fraction(770, 1), Fraction(5, 1))}
GEOMETRY_REVIEW='XML e rendering intero letti: sezione e freccia iniziali schematiche. Q(t) in mC: punti(0, 0), (1 ms, 2 mC), (2 ms, 6 mC), coordinate(130, 850), (330, 770), (530, 610), scale 200 unità/ms e 40 unità/mC. Pendenze 2/4A, secante 3A. Caso magnetico distinto: corrente uscente col punto, quattro archi da destra→alto→sinistra→basso→destra, tangenti antiorarie, nessuna lunghezza di freccia pretende moduloB.'
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
    for suffix in (' N/C',' nC',' mC',' ms',' mm²',' Ω',' V',' A',' m','°',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(charge,duration):
    charge,duration=map(Fraction,(charge,duration))
    if min(charge,duration)<=0:raise ValueError('Positive net charge and strictly positive interval required')
    return Fraction((SI.Quantity(charge,'millicoulomb')/SI.Quantity(duration,'millisecond')).to('ampere').magnitude)
def inverse_charge(current,duration):
    current,duration=map(Fraction,(current,duration))
    if min(current,duration)<=0:raise ValueError('Positive mean current and interval required')
    return Fraction((SI.Quantity(current,'ampere')*SI.Quantity(duration,'millisecond')).to('millicoulomb').magnitude)
def inverse_duration(current,charge):
    current,charge=map(Fraction,(current,charge))
    if min(current,charge)<=0:raise ValueError('Positive current and net charge required')
    return Fraction((SI.Quantity(charge,'millicoulomb')/SI.Quantity(current,'ampere')).to('millisecond').magnitude)
def scaled(charge,duration,a,b):
    a,b=map(Fraction,(a,b))
    if min(a,b)<=0:raise ValueError('Positive preparation factors required')
    return result(a*charge,b*duration)/result(charge,duration)
def magnetic_tangent(x,y,current):
    x,y,current=map(Fraction,(x,y,current))
    if current<=0 or x*x+y*y==0:raise ValueError('Positive outward current and point away from wire axis required')
    # z-current crossed with the radial vector: oriented tangent, not a calibrated magnitude.
    return -current*y,current*x
@lru_cache(maxsize=1)
def oracle():
    q,t,i=sp.symbols('q t i',positive=True)
    definition=sp.Eq(i,q/t)
    assert sp.solve(definition,q)==[i*t] and sp.solve(definition,t)==[q/i]
    first=sp.Rational(result(6,2));second=sp.Rational(result(12,3));assert (first,second)==(3,4)
    fit=calibrate(first,second,9,12,7,9,5,'ampere');assert fit==(3,1,4,2)
    assert result(9,sp.Rational(5,2))==sp.Rational(18,5)
    assert result(2,1)==2 and result(4,1)==4 and result(2+4,1+1)==3
    assert magnetic_tangent(1,0,1)==(0,1) and magnetic_tangent(0,1,1)==(-1,0)
    assert result(3,1)==result(6,2)==3
    return [first,'A','Linee circolari centrate sul filo, con verso antiorario','Da 3 a 1/2 A',inverse_charge(first,2),inverse_duration(first,6),scaled(6,2,1,sp.Rational(1,2)),6-first,'Q = I Δt','κ₁/κ₂',second/first,(first+second)/2,inverse_duration(sp.Rational(4,3)*first,12)/2,inverse_charge(fit[2],3),inverse_charge(fit[3],5),'Infinite coppie positive']
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
          "reviewDependencySha256":{"exact_arithmetic_literals.py":literal_dependency},"assetChecksums":assets,"ok":not errors,"errors":errors,"expectedExact":str(wanted),
          "dimension":{str(k):str(v) for k,v in SI.Unit(UNITS[number]).dimensionality.items()},
          "manualArithmetic":MANUAL[number-1],"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1],
          "pedagogicalReview":PEDAGOGY[number-1],"assetReview":geometry if assets else "not attached to this record",
          "verificationMode":"AI_CONCEPTUAL" if isinstance(wanted,str) else "EXACT_ORACLE",
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_cancellation_vector_norm_current_Ohm_resistivity_inverse_and_calibration",
            "Pint_exact_charge_time_current_field_resistivity_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
          "humanApproval":"NOT_RUN","publication":"DRAFT"})
    return records
def report(package,bindings,asset_root=None):
    return {"schemaVersion":"1.0.0","records":verify(package,bindings,asset_root),"verifierSha256":sha(Path(__file__).read_bytes()),
      "contractSha256":sha(Path(__file__).with_name("review_contract.py").read_bytes()),
      "reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())},
      "dependencyVersions":{"sympy":sp.__version__,"pint":pint.__version__,"hypothesis":hypothesis.__version__},
      "reviewer":"separate_AI_reviewer_not_candidate_author","humanApproval":"NOT_RUN","publication":"DRAFT",
      "reviewedCandidateCommit":CANDIDATE_REF,"packageSha256":digest(package),"bindingsSha256":digest(bindings),
      "source":{"commit":SOURCE_REF,"path":SOURCE_PATH,"title":FAMILY,"reference":SOURCE_REFERENCE},
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-circuits-200-204-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-02","U2-01")
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
