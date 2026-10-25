import { useEffect, useRef } from "react"
import { MathfieldElement } from "mathlive"
import { IconFunction, IconCheck } from "./design/icons"

// Vite serves/emits the fonts from the locked MathLive package at this local base.
// Guard per ambienti senza DOM reale (jsdom test, SSR).
if (typeof MathfieldElement !== "undefined") {
  MathfieldElement.fontsDirectory = `${import.meta.env.BASE_URL}mathlive-fonts`
  MathfieldElement.soundsDirectory = null
}

type ChipDef = { label: string; latex: string }

const CHIPS: ChipDef[] = [
  { label: "frazione", latex: "\\frac{a}{b}" },
  { label: "radice", latex: "\\sqrt{x}" },
  { label: "integrale", latex: "\\int_{a}^{b} f(x)\\,dx" },
  { label: "sommatoria", latex: "\\sum_{n=1}^{N}" },
  { label: "limite", latex: "\\lim_{x \\to 0}" },
  { label: "matrice", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
]

// Composer formule: il docente scrive math (render live, LaTeX), copia per incollarla sulla lavagna.
export default function MathComposer({ onClose, onInsert }: { onClose: () => void; onInsert: (latex: string) => void | Promise<void> }) {
  const host = useRef<HTMLDivElement>(null)
  const mfRef = useRef<MathfieldElement | null>(null)

  useEffect(() => {
    if (!host.current) return
    const mf = new MathfieldElement()
    mf.value = "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
    mf.mathVirtualKeyboardPolicy = "auto"
    mf.style.cssText = "width:100%;min-height:64px;font-size:30px;"
    // appendChild in try/catch per ambienti senza DOM reale (jsdom test)
    try { host.current.appendChild(mf) } catch {}
    mf.focus()
    mfRef.current = mf
    return () => { mf.remove() }
  }, [])

  function setLatex(v: string) {
    const mf = mfRef.current
    if (mf) mf.value = v
  }

  function copyLatex() {
    const v = mfRef.current?.value ?? ""
    navigator.clipboard?.writeText(v)
  }

  async function insert() {
    const mf = mfRef.current
    if (!mf) return
    const v = mf.value.trim()
    if (v) { await onInsert(v); onClose() }
  }

  return (
    <div className="st-card st-composer-panel">
      <div className="st-card-line st-composer-header">
        <span className="st-card-title">Formula</span>
        <button onClick={insert} className="st-primary">
          <IconFunction /> inserisci sulla lavagna
        </button>
        <button onClick={copyLatex} className="st-ghost">copia LaTeX</button>
        <button onClick={onClose} className="st-ghost st-composer-close">chiudi</button>
      </div>
      <div className="st-composer-chips">
        {CHIPS.map((c) => (
          <button key={c.label} className="st-chip" onClick={() => setLatex(c.latex)}>
            {c.label}
          </button>
        ))}
      </div>
      <div ref={host} className="st-composer-field" />
      <p className="st-composer-hint">
        Scrivi (es. <code>x^2</code>, <code>\int</code>, <code>\frac</code>).
        {" "}<IconCheck aria-hidden /> "Inserisci sulla lavagna" la mette come immagine sul canvas (spostabile/ridimensionabile).
      </p>
    </div>
  )
}
