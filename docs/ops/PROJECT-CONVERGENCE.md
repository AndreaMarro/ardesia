> Historical proposal and QA adoption, 25 October 2026. The original register below
> is preserved verbatim from PR #265 at
> `4117382b0a9bd4666e848d49d7ef6beaf5258741` and describes its 17 October snapshot.
> Its PR/CI/assignment statements are historical, not current governance or an
> assertion that its dedicated workflow is installed in this candidate.
> Current instructions remain [AGENTS.md](../../AGENTS.md), the
> [canon index](../CANON-INDEX.md) and their dated addenda. Generate state from
> the actual repository rather than treating this register as a second canon.

# Project convergence — decision register

This register records decisions and evidence pointers. It is not generated
repository state. Run `python3 bin/state/project_state.py` for CURRENT; verify
GitHub and the actual checkout before starting another slice.

## Scope of P0-A

Issue [#263](https://github.com/AndreaMarro/ardesia/issues/263) requires the
distributed product to stop depending on the suspended vertical, with history,
notices and old documents preserved. The existing `elab_boundary_gate.py`
ratchets standalone-shaped filenames. It does not inspect Studio imports or
built bundles. These are different checks and both are kept.

The added scanner inventories tracked worktree files and, when explicitly
provided, a built Studio directory. It records SHA-256, index blob IDs, marker
counts and locations, and separates current-source candidates, legacy source,
test fixtures, historical evidence, tooling and licence notices. No excerpts
or student data are exported. Existing product code and gates are unchanged.

**Exit 0 means inventory completed, not decoupling completed.** The report
declares skipped binary/oversized content, symlinks and gitlinks. It is lexical
triage: comments may match; encoded strings, transitive imports, licences,
rights and visual brands require other evidence. Never delete required notices
to obtain zero matches. No source category proves runtime reachability.

```sh
python3 bin/audit/test_legacy_inventory.py
python3 bin/audit/legacy_inventory.py --output artifacts/audit/source.json
python3 bin/audit/legacy_inventory.py --artifact-root apps/studio/dist \
  --output artifacts/audit/legacy-inventory.json
```

An omitted artifact is `NOT_RUN`. A requested artifact must be inside the
repository, without symlinks in its root path, and contain readable `index.html`
and at least one JavaScript file. Entrypoints and dependency closure are not
validated. Output symlinks and linked ancestors are rejected; a regular previous
report may be replaced atomically. Use a stable checkout, since concurrent
directory replacement is not isolated. The CI inventory lane checks out the exact
PR head, builds with matching Vite provenance and uploads the observed byte
inventory. Existing integration CI continues to use its normal checkout.
The inventory lane does not certify the golden path or become a required
protection check through this PR.

## Snapshot reviewed on 17 October 2026

Main was `b124eee04acc8062c27284f23c5d9108e3767c27` (23 August). GitHub listed
three required check contexts. The integration token could not read the full
branch-protection endpoint (403); no claim is made here about current approval
counts, last-push review or admin exceptions. CodeRabbit's green status on #264
is accompanied by a "Draft PR not reviewed" comment and is not an approval.

| Work | Source / last observed head | Decision | Next action / risk |
|---|---|---|---|
| Main | `b124eee04acc8062c27284f23c5d9108e3767c27` | KEEP baseline | Re-read before a write; no merge/deploy mandate. |
| #264 | `b41380e32dee962599dc0bc02ac7cd1d8342590f` | KEEP DRAFT | Reconcile regulation and canon; RFC/manifest are not runtime. |
| #256 | `705284acc4322db4d241032de071437ab0473cc1` | SELECTIVE RECOVERY | Review material/ingest slice against main before reuse. |
| #257 | `1c3f546a709d1004e291d5938073d6a5b7ecf8db` | SELECTIVE RECOVERY | Isolate lesson identity and recorder v2 fixes; base is #256. |
| #258 | `f155d37fbd587cdfb3ce8b8e33f5352f77d37c10` | SELECTIVE RECOVERY | Persist-before-navigation and export; base is #257. |
| #259 | `50aed925d44542f923687c186fde7034b1dba1fd` | ARCHIVE REFERENCE | Preserve room/PDF prototype; no whole-stack merge; base is #258. |
| archive/codex-finalization-20261015 | tag `5b1f65779701ba680a9b4d7d0841dc9c021422ff` | PRESERVE | A tag, not an active implementation branch. |
| archive/codex-finalization-20261015-closed | tag `dd6c5da456b0581f2aaf5ce03a5da9033e0df35b` | PRESERVE | Compare only bounded recoverable fixes. |

PRs #256–259 are closed without merge. A non-null synthetic merge SHA does not
mean the PR was merged. Source: each PR's current `merged=false`/`merged_at=null`.
The owner for acceptance is Andrea Marro. An implementing agent may propose a
slice; it cannot supply the human approval or replace a professional licence
review. Other historical branches remain UNASSESSED, not implicitly abandoned.

## Decisions and bounded next slices

| ID | Decision | Acceptance before the next slice |
|---|---|---|
| ADR-P0A | Add repeatable source/artifact evidence before removal. | Scanner contract, exact-head build and readable inventory; explicit unchecked areas. |
| ADR-P0B | Keep old log bytes immutable; neutral pack identity for new observations. | Positive two-pack isolation and negative legacy replay tests; no invented provenance. |
| ADR-P0C | Separate raw exam score, career grade and rank score. | Integral normative sources, boundary cases and human syllabus review. |
| ADR-AI | New intent allows optional proposed feedback; current ZERO-LLM canon needs explicit reconciliation. | No inference enabled by this PR; proposer cannot approve work or certify physics. |
| ADR-UX | Keep Lezione / Continuita / Materiali and test a contextual review queue. | Real captures and human task timings before selecting a redesigned interface. |

Limit implementation to one next PR: P0-B after inventory review. Then P0-C as
a separate exam-profile contract. The manual upload/review loop follows those
boundaries. Do not open a parallel marketplace, a second login/CRM, a new canvas
framework or a generic AI orchestrator while the first useful journey is open.

## Evidence and remaining gates

- The author ran synthetic contract tests locally; no Mac or student pilot is
  claimed. The first RED was the absent inventory module; disabling marker
  detection in a disposable control copy made positive fixtures fail. Review
  then reproduced artifact/output symlink defects; regression tests failed
  before their correction. Dense-marker scanning also has a bounded-run check.
- Read the new PR's exact-head inventory workflow result and artifact. Do not
  substitute an older branch's green check or an uninspected Vercel preview.
- Independent review must record findings plus `not_checked`. Human approval,
  full protection details, mobile/iPad/Pencil/LIM, access across two identities,
  data migration, transitive imports and licence provenance remain distinct gates.
- Update this register after decisions, preserving prior reasons and linking
  actual evidence. Do not hard-code a future PR number, SHA or test outcome.


## QA consumer adopted for the convergence candidate — 25 October 2026

The useful capability from #265 is a read-only inventory of the tracked sources
and explicitly supplied Studio build. `bin/audit/legacy_inventory.py` is imported
without changing its symlink, traversal or output guards. Its 15 contract tests
are retained; the temporary repository root is canonicalized in the fixture so
macOS's system `/var` link does not make an ordinary temporary directory look
like an explicitly requested artifact symlink. Explicit symlink negatives remain.
The unmodified Mac run had four errors; the canonical temporary-root run and the
portable imported fixture each pass 15 tests. These distinct runs are preserved
in the convergence evidence rather than relabelled as one successful run.

Only the scanner, its contract tests and this historical register are adopted.
No extra workflow or required check is installed here; the original dedicated CI
lane described above belongs to the source PR. The existing frozen gates and
protected-branch review rules remain authoritative.

Consumer: before reviewing a release artifact, build Studio from the committed
candidate with its actual Git provenance, then run the explicit artifact command
above and retain the report beside the build manifest. The source-only invocation
is also useful during triage, but its omitted artifact remains `NOT_RUN`. A dirty
checkout is reported as dirty: its `checkout_sha` must not be presented as proof
that the observed worktree bytes or an old `dist/` were built from that commit.
The report preserves observed byte hashes and index blob IDs separately.

The baseline convergence candidate is #304 at
`1898b633e26f99710535c94e25fa28241f0f45b3`; this adoption does not claim that a
future integration head has already passed CI, landed in main or been released.
Approval of the scientific/audio/editorial content and the four DRAFT examples
remains a separate release decision. The inventory cannot approve a question,
issue a licence verdict or certify that every legacy dependency was removed.


## Candidato unico verso main — 25 ottobre 2026

La nuova direttiva del proprietario autorizza le integrazioni di convergenza
attraverso i gate reali; supera il precedente divieto operativo generico di merge.
Non supera le protection GitHub né autorizza un lancio pubblico. Main resta
`b124eee04acc8062c27284f23c5d9108e3767c27`; la genealogia completa fino a #304
`1898b633e26f99710535c94e25fa28241f0f45b3` viene conservata nel merge tree,
con le correzioni locali verificate. Nessuna nuova PR viene creata.

L'[inventario delle 37 PR](convergence-2026-10-25/matrix.md), il
[JSON completo](convergence-2026-10-25/matrix.json) e il
[grafo](convergence-2026-10-25/graph.mmd) fissano lo snapshot iniziale, non lo
stato futuro. Trenta head sono ancestor esatte del candidato; sette sono esterne.
#264 è stata chiusa **CLOSED_REJECTED** con review tecnica e
[motivazione](https://github.com/AndreaMarro/ardesia/pull/264#issuecomment-6398102299).
Le altre 36 sono ancora aperte: le chiusure proposte nel vecchio inventario sono
condizionate all'integrazione effettiva, non già eseguite. La riduzione attuale è
37→36, zero merge: chiusura per rigetto non significa lavoro integrato.

Il delta implementa la revoca audio tra viste e schede, preservando CAS, storage,
sessioni, journal e bundle. Una lease distinta dalle mutation evita di dichiarare
revoca conclusa mentre una vecchia cattura può ancora partire. Il consenso
canonico resta l'autorità; BroadcastChannel invalida soltanto. Un tentativo
concorrente annullato richiede un nuovo gesto esplicito. FSA e browser privi del
coordinamento necessario mostrano l'indisponibilità prima del consenso e non
aprono il microfono. Replay, import e revoca dello storico restano disponibili.
[Prove e limiti](convergence-2026-10-25/science-security.md),
[review avversariale](convergence-2026-10-25/audio-independent-review.md).

Sono adottati lo scanner #265 e l'adapter QA #271; le proposte #293, il finding
storico #295 e l'indice editoriale DRAFT #296 hanno provenienza e avviso storico.
Il protocollo parallelo #291 non sostituisce AGENTS/canoni. Non sono implementati
MCP write, un altro CoursePack, un nuovo database o un marketplace. La policy IA
opzionale della #264 non è ratificata da questo lavoro.

Gate locali sul delta di codice: Studio **2297 PASS**, replay incluso; Web
**361 PASS** e typecheck/build; Engine **2656 PASS/27 SKIP**; Core/API con
PostgreSQL 16.15 isolato **963 PASS/18 SKIP**; MCP SDK/HTTP **23 PASS**;
strumenti release **12 PASS**; scanner **15 PASS**, inbox **11 PASS**;
metadati PR **23 PASS**, trigger workflow **20 PASS**; browser pubblico
**6 PASS** su 360/390/820/1440, tastiera e movimento ridotto. I conteggi Core/API
ed Engine si sovrappongono. Gli skip Supabase, modelli e corpus non diventano PASS.
La CI nuova su base main e la prova del build committato vanno lette sulla head
esatta; questi test di worktree non anticipano un esito di merge o post-merge.

La CI esistente riceve PostgreSQL sintetico 16.15 per dodici contratti reali e
il probe portabile `node bin/qa/audio-cross-view.mjs /private/tmp`: due schede,
MediaRecorder/Web Locks/BroadcastChannel reali, dispositivo sintetico, nessun
microfono hardware. Il check PR legge metadati correnti via GitHub API e verifica
la head; non esegue comandi dal body e non attesta approvazione o merge.
DOMPurify è aggiornato 3.4.11→3.4.17 con RED/GREEN inerti del contratto; pypdf
API 6.21.1→6.21.2 con frozen lock e 38 test prima/dopo. Restano debiti dichiarati
nell'[audit architetturale](convergence-2026-10-25/architecture-audit.md) e nella
[patch PDF](convergence-2026-10-25/pypdf-patch.md); nessuna assenza globale di
vulnerabilità è attestata.

Il `vercel.json` root ora disabilita **tutti** i deploy Git automatici: nel vecchio
mapping i branch omessi, incluso main, erano abilitati per default. La
[documentazione ufficiale Vercel](https://vercel.com/docs/project-configuration/git-configuration)
conferma questa distinzione. Il merge tecnico non deve pubblicare il prodotto.
Render My Workspace conserva autoDeploy off sui servizi Ardesia verificati;
progetti estranei e produzione non sono modificati. La preview R2 esistente non
viene ribattezzata come questo nuovo candidato.

REA 6.7.0 è eseguito davvero: due capture del prodotto su 390/1440, previsione,
raggio da tastiera, risultato, grafico e recupero; [Evidence](convergence-2026-10-25/rea-summary.json).
MCP espone ora i tool e ha acquisito il processo dei 23 test del gate.
**Correzione datata alla nota precedente:** il manifest della distribuzione
installata dichiara `^22.19.0 || ^24.11.0 || >=26.0.0`, diverso dal main GitHub
letto nella sessione PRO. Node 26.5.1 rientra nel manifest installato; le nuove
capture CLI usano comunque Node 24.22.1. [Hash/versioni](convergence-2026-10-25/rea-runtime.json).
Non viene dedotta l'invalidità delle prove precedenti dal manifest di un altro
ref. Le capture attuali sono controlled replay del nostro prodotto, non nuovi
trasferimenti da donor né prova di efficacia didattica. Costo totale REA rispetto
al metodo diretto UNKNOWN, carico/hardware/pilot umano non misurati.

### Blocco specifico di integrazione

GitHub main richiede una approvazione indipendente sull'ultimo push, enforceAdmins,
check strict e conversazioni risolte. Tutte le review delle 37 PR erano vuote.
Il candidato #304 resta **BLOCKED_HUMAN_DECISION** fino a una review GitHub valida
sulla head finale da un collaboratore idoneo diverso da autore/ultimo pusher
(`daniilmastrangeli` o `progettibelli-go` risultano idonei alla verifica).
Nessuna review è simulata, richiesta a terzi o aggirata. Ottenuta l'approvazione,
riverificare main/head/CI, fare il merge attraverso GitHub, eseguire i gate sulla
main effettiva e soltanto allora chiudere le PR sostituite con provenienza esatta.


## Verifica del prodotto40567cd e percorso riproducibile

Il prodotto finale di codice è `40567cd7ccb56e7c5353a5f7c507c98dfa9eb4bb`.
[CI](https://github.com/AndreaMarro/ardesia/actions/runs/40199528487),
metadati, marketing e readiness sono SUCCESS su quella head: Studio2303PASS/
5SKIP più audio nativo8/8, Engine2654PASS/29SKIP, API963PASS/18SKIP conPG,
Web361PASS, MCP23PASS. Gate originale locale Studio2304PASS incluso replay.
I commit documentali successivi richiedono la propria CI: non trasferire questo
verde né dichiarare main integrata. I sette required checks sono stati promossi
solo dopo un loro successo reale; review/last-push/enforceAdmins conservati.

Il [journey Web attuale](../../apps/web/e2e/journey.spec.ts) passa4/4 con API
reale: laboratorio/interesse, revisione→diario→nuova prova→verifica docente e
lettura della fonte originale. Preparazione della membership e prima consegna
del caso di revisione sono fixture esplicite, non prove di invito/iscrizione.
Il [cold15/15](convergence-2026-10-25/cold-after.json) riapre dopo un nuovo
processo server, senza reseed e con tre profili puliti: hash delle fonti/esiti
identici, ricevute rileggibili e studente2 isolato.

Il [probe dei controlli audio visibili](convergence-2026-10-25/audio-visible-ui.json)
passa5/5: annotazione e prima take, nuova vista senza microfono automatico,
seconda take, revoca nell'altra vista con track ended prima del successo e
riferimento revocato non copiabile. Screenshot e video sintetici conservati;
nessuna prova hardware. P2 noto: il titolo «Passaggio salvato» può restare
visibile dopo revoca esterna; il microfono si ferma e la copia è rifiutata con
alert. Non è attestata disponibilità di quei byte.

La [riproduzione](convergence-2026-10-25/repro/README.md) usa solo componenti
esistenti, loopback e dati sintetici. La vecchia M1 Studio non è dichiarata
verde: dopo il funnel corretto cerca un bottone sostituito intenzionalmente dal
flusso Mini-corsi con preview/hash/revisione. Nessun bypass dell'offerta viene
ripristinato per far passare una spec obsoleta. Il cold attuale usa le ricevute
prodotte dal journey Web, non dati impliciti del vecchio M1.

L'artefatto pubblico di40567cd ha20asset byte-identici al pubblico17eebd0:
[TechnicalPASS, releaseBLOCKED](convergence-2026-10-25/candidate-check-40567cd.json).
Le firme scientifiche/editoriali/audio e i DRAFT restano gate distinti.
Il layout ha P2 dichiarati (CTA iniziale sotto fold, recupero mobile lungo),
non una certificazione WCAG o di qualità visuale globale. Nessun nuovo plugin,
MCP writer, beta remota, produzione o claim di apprendimento automatico.

## Addendum — 25 ottobre 2026, nuovo mandato adottato e convergenza effettiva

Il proprietario ha adottato esplicitamente PROMPT_CODEX_ARDESIA.md come mandato: policy single-maintainer con PR/check obbligatori, nessuna approvazione umana obbligatoria; pubblicazione autonoma della sola demo originale verificata. Questa direttiva supera i precedenti blocchi OPERATIVI descritti qui; non ratifica banca DRAFT, private beta o licenze donor. [Confronto amministrativo](public-demo-2026-10-25/policy-change.json): solo tre campi review modificati, tutte le altre protection identiche, nessun ruleset toccato o bypass.

#304 realmente MERGED in `51023fc5f0e3df5cee52b40bbe3f7d47028bca5a`, CI post-merge40228899033 SUCCESS. GitHub ha riconosciuto30PR con head ancestor comeMERGED; le sei offchain ancora aperte sono chiuse con motivazione, #264 era già respinta. [Snapshot37esiti](public-demo-2026-10-25/pr-outcomes.json):30MERGED,5CLOSED_SUPERSEDED,2CLOSED_REJECTED,0aperte. Non chiamare le chiusure senza merge integrazioni complete; adapter/scanner e documenti selezionati hanno provenienza, i restanti probe/protocolli non sono adottati in blocco. Il nuovo incremento e le prove remote sono nel [registro di consegna](public-demo-2026-10-25/README.md).
