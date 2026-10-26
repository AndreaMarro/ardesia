# Validazione S08 — 26 ottobre 2026

Base main37e0fe828e47b7c81784c2eb48a1b9776dd859ed; diff identificato da implementation-manifest.json. Branch codex/s08-lesson-media-20261026. Nessun test di un'altra sessione sommato ai propri.

| Prova propria | Esito |
| --- | --- |
| Nuovi test Web, compresi i due P2 corretti | 9 PASS,2file; comando `npm run test --workspace @ardesia/web -- src/features/lesson-media/ --maxWorkers=1` |
| Dominio media + access/context Core regressioni | 18 PASS; pytest sui3file elencati in QA.md |
| Trasporto HTTP risorse Core, CAS/history/access/logout | 1 PASS;1warning upstream Starlette/httpx deprecato |
| Web build con TypeScript | PASS, `npm run build:web` (`tsc -b && vite build`); warning preesistente chunk mathField>500kB, nessun limite innalzato |
| Review tecnica secondo agente |2P2 riprodotti e corretti con regressioni RED→GREEN; non firma umana |
| Browser Chromium finale | Vedere browser-result.json: prova nativa finale, non un mock |
| Suite Web completa finale |427/427PASS,62file, `npm run test --workspace @ardesia/web -- --maxWorkers=1`,58.98s; stessa implementazione05688643 |
| CI di questa PR |[PR313](https://github.com/AndreaMarro/ardesia/pull/313), da verificare sulla head remota effettiva; main precedente verde non certifica il diff |

Controprova successiva sullo stesso codice, dopo chiusura dei soli server QA S08:23/23PASS nei6file nuovi e preesistenti che avevano fallito (session-boundary/public-hydrostatic/exam-bank/exam-cas). Seguita dalla suite completa427/427PASS. Non prova da sola la causa dei fallimenti precedenti.

## Fallimenti conservati e limiti

La prima invocazione Vitest dal root con include relativo non trovava test: corretto usando il workspace. Il primo test riapertura usava un selettore testuale ambiguo (p e textarea): reso preciso senza cambiare l'asserzione. Il test cercava poi uno spazio nel nome accessibile che il DOM reale concatena: la prova ora conta i pulsanti nel nav e verifica la registrazione take-one.

Sotto forte carico concorrente del Mac, la suite ampia ha incontrato timeout in exam-cas; una seconda esecuzione ha incontrato quattro fallimenti in session-boundary, public-hydrostatic e exam-bank. Quelle prime suite ampie sono state interrotte con exit130 e non sono dichiarate verdi; la successiva run completa427PASS è un’esecuzione distinta. I file relativi non sono cambiati in S08; questo fatto, da solo, non dimostra la causa. Nessun test esistente, asserzione o gate CI è stato modificato. I nuovi test DOM hanno budget30s locale nel file e mantengono tutte le asserzioni; le due regressioni effettive sono state osservate separatamente prima del fix.

La prima prova browser aveva timeout nella selezione dell'editor; la prova completa successiva ha passato l'intero percorso ma ha rivelato font403 nello Studio dev con symlink esterni. La configurazione QA locale successiva consente soltanto le directory di dipendenze effettive; non modifica la configurazione prodotto. Il risultato finale distingue console attesa per fonte404 da errori inattesi.

I media sono due WAV sintetici decodificabili, con hash e journal canonico. Non sono audio parlato o lezioni reali. Non eseguiti: ascolto umano, Safari/device fisico, video/Range remoto, upload interrotto/quarantena/worker, efficacia didattica o approvazione scientifica. Per la prova di font e console usare il risultato finale e gli screenshot, non la prima run.

## Correzione CI: dipendenza transitiva del test tra workspace

La head81f7e1cb falliva nel Web job121330942909 della CI40247057744: `lessonBundle.ts` non trovava jszip e i tre errori any erano conseguenze della dichiarazione assente. Il nuovo test Web del resolver Studio faceva seguire al compilatore un import di tipo WorkspaceStore→lessonBundle. jszip è una dipendenza del workspace Studio, non del root/Web. L’installazione condivisa locale nascondeva il confine.

Riproduzione propria: rimosso soltanto il symlink node_modules riusato da S08, eseguito npm ci dal lock nel proprio checkout senza installare Studio; typecheck Web ha riprodotto esattamente i quattro errori. Correzione: nel Web resta il test dell’URL audio/ancora; il test sul resolver canonico è in `apps/studio/src/__tests__/LessonMediaReplayTargets.test.ts`, dove le dipendenze Studio sono legittime. Il resolver continua a rifiutare il controesempio con versione non esistente. Nessuna dipendenza, lockfile, configurazione CI o controllo indebolito. La prova Studio mirata è1PASS; typecheck forzato e suite Web vengono rieseguiti senza node_modules Studio.

Esito della verifica pulita prima dell'aggiornamento base: typecheck Web `--force`PASS con node_modules Studio assente; suite Web completa427/427PASS,62file,70.18s, installazione root/Web dal lock. La richiesta S00 di esclusiva host è arrivata a suite ultimata; il successivo build locale è stato fermato per cedere lo slot. L'ultimo build prodotto precedente resta PASS e la correzione riguarda soltanto test/documentazione, senza modifica dei byte sorgente runtime. Nessuna nuova suite pesante locale finché S00 occupa lo slot.
