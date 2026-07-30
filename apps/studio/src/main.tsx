import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { publishBuildIdentity } from './buildIdentity'

// PRIMA del render: un build che non monta deve comunque poter dire chi e'.
// Se questa riga stesse dentro App, una schermata bianca sarebbe muta proprio
// quando serve sapere quale SHA e' in produzione.
publishBuildIdentity()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
