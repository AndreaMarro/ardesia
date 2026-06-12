// MAESTRO-Studio — PL-1: applicazione del tema plastico alle CSS var.
// Scrive SOLO gli 11 token di PLASTIC_VARS come inline style su :root.
// Tema neutro-default → RIMOZIONE degli override: il DOM torna byte-identico
// a oggi (fail-closed, zero regressioni visive). Semafori mai toccati per
// costruzione: questo modulo non conosce altri nomi di variabile.

import { PLASTIC_VARS, NEUTRAL_THEME, type MTheme } from "./deriveTheme"

function isNeutralDefault(theme: MTheme): boolean {
  return (
    theme.family === "neutral" &&
    PLASTIC_VARS.every((v) => theme.vars[v] === NEUTRAL_THEME.vars[v])
  )
}

/** Applica il tema su root (default :root). Neutro-default = rimuove gli override. */
export function applyTheme(theme: MTheme, root: HTMLElement = document.documentElement): void {
  if (isNeutralDefault(theme)) {
    resetTheme(root)
    return
  }
  for (const v of PLASTIC_VARS) {
    root.style.setProperty(v, theme.vars[v])
  }
}

/** Rimuove ogni override plastico: vincono i default di tokens.css. */
export function resetTheme(root: HTMLElement = document.documentElement): void {
  for (const v of PLASTIC_VARS) {
    root.style.removeProperty(v)
  }
}
