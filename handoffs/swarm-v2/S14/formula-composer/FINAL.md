# S14 Formula — consegna finale della candidata, 26 ottobre 2026

Stessa PR318, ancora DRAFT: https://github.com/AndreaMarro/ardesia/pull/318.
Implementato e verificato localmente; raccordo Room e integrazione finale S00
ancora necessari. Nessun merge, deploy o approvazione scientifica da questa chat.

Il composer riusa MathLive0.111.1 MIT già acquisito: selezione, strutture native,
placeholder, history e tastiera. React gestisce richiesta singola, pending,
errore/retry con bozza conservata e feedback clipboard. I template completano
prima la composizione LaTeX. Il cleanup chiude il controller pubblico condiviso
prima del distacco DOM. Pannello mobile contenuto, sopra il canvas e opaco anche
in hover. Nessuna dipendenza o modifica MathJax/font/Vite/lock/layer condivisi.

## Prove e fonte esatta

| Prova | Fonte | Esito e limiti |
| --- | --- | --- |
| Host, tre file mirati | 38d5540, componente21c8462 | 16 PASS,13.11s; mock del confine nativo, non donor runtime |
| Consumer Room v3 da copie | main992d1a0b + patch v3 | 4 RED control →4 PASS/95skip; sorgente Room mai applicata |
| Native funzionale completo | 23604bc + Roomv3 da copia | 15 PASS/EXIT0, zero errori inattesi; export/import e reload reali; limiti visuali/tastiera trovati dopo e corretti separatamente |
| Native finale touch390×844 | 1e086d93c163a53edc32249188e629f8ad615506 + Roomv3 da copia | 4 PASS/EXIT0, zero errori inattesi; hover opaco, bounds, hit-test, keyboard DOM, chiusura fisica e remount |

La prova completa usa SVG MathJax reale, inserimento Excalidraw, normale
navigazione Continuità per flush canvas+journal, reload, isolamento lezioniA/B
ed export .lesson/import in un nuovo contesto/store. Non inietta journal.
Il salvataggio della sola board non prova durabilità del journal; reload prima
del flush completo rimane fuori dal percorso dimostrato. Native finale è una
controprova proporzionata ai delta CSS/lifecycle, non un nuovo round-trip intero.

CI della head finale deve essere letta separatamente: nessun verde trasferito
tra SHA o dalla CI al merge tree. d269cb8 aveva tutti i workflow SUCCESS;
le successive correzioni e la consegna richiedono i propri check. Il nuovo
commit di sola documentazione/evidenze conserva gli hash prodotto dell'inventario.

## Raccordo e memoria

Usare soltanto room-insert-math-v3.patch. S00 ha mantenuto esplicitamente il
raccordo nella stessa318 dopo311; nessun grant Room dedotto dai test di copie.
Apply-check era PASS su main992d1a0b e S07head77c2178d; la futura consolidata va
ricontrollata. Vedi S00-INTEGRATION.md. RUNLOG/NEXT rimangono single-writer S00:
questa consegna fornisce l'appendice, non li modifica in concorrenza.

README/REVIEW conservano i FAIL, i claim ritirati e gli errori di coordinamento.
Control13 rileva right412>390; native14 trova keyboard ancora aperta; i primi
fix f66/60395 sono respinti dalla review prima di un runtime falsamente verde.
Native15 verifica il cleanup; lettura screenshot trova hover trasparente;
native16 verifica anche opacità. Nessun timeout aumentato, gate indebolito o
PID altrui fermato. Tutti i processi propri conclusi, porta55140 chiusa.

Gli otto log host iniziali sono solo locali in work, ora FileProvider
compressed,dataless: digest storici e disponibilità espliciti nel manifest,
nessun recupero inventato. Log Roomv3 e report browser versionati sono leggibili
e verificati per hash. Goodnotes ha solo metadati/timeoutUI; REA MathLive è
statica parziale. Native e CI sono prove separate dalla REA.

## Cinque passi prioritizzati per S00

1. **P0 — consumer reale.** Applicare/reconciliare le sole hunks v3 dopo311.
   Dipendenza: writer Room S00; accettazione: quattro contratti e UI Formula
   error/retry/pending/menu mobile sulla consolidata. Prova: SHA e log consumer.
2. **P0 — gate e integrazione.** Leggere check della head finale, poi merge tree
   fermo e post-merge. Dipendenza: raccordo e gate S00 risolti; accettazione:
   required PASS e percorso utente reale con riapertura/export/import. Non
   trasferire i verdi delle copie o attestare approvazioni scientifiche.
3. **P1 — confine di durabilità.** Owner storage riproduca reload prima della
   navigazione Continuità e confronti badge board/journal. Dipendenza: grant
   puntuale al writer; accettazione: indicazione UI coerente con flush completo,
   prove di crash/reopen senza journal artificiale. È proposta, non nuovo grant.
4. **P1 — dispositivo e accessibilità.** Controprova Safari/VoiceOver e touch
   fisico su consumer integrato, formule lunghe e orientamento. Dipendenza:
   ambiente/device; accettazione: controlli/focus/fruibilità attestati sul target,
   senza dedurre questo esito dall'emulazione Chromium390×844.
5. **P2 — registro acquisizioni.** S00/S12 riconciliano TARGET081 dal delta dopo
   prova dell'adozione integrata; conservare139storici e deduplicare candidati
   senza assegnare ID arbitrari. Prova: registro aggiornato con consumer/SHA.
