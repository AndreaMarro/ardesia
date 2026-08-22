// @vitest-environment node
//
// TOOLHOST §2/§3 — PluginManager: lifecycle install/uninstall/enable/disable a
// runtime sul confine SDK Layer-0, con il kill-switch come overlay.
//
// WebCrypto Ed25519 reali (Node 22+); coppie di chiavi fresh per run. La firma è
// sui BYTE del JSON originale (stesso contratto dell'installer).

import { describe, expect, it, vi } from "vitest"
import { CONTRACT_VERSION } from "../sdk/index.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import { PluginManager, lifecyclePath, LifecycleDocSchema } from "../toolhost/pluginManager.ts"
import { installTool, manifestPath } from "../toolhost/installer.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import { addToKillList, checkKillList, removeFromKillList } from "../toolhost/killList.ts"
import { storagePrefix } from "../toolhost/caps/storage.ts"
import type { StorageEntryLike } from "../toolhost/caps/storage.ts"
import { statePath } from "../toolhost/host.ts"
// Alias: più giù alcuni test hanno una costante locale `auditPath`, e questo è
// il costruttore VERO di quel path.
import { auditPath as auditPathDelTool } from "../toolhost/audit.ts"

// ---------- harness ----------

class MemoryInstallerStore implements InstallerStore {
  files = new Map<string, Blob>()
  async read(path: string): Promise<Blob | null> {
    return this.files.get(path) ?? null
  }
  async write(path: string, data: Blob): Promise<void> {
    this.files.set(path, data)
  }
  async delete(path: string): Promise<void> {
    this.files.delete(path)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this.files.entries()]
      .filter(([p]) => prefix === undefined || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

/**
 * Store la cui `list(prefix)` restituisce di proposito ANCHE elementi fuori dal
 * prefisso richiesto.
 *
 * `StorageDriverLike` dichiara il filtro come RICHIESTO, non come garantito: un
 * driver che lo sbaglia resta dentro il contratto, e una purga che si fida
 * dell'elenco altrui esce dal sottoalbero del tool. Con lo store ordinato qui
 * sopra il `startsWith(root)` dell'implementazione sarebbe verde per inerzia —
 * non perché protegge, ma perché non ha mai niente da respingere.
 */
class StoreConListGenerosa extends MemoryInstallerStore {
  override async list(_prefix?: string): Promise<StorageEntryLike[]> {
    return [...this.files.entries()].map(([path, data]) => ({ path, data }))
  }
}

async function generateKeypair(): Promise<{ pubkeyB64: string; privateKey: CryptoKey }> {
  const keypair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
  const pubkeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", keypair.publicKey))
  const pubkeyB64 = btoa(String.fromCharCode(...pubkeyRaw))
  return { pubkeyB64, privateKey: keypair.privateKey }
}

async function signJsonString(jsonString: string, privateKey: CryptoKey): Promise<string> {
  const msg = new TextEncoder().encode(jsonString)
  const sigRaw = new Uint8Array(await crypto.subtle.sign("Ed25519", privateKey, msg))
  return btoa(String.fromCharCode(...sigRaw))
}

async function makeSignedManifest(
  overrides?: Record<string, unknown>,
): Promise<{ manifestJson: string; signature: string; toolId: string }> {
  const { pubkeyB64, privateKey } = await generateKeypair()
  const obj = {
    manifestVersion: 1,
    id: "com.example.test-tool",
    name: "Test Tool",
    version: "1.0.0",
    protocol: ">=1.0 <2.0",
    entry: "dist/index.html",
    surfaces: ["panel"],
    capabilities: { "board.read": {} },
    publisher: { id: "example", pubkey: `ed25519:${pubkeyB64}` },
    privacy: { dataOut: "none" },
    ...overrides,
  }
  const manifestJson = JSON.stringify(obj)
  const signature = await signJsonString(manifestJson, privateKey)
  return { manifestJson, signature, toolId: obj.id as string }
}

/** Installa via manager con clock fisso; ritorna toolId. */
async function installViaManager(
  pm: PluginManager,
  overrides?: Record<string, unknown>,
): Promise<string> {
  const { manifestJson, signature, toolId } = await makeSignedManifest(overrides)
  const bundle = new Blob(["fake-zip"], { type: "application/zip" })
  await pm.install(manifestJson, bundle, signature)
  return toolId
}

// ---------- compat: binding al contratto Layer-0 ----------

describe("PluginManager — compat contratto SDK Layer-0", () => {
  it("contractVersion del manager == CONTRACT_VERSION dell'SDK", () => {
    expect(PluginManager.contractVersion).toBe(CONTRACT_VERSION)
  })

  it("il manifest installato via manager è valido contro il contratto (ToolManifestSchema)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 1000)
    const { manifestJson, signature, toolId } = await makeSignedManifest()
    const manifest = await pm.install(manifestJson, new Blob(["z"]), signature)
    expect(manifest.id).toBe(toolId)
    // ri-parse dei byte salvati: ciò che è su disco resta contract-valido
    const saved = await store.read(manifestPath(toolId))
    const savedObj = JSON.parse(await saved!.text())
    expect(() => ToolManifestSchema.parse(savedObj)).not.toThrow()
  })
})

// ---------- lifecycle base ----------

describe("PluginManager — install/enable/disable/uninstall", () => {
  it("install → stato enabled, canMount true, lifecycle.json versionato e timestampato", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 4242)
    const toolId = await installViaManager(pm)

    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await pm.canMount(toolId)).toBe(true)

    const blob = await store.read(lifecyclePath(toolId))
    expect(blob).not.toBeNull()
    const doc = LifecycleDocSchema.parse(JSON.parse(await blob!.text()))
    expect(doc).toEqual({ v: 1, enabled: true, t: 4242 })
  })

  it("disable → stato disabled e canMount false, MA resta installato (manifest presente)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    await pm.disable(toolId)
    expect(await pm.getState(toolId)).toBe("disabled")
    expect(await pm.canMount(toolId)).toBe(false)
    // disabilitare NON disinstalla: il manifest è ancora su disco
    expect(await store.read(manifestPath(toolId))).not.toBeNull()
  })

  it("enable dopo disable → torna enabled (transizione reversibile)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    await pm.disable(toolId)
    expect(await pm.canMount(toolId)).toBe(false)
    await pm.enable(toolId)
    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await pm.canMount(toolId)).toBe(true)
  })

  it("uninstall → stato not-installed, lifecycle.json rimosso, audit PRESERVATO", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    // simula un audit-log accumulato dal runtime
    const auditPath = `tools/${toolId}/audit.jsonl`
    await store.write(auditPath, new Blob(["entry\n"], { type: "application/x-ndjson" }))

    await pm.uninstall(toolId)

    expect(await pm.getState(toolId)).toBe("not-installed")
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await store.read(manifestPath(toolId))).toBeNull()
    // l'audit sopravvive all'uninstall (chi-ha-letto-cosa resta consultabile)
    expect(await store.read(auditPath)).not.toBeNull()
  })

  // P0-C — l'uninstall TOTALE deve rimuovere anche lo stato PER ISTANZA, e
  // SOLO ciò che appartiene al tool disinstallato.
  //
  // Il difetto che questo test esiste per prendere: #242 ha introdotto
  // `statePath(toolId, instanceId)` = `tools/<id>/@instance/<inst>/state.json`,
  // che sta FUORI da `tools/<id>/storage/`. `uninstallTool()` purgava il
  // prefisso storage e poi cancellava quattro stringhe scritte a mano, fra cui
  // `tools/<id>/state.json`: quella dell'istanza sopravviveva alla
  // disinstallazione del plugin.
  //
  // L'oracolo chiama `PluginManager.uninstall()` e non `purgeToolStorage()`,
  // che è un pezzo interno. `PluginManager.uninstall()` è il percorso pubblico
  // REALE del manager — quello che una superficie d'uso invocherebbe — ma oggi
  // NON ha call site di prodotto né di UI. Il conteggio NON si scrive qui: la
  // prima stesura diceva «43 righe», misurato prima che questo commento
  // esistesse, e il commento stesso è fra le righe che quel comando conta —
  // un referente che si invalida scrivendolo. Si legge, e le uniche occorrenze
  // fuori dai test sono DEFINIZIONI, non chiamate:
  //   grep -rn "uninstall" --include='*.ts' --include='*.tsx' src
  //
  // Il difetto era reale nel codice e bloccava la PR; non era qualcosa che una
  // persona potesse incontrare oggi, e questo test prova il percorso del
  // codice, non un percorso utente.
  //
  // OGNI path del fixture è costruito con la funzione REALE di produzione
  // (`statePath`, `storagePrefix`, `auditPath`, `addToKillList`): se domani
  // cambiano forma, il test le segue invece di sorvegliare una stringa che
  // nessuno scrive più. Vale anche per l'audit, che è il path che il prodotto
  // PRESERVA: scriverlo a mano qui avrebbe riaperto nell'oracolo proprio
  // l'enumerazione che la patch toglie dall'implementazione.
  it("uninstall totale: nel sottoalbero del tool sopravvive SOLO l'audit, e nulla di estraneo viene toccato", async () => {
    // La `list` generosa è ciò che rende osservabile il `startsWith(root)`.
    const store = new StoreConListGenerosa()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    const auditPath = auditPathDelTool(toolId)
    // Byte, non testo. L'audit-log è APPEND-ONLY e può contenere una riga
    // interrotta a metà da un crash: qui la coda `0xC3 0x28` è UTF-8 non
    // valido. `Blob.text()` la mappa su U+FFFD, cioè sugli STESSI caratteri di
    // una sequenza di byte diversa — quindi un confronto via `text()` non
    // saprebbe distinguere «preservato» da «riscritto». Il contratto dice
    // durevole, e durevole si misura sui byte.
    const auditBytes = new Uint8Array([
      ...new TextEncoder().encode(`{"v":1,"t":1,"tool":"${toolId}","method":"board.read","outcome":"ok"}\n{"v":1,`),
      0xc3, 0x28,
    ])
    await store.write(auditPath, new Blob([auditBytes], { type: "application/x-ndjson" }))

    // storage: uno legacy (senza istanza) e uno per ciascuna delle due istanze
    await store.write(`${storagePrefix(toolId)}legacy.txt`, new Blob(["storico"]))
    await store.write(`${storagePrefix(toolId, "ist-a")}nota.txt`, new Blob(["di A"]))
    await store.write(`${storagePrefix(toolId, "ist-b")}nota.txt`, new Blob(["di B"]))

    // stato di lifecycle: quello legacy e quello delle due istanze
    await store.write(statePath(toolId), new Blob([`{"v":1,"t":1,"state":{"conta":0}}`]))
    await store.write(statePath(toolId, "ist-a"), new Blob([`{"v":1,"t":1,"state":{"conta":1}}`]))
    await store.write(statePath(toolId, "ist-b"), new Blob([`{"v":1,"t":1,"state":{"conta":2}}`]))

    // ---- ciò che NON appartiene al tool disinstallato ----
    //
    // Un plugin FRATELLO installato per davvero, con il suo storage, il suo
    // stato d'istanza e il suo audit. E il suo id è `…test-tool-vicino`, che
    // ha come PREFISSO l'id del target: un `root` senza `/` finale lo
    // includerebbe, ed è il modo più facile di sbagliare una radice derivata.
    const fratello = await installViaManager(pm, { id: `${toolId}-vicino` })
    await store.write(`${storagePrefix(fratello)}nota.txt`, new Blob(["del fratello"]))
    await store.write(statePath(fratello, "ist-c"), new Blob([`{"v":1,"t":1,"state":{}}`]))
    await store.write(auditPathDelTool(fratello), new Blob(["audit del fratello\n"]))

    // Un artefatto GLOBALE, fuori da qualunque tool.
    await store.write("documenti/lezione.md", new Blob(["# Lezione\n"]))
    // E la kill-list, scritta dalla funzione di produzione: vive a
    // `tools/kill-list.json`, cioè SOPRA il sottoalbero del singolo tool. Un
    // plugin revocato deve restare revocato anche dopo la disinstallazione.
    await addToKillList(store, fratello, "incidente", () => 7)

    // Fotografia: gli estranei si DERIVANO da ciò che è stato seminato, non da
    // un secondo elenco scritto a mano che potrebbe invecchiare.
    const radiceDelTool = `tools/${toolId}/`
    const estranei = [...store.files.keys()].filter((p) => !p.startsWith(radiceDelTool)).sort()
    expect(estranei.length).toBeGreaterThan(0)

    await pm.uninstall(toolId)

    // il plugin non è più installato e il suo lifecycle è sparito
    expect(await pm.getState(toolId)).toBe("not-installed")
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await store.read(manifestPath(toolId))).toBeNull()

    // storage: né il legacy né quello delle istanze
    expect(await store.read(`${storagePrefix(toolId)}legacy.txt`)).toBeNull()
    expect(await store.read(`${storagePrefix(toolId, "ist-a")}nota.txt`)).toBeNull()
    expect(await store.read(`${storagePrefix(toolId, "ist-b")}nota.txt`)).toBeNull()

    // stato: né il legacy né quello delle istanze — le due asserzioni che il
    // control run «la purga salta @instance/» rende rosse
    expect(await store.read(statePath(toolId))).toBeNull()
    expect(await store.read(statePath(toolId, "ist-a"))).toBeNull()
    expect(await store.read(statePath(toolId, "ist-b"))).toBeNull()

    // La proposizione intera, in una riga: nel sottoalbero del tool target
    // sopravvive SOLO `auditPath(toolId)`, e ogni estraneo è ancora al suo
    // posto. Il confronto è sull'INTERO store — non «lo store è vuoto», che
    // sarebbe falso e non lo si pretende — quindi cattura entrambi i modi di
    // sbagliare: un residuo del tool (elemento in più) e una cancellazione
    // collaterale (elemento in meno). Non condivide il punto cieco
    // dell'implementazione: un residuo scritto FUORI dal sottoalbero
    // comparirebbe qui, mentre un `list(radiceDelTool)` non lo vedrebbe mai.
    expect([...store.files.keys()].sort()).toEqual([auditPath, ...estranei].sort())

    // Il fratello resta revocato: la kill-list non è stata raggiunta. Letto con
    // il reader di produzione, non con il path scritto a mano.
    expect(await checkKillList(store, fratello)).toBe(true)

    // L'unico sopravvissuto dichiarato dal contratto, confrontato sui BYTE.
    const audit = await store.read(auditPath)
    expect(audit).not.toBeNull()
    expect([...new Uint8Array(await audit!.arrayBuffer())]).toEqual([...auditBytes])

    // Idempotenza, osservata sulle CANCELLAZIONI e non sull'assenza di throw:
    // `MemoryInstallerStore.delete` è una `Map.delete` e non lancia mai, per
    // nessun input, quindi un `resolves` da solo sarebbe verde anche con
    // un'implementazione che cancella alla cieca. La seconda disinstallazione
    // deve trovare il sottoalbero già vuoto e non emettere NESSUNA delete di
    // purga: l'unica ammessa è quella del lifecycle, che `PluginManager` fa
    // incondizionatamente.
    const spiaDelete = vi.spyOn(store, "delete")
    try {
      await expect(pm.uninstall(toolId)).resolves.toBeUndefined()
      expect(spiaDelete.mock.calls.map(([path]) => path)).toEqual([lifecyclePath(toolId)])
    } finally {
      spiaDelete.mockRestore()
    }

    // e dopo la seconda passata lo store è ancora esattamente quello di prima
    expect([...store.files.keys()].sort()).toEqual([auditPath, ...estranei].sort())
    expect([...new Uint8Array(await (await store.read(auditPath))!.arrayBuffer())]).toEqual([
      ...auditBytes,
    ])
  })

  it("enable/disable su tool NON installato → throw", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store)
    await expect(pm.enable("com.example.ghost")).rejects.toThrow(/not installed/)
    await expect(pm.disable("com.example.ghost")).rejects.toThrow(/not installed/)
  })

  it("re-install dopo uninstall riparte enabled (lifecycle pulito)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await pm.disable(toolId)
    await pm.uninstall(toolId)
    // reinstalla
    await installViaManager(pm)
    expect(await pm.getState(toolId)).toBe("enabled")
  })
})

// ---------- kill-switch: overlay non distruttivo ----------

describe("PluginManager — kill-switch (overlay su enabled)", () => {
  it("kill di un plugin enabled → stato revoked e canMount false (anche con enabled=true su disco)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    expect(await pm.canMount(toolId)).toBe(true)

    await addToKillList(store, toolId, "incidente sicurezza", () => 200)

    expect(await pm.getState(toolId)).toBe("revoked")
    expect(await pm.canMount(toolId)).toBe(false)
    // l'intento enabled su disco NON è stato toccato dal kill-switch
    const blob = await store.read(lifecyclePath(toolId))
    const doc = LifecycleDocSchema.parse(JSON.parse(await blob!.text()))
    expect(doc.enabled).toBe(true)
  })

  it("removeFromKillList ripristina lo stato precedente (enabled) — kill è reversibile", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)

    await addToKillList(store, toolId, "sospetto", () => 200)
    expect(await pm.getState(toolId)).toBe("revoked")

    await removeFromKillList(store, toolId)
    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await pm.canMount(toolId)).toBe(true)
  })

  it("enable di un plugin revocato → throw (il kill-switch vince)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await pm.disable(toolId)
    await addToKillList(store, toolId, "bloccato", () => 200)

    await expect(pm.enable(toolId)).rejects.toThrow(/revoked/)
    // resta revoked, non enabled
    expect(await pm.getState(toolId)).toBe("revoked")
  })

  it("disable su plugin revocato è lecito e persiste: dopo removeFromKillList lo stato è disabled, NON enabled", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await addToKillList(store, toolId, "bloccato", () => 200)

    // il docente spegne l'intento mentre è revocato
    await pm.disable(toolId)
    expect(await pm.getState(toolId)).toBe("revoked")

    await removeFromKillList(store, toolId)
    // l'intento disabled persiste: NON riparte da solo
    expect(await pm.getState(toolId)).toBe("disabled")
    expect(await pm.canMount(toolId)).toBe(false)
  })
})

// ---------- gate: versione di contratto richiesta dal plugin ----------

describe("PluginManager — gate contract version", () => {
  it("rigetta un plugin che RICHIEDE un contratto superiore a quello dell'host (atomico: nessun artefatto)", async () => {
    // host SDK = CONTRACT_VERSION (1.x); il plugin pretende >=2.0 → l'host è inferiore
    // per QUALUNQUE 1.x: il fixture non deve ridiventare valido a ogni MINOR bump
    // (successo con ">=1.1" quando il contratto è passato a 1.1.0).
    // Firmo con una chiave SBAGLIATA di proposito: se l'errore è ancora "incompatible
    // contract" (non "signature"), il gate di contratto ha cortocircuitato PRIMA della
    // verifica firma di installTool → prova l'ordine (gate-prima-di-firma), non solo
    // che "qualcosa" abbia lanciato. Difende contro un reorder gate↔firma.
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, toolId } = await makeSignedManifest({ contract: ">=2.0" })
    const { privateKey: wrongKey } = await generateKeypair()
    const badSig = await signJsonString(manifestJson, wrongKey)

    await expect(pm.install(manifestJson, new Blob(["z"]), badSig)).rejects.toThrow(
      /incompatible contract/,
    )
    // reject PRIMA di installTool: né manifest né lifecycle scritti
    expect(await store.read(manifestPath(toolId))).toBeNull()
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await pm.getState(toolId)).toBe("not-installed")
  })

  it("accetta un plugin il cui range INCLUDE la versione dell'host (gate falsificabile in entrambe le direzioni)", async () => {
    // ">=1.0 <2.0" è soddisfatto da 1.0.0 → install riesce. Un bug "rigetta-tutto"
    // romperebbe QUESTO; un bug "accetta-tutto" romperebbe il test sopra.
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm, { contract: ">=1.0 <2.0" })

    expect(await pm.getState(toolId)).toBe("enabled")
    expect(await store.read(manifestPath(toolId))).not.toBeNull()
  })

  it("manifest SENZA campo contract → install riesce (migrate-safe, zero regressione sui legacy)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm) // nessun override: niente `contract`

    expect(await pm.getState(toolId)).toBe("enabled")
  })

  it("range di contract malformato → reject a parse-schema (sintassi, non compatibilità)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, signature, toolId } = await makeSignedManifest({ contract: "abc" })

    await expect(pm.install(manifestJson, new Blob(["z"]), signature)).rejects.toThrow(
      /invalid contract range/,
    )
    expect(await pm.getState(toolId)).toBe("not-installed")
  })
})

// ---------- robustezza / fail-safe ----------

describe("PluginManager — robustezza", () => {
  it("lifecycle mancante (install diretto via installer) → fail-safe disabled, non enabled", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, signature, toolId } = await makeSignedManifest()
    // install BYPASSANDO il manager (nessun lifecycle.json scritto)
    await installTool(store, manifestJson, new Blob(["z"]), signature, () => 1)

    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await pm.getState(toolId)).toBe("disabled")
    expect(await pm.canMount(toolId)).toBe(false)
    // ma è abilitabile esplicitamente dal docente
    await pm.enable(toolId)
    expect(await pm.getState(toolId)).toBe("enabled")
  })

  it("install FALLITO (firma rotta) → nessun lifecycle.json orfano (write solo dopo install riuscito)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const { manifestJson, toolId } = await makeSignedManifest()
    // firma con una chiave diversa: installTool rigetta PRIMA di scrivere
    const { privateKey: wrongKey } = await generateKeypair()
    const badSig = await signJsonString(manifestJson, wrongKey)

    await expect(pm.install(manifestJson, new Blob(["z"]), badSig)).rejects.toThrow(/signature/)
    // né manifest né lifecycle scritti: install atomico al fallimento
    expect(await store.read(manifestPath(toolId))).toBeNull()
    expect(await store.read(lifecyclePath(toolId))).toBeNull()
    expect(await pm.getState(toolId)).toBe("not-installed")
  })

  it("lifecycle.json corrotto → getState BLOCCA (mai trattare spazzatura come enabled)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const toolId = await installViaManager(pm)
    await store.write(lifecyclePath(toolId), new Blob(["{not json"], { type: "application/json" }))

    await expect(pm.getState(toolId)).rejects.toThrow(/corrupted lifecycle/)
  })

  it("getState su tool id non valido → not-installed (nessun throw)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store)
    expect(await pm.getState("invalid id!")).toBe("not-installed")
  })

  it("list riporta stato per ogni plugin installato (enabled/disabled/revoked)", async () => {
    const store = new MemoryInstallerStore()
    const pm = new PluginManager(store, () => 100)
    const a = await installViaManager(pm, { id: "com.a.alpha" })
    const b = await installViaManager(pm, { id: "com.b.bravo" })
    const c = await installViaManager(pm, { id: "com.c.charlie" })
    await pm.disable(b)
    await addToKillList(store, c, "x", () => 1)

    const list = await pm.list()
    const byId = new Map(list.map((e) => [e.toolId, e.state]))
    expect(byId.get(a)).toBe("enabled")
    expect(byId.get(b)).toBe("disabled")
    expect(byId.get(c)).toBe("revoked")
    expect(list).toHaveLength(3)
  })
})
