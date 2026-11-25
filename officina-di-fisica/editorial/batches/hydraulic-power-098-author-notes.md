# Note d’autore — hydraulic-power-098

Letti individualmente i 16 originali U3-03 alla fonte 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605. Rilette C2-L005 per Q e C2-L006 per energie per volume, ipotesi e lavoro delle macchine. Primaria C2-L006, prerequisiti C2-L001/L005/L006, riuso C6; assembler unico course C2, unit u3, source_path U3-03.

Pompa ideale, liquido incomprimibile, stazionario; fra le sezioni non cambiano quota ed energia cinetica per massa. Δp = p_uscita − p_ingresso > 0, con stessa convenzione per entrambe le pressioni, Q > 0. P è il trasferimento meccanico positivo al fluido, uguale alla potenza meccanica fornita alla macchina ideale, non una potenza elettrica implicita. Nessuna dissipazione nella pompa; eventuale carico esterno non è parte del tratto della macchina. Il lavoro che la pompa deve fornire compensa il maggiore flusso uscente di energia di pressione; non si attribuisce alle sole trazioni di pressione un lavoro positivo netto sul fluido quando p_uscita > p_ingresso.

01: 1 kPa·L = 1000 Pa·0,001 m³ = 1 J; 2 kPa per 3 L/s dà 6 W. 02: Pa·m³/s = J/s = W. 03: lavoro fornito ΔE = ΔpΔV, divisione per Δt e Q = ΔV/Δt danno P = ΔpQ. Per un rendimento minore di uno, la potenza assorbita sarebbe diversa; qui il modello è ideale. 04: salto 2→4 kPa a Q = 3 L/s dà potenze 6→12 W.

05: Δp = P/Q = 6/3 = 2 J/L = 2 kPa, differenza e non pressione assoluta di uscita senza dato di ingresso. 06: Q = P/Δp = 6/2 = 3 L/s. 07: a Δp = 2 kPa, Q da 3 a 5 L/s dà P da 6 a 10 W, rapporto 5/3; incremento relativo 2/3. 08: proposta 12 meno corretto 6 = +6 W; la proposta richiederebbe Δp = 4 kPa a Q = 3 L/s.

09: Δp = P/Q, dimensione energia per volume e verso uscita meno ingresso. 10: fattori diretti κ₁κ₂, nessun quadrato o somma. 11: stati (2 kPa,3 L/s) e (4 kPa,5 L/s) danno 6 e 20 W, rapporto 10/3. 12: media statistica (6+20)/2 = 13 W, distinta dal prodotto degli ingressi medi 3·4 = 12 W; differenza esatta 1 W. La prova non introduce pesi temporali diversi.

13: target (10/3)·6 = 20 W con Δp_B = 4 kPa richiede Q_B = 5 L/s; rapporto 5/3. 14: q = 3 W⁻¹, lettura 60 dà P_B = 20 W e Δp_B = 4 kPa per Q_B = 5. 15: riferimenti 6 e 20 W con letture 13 e 41 danno q = 2 W⁻¹, b = 1. Lettura 25 dà P_C = 12 W e Δp_C = 4 kPa per Q_C = 3 L/s. Salti alternativi 2,5,3,8 kPa darebbero letture 13,31,19,49.

16: Δp = cQ fra prove, c = (2/3) kPa·s/L, dimensione di resistenza idraulica. P = cQ² = 6 W porta a Q² = 9 L²/s². Ramo ammesso Q = 3 L/s e Δp = 2 kPa; ramo negativo viola entrambi i segni assegnati. Il vincolo non diventa una legge temporale durante la singola prova.

SVG 01/03: pressioni assolute 100 e 102 kPa, salto 2 kPa; frecce uguali per Q = 3 L/s, lunghe 120 px a 40 px/(L/s). Schema pompa non geometrico. Sei celle da 1 J larghe 30 px rappresentano 6 J ricevuti da 3 L nell’intervallo esplicito di 1 s, quindi 6 W. Grafico P(Q) a Δp = 2 kPa: origine (100,1470), scala orizzontale 50 px/(L/s), verticale 25 px/W. Punti A (250,1320) per (3,6), B (350,1220) per (5,10); linea da Q = 0 a 6 L/s come relazione limite illustrata. XML e rendering completo letti; nessuna sovrapposizione osservata.

Assembly e binding riprodotti identici. Import canonico ROOT su SQLite temporaneo: 16 DRAFT, poi 0 nuove e 16 invariate; 991 pubblicati e storico invariati, SHA256 pubblicati 99c8d805004c82ba63a19f7ad8c0825666ca813d4f15471b8df4db5657b7c9ee. Pacchetto SHA256 cb15df122e6cf27e76cc7f23f0e81520ecee67f74d1c44b866a33317f8d776c5. Anteprima tecnica del worktree autore: 48 casi a 1440/768/320 px senza failure, separata dal protocollo finale dell’integratore. Nessuna propria firma scientifica: independentReview NOT_RUN, human NOT_RUN, publication NONE.
