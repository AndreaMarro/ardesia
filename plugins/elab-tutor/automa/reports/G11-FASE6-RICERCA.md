# G11 FASE 6 — Ricerca + Innovazione

**Data**: 28/03/2026
**Status**: RICERCA IN CORSO (agente), FEATURE IMPLEMENTATA

---

## Feature Implementata: Deep-Link Esperimenti

### Cosa
URL sharing per esperimenti: `#prova?exp=v1-cap6-esp1`

La Prof.ssa puo' creare un link diretto a un esperimento specifico e condividerlo con la classe (LIM, email, WhatsApp, QR code stampato sul Volume).

### Perche'
- Nessun competitor offre deep-linking diretto a esperimenti con zero login
- La Prof.ssa puo' preparare la lezione e mandare i link agli studenti
- Il QR code sul Volume fisico puo' puntare a `elab-builder.vercel.app/#prova?exp=v1-cap6-esp1`
- **Principio Zero**: 1 tap dal link al LED acceso

### Come
- `App.jsx`: `getExpFromHash()` estrae `?exp=xxx` dall'hash
- `ElabTutorV4`: nuovo prop `initialExperimentId` (deep-link) ha priorita' su default
- Il deep-link funziona sia in `#prova` (senza login) che in `#tutor` (con login)

### Uso
```
# Primo LED — senza login
elab-builder.vercel.app/#prova?exp=v1-cap6-esp1

# Semaforo Arduino — senza login
elab-builder.vercel.app/#prova?exp=v3-cap6-semaforo

# Con login
elab-builder.vercel.app/#tutor?exp=v2-cap6-esp1
```

## Ricerca Competitor (agente)
[Report agente in arrivo — WebUSB, competitor, idee geniali]

## File modificati
- `src/App.jsx` — +8 righe (getExpFromHash, deep-link prop)
- `src/components/tutor/ElabTutorV4.jsx` — +2 righe (deepLinkExpId prop)
