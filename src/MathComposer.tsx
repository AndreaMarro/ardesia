import { useEffect, useRef, type CSSProperties } from "react"
import { MathfieldElement } from "mathlive"

// Carica i font MathLive da CDN (in dev Vite non serve copiarli in public/).
MathfieldElement.fontsDirectory = "https://unpkg.com/mathlive/fonts"
MathfieldElement.soundsDirectory = null

// Composer formule: il docente scrive math (render live, LaTeX), copia per incollarla sulla lavagna.
export default function MathComposer({ onClose }: { onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const mfRef = useRef<MathfieldElement | null>(null)

  useEffect(() => {
    if (!host.current) return
    const mf = new MathfieldElement()
    mf.value = "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
    mf.style.cssText = "width:100%;min-height:64px;font-size:30px;border:1px solid #ddd;border-radius:8px;padding:6px"
    host.current.appendChild(mf)
    mf.focus()
    mfRef.current = mf
    return () => { mf.remove() }
  }, [])

  function copyLatex() {
    const v = mfRef.current?.value ?? ""
    navigator.clipboard?.writeText(v)
  }

  return (
    <div style={panel}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>Formula</strong>
        <button onClick={copyLatex} style={mini}>copia LaTeX</button>
        <button onClick={onClose} style={{ ...mini, marginLeft: "auto" }}>chiudi</button>
      </div>
      <div ref={host} />
      <p style={{ fontSize: 11, color: "#888", margin: "8px 2px 0" }}>
        Scrivi (es. <code>x^2</code>, <code>\int</code>, <code>\frac</code>). Render live. Inserimento diretto sulla lavagna = prossimo step.
      </p>
    </div>
  )
}

const panel: CSSProperties = {
  position: "absolute", left: 12, top: 12, width: 380, zIndex: 6,
  background: "#fff", borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,.18)",
  padding: 12, fontFamily: "-apple-system,system-ui,sans-serif",
}
const mini: CSSProperties = {
  border: 0, background: "#1763ff", color: "#fff", padding: "4px 10px",
  borderRadius: 6, fontSize: 12, cursor: "pointer",
}
