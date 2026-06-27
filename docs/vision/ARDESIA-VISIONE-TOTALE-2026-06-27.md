# ARDESIA — La Visione Totale

> **Documento autoritativo unico.** Riconcilia ~2 settimane di documentazione sparsa (16–27 giugno 2026) in una sola fonte di verità. Quando i documenti divergono si segue il **più recente** e si segnala la contraddizione. Ogni affermazione portante è attribuita al file-sorgente. `[DECISO]` = ratificato; `[APERTO]` = da decidere; `[COSTRUITO]` / `[GREENFIELD]` = stato reale.
>
> **Nota cardine per il lettore:** la tesi-ancora confermata dal proprietario — *"ARDESIA = canvas di appunti per TUTTI, tier base gratuito, gli account docente sbloccano vendita/visibilità/potere"* — è **più ampia** di ciò che i documenti scritti hanno mai messo nero su bianco. I documenti (16–27 giu) sono quasi sempre **docente/tutor-centrici**. Questa divergenza è il singolo nodo più importante che la consolidazione deve ratificare, ed è marcata `[APERTO — ANCORA]` ovunque compaia.

---

## 0. Pitch

**In una frase (tesi-ancora, da ratificare):**
*ARDESIA è il sistema operativo didattico local-first: una lavagna/canvas di appunti infinita per TUTTI — studenti, tutor, docenti, chiunque prenda appunti — gratuita nel tier base, plugin-native, dove materiali, lezioni ed errori sedimentano in un grafo del metodo; gli account docente sbloccano vendita, visibilità e potenza su un marketplace.*

**In un paragrafo:**
ARDESIA non è un'app: è un ambiente di livello OS costruito attorno a una lavagna infinita (canvas) che monta plugin immutabili e firmati come *tile* (`renderEmbeddable()`). Sopra il canvas vivono i **manuali-vivi** con citazione-sulla-lavagna (BoardCitation), un **grafo del metodo** che sedimenta i materiali dell'utente nel tempo, e l'export **student-pack**. Un **Simulation Plugin generico** è il primo grande plugin; **ELAB** è il primo **Pack di contenuti** disciplinare (circuiti/Arduino) che si *appoggia* a quel plugin — ELAB **non è il prodotto e non è il simulatore**. Un **marketplace** serve plugin, pack, manuali, workflow e profili-docente. Principi fondanti: **docente/utente al comando** (l'AI suggerisce, non insegna né corregge in automatico, niente training sui dati), **local-first + privacy by-construction**, conoscenza che cresce orizzontalmente. *(20-ARDESIA-VISIONE-E-BUSINESS-v2.md, PRODUCT-CANON.md, ARCHITECTURE-CANON.md, PROJECT-RECON-ARDESIA-2026-06-25.md)*

> **Pitch attualmente scritto nei canon (più recente, PRODUCT-CANON.md):** *"Ardesia è una lavagna didattica local-first con memoria e marketplace plugin. Materiali, lezioni, errori e contenuti sedimentano nel tempo. I plugin aggiungono strumenti specializzati. Il Simulation Plugin è il primo grande plugin dimostrativo. ELABTutor è il primo Pack disciplinare sopra quel plugin."* — Questo è **docente-centrico** e **non** menziona "per tutti" né "gratis". `[APERTO — ANCORA]`

---

## 1. Cos'è e cosa fa

### 1.1 Identità di prodotto `[DECISO: canvas didattico plugin-native]`
ARDESIA è descritto in modo coerente come un **OS didattico local-first**, non una singola app: *"lavagna + memoria del metodo + contenuti sedimentati + manuali/materiali vivi + workspace docente/tutor/studente + plugin-host + marketplace + export/student-pack + vendibilità + UNLIM"* (PROJECT-RECON-ARDESIA-2026-06-25.md). Il canvas infinito è **reale e costruito** (base Excalidraw: infinite canvas, zoom/pan fluido, freedraw, forme, testo, immagini, LaTeX via MathJax/MathLive, persistenza FSA+localStorage, export `.lesson`) — GOODNOTES-BENCHMARK-ARDESIA-2026-06-25.md.

### 1.2 Utenti `[APERTO — ANCORA: il gap principale]`
I documenti nominano in modo predominante il **DOCENTE/TUTOR** come utente primario; gli studenti compaiono come *destinatari*, non autori:
- v2 (tabella Attori): Docente (cliente SaaS pagante, possiede classe+dati-metodo), Studente (partecipa, *paga il docente non noi*, riceve recap), Minore<14+tutore, Autore-plugin, Admin. *(20-...-v2.md)*
- Spec 34 personas: Persona A = tutor-dogfood (Andrea); Persona B = docente-scuola (Fagherazzi/PNRR). **Nessuna persona-studente.** *(34-ARDESIA-SPEC-CONSOLIDATA.md)*
- L'unico allargamento scritto: *"workspace docente/tutor/studente"* (PROJECT-RECON) e *"mobile = review/student-pack (NON authoring)"* (PRODUCT-CANON), che implica che lo studente **consuma**, non crea.

**Contraddizione con la tesi-ancora:** il "canvas per TUTTI / qualsiasi note-taker" e il "tier base gratuito" **non sono scritti in nessuna spec**. Verificato firsthand: grep su tutto il vault per `per tutti / gratis / free-tier / note-taker / chiunque` non restituisce alcuna affermazione di prodotto in tal senso (gli unici hit sono "memoria-fabbrica cresce per tutti *gli agenti*", contesto-fabbrica). **Questa è precisamente la dispersione che la consolidazione deve risolvere.**

### 1.3 Le tre superfici core del prodotto `[parz. COSTRUITO]`
1. **Canvas/lavagna** — infinita, base Excalidraw, ink/forme/testo/LaTeX, persistenza, export `.lesson`, journal/replay. `[COSTRUITO]`
2. **Manuali-vivi + BoardCitation** — il *manuale-vivo grounded* è un Ardesia-WIN su Goodnotes; la north-star action è *seleziona-citazione → trascina sul canvas come oggetto-board*. **BoardCitation come data-model Core è GREENFIELD** (oggi solo `VolumeCitation.jsx` in ELAB, volumi 1/2/3 hard-coded; `loadFile.ts` dà PDF-su-board via pdf.js ma nessun manual-object). *(GOODNOTES-BENCHMARK, BROWSER-REVERIFY-2026-06-25.md)*
3. **Student-pack export** — route engine `/v1/saved-lessons/{id}/study-pack` **esiste**; v0.1 esporta citazioni grounded; manca `/v1/export` + board/plugin-state nel pack (target v0.2). *(STUDENT-PACK-STATUS-2026-06-26.md)*

### 1.4 La north-star: il loop che nessun concorrente ha `[verde a livello demo]`
> *Apro ARDESIA → vedo manuale-vivo reale → seleziono citazione/grounding → la aggancio alla lavagna (oggetto-board) → monto plugin/simulatore → sbaglio → validator+UNLIM spiegano citando il manuale → correggo → genero student-pack (snapshot+errore+pagina-manuale+esercizio-simile) → riuso/vendo.* *(PROJECT-RECON-ARDESIA-2026-06-25.md)*

BROWSER-REVERIFY-2026-06-25.md conferma la catena **GREEN a livello demo**: manuale rende 30 sezioni, citazione→lavagna funziona, student-pack esporta 2 citazioni grounded, 0 errori console (desktop+iPad). Un verbo `lint`/auto-wiki ("il tuo corso ha N lacune") è la superficie che rende **visibile il moat del grafo**.

> **`[APERTO]` scope della north-star:** è un loop *didattico*, non di presa-appunti generica. Se il prodotto è "per qualsiasi note-taker", serve una variante-note generica che i documenti **non descrivono**.

### 1.5 Principi fondanti `[DECISO]`
- **Docente al comando, no auto-grading:** *"Lo strumento non fa la lezione. Il docente è il protagonista. L'AI suggerisce (un tool, un'analogia, un prerequisito); non spiega al posto suo… Nessun training sui contenuti del docente o dello studente."* (20-...-v2.md). No auto-grading = invariante anti-AI-Act-Annex-III. *(ARDESIA-MAP.md, PRD-ARDESIA-v17-2026-06-26.md)*
- **Local-first + privacy as architecture:** *"Local-first + GDPR Mode A. I dati sensibili non lasciano la macchina/EU. La conformità è una proprietà dell'architettura."* (20-...-v2.md).

---

## 2. Architettura a strati

### 2.1 Il modello canonico a 4 livelli `[DECISO]`
Gerarchia ratificata da Andrea (ardesia-canon-architecture-23jun.md, ARCHITECTURE-CANON.md):

```
ARDESIA Core  (host + Lavagna/canvas + memoria grounded/method-graph + pipeline contenuti + marketplace)
   └─ Plugin   (strumenti riusabili — es. Simulation Plugin generico, UNLIM copilot)
        └─ Pack (contenuto/metodo di una materia — gira DENTRO un Plugin — es. ELABTutor)
             └─ Workflow/Template  (sequenze didattiche vendibili sul marketplace)
```

**Legge di classificazione ("legge dura del progetto"):**
> Capacità universale → **Core**; Strumento riusabile → **Plugin**; Contenuto/metodo di una materia → **Pack** (gira dentro un Plugin); Sequenza didattica vendibile → **Workflow/Template** (marketplace).

Esempi verificati: Lavagna/memoria-studente/marketplace/plugin-signing → Core; Manual Reader + Simulation Plugin → Plugin first-party; UNLIM → Plugin copilot; ELABTutor → Pack; CircuitSolver + esperimenti LED/Arduino → contenuto dentro il Pack.

⚠️ Questa gerarchia è *già il design dichiarato del monorepo* (README verbatim) ma **non esiste ancora come UN contratto Core condiviso**: è Python engine-side (`lessonos`) + TS studio-side (`maestro-studio`) senza layer Core comune. Il primo compito del canon è **progettare** questo confine, non documentarne uno esistente. *(ARCHITECTURE-CANON §0)*

### 2.2 ELAB NON è il prodotto, NON è il simulatore `[DECISO ma VIOLATO nel codice]`
PRODUCT-CANON.md §1: *"ARDESIA ≠ ELABTutor ≠ simulatore."*
- **ARDESIA** = lavagna plugin-native local-first con memoria + marketplace.
- **Simulation Plugin** = strumento potentissimo, *ma plugin* (non Ardesia).
- **ELABTutor** = primo Pack disciplinare (circuiti/Arduino) sopra il Simulation Plugin. *NON il centro.*

L'IP genuina che diventa il **Simulation Plugin**: `CircuitSolver.js` (~2486 LOC, MNA ibrido + path-tracing + nonlineare + validator), WireRenderer, BreadboardHalf, `registry.js` (22 componenti SVG auto-registranti), AVRBridge (avr8js ATmega328p). Il **Pack ELAB** = i DATI oggi fusi nell'app: 88 lesson-paths + volume-references (88/88) + buildSteps + prompt UNLIM + 2 modalità. *(ELAB-AS-PLUGIN-CANON.md, 30-STRATEGY-ELAB-PLUGIN-FACTORY.md)*

⚠️ **Caveat hardware ricorrente:** AVRBridge emula ATmega328p, ma il Nano R4 fisico è Renesas RA4M1 → non presentare il comportamento ATmega come Nano R4.

> **`[APERTO]` genericità del simulatore:** la tesi-ancora dice "simulatore generico perfetto". I documenti aspirano a *"Simulation Plugin = runtime simulazioni generico"* (PROJECT-RECON) ma il motore esistente è il CircuitSolver ELAB **elettronica-specifico**. Generico-vero vs elettronica-prima = irrisolto nel build.

### 2.3 Il meccanismo host `[~90% COSTRUITO]`
L'host (`apps/studio/src/toolhost/`) fornisce `ToolHost.mount(port)`, `CanvasToolMount.tsx`, `ToolFrame.tsx`. I plugin montano come tile via `renderEmbeddable` — confermato wired in maestro-studio (`Room.tsx:805 renderEmbeddable={renderToolEmbed}`; lifecycle iframe→MessageChannel→postHello→tool.ready→LED; 21/21 test green).
- **Manifest** = Zod `strictObject`: id (reverse-DNS), version (semver), capabilities (vocabolario chiuso, deny-by-default), publisher{id,pubkey} (ed25519), pricing, surfaces, privacy, i18n, bundleHash firmato.
- **SDK** = CONTRACT_VERSION 1.0.0: `defineManifest()`, `connectTool()`, surfaces `['board-embed','panel','fullscreen']`.
- **Capability vocabulary** (chiuso): `board.read`, `board.write{scope:'own-embeds'}`, `graph.query`, `graph.proposeClaims`, `storage{quotaMB}`, `llm.generate{maxTokensPerCall}`, `net.fetch{domains[]}`, `ui` — *fs/shell/Node caps deliberatamente non esistono*.
*(ADR-HOST-BOUNDARY-2026-06-27.md, 30-STRATEGY, 40-SES-CAPABILITY-BOUNDARY-DESIGN.md, PLUGIN-MARKETPLACE-CANON.md)*

### 2.4 Il confine di sicurezza CODE: SES Compartment + membrana di capability `[DESIGN, pezzo più difficile]`
Doc 40 progetta il confine in-page: JS-plugin non fidato gira in un **SES (Hardened-JS) Compartment** nel realm principale, parlando SOLO con una host-API attenuata, capability-gated, come Proxy-membrana `harden()`-ata — non accesso diretto al DOM. `lockdown()` gira PRIMA di React (congela i primordials, no prototype-pollution); un Compartment fresco non riceve autorità ambientale (niente window/document/fetch/clock); l'unico endowment è `studio`, una membrana che definisce un metodo solo se `isGranted(caps, cap)`. Falsificabile: un plugin board.read-only ha `board.write` *letteralmente assente* (undefined→TypeError), non solo rifiutato. Due profili: A = Compartment main-realm (solo first-party/vetted); B = Worker Compartment con watchdog terminabile (DEFAULT terze-parti). `ses` è Apache-2.0; **nessun sorgente Penpot MPL-2.0 copiato** (idee, non codice).

### 2.5 Kernel di sicurezza `[COSTRUITO — supera il contratto del vision]`
ed25519 verify install-time sui byte-manifest originali; kill-switch dual locale+remote-signed, **FAIL-CLOSED** su corruzione; capability deny-by-default + guardia escalation; per-tool origin isolation + CSP deny-by-default (`connect-src none`); difesa TOCTOU via re-hash bundle al mount. *(PLUGIN-MARKETPLACE-CANON.md, ADR-HOST-BOUNDARY-2026-06-27.md)*

### 2.6 L'HOST BOUNDARY: come ELAB *si appoggia* al simulatore `[DECISO, NON eseguito]`
ELAB-AS-PLUGIN-CANON §6 — *Confine di decoupling #1 = HOST BOUNDARY*: ELAB diventa un **GUEST** che monta dentro il ToolHost e cede shell/auth/memory/report al Core.
**LA REGOLA:** ELAB possiede SOLO `src/components/simulator/` (CircuitSolver, 22 SVG, AVRBridge — l'unica IP senza equivalente Core). TUTTO IL RESTO (App.jsx/main.jsx, auth/, dashboard/gestionale, unlim/ AI, report/, memory) è **VIETATO** dentro il plugin e va consumato dal Core via contratto ToolHost.
**Fattibilità (30-STRATEGY §2):** estrazione piccola (~4-6 giorni); l'unico cut-point è `services/simulator-api.js` (il simulatore usa solo 3 funzioni: `emitSimulatorEvent` + register/unregister) → uno shim ~20 righe trasforma eventi in postMessage e fa cadere l'intero albero UNLIM/voice/Supabase dal bundle. ~60-70% del debito ELAB è platform-class che il plugin *scrolla via*; ~25-30% (motore simulatore + fedeltà-libro + render-bug) è il moat reale residuo.
**Gate anti-regressione:** lint/CI che FALLISCE il build se `App.jsx/main.jsx`, `components/auth/`, `supabase/functions/` ricompaiono — *"senza quel gate, ogni run della fabbrica re-importa l'intera app standalone."*

### 2.7 Costruito vs greenfield (grounding onesto A–H)
*(ARCHITECTURE-CANON §7, ELAB-AS-PLUGIN-CANON §5)*

| | Componente | Stato |
|---|---|---|
| A | Canon (questi documenti) | **GREENFIELD** |
| B | Plugin host (kernel sicurezza) | **~90% COSTRUITO** — vedi §2.8 sotto su "montato o no" |
| C | Manual Reader (data-model Core) | **GREENFIELD** (solo `loadFile.ts` PDF-board; nessun manual data-model) |
| D | Simulation Plugin (motore) | **COSTRUITO** (CircuitSolver MNA+path-tracing+validator, 22 comp., AVR) → serve decouple+manifest+mount |
| E | ELABTutor Pack (dati) | **COSTRUITO ma FUSO** nell'app standalone; provenance 0/88 → serve extract + provenance-gate |
| F | UNLIM (copilot) | **FRAGILE** (tag-regex `[azione:...]`) → formalizzare come typed-intent |
| G | Student-pack | **PARZIALE** (route study-pack esiste; manca `/v1/export` + board/plugin-state) |
| H | Marketplace | **GREENFIELD** (solo kill-list + sign + local-install) |

Caveat onesti: `CircuitScene provenance{status,checks}` è spec-only in 0/88 esperimenti (la regola "solo scene verificate guidano lezioni reali" **non è costruita**); l'enum `LessonMode` non esiste (solo stringhe ad-hoc `complete/guided/sandbox`); la memoria per-studente persistita richiede **nuova persistenza** (learning-debt calcolato con 0 scritture DB; quiz stateless, nessuna tabella attempts).

### 2.8 ⚠️ CONTRADDIZIONE RISOLTA PER RECENCY — host "montato o no"
- Canon 23 giu (ardesia-canon-architecture-23jun, ARCHITECTURE-CANON, PLUGIN-MARKETPLACE-CANON, PRODUCT-CANON): host *"~90% costruito, 0% montato"* (unico consumatore = demo `srcDoc` che **bypassa la firma**).
- **DOC PIÙ RECENTE — ADR-HOST-BOUNDARY-2026-06-27.md CORREGGE:** *"L'host ESISTE ed è montato [✓] (corregge la precedente affermazione built-not-mounted)"* — `ToolHost.mount` è wired, ma **ELAB è un'app direct-compile che BYPASSA l'host** (il suo `public/manifest.json` è un manifest PWA, non plugin) → nessun confine trust/capability attorno a ELAB a runtime.
- **VERDETTO (preferendo il 27 giu):** l'**host è montato**; **ELAB specificamente non è ancora hosted** (Fase 3, gate-Andrea). Gap #2 (ADR-27): la **Lavagna (canon-CORE) è intrappolata DENTRO il plugin**, accoppiata bidirezionalmente a `simulator/` via 13 import relativi profondi. Migrazione strangler-fig: Fase 0 (gate boundary-check + ratchet) **FATTA 27 giu**; Fasi 1-3 **non eseguite**, Fase 3 = gate-Andrea.

### 2.9 `[APERTO]` — Vocabolario capability non riconciliato
Due forme divergono e non sono riconciliate: la `toolhost-protocol/capabilities.ts` **as-built** (dotted: `board.read`, `graph.query`, `llm.generate{maxTokens}`…) vs MARKETPLACE-PLUGIN-ARCH-v1.md (proposta flat colon-style: `graph:read/write`, `lesson:read/write`, `retrieval:invoke`, `lti:roster:read`…). Quale diventa canonico è irrisolto. **Inoltre:** solo `board.*` e `storage.*` sono *davvero wired*; `graph.*/llm.generate/net.fetch/ui.*` sono dichiarabili/grantabili ma **non routati** → un Pack disciplinare non funziona finché questi canali non sono cablati.

### 2.10 `[APERTO — il #1 gap di formalizzazione]` — manifest `kind`
Il modello a strati **non è esprimibile in codice** perché al manifest manca il campo `kind`: *"tutto è tool."* Da aggiungere: `kind: 'tool'|'pack'|'manual'|'workflow'|'copilot'` + `author` (oggi solo publisher) + `visibility: 'private'|'unlisted'|'public'` + `marketplace?:{pricing,category,tags}`. *"Senza kind la gerarchia del vision NON è esprimibile → è la singola formalizzazione a più alta leva."* Tuttora **non costruito** (riconfermato 26 giu in OPEN-DECISIONS). *(PLUGIN-MARKETPLACE-CANON.md)*

---

## 3. Modello di business + marketplace

### 3.1 Principio di ricavo: ZERO fee sulle lezioni `[DECISO, annulla v1]`
*"ZERO fee sulle lezioni. Il docente tiene il 100% di quanto paga lo studente."* La piattaforma **non è un esattore** sulle lezioni (no "tassa-Superprof"). Lo studente paga il **docente**, non la piattaforma. Annulla esplicitamente le voci v1 RF-J-02 (commissione 15-20%) e RF-L-02 (take-rate). *(20-ARDESIA-VISIONE-E-BUSINESS-v2.md)*

### 3.2 Due flussi di ricavo `[DECISO in principio, NON costruito]`
*"Vendiamo lo strumento, non le lezioni."*
1. **PRIMARIO = abbonamento SaaS al docente ~€15/mese** — sblocca lavagna + AI-metodologica + CRM + recap + installazione plugin. Target validazione iniziale = "10 docenti disposti a pagarlo" (~€150/mese base).
2. **Marketplace revenue-share 70/30** — sui plugin a pagamento l'autore tiene il 70%, la piattaforma 30%; i plugin gratis restano gratis.

Difendibilità = il SaaS lega il docente al **proprio** grafo-del-metodo e ai **propri** plugin (switching-cost cognitivo, non lock-in contrattuale).

### 3.3 Attori a due lati + chi paga chi `[DECISO]`
DOCENTE = cliente SaaS pagante (possiede classe+dati-metodo); STUDENTE = paga il docente (non la piattaforma), riceve recap; MINORE<14+tutore = protezione rinforzata; AUTORE-PLUGIN = pubblica, passa review, riceve 70%, nessun accesso ai dati-lezione (sandbox); ADMIN = gestisce marketplace/kill-switch/review/compliance. Il marketplace elenca **anche** "insegnanti che si offrono" (booking/discovery), aggiungendo un lato teacher-discovery. *(20-...-v2.md, META-PROMPT-ARDESIA-2026-06-25.md)*

### 3.4 Cosa vende il marketplace: combinazioni `[DECISO come tassonomia]`
1. Plugin singolo (Fasori, Bode, MATLAB Runner); 2. **PACK** disciplinare (ELABTutor Circuit Pack, Fisica-1); 3. **Manuale + plugin** (Circuiti Base + Simulation Pack); 4. **Workflow** ("LED Arduino Passo-Passo" = manuale+sim+step+quiz+student-pack-template). La tassonomia **è** l'asset strategico: 7 tipi di plugin pluggabili (ingest-adapter, graph-extractor, retrieval-strategy = moat-as-plugin, lesson-artifact-generator, exporter, whiteboard-tool, LMS/LTI-connector) che trasformano i seam della pipeline (ingest→graph→lesson→artifact→retrieval) in una API pubblica. *(PLUGIN-MARKETPLACE-CANON.md, MARKETPLACE-PLUGIN-ARCH-v1.md)*

### 3.5 Strategia di distribuzione: PIGGYBACK, costruisci solo il pack-hub `[DECISO]`
*"Piggyback, non costruire un app-store."* Per leva: (1) **MCP server SUBITO** (FastMCP su FastAPI esistente; il docente connette ARDESIA dentro Claude/ChatGPT via URL+OAuth); (2) **Moodle Plugin Directory = beachhead reale** (LTI 1.3 = LEVA#1, 8.5-17k docenti IT); (3) **GitHub come registry** di code-plugin (plugin = repo + manifest + release tag); (4) **pack-hub ARDESIA per ULTIMO** = l'unico pezzo da costruire, dove vivono network-effect + lock-in. Monetizzazione: **pack gratis + CC** massimizzano il network-effect; si monetizza l'**HOST** (sub per-docente/scuola) + eventuale cut sui code-plugin premium. *"NON gate-are contenuto docente."* *(MARKETPLACE-PLUGIN-ARCH-v1.md, RESEARCH-SYNTHESIS-23jun.md)*

### 3.6 L'unità vendibile/forkabile: il pack `.ardz` `[DESIGN]`
Zip con spine JSON DTCG-shaped (concepts, edges con justification=`$ref` a citazione, `$extends` per fork deep-merge, license CC-BY-SA, artifacts). Convergenza C4: ciò che **persisti** (lezione+grafo via Turso) **È** ciò che **forki/condividi** (`.ardz`) **È** ciò che **esporti** → progetta il formato UNA volta. Cycle-detection sugli edge obbligatoria (un DAG di prerequisiti non ha cicli). *(MARKETPLACE-PLUGIN-ARCH-v1.md)*

### 3.7 Contesto cliente reale (pilota ELAB)
Il percorso commerciale near-term passa dall'accordo libro/hardware ELAB, **non** ancora da una base SaaS-docente generica. Filiera: Giovanni Fagherazzi (ex-Arduino Global Sales Director), Omaric Elettronica (Strambino, kit fisico ~€75), Davide Fagherazzi (MePA), Kirill Pilipchuk (Arduino), Giuseppe Ferrara (ex-CFO), Andrea Marro (unico dev). Pilota = PNRR, target 30/06. ⚠️ *committenti-dettaglio.md è vecchio ~92 giorni — verificare prezzi/team prima di asserire.* *(committenti-dettaglio.md, 21-ROADMAP-ELAB.md)*

### 3.8 Stato corrente (più recente, 26 giu): marketplace = DEFER esplicito
PRD-v16: *"Marketplace = NON goal-immediato"*; PRIORITY-LIST: 5-10% costruito; OPEN-DECISIONS D6 = DEFER con catena di precondizioni (memory-loop slice → typed plugin → host mount → POI riconsiderare pack-hub), perché *"costruire un marketplace con zero pack e nessun host è esattamente il pattern di bloat che MEMORY segnala ripetutamente."* Oggi: **0 pack, host non-hosted per ELAB, il "70/30" vive solo nel README.** Il modello-ricavo è **ratificato in principio ma non costruito e intenzionalmente posticipato.** *(PRD-ARDESIA-v16-2026-06-26.md, PRIORITY-LIST-2026-06-26.md, OPEN-DECISIONS-2026-06-26.md, PLUGIN-MARKETPLACE-CANON.md)*

---

## 4. Layer conoscenza + moat

### 4.1 Tesi ricostruita: "il grafo È il prodotto" `[DECISO, re-frame]`
Il method-graph è simultaneamente **NAVIGAZIONE** (auto-wiki / backlink bidirezionali: out-edge=Prerequisiti, in-edge=Propedeutico-a), **PEDAGOGIA** (sequencer adattivo), **segnale RETRIEVAL**, e **asset forkabile/vendibile** — *non* primariamente una metrica di retrieval. PRD-v17: *"Il grafo È il prodotto È il substrato; la memoria deve CRESCERE, non ri-derivarsi."* *(PRD-ARDESIA-v17-2026-06-26.md, RESEARCH-SYNTHESIS-23jun.md)*

### 4.2 La realtà onesta: il "+0.33" era un artefatto `[DECISO: VIETATO citarlo]`
Il claim "grafo+PPR = +0.33 recall@10" è stato investigato in modo avversariale e trovato **~78-80% ARTEFATTO**: ~78% da label-injection (la pipeline scriveva `f'{label}. {excerpt}'`, il testo-gold leakava nel retrieved; rimuovendolo il lift crolla a ~+0.073) + gold-bias (gold-set costruito a favore del grafo). Il PPR era marginale (+0.027, CI attraversa 0); il k-hop faceva ~92% del lift reale → *"il moat è l'edge-set, non PageRank."* Il codice del moat (`graph_aware_retrieve`) era **dead-code, 0 callers** nel serving — mai spedito agli utenti. Lift onesto difendibile ~+0.05-0.07, da ri-misurare gold-blind a N≥50. **Dire "+0.33" / "PPR" / "reasoning" è esplicitamente VIETATO.** *(42-MOAT-TECH-RESEARCH.md, MEMORY-ARCHIVE.md)*

### 4.3 Dove è il moat REALE: dato proprietario + compliance `[DECISO]`
Classifica di difendibilità (42-MOAT-TECH-RESEARCH.md):
1. **DATO PROPRIETARIO + network-effect** — corpus del docente + dati uso/mastery catturati dalla lavagna + edge-prerequisito **confermati dal docente**; compounding per-docente.
2. **COMPLIANCE + FIDUCIA** — GDPR-minori + local-first + MePA/PNRR (il moat *dichiarato* di MagicSchool; *"l'asset più sotto-sfruttato di ARDESIA"*).
3. **DISTRIBUZIONE** — la lavagna *È* la superficie di cattura (grafo costruito dal teaching live, gratis, invisibile ai concorrenti).
4. **STILE/METODO** (parz. unproven).
5. **L'ALGORITMO PPR/grafo NON è un moat** — pubblico, MIT/Apache, copiabile.
Verdetto: *"ZERO prodotto AI teacher-facing di successo tratta un grafo didattico per-docente hand-authored come moat."* → re-frame il grafo a feature+data-asset; floor provato; grafo+PPR solo come un retriever d'ensemble per lo slice relazionale.

### 4.4 Architettura dual-memory `[DECISO — Andrea: "fondamentale, devono essere separate"]`
Due sistemi di memoria fisicamente+logicamente distinti, **nessuno store/processo/sync condiviso**:
- **(A) FACTORY-MEMORY** = contesto-build cross-tick, MAI PII: vault markdown = SoT (Syncthing, no git remote) + AgentMemory:3111 (feeder/recall-cache, MacBook localhost-only, NON SoT) + `ops/knowledge/*-STATE.md` SHA-keyed. Può attraversare MacBook↔mini↔GitHub perché non porta dati end-user.
- **(B) PRODUCT-MEMORY** = study-memory per-studente/docente, **PII by-construction, on-device, egress-DENY**: SQLite + markdown L0-L3, recall BM25+embeddings sotto deny stretto.
**Confine duro one-directional-deny:** nessuna PII entra nella factory-memory; la factory può spedire manuale/grafo/schema pubblicati DENTRO il prodotto, ma la memoria per-utente non torna mai indietro.
Regola cardinale: *"Vault-markdown = SoT. Ogni backend di memoria = cache/recall/index, mai SoT. Nessun backend diventa SoT senza audit-egress + policy-PII."* — questa barra ha rifiutato `llm_wiki` (telefona a casa pre-config) e saltato OpenHuman. *(ADR-MEMORY-DUAL-ARCHITECTURE-2026-06-26.md, KNOWLEDGE-FABRIC-2026-06-26.md)*

### 4.5 Manuali-vivi → BoardCitation → student-pack (cluster ad alta coesione)
Community 16 del knowledge-graph (coesione 0.47) lega manuale-vivo + BoardCitation + student-pack + UNLIM alla north-star. Student-pack v0.1 **esiste** e provato localmente (north-star green, 30 sezioni, 0 errori console) ma è un **proof-of-flow**, non prodotto vendibile: mancano snapshot-lavagna reale, esercizio-simile, riferimenti-manuale formattati, stile-docente, export PDF/HTML, personalizzazione per-studente, storia-errori, versione condivisibile. **Non ancora wired alla product-memory** → oggi non personalizza per-studente. *(STUDENT-PACK-STATUS-2026-06-26.md)*

### 4.6 Layer adattivo/mastery: BKT + FSRS + GKT `[DESIGN, feature per-studente più economica]`
pyBKT (MIT, un HMM per concept-node, AUC 0.76-0.83) per mastery; py-fsrs (MIT, DSR, validato su ~727M review Anki) per "quando ri-far emergere il prerequisito Y"; EduKTM/GKT propaga mastery *lungo gli edge* → *"rende il method-graph un attore, non decorazione."* Pattern centrale: frontiera topologica mastery-gated = `{c : m[c]<θ AND tutti i prereq mastered}`, scorata `gap × prereq_strength × (1+out_degree)`. **REJECT** deep knowledge-tracing (DKT/AKT/SAKT) come differenziatore. *(42-MOAT-TECH-RESEARCH.md)*

### 4.7 Retrieval: floor provato vs segnale-grafo `[gate falsificabile]`
Il retrieval **spedisce su un FLOOR ibrido**, non sul grafo: BM25/FTS5 + dense multilingue (BGE-M3 / multilingual-e5) fusi via RRF, re-rank `bge-reranker-v2-m3`, su `sqlite-vec` (KNN esatto = 100% recall a decine-centinaia di vettori, zero infra nuova). Il grafo+PPR è tenuto SOLO come retriever d'ensemble dietro flag, A/B contro il floor sullo slice relazionale/prerequisito. Gate (doc 41): nDCG@10, gold-set **NON-circolare** (label producibili SENZA consultare il grafo depends_on), ladder di baseline (BM25→dense→RRF→+k-hop→+betweenness→+PPR) così il PPR è giudicato vs ibrido E vs k-hop, test paired-permutation + bootstrap CI, N≥50 (XFAIL sotto). **KEEP grafo-as-retrieval SOLO se PPR > ibrido AND > k-hop con CI esclude 0; altrimenti demote a feature di prodotto.** *(41-MOAT-RETRIEVAL-EVAL-DESIGN.md, 42-MOAT-TECH-RESEARCH.md)*

### 4.8 Costruzione del grafo = il vero moat-build `[DESIGN]`
Il link debole misurato è l'**edge-prerequisito** (relation recognition 2.37/3 vs entity 2.92/3). Build difendibile: estrazione schema-constrained (instructor/outlines — schema fisso stretto `Concept / prerequisite-of / taught-in-lesson / part-of` = vantaggio naturale) → fusione globale Graphusion-style → verifica GraphJudge → **DOCENTE-CONFERMA-EDGE** nella UI lavagna ("ML propone, umano dispone"). ⚠️ Trap: Graphiti non supporta SQLite → roll colonne bi-temporali (`t_valid`, `t_invalid`) sul SQLite esistente; evitare Neo4j (GPLv3) e FalkorDB (SSPL) per MePA/PNRR.

---

## 5. Modelli / infra / privacy

### 5.1 La spina dorsale: FABBRICA ≠ PRODOTTO `[DECISO]`
Una forcella strutturale ripetuta ovunque: **piano FABBRICA** (costruisce ARDESIA, nessuna PII end-user, cloud permesso) vs **piano PRODOTTO/dispositivo** (serve studenti/docenti, PII by-construction, local-first + egress-denied). Frame a 3 livelli mai da confondere (ARDESIA-MODEL-ARCHITECTURE-FINAL-2026-06-27.md): (1) engine+modello-locale, (2) router, (3) app/persona — con **UNLIM (tutor ELAB) demoto a plugin secondario, NON il prodotto.** Criterio Andrea: qualità → beneficio → minimo debito.

### 5.2 Modelli FABBRICA `[DECISO]`
- **Builder A1/A2 = Claude Opus** (`claude-opus-4-8`), apex code-quality, non degradare. Topologia **forzata**: Anthropic ha bloccato il proxy-abbonamento (4 apr 2026) → `claude -p` resta **driver top-level** e chiama GIÙ in `litellm:4000`. *"OpenRouter è un provider, non un router."* litellm v1.89.1 = SAFE.
- **Finder locale (PIÙ RECENTE, ADR-MODEL-RETHINK 27 giu 15:48):** `mlx-community/Qwen3-14B-4bit` (7.8GB) via `mlx_lm.server` su 127.0.0.1:8088, aggiunto a litellm come `local-finder` con fallback LOCAL-FIRST. Provato firsthand: Qwen3-14B emette tool-call IT pulito; deepseek/kimi/glm su litellm tornano 402 → il finder locale è l'unico fix. **gpt-oss-20b REJECTED come finder** (tool-calling rotto sul harmony server, `<|channel|>` leak). Fallback RAM: Qwen3-8B-4bit se collisione sotto il ceiling 13.3GB.
- **Vision ingest:** VLM via OpenRouter (`factory-vision`), non VLM locale; documenti-libro 813 volumi → **MinerU** su mini-CPU (job offline).

### 5.3 Modello PRODOTTO/dispositivo `[DECISO, con flip-flop risolto per recency]`
Gira **SUL DISPOSITIVO** (iPad/PC/LIM), non sul mini. PIÙ RECENTE (ADR-MODEL-RETHINK 27 giu 15:48): dual via registry per-piattaforma.
- **Ship-OGGI = Qwen3.5-4B (mlx-vlm)**, testo+vision firsthand-green.
- **Target architetturale = Gemma 4 serie-E** (E2B default / E4B su ≥6GB) — scelto per **audio nativo senza layer ASR** (decisivo per la domanda-vocale di ARDESIA), 128K ctx, matrice-runtime ampia.

> ⚠️ CONTRADDIZIONE same-day risolta per recency: ARDESIA-MODEL-ARCHITECTURE-FINAL (27 giu 03:19) sceglieva `gemma-3n-E4B` (perché gemma-4 4bit "NON CARICA" in mlx_vlm 0.6.3); ADR-MODEL-RETHINK (15:48) **supera**: target Gemma-4, ship Qwen3.5-4B, gemma-3n "una generazione indietro". `[APERTO]`: il loader MLX di gemma-4 è già fixato? FINAL dice di no → il target potrebbe non essere deployabile *oggi*.

### 5.4 L'architettura forzata: floor locale piccolo + routing cloud `[DECISO]`
Finding onesto (ADR-MODEL-STRATEGY 26 giu): Qwen3.5-4B è buon **floor grounded** (RAG elettronica ELAB) ma **NON è il cervello generale multi-materia** (fallisce su breadth fattuale, math multi-step, qualità IT-nativa aperta; le shortlist IT 2026 partono da 8B). macOS dà ~8-9GB pratici sul mini 16GB; nessun modello ~8GB è simultaneamente general-good E veloce. → *"Il router è il cervello, non un modello locale più grande."* ELAB-tutor resta ok sul 4B (grounded stretto).

### 5.5 Matrice runtime per-dispositivo `[DECISO]`
mini/PC = **MLX** (preferito a Ollama, che su 16GB ricade su llama.cpp); iPad = **MLX-Swift** embedded primario (Qwen3.5-2B-4bit; 4B solo su iPad M-class), AFM (Apple Foundation Models) EU-dark sotto DMA → opportunistico mai critical-path; LIM/lavagna = **LiteRT-LM** (Android/Windows), WebLLM/WebGPU = ultima-spiaggia kiosk. ⚠️ Crack noto: LiteRT non ha runtime universale Apple-silicon → su iPad/Mac il path è MLX. *(ADR-MODEL-STRATEGY-2026-06-26.md, ADR-MODEL-RETHINK)*

### 5.6 nanobot = router inbound key-swap (piano prodotto) `[DECISO + LIVE sul mini]`
*"ARDESIA USA un provider"* = nanobot: router multi-provider OpenAI-compat (`AI_PROVIDER{n}/AI_API_KEY{n}/AI_BASE_URL{n}`) con gating GDPR-EU + racing + quality-scoring. Aggiungere/swappare provider = config env, **ZERO codice**. `claude -p` NON passa per nanobot (è fabbrica/litellm). nanobot DEVE girare sul mini per il prodotto (loopback al tutor locale sigillato).

### 5.7 UN solo MCP server = interop outbound `[SPEC, non costruito]`
*"Gli assistenti USANO ARDESIA"* = UN server Streamable-HTTP MCP (FastMCP, singolo `/mcp`), tool definiti una volta con outputSchema (`ardesia.search_concept`, `get_method_graph`, `build_lesson`, `lint_course`, `recall`) che chiamano GIÙ in nanobot + lessonos. Claude = MCP nativo (più pulito); ChatGPT = Apps SDK/connectors, stessa MCP ma auth più severa (CIMD/private_key_jwt + review = processo); Gemini = nativo su API/CLI/Enterprise, **app-consumer Gemini = unica vera lacuna** → target API/Enterprise. *(ARDESIA-MODEL-ARCHITECTURE-FINAL, ADR-MODEL-RETHINK)*

### 5.8 OAuth = COMPRA gestito, mai costruire `[DECISO]`
OAuth per l'MCP è obbligatorio (spec MCP 2025-06-18: OAuth2.1 + PKCE/S256 + RFC 9728/8414/8707; ChatGPT e directory Claude lo **impongono**) ma usa un Authorization-Server gestito (WorkOS AuthKit top-pick / Stytch / Auth0 / Cloudflare workers-oauth-provider). *"Diventare il proprio Authorization-Server è il debt-trap #1."*

### 5.9 Egress sandbox = il controllo privacy reale e testato `[COSTRUITO, A2-PASS]`
ADR-EGRESS-SANDBOX-2026-06-25 (Accepted, A2-verificato) sotto `tools/sandbox/`: `network-deny.sb` (seatbelt, deny totale incl. loopback = profilo-prova), `network-localonly.sb` (deny tutto, riapre solo localhost:* = profilo-run che soddisfa la barra-privacy), `egress-verify.sh` (selftest|run|sniff con controllo positivo). Tool = `sandbox-exec`. **A2 PASS firsthand:** esterno 1.1.1.1 BLOCCATO, loopback 127.0.0.1:3111 RAGGIUNGIBILE. ⚠️ **LIMITE CRITICO:** `sandbox-exec` è **macOS-only** → NON trasferisce a iPadOS/Android; serve enforcement per-piattaforma (NEFilter su iPad MDM-supervised) — *"questo è il gate, non una nota a piè."*

### 5.10 PrivacyRouter — enforcement fail-closed PII-minori `[DESIGN]`
35-PLAN-ROUTER-PRIVACY-v1.md wrappa `lessonos/llm/router.py`: ogni generazione dichiara una DataClass (`MINOR_PII`/`TEACHER_CORPUS`/`MINOR_QUALITY`). `minor_pii` + provider non-locale → override a locale, OPPURE solleva `PrivacyViolation` se nessun provider locale è registrato (**FAIL-CLOSED: nessun byte di minore raggiunge il cloud**). Emette `AuditRecord` (solo metadati di routing, mai prompt/contenuto) su sink JSONL append-only.

### 5.11 Image-egress = LOCAL-ONLY v1, base legale corretta `[DECISO]`
ADR-MODEL-STRATEGY D4: image-egress = local-only v1, **NO broker cloud-vision**. L'unica giustificazione per un broker (accuratezza documenti person-free) è chiusa eseguendo Qwen3.5/Qwen3-VL-8B localmente (≈/supera Gemini-2.5-Pro su vision, 2026). Keep: sandbox deny-default, nanobot come unico chokepoint, Apple-Vision detectors deterministici (solo presenza, fail-closed, MAI affect/emotion → AI-Act Art.5(1)(f)). **Base legale corretta:** default-locale = GDPR **data-minimisation (Art.5(1)(c))** + minori + consenso-scuola fragile, NON un blanket emotion-ban (che morde solo se *costruisci* emotion-inference). No auto-grading = invariante docente-al-comando.

### 5.12 Headroom token-compression `[READY]`
headroom-ai==0.27.0 (Apache-2.0): prendi la **vittoria INPUT lossless** ampiamente; **NEGA lo shaper OUTPUT** su ogni superficie il cui output è l'evidenza (un verifier terso che smette di citare served-SHA/gate-delta = rot di verifica silente). A1/A2 Opus = input ON ma `--mode cache` + allowlist no-compress per SHA/gate/mutation-kill + shaper HARD-OFF; Hermes finders = input + shaper ON. Host proxy sul MINI (M4, pytorch_mps), NON sul MacBook 8GB. Kill: `unset ANTHROPIC_BASE_URL`. *(HEADROOM-ROLLOUT-2026-06-27.md)*

### 5.13 ds4 / DeepSeek-V4 / Mac Studio `[DEFER]`
antirez/ds4 gira solo DeepSeek-V4: WATCH/DEFER (sul mini 16GB solo SSD-stream, troppo lento). Keep DeepSeek-V4 **cloud** dietro nanobot/litellm (V4-Pro coding hard, V4-Flash finders) via endpoint Western-hosted per source ELAB sensibile. Trigger revisit (TUTTI e tre): M5 Ultra ≥256GB ≤~$8k AND loader V4 stabile non-fork AND spesa V4 sostenuta ~$300-400/mese.

---

## 6. Stato reale onesto + gap

**LIVE / COSTRUITO (verificato firsthand sul mini, 27 giu):**
- Canvas infinito (base Excalidraw): ink/forme/testo/LaTeX/persistenza/export `.lesson`. *(GOODNOTES-BENCHMARK)*
- Plugin-host kernel sicurezza (~90%, ed25519/kill-switch/CSP/TOCTOU); **host montato**, ToolHost.mount wired. *(ADR-HOST-BOUNDARY-27)*
- Motore Simulation Plugin (CircuitSolver MNA+path-tracing, 22 SVG, AVRBridge). `[ma FUSO in ELAB]`
- North-star loop **green a livello demo** (manuale 30 sezioni → citazione→lavagna → student-pack v0.1, 0 errori console, desktop+iPad). *(BROWSER-REVERIFY-25)*
- Runtime prodotto: Qwen3.5-4B-MLX via `mlx_vlm.server` su 127.0.0.1:8081, ~38 tok/s / 3.6GB, IT testo+vision; launchd `com.ardesia.tutor` (sigillato sotto `network-localonly.sb`, KeepAlive provato) + `com.ardesia.nanobot` :8090 → `/chat` ritorna risposta-tutor IT fully-local. *(ADR-MODEL-STRATEGY EXECUTION)*
- Egress sandbox A2-PASS; headroom installato+boot-verified.
- Knowledge-fabric ~55% (grafo costruito 476 nodi/792 edge, MCP, copiato sul mini, ingerito in AgentMemory).

**GAP / NON COSTRUITO:**
- ELAB NON estratto: `plugins/elab-tutor` = **intera app standalone** (App.jsx/auth/13 Edge-fn/report/lavagna; package ancora `elab-builder`). Lavagna intrappolata dentro il plugin (Gap #2). Estrazione Fasi 1-3 non eseguite (Fase 3 = gate-Andrea).
- Manifest `kind` taxonomy: non esiste in codice (#1 gap di leva).
- Capability `graph.*/llm.generate/net.fetch` non routate (solo board/storage wired).
- Marketplace: greenfield (0 pack, "70/30 vive solo nel README"), DEFER esplicito.
- BoardCitation data-model Core, Manual Reader Core, LessonMode enum, provenance CircuitScene (0/88): greenfield/spec-only.
- Student-pack: proof-of-flow, non personalizzato per-studente (non wired a product-memory).
- Product-memory **BLOCCATA**: Ollama assente sul mini → TencentDB/distill sandbox-only, grafo AgentMemory vuoto (distill colpisce OpenRouter-402).
- Latenza tutor ~35s prefill-dominata dall'enorme system-prompt UNLIM (lever: prompt-cache/trim/route trivial a 2B).
- MCP server: interamente spec (v0 = step futuro).
- Recall del grafo debole/unproven (floor recall@10 ~0.21 CI[0.118,0.303]); "+0.33"/"recall=0.23" VIETATI.
- `galileo-brain` router vuole Ollama (assente → degrada); fix nanobot timeout UNCOMMITTED su disco.

---

## 7. Roadmap di spedizione per stage (una cosa per volta)

> Ordinata per leva di valore e per dipendenza, coerente con la disciplina anti-bloat di MEMORY ("non costruire marketplace con 0 pack e nessun host").

- **Stage 1 — Canvas appunti (GIÀ SEMINATO).** Solidificare la lavagna come prodotto-base usabile: scrittura (gap P0 vs Goodnotes: pressure/tilt Apple Pencil, stroke-eraser, grid/template, PDF-import+annotation), persistenza, export. *Qui va ratificata la tesi-ancora "per tutti / tier gratuito"* (vedi §8). *(GOODNOTES-BENCHMARK)*
- **Stage 2 — Simulatore come plugin.** Eseguire l'HOST-BOUNDARY: estrarre `simulator/` da ELAB, esporre `renderEmbeddable()` singolo (task MOUNT-CANVAS), shim `simulator-api.js`, lint-gate anti-reimport, manifest con `kind`. Montare ELAB come tool hosted (Fase 3, gate-Andrea). *(ELAB-AS-PLUGIN-CANON, ADR-HOST-BOUNDARY)*
- **Stage 3 — ELAB-content-pack.** ELAB come primo Pack disciplinare reale sopra il simulatore (88 lesson-paths + provenance-gate), dogfood dell'SDK ("se l'SDK non impacchetta ELAB, non impacchetta nessuno"). Pilota PNRR + filiera Omaric/Fagherazzi.
- **Stage 4 — Account + memoria.** Sbloccare product-memory (fix Ollama sul mini → distill al local-finder), student-pack personalizzato per-studente, PrivacyRouter fail-closed, account docente (vendita/visibilità/potenza). Wire capability non-board (`graph.query`, `llm.generate`).
- **Stage 5 — Marketplace.** Pack-hub `.ardz` per ULTIMO (piggyback MCP/Moodle-LTI/GitHub), pack gratis CC, monetizzazione host + cut 70/30 sui premium. Precondizione OPEN-DECISIONS D6: memory-loop slice → typed plugin → host mount → POI pack-hub.

Trasversale: MCP server v0 (5 tool dietro OAuth gestito), misura moat gold-blind N≥50, headroom go-gate (served-SHA passthrough + gate-parity).

---

## 8. Decisioni aperte / contraddizioni da risolvere

**Risolte per recency (segnalate, non da ri-decidere):**
- **Host montato-o-no** → ADR-HOST-BOUNDARY-27 vince: host **montato**; ELAB non ancora hosted.
- **Modello finder fabbrica** → ADR-MODEL-RETHINK-27 (15:48) vince: **Qwen3-14B**, gpt-oss-20b reject-as-finder.
- **Default device** → ADR-MODEL-RETHINK-27 vince: ship **Qwen3.5-4B**, target Gemma-4 (gemma-3n demoto).
- **Retrieval moat "+0.33"** → debunked, VIETATO; ship floor ibrido, grafo = feature/data-asset.

**Aperte / da ratificare (azione richiesta dal proprietario):**

1. **`[ANCORA — il più grande]` Audience-breadth.** Ogni doc 16-27 giu è docente/tutor-centrico. *"Canvas per TUTTI / qualsiasi note-taker"* compare solo come un *"workspace docente/tutor/studente"* (PROJECT-RECON) e *"mobile review (NON authoring)"* (PRODUCT-CANON). **L'identità "per tutti" NON è scritta in nessuna spec.** Da ratificare esplicitamente.
2. **`[ANCORA]` Tier base gratuito.** Assente dai documenti. Il modello v2 è SaaS-docente-pagante (~€15/mese) dal giorno 1 + 70/30; gli unici "free" sono "pack gratis monetizzano l'host" (tattica) e "modelli locali gratis" (proprietà di costo). **Un tier consumer gratuito è una decisione NON documentata.**
3. **`[ANCORA]` Tutor-only vs tutti (tensione strategica).** Spec 32/34 restringono deliberatamente a "tutor self-serve Superprof-like, founder-executable, zero vendita umana" (scelta anti-scope-creep). Al 26-27 giu (PRD-v16/v17) il framing è ancora prodotto = docente/tutor + iPad/LIM, **non** un'app note-taking di massa → il pivot "per tutti" post-data o sta fuori dal corpus scritto.
4. **`[ANCORA]` Pitch non congelato.** Nessuna frase-pitch ratificata allineata alla tesi-everyone-gratis esiste nei documenti.
5. **Pricing non ri-ratificato di recente.** Unici numeri concreti: ~€15/mese SaaS (v2, 18 giu) e kit fisico ELAB ~€75 (committenti, ~92 giorni, stale). Nessun doc 23-27 giu li ripete/rivede. 70/30 "vive solo nel README".
6. **Unità di pricing.** v2 = per-docente €15/mese; sintesi 23 giu = "monetizza l'HOST (sub per-docente/scuola)" → individuale vs scuola/istituzionale irrisolto.
7. **Lato teacher-discovery.** META-PROMPT 25 giu reintroduce un lato Superprof-like (booking/ricerca-docente) mantenendo 0% sulle lezioni; se/come monetizzarlo non è specificato.
8. **`[CONTRADDIZIONE DECISA-MA-VIOLATA]` ELAB dentro il tree.** Canon decide ELAB = Pack che si appoggia al simulatore; il codice ha `plugins/elab-tutor` = intera app standalone. Fix (HOST-BOUNDARY + lint-gate) deciso, **non eseguito**.
9. **`[APERTO]` Genericità simulatore.** "Generico perfetto" (ancora) vs CircuitSolver elettronica-specifico (build). Irrisolto.
10. **`[APERTO]` Vocabolario capability.** dotted as-built (`capabilities.ts`) vs colon-style proposto (MARKETPLACE-PLUGIN-ARCH). Non riconciliato.
11. **`[APERTO]` Manifest `kind`.** Non esiste in codice; serve per esprimere la gerarchia. Schema proposto (kind+author+visibility+marketplace+network.allow[]+minHost, Zod `.strict()`) non costruito.
12. **`[APERTO]` Tensione timing GDPR.** Direttiva 20 giu deprioritizza GDPR/minori per la FABBRICA "fino a nuovo ordine" (rimosso INGEST-PII-GUARD); ma 35-PLAN-ROUTER-PRIVACY costruisce un PrivacyRouter in `lessonos` (repo-fabbrica) e gli ADR 26-27 giu rendono la privacy strutturale. Si riconcilia in gran parte sulla forcella fabbrica-vs-prodotto (privacy = proprietà-prodotto), ma se il build del PrivacyRouter lato-lessonos sia *autorizzato ora* o ancora *on-hold* dipende dall'esistenza di un "nuovo ordine" che superi il 20 giu. **Da chiarire.**
13. **`[APERTO]` Memory engine prodotto.** Tencent ADOTTATO (25-26 giu, con numeri recall + zero-egress provato) vs Tencent "NO-now" (27 giu RETHINK, debito net-negativo, "fixa AgentMemory invece"). Possibile talking-past: ADOPT era per il PRODUCT on-device engine (light-tier iPad Swift); RETHINK discute il NON adottare Tencent nella FABBRICA. **Quale backend è canonico per il piano-prodotto va confermato.**
14. **`[APERTO]` È il grafo un moat di retrieval, anche solo sullo slice prerequisito?** L'unica cella non-confutata (doc 41/42, "under-studied, not disproven"). Richiede gold-set non-circolare 50-100 query. Prior onesto: lift reale-ma-modesto (~+0.05-0.07) o falsificazione onesta. **Non ancora misurato gold-blind a N≥50.**

---

*Fine. Questo documento è la fonte di verità unica al 27 giugno 2026. Aggiornare via recency-wins: ogni nuovo ADR datato che contraddica una sezione supera la sezione, e la contraddizione va registrata qui in §8.*
---

## §6-bis — STATO REALE (firsthand, COV-AUDIT 27jun — la lane dedicata è fallita su schema, integro io)
- **Fabbrica VIVA** (187 commit/24h, gate 4010 test veri, builder claude-opus-4-8) **ma prodotto FACCIATA ~10-15%**: served :8200 frozen (output=dead-code utente), web prod 4 segment vs 1224, moat method-graph wired-ma-inerte (48 edge in 1 lezione) + lift mai misurato, AgentMemory grafo 43n/0e, **535 test ma 0 signal** (deps assenti), **0 spedito a un utente reale.**
- **Pezzi REALI costruiti**: engine lessonos (4010 test), plugin-host toolhost (production-grade, ~90%, NON montato), lavagna 11 strumenti (intrappolata in elab-tutor), boundary-gate (ADR-HOST-BOUNDARY 27jun, branch boundary/host-gate@0892780a, lavagna↔simulator baseline 8).
- **Pattern-fallimento ricorrente** (auto-flaggato da settimane): analisi/audit/churn > spedizione. ~51% commit = bookkeeping.
- **STAGE-1 seminato OGGI**: `~/VOLUME 3/ardesia-canvas/index.html` — canvas appunti reale standalone (penna/evidenziatore/gomma/testo/zoom/pan/save/export PNG), gira nel browser, board=artefatto-JSON (seme-marketplace). NON ancora verificata in preview né deployata.
- Incidente 27jun: finder-locale-8B ha wedged il mini (OOM crash-loop) → rebootato, finder disabilitato, config rollbackata. Lezione: niente daemon-pesante-permanente su 16GB.
- Dettaglio completo: `session-logs/COV-AUDIT-FULLSYSTEM-2026-06-27.md`.

## §9 — LA DECISIONE #1 DA RATIFICARE (la più importante)
**Pubblico-target + tier-gratuito.** I documenti dicono *teacher-SaaS-a-pagamento* (Superprof-like, zero-vendite-umane, €15/mese). La tua ancora di stasera dice *canvas-per-TUTTI-gratis-base, docente-tier-sblocca-vendita/visibilità/potenza*. **Sono strategie diverse** (chi paga, north-star, GTM). Finché non ratifichi questa, lo stage-1 (canvas) è giusto per ENTRAMBE, ma stage-2+ divergono. → **decidi: TUTTI-freemium vs DOCENTE-SaaS.**
