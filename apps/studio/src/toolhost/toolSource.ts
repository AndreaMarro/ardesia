import { PDF_PAGE_DATA_KEY, rawPdfPageCustomData, readPdfPageSource } from "../pdfPageSource"
/** Portable raw source. Preview is derivative; the selected vectors and files remain intact. */
export type ToolSourceSnapshot = {
  schema: "tool-source.v1"
  image: string
  scene: string
  elementIds: string[]
  sceneSha256: string
}
export type ToolSourceSelection = {scene:string;elementIds:string[]}
export const sourceImagePattern = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/
export const rawSourceTypes = new Set(["freedraw", "image", "text"])
export async function sourceSha256(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value)
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)), n=>n.toString(16).padStart(2,"0")).join("")
}
export async function sourceImageSha256(image: string): Promise<string> {
  if (image.length > 2_800_000 || !sourceImagePattern.test(image)) throw new Error("Usa PNG, JPEG o WebP entro 2 MB.")
  const bytes = Uint8Array.from(atob(image.slice(image.indexOf(",")+1)),c=>c.charCodeAt(0))
  if (!bytes.length || bytes.length > 2_000_000) throw new Error("Usa un’immagine entro 2 MB.")
  return sourceSha256(bytes)
}
function validateSourceScene(sceneText:string,elementIds:string[]) {
  const scene = JSON.parse(sceneText) as {elements?:unknown; files?:Record<string,unknown>}
  if (!scene || !Array.isArray(scene.elements) || scene.elements.length !== elementIds.length ||
      !scene.files || typeof scene.files !== "object" || Array.isArray(scene.files)) throw new Error("La selezione non conserva la scena originale.")
  const ids = new Set<string>(),fileIds = new Set<string>()
  for (const el of scene.elements) {
    if (!el || typeof el !== "object" || !rawSourceTypes.has(el.type) || el.isDeleted ||
        typeof el.id !== "string" || ids.has(el.id) || !elementIds.includes(el.id) ||
        (el.customData && Object.keys(el.customData).length && !rawPdfPageCustomData(el.type,el.customData))) throw new Error("Usa soltanto tratti liberi, immagini e testo senza oggetti semantici.")
    if (el.type === "image") {
      const file = scene.files[el.fileId] as {id?:unknown;dataURL?:unknown}|undefined
      if (typeof el.fileId !== "string" || !file || file.id !== el.fileId || typeof file.dataURL !== "string" ||
          !sourceImagePattern.test(file.dataURL)) throw new Error("Manca il file originale di una immagine selezionata.")
      fileIds.add(el.fileId)
    }
    ids.add(el.id)
  }
  if (Object.keys(scene.files).some(id=>!fileIds.has(id))) throw new Error("La selezione contiene file non collegati agli elementi scelti.")
  return scene as {elements:Record<string,unknown>[];files:Record<string,unknown>}
}
export function readToolSource(value: unknown): ToolSourceSnapshot {
  const v = value as Partial<ToolSourceSnapshot> | null
  if (!v || v.schema !== "tool-source.v1" || typeof v.image !== "string" || v.image.length > 2_800_000 ||
      !sourceImagePattern.test(v.image) || typeof v.scene !== "string" || v.scene.length > 10_000_000 ||
      !Array.isArray(v.elementIds) || !v.elementIds.length || v.elementIds.length > 1000 ||
      !v.elementIds.every(id=>typeof id === "string" && id.length > 0 && id.length <= 128) ||
      new Set(v.elementIds).size !== v.elementIds.length || !/^[a-f0-9]{64}$/.test(v.sceneSha256 ?? "")) throw new Error("La fonte della lavagna non è leggibile.")
  validateSourceScene(v.scene,v.elementIds)
  return {schema:v.schema,image:v.image,scene:v.scene,elementIds:[...v.elementIds],sceneSha256:v.sceneSha256!}
}
/** Select exact raw data only; unrelated room files never enter the snapshot. */
export function prepareToolSourceSelection(elements:readonly unknown[],files:Record<string,unknown>,elementIds:string[]):ToolSourceSelection {
  if (!elementIds.length || elementIds.length>1000 || new Set(elementIds).size!==elementIds.length) throw new Error("Seleziona tratti, testo o immagini del circuito prima di aprire il tool.")
  const selected=elements.filter((el):el is Record<string,unknown>=>Boolean(el) && typeof el === "object" && elementIds.includes((el as {id:string}).id))
  const selectedFiles:Record<string,unknown>={}
  for (const el of selected) if(el.type === "image" && typeof el.fileId === "string") selectedFiles[el.fileId]=files[el.fileId]
  const scene=JSON.stringify({type:"excalidraw",version:2,source:"ardesia-selection",elements:selected,files:selectedFiles})
  if(scene.length>10_000_000)throw new Error("La selezione è troppo grande: scegli una regione più piccola.")
  validateSourceScene(scene,elementIds)
  return {scene,elementIds:[...elementIds]}
}
export async function captureToolSource(selection:ToolSourceSelection,render:(scene:{elements:Record<string,unknown>[];files:Record<string,unknown>})=>Promise<string>):Promise<ToolSourceSnapshot> {
  const scene=validateSourceScene(selection.scene,selection.elementIds)
  const image=await render(scene)
  return verifyToolSource({schema:"tool-source.v1",image,scene:selection.scene,elementIds:selection.elementIds,sceneSha256:await sourceSha256(selection.scene)})
}
export async function verifyToolSource(value: unknown): Promise<ToolSourceSnapshot> {
  const source = readToolSource(value)
  if (await sourceSha256(source.scene) !== source.sceneSha256) throw new Error("La fonte della lavagna è cambiata: acquisisci di nuovo la selezione.")
  await sourceImageSha256(source.image)
  const scene = validateSourceScene(source.scene, source.elementIds)
  for (const element of scene.elements) {
    const data = element.customData as Record<string,unknown> | undefined
    const page = readPdfPageSource(data?.[PDF_PAGE_DATA_KEY])
    if (!page) continue
    const file = scene.files[element.fileId as string] as {dataURL:string}
    if (await sourceImageSha256(file.dataURL) !== page.rasterSha256) throw new Error("La pagina PDF selezionata è cambiata rispetto alla fonte importata.")
  }
  return source
}
