// MAESTRO-Studio — Seed demo DETERMINISTICO per gli screenshot (S-DESIGN-9b)
// La lavagna negli shot non deve essere vuota: titolo + 3 stroke fissi.
// Zero Date.now()/Math.random(): stesso input → stessi byte, run dopo run.

export const DEMO_LESSON_NAME = "Teoria dei Segnali — demo"
export const DEMO_BOARD_TITLE = "Trasformata di Fourier"

/**
 * Epoch fisso (2026-06-01T08:00:00Z) per il seed iniziale.
 * Nota: nello shot 02 l'app puo ri-persistere la scena (onChange→persist) e il
 * drawer mostra quindi la data corrente — il determinismo garantito e sui BYTE
 * del seed, non sulle date visualizzate dopo interazioni.
 */
export const DEMO_MTIME = 1780300800000

const INK = "#14130f"
const FONT_NUNITO = 6

function base(id, seed) {
  return {
    id,
    angle: 0,
    strokeColor: INK,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed,
    version: 1,
    versionNonce: seed,
    isDeleted: false,
    boundElements: null,
    updated: DEMO_MTIME,
    link: null,
    locked: false,
  }
}

function freedraw(id, seed, x, y, points) {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  return {
    ...base(id, seed),
    type: "freedraw",
    x,
    y,
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    points,
    pressures: [],
    simulatePressure: true,
    lastCommittedPoint: points[points.length - 1],
  }
}

/** Scena Excalidraw deterministica: 1 titolo testo + 3 stroke freedraw */
export function buildDemoScene() {
  const title = {
    ...base("demo-title", 1001),
    type: "text",
    x: 140,
    y: 90,
    width: 520,
    height: 48,
    text: DEMO_BOARD_TITLE,
    fontSize: 36,
    fontFamily: FONT_NUNITO,
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    originalText: DEMO_BOARD_TITLE,
    autoResize: true,
    lineHeight: 1.25,
  }

  // Sottolineatura del titolo
  const underline = freedraw("demo-stroke-1", 1002, 140, 150, [
    [0, 0], [80, 3], [180, 1], [300, 4], [420, 2],
  ])
  // Assi cartesiani (un solo tratto a L)
  const axes = freedraw("demo-stroke-2", 1003, 180, 220, [
    [0, 0], [2, 80], [3, 160], [4, 240], [6, 238], [120, 240], [260, 239], [400, 241],
  ])
  // Sinusoide sopra gli assi
  const sine = freedraw("demo-stroke-3", 1004, 190, 340, [
    [0, 0], [25, -45], [50, -60], [75, -45], [100, 0], [125, 45], [150, 60],
    [175, 45], [200, 0], [225, -45], [250, -60], [275, -45], [300, 0],
    [325, 45], [350, 60], [375, 45], [400, 0],
  ])

  return {
    type: "excalidraw",
    version: 2,
    source: "maestro-studio-demo-seed",
    elements: [title, underline, axes, sine],
    appState: {
      currentItemFontFamily: FONT_NUNITO,
      currentItemStrokeColor: INK,
      viewBackgroundColor: "#fffefb",
      scrollX: 0,
      scrollY: 0,
      zoom: { value: 1 },
    },
    files: {},
  }
}

/** Base64 dei byte UTF-8 (stesso encoding di store/codec.ts blobToBase64) */
function toB64(json) {
  return Buffer.from(json, "utf8").toString("base64")
}

/**
 * Voci localStorage [chiave, valore] che il LocalStorageDriver legge al load:
 * scena (raw/<room>/board.excalidraw) + meta.json (nome lezione), con :mtime e :type.
 */
export function buildDemoSeedEntries(room) {
  const PREFIX = "maestro:"
  const scenePath = `raw/${room}/board.excalidraw`
  const metaPath = `raw/${room}/meta.json`
  const sceneJson = JSON.stringify(buildDemoScene())
  const metaJson = JSON.stringify({ v: 1, name: DEMO_LESSON_NAME, createdAt: DEMO_MTIME })
  return [
    [PREFIX + scenePath, toB64(sceneJson)],
    [PREFIX + scenePath + ":mtime", String(DEMO_MTIME)],
    [PREFIX + ":type" + scenePath, "application/json"],
    [PREFIX + metaPath, toB64(metaJson)],
    [PREFIX + metaPath + ":mtime", String(DEMO_MTIME)],
    [PREFIX + ":type" + metaPath, "application/json"],
  ]
}
