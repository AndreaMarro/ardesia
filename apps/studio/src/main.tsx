import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { publishBuildIdentity } from './buildIdentity'

// Set before the lazy canvas is loaded. Fonts are emitted from the locked
// dependency by Vite, with no CDN or third-party network requirement.
;(window as Window & { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH =
  new URL('excalidraw-assets/', document.baseURI).href

// PRIMA del render: un build che non monta deve comunque poter dire chi e'.
// Se questa riga stesse dentro App, una schermata bianca sarebbe muta proprio
// quando serve sapere quale SHA e' in produzione.
publishBuildIdentity()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
