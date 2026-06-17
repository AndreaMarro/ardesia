import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Forza UNA sola copia di React (Excalidraw + app): senza, l'optimizer
  // duplica react quando si aggiunge una dep → "Invalid hook call".
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client'] },
})
