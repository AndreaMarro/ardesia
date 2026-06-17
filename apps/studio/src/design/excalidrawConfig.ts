import { FONT_FAMILY } from "@excalidraw/excalidraw"

/**
 * Config Excalidraw CANONICA (DESIGN-MAESTRO-v1 §3.B) — UNICO export, UNICO posto.
 * langCode/theme/UIOptions/aiEnabled vivono SOLO qui: Room.tsx consuma, mai duplica.
 * LIMITE ONESTO: gli swatch del color-picker restano stock (no hack DOM).
 */
export const EXCALIDRAW_CONFIG = {
  langCode: "it-IT",
  theme: "light",
  aiEnabled: false,
  UIOptions: {
    canvasActions: {
      toggleTheme: false,
      changeViewBackgroundColor: false,
      loadScene: false,
      saveToActiveFile: false,
      clearCanvas: true,
      saveAsImage: true,
      export: false,
    },
    tools: { image: false },
  },
  // SOLO su stanza nuova: foglio --m-canvas su scrivania carta, inchiostro dritto Nunito.
  // Hex obbligati: l'appState Excalidraw non risolve var() CSS.
  newRoomAppState: {
    currentItemFontFamily: FONT_FAMILY.Nunito,
    currentItemStrokeColor: "#14130f",
    viewBackgroundColor: "#fffefb",
  },
} as const
