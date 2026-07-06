// Officina plugin (?vista=officina-plugin) — P0-D authoring: il wizard VISUALE
// che porta un autore da spec minima a plugin firmato ed esportabile, usando
// SOLO i mattoni reali già in pipeline (nessuna via privilegiata):
//
//   scaffoldPlugin (#83)      — manifest Zod-valido firmato + entry lifecycle-wire
//   lintAuthoring (#78)       — feedback pre-firma (lint REALE, mai duplicato qui)
//   runHandshakeHarness (#94) — collaudo handshake sull'anteprima iframe, 4 check
//   buildPluginPackage (#76)  — export .maestrotool per la pipeline install vera
//
// Fail-closed: "Esporta .maestrotool" si abilita SOLO con harness ok E lint
// senza error — un plugin che non passa il collaudo non esce dall'officina.
//
// Il seam `deps` inietta i mattoni nei test jsdom (firma Ed25519 realm-fragile
// in jsdom); i default sono SEMPRE quelli reali e l'e2e fa il giro vero.

import { useMemo, useRef, useState } from "react"
import { isValidToolId } from "../toolhost-protocol/manifest.ts"
import type { Capabilities } from "../toolhost-protocol/capabilities.ts"
import {
  generateDevKeypair,
  scaffoldPlugin,
} from "../toolhost/authoring/scaffoldPlugin.ts"
import type {
  DevKeypair,
  ScaffoldOutput,
  ScaffoldSpec,
} from "../toolhost/authoring/scaffoldPlugin.ts"
import { lintAuthoring } from "../toolhost/authoring/authoringLint.ts"
import {
  iframeHarnessTarget,
  runHandshakeHarness,
} from "../toolhost/authoring/testHarness.ts"
import type {
  HandshakeHarnessOptions,
  HandshakeHarnessReport,
  HarnessCheckId,
  HarnessToolTarget,
} from "../toolhost/authoring/testHarness.ts"
import { buildPluginPackage } from "../toolhost/authoring/packageFile.ts"

export interface PluginWizardDeps {
  makeKeys?: () => Promise<DevKeypair>
  scaffold?: (spec: ScaffoldSpec, keys: DevKeypair) => Promise<ScaffoldOutput>
  runHarness?: (
    target: HarnessToolTarget,
    options?: HandshakeHarnessOptions,
  ) => Promise<HandshakeHarnessReport>
  makeTarget?: (iframe: HTMLIFrameElement) => HarnessToolTarget
}

// Stesso vincolo di ToolFrame/ToolLab ma SENZA allow-same-origin: l'anteprima
// dell'officina deve solo parlare l'handshake, non toccare storage/origin.
const PREVIEW_SANDBOX = "allow-scripts"

type WizardSurface = "panel" | "board-embed" | "fullscreen"

const CHECK_LABELS: Record<HarnessCheckId, string> = {
  "tool-ready-received": "risposta ricevuta sulla porta",
  "ready-well-formed": "tool.ready ben formato",
  "nonce-echoed": "nonce ecoato esatto",
  "no-out-of-band-reply": "nessun messaggio fuori canale",
}

const CAP_CHOICES = [
  { key: "board.read", label: "board.read — legge la lavagna" },
  { key: "board.write", label: "board.write — scrive i propri embed" },
  { key: "ui", label: "ui — pannelli e notifiche" },
] as const
type CapKey = (typeof CAP_CHOICES)[number]["key"]

function buildCapabilities(selected: Set<CapKey>): Capabilities {
  const caps: Capabilities = {}
  if (selected.has("board.read")) caps["board.read"] = {}
  if (selected.has("board.write")) caps["board.write"] = { scope: "own-embeds" }
  if (selected.has("ui")) caps.ui = {}
  return caps
}

export default function PluginWizard({ deps }: { deps?: PluginWizardDeps }) {
  const makeKeys = deps?.makeKeys ?? generateDevKeypair
  const scaffold = deps?.scaffold ?? scaffoldPlugin
  const runHarness = deps?.runHarness ?? runHandshakeHarness
  const makeTarget = deps?.makeTarget ?? iframeHarnessTarget

  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [surface, setSurface] = useState<WizardSurface>("panel")
  const [caps, setCaps] = useState<Set<CapKey>>(new Set())
  // Campi marketplace (#72): facoltativi, passthrough alla ScaffoldSpec.
  // Vuoti = manifest legacy, nessuna chiave emessa (regola dello scaffolder).
  const [authorName, setAuthorName] = useState("")
  const [authorUrl, setAuthorUrl] = useState("")
  const [license, setLicense] = useState("")
  const [visibility, setVisibility] = useState<"" | "private" | "unlisted" | "public">("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<ScaffoldOutput | null>(null)
  const [report, setReport] = useState<HandshakeHarnessReport | null>(null)
  const [previewReady, setPreviewReady] = useState(false)

  const keysRef = useRef<DevKeypair | null>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)

  const idValid = isValidToolId(id)
  const canGenerate = idValid && name.trim().length > 0 && !busy
  // Lint SEMPRE dal modulo reale sull'output corrente: un solo punto di verità.
  const lint = useMemo(
    () => (output === null ? null : lintAuthoring(output.manifest, output.entryHtml)),
    [output],
  )
  const canExport = output !== null && report?.ok === true && lint?.ok === true

  function toggleCap(key: CapKey): void {
    setCaps((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleGenera(): Promise<void> {
    setBusy(true)
    setError(null)
    setReport(null)
    setPreviewReady(false)
    try {
      const keys = keysRef.current ?? (await makeKeys())
      keysRef.current = keys
      const trimmedAuthor = authorName.trim()
      const trimmedUrl = authorUrl.trim()
      const spec: ScaffoldSpec = {
        id,
        name: name.trim(),
        surfaces: [surface],
        capabilities: buildCapabilities(caps),
        // author solo con nome (URL orfano non inventa un autore).
        ...(trimmedAuthor.length > 0
          ? { author: { name: trimmedAuthor, ...(trimmedUrl.length > 0 ? { url: trimmedUrl } : {}) } }
          : {}),
        ...(license.trim().length > 0 ? { license: license.trim() } : {}),
        ...(visibility !== "" ? { visibility } : {}),
      }
      setOutput(await scaffold(spec, keys))
    } catch (err) {
      setOutput(null)
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleCollaudo(): Promise<void> {
    const iframe = previewRef.current
    if (iframe === null || output === null) return
    setBusy(true)
    setError(null)
    try {
      const result = await runHarness(makeTarget(iframe), {
        grantedCaps: output.manifest.capabilities,
      })
      setReport(result)
    } catch (err) {
      setReport(null)
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }

  function handleExport(): void {
    if (output === null || !canExport) return
    const pkg = buildPluginPackage({
      manifestJson: output.manifestJson,
      signatureB64: output.signatureB64,
      entryHtml: output.entryHtml,
    })
    const url = URL.createObjectURL(pkg)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${output.manifest.id}.maestrotool`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const state = output === null ? "spec" : report === null ? "generated" : "tested"

  return (
    <div className="ow-root" data-plugin-wizard-state={state}>
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">Officina plugin — dalla spec al collaudo</span>
        </span>
      </header>

      <main className="ow-main">
        <section className="ow-form" aria-label="Scheda del plugin">
          <h2 className="ow-heading">Scheda del plugin</h2>
          <p className="ow-lede">
            Compila la scheda: l'officina genera un plugin firmato che parla il
            protocollo reale, lo collaudi qui e lo esporti come .maestrotool.
          </p>

          <label className="ow-field">
            <span className="ow-label">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voltmetro di classe"
            />
          </label>

          <label className="ow-field">
            <span className="ow-label">Identificatore (reverse-DNS)</span>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="it.scuola.voltmetro"
              data-valid={id.length === 0 ? undefined : idValid ? "1" : "0"}
            />
            {id.length > 0 && !idValid && (
              <span className="ow-hint">
                serve la forma reverse-DNS, es. it.scuola.voltmetro
              </span>
            )}
          </label>

          <label className="ow-field">
            <span className="ow-label">Superficie</span>
            <select
              value={surface}
              onChange={(e) => setSurface(e.target.value as WizardSurface)}
            >
              <option value="panel">panel — pannello laterale</option>
              <option value="board-embed">board-embed — vive sulla lavagna</option>
              <option value="fullscreen">fullscreen — tutta la pagina</option>
            </select>
          </label>

          <fieldset className="ow-caps">
            <legend className="ow-label">Capabilities (deny-by-default)</legend>
            {CAP_CHOICES.map((choice) => (
              <label key={choice.key} className="ow-cap">
                <input
                  type="checkbox"
                  checked={caps.has(choice.key)}
                  onChange={() => toggleCap(choice.key)}
                />
                <span>{choice.label}</span>
              </label>
            ))}
          </fieldset>

          <details className="ow-marketplace">
            <summary className="ow-label">Campi marketplace (facoltativi)</summary>
            <label className="ow-field">
              <span className="ow-label">Nome autore</span>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Prof.ssa Rossi"
              />
            </label>
            <label className="ow-field">
              <span className="ow-label">URL autore (richiede il nome)</span>
              <input
                value={authorUrl}
                onChange={(e) => setAuthorUrl(e.target.value)}
                placeholder="https://scuola.example"
              />
            </label>
            <label className="ow-field">
              <span className="ow-label">Licenza</span>
              <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="MIT" />
            </label>
            <label className="ow-field">
              <span className="ow-label">Visibilità</span>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              >
                <option value="">non dichiarata (legacy)</option>
                <option value="private">private</option>
                <option value="unlisted">unlisted</option>
                <option value="public">public</option>
              </select>
            </label>
          </details>

          <button
            className="st-primary ow-genera"
            disabled={!canGenerate}
            onClick={() => void handleGenera()}
          >
            Genera il plugin
          </button>

          {error !== null && (
            <p role="alert" className="ow-error">
              {error}
            </p>
          )}
        </section>

        <section className="ow-bench" aria-label="Banco di collaudo">
          <h2 className="ow-heading">Banco di collaudo</h2>

          {output === null ? (
            <p className="ow-empty">
              Ancora niente da collaudare: compila la scheda e genera il plugin.
              Ogni check qui a destra può fallire — ed è questo il punto.
            </p>
          ) : (
            <>
              <div className="ow-manifest" data-testid="manifest-card">
                <span className="ow-manifest-id">{output.manifest.id}</span>
                <span className="ow-manifest-meta">
                  v{output.manifest.version} · {output.manifest.kind} · firmato ed25519
                  ({output.manifest.publisher.id})
                </span>
              </div>

              {lint !== null && lint.flags.length > 0 && (
                <ul className="ow-lint" aria-label="Lint di authoring">
                  {lint.flags.map((flag, i) => (
                    <li
                      key={`${flag.code}-${i}`}
                      data-testid={`lint-flag-${flag.code}`}
                      data-severity={flag.severity}
                      className="ow-lint-flag"
                    >
                      <span className="ow-lint-code">{flag.code}</span> {flag.detail}
                    </li>
                  ))}
                </ul>
              )}

              <div className="ow-preview">
                <div className="ow-preview-bar">
                  <span
                    className="reference-tool-dot"
                    data-on={previewReady ? "1" : "0"}
                    aria-hidden
                  />
                  anteprima — {output.manifest.name}
                </div>
                <iframe
                  key={output.manifestJson}
                  ref={previewRef}
                  title={`anteprima ${output.manifest.name}`}
                  className="ow-preview-frame"
                  sandbox={PREVIEW_SANDBOX}
                  srcDoc={output.entryHtml}
                  onLoad={() => setPreviewReady(true)}
                />
              </div>

              <button
                className="st-ghost ow-collauda"
                disabled={busy || !previewReady}
                onClick={() => void handleCollaudo()}
              >
                Collauda l'handshake
              </button>

              {report !== null && (
                <ol className="ow-checks" aria-label="Report del collaudo">
                  {report.checks.map((check) => (
                    <li
                      key={check.id}
                      data-testid={`harness-check-${check.id}`}
                      data-pass={check.pass ? "1" : "0"}
                      className="ow-check"
                    >
                      <span className="ow-check-dot" aria-hidden />
                      <span className="ow-check-label">{CHECK_LABELS[check.id]}</span>
                      {check.detail !== undefined && (
                        <span className="ow-check-detail">{check.detail}</span>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              <button
                className="st-primary ow-esporta"
                disabled={!canExport}
                title={
                  canExport
                    ? undefined
                    : "si esporta solo dopo un collaudo verde e un lint senza error"
                }
                onClick={handleExport}
              >
                Esporta .maestrotool
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
