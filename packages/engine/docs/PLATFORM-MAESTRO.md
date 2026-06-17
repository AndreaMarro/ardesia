# PIATTAFORMA MAESTRO — Documento canonico v2 (2026-06-11, dettatura Andrea + stato reale)

> Fonte: visione Andrea 10/06 + dettatura integrale 11/06 (~15:30) + decisioni ratificate.
> Questo file ORGANIZZA le idee e le aggancia a ciò che ESISTE. Aggiornarlo, non duplicarlo.

## 1. TESI (obiettivo profondo, invariante)
**Apprendimento ORIZZONTALE**: chi insegna impara e viceversa — docente/discente è proprietà della
RELAZIONE, non della persona (eco Foucault). La piattaforma si personalizza su chi ha davanti, si
adatta agli sviluppi tecnologici, fa guadagnare i tutor capaci, supera la dicotomia istruzione
pubblica/privata. Bella, avanguardista, plastica.

## 2. IL LOOP DEL PRODOTTO (stato per blocco)
| # | Blocco | Cosa fa | Stato |
|---|---|---|---|
| 1 | **Lavagna-che-registra** (Studio) | cattura scritto (journal eventi) + audio docente opzionale (Mode A); VIDEO = fase futura, per passi | ✅ M0 (T0-T3) |
| 2 | **Motore semantico** (LessonOS) | ASR locale → capsule → **grafo per-docente** (concetti, prerequisiti, evidenze VERBATIM) | ✅ M0-M1 |
| 3 | **Riepilogo per lezione** | markdown grounded, citazioni verificate claim-per-claim | ✅ M0 |
| 4 | **Contenuti nello stile** (espressivo E contenutistico) | dopo N lezioni: dispense/LIBRI generati automaticamente dallo stile+contenuto del docente, verificati — "non come su Udemy: tutti possono farlo" | 🔨 M1-4 in corso (StyleProfile + gate fail-closed; blind-test Andrea ≥7/10) |
| 5 | **Vetrina social** (cloud SOTTILE) | profili; persone trovate/scelte/pagate al prezzo che stabiliscono; contenuti recensiti/venduti/gratis; piani | 📋 M2-M3 |
| 6 | **Tool didattici** (ToolHost) | breadboard, brainstorming, scrittura creativa…; gli utenti creano/condividono/VENDONO tool e abbonamenti | 📋 M2 — spec v0 in design ORA (judge-panel fable) |
| 7 | **Videochiamata** | NON integrata. **Meet esterno**, link-out. La lavagna è lo strumento | ✅ deciso (Jitsi rimosso) |

## 3. ARCHITETTURA DEI DATI (non negoziabile)
- **Contenuti generati e lezioni: sul PC del docente.** Il cloud ha SOLO la vetrina (profili,
  scoperta, transazioni, recensioni). Audio MAI in cloud. Zero voci studenti BY DESIGN (Mode A).
- Formati aperti (JSONL/SQLite/Markdown/SVG), raw/ immutabile, derived/ rigenerabile.
- Dall'intel 11/06: questo è il differenziatore STRUTTURALE — "col nostro design il problema GDPR
  non esiste, non va gestito". NotebookLM Enterprise ammette che le feature Studio non sono
  EU-ML-compliant; TeachFX manda voci studenti in cloud. Nessuno copia il local-first senza
  ri-architettura.

## 3-bis. PERSONA & GTM (DECISIONE 11/06 sera — osservazione Andrea, ratifica supervisore)
**La piattaforma è TUTOR-FIRST.** Il marketplace (prezzo proprio, vetrina, recensioni, "i tutor capaci
guadagnano") è strutturalmente per docenti INDIPENDENTI, non per insegnanti di ruolo.
- **Motion 1 — TUTOR (subito)**: B2C/prosumer, ~€15/mese (i 10 piloti SONO questo segmento), zero
  procurement, iterazione veloce, flywheel marketplace. È anche il segmento dove NotebookLM fa meno male:
  Google vende alle scuole via Workspace, non al tutor che vuole vetrina+reddito.
- **Motion 2 — SCUOLE (dopo)**: per-istituto via Privacy Pack (R2) + MePA (canale Davide). Più lenta, più
  grossa. Qui vive anche ELAB → separare le motion nel tempo evita collisioni di brand.
- **Implicazioni**: motore identico per entrambi; cambiano linguaggio/pricing/copy della vetrina
  (tutor-first). **Mode A INVARIATO**: i tutor lavorano spesso con minori, e Motion 2 lo esige comunque.

## 4. MONETIZZAZIONE
1. Docente vende contenuti/lezioni al SUO prezzo (o gratis); recensioni; la piattaforma trattiene fee.
2. **Piani a potenza**: più paghi → generazione con più compute (modello migliore, più pass di
   verifica, libri più lunghi). Mappa naturale sul costo LLM reale.
3. Tool marketplace: vendita/abbonamento tool di terzi, fee piattaforma.
4. B2B white-label (caso Superprof): motore lezione→grafo→libro via API/MCP — DOPO grafo+verifica (R5).

## 5. ELAB TUTOR — ORDINE A MASSIMA IMPORTANZA
**ELAB Tutor = primo grande TOOL della piattaforma, nella sua forma più completa e perfetta.**
Vincoli già ratificati che RESTANO: repo e brand SEPARATI (ELab ≠ Numeria ≠ MAESTRO), zero codice
ELAB nel core, integrazione SOLO via contratto ToolHost. Percorso:
1. ToolHost spec v0 (in design ora) → contratto manifest+sandbox+API.
2. Primo tool pilota = **breadboard sim** (`~/whiteboard-studio/sim`, skeleton Blockly→IR→interprete→
   wokwi già verificato): è il prototipo del "tool ELAB" e valida il contratto.
3. ELAB-as-tool: la versione estesa/migliore di ELAB vive come tool certificato sulla piattaforma.
   L'harvest MAESTRO→ELAB resta unidirezionale e in sessioni separate.

## 6. RUNTIME AI DEI TOOL — ipotesi Hermes (onestà)
Andrea: "Hermes potrebbe essere l'orchestratore open-source dietro i tool; la gente mette le sue
chiavi API. Da vedere." Stato onesto: l'eval 04/06 ha RIGETTATO Hermes come orchestratore di
SVILUPPO (è un agente alternativo). Il caso **runtime-di-prodotto embedded** è DIVERSO e va valutato
contro alternative (MCP host, plugin web puri, processo locale) — è una delle domande della spec v0
in corso. Verdetto al landing del workflow, non per fede.

## 7. "AL PASSO CON L'AI" (regole operative)
- Riusare repo/standard esistenti, mai da zero (Excalidraw, faster-whisper, wokwi-elements, MCP…).
- Ogni chiamata LLM dietro interfaccia sostituibile; upgrade modello = rigenerazione gratis dei derived.
- Sito **plastico**: si adatta al docente (tema/struttura dal suo StyleProfile — il design pass M1+
  usa i dati che già abbiamo, non un CMS).
- Hermes si auto-migliora: skill-coach fable a ogni finestra quota (LIVE da oggi), retro-review,
  strategos; deep-research browser (Gemini) PRONTO ma **bloccato su login una-tantum di Andrea sul
  Mini** (`bash ~/maestro-tools/deepresearch.sh --login`); Claude-Desktop-interagisce-col-prodotto =
  da sperimentare dopo ToolHost v0.

## 8. ROADMAP UNIFICATA (R = intel 11/06, ratificata)
- **M1 (chiusura)**: M1-4b fix critico → dispense live → blind-test Andrea. R1 badge per-claim. R2 Privacy Pack MePA.
- **M2**: ToolHost v0 + breadboard-tool pilota · R4 journal lavagna↔parlato (zero coperture mondo) · R5 grafo editabile+export · vetrina v0 (profili+scoperta, cloud sottile).
- **M3**: marketplace transazioni+recensioni · piani-a-potenza · ELAB-as-tool completo · MCP white-label B2B.
- Sempre: velocità = moat (Google a 6-18 mesi dalla mossa letale).


## §3-ter — Raffinamenti marketplace (brainstorm Andrea+co-founder 12/06, ratificati)
1. **ELAB = primo plugin del marketplace (flagship + dogfooding).** Lo skeleton `sim/` arch-C
   (Blockly→IR Zod→emettitore/interprete→netlist→wokwi) diventa il primo ToolHost tool reale.
   Se l'SDK non basta a NOI per ELAB, non bastera a nessuno. Ordine permanente Andrea:
   "ELAB come tool vendibile = massima importanza".
2. **Tool comprati = artefatti IMMUTABILI.** Niente modifica post-acquisto, niente fork
   ("always problems" — co-founder). Personalizzazione SOLO via settings esposti dall'autore.
   Coerente by-design con la firma ed25519 (un tool modificato rompe la firma). Versioni nuove
   = solo l'autore.
3. **Recensioni a due pesi.** Docente vota il TOOL (usabilita: e lui che tocca la lavagna);
   studente vota LEZIONE/docente (efficacia). Minori: MAI testo libero pubblico — solo segnali
   aggregati/anonimi (GDPR Mode A).
4. **Suggerimento tool dal grafo (R-item, NON ora).** Il grafo per-docente esiste: centralita
   (betweenness) sui concetti dove lo studente inciampa → suggerisci il tool giusto al momento
   giusto. Da costruire dopo T4.
5. **CRM didattico (fase dedicata, NON ora).** Primitive gia in LessonOS (learning debt,
   next-lesson planner, recap-export M2-7): mancano vista Studio + materiali per-studente.
6. **Pagamenti delle lezioni: FUORI scope.** Zero percentuale, zero tracking pagamenti
   (deciso 12/06: lo strumento non fa l'esattore). Revenue = SaaS + marketplace sui TOOL.
7. **Feature LLM-on-canvas ("bottoncino che disegna dal prompt")**: passa dal gateway
   piani-a-potenza (TOOLHOST-SPEC §piani) — mai gratis, mai senza cap.
