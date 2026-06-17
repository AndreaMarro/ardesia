# PROMPT PROSSIMA SESSIONE — 13 aprile 2026

> Copia TUTTO questo come primo messaggio della prossima sessione Claude Code Terminal.

---

## CONTESTO IMMEDIATO

Riunione **DOMANI LUNEDI** con **Omaric Elettronica** e **Giovanni Fagherazzi** (ex Arduino Global Sales Director).
Il prodotto DEVE funzionare DAVVERO. NO DEMO. NO DATI FINTI.
Deploy LIVE su elabtutor.school — UNLIM parte minimizzato (fix 12/04).

## PRINCIPIO ZERO

"Rendere facilissimo per CHIUNQUE spiegare i concetti dei manuali ELAB e spiegarne gli esperimenti SENZA ALCUNA CONOSCENZA PREGRESSA. Arrivi e magicamente insegni."

## STATO ATTUALE (audit 12/04/2026)

```
Test: 3674 pass (127 file, 0 fail)
Playwright: 50 pass (Chrome reale, 5 categorie utenti)
Build: PASS (1m 18s, 3016 KiB precache)
Deploy: LIVE su elabtutor.school (200 OK, deploy 12/04 23:15)
Benchmark 30 categorie: 6.8/10
RAG chunks: 638 su Supabase pgvector
Nanobot: Supabase Edge Functions (Gemini 70/25/5 routing)
UNLIM: parte minimizzato, tab CHAT/PERCORSO/GUIDA
Idle threshold: 120s prima di auto-aiuto
```

## I 6 TASK PER QUESTA SESSIONE (in ordine di priorita)

### TASK 1: SIMULATORE PERFETTO — No bug, Scratch e Arduino (P0)
- Testa OGNI esperimento Cap6 Vol1 su Chrome live
- Verifica Scratch/Blockly si apra per esperimenti Vol3
- Verifica compilatore Arduino funzioni (C++ → HEX → AVR emulation)
- Fix qualsiasi bug trovato
- **Prova oggettiva**: screenshot di 5 esperimenti funzionanti

### TASK 2: UNLIM ONNISCIENTE — Pilota tutto, conosce tutto, "Ehi UNLIM" (P0+)
**Questo e il task PIU IMPORTANTE. UNLIM deve essere testatissimo e funzionare perfettamente.**

- **Wake word "Ehi UNLIM"**: implementare rilevamento wake word via STT continuo
  - Quando lo studente dice "Ehi UNLIM", si attiva automaticamente (tipo "Ehi Google/Siri")
  - Il microfono ascolta in background per il wake word (bassa CPU)
  - Dopo il wake word, registra la domanda e la manda a Gemini
- UNLIM deve usare le STESSE PAROLE dei volumi (RAG 638 chunk)
- UNLIM deve poter eseguire ORDINI COMPLESSI:
  - "Costruiscimi un circuito con LED, resistore e pulsante" → [INTENT:{place+wire}]
  - "Evidenzia il resistore" → [AZIONE:highlight:r1]
  - "Accendi la simulazione" → [AZIONE:play]
  - "Mostrami il passo 3" → [AZIONE:setbuildmode:passopasso] + nextstep
  - "Che errore c'e nel mio circuito?" → analisi vision + diagnosi
- Testa 30 domande reali su esperimenti diversi, documenta risposte
- Se RAG non risponde bene: espandi chunk, migliora prompt
- **Prova oggettiva**: 30 Q&A documentate con valutazione 1-5, video wake word

### TASK 3: ANALISI PROFONDA VOLUMI — Allineamento al libro (P0)
- Leggi `docs/volumi-originali/VOLUME-{1,2,3}-TESTO.txt`
- Leggi `docs/sprint/AUDIT-PARITA.md` (349 righe discrepanze)
- MOLTI esperimenti su ELAB sono reiterazioni dello stesso esperimento
- Identifica quali sono superflui e proponi rimozione/accorpamento
- Allinea titoli, componenti, istruzioni al libro fisico
- **Prova oggettiva**: report con lista esperimenti da rimuovere/modificare

### TASK 4: USABILITA — Touch, PC, UX (P1)
- Leggi `docs/sprint/DESIGN-CRITIQUE-12-APR-2026.md`
- Fix breadcrumb (Volume > Cap > Esp) sopra il canvas
- Fix header troncato su mobile
- Migliora touch target per iPad (44x44px minimo)
- **Prova oggettiva**: Playwright test mobile + tablet

### TASK 5: VOCE — Comando vocale + guida proattiva (P1)
- La voce si attiva con un comando ("Ehi UNLIM" o bottone microfono)
- In modalita libera, UNLIM suggerisce proattivamente cosa fare
- Valuta: Edge TTS (gratis) vs Kokoro su VPS (€50/mese) vs ElevenLabs Flash (€690/mese)
- **Per la demo**: Edge TTS basta, ma prepara comparison audio
- **Prova oggettiva**: registrazione 3 risposte vocali

### TASK 6: PRESENTAZIONE LUNEDI — Schema + pacchetti (P0)
Crea `docs/presentazione/SCHEMA-DEMO-LUNEDI.md` con:

**Cosa dire e mostrare (15 minuti)**:
1. (2 min) Homepage → "Inserisci chiave" → Lavagna con circuito LED
2. (3 min) "Passo Passo" — il circuito si monta da solo
3. (2 min) Click mascotte UNLIM → "Come funziona questo LED?"
4. (2 min) UNLIM evidenzia componenti e spiega con parole del libro
5. (2 min) Scratch/Blockly — programma Arduino visualmente
6. (2 min) Report fumetto a fine sessione
7. (2 min) Analisi costi e pacchetti

**Pacchetti proposta**:
| Pacchetto | Contenuto | Prezzo/classe/anno |
|-----------|-----------|-------------------|
| Base | Lavagna + UNLIM chat | €200 |
| Standard | + Voce + Report | €350 |
| Premium | + Videolezioni + Dashboard docente | €500 ← **SPINGI QUESTO** |
| Enterprise | + LIM + Offline + Supporto | €800 |

**Analisi costi per 100 scuole**:
- Stack Gemini 70/25/5: ~€670/mese
- TTS Edge (gratis): €0
- Supabase: ~€25/mese
- Totale: ~€700/mese = €7/scuola/mese
- Margine pacchetto Premium (€500/anno = €42/mese): **83%**

## PDR — Metodologia

Per OGNI task:
1. LEGGI i file indicati
2. IMPLEMENTA modifiche minime
3. TESTA: `npx vitest run` >= 3674 + Playwright su Chrome
4. COV: documenta in docs/sprint/
5. COMMIT con metriche
6. PUSH su ENTRAMBI: `git push origin main && git push work main`
7. DEPLOY: `npx vercel --prod --yes --token vca_4l0MQNRE1Jqz6fhaIhw9vmirWAf845CiZBRxsYZATnqVqWPr2v2bDadC`

## REGOLE FERREE

1. **SE UNA COSA SEMBRA FINITA, NON LO E** — verificala
2. **NO push su main senza test PASS**
3. **Push su ENTRAMBI i repo** — `git push origin main && git push work main`
4. **Prova oggettiva** per ogni task
5. **MAI auto-celebrarsi** — brutale onesta
6. **NO REGRESSIONI** — test >= 3674 sempre
7. **Principio Zero** — il docente e il protagonista, UNLIM lo strumento

## COMANDI UTILI

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
npx vitest run                    # Test (>= 3674)
npm run build                     # Build
npx vercel --prod --yes --token vca_4l0MQNRE1Jqz6fhaIhw9vmirWAf845CiZBRxsYZATnqVqWPr2v2bDadC  # Deploy
curl -s "https://www.elabtutor.school" -o /dev/null -w "%{http_code}"  # Site check
```

## FILE CRITICI

```
docs/sprint/BENCHMARK-2026-04-12.md       — 30 categorie, 7 gap a zero
docs/sprint/DESIGN-CRITIQUE-12-APR-2026.md — score 5.5/10, 9 raccomandazioni
docs/sprint/ARCHITECTURE-REVIEW-2026-04-12.md — 106K LOC, duplicati
docs/sprint/REDUNDANCY-AUDIT.md           — 16 issue (3 P0)
docs/sprint/EXTERNAL-CONTRIBUTORS-AUDIT.md — 5 branch da mergiare
docs/sprint/AUDIT-PARITA.md               — 349 righe discrepanze volumi
docs/volumi-originali/VOLUME-{1,2,3}-TESTO.txt — testi originali
```

## WORKER PROGRAMMATI (attivi ogni ora)

| Worker | :min | Ruolo |
|--------|------|-------|
| elab-audit-worker | :17 | Pull, test, build, report |
| elab-debugger-worker | :32 | Colma gap test |
| elab-critic-worker | :47 | Trova bug e pattern |

## NOTA VOCE (dalla conversazione con Andrea)

Andrea vuole voce bella ma economica. Stack consigliato:
- **Default**: Edge TTS (gratis, buona) — gia implementato
- **Upgrade**: Kokoro TTS su VPS Mac Mini M4 (~€50/mese, qualita ElevenLabs)
- **Premium**: ElevenLabs Flash solo per onboarding + momenti chiave (~€200/mese)
- **NO**: Gemini Native Audio (troppo caro a scala)
- "Voxel" = probabilmente Voxtral (Mistral, open source, voice cloning 3s) — in memoria

## NOTA ESPERIMENTI SUPERFLUI (importante per Andrea)

Andrea dice che molti esperimenti sono reiterazioni. Esempio:
- Cap 9: Esp 7/8/9 sono variazioni di "aggiungi pulsante/combina"
- Cap 10: Esp 5/6 sono "aggiungi potenziometro/pulsante" all'esp 4
- Questi vanno accorpati o rimossi per non confondere il docente

L'audit parita (AUDIT-PARITA.md) ha i dettagli per ogni capitolo.
