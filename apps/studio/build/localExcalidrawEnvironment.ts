import type { Plugin } from "vite"

/** The embedded editor uses Ardesia storage, never the upstream hosted app's Firebase. */
export function removeHostedFirebaseConfig(code: string): string {
  return code.replace(/(\bVITE_APP_FIREBASE_CONFIG\s*:\s*)(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, "$1'{}'")
}

export function localExcalidrawEnvironment(): Plugin {
  return {
    name: "ardesia-local-excalidraw-environment",
    enforce: "pre",
    transform(code, id) {
      if (!id.replaceAll("\\", "/").includes("/@excalidraw/excalidraw/dist/")) return
      if (!code.includes("VITE_APP_FIREBASE_CONFIG")) return
      const transformed = removeHostedFirebaseConfig(code)
      if (transformed === code) throw new Error("Review the upstream hosted Firebase config format")
      return { code: transformed, map: null }
    },
  }
}
