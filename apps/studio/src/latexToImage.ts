// Browser bundle from the existing MathJax lock, loaded once from Studio's origin.
// Keep the CJS package entry out of Vite and retain the Apache-2.0 notice.
let _ready: Promise<void> | null = null

function loadMathJax(): Promise<void> {
  if (_ready) return _ready
  _ready = new Promise<void>((resolve, reject) => {
    const assets = new URL(`${import.meta.env.BASE_URL}mathjax/`, window.location.origin)
    ;(window as any).MathJax = {
      svg: { fontCache: "none" }, startup: { typeset: false },
      loader: { paths: { mathjax: assets.href } },
    }
    const s = document.createElement("script")
    s.src = new URL("tex-svg-full.js", assets).href
    s.async = true
    s.onload = () => {
      const mj = (window as any).MathJax
      mj?.startup?.promise ? mj.startup.promise.then(() => resolve()) : resolve()
    }
    s.onerror = () => {
      _ready = null
      s.remove()
      reject(new Error("MathJax local bundle load failed"))
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
