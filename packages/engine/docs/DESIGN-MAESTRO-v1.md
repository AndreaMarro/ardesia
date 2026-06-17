# DESIGN-MAESTRO-v1 — sistema di design "carta & inchiostro" (12/06/2026)
Fonte: 19 proposte (UX/VISUAL/PLASTICITY/INTEGRATION) × 2 giudici (docente 55enne Teoria dei Segnali + brand judge). Sopravvive solo chi passa entrambi, coi fix applicati. Repo: `/Users/andreamarro/whiteboard-studio/studio`.

## 1. PRINCIPI
1. **Carta & inchiostro**: superfici #faf9f6/#fffefb, testo #14130f, serif Iowan solo per brand/titoli-dialogo, zero webfont, zero gradienti, zero emoji-icone.
2. **Un accento solo**: blu #1763ff. Il verde è RISERVATO a fiducia/verificato (#1a7f37), il rosso #cf222e SOLO a registrazione audio; mai CTA verdi, mai due accenti.
3. **Fiducia visibile (GDPR)**: lo stato registrazione audio è strutturale (filo rosso + tab ● REC), lo stato dei dati è onesto ("solo questo browser" vs "la tua cartella"); lessico: "registrare" = SOLO audio, lo scritto si "salva".
4. **Plasticità elegante**: il tema per-docente deriva da StyleProfile via 11 token --m-* con isteresi, OPT-IN esplicito, mai mid-lesson, mai sui semafori; il punto blu del wordmark non si ritema MAI.
5. **Zero carico in-lezione**: ogni mossa toglie o automatizza (UI italiana, footgun Excalidraw spenti, icona sempre con etichetta, niente bottoni senza stanza dietro).

## 2. DESIGN TOKENS DEFINITIVI (`src/tokens.css`, importato in cima a `index.css`)
```css
:root {
  /* CARTA */
  --m-paper:#faf9f6; --m-paper-veil:rgba(250,249,246,.92); --m-canvas:#fffefb;
  /* INCHIOSTRO */
  --m-ink:#14130f; --m-ink-2:#3a382f; --m-ink-3:#6d6a61; --m-ink-4:#8a877e;
  --m-line:rgba(20,20,18,.08); --m-line-2:rgba(20,20,18,.14); --m-fill:rgba(20,20,18,.05);
  /* BLU BRAND (FISSO: wordmark/punto blu, mai plastico) */
  --m-blue:#1763ff; --m-blue-down:#0e4fd6; --m-blue-deep:#0a3da6;
  --m-blue-off:#9db9f5; --m-blue-wash:rgba(23,99,255,.06); --m-blue-light:rgba(23,99,255,.12);
  /* TOKEN PLASTICI (gli UNICI 11 che PL-3 può riscrivere; default = neutro odierno) */
  --m-accent:var(--m-blue); --m-accent-down:var(--m-blue-down); --m-accent-deep:var(--m-blue-deep);
  --m-accent-off:var(--m-blue-off); --m-accent-wash:var(--m-blue-wash); --m-accent-light:var(--m-blue-light);
  --m-density:1.00; --m-track:2.2px; --m-heading-font:var(--m-font-ui);
  --m-rule-weight:1px; --m-h-scale:1.00;
  /* SEMAFORI (MAI plastici, MAI ritematizzati) */
  --m-rec:#cf222e; --m-rec-wash:rgba(207,34,46,.07);
  --m-verified:#1a7f37; --m-verified-wash:rgba(26,127,55,.08);
  --m-warn:#9a6700; --m-error:#b42318;
  /* TIPOGRAFIA (zero webfont: local-first) */
  --m-font-display:'Iowan Old Style',Palatino,Georgia,serif;
  --m-font-ui:-apple-system,system-ui,'Segoe UI',sans-serif;
  --m-font-mono:ui-monospace,'SF Mono',Menlo,monospace;
  --m-fs-2xs:11px; --m-fs-xs:12px; --m-fs-sm:12.5px; --m-fs-md:13px;
  --m-fs-lg:15px; --m-fs-xl:19px; --m-fs-2xl:28px;
  /* SPAZIO base-4 / RAGGI / OMBRE (solo 2) / MOTION */
  --m-sp-1:4px; --m-sp-2:8px; --m-sp-3:12px; --m-sp-4:16px; --m-sp-5:24px; --m-sp-6:32px;
  --m-r-pill:999px; --m-r-card:12px; --m-r-field:8px;
  --m-shadow-card:0 6px 24px rgba(20,20,18,.16); --m-shadow-pop:0 2px 8px rgba(20,20,18,.10);
  --m-t-fast:120ms; --m-t-gentle:200ms; --m-ease:cubic-bezier(.2,0,0,1);
}
```
REGOLE: si animano SOLO color/background/border-color/opacity/transform; `@media (prefers-reduced-motion:reduce){.st-recdot{animation:none}}`. Cambi visivi intenzionali vs oggi: LED salvato #2da44e→#1a7f37, pill rec #b42318→#cf222e (rec ≠ errore). Hex ammessi SOLO in :root token e scope `.excalidraw` (enforcement: `design-tokens.test.ts`).

Scope Excalidraw (variabili verificate in dist 0.18.1, no fork):
```css
.excalidraw {
  --color-primary:var(--m-accent); --color-primary-darker:var(--m-accent-down);
  --color-primary-darkest:var(--m-accent-deep); --color-primary-hover:var(--m-accent-down);
  --color-primary-light:var(--m-accent-light);
  --island-bg-color:rgba(250,249,246,.96); --color-surface-lowest:#faf9f6;
  --color-surface-low:#f1efe9; --color-surface-mid:#e9e7df; --color-surface-high:#ffffff;
  --ui-font:var(--m-font-ui); --border-radius-lg:var(--m-r-card); --border-radius-md:var(--m-r-field);
}
.excalidraw .default-sidebar-trigger { display:none; } /* Library nascosta in v1 */
```

## 3. MOSSE SOPRAVVISSUTE (coi fix dei giudici incorporati)
### A. JOURNEY (UX Architect)
- **Welcome MAESTRO + UI italiana**: `<WelcomeScreen>` ufficiale, wordmark serif + punto blu, heading "La lavagna che ricorda la tua lezione", 3 righe guida, hint "Scegli una penna e inizia"; `langCode="it-IT"`. Fix: stili da token (no hex/px inline), langCode dichiarato in UN solo posto (excalidrawConfig.ts); il divieto di WelcomeScreen della proposta INTEGRATION decade. ACCETTAZIONE: getByText(/lavagna che ricorda/i); zero testo "Excalidraw"; tooltip toolbar italiani; gate verde.
- **Stato onesto dei dati + connectFolder**: `WorkspaceStore.connectFolder()` (init FSA dentro click — fixa il bug user-activation), migrazione scena, swap driver. Fix lessico (giudice-docente): chip "appunti salvati nella lezione" — MAI "registrata" per lo scritto; UN solo indicatore dati fuso con la barra cache: "salvato sul computer" (fsa, led --m-verified) / "solo in questo browser — scegli cartella…" (localStorage); mai la parola "workspace"; tooltip Room.tsx:303 condizionale al mode; niente glifo '✎'. ACCETTAZIONE: connectFolder → mode 'fsa' + scena migrata; render localStorage mostra "solo in questo browser" + bottone; click apre directory picker reale.
- **Recap post-export + drawer materiali**: LessonRecap (numeri VERI dal journal: element.add, math.insert, durata) su pattern `.st-card`; copy fix: "La lezione è salvata sul tuo computer. Riepilogo e dispensa compariranno qui in materiali quando saranno pronti" (NO "motore", NO ".lesson"); MaterialsPanel legge `derived/`; drop-zone .lesson nascosta dietro voce discreta; "mostra il file" solo se fa qualcosa di visibile. ACCETTAZIONE: fixture 3 add/1 math/300000ms → "3 tratti, 1 formula, 5 min"; empty-state senza file; drawer = stesso pattern della Sidebar strumenti (una sola grammatica drawer-destro).
- **Vista studente**: `?vista=studente` (shareUrl Room.tsx:276); niente JournalRecorder/AudioRecorder, viewModeEnabled, header = wordmark + chip + "stai guardando la lavagna". Fix dignità-docente: se loadScene null → mostra ultima lavagna salvata se esiste + riga neutra "Segui la diretta su Meet" — MAI ammissioni di versione davanti agli studenti; finché il sync non esiste valutare hide della pill invita. Tooltip invita: "Copia il link per lo studente (vista sola-lettura)". ACCETTAZIONE: query=studente → zero bottoni docente, recorder undefined.
- **Lezioni con un nome**: `raw/<room>/meta.json {v:1,name,createdAt}`; rinomina inline sul chip CON matitina/affordance hover (il chip muto non si scopre); nome nell'header e nel filename export `lezione-<slug>.lesson`; drawer "lezioni" (listRooms, mtime desc, corrente evidenziata --m-accent, pattern .st-card); PRIMA del reload di navigazione: FLUSH del persist debounce 700ms (Room.tsx:168) — zero tratti persi. Su iPad si nasconde solo l'id mono, MAI il nome. ACCETTAZIONE: meta scritto; listRooms 2 fixture con fallback-id; filename col nome; flush testato.

### B. VISIVO (Visual Designer)
- **tokens.css + bonifica template Vite**: blocco §2; purge index.css righe 1-111 (#aa3bff, dark-mode, #root 1126px); DELETE src/App.css + public/icons.svg (ri-verifica grep prima); `design-tokens.test.ts` (hex solo in :root/.excalidraw, tutti i --m-* presenti, zero #aa3bff/#863bff). PREREQUISITO di tutto il resto.
- **Config Excalidraw CANONICA** (fusione delle 2 proposte gemelle, vince questa): `src/design/excalidrawConfig.ts` esporta LANG='it-IT'; UI_OPTIONS={canvasActions:{toggleTheme:false, changeViewBackgroundColor:false, loadScene:false, saveToActiveFile:false, clearCanvas:true, saveAsImage:true, export:false}, tools:{image:false}}; aiEnabled=false; MainMenu custom SOLO ClearCanvas+SaveAsImage (zero Socials/link excalidraw.com); NEW_ROOM_APPSTATE={currentItemFontFamily:FONT_FAMILY.Nunito, currentItemStrokeColor:'#14130f', viewBackgroundColor:'#fffefb'} SOLO su stanza nuova; theme='light'. Canvas = #fffefb (--m-canvas), NON #faf9f6: gerarchia foglio-su-scrivania. LIMITE ONESTO: swatch del color-picker restano stock, no hack DOM. ACCETTAZIONE: mock riceve langCode/UIOptions/aiEnabled; hamburger italiano senza Dark-mode/Load-scene/Socials; tool attivo blu non viola; testo nuovo dritto (Nunito).
- **10 icone SVG inline** (`src/design/icons.tsx`): path Lucide incollati (ISC), viewBox 24, stroke currentColor 1.75, rese 14px; Link/Sigma/Image/Mic/MicOff/Dot/Download/ArrowUpRight/Check/Alert; via i glifi ⚠ ✓ ↗ da Room.tsx. REGOLA: icona SEMPRE con etichetta (persona 45-60); eccezioni (LED puntiformi, icon-only 44px a 480px, bottone overflow) si decidono SOLO in questo file; set cappato a 10, ogni aggiunta passa review. ACCETTAZIONE: 10 render con attributi giusti; regex: zero ⚠✓↗ in Room.tsx.
- **MathComposer UNIFICATO** (veste VISUAL + sostanza INTEGRATION, UNA riscrittura): pattern `.st-card` + `.st-card-title` serif (2° momento-brand); CTA "inserisci sulla lavagna" BLU .st-primary (verde vietato: riservato a verificato); "copia LaTeX"/"chiudi" .st-ghost; via #0a8a3a/#888/#ddd; 6 chip template con NOMI ITALIANI ("frazione","radice","integrale","sommatoria","limite","matrice") che settano mf.value (\frac{a}{b}, \sqrt{x}, \int_{a}^{b} f(x)\,dx, \sum_{n=1}^{N}, \lim_{x \to 0}, \begin{pmatrix} a & b \\ c & d \end{pmatrix}); mf.mathVirtualKeyboardPolicy='auto'. `.st-card` = contenitore canonico futuro dei pannelli ToolHost. ACCETTAZIONE: zero hex in MathComposer.tsx; 6 chip; click "frazione" setta value; insert con value vuoto non chiama onInsert.
- **Registrazione first-class + porta brand**: `.st-recstrip` 2px --m-rec sotto l'header (in layout, non overlay, no animazione) quando audioRecording; document.title='● REC — maestro · studio' / 'maestro · studio'; index.html lang='it'; favicon = quadrato carta rx14 + cerchio blu r11 (via fulmine viola). Approvata dal docente "così com'è". ACCETTAZIONE: rec on → [data-rec-strip] presente + title contiene 'REC'; off → assenti.
- **Header responsive iPad/penna**: pointer:coarse → bar 60px, target ≥44px; ≤1024px → nascondi .st-sub + id mono (mai il nome lezione); ≤760px → formula/media/Meet in popover "altro" (parola, MAI '+' nudo; un tocco, voci full-width); REGOLA GDPR: pill audio/"registrando" ed "esporta lezione" MAI nell'overflow; "invita studente" icon-only 44×44 con aria-label solo <480px. ACCETTAZIONE: audio+export figli diretti di .st-actions; scrollWidth===clientWidth a 768×1024 e 1180×820.

### C. PLASTICITÀ (Plasticity Engineer — PL-1..4 come da spec, con 1 fix)
- **PL-1** contratto StyleProfile v1 Zod strictObject, loader fail-closed (assente/malformato/extra-key/range/v≠1/lessons_analyzed<3 → null, mai throw); PATHS derived/style_profile.json|theme.json|theme-override.json; pin in `orch/COORDINATION.md` (lessonos style.py lo produce).
- **PL-2** deriveTheme PURA → MTheme{family,variant,vars(11)}, isteresi Schmitt entra ≥.65/resta >.55, clamp 2 decimali, null→NEUTRAL, invarianza tics, mai --m-rec/--m-verified nell'output.
- **PL-3** applicazione SOLO a mount + **FIX OPT-IN (vincolante)**: la prima attivazione NON applica nulla — banner a studio ancora classico "Ho imparato come fai lezione: vuoi che lo studio prenda il tuo stile? [prova] [no, grazie]"; tema cambia solo dopo il sì; "torna al classico" sempre presente (scrive theme-override.json); mai retheme mid-lesson; semafori bit-identici nei due stati; theme.json sotto derived/.
- **PL-4** serializeTheme → theme.json portabile + dispensa.css standalone (ink/paper da costanti condivise con neutral.ts, heading serif, blocchi condizionali .esercizio/.domanda/.toc, legge wash: nessuna alpha >.10, hex solo da palette attiva, scritture solo derived/).

### D. INTEGRAZIONE (Integration Designer)
- **ToolHost surfaces**: board-embed via validateEmbeddable('maestro-tool://')+renderEmbeddable+ToolFrame (iframe sandbox="allow-scripts", MAI allow-same-origin); panel via `<Sidebar name="strumenti" docked>`; embedId=element.id chiude isOwnEmbed deny-by-default. **CONDIZIONE VINCOLANTE del docente**: tutta l'idraulica SÌ, ma la pill "strumenti" NON esiste nell'header di produzione finché non c'è UNO strumento vero — solo dietro flag dev; quando arriverà, la pill nasce col nome dello strumento.

## 4. TABELLA PLASTICITÀ — StyleProfile → tema (formule esatte, clamp a 2 decimali)
| Campo (0..1) | Variabile CSS | Formula / soglia | Effetto percepito |
|---|---|---|---|
| exercise_density P | famiglia --m-accent* = **terracotta** (#c2410c/#9a3412/#7c2d12/#f0b8a0/rgba(194,65,12,.06)/rgba(194,65,12,.12)) + variant `esercizio-first` | entra P≥.65, resta finché P>.55 (Schmitt) | pill primarie/selezioni calde "da palestra"; dispense con blocchi .esercizio numerati |
| question_density D | famiglia --m-accent* = **verde-salvia** (#0f766e/#115e59/#134e4a/#99ccc6/rgba(15,118,110,.06)/rgba(15,118,110,.12)) + variant `socratico` | entra D≥.65 e D>P, resta finché D>.55 | accento meditativo; dispense con callout .domanda |
| registro F | --m-heading-font; --m-track; --m-rule-weight | serif Iowan se F≥.60; track=2.2px×(1+.16F) clamp [2.20,2.55] (F=.9→2.52px); rule 1.5px se F≥.60 | titoli accademici, micro-spaziatura aulica, filetti più presenti |
| concept_granularity G | --m-density | 1+.10G clamp [1.00,1.10] | più aria tra le righe per chi spezza fine i concetti |
| prereq_explicitness R | --m-h-scale (+ .toc in dispensa.css) | 1+.06R clamp [1.00,1.06]; .toc se R≥.50 | gerarchia titoli più marcata; indice prerequisiti in dispensa |
| tics | NESSUNA | invarianza testata (PL-2) | solo testo dispense, mai UI |
| lessons_analyzed | tutte | <3 → NEUTRAL (fail-closed) | il sistema tace invece di etichettare il docente con 3 lezioni |
FUORI TEMA PER LEGGE: --m-rec, --m-verified, --m-warn, --m-error, --m-blue* (wordmark), ink/paper.

## 5. SEQUENZA — 4 TASK PINNABILI (loop studio, ordinati impatto-percepito/effort)
### S-DESIGN-1 — "Prima impressione: carta, italiano, welcome MAESTRO" (effort M, LA mossa che il docente nota al primo sguardo)
Tokens (§2: tokens.css + purge righe 1-111 index.css + DELETE App.css/icons.svg post-grep + riscrittura .st-* a var()) + scope `.excalidraw` (§2) + `src/design/excalidrawConfig.ts` canonico (§3.B: LANG, UI_OPTIONS fusi, aiEnabled=false, MainMenu custom, NEW_ROOM_APPSTATE Nunito/#14130f/#fffefb su stanza nuova, theme='light') + WelcomeScreen MAESTRO (§3.A).
FILE: src/tokens.css (nuovo), src/index.css, src/design/excalidrawConfig.ts (nuovo), src/Room.tsx, DELETE src/App.css + public/icons.svg, src/__tests__/design-tokens.test.ts + excalidrawConfig.test.ts + Welcome.test.tsx (nuovi), Room.integration.test.tsx.
ACCETTAZIONE: design-tokens.test verde (hex solo :root/.excalidraw, zero #aa3bff/#863bff/#6965db in src); mock Excalidraw riceve langCode='it-IT'+UIOptions(loadScene:false,tools.image:false)+aiEnabled=false; getByText(/lavagna che ricorda/i). SCREENSHOT: stanza nuova = welcome italiano serif+punto blu, canvas #fffefb, toolbar tooltip italiani, tool attivo BLU, zero Library, hamburger senza Socials/Dark/Load, testo dritto Nunito. Gate tsc+vitest 138/138+nuovi. **COMMIT IMMEDIATO a gate verde.**
### S-DESIGN-2 — "Fiducia visibile: filo rosso REC + stato dati onesto" (effort M)
Recstrip 2px --m-rec + document.title '● REC — maestro · studio' + index.html lang='it' + favicon punto-blu (§3.B) + connectFolder() + indicatore dati UNICO col lessico del docente + fix tooltip Room.tsx:303 condizionale (§3.A, "registra*" solo audio).
FILE: src/Room.tsx, src/store/WorkspaceStore.ts, src/index.css, index.html, public/favicon.svg, __tests__/WorkspaceStore.test.ts + Room.integration.test.tsx.
ACCETTAZIONE: rec on→[data-rec-strip]+title 'REC', off→assenti; connectFolder→mode 'fsa'+scena migrata; localStorage→"solo in questo browser"+"scegli cartella…"; zero parola "workspace"/"registrata" per lo scritto. SCREENSHOT: filo rosso #cf222e full-width in rec, tab '● REC', click cartella apre il picker Chrome. **COMMIT IMMEDIATO a gate verde.**
### S-DESIGN-3 — "Lezioni con un nome" (effort M)
meta.json + rinomina inline con matitina-hover + nome in header/filename export + drawer "lezioni" .st-card + FLUSH del persist debounce 700ms prima del reload (§3.A).
FILE: src/Room.tsx, src/store/WorkspaceStore.ts (listRooms+meta), src/index.css, __tests__/WorkspaceStore.test.ts + Lessons.test.tsx (nuovo).
ACCETTAZIONE: meta.json scritto; listRooms 2 fixture (name/fallback-id, mtime desc); filename `lezione-<slug>.lesson`; test flush: tratto a t-100ms dal click navigazione NON si perde. SCREENSHOT: chip "Teoria dei Segnali — cap. 3" dopo rinomina; drawer elenca e riapre. **COMMIT IMMEDIATO a gate verde.**
### S-DESIGN-4 — "Formula da prof + icone inchiostro" (effort S+S)
MathComposer unificato (.st-card, CTA blu, 6 chip italiani, tastiera virtuale 'auto' — §3.B) + src/design/icons.tsx 10 icone + sostituzione glifi unicode.
FILE: src/MathComposer.tsx, src/design/icons.tsx (nuovo), src/index.css, __tests__/MathComposer.test.tsx + icons.test.tsx (nuovi), design-tokens.test.ts esteso a MathComposer.
ACCETTAZIONE: zero hex in MathComposer.tsx; 6 chip, click "frazione"→mf.value='\\frac{a}{b}'; insert vuoto non chiama onInsert; 10 icone stroke 1.75/currentColor; zero ⚠✓↗ in Room.tsx. SCREENSHOT: dialog della stessa famiglia dell'header (titolo serif, CTA blu, raggio campi 8px); pill export con icona download 14px allineata. **COMMIT IMMEDIATO a gate verde.**
CODA POST S-DESIGN-4 (ordine): vista studente (§3.A) → recap+materiali (§3.A) → header responsive (§3.B) → track PL-1..4 (richiede S-DESIGN-1 atterrata; PL-3 OBBLIGATORIAMENTE opt-in) → idraulica ToolHost dietro flag dev.

## 6. BOCCIATE (e perché)
- "Excalidraw in italiano e senza marchio" (INTEGRATION): doppione della config VISUAL — FUSA in excalidrawConfig.ts (sopravvivono MainMenu custom, aiEnabled:false, tools.image:false), morta come task autonoma.
- "Canvas carta & inchiostro --st-*" (INTEGRATION): secondo namespace token = il pasticcio che diciamo di voler eliminare — sopravvivono solo blocco .excalidraw + initialData dentro S-DESIGN-1, namespace unico --m-*.
- Divieto di WelcomeScreen (clausola della proposta INTEGRATION): empty-state muto = anonimato NotebookLM — decade, vince il welcome MAESTRO.
- Pill "strumenti" in header produzione (ToolHost): bocciata dal docente finché non esiste UNO strumento vero — "non si mette la maniglia prima che esista la stanza"; idraulica ok dietro flag dev.
- "MathComposer chip template" come task autonoma: due riscritture parallele dello stesso file — fusa (veste VISUAL + sostanza INTEGRATION).
- Banner plasticità a fatto compiuto (PL-3 originale): "questo software mi studia di nascosto" — sostituito da opt-in [prova]/[no, grazie].
- Chip "lezione registrata ✎": lessico-sorveglianza + glifo unicode vietato — riscritto "appunti salvati", "registra*" riservato all'audio.
- Drop-zone ".lesson" in faccia al docente: "io non trascino file con estensioni strane" — nascosta dietro voce discreta.
- Bottone overflow '+' nudo e schermo "versione che non sync-a" mostrato allo studente: sostituiti da "altro" con parola e da ultima-lavagna-salvata + "Segui la diretta su Meet".
