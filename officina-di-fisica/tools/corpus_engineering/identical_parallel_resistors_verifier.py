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
CANDIDATE_REF='751185c3791519a1d0402574f0e247625d542461'
PRIMARY_SHA256='5a11a0eae02cb2aaf503d979af679d9a586f1dc8572134ca7523f895ca07e509'
FAMILY='identical-parallel-resistors'
BATCH='identical-parallel-resistors-210'
ASSET_NAME='identical-parallel-resistors-progressive.svg'
REVIEWED_PACKAGE_SHA256='1ec3cdc4ac4c1cfc9204b97238c99613b009d30c7031b0edfd72a45b75504a60'
REVIEWED_BINDINGS_SHA256='ffa0e05dca7d1361e59465bb4d9217fab99bf1154d26b92383cb6c0f0202a5c6'
SOURCE_REFERENCE='Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.'
FALSE_PROOF='Tre resistori identici fra gli stessi due nodi hanno equivalente3r.'
SVG_MUTATION=(b'width="80"', b'width="81"')
EXPECTED_MAPPING={1: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 2: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 3: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 4: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 5: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 6: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 7: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 8: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 9: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 10: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 11: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 12: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 13: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 14: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 15: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06']), 16: ('C4-L06', ['C1-L001', 'C4-L01', 'C4-L03', 'C4-L05', 'C4-L06'])}
NUMERIC_UNITS={1: 'Ω', 5: 'Ω', 6: '1', 14: 'Ω'}
OPTION_SUFFIX={7: '', 8: ' Ω', 11: '', 12: ' Ω', 13: '', 15: ' Ω'}
UNITS={1: 'ohm', 2: 'ohm', 3: 'ohm', 4: 'ohm', 5: 'ohm', 6: 'dimensionless', 7: 'dimensionless', 8: 'ohm', 9: 'ohm', 10: 'dimensionless', 11: 'dimensionless', 12: 'ohm', 13: 'dimensionless', 14: 'ohm', 15: 'ohm', 16: 'dimensionless'}
MANUAL=['Alla medesima tensione V, ogni ramo porta V/r. Kirchhoff dà I=N V/r e quindi R=V/I=r/N. Con 12 Ω e 3 rami, R=4 Ω. Il generatore è soltanto una sonda ideale della relazione equivalente; N è intero positivo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'La resistenza equivalente ha unità Ω=V/A. Il conteggio N è puro e non cambia la dimensione di r/N; nessuna opzione o stringa di risposta è stata letta. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Sommo le conduttanze: 1/R=N/r; invertendo con r>0 e N∈N⁺ si ottiene R=r/N. R=r per N 1 e R diminuisce quando si aggiungono rami identici in parallelo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A dà 12/3=4 Ω. B dimezza r a 6 Ω senza cambiare i 3 rami: R_B=6/3=2 Ω. Dipendenza lineare da r e non quadratica. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Inversa r=NR. Con R 4 Ω e N 3 si ha r=12 Ω, reinserimento 12/3=4 Ω. Unità di resistenza conservata. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Inversa N=r/R=12/4=3, numero puro intero positivo. Un dato r/R non intero non rappresenterebbe un numero ammissibile di resistori nel modello. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 4 Ω; B con un solo ramo da 12 Ω dà 12 Ω. Rapporto R_B/R_A=3: togliere rami aumenta l’equivalente. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il valore corretto è 4 Ω. Proposta 8 Ω meno corretto 4 Ω dà+4 Ω. Il rapporto due non è lo scarto richiesto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Da R=r/N segue r=NR. N non porta unità, mentre R e r portano ohm. L’inversa è unica quando N intero positivo è noto. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'R_B/R_A=(κ₁r/(κ₂N))/(r/N)=κ₁/κ₂. κ₂ può essere razionale soltanto se κ₂N resta un conteggio intero positivo; non si estende il dominio a una frazione di ramo. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'A 12/3=4 Ω; B 15/5=3 Ω. Rapporto 3/4. I fattori sonoκ₁5/4 eκ₂5/3, il loro quoziente è 3/4. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Uguale peso statistico: (4+3)/2=7/2 Ω. Gli ingressi medi r=27/2 Ω, N 4 sono qui fisicamente ammissibili ma danno 27/8 Ω, diverso da 28/8 Ω. Mediare prima gli ingressi cambia il compito. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Bersaglio R_B=(3/4)4=3 Ω. Con r_B 15 Ω occorre N_B=15/3=5; rapporto N_B/N_A=5/3. Entrambi i conteggi sono interi. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimento R_A 4 Ω e S 12 dà a_cal 3 per ohm nella scala strumentale. S 9 decodifica R_B 3 Ω. N_B 5 impone r_B 15 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Riferimenti 4 Ω→9 e 3 Ω→7: a=(9−7)/(4−3)=2 per ohm, b=1. S_C 5 decodifica R_C=(5−1)/2=2 Ω. N_C 3 dà r_C 6 Ω. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.', 'Il vincolo dimensionato r=(4 Ω)N rende R 4 Ω per ogni N intero positivo. Infinite coppie discrete numerabili (4 N Ω, N), non un continuo di conteggi e non due parametri indipendenti. La misura è ridondante. Dati e condizioni finali ricalcolati dopo la lettura completa della candidata; la stringa di scelta è stata controllata soltanto dopo questa derivazione.']
DISTRACTORS=['36 Ω è la serie, 12 Ω un solo ramo.1/4 Ω copia il reciproco numerico; il reciproco fisico di 4 Ω è 1/4 S. Due Ω richiederebbero 6 rami.', 'Uno misura il conteggio e non la resistenza; S è conduttanza, A corrente, V tensione. N puro non cancella gli ohm di r.', 'Nr è serie, N/r conduttanza. r+N somma grandezze diverse; r/N² applica due volte la crescita di percorsi invece di una.', 'Otto inverte l’effetto di r, quattro ignora la modifica, sei copia il ramo e uno dimezza due volte.', '4/3 Ω ricompone 4/9 Ω; 4 Ω come ramo ricompone 4/3 Ω; 36 Ω darebbero 12 Ω. Solo 12/3 dà 4 Ω.', '1/3 non è conteggio intero; 48 moltiplica, 12 copia r, zero esclude tutti i percorsi. N=r/R deve risultare intero, senza arrotondare.', '1/3 confronta i conteggi direttamente invece dell’inverso; uno ignora la rimozione. Nove e 1/9 inventano un quadrato.', '−4 Ω scambia l’ordine, 8 Ω copia la proposta, zero la accetta. Due è rapporto puro e non differenza.', 'R/N divide ancora, N/R ha unità S, R−N non è omogeneo, N²R introduce un ulteriore fattore di conteggio.', 'Il prodotto rende diretto N, il reciproco inverte B/A; i quadrati non nascono dalla legge. Entrambi i conteggi devono essere interi.', '4/3 è reciproco; 5/4 segue solo r, 3/5 solo l’inverso di N.25/12 moltiplica 5/4 per 5/3 invece di dividerli.', '27/8 Ω usa gli ingressi medi, qui ammissibili; 7 Ω somma, 1/2 Ω è semidifferenza, 3 Ω ripete B. La differenza delle due medie è 1/8 Ω.', '3/5 reciproco, 3/4 copia il bersaglio, 5/4 segue r. Cinque è il conteggio nuovo senza dividerlo per tre: il rapporto di conteggi può essere frazionario.', '45 Ω usa D come R; 3 Ω copia R anziché r; 3/5 Ω divide per N anziché moltiplicare.12 Ω ripete il riferimento.', '15/2 Ω omette b e restituisce D6; 2 Ω copia equivalente; 15 Ω predice 11 e 3 Ω predice 3. Il reinserimento del ramo 6 Ω in tre percorsi restituisce D5.', 'Le coppie singole sono esempi; nessuna è falsa perché esistono esempi espliciti. N non è continuo e r non è libero indipendentemente da N.']
ASSUMPTIONS=['Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.', 'Rami ohmici identici finiti positivi fra la stessa coppia di nodi, fili ideali e temperatura mantenuta. N intero positivo anche dopo ogni scalatura; κ₂ può essere razionale se κ₂N è intero. R è coefficiente di V_AB=RI_T, definito anche come limite a tensione nulla, senza attribuire un rapporto 0/0 misurabile. Medie statistiche e display continui. Vincolo 16 lascia infinite coppie discrete numerabili.']
PEDAGOGY=['Legge motivata con ipotesi e unità prima della risposta, distinguendo grandezza fisica e numero.', 'Dimensione e unità determinate indipendentemente, poi opzioni finali lette.', 'Legge riconosciuta nel contesto esplicito e motivata per Ohm o nodi; compito guidato, non prova di richiamo senza aiuti.', 'Confronto controllato con parametro fissato e risultato esatto anche se radicale.', 'Prima inversa derivata e reinserita nella legge diretta.', 'Seconda inversa con unità e divisioni lecite; conteggio intero nel caso210.', 'Due configurazioni ricostruite prima del rapporto adimensionale.', 'Ordine della differenza mantenuto e distinto dal rapporto.', 'Inversa simbolica con controllo delle unità e delle divisioni lecite.', 'Fattori inseriti nelle posizioni effettive della legge prima della semplificazione.', 'Entrambi gli ingressi nuovi usati prima del confronto.', 'Media delle uscite distinta da legge ai dati medi e dalla ponderazione temporale.', 'Bersaglio ricostruito prima dell’inversa, valore distinto dal rapporto richiesto.', 'Guadagno strumentale rimosso prima dell’inversa fisica.', 'Offset e guadagno identificati da due riferimenti, poi applicati all’incognita.', 'Vincolo fra preparazioni sostituito prima di decidere unicità o scala libera.']
EXPECTED_IDS={'AR-u6-identical-parallel-resistors-05', 'AR-u6-identical-parallel-resistors-02', 'AR-u6-identical-parallel-resistors-10', 'AR-u6-identical-parallel-resistors-03', 'AR-u6-identical-parallel-resistors-07', 'AR-u6-identical-parallel-resistors-04', 'AR-u6-identical-parallel-resistors-13', 'AR-u6-identical-parallel-resistors-14', 'AR-u6-identical-parallel-resistors-08', 'AR-u6-identical-parallel-resistors-15', 'AR-u6-identical-parallel-resistors-16', 'AR-u6-identical-parallel-resistors-06', 'AR-u6-identical-parallel-resistors-11', 'AR-u6-identical-parallel-resistors-01', 'AR-u6-identical-parallel-resistors-12', 'AR-u6-identical-parallel-resistors-09'}
REVIEWED_CANDIDATES={'AR-u6-identical-parallel-resistors-01': '3d583db55265a293c2cb4788b44ba132e9ca756bea47fe434de1f4ad098658a4', 'AR-u6-identical-parallel-resistors-02': '96a0eb5fd132c4cfb528ce2faf8586169d2950e9eb0de24edf8a75228bbc5a37', 'AR-u6-identical-parallel-resistors-03': '1d1e1059f897c09cffea8769ec4e276e668f0d7a5cad7f8b640097c80fb3efee', 'AR-u6-identical-parallel-resistors-04': 'ce5b69aef601585bfb1b6a99d8491ce8c4b1468ca2a090bff6a231f6b2ea061c', 'AR-u6-identical-parallel-resistors-05': 'a67e609a5ee9ca993624294a7559bf1d201146234b30188ca0f485b45131bbf7', 'AR-u6-identical-parallel-resistors-06': 'c7a778c2ca645730470fb776b458812f99d560bda56a8703808100282f8ef5ae', 'AR-u6-identical-parallel-resistors-07': '930784635a2a78f99f90914d892f2832460312fb73c0f4cdb05975f4dae4f6d8', 'AR-u6-identical-parallel-resistors-08': '25bc18a995f02be68676e320225df78e2d4f52d0d5c5636e40ecf374d7b3279b', 'AR-u6-identical-parallel-resistors-09': '24382788a5c58223651474400af1241029bb51bb04361deec089a4526b9d6f5b', 'AR-u6-identical-parallel-resistors-10': 'b37b0d0b12446db88f5d2a48615fd2bbdf03752444966666f3d2bbc95afd5f3b', 'AR-u6-identical-parallel-resistors-11': '5498d88d89c4c27d347af4c795bd1ab3b7f2bfd9746aecda3dcf819b0cb8e9f6', 'AR-u6-identical-parallel-resistors-12': 'ee7bbe2ff71cfb0054b2fdd26fde68621aa6312a30649a0fed44e0d149355ec1', 'AR-u6-identical-parallel-resistors-13': '50491254c3c037cf1e9bea04e116bd75735d556d5456daec38492efbc66b177c', 'AR-u6-identical-parallel-resistors-14': '2643eb80f1d3d77952c38001b23bbb458bb9998c61caa8f5b972481f6efa85d9', 'AR-u6-identical-parallel-resistors-15': '437e24c52f53e568fe7a86ef4c2028d20010df8ac17cffc8281557bfa3967cd9', 'AR-u6-identical-parallel-resistors-16': '243cf9b5f9366b7505f4fc47c7583a5de7377415119a84b86d1dfe835cddb3c7'}
REQUIRED_RECTS={(Fraction(300, 1), Fraction(145, 1), Fraction(100, 1), Fraction(30, 1)), (Fraction(300, 1), Fraction(325, 1), Fraction(100, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(620, 1), Fraction(80, 1), Fraction(38, 1)), (Fraction(0, 1), Fraction(0, 1), Fraction(680, 1), Fraction(1500, 1)), (Fraction(150, 1), Fraction(1140, 1), Fraction(120, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(710, 1), Fraction(240, 1), Fraction(38, 1)), (Fraction(300, 1), Fraction(235, 1), Fraction(100, 1), Fraction(30, 1)), (Fraction(150, 1), Fraction(1040, 1), Fraction(160, 1), Fraction(34, 1)), (Fraction(150, 1), Fraction(1240, 1), Fraction(140, 1), Fraction(34, 1))}
REQUIRED_PATHS={'M90 250H160V160H520V340H160V250M520 250H600M160 250H300M400 250H520'}
REQUIRED_CIRCLES={(Fraction(160, 1), Fraction(250, 1), Fraction(6, 1)), (Fraction(520, 1), Fraction(250, 1), Fraction(6, 1))}
REQUIRED_LINES={(Fraction(150, 1), Fraction(790, 1), Fraction(430, 1), Fraction(790, 1)), (Fraction(150, 1), Fraction(1020, 1), Fraction(150, 1), Fraction(1310, 1)), (Fraction(150, 1), Fraction(595, 1), Fraction(150, 1), Fraction(790, 1)), (Fraction(150, 1), Fraction(1310, 1), Fraction(390, 1), Fraction(1310, 1))}
GEOMETRY_REVIEW='Rete con tre percorsi distinti fra A e B, ognuno con simbolo 12Ω schematico. Barre centrali R4/12Ω lunghe 80/240 da x 150, scala 20 unità/Ω. Barre finali R4/3/7/2Ω lunghe 160/120/140, scala 40 unità/Ω distinta dalla precedente. Conteggi e origini coerenti; nessun simbolo resistivo pretende scala di valore.'
DECIMAL_REGRESSION_NUMBER=7

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

def _count(value):
    value=_rational_exact(value)
    if value<=0 or value.denominator!=1:raise ValueError('Positive integer count required')
    return value.numerator
def result(branch,count):
    branch=_rational_exact(branch);count=_count(count)
    if branch<=0:raise ValueError('Positive passive branch resistance required')
    return Fraction((SI.Quantity(branch,'ohm')/count).to('ohm').magnitude)
def inverse_branch(total,count):
    total=_rational_exact(total);count=_count(count)
    if total<=0:raise ValueError('Positive equivalent resistance required')
    return total*count
def inverse_count(total,branch):
    total,branch=map(_rational_exact,(total,branch))
    if min(total,branch)<=0:raise ValueError('Positive equivalent and branch resistance required')
    return _count(branch/total)
def scaled(branch,count,a,b):
    branch,a,b=map(_rational_exact,(branch,a,b));count=_count(count)
    if min(branch,a,b)<=0:raise ValueError('Positive passive preparation factors required')
    final_count=_count(b*count)
    return result(a*branch,final_count)/result(branch,count)
def constrained_value(count):
    count=_count(count)
    return result(4*count,count)

@lru_cache(maxsize=1)
def oracle():
    r,n,total=sp.symbols('r n R',positive=True)
    assert sp.solve(sp.Eq(total,r/n),r)==[n*total]
    assert sp.solve(sp.Eq(total,r/n),n)==[r/total]
    first=sp.Rational(result(12,3));second=sp.Rational(result(15,5));assert (first,second)==(4,3)
    fit=calibrate(first,second,12,9,9,7,5,'ohm');assert fit==(3,1,3,2)
    assert result(Fraction(27,2),4)==Fraction(27,8)
    assert constrained_value(1)==constrained_value(3)==4
    return [first,'Ω','R = r / N','Da 4 a 2 Ω',inverse_branch(first,3),inverse_count(first,12),scaled(12,3,1,Fraction(1,3)),8-first,'r = N R','κ₁/κ₂',second/first,(first+second)/2,Fraction(inverse_count(3,15),3),inverse_branch(fit[2],5),inverse_branch(fit[3],3),'Infinite coppie, con N intero positivo e r = (4 Ω) N']
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
