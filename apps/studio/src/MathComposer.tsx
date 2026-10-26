import { useLayoutEffect, useId, useRef, useState } from "react"
import { MathfieldElement } from "mathlive"
import { IconFunction, IconCheck } from "./design/icons"
import "./formula-composer/MathComposer.css"

// Vite serves/emits the fonts from the locked MathLive package at this local base.
// Guard per ambienti senza DOM reale (jsdom test, SSR).
if (typeof MathfieldElement !== "undefined") {
  MathfieldElement.fontsDirectory = `${import.meta.env.BASE_URL}mathlive-fonts`
  MathfieldElement.soundsDirectory = null
}

type ChipDef = { label: string; latex: string }

const CHIPS: ChipDef[] = [
  { label: "frazione", latex: "\\frac{#0}{#?}" },
  { label: "radice", latex: "\\sqrt{#0}" },
  { label: "integrale", latex: "\\int_{#?}^{#?} #0\\,dx" },
  { label: "sommatoria", latex: "\\sum_{#?}^{#?} #0" },
  { label: "limite", latex: "\\lim_{#? \\to #?} #0" },
  { label: "matrice", latex: "\\begin{pmatrix} #0 & #? \\\\ #? & #? \\end{pmatrix}" },
]

// MathLive owns selection, placeholders, history and its virtual keyboard.
// onInsert must reject on failure so the same draft remains available for retry.
export default function MathComposer({ onClose, onInsert }: { onClose: () => void; onInsert: (latex: string) => void | Promise<void> }) {
  const host = useRef<HTMLDivElement>(null)
  const mfRef = useRef<MathfieldElement | null>(null)
  const pendingRef = useRef(false)
  const hintId = useId()
  const [pending, setPending] = useState(false)
  const [empty, setEmpty] = useState(false)
  const [history, setHistory] = useState({ undo: false, redo: false })
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (!host.current) return
    const mf = new MathfieldElement()
    mf.value = "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
    // Explicit host/native controls avoid auto-on-focus reopening the touch
    // keyboard while a toolbar command is trying to hide it.
    mf.mathVirtualKeyboardPolicy = "manual"
    mf.style.cssText = "width:100%;min-height:64px;font-size:30px;"
    mf.setAttribute("aria-label", "Formula matematica")
    mf.setAttribute("aria-describedby", hintId)
    const sync = () => {
      setEmpty(!mf.value.trim())
      setHistory({ undo: mf.canUndo(), redo: mf.canRedo() })
    }
    mf.addEventListener("input", sync)
    mf.addEventListener("undo-state-change", sync)
    mfRef.current = mf
    host.current.appendChild(mf)
    mf.focus()
    sync()
    return () => {
      mfRef.current = null
      mf.removeEventListener("input", sync)
      mf.removeEventListener("undo-state-change", sync)
      // Close the shared controller directly: the mathfield command wrapper
      // queues an update against the model that is about to be disposed.
      if (window.mathVirtualKeyboard?.visible) window.mathVirtualKeyboard.hide()
      mf.remove()
    }
  }, [hintId])

  function insertTemplate(latex: string) {
    const mf = mfRef.current
    if (!mf || pendingRef.current) return
    mf.focus()
    mf.executeCommand("complete")
    mf.insert(latex, { format: "latex", mode: "math", insertionMode: "replaceSelection", selectionMode: "placeholder" })
    setEmpty(!mf.value.trim())
    setHistory({ undo: mf.canUndo(), redo: mf.canRedo() })
  }

  function command(selector: "undo" | "redo" | "toggleVirtualKeyboard") {
    const mf = mfRef.current
    if (!mf || pendingRef.current) return
    mf.focus()
    mf.executeCommand(selector)
    setEmpty(!mf.value.trim())
    setHistory({ undo: mf.canUndo(), redo: mf.canRedo() })
  }

  async function copyLatex() {
    const mf = mfRef.current
    if (!mf || pendingRef.current) return
    setError(null)
    setNotice(null)
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard non disponibile")
      await navigator.clipboard.writeText(mf.value)
      if (mfRef.current === mf) setNotice("LaTeX copiato.")
    } catch {
      if (mfRef.current === mf) setError("La copia non è riuscita. Riprova o seleziona la formula e usa il comando di copia.")
    }
  }

  async function insert() {
    const mf = mfRef.current
    if (!mf || pendingRef.current) return
    const v = mf.value.trim()
    if (!v) return
    pendingRef.current = true
    mf.readOnly = true
    mf.disabled = true
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      await onInsert(v)
      if (mfRef.current === mf) onClose()
    } catch (reason) {
      if (mfRef.current === mf) {
        const detail = reason instanceof Error ? reason.message : "Riprova tra un istante."
        setError(`Inserimento non riuscito: ${detail}`)
      }
    } finally {
      pendingRef.current = false
      if (mfRef.current === mf) {
        mf.readOnly = false
        mf.disabled = false
        setPending(false)
      }
    }
  }

  return (
    <div className="st-card st-composer-panel" aria-busy={pending}>
      <div className="st-card-line st-composer-header">
        <span className="st-card-title">Formula</span>
        <button onClick={insert} className="st-primary" disabled={pending || empty}>
          <IconFunction /> {pending ? "inserimento in corso…" : "inserisci sulla lavagna"}
        </button>
        <button onClick={copyLatex} className="st-ghost" disabled={pending || empty}>copia LaTeX</button>
        <button onClick={onClose} className="st-ghost st-composer-close" disabled={pending}>chiudi</button>
      </div>
      <div className="st-composer-chips">
        {CHIPS.map((c) => (
          <button key={c.label} className="st-chip" disabled={pending} onClick={() => insertTemplate(c.latex)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="st-card-line st-formula-tools" role="group" aria-label="Modifica formula">
        <button className="st-ghost" disabled={pending || !history.undo} onClick={() => command("undo")}>annulla</button>
        <button className="st-ghost" disabled={pending || !history.redo} onClick={() => command("redo")}>ripeti</button>
        <button className="st-ghost" disabled={pending} onClick={() => command("toggleVirtualKeyboard")}>tastiera matematica</button>
      </div>
      <div ref={host} className="st-composer-field" />
      {error && <p role="alert" className="st-err">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <p id={hintId} className="st-composer-hint">
        Scrivi (es. <code>x^2</code>, <code>\int</code>, <code>\frac</code>).
        {" "}Le strutture si inseriscono nel cursore o nella selezione. Usa Tab per i campi vuoti.
        {" "}<IconCheck aria-hidden /> "Inserisci sulla lavagna" la mette come immagine sul canvas (spostabile/ridimensionabile).
      </p>
    </div>
  )
}
