# G11 FASE 7 — Innovazione Implementata

**Data**: 28/03/2026
**Feature**: Deep-link esperimenti via URL hash parameter

---

## Implementazione

La raccomandazione dalla ricerca (condivisione circuiti) e' stata implementata come **deep-link via URL**:

```
elab-builder.vercel.app/#prova?exp=v1-cap6-esp1
```

### Architettura
1. `getExpFromHash()` in App.jsx — parsing `?exp=xxx` dal hash
2. Prop `initialExperimentId` passata a ElabTutorV4
3. `pendingExperimentId` inizializzato con il deep-link
4. NewElabSimulator.jsx gia' supportava `initialExperimentId` — zero modifiche necessarie

### Caso d'uso
- Prof.ssa prepara lezione → crea link → proietta sulla LIM
- Studenti a casa → ricevono link su WhatsApp → cliccano → LED si accende
- Volume fisico → QR code stampato → scansione → simulatore si apre sull'esperimento
- **1 tap** dal link al LED acceso (era 4+ tap)

## Build
- PASSA (23.72s)
- PWA precache: 19 entries (4,099 KB)

## File modificati
- `src/App.jsx` — getExpFromHash(), deep-link prop
- `src/components/tutor/ElabTutorV4.jsx` — deepLinkExpId prop
