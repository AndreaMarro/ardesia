# HomePage Regression Audit — 2026-05-23

**Goal**: verify current `src/components/HomePage.jsx` NON contiene il bad variant regression flagged Andrea 2026-05-05 PM (feedback `feedback_homepage_old_version_regression.md`).

**Method**: grep bad+good variant strings + visual screenshot via Preview MCP on local dev server (`http://localhost:5173/#home`).

**Branch**: `feat/lavagna-layout-overhaul` HEAD `b3ed3c6d` (NOT main, but HomePage.jsx state same as main per separate workstream).

---

## 1. Bad variant strings (feedback flagged)

| Pattern (feedback May 5) | Current HomePage.jsx | Status |
|---|---|---|
| `CHATBOT UNLIM` card title | grep 0 active code (only HASH_ROUTES key) | ✅ NOT present |
| `Fatto da Tea` tag | grep 0 | ✅ NOT present |
| `Kit fisici + volumi + software morfico` subtitle | line 26 COMMENT only (Compliance gate header) | ✅ NOT rendered |
| `robot blu/verde con cuffie` mascotte description | `ElabMascotte` component (line 51 import) is impeccable iter 42 PM approved design — visually similar but redesigned | ⚠️ AMBIGUO — visual Andrea confirm needed |

## 2. Good variant strings (iter 36+ approved)

| Pattern (iter 36+ approved) | Current HomePage.jsx | Status |
|---|---|---|
| `Tutor educativo elettronica + Arduino bambini 8-14` subtitle | line 921 active render | ✅ PRESENT |
| `Kit fisici, volumi e lezioni pronte per la classe` sub | line 924 active render | ✅ PRESENT |
| Card `Lavagna libera` | CARDS line 416 | ✅ PRESENT |
| Card `ELAB Tutor completo` | CARDS line 432 | ✅ PRESENT |
| Card `Videolezioni` | CARDS line 455 | ✅ PRESENT |
| Card `Compila Arduino` | CARDS line 471 (4th, iter 70+ addition) | ✅ PRESENT |

## 3. Visual verification (Preview MCP localhost:5173/#home screenshot)

Screenshot taken 2026-05-23 ~10:30 GMT+2:
- Title: "ELAB TUTOR" ✓
- Subtitle: "Tutor educativo elettronica + Arduino bambini 8-14." ✓
- Sub: "Kit fisici, volumi e lezioni pronte per la classe." ✓
- Mascotte: robot blu + lime + antenna with "Ciao 1ª media!" speech bubble (ElabMascotte component)
- Cards 3 visible: LAVAGNA LIBERA / ELAB TUTOR COMPLETO / VIDEOLEZIONI (+ Compila Arduino card 4th likely below fold)
- Compila & Carica Nano R4 banner present
- "Prima di iniziare, dicci quanti anni hai" age gate footer

## 4. Verdict

✅ **Current HomePage.jsx state = approved iter 36+ variant**.

Bad variant strings (CHATBOT UNLIM card / Fatto da Tea / Kit fisici + volumi + software morfico subtitle) ZERO occurrences in active code. Line 26 reference is COMPLIANCE GATE COMMENT (header doc), NOT rendered.

May 5 regression deploy `dpl_GvRZwSyfwnWW8FearcxCFf5fbAwL` was superseded by subsequent deploys with approved variant.

## 5. Ambiguity (visual Andrea ratify needed)

⚠️ **Mascotte design**: current screenshot shows blue+green robot with antenna saying "Ciao 1ª media!". Component = `ElabMascotte` (iter 42 PM Andrea approved "voglio mascotte e nessuna emoticon + design strutturato"). HOWEVER feedback May 5 described bad variant as "robot blu/verde con cuffie" — similar visual.

**Cannot discriminate empirically** without:
- (a) Andrea visual confirm screenshot match (or differs) from May 5 bad variant
- (b) git diff `src/components/common/ElabMascotte.jsx` between May 5 deploy commit vs current HEAD

**Recommendation**: Andrea visual ratify mascotte current state pre-deploy. If matches BAD variant identity, revisit ElabMascotte design.

## 6. Action items (out of scope PR #159)

- [ ] Andrea visual confirm current mascotte (matches approved iter 42 PM design? OR matches May 5 bad variant?)
- [ ] If mascotte BAD: scope dedicated iter HomePage mascotte revert/redesign
- [ ] Pre-deploy smoke check pattern (per feedback "How to apply"): screenshot vs golden before `vercel --prod`
- [ ] Audit `ElabMascotte.jsx` history git log per identify "approved iter 42" vs "May 5 bad" delta if any

## 7. PR #159 impact

**ZERO**. HomePage.jsx NOT touched by PR #159 (Lavagna Layout Overhaul scope = `src/components/lavagna/*` + `tests/e2e/*` + audit docs). No regression risk added by PR #159 merge.

---

**Conclusione**: HomePage current code state = clean per feedback strings. Visual mascotte ambiguity remains pending Andrea ratify. **Separato workstream da PR #159 — no blocker per ratify Lavagna overhaul**.
