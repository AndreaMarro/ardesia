# AUDIT TOTALE — ELAB UNLIM (27/03/2026, Giorno 1)
> Auditor: Claude Opus 4.6 con superpowers (3 agenti paralleli + audit diretto)
> Massima onestà. Nessuna compiacenza.

---

## 1. STATO COMPLESSIVO DEL PRODOTTO

| Dimensione | Voto | Evidenza |
|-----------|------|----------|
| Motore simulatore | **8/10** | KCL/MNA, 21 componenti SVG, 67 esperimenti, AVR CPU |
| UX docente inesperto | **3/10** | Troppa complessità, nessun percorso guidato, chat invadente |
| AI Galileo | **6/10** | Action tags funzionano, identity ok, ma latenza 15s e risposte troppo lunghe |
| Infrastruttura | **7/10** | Build passa, Vercel ok, nanobot ok, Brain V13 ok, ma automa morto |
| Documentazione | **8/10** | MASTER-PLAN, PRODUCT-VISION, 61 YAML curriculum, context protocol |
| UNLIM Mode | **1/10** | Scheletro appena creato — mascotte è una "U", input non connesso |
| Marketing | **2/10** | Landing PNRR creata, ma zero landing per dirigenti, zero MePa, zero funnel |

**Composite score**: 0.946 (da evaluate.py). Attenzione: questa metrica è quasi satura (3 su 4 metriche al massimo) e ha basso potere discriminante.

---

## 2. AUDIT CODICE — Componenti UNLIM Mode (Giorno 1)

### Cose fatte bene
- Integrazione non-invasiva: UnlimWrapper wrappa ElabTutorV4 dall'esterno, ZERO modifiche a ElabTutorV4
- Auto-rilevamento esperimento via evento `experimentChange` — pattern elegante
- localStorage per persist modalità — funziona offline
- Touch target >=44px su tutti i bottoni (conforme WCAG/Apple HIG)
- Design tokens usati correttamente (`var(--color-primary)`, `var(--radius-lg)`, ecc.)
- Template percorso lezione con vocabolario verificato (nessun termine vietato nei messaggi)

### Problemi trovati

| # | File | Problema | Severità |
|---|------|---------|----------|
| 1 | UnlimOverlay.jsx | `useEffect` con `clearTimeout` non cancella il fade timer se il componente si smonta tra fade e dismiss | ⚠️ Media |
| 2 | UnlimWrapper.jsx | `showMessage` nell'effect per experiment change non è in deps array — possibile stale closure | ⚠️ Media |
| 3 | UnlimMascot.jsx | `<style>` tag inline con `@keyframes` viene duplicato ad ogni render — dovrebbe essere in CSS module o file globale | 🔵 Bassa |
| 4 | UnlimInputBar.jsx | `onFocus`/`onBlur` con `e.target.style` — inline style mutation fragile, meglio classi CSS | 🔵 Bassa |
| 5 | UnlimWrapper.jsx | `handleSend` crea timeout senza cleanup — possibile state update su componente smontato | ⚠️ Media |
| 6 | Tutti i componenti | Inline styles invece di CSS modules — inconsistente con il pattern del resto del progetto | 🔵 Bassa |
| 7 | v1-cap6-esp1.json | Il campo `components_needed` include "Resistore 470Ω" ma il curriculum YAML ha `forbidden_terms: ["resistenza"]` — il docente dovrebbe introdurre il resistore contestualmente, non nominarlo nella lista | ⚠️ Media |

### Verdetto codice: **APPROVO CON RISERVA**
Gli scheletri sono corretti e il pattern di integrazione è solido. I problemi sono tutti risolvibili nel Giorno 2-3 quando si fa il wiring reale. Il bug #7 (resistore nel template) è il più critico — va verificato con il libro fisico.

---

## 3. AUDIT AUTOMA

### Salute
| Metrica | Valore | Giudizio |
|---------|--------|----------|
| Status | **MORTO** (ultimo heartbeat 09:48 il 27/03) | 🔴 Critico |
| Cicli totali oggi | 23 | OK |
| Cicli con file_changed | 18/23 (78%) | ✅ Buono (era 0% nelle prime settimane) |
| Verdetti keep | 18 | ✅ Produttivo |
| Verdetti no_measurement | 5 | ⚠️ Troppi |
| Verdetti failed | 2 | OK |
| Queue pending | 41 | ⚠️ Troppi — molti sono ricerca generica auto-generata |
| Queue done | 124 | OK |
| Queue failed | 6 | OK |
| Budget mese | €10.1 / €50 | ✅ Sotto budget |

### Cosa ha prodotto l'automa di VALORE
1. ✅ Landing PNRR con dati corretti (D.M. 218/2022, 750M)
2. ✅ Fix routing deep link
3. ✅ Chat minimizzata per default
4. ✅ Dev/Admin nascosti per non-admin
5. ✅ Toggle Modalità Guida eliminato
6. ✅ Progressive disclosure ridotta
7. ✅ God component splittato (4 hooks estratti)
8. ✅ Welcome card onboarding
9. ✅ Mistral GDPR integrato nel nanobot
10. ✅ GDPR SHA-256 pseudonymization
11. ✅ Galileo brevità: max 3 frasi, 60 parole
12. ✅ 9 relatedExperiment IDs fixati
13. ✅ Ricerca competitor dettagliata (PhET, Tinkercad, CTC GO)
14. ✅ Ricerca PNRR con bandi specifici e dati reali

### Cosa ha prodotto l'automa di RUMORE
1. ❌ 5 cicli `pending_interactive` — task che richiedono decisioni umane messi in coda inutilmente
2. ❌ 2 cicli `failed` senza spiegazione ("unknown")
3. ❌ 41 pending di cui ~20 sono ricerca auto-generata generica (`research-competitor-c21`, `research-pedagogy-c20`)
4. ❌ Adversarial che raggiunge `max_turns` o fallisce con `[Errno 2] No such file or directory: 'claude'`
5. ❌ Scheduled tasks (6/7) non producono output — richiedono Claude Desktop attivo

### Giudizio onesto automa
**L'automa ha prodotto valore REALE nella Fase 0** (14 fix concreti). Ma ha anche accumulato 41 pending che sono per lo più rumore di ricerca auto-generata. Il pattern è chiaro: l'automa è bravo a fixare bug specifici con scope limitato, ma fallisce quando il task è troppo ampio o richiede decisioni umane.

**Raccomandazione**: Pulire la queue (rimuovere i ~20 research generici), dare all'automa task specifici di generazione percorsi lezione usando il template perfetto.

---

## 4. AUDIT ADVERSARIAL

L'adversarial ha generato 5 esecuzioni nelle ultime 24h:
- 03:05 — Score 0.943, 3 critici, 1 task, max_turns
- 04:40 — Score 0.9415, 3 critici, 2 task
- 06:33 — Score 0.9415, 3 critici, 1 task, ERROR: `claude` not found
- 06:43 — Score 0.9445, 3 critici, 2 task
- 08:44 — Score 0.9415, GEMINI-CLI-TIMEOUT + ERROR: `claude` not found

**Problemi strutturali dell'adversarial**:
1. **Claude path non trovato** — il fix con path assoluto non è stato applicato ovunque
2. **Gemini CLI timeout** — rate limit frequente
3. **max_turns** — scope del prompt adversarial troppo ampio
4. **Output troncato** — i risultati in shared-results.md sono incompleti

**I "3 critici" che l'adversarial segnala ripetutamente** non sono specificati nel dettaglio — i risultati sono troncati prima di elencarli. Questo è un bug dell'adversarial stesso.

---

## 5. COMPETITIVE INTELLIGENCE (dai dati in shared-results.md + ricerca)

| Competitor | Forza | Debolezza | Prezzo | Minaccia per ELAB |
|-----------|-------|-----------|--------|-------------------|
| **Tinkercad** | Gratis, Autodesk brand, Classrooms | No AI, stagnante dal 2024, no italiano | Free | Media — perché è gratis |
| **Wokwi** | Veloce, ESP32, WiFi sim | No pedagogia, target pro/universitario | $7-25/mese | Bassa — target diverso |
| **Arduino CTC GO** | Brand ufficiale, kit premium | €1830/classe, no AI, piattaforma mediocre | €76/studente | Bassa — troppo caro |
| **PhET** | Gold standard accademico, tradotto IT | No AI, no kit, sandbox puro | Free | Media — usato nelle scuole |

**ELAB è UNICO**: nessun competitor ha simulatore proprietario + AI integrato + kit fisico + curriculum italiano per scuola media. Questo vantaggio è REALE ma non comunicato (marketing 2/10).

**PNRR**: Il 60% del budget Scuola 4.0 deve andare in dotazioni digitali. Le scuole DEVONO spendere. Ma la finestra si sta chiudendo (rendicontazione 30/06/2026). ELAB deve muoversi ORA.

**Mistral**: Costo stimato €6/mese per 1000 studenti con Nemo. GDPR-safe. Integrato nel nanobot ma non deployato su Render.

---

## 6. AUDIT DOCUMENTAZIONE

### Punti forti
- MASTER-PLAN.md: eccellente, 318 righe, Fasi 0-4, gate, anti-pattern
- PRODUCT-VISION.md: bussola chiara, 7 test di verità
- CONTEXT-PROTOCOL.md: 11 passi per ogni agente — evita lavoro senza contesto
- 61/62 curriculum YAML completi con vocabolario progressivo
- SESSION-HANDOFF dettagliati con evidenza verificata

### Punti deboli
- CLAUDE.md (147 righe) è datato — menziona Sprint 1-3 completati ma non UNLIM Mode
- Nessun ARCHITECTURE.md separato (architettura dispersa in più file)
- Zero README nel nanobot/ — un nuovo sviluppatore non saprebbe come deployare
- Zero diagrammi di flusso (il flusso UNLIM Mode è descritto solo a parole)

---

## 7. SCORE CARD FINALE

| Area | Score | Target | Gap |
|------|-------|--------|-----|
| Build | 10/10 | PASSA | 0 |
| Simulatore engine | 8/10 | 8/10 | 0 |
| UX insegnante | 3/10 | 8/10 | **-5** ← IL GAP CRITICO |
| AI Galileo | 6/10 | 8/10 | -2 |
| UNLIM Mode | 1/10 | 7/10 | -6 (appena iniziato) |
| Marketing | 2/10 | 6/10 | -4 |
| Documentazione | 8/10 | 8/10 | 0 |
| Automa efficacia | 6/10 | 8/10 | -2 |
| Deploy/infra | 7/10 | 8/10 | -1 |

**Media pesata**: ~5.0/10

**Il verdetto onesto**: Il motore è forte. L'esperienza docente è debole. UNLIM Mode è la soluzione corretta ma siamo al Giorno 1 su 14. Il rischio principale è scope creep e attività senza progresso.

---

## 8. AZIONI IMMEDIATE (priorità)

1. **DEPLOY NANOBOT** — le modifiche Mistral + brevità sono nel repo, non in produzione
2. **FIX BUG TEMPLATE** — verificare se "Resistore 470Ω" nel template lezione è corretto vs vocabolario
3. **PULIRE QUEUE AUTOMA** — rimuovere ~20 research generici, dare task specifici percorsi lezione
4. **AGGIORNARE CLAUDE.md** — aggiungere sezione UNLIM Mode e componenti nuovi
5. **CONNETTERE INPUT BAR → GALILEO** — il wiring reale è il Giorno 2-3
