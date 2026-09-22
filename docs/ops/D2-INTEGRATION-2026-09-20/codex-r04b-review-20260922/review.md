# R-04b — review Codex, 22 settembre 2026

**APPROVE** sul commit 4286a00488b929e544a31ec3c2bc9b0622a2d84b.
F-R04-01 è chiuso: i cinque Markdown passano il gate documentale immutato,
con riferimenti verificati e risultati storici preservati. Nessun nuovo finding.
R04_INDEPENDENT_REVIEW=APPROVE, nel perimetro documentale R-04.

## Identità e ambito

Base de4524cd7780209fe0cc6fe2a807b666564ad936; branch
codex/restart-review-postlesson-20260921, remote AndreaMarro/ardesia.
Worktree /Users/andreamarro/VOLUME 3/ardesia-codex-restart-20260921,
inizialmente pulito. Builder Muse/OpenCode; reviewer Codex, autore distinto,
modello/effort inherited/unknown. Il mandato preparato da Codex è contesto
condiviso; non si rivendica indipendenza totale o un nuovo reviewer cross-family.

Questa verifica riguarda soltanto la correzione del finding della
[review R-04 precedente](../codex-r04-review-20260922/review.md).
I quattro claim sostanziali A–D erano già stati verificati; workflow, ledger,
prodotto, gate e receipt della review precedente non cambiano nel nuovo commit.

## Esecuzioni indipendenti

| Controllo | Esito |
|---|---|
| Gate sui cinque Markdown della base, stessi file e ambiente | exit 1; 37 rilievi paths |
| Stesso gate sui cinque Markdown al nuovo commit | exit 0; 5 documenti, 4 controlli |
| Riferimenti estratti dall'oracolo, verificati con git cat-file al candidate | 23 percorsi presenti nel commit |
| Workflow trigger gate | exit 0 |
| Boundary gate | exit 0; 12 offender storici, zero aggiunti |
| Spazi Git nel diff base → candidate | exit 0 |

Il controllo negativo usa copie byte-identiche lette da Git alla base, senza
mutare l'albero corrente. Gate SHA-256:
af9bedf288d485cc647644ae897e7ec07bb9b9fb4e03d8ee948599920371e062,
identico prima/dopo. Il verde misura esplicitamente i cinque documenti coinvolti,
non i glob del gate predefinito. Nessuna allowlist o regola indebolita.

Il caso lessonOutcome è verificato separatamente: il file era versionato a
source head 7af8f51ca958f395544af79f0a39cbc3d03c82c7 ed è assente dal candidate.
La ricerca dei nomi lessonOutcome/recapHtml nel bundle Studio e in ingest/compose
Engine non trova riferimenti (rg exit 1, normale esito senza corrispondenze).
È una verifica circoscritta di presenza e riferimenti testuali, non una prova
generale di assenza di qualsiasi dipendenza dinamica.

Il commit modifica esattamente cinque Markdown. Gli exit 1 e i conteggi 16/26
storici sono ancora nel checkpoint; l'addendum distingue la nuova esecuzione.
Il REQUEST_CHANGES nel checkpoint descrive la precedente review; questo nuovo
receipt registra l'approvazione senza riscriverne la storia.

## Prove, limiti e prossimo passo

[Risultati](results.json), [comandi con exit reali](commands.json),
[sorgente del controllo](audit.py.txt), [log e snapshot originali](raw-evidence.zip).
L'archivio preserva i byte; estrarlo in una cartella vuota e verificare gli
hash con `shasum -a 256 -c SHA256SUMS` dalla cartella estratta.
Per riprodurre, collocare il sorgente come audit.py nella cartella
artifacts/restart/r04b-review di un checkout al candidate e usare la venv Engine.

Python 3.13.14; credenziali provider escluse dai subprocessi. Nessuna nuova
dipendenza o subagent. Suite prodotto, build, browser, PDF e letture GitHub non
rieseguiti per questa correzione locale di riferimenti. I dati remoti e i test
precedenti conservano data e perimetro delle rispettive ricevute. Nessuna
approvazione del workflow docente completo o della qualità scientifica.

**Unica prossima azione:** selezionare con Andrea il primo input di lezione
autorizzato per il pilot privato già preparato nel
[piano esistente](../codex-restart-pilot.md). L'esecuzione con modello reale
richiede anche la decisione esplicita dell'owner su configurazione del provider,
dati inviabili e spesa. Questa approvazione non li autorizza e non integra i commit.

MERGE=NOT_PERFORMED; PUSH=NOT_PERFORMED; DEPLOY=NOT_PERFORMED;
REAL_PILOT=NOT_RUN; PAID_LLM_CALLS=0; STUDENT_UPLOADS=0.

Receipt capability append-only: r04b-independent-review-20260922;
persistent-capability-evolution riusata localmente, inherited/unknown,
nessuna promozione, quota o risparmio token numerico rivendicato.
INDEX_SYNC_DEFERRED; nessun vault, Basic Memory, AgentMemory o lavoro Kirchhoff.
