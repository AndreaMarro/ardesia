# Ardesia — Vault di governance

Mappa dei contenuti (MOC). Questo vault vive sul MacBook ed e la superficie UMANA di formalizzazione del progetto Ardesia. Si apre in Obsidian.

Non e il vault della macchina: il Mini mantiene un proprio `~/ardesia-wiki` alimentato dall automazione (sync ogni 6h). Quello NON si tocca da qui. Vedi [[Glossario#ardesia-wiki]].

Stile: niente emoji, frasi sobrie, numeri prima delle opinioni, ogni affermazione tecnica cita una fonte (file:riga o output di comando).

## Note core
- [[Visione]] — cosa stiamo costruendo e perche
- [[Architettura-Sistema]] — le due macchine, il loop, il bridge, il supervisore
- [[Routing-Modelli-e-Costi]] — quale modello fa cosa, e quanto costa
- [[Affidabilita-e-Runbook]] — cosa si e rotto, perche, come si ripara (postmortem incluso)
- [[Sicurezza]] — bridge Telegram, GDPR, residui noti
- [[Allineamento-Due-Claude]] — fonte di verita unica e la contraddizione aperta
- [[Glossario]] — termini del progetto

## Aree di lavoro
- `_inbox/` — dove mettere i file da formalizzare (vedi [[_inbox/README]]). I file in Downloads/Desktop NON sono leggibili dall automazione per via di TCC macOS: vanno spostati qui.
- `Decisioni/` — decisioni datate (vuota, pronta all uso)
- `Ricerca/` — appunti di ricerca (vuota; NON duplicare la Ricerca del Mini)

## Stato in una riga (15/06/2026)
M0/M1/M2 + T4 (ELAB come primo plugin) completi. Loop autonomo sul Mini ATTUALMENTE FERMO per coda esaurita; supervisore MacBook ha avuto un buco di ~41h per sleep. Dettaglio e rimedi in [[Affidabilita-e-Runbook]].

## Materiale di riferimento (fuori da questo vault)
- Mini `~/ardesia-wiki/` (wiki macchina, sync 6h, read-only da qui)
- Mini `~/maestro-docs/` (ARDESIA-ARCHITECTURE.md, PLATFORM-MAESTRO.md v2 canonico, MAESTRO-VISIONE.md, SUPERVISOR-MEMORY.md)
- MacBook `~/MAESTRO-VAULT/andrea/` (concetti/dispense/teacher_book: OUTPUT del motore, rigenerabile — non e governance)
- MacBook home `~/MAESTRO-{PROGETTO,VISIONE,RnD,HANDOFF}-2026-06-10/11.md`
- Copie audit: `~/ardesia-audit-2026-06-15/mini/` e `~/lessonos-supervisor/`
