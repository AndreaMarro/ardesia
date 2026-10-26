// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Verifica che un fallimento TRANSITORIO del CDN MathJax non blocchi
// permanentemente l'inserimento di formule per il resto della sessione.
// Regressione: loadMathJax memoizzava il Promise anche quando veniva
// rifiutato (onerror) -> ogni chiamata successiva ereditava il reject
// e l'utente non poteva piu inserire formule senza ricaricare la pagina.

describe("latexToImage — renderer locale e retry", () => {
  let scripts: HTMLScriptElement[]

  beforeEach(() => {
    vi.resetModules()
    scripts = []
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      const el = realCreate(tag)
      if (tag === "script") scripts.push(el as HTMLScriptElement)
      return el
    }) as typeof document.createElement)
    vi.spyOn(document.head, "appendChild").mockImplementation(((node: Node) => node) as typeof document.head.appendChild)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    delete (window as unknown as { MathJax?: unknown }).MathJax
  })

  it("dopo un errore CDN, un secondo tentativo crea un nuovo script e puo riuscire", async () => {
    const { latexToImage } = await import("../latexToImage")

    // Primo tentativo: il CDN fallisce.
    const p1 = latexToImage("x^2")
    expect(scripts).toHaveLength(1)
    scripts[0].onerror?.(new Event("error"))
    await expect(p1).rejects.toThrow(/MathJax.*load failed/)

    // Secondo tentativo: la cache deve essere stata azzerata, quindi
    // loadMathJax crea un NUOVO <script>. Se il CDN risponde, risolve.
    const p2 = latexToImage("x^2")
    expect(scripts).toHaveLength(2) // nuovo script => retry effettivo, non reject cached

    // Simula lo script CDN che popola window.MathJax con l'API completa
    // prima di emettere onload (come fa il bundle reale).
    ;(window as unknown as { MathJax: unknown }).MathJax = {
      startup: { promise: Promise.resolve() },
      tex2svg: () => {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = '<svg width="10ex" height="3ex"></svg>'
        return wrapper
      },
    }
    scripts[1].onload?.(new Event("load"))
    const out = await p2
    expect(out.dataURL).toContain("data:image/svg+xml;base64,")
    expect(out.width).toBeGreaterThan(0)
    expect(out.height).toBeGreaterThan(0)
  })

  it.each(["/", "/studio/"])("ancora il bundle al base di build %s anche senza slash nella pagina", async (base) => {
    vi.stubEnv("BASE_URL", base)
    const previous = location.href
    history.replaceState(null, "", base === "/" ? "/" : "/studio")
    try {
      const { latexToImage } = await import("../latexToImage")
      const loading = latexToImage("x^2")
      expect(scripts[0].src).toBe(`${location.origin}${base}mathjax/tex-svg-full.js`)
      scripts[0].onerror?.(new Event("error"))
      await expect(loading).rejects.toThrow(/load failed/)
    } finally { history.replaceState(null, "", previous) }
  })

  it("propaga un errore di startup e permette un nuovo caricamento", async () => {
    const { latexToImage } = await import("../latexToImage")
    const first = latexToImage("x^2")
    ;(window as any).MathJax = { startup: { promise: Promise.reject(new Error("startup failed")) } }
    scripts[0].onload?.(new Event("load"))
    await expect(first).rejects.toThrow("startup failed")
    const retry = latexToImage("x^2")
    expect(scripts).toHaveLength(2)
    scripts[1].onerror?.(new Event("error"))
    await expect(retry).rejects.toThrow(/load failed/)
  })
})
