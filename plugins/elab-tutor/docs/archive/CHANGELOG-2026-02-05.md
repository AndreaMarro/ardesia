# ELAB Tutor - Aggiornamento 05/02/2026

## Autore: Andrea Marro

---

## 1. Sistema Licenze con Device Lock

### Problema precedente
- Password **hardcoded nel codice sorgente** (`Xk9#mLp$2vQz`) visibile a chiunque aprisse i DevTools del browser
- Nessun blocco per dispositivo: chiunque con la password poteva accedere da infiniti computer
- **Due sistemi di licenza in conflitto**: uno in `PasswordGate.jsx` (con Notion) e uno in `ElabTutorV4.jsx` (con localStorage)
- Bug: il campo input condiviso tra modalita licenza e password applicava `.toUpperCase()` anche alla password, impedendone l'inserimento corretto

### Soluzione implementata
- **Rimossa completamente la password hardcoded** dal codice
- **Autenticazione unica** tramite codice licenza scuola verificato via Notion DB (webhook n8n)
- **Device Fingerprint** generato tramite SHA-256 di: UserAgent, risoluzione schermo, WebGL renderer, canvas fingerprint, hardware concurrency, timezone, lingua
- Ogni licenza abilita **un solo dispositivo alla volta**
- Al logout, il device viene **rilasciato** automaticamente (chiamata `release` al server)
- Fallback offline con controllo deviceId

### File modificati
| File | Modifica |
|------|----------|
| `src/services/licenseService.js` | Aggiunto device fingerprinting, `getDeviceId()`, `releaseLicense()`, supporto `DEVICE_LOCKED` |
| `src/components/PasswordGate.jsx` | Riscritto: solo campo licenza, rimosso toggle password, aggiunto watermark |
| `src/components/tutor/ElabTutorV4.jsx` | Rimosso sistema licenza ridondante (PASSWORD, form, handleLogout) |

### Configurazione n8n richiesta
Il webhook `elab-license` deve gestire:
- `action: 'verify'` con `deviceId` -> controllare campo DeviceId su Notion, se diverso rispondere `DEVICE_LOCKED`
- `action: 'release'` con `deviceId` -> pulire il campo DeviceId su Notion

---

## 2. Protezioni Anti-Copia e Anti-Manomissione

| Protezione | Dettaglio |
|------------|-----------|
| Tasto destro | Bloccato (`contextmenu` preventDefault) |
| Selezione testo | Bloccata su tutto tranne textarea/input/code |
| Copia | Intercettata: clipboard riempita con "Contenuto protetto" |
| Scorciatoie DevTools | F12, Ctrl+Shift+I/J/C bloccati |
| View Source | Ctrl+U bloccato |
| Salva pagina | Ctrl+S bloccato |
| Stampa | Ctrl+P bloccato + CSS `@media print { display: none }` |
| Drag immagini | Bloccato |
| Indicizzazione | `meta robots noindex, nofollow` |
| CSS user-select | `none` su body, `text` su input/textarea/code |
| DOM tampering | MutationObserver sul gate di autenticazione |

### File modificati
- `src/components/tutor/ElabTutorV4.jsx` (useEffect anti-copy)
- `index.html` (CSS anti-select, meta robots)

---

## 3. Watermark e Copyright

- **Watermark visuale** fisso in basso a destra: "Andrea Marro - 05/02/2026" (semi-trasparente, non selezionabile)
- **Copyright nel login**: "© Andrea Marro 2026"
- **Commenti nei file sorgente**: `© Andrea Marro - 05/02/2026` in tutti i file principali

### File con commento copyright
- `index.html`
- `src/main.jsx`
- `src/App.jsx`
- `src/services/licenseService.js`
- `src/services/api.js`
- `src/components/PasswordGate.jsx`
- `src/components/tutor/ElabTutorV4.jsx`
- `src/components/tutor/ElabTutorV4.css`
- `src/components/simulator/WokwiSimulator.jsx`
- `src/components/simulator/WokwiSimulator.css`

---

## 4. Fix Funzionalita

| Elemento | Prima | Dopo |
|----------|-------|------|
| Pulsante "Simula" (code panel) | Apriva `wokwi.com` esterno | Apre il tab Simulatore interno |
| Form password nei manuali | Form ridondante dentro ElabTutorV4 | Rimosso (PasswordGate gestisce tutto) |
| Pulsante logout nei volumi | Presente nel selettore volumi | Rimosso (logout nel bar licenza in basso) |
| Chatbot | Funzionante via n8n webhook | Invariato, funzionante |
| YouTube | Embed + video consigliati | Invariato, funzionante |
| Canvas/Lavagna | Disegno, testo, gomma | Invariato, funzionante |
| Simulatore Wokwi | 19 esperimenti su 3 volumi | Invariato, funzionante |

---

## 5. Build e Deploy

- **Build**: `npm run build` -> 0 errori, 0 warning
- **Bundle size**: 290.96 KB JS (89.61 KB gzip) + 56.70 KB CSS (11.67 KB gzip)
- **Deploy**: Vercel production -> https://elab-builder.vercel.app
- **Verifiche post-deploy**:
  - Nessuna traccia di password nel bundle
  - Device fingerprint presente nel bundle
  - Protezioni anti-copia attive
  - Watermark presente

---

*Documento generato il 05/02/2026 - Andrea Marro*
