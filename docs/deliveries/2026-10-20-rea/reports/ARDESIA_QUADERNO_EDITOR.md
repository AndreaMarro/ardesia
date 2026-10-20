# Ardesia — editor del quaderno scientifico

Consegna locale del 20 ottobre 2026. Commit `12296e6be225be7571be88ca55b67bd3fd30784d`.

Il quaderno è integrato nell'aula e in «Il mio lavoro»: note, evidenziazioni e
formule sul PDF, spostamento, dimensioni, Undo/Redo, salvataggio e riapertura.
La consegna collega la revisione salvata e il suo originale. Il tutor vede la
versione consegnata; una nuova revisione privata rimane riservata allo studente.

REA **6.7.0** è l'ultima versione pubblicata al controllo odierno, del
18 ottobre 2026, ed era già configurata. Nessun aggiornamento necessario.
[Release ufficiale](https://github.com/morluto/rea/releases/tag/rea-agents-6.7.0).

## Verifiche

| Controllo | Esito |
|---|---|
| Web, suite completa | 191 test passati, 29 file |
| Studio, gate congelato con typecheck e replay | 2158 passati, 0 falliti |
| Build Web e pubblico | Completati; warning sul chunk matematico conservato |
| REA MCP, scenario editor | 25 azioni completate oltre alla navigazione iniziale |
| Browser reale, API SQLite | Salvataggio/riapertura, risposta persa/retry, consegna e isolamento della revisione tutor verificati |
| Responsive | 390, 820 e 1440 px; zoom CSS 200%; nessun overflow della pagina rilevato |
| Tastiera e MathLive | Focus visibile, digitazione e primo Annulla verificati |
| CSP candidata | Nessuna violazione nel percorso esercitato |
| Axe nella regione quaderno | 0 violazioni, 25 controlli passati; contrasto parzialmente incompleto |
| Review separata | Tre difetti riprodotti e corretti, tre probe passati |
| Patch | Applicabilità verificata sulle rispettive basi |

Ambiente: Chrome locale su `http://127.0.0.1:5397`, con soli utenti e PDF
sintetici. Browser plugin non disponibile: Playwright ordinario.
Percorso: upload → pagina 2 → nota/formula → drag e Undo/Redo → salvataggio →
riapertura → risposta persa e retry → consegna in aula → nuova versione privata →
tutor sulla revisione consegnata. Le prove finali confermano contenuto renderizzato,
nessun overlay di errore, nessuna eccezione JavaScript e controlli operativi.

L'analisi REA del pacchetto MathLive è statica e parziale. Lo scenario runtime
conserva DOM, accessibilità, screenshot e 168 eventi; alcuni corpi di rete non
sono disponibili e la completezza globale resta `incomplete / events`.
I tentativi falliti, le correzioni dello scenario e i limiti restano nel report.

## Contenuto e applicazione

- `source/`: 105 file modificati dalla base generale, con percorsi originali.
- `patches/cumulative.patch`: dalla base `d0235e8a9dbbccd6808741a087dd0359908feb2b`.
- `patches/notebook-editor-only.patch`: solo l'incremento editor, da `ebcb6bc8020f444281f87770b66e43b7bb665a7a`.
- `evidence/`: risposte/bundle MCP, verifiche browser, review, probe prima/dopo.
- `screenshots/`: desktop, tablet, mobile e revisione del tutor.
- `scripts/`, `fixtures/`, `logs/`: scenari, PDF sintetici e verifiche riproducibili.
- `MANIFEST.json`: identità del commit, hash e controllo delle patch.

È un archivio di modifiche, non un'app standalone. Applicare **una sola patch**
su un checkout alla sua base, dopo `git apply --check`. Eseguire `npm ci` nella
root del monorepo, poi `npm run build --workspace @ardesia/web`. Il server Study
API e lo schema canonico 6 sono prerequisiti: l'inizializzazione esplicita
migra SQLite; le richieste API non migrano. PostgreSQL live non è stato verificato.

Gli script di QA riportano i percorsi del checkout e della cartella temporanea
usati in questa prova: adattarli al proprio ambiente. `seed-ui.py` genera nuove
sessioni sintetiche locali; credenziali e database della prova non sono inclusi.
I PDF si trovano in `fixtures/`. `browser-ui.cjs` prepara la fixture usata da
`browser-quality.cjs`; `make-rea-plan.py` prepara lo scenario MCP. Non eseguire
il reset delle fixture contro dati reali.

Le nuove dipendenze sono esatte: MathLive 0.110.0 e DOMPurify 3.4.17.
Font e licenze sono locali; il motore matematico è caricato su richiesta.
Attribuzioni: `source/apps/web/THIRD_PARTY_NOTICES.md`.

## Limiti

Bozze non salvate conservate soltanto nella sessione del browser, con avviso
all'uscita ed export JSON; non sopravvivono a reload/crash. I salvataggi canonici
sono persistenti. L'export della bozza non è un'importazione automatica.

Restano verifiche screen reader, contrasto parzialmente incompleto di Axe, Safari/Firefox,
penna/touch, prestazioni con 200 formule, PostgreSQL live e confronto con un
workflow equivalente esterno autorizzato. Nessuna certificazione di UI perfetta,
SYS-01, G0/G1 o rilascio; SYS-02..08 rimangono nel piano.

Il Core/API non è cambiato in questo incremento: i relativi risultati della
consegna precedente non sono nuove esecuzioni. La suite Web completa precede la sola aggiunta finale del ruolo ARIA al
viewport PDF: dopo questa riga sono passati 9 test mirati, build e browser/axe.
Il gate Studio si riferisce al codice condiviso finale. Nessun push, merge, deploy o messaggio esterno.

Report tecnico completo:
`source/docs/ops/rea-deep/TARGET-082/SCIENTIFIC-NOTEBOOK-EDITOR.md`.
