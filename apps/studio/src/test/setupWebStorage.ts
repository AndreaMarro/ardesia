/**
 * Compatibilita' Web Storage per i test jsdom.
 *
 * Node 26 definisce `globalThis.localStorage`, ma senza
 * `--localstorage-file` il getter restituisce `undefined` e impedisce a jsdom
 * di fornire la propria implementazione. Il package richiede gia' uno stub
 * esplicito quando jsdom non offre uno storage completo (AGENTS.md, gotcha
 * tecnico): qui lo installiamo una volta sola ed esclusivamente nell'ambiente
 * DOM. Non leggiamo prima il getter esistente, perche' su Node 26 e' proprio
 * quella lettura a produrre l'ExperimentalWarning.
 */

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>()
  return {
    get length() {
      return entries.size
    },
    clear() {
      entries.clear()
    },
    getItem(key: string) {
      return entries.get(String(key)) ?? null
    },
    key(index: number) {
      return [...entries.keys()][index] ?? null
    },
    removeItem(key: string) {
      entries.delete(String(key))
    },
    setItem(key: string, value: string) {
      entries.set(String(key), String(value))
    },
  }
}

if (typeof window !== "undefined") {
  const storage = createMemoryStorage()
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  })
  if (window !== globalThis) {
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    })
  }
}
