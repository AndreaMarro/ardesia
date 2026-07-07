# PROMPT-NEXT-FABLE-2026-07-14 (handoff da NOTTE-12)

Sei Claude Code FABLE NOTTE-13, ARDESIA/ELAB, sessione lunga, reasoning massimo.

## Stato ereditato da NOTTE-12 (tutto merged, main verde)

- **Merged**: #131 (whitelist 8/8 nel picker ElabLab + visual reference matrix), #132 (v1-cap6-esp2 end-to-end, solve onesto BRUCIATO, bottone Room "sim esp2", catalogo 2/88), #133 (v1-cap6-esp3: metrica I(220)>I(470)>I(1k) falsificata, gate D4-2), #134 (breadboard copy system: sceneAuthoring.ts, gradeSceneGeometryStrict, hover node highlight, procedura in docs/ops/BREADBOARD-COPY-SYSTEM-2026-07-13.md). PR5 (fix/elab-vol3-hex-truth): esp4 HEX riconciliato + quarantena esp5 — verificare merge.
- Suite baseline: ~1250/5 (vitest, sempre da apps/studio, MAI da root). ⚠️ `vitest|playwright | tail` MASCHERA l'exit code: catturare exit separatamente. La CI NON esegue Playwright.
- **Matrice 8/8**: docs/ops/ELAB-VISIBLE-EXPERIMENTS-VISUAL-REFERENCE-MATRIX-2026-07-13.md — 3/8 book-aligned-candidate (esp1, esp2, esp3-blocked-by-gate), 5/8 static-only. Reference primarie 8/8 identificate (pagine+sha).
- **Research ledger**: docs/ops/EXTERNAL-RESEARCH-LEDGER-2026-07-13.md (licenze verificate; pattern Excalidraw points/FixedPointBinding/elbow per bend-points interattivi; grammatica Wokwi v/h/* in celle-breadboard).

## GATE-ANDREA aperti (NON scavalcare)

1. **D4-2 tabella burn** (da #133): il motore brucia il LED verde a 220Ω (30.9mA > soglia 30mA) e a 100Ω (68mA); il libro p.33 dice "220 più luminoso" e "mai sotto 100Ω". Test di caratterizzazione in ElabSceneEsp3.test.ts si rompe al cambio tabella. Finché aperto: esp3 fuori da catalogo/post-it.
2. Overlay CV per visualMatch (dipendenze cv2/skimage + GT annotato).
3. Promozione candidate→verified-human (review umana).
4. Toolchain arduino-cli per generare v3-cap6-esp5.hex (+ -r4) pin 5/6/9.
5. Navigazione/guscio prodotto (vedi Product Flow sotto) — decidere la forma.

## PRIORITÀ NOTTE-13 (in ordine)

1. **Chiudere il flusso docente** (Product Flow Audit NOTTE-12, 3 blocchi):
   a. IMPORT VIVO: `importLesson`/`importBundle` esistono e sono testati (ZipSlip incluso) ma NESSUN bottone UI li chiama (Room accetta solo image/pdf). Un bottone "importa lezione" chiude il round-trip export→riapertura.
   b. STUDENT PACK = ARTEFATTO: il ciclo Z7 (studentpack.generated/exported) è solo stato evento — nessun file scaricabile. Materializzare un download (formato tipo lesson-memory JSON con la selezione errori del docente).
   c. NAVIGAZIONE: le viste ?vista= (Room/ElabLab/cruscotto/lezioni) non hanno NESSUN link tra loro — il docente digita URL a mano. Anche solo una barra di link onesta cambia la vendibilità.
2. **v1-cap9-esp6 (RGB, 3 pot)**: reference pp.71-74 già estratte/verificate. RED test: bridge fail-closed su `potentiometer` (oggi throw onesto) → estendere bridge+renderer scena (pot 3-pin + LED RGB). Seguire BREADBOARD-COPY-SYSTEM.
3. **v2-cap7-esp1/esp2 (condensatore)**: serve breadboard INTERA orizzontale in scena + modello temporale τ=RC. Il motore vendored ha già i condensatori? Verificare firsthand prima di promettere.
4. **v3 scene con breakout**: SVG NanoR4Board.jsx esiste SOLO nel plugin — portarlo in apps/studio per le scene esp4/esp5 (pp.54-57 estratte).
5. Se Andrea decide D4-2: sbloccare esp3 (test caratterizzazione → electrical calcolato → catalogo/post-it).

## Rossi noti pre-esistenti (non tuoi)

- e2e `montaggio-canvas`: click su bb1:i9 intercettato dal canvas Excalidraw (da NOTTE-10, verificato con stash su main pulito). Candidato fix: attivazione embed.
- Canvas del plugin in ElabLab = segnaposto neri per TUTTI gli esperimenti (la superficie visiva vera è il post-it).
- Suite plugin elab-tutor: rossi pre-esistenti, non in CI.

## Disciplina invariata

Branch+PR, mai push su main; niente force-push/reset hard/rm -rf/git add -A; TDD; tsc -b + build + full vitest ×3 (exit code catturato!) + Playwright se UI; NUL/secret scan; merge solo con gh pr checks pass + bin/pr-merge-verify.sh (worktree pulita: ardesia-wt-merge-verify); gh pr list prima di ogni merge; whitelist VISIBLE_EXP_IDS = fonte di verità (8 target, v3-cap6-esp2 NON è visibile); niente corpus grezzo nei commit (solo pagine necessarie, pattern pdftoppm 180dpi dai PDF interni al plugin); gate-Andrea duri su deploy/dipendenze/segreti/PII/email/pagamenti/ADR-0001/tabella D4.

Chiudi con STATUS completo e nuovo handoff PROMPT-NEXT-FABLE-2026-07-15-NOTTE13.md.
