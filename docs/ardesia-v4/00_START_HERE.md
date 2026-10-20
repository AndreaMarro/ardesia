# ARDESIA V4.1 — mini-corsi, area personale, diario degli errori e REA verificabile

**Consegna aggiornata a Codex GPT-6.1 / Astra del 20 ottobre 2026. Specifica e test del pacchetto, NON prodotto implementato.** Questa revisione sostituisce V3 come mandato, conserva i 139 riferimenti e tutte le regole precedenti, aggiunge diario P0 e prove REA vincolanti.

## Ordine minimo di lettura — non saltare
1. `GOAL.md`, `specs/01_PRODOTTO_E_CONVERGENZA.md`, `specs/02_PERSONE_CORSI_E_GESTIONALE.md` — il prodotto è **gestione ed erogazione di mini-corsi**, non una lavagna da vendere dopo.
2. `specs/13_DIARIO_ERRORI_E_RIPASSO.md`, `specs/03_MEMORIA_POSTIT_E_MORFISMI.md` — area individuale e memoria unificata.
3. `reference/REA_STUDIO_APPROFONDITO_PER_CODEX.md`, `specs/06_REA_FACTORY.md`, `specs/14_REA_GATE_E_RICEVUTE.md` — **studiare davvero REA**, eseguirlo e dimostrarne uso.
4. `plans/IMPLEMENTAZIONE.md`, `contracts/REA_MISSIONS.json`, `factory/rea/REA_GATES.json`, `tests/ACCEPTANCE.json` — realizzare G0/G1, test nominati e gate sullo SHA.
5. `specs/04–12`, `registry/TARGETS.md`, `reference/*` — altre responsabilità, siti e fonti. Le spec precedenti non sostituiscono la nuova 13/14.

## Che cosa fare subito
- **T01:** rilevare HEAD e stato, recuperare la microdemo locale `53782a1247a4804312a17d3fc1251532a7305606` se disponibile, preservare `main` e prove storiche, leggere la documentazione ufficiale REA, eseguire REA R0 sul codice proprio.
- **G0:** sistema funzionante per mini-corso Fisica Semestre Filtro con tutor e 10 studenti sintetici + 2 in attesa; **area personale vera + diario degli errori**, aula, quattro date, prenotazioni, attività interattiva, consegna foto/PDF/audio/testo, revisione, nuova prova e memoria dopo il riavvio. API/database/autorizzazioni reali; AI/ASR/pagamenti possono essere simulati solo dichiarandolo.
- **REA G0:** missioni **R0, R1, R2, R3, R8 e R6** con Evidence reali, confronto col nostro prodotto e test sul commit. `BLOCKED` non è PASS; sostituire il vendor inaccessibile con alternativa autorizzata equivalente. `python factory/rea/check_rea_gates.py --gate G0 --sha <SHA_REALE>` deve uscire zero solo con tutte le prove.
- **G1:** staging remoto, identità reali, backup/ripristino, lezioni e date approvate, revisione tutor; R4 e integrazioni MCP/Calendar secondo contratti, oppure capacità non validate esplicitamente disabilitate. **G2** dipende dall'avvio di un gruppo reale e non può essere simulato.

## Visione da non perdere
**Quattro funzioni:** formare gruppi, gestirne l'economia, svolgere le lezioni, creare continuità. **Tre viste:** area personale permanente dello studente, aula comune, regia economico-didattica del tutor. **Una memoria:** LessonOS, eventi e versioni canonici, grafo e diario come proiezioni. **Un solo core:** Fisica prima, Analisi 1 come seconda materia, altre discipline e Kirchhoff a seguire.

## Vincoli
- Monorepo modulare, nuova UI sottile `apps/web` solo dove necessaria; Vercel UI, Supabase Auth/Postgres/Storage/RLS, Render API/MCP e worker. Non creare seconda memoria, secondo login o secondo solver.
- Nessun recupero illecito di codice/asset/manuali terzi; REA osserva/analizza soltanto target e account autorizzati. Licenze dei donor aperte verificate, notice conservate.
- Nessun nuovo pagamento, workspace, deployment produzione, merge o invio reale senza autorizzazione. Preparare branch/PR e receipt per task, non spam GitHub.
- I riferimenti legacy sono snapshot: confrontare con HEAD corrente e non fare checkout indietro automaticamente.

## Stato onesto
Questa consegna non ha eseguito REA contro i concorrenti, né Codex, né prodotto, né deployment. Il gate REA fornito è un **controllo di ricevute**, NON un certificato di qualità o di autorizzazione. Tutti i criteri runtime rimangono `NOT_RUN`. `DOCUMENTO_UNICO.html` è una specifica navigabile, non il sito funzionante.


## CAMBIO VINCOLANTE V4.1 — per la sessione Codex senza utente davanti
**LEGGERE PRIMA DI QUALSIASI OPERAZIONE** `specs/15_AUTONOMIA_TRIAL_E_LANCIO.md` e `ops/CODEX_CHATGPT_WATCH_HANDOFF.md`. Questo addendum prevale sui vecchi divieti di navigazione/preview/registrazioni gratuite. **Agire su Internet autonomamente**, selezionare un'alternativa almeno equivalente per ogni vendor non accessibile, usare trial strettamente gratuiti tracciandoli, fare commit/PR e preview Vercel senza fatturazioni nuove. Non pagare né esporre produzione/dati senza preflight. **Scadenza marketing mercoledì 21 ottobre 2026 sera:** laboratorio Fisica funzionante + landing raccolta interessi onesta e testata; G0/G1 continuano indipendentemente.

Codex deve sapere che ChatGPT ha un monitor orario attivo (`Ardesia revisione tecnica oraria`): aggiornare RUNLOG e STATE su GitHub e leggere findings PR; il monitor non sostituisce il builder e non comunica automaticamente con esso. Notifiche push non risultano attive per l'automazione; non prometterle.
