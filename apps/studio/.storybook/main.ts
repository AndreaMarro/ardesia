// Storybook esiste per UNA ragione: dare a Chromatic un produttore deterministico
// di stati visuali. Non e' una seconda app, non e' documentazione, non e' un
// oracolo di accessibilita' (nessun addon-a11y: la conformita' WCAG resta NON
// MISURATA finche' non esiste la suite completa di D-CHROMATIC).
//
// Rimozione: cancella .storybook/, src/stories/, i due script npm e le due
// devDependencies. Nessun altro file del prodotto dipende da qui.

import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
}

export default config
