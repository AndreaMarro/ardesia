// @vitest-environment jsdom
// PACK-01 — chi RICEVE uno student pack deve poterlo aprire.
//
// Prima di questa slice l'unico posto in cui un pack si riapriva era
// TeacherDashboardView (?vista=cruscotto): l'input [data-z7-import] vive
// dentro il cruscotto, che monta la projection dell'event-log di chi ha
// prodotto il pack. Il round-trip esisteva ma girava tutto dalla parte di
// chi produce — chi impara riceveva un file e non aveva nessuna porta.
//
// L'oracolo ha due lati e nessuna lista scritta a mano:
//  1. comportamento — la superficie di chi riceve apre un pack avendo SOLO
//     il file: niente deps, niente event-log seminato, niente cruscotto;
//  2. struttura — la chiusura transitiva degli import DI VALORE della
//     superficie di chi riceve non contiene nessun modulo che CHIAMA
//     buildStudentPackArtifact. Il referente e' derivato due volte
//     dall'oggetto: la chiusura si calcola leggendo gli import, e "chi
//     produce" si ricava cercando la chiamata al costruttore, mai un path
//     scritto qui dentro. Se domani chi produce cambia nome o file,
//     l'oracolo lo segue.
//
// Nota di onesta' sul lato 2: segue gli import DI VALORE (quelli che
// esistono a runtime). `import type` e' cancellato dalla compilazione e non
// impedisce a nessuno di aprire un file, quindi non e' contato — e non
// viene qui dichiarato riparato.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import StudentPackView from "../design/StudentPackView"
import { isStudentPackView } from "../store/studentPackView"
import {
  STUDENT_PACK_FORMAT,
  buildStudentPackArtifact,
} from "../lessonos/studentPackArtifact"

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC_ROOT = resolve(HERE, "..")
const RECIPIENT_ENTRY = join(SRC_ROOT, "design", "StudentPackView.tsx")
const ARTIFACT_MODULE = join(SRC_ROOT, "lessonos", "studentPackArtifact.ts")

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/")
})

const PACK_SOURCE = {
  candidateId: "sp-error:corto-1",
  errorId: "error:corto-1",
  fromRoom: "3b-elab",
  label: { it: "Corto circuito sulla riga i", en: "Short circuit on row i" },
  evidenceRefs: ["board:wire9", "manual:vol1:p29"],
}

function packFile(): File {
  const artifact = buildStudentPackArtifact(PACK_SOURCE, { now: 4242 })
  return new File([JSON.stringify(artifact)], "studentpack-ricevuto.json", {
    type: "application/json",
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Lato 1 — comportamento: il file basta.
// ─────────────────────────────────────────────────────────────────────────

describe("PACK-01 — chi riceve apre il pack avendo solo il file", () => {
  it("apre un pack valido senza deps, senza event-log e senza cruscotto", async () => {
    const { container } = render(<StudentPackView />)
    const input = container.querySelector<HTMLInputElement>("[data-pack-open]")
    if (input === null) throw new Error("nessun ingresso per aprire il pack ricevuto")

    fireEvent.change(input, { target: { files: [packFile()] } })
    await waitFor(() => {
      if (container.querySelector("[data-imported-pack]") === null) {
        throw new Error("pack non riaperto")
      }
    })

    expect(container.textContent).toContain("Corto circuito sulla riga i")
    expect(container.textContent).toContain("manual:vol1:p29")
    expect(
      container.querySelector('[data-imported-pack-id="sp-error:corto-1"]'),
    ).not.toBeNull()
  })

  it("FALSIFICA fail-closed: file non valido = errore dichiarato, mai un pack a meta'", async () => {
    const { container } = render(<StudentPackView />)
    const input = container.querySelector<HTMLInputElement>("[data-pack-open]")!

    fireEvent.change(input, {
      target: { files: [new File(["{rotto"], "x.json", { type: "application/json" })] },
    })
    await waitFor(() => {
      if (container.querySelector("[data-pack-open-error]") === null) {
        throw new Error("errore non dichiarato")
      }
    })
    expect(container.querySelector("[data-imported-pack]")).toBeNull()

    const altroFormato = new File(
      [JSON.stringify({ format: "altro/1", exportedAt: 1, packs: [] })],
      "y.json",
      { type: "application/json" },
    )
    fireEvent.change(input, { target: { files: [altroFormato] } })
    await waitFor(() => {
      if (container.querySelector("[data-pack-open-error]") === null) {
        throw new Error("errore non dichiarato")
      }
    })
    expect(container.textContent).toContain(STUDENT_PACK_FORMAT)
  })

  it("la route ?vista=pack porta a questa superficie, e nessun'altra query la apre", () => {
    window.history.replaceState(null, "", "/?vista=pack")
    expect(isStudentPackView()).toBe(true)
    window.history.replaceState(null, "", "/?vista=cruscotto")
    expect(isStudentPackView()).toBe(false)
    window.history.replaceState(null, "", "/")
    expect(isStudentPackView()).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────
// Lato 2 — struttura: referente derivato, nessun path scritto a mano.
// ─────────────────────────────────────────────────────────────────────────

/** Sorgenti sotto src/, derivate camminando l'albero (nessuna lista). */
function allSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) allSourceFiles(full, out)
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

/** Specificatori importati come VALORE (import type escluso: e' cancellato). */
function valueImportSpecifiers(source: string): string[] {
  const specs: string[] = []
  let match: RegExpExecArray | null

  const withClause = /import\s+([\s\S]*?)\s+from\s*["']([^"']+)["']/g
  while ((match = withClause.exec(source)) !== null) {
    const clause = (match[1] ?? "").trim()
    const spec = match[2] ?? ""
    // `import type { X } from "..."` — cancellato dalla compilazione.
    if (/^type\b/.test(clause)) continue
    // `import { type X, type Y } from "..."` — nessun valore se TUTTI i nomi
    // sono type-only e non c'e' un default/namespace fuori dalle graffe.
    const onlyBraces = /^\{[\s\S]*\}$/.test(clause)
    if (onlyBraces) {
      const names = clause
        .slice(1, -1)
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name !== "")
      if (names.length > 0 && names.every((name) => /^type\s/.test(name))) continue
    }
    specs.push(spec)
  }

  const sideEffect = /(?:^|\n)\s*import\s*["']([^"']+)["']/g
  while ((match = sideEffect.exec(source)) !== null) specs.push(match[1] ?? "")
  return specs
}

function resolveLocal(fromFile: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null
  const base = resolve(dirname(fromFile), spec)
  const bare = base.replace(/\.(js|jsx)$/, "")
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${bare}.ts`,
    `${bare}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

/** Chiusura transitiva degli import di valore, a partire dall'entry. */
function valueImportClosure(entry: string): Set<string> {
  const seen = new Set<string>()
  const stack = [entry]
  while (stack.length > 0) {
    const file = stack.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    const source = readFileSync(file, "utf8")
    for (const spec of valueImportSpecifiers(source)) {
      const resolved = resolveLocal(file, spec)
      if (resolved !== null && !seen.has(resolved)) stack.push(resolved)
    }
  }
  seen.delete(entry)
  return seen
}

/**
 * Chi PRODUCE il pack, derivato dall'oggetto: i moduli che CHIAMANO
 * buildStudentPackArtifact. Il modulo che lo definisce non conta.
 */
function producerModules(): string[] {
  return allSourceFiles(SRC_ROOT)
    .filter((file) => file !== ARTIFACT_MODULE)
    .filter((file) => !file.includes(`${join("src", "__tests__")}`))
    .filter((file) => /\bbuildStudentPackArtifact\s*\(/.test(readFileSync(file, "utf8")))
}

describe("PACK-01 — la porta di chi riceve non passa da chi produce", () => {
  it("l'oracolo non e' vuoto: esiste almeno un modulo che produce pack", () => {
    // Senza questo assert il test sotto sarebbe verde per inerzia il giorno
    // in cui nessuno producesse piu' pack.
    expect(producerModules().length).toBeGreaterThan(0)
  })

  it("la chiusura degli import di valore di chi riceve non tocca chi produce", () => {
    const closure = valueImportClosure(RECIPIENT_ENTRY)
    const reached = producerModules().filter((producer) => closure.has(producer))
    expect(reached).toEqual([])
  })

  it("chi riceve raggiunge comunque il parser del pack (non e' isolata a vuoto)", () => {
    expect(valueImportClosure(RECIPIENT_ENTRY).has(ARTIFACT_MODULE)).toBe(true)
  })
})
