import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Forza UNA sola copia di React (Excalidraw + app): senza, l'optimizer
    // duplica react quando si aggiunge una dep → "Invalid hook call".
    dedupe: ['react', 'react-dom'],
    alias: {
      // Confine host→plugin (canon ELAB-AS-PLUGIN §6): l'host consuma il
      // Simulation Plugin SOLO via questo alias; i tipi stanno in
      // src/types/elab-tutor-plugin.d.ts (il plugin è JS con suite propria).
      '@elab-tutor-plugin': fileURLToPath(new URL('../../plugins/elab-tutor/src', import.meta.url)),
      // Confine host→Pack (dati + metodo, slice 3 #68): sede canonica
      // packs/elab-tutor; i tipi stanno in src/types/elab-pack.d.ts.
      '@elab-pack': fileURLToPath(new URL('../../packs/elab-tutor', import.meta.url)),
    },
  },
  server: {
    // Il dev-server deve poter servire i sorgenti del plugin fuori da
    // apps/studio (monorepo): consenti la radice del repo, nient'altro.
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client'] },
})
