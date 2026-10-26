import type { Plugin } from "vite"

/** The embedded editor uses Ardesia storage, never the upstream hosted app's Firebase. */
export function removeHostedFirebaseConfig(code: string): string {
  return code.replace(/(\bVITE_APP_FIREBASE_CONFIG\s*:\s*)(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, "$1'{}'")
}

export function localFontFallback(code: string, base: string): string {
  // Exact shape in the locked 0.18.1 browser component; fail on vendor drift.
  const upstream = /`https:\/\/esm\.sh\/\$\{([A-Za-z_$][\w$]*)\.PKG_NAME\?`\$\{\1\.PKG_NAME\}@\$\{\1\.PKG_VERSION\}`:"@excalidraw\/excalidraw"\}\/dist\/prod\/`/g
  return code.replace(upstream, `new URL(${JSON.stringify(base + 'excalidraw-assets/')},globalThis.location.origin).href`)
}

export function localExcalidrawEnvironment(): Plugin {
  let base = "/"
  return {
    name: "ardesia-local-excalidraw-environment",
    enforce: "pre",
    configResolved(config) { base = config.base },
    transform(code, id) {
      if (!id.replaceAll("\\", "/").includes("/@excalidraw/excalidraw/dist/")) return
      const firebase = code.includes("VITE_APP_FIREBASE_CONFIG")
      const fallback = code.includes("ASSETS_FALLBACK_URL") && code.includes("https://esm.sh/")
      if (!firebase && !fallback) return
      const transformed = localFontFallback(removeHostedFirebaseConfig(code), base)
      if (transformed === code) throw new Error("Review the upstream hosted environment format")
      return { code: transformed, map: null }
    },
  }
}
