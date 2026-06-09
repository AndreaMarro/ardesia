import * as pdfjsLib from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

// Worker servito da Vite (no CDN, no version-mismatch, offline-ok)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// Immagine → dataURL + dimensioni naturali.
export function imageToDataURL(file: File): Promise<{ dataURL: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onerror = () => reject(new Error("lettura file fallita"))
    r.onload = () => {
      const dataURL = r.result as string
      const img = new Image()
      img.onload = () => resolve({ dataURL, width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error("immagine non valida"))
      img.src = dataURL
    }
    r.readAsDataURL(file)
  })
}

// PDF → una immagine PNG per pagina (rendering via pdf.js su canvas offscreen).
export async function pdfToImages(file: File, scale = 1.5): Promise<{ dataURL: string; width: number; height: number }[]> {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const out: { dataURL: string; width: number; height: number }[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement("canvas")
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext("2d")!
    await page.render({ canvas, canvasContext: ctx, viewport } as any).promise
    out.push({ dataURL: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height })
  }
  return out
}
