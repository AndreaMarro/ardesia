# CLAUDE-ARDESIA-UIUX-RESEARCH — 2026-07-08

- **Owner**: Claude Code (product/UX lane), non-Codex.
- **Scope**: primary-source research mandated by `CLAUDE-ARDESIA-PRODUCT-UX-RECOVERY-BRIEF-20260708.md` §Required Research.
- **Companion**: this doc **resolves the `[VERIFY-WEB]` TODOs** in `docs/product/OPEN-DESIGN-AND-BOARD-RESEARCH.md`
  and feeds `CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-20260708.md` (same date) and the future
  `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md` (C+6).
- **Method**: 4 parallel web-research passes (board/note apps · accessibility+LIM · plugin marketplaces · sellable-content), primary sources where retrievable, links inline. Epistemic notes on unverified items in §11.
- **No code changed.**

---

## 1. Executive summary — what the research changes for ARDESIA

1. **License reality (resolves `[VERIFY-WEB]`)**: Excalidraw **MIT** (vendorable), tldraw **proprietary + runtime-enforced watermark** (architecture-only, do NOT vendor without a paid license), Penpot **MPL-2.0** (safe weak-copyleft), Fritzing **double trap** (app GPL-3.0 · parts/graphics CC-BY-SA-3.0). **Redraw all electronics component graphics ourselves.**
2. **Adopt a tldraw-style record model, in clean code**: every board object — including a plugin post-it — is a JSON record `{id,type,x,y,w,h,rotation,z,props}` in a reactive store, with behavior/geometry/render in a per-type util. This is the uncopyrightable *pattern*; reimplement, don't import.
3. **Split document vs session state** (persisted board doc vs per-user ephemeral camera/selection) — mandatory for the LIM-shared / iPad-personal / desktop trio.
4. **Prefer the event log over silent last-writer-wins** for anything used as pedagogical evidence (LessonOS). Excalidraw-style `versionNonce` LWW can silently drop concurrent iPad+LIM edits.
5. **Accessibility floor is now concrete**: WCAG **2.2 AA**; every drag needs a non-drag single-pointer alternative (**SC 2.5.7**); 44×44 CSS px target floor (Apple HIG + 2.5.5), **60–80 px on LIM**; 4.5:1 text / 3:1 non-text contrast; visible, ≥2px/≥3:1 focus not obscured by the launcher.
6. **Marketplace = declared, least-privilege capabilities + publisher-identity trust + install-time integrity check + automated scan scorecard.** Copy Figma's *transparent capability publication* and Chrome's *declare-then-just-in-time consent*; ARDESIA already has the crypto substrate (ed25519 manifest signing, `capabilities`, `privacy.dataOut`, `integrity.bundleSha256`).
7. **Sellable content needs a provenance-first contract**: LRMI (schema.org `LearningResource`) fields + C2PA-style ingredients + IPTC `digitalSourceType` + an explicit **`aiDisclosure`** flag (the gap TPT leaves open) + non-spoofable **official-vs-user-generated** axis. **EU AI Act Art. 50 applies from 2 Aug 2026** — machine-readable marking of AI-generated text/media is a legal requirement, not a nicety.
8. **Cite-don't-copy is the only safe content architecture**: sellable packs ship pointers + generated derivations; the buyer must hold the manual. Redistributing Vol.1–3 bytes in a *sold* pack breaks the classroom-fair-use assumption.

---

## 2. Verified licenses (resolves the `[VERIFY-WEB]` table in OPEN-DESIGN-AND-BOARD-RESEARCH.md)

| Project | License (verified) | Vendor code into ARDESIA? | What to take | Trap |
|---|---|---|---|---|
| **Excalidraw** | **MIT** ([LICENSE](https://github.com/excalidraw/excalidraw/blob/master/LICENSE)) | ✅ Yes, keep MIT notice | Flat JSON element array + z-order; per-element `version`/`versionNonce`; E2E key-in-URL-fragment sharing; `.excalidraw` portable doc | LWW `versionNonce` can drop concurrent edits; cloning the Rough.js sketch identity reads as knock-off |
| **tldraw** | **Proprietary "tldraw license", NO SPDX, not OSI** ([LICENSE.md](https://github.com/tldraw/tldraw/blob/main/LICENSE.md), [license docs](https://tldraw.dev/community/license)) | ❌ **No** without paid commercial license | *Architecture only*: record store + `ShapeUtil`; `getGeometry` hit-test/bindings; **document-vs-session split**; tools as explicit state machine | SDK **won't run in production without a key**; hobby tier forces **"Made with tldraw" watermark**; runtime license-key + env detection + watermark enforcement you may not circumvent |
| **Penpot** | **MPL-2.0** ([LICENSE](https://github.com/penpot/penpot/blob/develop/LICENSE)) | ✅ Yes (weak/file-level copyleft) | SVG-native portable docs; weak-copyleft engine boundary if we ever open-core | Only edits to Penpot's *own files* must stay MPL; keep notices |
| **Fritzing** | **App GPL-3.0** ([LICENSE.GPL3](https://github.com/fritzing/fritzing-app/blob/develop/LICENSE.GPL3)) · **Parts/graphics/docs CC-BY-SA-3.0** ([parts LICENSE](https://github.com/fritzing/fritzing-parts/blob/develop/LICENSE.txt)) | ❌ **No** to both halves | *Concept only*: breadboard-first metaphor; part = SVG + pin/terminal metadata; multi-view sync | App code = strong copyleft; **part SVGs = CC-BY-SA ShareAlike is viral on the asset + requires attribution**. **Draw our own graphics.** |

**Directive**: ARDESIA may vendor Excalidraw (MIT) and learn from Penpot (MPL-2.0). tldraw = reference architecture only. Fritzing at arm's length entirely — **all component graphics original** (the Vol.1–3 manual figures are the authoritative reference, not Fritzing assets).

---

## 3. GoodNotes-class board expectations (table stakes)

Modern paper-first apps (GoodNotes, Notability) have converged; users treat these as baseline ([Paperlike](https://paperlike.com/blogs/paperlikers-insights/app-review-goodnotes-vs-notability), [GoodNotes Sep-2025](https://www.goodnotes.com/blog/features-fixes-updates-september-2025)):

- **Both metaphors coexist** — bounded *pages* (thumbnails, reorder, PDF import) **and** an optional *infinite canvas* mode; user chooses per-document. GoodNotes added infinite canvas for mind-maps while keeping notebooks.
- **Pen/ink is a first-class object**: pressure/tilt pen + highlighter + stroke/pixel eraser + configurable palm rejection + low-latency inking.
- **Ink-as-selectable-object**: lasso select → move/resize/recolor/convert; shape recognition (rough rectangle → clean rectangle); handwriting-to-text + handwriting *search*.
- **Object heterogeneity**: a page mixes ink, typed text, images, PDF pages, stickers, and increasingly embedded interactive/AI blocks — all independently movable/resizable.
- **Gesture baseline**: two-finger pan, pinch-zoom, gesture-undo, unlimited undo/redo, alignment snapping, drag-reorder, writing-magnifier/zoom-box.
- **Templates/backgrounds** (grid/lines/dots/custom) out of the box.

**ARDESIA implication**: make the infinite board the home surface; let a plugin/LessonOS sheet present as a bounded page. Do not claim GoodNotes parity until measured on-device (per `UI-UX-DESIGN-DIRECTION.md`). ARDESIA's one differentiator over GoodNotes: **plugins directly on the paper** — everything else on this list is catch-up.

---

## 4. Board architecture patterns to adopt (clean-room)

From tldraw + Excalidraw ([tldraw Editor](https://tldraw.dev/sdk-features/editor), [Shapes](https://tldraw.dev/docs/shapes), [Persistence](https://tldraw.dev/docs/persistence); [Excalidraw JSON schema](https://docs.excalidraw.com/docs/codebase/json-schema)):

1. **Board object = JSON record** in a reactive/signals store: base props (position, rotation, opacity, z) + type-specific `props`. A **plugin post-it is just another record type** → participates in select/move/resize/undo/persistence uniformly.
2. **Behavior in a per-type util** (render + `getGeometry` hit-test + interaction handlers). New plugin type = new record type + util, **zero changes to board core**. Directly answers the `OPEN-DESIGN-AND-BOARD-RESEARCH.md` "god-component" warning about `ToolCanvasEmbeddable.tsx` (1289 L).
3. **Bindings** connect shapes (parent↔child, connectors) and auto-update on drag → the mechanism for **sub-post-its bound to a parent plugin instance** (C+3).
4. **Tools as an explicit state machine** (`idle → pointing → brushing → idle`), not tangled event handlers; specialized managers (history, snap, text, inputs) keep the editor from becoming a god-object.
5. **Document vs session split**: persistent `document` snapshot (records, positions) separate from ephemeral `session` (camera, selection, active tool, hover/drag). **Critical**: LIM shows the shared document; iPad shows the same document with its own session; they must not fight over ephemeral UI state.
6. **Conflict policy**: Excalidraw's per-element `version`+`versionNonce` deterministic LWW is fine for diagrams but **loses data under true concurrent edits** → for LessonOS evidence, ARDESIA's **append-only event log is the source of truth** (already the canon — `store/JournalRecorder.ts`), not silent LWW.
7. **Portable serialization**: every post-it round-trips to the board's JSON/SVG doc so it survives export (`.lesson`), diff, LessonOS replay, and cross-device open.

---

## 5. Accessibility constraints — WCAG 2.2 AA (with numbers)

**Target version**: **WCAG 2.2** is the current W3C Recommendation and the compliance target ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)). WCAG **3.0** is a Working Draft only (new draft [Mar 2026](https://www.w3.org/WAI/news/2026-03-03/wcag3/)), CR ~2027, final ≥2028 — **do not design to 3.0**. For the Italian school market the legal hook is **EN 301 549**, which references WCAG 2.1 AA today (worth a dedicated check — §11).

Success criteria most relevant to an interactive board:

| SC | Level | Requirement (verbatim thresholds) |
|---|---|---|
| **2.5.7 Dragging Movements** (new in 2.2) | AA | All drag functionality must also be achievable **by a single pointer without dragging** (a click/tap path), unless dragging is essential. **Keyboard support alone does NOT satisfy this.** ([Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)) |
| **2.5.8 Target Size (Minimum)** (new in 2.2) | AA | Pointer targets **≥ 24×24 CSS px**, or a 24 px-diameter circle centered on each target must not intersect another's. ([Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)) |
| **2.5.5 Target Size (Enhanced)** | AAA | Active area **≥ 44×44 CSS px**. ([Understanding 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)) |
| **1.4.3 Contrast (Minimum)** | AA | Text **≥ 4.5:1**; large text (≥18pt or ≥14pt bold) **≥ 3:1**. ([Understanding 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)) |
| **1.4.11 Non-text Contrast** | AA | UI component boundaries/states + meaningful graphics **≥ 3:1**. |
| **1.4.10 Reflow** | AA | No 2-D scrolling at 320 CSS px width (= 1280px @ 400% zoom). |
| **1.4.12 Text Spacing** | AA | No clipping when line-height 1.5×, paragraph 2×, letter 0.12×, word 0.16× font size. |
| **2.4.7 / 2.4.11 / 2.4.13** | A/AA/AAA | Visible focus; focus **not fully obscured** by author content (sticky toolbars/launcher); focus indicator ≥2px perimeter, ≥3:1. |
| **4.1.2 Name, Role, Value** | A | Every custom canvas object + the launcher dropdown must expose programmatic name/role/value + announce state changes to AT. The most common SPA-canvas failure. |

**WAI-ARIA patterns** ([APG](https://www.w3.org/WAI/ARIA/apg/patterns/), [Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)):
- **Board of movable objects** = one tab stop via **roving tabindex / `aria-activedescendant`**; arrow keys move virtual focus between post-its; Enter/Space activate; Escape cancels.
- **Plugin launcher dropdown** = **Menu Button** (`aria-haspopup="menu"`, `aria-expanded`) if it *creates/inserts*, or **Listbox** if it *sets active tool*; one tab stop, arrow traversal, Home/End, type-ahead, Escape returns focus to trigger. (Matches the memory note that the launcher is already a WAI-ARIA tendina.)

---

## 6. iPad / Pencil / touch / LIM / classroom interaction

- **Touch target floor: 44×44 pt** (Apple HIG, long-standing) ([HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)). Set a hard **44 CSS px** floor everywhere (also satisfies 2.5.5 AAA).
- **LIM / finger-at-distance**: IWBs support **20–40 simultaneous touch points** ([ViewSonic](https://www.viewsonic.com/library/education/how-to-choose-an-interactive-whiteboard-for-your-classroom/)); recommended bottom-edge mount **71–81 cm** → keep frequent controls in the **vertical mid-band, never pinned top/bottom corners** ([Samsung](https://insights.samsung.com/2025/03/17/how-to-upgrade-from-classroom-projectors-to-interactive-whiteboards-3/)). Finger at arm's length + glare ⇒ **scale primary controls to ≈ 60–80 px**; the 24 px AA floor is a legal minimum, not a usable LIM size. **Don't assume single-touch.**
- **Apple Pencil hover** detected ~**12 mm above display** (Pencil Pro / iPad Pro M2+, iPadOS 16.4+) ([Adopting hover](https://developer.apple.com/documentation/uikit/adopting-hover-support-for-apple-pencil)) → hover may *reveal* handles/tooltips but must never be *required* (finger + older Pencils have no hover).
- **Palm rejection** filters ink only near the active Pencil; touch is not disabled → **keep interactive controls out of the palm-rest zone** (lower area, lower-left for right-handers).
- **Projected/large-display legibility**: body text **≥ 24 pt** projected; distance rule ≈ **25 mm cap height per 4.5 m** viewing distance, text ≥ 10 arc-minutes ([Extron](https://www.extron.com/article/videowallfontsize), [Autoppt](https://autoppt.com/blog/powerpoint-minimum-font-size-best-practices/)). Classroom glare ⇒ exceed contrast minimums with margin; no hairlines.
- **Classroom operation is standing, often one-handed, fast-paced** ⇒ no precision-only, hover-only, or long-press-only controls.

---

## 7. Plugin marketplace patterns (install · trust · permissions · versions · reviews · pricing)

Synthesis across VS Code, Chrome, Figma, Obsidian (links in §8 table). The trust signal everywhere = **publisher-identity binding + automated malware/secret scanning + signing/integrity check at install**. Capability granularity ranges from **none** (VS Code / Obsidian = "full trust, opt-in once") to **explicit declared allowlists** (Chrome permissions, Figma `permissions`+`networkAccess`).

| Dimension | VS Code | Chrome | **Figma (best-in-class)** | Obsidian |
|---|---|---|---|---|
| Trust/signing | Marketplace **signs all**, VS Code verifies at install; malware+secret scan; first-install **publisher-trust prompt** (1.97) | Every submission+update **reviewed**; 2FA required | Human review before listing | **Automated scan every version → "safety scorecard"** |
| Verified publisher | Blue check = domain ownership + ≥6mo good standing | 2-Step Verification | Approved creator | Author identity, LICENSE file required |
| **Permissions model** | **None** (host-level trust) | **Declared manifest perms; install-time warning for consequential; `optional_permissions` requested just-in-time** | **`permissions[]` enum + `networkAccess.allowedDomains` shown publicly pre-install; `"*"` needs `reasoning` string** | **None** (Restricted Mode global opt-in) |
| Versioning | SemVer `engines.vscode`; pre-release channel | manifest `version`, re-review each update | `version`, re-review | `version` + `minAppVersion` |
| Pricing | `pricing: Free\|Trial` only; real paid = Trial + external key | native payments retired → external | **Native payments**, one-time/subscription, min $2, 7-day trial default | `fundingUrl` only |
| Ratings | yes | yes; **manipulation banned** | yes | scorecard |

**Consent UX patterns to adopt**: (1) **declare-then-request just-in-time** with a contextual "why" (Chrome) reduces install abandonment; (2) install-time dialog **only for consequential** capabilities; (3) **transparent capability publication on the listing before install** (Figma); (4) re-scan + **re-consent on capability diff at update** (never silently widen scope); (5) **affirmative, specific action** required (no pre-checked boxes).

**ARDESIA fit**: the substrate already exists — `ToolManifest` (ed25519 `publisher.pubkey`, `capabilities`, `privacy.dataOut`, `integrity.bundleSha256`, `pricing`, `visibility`, `license`), `previewPluginPackage` (signature+integrity pre-install), `PluginManager` lifecycle, host-attributed `graph.*` RPC. The gap is **modeling every plugin↔host action as a named capability, deny-by-default**, plus the update-time re-consent-on-diff rule.

---

## 8. Sellable educational content patterns

**Taxonomy** — two orthogonal axes + bundles, standardized via **schema.org `LearningResource` / LRMI** ([schema.org/LearningResource](https://schema.org/LearningResource); [Tes resource types](https://www.tes.com/teaching-resources)):
- `resourceType`: `lesson_pack | lesson | worksheet | exam_quiz_generator | simulation_pack | student_pack | teacher_profile`
- independent `format`: `pdf | interactive | simulation | slide | doc | image`
- pack = `hasPart[]` / `isPartOf` (bundle pattern, TPT); LRMI: `teaches[]`, `assesses[]` (required for exam/quiz), `educationalLevel`, `educationalAlignment` → MIUR syllabus node.

**Buyer license tiers** (TPT + OER merged) ([TPT multiple licenses](https://help.teacherspayteachers.com/hc/en-us/articles/360042448512-What-are-multiple-licenses), [transferable](https://help.teacherspayteachers.com/hc/en-us/articles/360042618912-What-is-a-Transferable-License), [OER Commons CC](https://oercommons.org/courseware/lesson/34110/overview)): `individual | multi_seat | classroom_transferable | school_site | cc_by | cc_by_sa | cc_by_nc | cc_by_nc_sa | cc_by_nd | cc0 | all_rights_reserved` with `seatCount`, `transferable`, `reassignIntervalDays` (365), `attributionString`. Note **`ND` does not qualify as OER**; **`SA` and `NC` propagate to the whole derivative** → compute the **most-restrictive effective license** from all ingredients. PhET precedent: HTML sims **CC BY 4.0** (mandatory verbatim credit), "Interoperable" files need a separate paid license — a clean open-runtime/licensed-embeddable dual tier ([PhET](https://phet.colorado.edu/en/licensing/html)).

**Preview policy**: auto-generate a **watermarked, flattened, partial** artifact; expose `isAccessibleForFree=true` only on it; gate the full asset; keep third-party assets out of previews ([TPT preview vs thumbnail](https://help.teacherspayteachers.com/hc/en-us/articles/360042865851-What-s-the-difference-between-a-thumbnail-and-a-preview)).

**Provenance (C2PA-aligned)** ([C2PA 2.4 Explainer](https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html)): model each cited source as an **ingredient** `{sourceId, sha256, kind: manual|sim|external, locator, attribution, license}` → a provenance tree back to Vol.1–3. This is exactly ARDESIA's existing `document:sha256` / `material.cited` pattern — formalize as `ingredients[]`.

**Generated-vs-official marking** — two independent facts:
1. **`digitalSourceType`** (IPTC controlled vocab carried by C2PA) ([IPTC](https://iptc.org/news/iptc-publishes-metadata-guidance-for-ai-generated-synthetic-media/)): `trainedAlgorithmicMedia` (AI) · `compositeWithTrainedAlgorithmicMedia` (AI+human) · `algorithmicMedia` (solver-computed) · `digitalCapture` (human-authored).
2. **Signer identity**: "official" = signed by an official/verified trust key, NOT a source-type value. Never let a UGC pack claim `official` without institutional `vettedBy`.

**Regulation — EU AI Act Article 50, applies from 2 Aug 2026** ([Art. 50](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50)): 50(2) providers must **mark generative AI outputs (incl. text) machine-readably**; 50(4) AI text published to inform the public must be disclosed — **exception for human-editorially-reviewed text** (record an `editorialReviewer`). Safe posture: **C2PA-sign every artifact with correct `digitalSourceType` + render a visible "AI" badge**.

**GDPR / Italy** ([GDPR edu guide](https://dataprivacymanager.net/gdpr-protecting-student-data-the-educators-guide-to-data-privacy-and-security/)): sellable/shared artifacts must carry **no real student PII** — keep LessonOS evidence as references, not personal data (`containsStudentPII` must be false for sellable items). Consistent with the project's GDPR-Mode-A guardrail.

---

## 9. Direct implications for ARDESIA (consolidated, actionable)

- **Contracts (C+1)**: build `MarketplaceItem` as a common envelope over `{kind: "plugin"}` (wraps existing `ToolManifest`) and `{kind: "content-pack"}` (LRMI fields + license tier + `ingredients[]` + `provenance{origin, aiDisclosure, sourceRefs}` + `preview` + `curriculum{aligned, standard, vettedBy}` + install `state`). **Mandate `aiDisclosure`** (the gap TPT leaves). Model plugin↔host actions as named **capabilities, deny-by-default**; re-consent on capability diff at update. **No payment integration in slice 1.**
- **Essential plugins (C+2)**: represent each as a board record type + util; preview = sandboxed, read-only, zero-capability until installed.
- **Sub-post-its (C+3)**: bindings pattern — child bound to parent instanceId; parent move → child move; explicit orphan policy + "pop out to board" promotion; serialize with provenance.
- **Pagina Personale (C+4/C+5)**: extend the existing `lessonos/teacherDashboardProjection.ts` (no second store); every stat has evidence refs; graph zones `unavailable[]` with reason until the materializer lands.
- **Accessibility baseline (all UI slices)**: 44 px targets (60–80 px LIM), non-drag alternative for every move/resize, 4.5:1/3:1 contrast + glare margin, visible non-obscured focus, launcher as ARIA Menu Button/Listbox, roving focus across post-its, hover as enhancement only, controls out of the palm-rest zone, ≥24pt projected text.
- **Licensing hygiene**: original component graphics only; MIT-notice any Excalidraw code; no tldraw/Fritzing code; cite-don't-copy manual bytes in sold packs; compute most-restrictive effective license across ingredients.

---

## 10. UI rules for plugin post-it & sub-post-it interactions

1. **First-class record, not a DOM overlay**: `{id,type,x,y,w,h,rotation,z,props}` in the reactive store; uniform select/move/resize/undo/persist.
2. **Behavior in a per-type util**; new plugin = new type + util, no board-core change.
3. **Tactile "editable draft" body**: paper-like shadow / pin / subtle skew — the Excalidraw insight that informal placement invites edits (fits a classroom board).
4. **Standard selection chrome**: tap = select (bbox + resize handles + rotate); two-finger board pan must still reach the board *through* an unselected post-it (don't trap gestures).
5. **Move = drag + non-drag alternative** (arrow-nudge when selected, and a tap/click "move" affordance) — SC 2.5.7. **Resize = corner-drag + stepper/handle/numeric** — never drag-only.
6. **Targets**: object body + every handle ≥ 44 px (≥ 60 px LIM), ≥ 8 px gaps so 24 px spacing circles never intersect; nested sub-post-it controls keep the floor or provide an Equivalent full-size control elsewhere (2.5.8 Equivalent exception).
7. **Two interior states**: collapsed compact tile (title + icon, big hit target) ↔ expanded plugin surface, expanding **in place on the board**, never in a modal (preserve spatial memory).
8. **Sub-post-its = child records bound to parent** (containment, parent-relative z, clip/anchor); explicit "pop out to board" promotion; same a11y rules recursively.
9. **Session vs document per object**: content/position/props = document (persists, syncs to LIM); open/hover/drag/selection = session (per-user, local).
10. **Marketplace-preview post-it**: sandboxed read-only, **zero granted capabilities** until installed; **capabilities + `allowedDomains` + surfaces listed on the card before install** (Figma transparency); **provenance badge is first-class visual** (official / publisher-partner / user-generated / ai-generated) + verified-publisher check + scan scorecard; price/license/trial visible pre-purchase; **AI content self-declares on the preview surface**; state (available/installed/enabled/disabled/update-available) visually legible; consent requires an affirmative specific action (no pre-checked box, no hover-implicit).
11. **License-clean visuals**: all post-it + circuit-component graphics original (no Fritzing SVGs, no cloned tldraw/Excalidraw chrome).
12. **Portable**: every post-it round-trips to the board JSON/SVG doc (export, diff, LessonOS replay, cross-device).

---

## 11. Unknowns (could not fully verify)

- **Fritzing SPDX precision** (`GPL-3.0-only` vs `-or-later`) not byte-confirmed; app is GNU GPL v3. Whether an exported circuit drawn with *non-Fritzing* parts is CC-BY-SA-free is ambiguous — assume contamination if any Fritzing part SVG is used.
- **tldraw commercial pricing / enterprise terms** — legal pages rendered thin to the fetcher; watermark + dev-only-default + key enforcement confirmed, exact per-seat pricing not.
- **EN 301 549 / AgID "Linee guida di design"** (the actual Italian public-sector legal hook, references WCAG 2.1 AA) not researched here — **dedicated check recommended** for the school market.
- **TPT AI-disclosure policy**: no explicit mandatory AI-labeling rule found (ToS 403'd) → **no industry precedent to copy; ARDESIA defines its own `aiDisclosure` requirement.**
- **EU Code of Practice** final AI-label icon/taxonomy still draft (early 2026); whether C2PA is mandated vs presumed for the machine-readable mark.
- **VS Code native paid support** not confirmed by primary docs (only `Free|Trial`); reliable pattern = Trial + external key.
- **No canonical W3C/APG pattern** for a free 2-D canvas of movable objects; §5's roving-focus + arrow-nudge + click-alternative is best-practice synthesis.
- **ARDESIA sandbox feasibility** (iframe/opaque-origin real enforcement vs Obsidian full-trust opt-in) determines whether the capability list is *enforced* or merely *declared* — a design decision, not a research finding.

---

## 12. Risks & licensing traps (consolidated)

1. **Drag-only interactions = automatic SC 2.5.7 AA failure** — the biggest risk for a drag-centric board; keyboard alone does not cure it (need a single-pointer click/tap path).
2. **tldraw**: shipping on tldraw code without a commercial license = breach + watermark on a paid education product. Reimplement the (uncopyrightable) pattern in clean MIT code.
3. **Fritzing double trap**: app GPL-3.0 (strong copyleft) · part graphics CC-BY-SA-3.0 (viral ShareAlike + attribution). Draw original graphics; never bundle Fritzing SVGs or app code.
4. **Reselling copyrighted manual excerpts** — the primary content trap. Seller warranty is not enough; use **cite-don't-copy** (`manual.read:{sha256}` capability referencing, not redistributing bytes). Commercial resale ≠ classroom fair use.
5. **Official-vs-AI conflation** — never let a UGC/`ai-generated` pack claim `official`; `provenanceClass`/`origin` immutable + signed; surface `aiDisclosure` on the preview post-it.
6. **EU AI Act 50(2)/(4)** (from 2 Aug 2026): AI-generated worksheets/quizzes sold without machine-readable marking + visible disclosure = transparency violation.
7. **License propagation**: `NC`/`ND`/`SA` ingredients contaminate the whole sold pack; compute most-restrictive effective license; TES-style auto-CC-BY-SA on "free" uploads conflicts with paid tiers — make `license.type` an explicit publish-time choice.
8. **Capability scope-creep on update** — the classic supply-chain attack; re-scan + re-consent on capability diff is mandatory.
9. **Silent LWW merge loses evidence** — prefer the append-only event log for anything LessonOS uses as pedagogical evidence.
10. **GDPR**: no student PII in sellable/shared artifacts; references only.
11. **Focus obscured by launcher/toolbar** — SC 2.4.11 (new in 2.2) failure; **custom canvas objects without role/name/value** — SC 4.1.2 failure (most common SPA-canvas trap).

---

## 13. COV

- 4 parallel primary-source research passes (board apps · a11y+LIM · plugin marketplaces · sellable content); every license, threshold, and SC cited to a primary source above; unverifiable items quarantined in §11 (not asserted as fact).
- Resolves the `[VERIFY-WEB]` TODOs in `docs/product/OPEN-DESIGN-AND-BOARD-RESEARCH.md` §"Pattern open-source" and §"TODO web": Excalidraw MIT · tldraw proprietary/watermark · Penpot MPL-2.0 · Fritzing GPL-3.0 + CC-BY-SA-3.0.
- No code changed. No claim that current ARDESIA UI meets any baseline here (must be validated by Playwright/device viewports in later slices).
- Feeds C+1 (marketplace/content contract), C+3 (sub-post-it), C+6 (UX spec) and the gap audit's slice order.
