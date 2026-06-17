# G15 — "META' STRADA" (Audit di Meta' Percorso)

Data: [INSERISCI DATA]. Durata: Meta' giornata. Questa sessione NON produce feature. Produce VERITA'. Se il piano non sta funzionando, qui lo correggiamo. Se i numeri sono gonfiati, qui li sgonfiamo.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. automa/PIANO-2-SETTIMANE.md. 4. TUTTI i report G12-G14 (automa/reports/G12-*.md, G13-*.md, G14-*.md). 5. automa/context/UNLIM-VISION-COMPLETE.md. 6. Questo prompt.

FASE 1: Score Card Meta' Percorso (1 ora). Ricalcola OGNI punteggio con la stessa metodologia del mega-audit G11 (automa/reports/G11-MEGA-AUDIT-ONESTO.md). Usa gli stessi criteri, la stessa pesatura. NON cambiare metodologia per fare sembrare i numeri migliori.

Aree: Simulatore engine, Contenuto pedagogico, LIM/iPad usabilita', Teacher Dashboard, WCAG/A11y, Code Quality, Performance, Business readiness, UNLIM vision. Due compositi: tecnico e insegnante.

Per ogni area: (1) misura con grep/screenshot/test, (2) confronta con G11, (3) documenta delta con prova.

FASE 2: CoV Massivo — 5 Agenti Paralleli (2 ore).

Agente 1: "Prof.ssa Rossi Impersonation" — Simula l'uso COMPLETO sulla LIM. Apri #prova. Carica un esperimento. Parla a UNLIM (se STT implementato). Guarda i messaggi (posizionati o top-center?). Prova il Passo Passo. Genera un report. Il docente riuscirebbe a fare una lezione intera SENZA aiuto?

Agente 2: "Bug Hunter" — Cerca regressioni da G12-G14. Tutte le feature G11 funzionano ancora? (#prova, deep-link, toast, export, game tracking). Build PASSA? Console errors nuovi?

Agente 3: "UNLIM Vision Delta" — Confronta stato codice attuale punto per punto con UNLIM-VISION-COMPLETE.md. Tabella: capacita' | stato G11 | stato G15 | % completamento | prova.

Agente 4: "Competitor Snapshot" — Cosa hanno fatto Tinkercad, Wokwi, Code.org questa settimana? C'e' qualcosa di nuovo che cambia le priorita'?

Agente 5: "LIM Simulator" — Testa l'interfaccia simulando uno schermo LIM (1920x1080, 16:9). Font leggibili da 3 metri? Touch targets OK? Contrasto su proiettore?

FASE 3: Verdetto + Course Correction (1 ora).

Basandosi sui risultati dei 5 agenti:

IF Score UNLIM vision < 4.0 THEN → G16-G17 devono concentrarsi su mascotte/messaggi, non sessioni/report
IF Galileo non funziona → G16 diventa "Fix Galileo", non "Sessioni salvate"
IF build rotto → fix prima di tutto
IF regressioni da G12-G14 → fix prima di nuove feature
IF score insegnante non e' salito di almeno 1.0 → il piano non funziona, ripensalo

Scrivi: automa/reports/G15-AUDIT-MIDPOINT.md (il documento piu' importante della settimana). Aggiorna: PIANO-2-SETTIMANE.md se serve course correction. Aggiorna: STATE.md, handoff.md.

REGOLA: Se i numeri dicono che il piano non funziona, CAMBIA IL PIANO. Non cambiare i numeri.
