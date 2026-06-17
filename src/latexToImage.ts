// LaTeX → SVG via MathJax CDN (bundle browser, niente CJS/require → niente guerra con Vite).
// Lazy-load UNA volta al primo uso: l'app parte anche offline; solo l'inserimento-formula tocca la rete.
let _ready: Promise<void> | null = null

function loadMathJax(): Promise<void> {
  if (_ready) return _ready
  _ready = new Promise<void>((resolve, reject) => {
    ;(window as any).MathJax = { svg: { fontCache: "none" }, startup: { typeset: false } }
    const s = document.createElement("script")
    s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"
    s.async = true
    s.onload = () => {
      const mj = (window as any).MathJax
      mj?.startup?.promise ? mj.startup.promise.then(() => resolve()) : resolve()
    }
    s.onerror = () => {
      _ready = null // blip CDN transitorio non deve bloccare i tentativi futuri
      reject(new Error("MathJax CDN load failed"))
    }
    document.head.appendChild(s)
  })
  return _ready
}

const EX_PX = 11 // px per "ex" → scala leggibilità sulla lavagna

// LaTeX → SVG self-contained (path) → dataURL + dimensioni px.
export async function latexToImage(latex: string): Promise<{ dataURL: string; width: number; height: number }> {
  await loadMathJax()
  const mj = (window as any).MathJax
  const node = mj.tex2svg(latex || "", { display: true })
  const svgEl = node.querySelector("svg") as SVGElement
  svgEl.style.color = "#1e1e1e" // visibile su lavagna bianca (MathJax usa currentColor)
  const wEx = parseFloat(svgEl.getAttribute("width") || "10") // "X.XXXex" → parseFloat ignora "ex"
  const hEx = parseFloat(svgEl.getAttribute("height") || "3")
  const width = Math.max(24, Math.round(wEx * EX_PX))
  const height = Math.max(16, Math.round(hEx * EX_PX))
  const dataURL = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgEl.outerHTML)))
  return { dataURL, width, height }
}
