"""Independent source-first U6-03 laws; no candidate authoring imports.
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
SOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-03.json'
EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de'
def parse_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    try:return exact_numbers.exact_literal(raw.strip().replace('−','-'))
    except (SyntaxError,ZeroDivisionError,RecursionError) as error:raise ValueError('Invalid bounded exact literal') from error
SOURCE_ONLY_MODELS_SHA256='97ffd177a7f5ebfc5cd8acca1862f89db6ccbba5f543c47ea7b3b3da39d3f67f'
CANDIDATE_REF='7c71e095686a96dae449f7a4507c98bd651f45e8'
PRIMARY_SHA256='5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509'
FAMILY='current-divider'
BATCH='current-divider-212'
ASSET_NAME='current-divider-progressive.svg'
REVIEWED_PACKAGE_SHA256='c2f754f5d111cd7c6a8f510d8746f1f7f246d03f4d85ee8acd0c1634beb4721f'
REVIEWED_BINDINGS_SHA256='ee1356c9d88f1334551c674e1b30b8ce4e428029c47d4f49a1f136a3bfc127b5'
SOURCE_REFERENCE='Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.'
FALSE_PROOF='Con corrente totale imposta,la corrente di un ramo non cambia mai se cambia soltanto l’altro resistore.'
SVG_MUTATION=(b'width="180"', b'width="181"')
EXPECTED_MAPPING={1: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 2: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 3: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 4: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 5: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 6: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 7: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 8: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 9: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 10: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 11: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 12: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 13: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 14: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 15: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 16: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06'])}
NUMERIC_UNITS={1: 'mA', 5: 'Ω', 6: 'Ω', 14: 'Ω'}
OPTION_SUFFIX={7: '', 8: ' mA', 11: '', 12: ' mA', 13: '', 15: ' Ω'}
UNITS={1: 'milliampere', 2: 'ampere', 3: 'ampere', 4: 'ampere', 5: 'ohm', 6: 'ohm', 7: 'dimensionless', 8: 'milliampere', 9: 'ohm', 10: 'dimensionless', 11: 'dimensionless', 12: 'milliampere', 13: 'dimensionless', 14: 'ohm', 15: 'ohm', 16: 'dimensionless'}
MANUAL=['La tensione V è comune ai due rami: I₁=V/R₁, I₂=V/R₂ e I_tot=I₁+I₂. Eliminando V si ottiene I₁=I_tot R₂/(R₁+R₂). Con I_tot 12 mA e rami 2 Ω uguali, I₁6 mA. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La corrente di ramo ha dimensione A=C/s; mA è un’unità dimensionalmente compatibile e scala 10⁻³ A. Nessuna alternativa è stata ancora aperta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il rapporto I₁/I_tot=(1/R₁)/(1/R₁+1/R₂)=R₂/(R₁+R₂). Dunque I₁=(12 mA)R₂/(R₁+R₂), con 0<I₁<12 mA. Il numeratore contiene l’altro resistore perché la corrente segue la conduttanza del primo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 mA. B riduce R₁ a 1 Ω con R₂2 Ω e totale mantenuto 12 mA: I₁=12·2/3=8 mA. La tensione comune si adatta; non è imposta da una sorgente ideale di tensione fissa. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R₁=R₂[(12 mA)/I₁−1]. Con I₁6 mA e R₂2 Ω si ottiene 2 Ω. Il rapporto di correnti è adimensionale. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R₂=I₁R₁/(12 mA−I₁). Con I₁6 mA, R₁2 Ω, R₂=2 Ω. La condizione stretta 0<I₁<12 mA mantiene R₂ positivo e finito. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 mA; B con R₁2 Ω, R₂4 Ω dà 8 mA. Rapporto 4/3. R₂ più grande porta meno corrente nel secondo ramo e una quota maggiore nel primo, a corrente totale mantenuta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Proposta 12 mA meno corretta 6 mA dà+6 mA. Con entrambi i rami passivi finiti positivi una quota strettamente positiva attraversa anche R₂. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da I₁(R₁+R₂)=I_tot R₂ segue R₁=R₂(I_tot/I₁−1), dove I_tot 12 mA. Non si somma una corrente a una resistenza e il dominio è 0<I₁<I_tot. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'I₁, B/I₁, A=κ₂(R₁+R₂)/(κ₁R₁+κ₂R₂), perché il totale assegnato è identico nelle due prove. Un fattore comuneκ cancella e lascia la partizione invariata, pur cambiando la tensione richiesta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 6 mA; B con 3 e 1 Ω dà 12·1/4=3 mA. Rapporto 1/2, non il rapporto diretto delle resistenze del primo ramo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Media (6+3)/2=9/2 mA. Con ingressi medi 5/2 e 3/2 Ω la somma resta 4 Ω, quindi il modello dà qui 9/2 mA. Non è identità universale: (1, 1) Ω e(1, 3) Ω danno 6 e 9 mA, media 15/2 mA, mentre (1, 2) Ω darebbe 8 mA. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il bersaglio è 3 mA. Con R₁, B 3 Ω, l’inversa R₂=I₁R₁/(12 mA−I₁) dà R₂, B 1 Ω. Rapporto al riferimento 2 Ω uguale 1/2. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'I₁, A 6 mA e S 18 danno gain 3 per mA nella scala dichiarata. S 9 decodifica I₁, B 3 mA. Con R₂1 Ω si trova R₁3 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 6 mA→13 e 3 mA→7 danno a 2 per mA e b 1. S 17 decodifica I₁, C 8 mA. Con R₂2 Ω, R₁=2(12/8−1)=1 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R₁=R₂>0 divide sempre 12 mA in due quote da 6 mA. Infinite coppie continue con scala comune libera; la misura non determina le resistenze assolute né la tensione richiesta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['Dodici mA elimina il secondo ramo, 24 raddoppia, 2 copia Ω e 1/2 è quota pura non corrente. Sei per ramo conserva il totale 12 mA.', 'V, Ω, W misurano altre grandezze; uno è solo frazione di corrente. mA mantiene dimensione ampere con prefisso 10⁻³.', 'R₁ al numeratore dà I₂; inverso supera I_T; R₂/R₁ confronta rami ma non quota sul totale. I_TR₁R₂ ha AΩ².', 'Tre segue direttamente R₁, sei ignora, 12 azzera I₂, quattro è invece I₂ finale. La tensione adattata 8 mV dà 8 e 4 mA.', 'R₁4Ω dà 4 mA, 6Ω dà 3 mA; resistenza meno corrente non è un’operazione omogenea. Il rapporto deve usare la corrente dell’altro ramo.', 'R₂1Ω dà 4 mA, 4Ω dà 8 mA. Eccesso al denominatore darebbe 2/3Ω. I₁=I_T richiede l’altro ramo aperto, fuori dai due rami finiti.', '3/4 reciproco, due segue solo R₂, 1/2 ne inverte effetto. Uno sarebbe il diverso controllo V costante; qui V passa a 16 mV.', '−6 scambia ordine, 12 copia proposta, zero la accetta. Due è rapporto puro non differenza in mA.', 'Il più non è I₂; reciproco scambia le correnti. I₁/R₂ ha A/Ω e non Ω; R₂−I₁ non è omogeneo. Estremi 0 e 12 mA esclusi.', 'κ₁ scala il ramo errato al numeratore, prodotto omette il totale, reciproco inverte le prove, κ₂/κ₁ ignora la somma. Fattore comune conserva quote ma cambia V.', 'Due reciproco, 3/2 segue R₁ direttamente, 1/3 è I₁/I₂ nella sola B; uno ignora nuova divisione. B ha 3 e 9 mA.', 'Nove somma, 3/2 semidifferenza, 6 e 3 singole uscite. La coincidenza coi dati medi deriva dal totale 4Ω, non da conservazione al nodo applicata a medie statistiche.', 'Due reciproco, 1/3 rapporto interno resistenze B, 3/2 segue solo R₁. R₂ invariato dà 24/5 mA. Il bersaglio corretto assegna 3 e 9 mA.', '1/3Ω usa D come 9 mA; 1Ω dà D18, 9Ω dà 18/5. Il ramo 3Ω dà 3 mA e D9.', '14/17Ω omette offset e D18; 2Ω dà 13, 4Ω dà 9, 8Ω dà 29/5. Tensione non invariata fra riferimenti e prova C.', 'Coppie uguali singole sono esempi; zero non è passivo finito positivo. Scale continue libere ma rapporto uno obbligatorio; una misura di V aggiungerebbe scala.']
ASSUMPTIONS=['Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.', 'Due soli rami positivi finiti in parallelo, totale entrante 12 mA imposto e corrente di ogni ramo da A a B. La tensione comune si adatta e non è fissata fra preparazioni; temperatura e resistori ohmici. Inversa richiede 0<I₁<I_T. Le medie sono statistiche e S, S_B sono totali resistivi. Display continuo e scala comune libera nel 16.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-current-divider-08', 'AR-u6-current-divider-09', 'AR-u6-current-divider-16', 'AR-u6-current-divider-03', 'AR-u6-current-divider-02', 'AR-u6-current-divider-11', 'AR-u6-current-divider-12', 'AR-u6-current-divider-05', 'AR-u6-current-divider-13', 'AR-u6-current-divider-04', 'AR-u6-current-divider-14', 'AR-u6-current-divider-01', 'AR-u6-current-divider-15', 'AR-u6-current-divider-10', 'AR-u6-current-divider-06', 'AR-u6-current-divider-07'}
REVIEWED_CANDIDATES={'AR-u6-current-divider-01': 'f63214bd9fae01107ffebe0a87e0b1a50412cf5305b858617f079ab9be7eaa0e', 'AR-u6-current-divider-02': '87917d0a94ac2e42b9b1384b63a70a69700a67863c6ae6bcf6e8fd2ad837b77a', 'AR-u6-current-divider-03': '636fc9ce550bcfc33fe69d17555c4c95719da0960b2dc89d6f2e3c879f855cb0', 'AR-u6-current-divider-04': '3d0fb5cba8607e59e86b65c703f55957b41d82dbc10def2a3ebc376fd8f39a38', 'AR-u6-current-divider-05': '7441f5f8a1e0e91a0a6f66b8d08e980a8debe5e538997145fad9dd578a3c58a5', 'AR-u6-current-divider-06': 'ac29d0ef8f73a80d8fd3195cf797b90f8fb1c0cbaa348f70db763eb84e03ed69', 'AR-u6-current-divider-07': 'fdcbd0103d73cc4b44b1c7dab01deac36cf698bc8e655e8f937ddf336b0a0d38', 'AR-u6-current-divider-08': '24ba67fb8a08d372967b5ea95bd9bc78e5a97bd0115fd4832709868f5cfc9d21', 'AR-u6-current-divider-09': 'bc8fdce92a1815597d877d4d1c870c28e8f098afa378c93234211774182f32f6', 'AR-u6-current-divider-10': 'bf2c17069328dbfe30989ed0edbe2db2a4137995ac8e30b87f696e3aa84e747a', 'AR-u6-current-divider-11': '6f7ad02876a7ebc772465575a48e4fe513941732322d46ce9049ac0d761d3234', 'AR-u6-current-divider-12': '7167b42c8615b9daf3dec7f3773bb30078767e9d614a7ff1b147580eb7a2fd01', 'AR-u6-current-divider-13': '84be330221edff0336a7d6f8d57a978ca1246aa09104689d8d6a3cf77ed63149', 'AR-u6-current-divider-14': 'baa2e3a72546a3723840fc793503e5fe59183709eee31fdb462e94c54bf26f81', 'AR-u6-current-divider-15': 'aa8752faabeb7647b33bcbe2cc7a53fd956590373284b828abea11ae0ebc7caf', 'AR-u6-current-divider-16': 'd93c90b9746d7dea15061adcc11bfdacf27e7be5d487c9215138b1a14685af7b'}
REQUIRED_RECTS={(Fraction(150, 1), Fraction(1205, 1), Fraction(120, 1), Fraction(34, 1)), (Fraction(300, 1), Fraction(145, 1), Fraction(100, 1), Fraction(30, 1)), (Fraction(300, 1), Fraction(325, 1), Fraction(100, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(650, 1), Fraction(180, 1), Fraction(40, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(680, 1), Fraction(1580, 1)), (Fraction(330, 1), Fraction(650, 1), Fraction(180, 1), Fraction(40, 1)), (Fraction(150, 1), Fraction(1305, 1), Fraction(180, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1105, 1), Fraction(240, 1), Fraction(34, 1)), (Fraction(390, 1), Fraction(750, 1), Fraction(120, 1), Fraction(40, 1)), (Fraction(150, 1), Fraction(750, 1), Fraction(240, 1), Fraction(40, 1))}
REQUIRED_PATHS={'M90 250H160V160H520V340H160V250M520 250H600'}
REQUIRED_CIRCLES={(Fraction(160, 1), Fraction(250, 1), Fraction(6, 1)), (Fraction(520, 1), Fraction(250, 1), Fraction(6, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(1080, 1), Fraction(150, 1), Fraction(1380, 1)), (Fraction(150, 1), Fraction(820, 1), Fraction(545, 1), Fraction(820, 1)), (Fraction(150, 1), Fraction(1380, 1), Fraction(440, 1), Fraction(1380, 1))}
GEOMETRY_REVIEW='Due soli rami tra nodi A/B, simboli uguali 2Ω e totale 12 mA dichiarato, nessuna sorgente di tensione fissata nel disegno. Barre centrali quote 6+6 e 8+4 mA con lunghezze 180+180 e 240+120, scala 30 unità/mA; somme 360. Ultime I₁6/3/9/2 mA lunghezze 240/120/180, scala 40 unità/mA distinta. B finale distinto dalla modifica centrale.'
DECIMAL_REGRESSION_NUMBER=8

@lru_cache(maxsize=1)
def source_records():
    return {r["id"]:r for r in json.loads(git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,SOURCE_PATH))}
def _finite_exact(value):
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
    first,second,reference_reading,new_reading,reading_a,reading_b,third_reading=map(
        _rational_exact,(first,second,reference_reading,new_reading,reading_a,reading_b,third_reading))
    if first<=0 or second<=0 or first==second:
        raise ValueError('Two distinct positive finite physical calibration references required')
    if not isinstance(unit,str) or not unit:
        raise ValueError('Explicit physical unit required for calibration')
    gain=sp.Rational(reference_reading)/first
    affine_gain=sp.Rational(reading_b-reading_a)/(second-first)
    if gain<=0 or affine_gain<=0:
        raise ValueError('Positive finite proportional and affine calibration gains required')
    offset=sp.cancel(reading_a-affine_gain*first)
    decoded=sp.cancel(sp.Rational(new_reading)/gain)
    third=sp.cancel((third_reading-offset)/affine_gain)
    if decoded<=0 or third<=0:
        raise ValueError('Decoded physical calibration values must be strictly positive')
    physical=(SI.Quantity(reference_reading,'')/SI.Quantity(first,unit)).to('1/('+unit+')')
    if sp.simplify(sp.Rational(physical.magnitude)-gain)!=0:
        raise ValueError('Independent calibration dimensions inconsistent')
    return gain,offset,decoded,third
def parse_option(number,option):
    if type(number) is not int or not 1<=number<=16 or not isinstance(option,str):raise ValueError('Reviewed option number and exact string required')
    suffix=OPTION_SUFFIX.get(number,"")
    if suffix and not option.endswith(suffix):raise ValueError("Required literal physical unit absent")
    return parse_literal(option.removesuffix(suffix) if suffix else option)

def alternative_identity(option):
    if not isinstance(option,str):raise ValueError('Exact option string required')
    for suffix in (' mA',' W',' J',' s',' Ω',' V',' A',''):
        if suffix and not option.endswith(suffix):continue
        try:return suffix,parse_literal(option.removesuffix(suffix) if suffix else option)
        except ValueError:continue
    return None

def result(first,second):
    first,second=map(_rational_exact,(first,second))
    if min(first,second)<=0:raise ValueError('Two positive parallel resistances required')
    return Fraction((SI.Quantity(12,'milliampere')*second/(first+second)).to('milliampere').magnitude)
def inverse_first(current,second):
    current,second=map(_rational_exact,(current,second))
    if not 0<current<12 or second<=0:raise ValueError('Branch current strictly between zero and total,positive known resistance required')
    return second*(12-current)/current
def inverse_second(current,first):
    current,first=map(_rational_exact,(current,first))
    if not 0<current<12 or first<=0:raise ValueError('Branch current strictly between zero and total,positive known resistance required')
    return current*first/(12-current)
def scaled(first,second,a,b):
    first,second,a,b=map(_rational_exact,(first,second,a,b))
    if min(first,second,a,b)<=0:raise ValueError('Positive preparation factors and resistances required')
    return result(a*first,b*second)/result(first,second)
def constrained_value(resistance):
    resistance=_rational_exact(resistance)
    if resistance<=0:raise ValueError('Positive common resistance required')
    return result(resistance,resistance)

@lru_cache(maxsize=1)
def oracle():
    a,b,it,v,i=sp.symbols('a b I_T V I1',positive=True)
    common=sp.solve(sp.Eq(it,v/a+v/b),v)[0]
    assert sp.cancel(common/a-it*b/(a+b))==0
    _solutions=sp.solve(sp.Eq(i,it*b/(a+b)),a)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(b*(it-i)/i))==0
    _solutions=sp.solve(sp.Eq(i,it*b/(a+b)),b)
    assert len(_solutions)==1 and sp.simplify(_solutions[0]-(a*i/(it-i)))==0
    first=sp.Rational(result(2,2));second=sp.Rational(result(3,1));assert (first,second)==(6,3)
    fit=calibrate(first,second,18,9,13,7,17,'milliampere');assert fit==(3,1,3,8)
    assert result(1,2)==8 and result(2,4)==8
    assert result(Fraction(5,2),Fraction(3,2))==Fraction(9,2)
    assert (result(1,1)+result(1,3))/2==Fraction(15,2) and result(1,2)==8
    assert constrained_value(1)==constrained_value(3)==6
    return [first,'mA','I₁ = I_T R₂ / (R₁ + R₂)','Da 6 a 8 mA',inverse_first(first,2),inverse_second(first,2),scaled(2,2,1,2),12-first,'R₁ = R₂ (I_T − I₁) / I₁','κ₂ S / S_B',second/first,(first+second)/2,inverse_second(first/2,3)/2,inverse_first(fit[2],1),inverse_first(fit[3],2),'Infinite coppie positive con R₁ = R₂']
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    rects={tuple(Fraction(e.get(k,'0')) for k in ('x','y','width','height')) for e in root.iter() if e.tag.endswith('rect')}
    paths={e.get('d') for e in root.iter() if e.tag.endswith('path')}
    circles={tuple(Fraction(e.get(k,'0')) for k in ('cx','cy','r')) for e in root.iter() if e.tag.endswith('circle')}
    lines={tuple(Fraction(e.get(k,'0')) for k in ('x1','y1','x2','y2')) for e in root.iter() if e.tag.endswith('line')}
    if lines!=REQUIRED_LINES:raise ValueError('Independent physical scale or axis geometry changed')
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
          "methods":["source_prompt_only_primary_before_candidate_keys","SymPy_independent_node_current_series_voltage_Joule_energy_integer_counts_inverse_and_calibration",
            "Pint_exact_resistance_current_voltage_power_energy_SI_dimensions_and_Fraction_arithmetic","separate_individual_manual_physical_distractor_pedagogical_and_full_SVG_reading"],
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
      "primaryBeforeCandidateKeys":{"path":"editorial/reviews/u6-circuit-power-210-214-primary-source-only.md","sha256":PRIMARY_SHA256}}
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
    links[0]["provenance"]["sourcePath"]=SOURCE_PATH.replace("U6-03","U2-01")
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
