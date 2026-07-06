# P0-S1 — verifyInstalledTool: reverify manifest installato post-install — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** chiudere il finding Codex P1.1 (review 2026-07-09): dopo l'install, ToolLab e localCatalog parsano `tools/<id>/manifest.json` senza riverificare firma/install record — un write locale può cambiare id/capability e aggirare la kill-list sull'id originale. Fix = helper `verifyInstalledTool(store, toolId)` fail-closed, consumato in ToolLab e localCatalog.

**Architecture:** l'helper vive in `installer.ts` (stessa ownership della verifica at-install), rilegge i BYTE salvati di `manifest.json` + `install.json` e riesegue la catena: record parse → `installRecord.toolId === toolId` → manifest parse → `manifest.id === toolId` → firma ed25519 sui byte salvati con `installRecord.signature` e `manifest.publisher.pubkey` → se `manifest.integrity.bundleSha256` presente, uguaglianza con `installRecord.bundleHash`. Ritorna un risultato discriminato (mai throw per tamper: fail-visible), i consumatori decidono la superficie d'errore.

**Tech Stack:** TypeScript, Zod (schemi esistenti), WebCrypto ed25519 (riusa `verifyEd25519` già in installer.ts), vitest env node.

## Global Constraints

- vitest SEMPRE da `apps/studio` (mai da root).
- `design/ToolLab.tsx` NON si tocca (gate ADR-0001): quindi NESSUN nuovo valore nell'unione `ToolLabGateResult.reason` — verify fallita = `reason: "not-mountable"` con `detail` esplicativo.
- Nessuna nuova dipendenza. Nessun file graph.query (`messages.ts`, `router.ts`, `policy.ts`, `caps/`, `host.ts`) toccato.
- Non stampare/loggare mai chiavi private.
- TDD RED→GREEN osservato; CoV = tsc -b, vitest mirato, full ×3, build, NUL/secret scan.
- Worktree: `/Users/andreamarro/VOLUME 3/ardesia-wt-notte9`, branch `feat/toolhost-installed-reverify-20260710` da `origin/main` = `b3cc021c`.

## Modello trust post-install (onestà)

Cosa il fix GARANTISCE:
- tamper del SOLO `manifest.json` post-install (contenuto modificato, id spostato, capability extra) → fail-closed;
- kill-list sull'id originale non più aggirabile spostando `manifest.id` (check `manifest.id === toolId`);
- corruzione accidentale (JSON rotto, schema-invalid, install parziale senza record) → fail-visible.

Cosa il fix NON garantisce (fuori scope, dichiarato):
- un attaccante con write COMPLETO sullo store può riscrivere manifest+install.json in modo auto-coerente (pubkey propria + firma propria): la catena è auto-referenziale finché non esiste un trust anchor fuori dallo store (publisher trust store / firma offline = P1-S2 + gate-Andrea marketplace). Il valore qui è alzare la barra da "un file" a "coerenza dell'intera catena" e chiudere il bypass kill-list per id mismatch.
- il bundle salvato NON viene rehashato (nessun mount legge oggi `bundlePath` — rehash-at-mount = PR-D, prematuro per NOTTE-7).

**Rollback:** revert del merge commit della PR; nessuna migrazione dati (l'helper è read-only, non cambia formati su disco).

---

### Task 1: RED — caratterizzare il bypass su ToolLab e localCatalog

**Files:**
- Modify: `apps/studio/src/__tests__/ToolLabGate.test.ts`
- Modify: `apps/studio/src/__tests__/MarketplaceLocalCatalog.test.ts`

**Interfaces:**
- Consumes: `installAndGateReferenceTool`, `buildLocalCatalog`, `manifestPath`, store in-memory dei test esistenti.
- Produces: 2 test che OGGI falliscono (dimostrano il bug) e passeranno col fix.

- [ ] **Step 1: test ToolLab — manifest sovrascritto post-install con id spostato + capability extra**

In `ToolLabGate.test.ts`, aggiungere (il manifest tamper è schema-valido ma NON firmato — pubkey formalmente valida ma firma nel record non corrisponde ai nuovi byte):

```ts
  it("manifest.json sovrascritto post-install (id spostato, capability extra) → fail-closed, MAI trusted", async () => {
    const store = new MemStore()
    const first = await installAndGateReferenceTool(store)
    expect(first.ok).toBe(true)

    // Attaccante con write sullo store: manifest schema-valido, NON firmato,
    // id diverso (kill-list su TOOL_ID non lo copre più) + capability extra.
    const shifted = JSON.stringify({
      manifestVersion: 1,
      id: "io.attacker.shifted",
      name: "Shifted",
      version: "9.9.9",
      protocol: ">=1.0 <2.0",
      entry: "dist/index.html",
      surfaces: ["panel"],
      capabilities: { "board.read": {}, "board.write": {}, "net.fetch": { hosts: ["evil.example"] } },
      publisher: { id: "attacker", pubkey: "ed25519:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" },
      privacy: { dataOut: "none" },
    })
    await store.write(manifestPath(TOOL_ID), new Blob([shifted], { type: "application/json" }))

    const result = await installAndGateReferenceTool(store)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("not-mountable")
  })
```

- [ ] **Step 2: test localCatalog — manifest sovrascritto → problems[], mai entry trusted**

In `MarketplaceLocalCatalog.test.ts` (describe `buildLocalCatalog`):

```ts
  it("manifest sovrascritto post-install (schema-valido ma non firmato) → problems[], MAI entry trusted", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1_000)
    await installScaffolded(pm, { id: "io.test.catalog-tamper", name: "Originale" })

    const tampered = JSON.stringify({
      manifestVersion: 1,
      id: "io.test.catalog-tamper",
      name: "Tamperato",
      version: "0.1.0",
      protocol: ">=1.0 <2.0",
      entry: "entry.html",
      surfaces: ["panel"],
      capabilities: { "board.read": {}, "board.write": {} },
      publisher: { id: "attacker", pubkey: "ed25519:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" },
      privacy: { dataOut: "none" },
    })
    await store.write(manifestPath("io.test.catalog-tamper"), new Blob([tampered]))

    const catalog = await buildLocalCatalog(store)
    expect(catalog.entries.map((e) => e.toolId)).not.toContain("io.test.catalog-tamper")
    expect(catalog.problems.map((p) => p.toolId)).toContain("io.test.catalog-tamper")
  })
```

- [ ] **Step 3: eseguire i 2 test e OSSERVARE il RED**

Run: `cd apps/studio && npx vitest run src/__tests__/ToolLabGate.test.ts src/__tests__/MarketplaceLocalCatalog.test.ts`
Expected: i 2 test nuovi FAIL (oggi il flusso accetta il manifest alterato: ToolLab ritorna ok:true col manifest tamperato; catalog lo lista come entry). Tutti gli altri verdi.

- [ ] **Step 4: commit RED (test-only, marcati come characterization del bug)**

```bash
git add apps/studio/src/__tests__/ToolLabGate.test.ts apps/studio/src/__tests__/MarketplaceLocalCatalog.test.ts
git commit -m "test(toolhost): RED — manifest installato alterato è trusted (Codex P1.1)"
```

### Task 2: helper verifyInstalledTool in installer.ts (unit test completi)

**Files:**
- Modify: `apps/studio/src/toolhost/installer.ts`
- Test: `apps/studio/src/__tests__/ToolInstaller.test.ts`

**Interfaces:**
- Produces:
```ts
export type InstalledToolVerificationFailure =
  | "not-installed"          // manifest.json assente
  | "install-record-missing" // install.json assente
  | "install-record-invalid" // install.json non parsabile/fuori schema
  | "record-id-mismatch"     // installRecord.toolId !== toolId
  | "manifest-invalid"       // manifest.json non parsabile/fuori schema
  | "manifest-id-mismatch"   // manifest.id !== toolId
  | "signature-invalid"      // firma ed25519 non verifica sui byte salvati
  | "integrity-mismatch"     // manifest.integrity.bundleSha256 !== installRecord.bundleHash

export type InstalledToolVerification =
  | { ok: true; manifest: ToolManifest }
  | { ok: false; reason: InstalledToolVerificationFailure; detail: string }

export async function verifyInstalledTool(
  store: InstallerStore,
  toolId: string,
): Promise<InstalledToolVerification>
```

- [ ] **Step 1: scrivere gli unit test (falsificabili, uno per ramo)**

In `ToolInstaller.test.ts`, nuovo `describe("verifyInstalledTool")`, riusando `MemoryInstallerStore`, `generateKeypair`, `makeSignedManifest`, `signJsonString`:

```ts
describe("verifyInstalledTool", () => {
  const TOOL = "com.example.test-tool"

  async function installLegit(store: MemoryInstallerStore, overrides?: Record<string, unknown>) {
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey, overrides)
    await installTool(store, manifestJson, new Blob(["bundle-bytes"]), signature, () => 1000)
    return { pubkeyB64, privateKey, manifestJson, signature }
  }

  it("install legittimo → ok:true col manifest salvato", async () => {
    const store = new MemoryInstallerStore()
    await installLegit(store)
    const v = await verifyInstalledTool(store, TOOL)
    expect(v.ok).toBe(true)
    if (!v.ok) return
    expect(v.manifest.id).toBe(TOOL)
  })

  it("non installato → not-installed", async () => {
    const store = new MemoryInstallerStore()
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "not-installed" })
  })

  it("install.json assente → install-record-missing (install parziale mai trusted)", async () => {
    const store = new MemoryInstallerStore()
    await installLegit(store)
    await store.delete(installRecordPath(TOOL))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "install-record-missing" })
  })

  it("install.json corrotto → install-record-invalid", async () => {
    const store = new MemoryInstallerStore()
    await installLegit(store)
    await store.write(installRecordPath(TOOL), new Blob(["{broken"]))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "install-record-invalid" })
  })

  it("installRecord.toolId diverso → record-id-mismatch", async () => {
    const store = new MemoryInstallerStore()
    await installLegit(store)
    const rec = JSON.parse(await (await store.read(installRecordPath(TOOL)))!.text())
    rec.toolId = "com.other.tool"
    await store.write(installRecordPath(TOOL), new Blob([JSON.stringify(rec)]))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "record-id-mismatch" })
  })

  it("manifest.json corrotto → manifest-invalid", async () => {
    const store = new MemoryInstallerStore()
    await installLegit(store)
    await store.write(manifestPath(TOOL), new Blob(["{not json"]))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "manifest-invalid" })
  })

  it("manifest.id spostato (kill-list bypass) → manifest-id-mismatch", async () => {
    const store = new MemoryInstallerStore()
    const { privateKey, pubkeyB64 } = await installLegit(store)
    // Manifest schema-valido rifirmato con la STESSA chiave ma id diverso:
    // anche una firma valida non deve salvare un id shift.
    const { manifestJson: shifted } = await makeSignedManifest(pubkeyB64, privateKey, {
      id: "com.attacker.shifted",
    })
    await store.write(manifestPath(TOOL), new Blob([shifted]))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "manifest-id-mismatch" })
  })

  it("manifest riscritto stesso id, capability extra, non rifirmato → signature-invalid", async () => {
    const store = new MemoryInstallerStore()
    const { manifestJson } = await installLegit(store)
    const escalated = manifestJson.replace(
      '"capabilities":{"board.read":{}}',
      '"capabilities":{"board.read":{},"board.write":{}}',
    )
    expect(escalated).not.toBe(manifestJson) // il replace deve aver morso
    await store.write(manifestPath(TOOL), new Blob([escalated]))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "signature-invalid" })
  })

  it("integrity firmata ma installRecord.bundleHash divergente → integrity-mismatch", async () => {
    const store = new MemoryInstallerStore()
    const bundle = new Blob(["bundle-bytes"])
    const sha = btoa(String.fromCharCode(
      ...new Uint8Array(await crypto.subtle.digest("SHA-256", await bundle.arrayBuffer())),
    ))
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey, {
      integrity: { bundleSha256: sha },
    })
    await installTool(store, manifestJson, bundle, signature, () => 1000)
    const rec = JSON.parse(await (await store.read(installRecordPath(TOOL)))!.text())
    rec.bundleHash = "AAAA/tampered/hash="
    await store.write(installRecordPath(TOOL), new Blob([JSON.stringify(rec)]))
    const v = await verifyInstalledTool(store, TOOL)
    expect(v).toMatchObject({ ok: false, reason: "integrity-mismatch" })
  })

  it("integrity firmata e record coerente → ok:true", async () => {
    const store = new MemoryInstallerStore()
    const bundle = new Blob(["bundle-bytes"])
    const sha = btoa(String.fromCharCode(
      ...new Uint8Array(await crypto.subtle.digest("SHA-256", await bundle.arrayBuffer())),
    ))
    const { pubkeyB64, privateKey } = await generateKeypair()
    const { manifestJson, signature } = await makeSignedManifest(pubkeyB64, privateKey, {
      integrity: { bundleSha256: sha },
    })
    await installTool(store, manifestJson, bundle, signature, () => 1000)
    const v = await verifyInstalledTool(store, TOOL)
    expect(v.ok).toBe(true)
  })
})
```

(aggiungere `verifyInstalledTool` all'import da `../toolhost/installer.ts`)

- [ ] **Step 2: run → RED (verifyInstalledTool non esiste)**

Run: `cd apps/studio && npx vitest run src/__tests__/ToolInstaller.test.ts`
Expected: FAIL — `verifyInstalledTool` is not exported / not a function.

- [ ] **Step 3: implementare l'helper in installer.ts**

In fondo alla sezione `// ---- Query ----` di `installer.ts`:

```ts
// ---- Reverify post-install (Codex P1.1) ----

export type InstalledToolVerificationFailure =
  | "not-installed"
  | "install-record-missing"
  | "install-record-invalid"
  | "record-id-mismatch"
  | "manifest-invalid"
  | "manifest-id-mismatch"
  | "signature-invalid"
  | "integrity-mismatch"

export type InstalledToolVerification =
  | { ok: true; manifest: ToolManifest }
  | { ok: false; reason: InstalledToolVerificationFailure; detail: string }

/**
 * Riverifica la catena di trust di un tool GIÀ installato, sui byte salvati.
 * installTool verifica at-install; questo helper è la difesa post-install:
 * un write locale a manifest.json (id spostato, capability extra) non deve
 * mai produrre un manifest trusted né aggirare la kill-list sull'id originale.
 *
 * Limite dichiarato: la catena è auto-referenziale dentro lo store (la pubkey
 * sta nel manifest stesso) — un attaccante che riscrive in modo coerente
 * manifest + install.json non è rilevabile senza un trust anchor esterno
 * (publisher trust store, fuori scope qui). Difende da tamper parziale,
 * id-shift e corruzione; fail-closed, mai throw per tamper.
 */
export async function verifyInstalledTool(
  store: InstallerStore,
  toolId: string,
): Promise<InstalledToolVerification> {
  if (!isValidToolId(toolId)) {
    return { ok: false, reason: "not-installed", detail: `invalid tool id: ${toolId}` }
  }
  const manifestBlob = await store.read(manifestPath(toolId))
  if (manifestBlob === null) {
    return { ok: false, reason: "not-installed", detail: `no manifest.json for "${toolId}"` }
  }
  const recordBlob = await store.read(installRecordPath(toolId))
  if (recordBlob === null) {
    return { ok: false, reason: "install-record-missing", detail: `no install.json for "${toolId}"` }
  }
  let record: InstallRecord
  try {
    record = InstallRecordSchema.parse(JSON.parse(await recordBlob.text()))
  } catch (error) {
    return { ok: false, reason: "install-record-invalid", detail: String(error) }
  }
  if (record.toolId !== toolId) {
    return {
      ok: false,
      reason: "record-id-mismatch",
      detail: `install.json is for "${record.toolId}", expected "${toolId}"`,
    }
  }
  const manifestJson = await manifestBlob.text()
  let manifest: ToolManifest
  try {
    manifest = ToolManifestSchema.parse(JSON.parse(manifestJson))
  } catch (error) {
    return { ok: false, reason: "manifest-invalid", detail: String(error) }
  }
  if (manifest.id !== toolId) {
    return {
      ok: false,
      reason: "manifest-id-mismatch",
      detail: `manifest.id is "${manifest.id}", expected "${toolId}" (id shift = kill-list bypass)`,
    }
  }
  let signatureOk = false
  try {
    const pubkeyBytes = extractPubkeyBytes(manifest.publisher.pubkey)
    const sigBytes = decodeSignature(record.signature)
    signatureOk = await verifyEd25519(new TextEncoder().encode(manifestJson), sigBytes, pubkeyBytes)
  } catch {
    signatureOk = false
  }
  if (!signatureOk) {
    return {
      ok: false,
      reason: "signature-invalid",
      detail: `stored manifest bytes do not verify against install.json signature for "${toolId}"`,
    }
  }
  if (manifest.integrity !== undefined && manifest.integrity.bundleSha256 !== record.bundleHash) {
    return {
      ok: false,
      reason: "integrity-mismatch",
      detail: `manifest commits to a bundle hash different from install.json bundleHash for "${toolId}"`,
    }
  }
  return { ok: true, manifest }
}
```

- [ ] **Step 4: run → GREEN**

Run: `cd apps/studio && npx vitest run src/__tests__/ToolInstaller.test.ts`
Expected: PASS (tutti, inclusi i 10 nuovi).

- [ ] **Step 5: commit**

```bash
git add apps/studio/src/toolhost/installer.ts apps/studio/src/__tests__/ToolInstaller.test.ts
git commit -m "feat(toolhost): verifyInstalledTool — reverify fail-closed del manifest installato (Codex P1.1)"
```

### Task 3: consumare l'helper in ToolLab e localCatalog → i RED di Task 1 diventano GREEN

**Files:**
- Modify: `apps/studio/src/toolhost/toolLab.ts:91-97`
- Modify: `apps/studio/src/toolhost/marketplace/localCatalog.ts:53-71`

**Interfaces:**
- Consumes: `verifyInstalledTool` (Task 2).
- Produces: nessuna nuova API pubblica; `ToolLabGateResult` INVARIATO (`design/ToolLab.tsx` non si tocca).

- [ ] **Step 1: toolLab.ts — sostituire read+parse crudo con verifyInstalledTool**

Sostituire il blocco "Fonte di verità = i byte installati" (righe 91-97):

```ts
  // Fonte di verità = i byte installati (firmati) RIVERIFICATI: firma
  // ed25519 sui byte salvati + id match + install record (Codex P1.1) —
  // un manifest.json alterato post-install non è mai trusted.
  const verified = await verifyInstalledTool(store, toolId)
  if (!verified.ok) {
    return {
      ok: false,
      reason: "not-mountable",
      detail: `installed artifacts di "${toolId}" non verificati (${verified.reason}): ${verified.detail}`,
    }
  }
  return { ok: true, manifest: verified.manifest, entryHtml }
```

e aggiornare gli import: `import { isToolInstalled, verifyInstalledTool } from "./installer"` (rimuovere `manifestPath` e `ToolManifestSchema` se non più usati).

- [ ] **Step 2: localCatalog.ts — entry solo se verificata, altrimenti problems[]**

Sostituire il corpo del loop di `buildLocalCatalog`:

```ts
  for (const toolId of (await listInstalledTools(store)).sort()) {
    // Reverify fail-closed (Codex P1.1): un manifest alterato post-install
    // finisce in problems[] col motivo — mai una entry trusted.
    const verified = await verifyInstalledTool(store, toolId)
    if (!verified.ok) {
      problems.push({ toolId, problem: `${verified.reason}: ${verified.detail}` })
      continue
    }
    const manifest = verified.manifest
    entries.push({
      toolId,
      name: manifest.name,
      version: manifest.version,
      ...(manifest.kind !== undefined ? { kind: manifest.kind } : {}),
      ...(manifest.author !== undefined ? { author: manifest.author } : {}),
      ...(manifest.visibility !== undefined ? { visibility: manifest.visibility } : {}),
      ...(manifest.license !== undefined ? { license: manifest.license } : {}),
      state: await pm.getState(toolId),
    })
  }
```

import: `import { listInstalledTools, verifyInstalledTool } from "../installer.ts"` (rimuovere `manifestPath` se non più usato; il try/catch esterno non serve più — verifyInstalledTool non throwa per tamper).

- [ ] **Step 3: run mirato → GREEN sui RED di Task 1 + nessuna regressione**

Run: `cd apps/studio && npx vitest run src/__tests__/ToolLabGate.test.ts src/__tests__/MarketplaceLocalCatalog.test.ts src/__tests__/ToolInstaller.test.ts src/__tests__/ToolLab.test.tsx src/__tests__/PluginManager.test.ts src/__tests__/PluginPackage.test.ts`
Expected: PASS tutti (i 2 RED di Task 1 ora verdi; test esistente "manifest corrotto → problems[]" resta verde perché verifyInstalledTool mappa JSON rotto su manifest-invalid → problems[]).

- [ ] **Step 4: commit**

```bash
git add apps/studio/src/toolhost/toolLab.ts apps/studio/src/toolhost/marketplace/localCatalog.ts
git commit -m "fix(toolhost): ToolLab e localCatalog riverificano il manifest installato (fail-closed, Codex P1.1)"
```

### Task 4: CoV completo + PR + merge

**Files:** nessun file nuovo (solo verifiche).

- [ ] **Step 1: tsc** — `cd apps/studio && npx tsc -b` → exit 0
- [ ] **Step 2: full suite ×3** — `npx vitest run` ×3, esito via `grep -E "Test Files|^\s+Tests "` (mai tail -3). Expected: ≥1113 passed / 5 skipped +14 nuovi, 0 fail, ×3 stabile.
- [ ] **Step 3: build** — `npx vite build` → exit 0
- [ ] **Step 4: NUL/secret scan** — python NUL-check sui file toccati; grep anti-privatekey nei diff (nessun segreto).
- [ ] **Step 5: PR** — push branch, `gh pr create` con corpo: finding P1.1, modello trust, test falsificabili, rollback.
- [ ] **Step 6: CI verde, `gh pr list` PRIMA del merge, merge via `bin/pr-merge-verify.sh <pr> ../ardesia-wt-merge-verify`**
- [ ] **Step 7: post-merge suite dalla worktree merge-verify** — nuova baseline attesa ~1127/5.

## Self-Review

- Spec coverage: helper (Task 2) ✓, consumo ToolLab+localCatalog (Task 3) ✓, test tamper manifest/id/signature/record (Task 1+2) ✓, kill-list id mismatch scenario (unit "manifest-id-mismatch" + RED ToolLab con id spostato) ✓, compatibilità legacy (manifest senza integrity → nessun check integrity; install.json mancante = fail-closed MA solo per superfici che chiamano l'helper — install legacy della stessa pipeline scrive sempre install.json dall'inizio, quindi nessuna migrazione) ✓, rollback ✓, no collisione graph.query ✓.
- Placeholder scan: nessun TBD/TODO; ogni step ha codice o comando esatto.
- Type consistency: `InstalledToolVerification`/`InstalledToolVerificationFailure` uniformi tra Task 2 e 3; `ToolLabGateResult` invariato.
