# Design: Fase 3 — Drag&Drop, Monta tu, Sandbox guidata

**Data**: 20/02/2026
**Sessione**: 30
**Scope**: Solo Fase 3 (VolumeHome + ComponentPanel + Drag&Drop + Monta tu + Sandbox + Appunti)
**Approccio**: Orchestratore leggero — riusa infrastruttura drag&drop esistente

---

## REGOLA D'ORO

**Tutt'uno con i volumi cartacei.** Grafica identica ai libri PDF. Massima semplicità.
Zero caos. Per insegnanti non avvezzi. Palette ELAB rispettata.

---

## Decisioni confermate dall'utente

| Domanda | Decisione |
|---------|-----------|
| Errore piazzamento | Feedback rosso + retry (componente torna al drawer) |
| Fili sandbox | Manuali pin→pin (click pin1 → click pin2) |
| ComponentPanel | Drawer dal basso (~160px, collassabile) |
| Build steps UX | Step a step con possibilità di skip |
| Sandbox | Legata all'esperimento (stessi componenti, nessun vincolo posizione) |
| Batteria | Identica al libro PDF — corpo+clip, stessa orientazione |
| Componenti per volume | Vol.1 = solo componenti Vol.1, cumulativi |
| Appunti | Pannello note raffinato ispirato a "NOTE" del libro, penne eleganti |
| Simulatore | DEVE CONTINUARE A FUNZIONARE ALLA PERFEZIONE — zero regressioni |

---

## Flusso utente

```
Sidebar → Simulatore → ExperimentPicker (volume → capitolo → esperimento)
    ↓
Scelta modalità (3 bottoni):
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│  Completo   │  │  Monta tu!  │  │ Sandbox guidata  │
└─────────────┘  └─────────────┘  └──────────────────┘
       ↓                ↓                    ↓
  Come oggi       Step-by-step         Stessi componenti,
  (nessuna        con spiegazioni      piazzamento libero,
   modifica)      feedback rosso       guida consultabile,
                  + retry, skip        fili manuali
```

Appunti disponibili in tutte e 3 le modalità.

---

## 3 modalità — dettaglio

| Aspetto | Completo | Monta tu! | Sandbox guidata |
|---------|----------|-----------|-----------------|
| Breadboard | Piena (come oggi) | Vuota | Vuota |
| Drawer | Nascosto | Step singolo + spiegazione | Tutti i componenti |
| Validazione | Nessuna | Posizione esatta → verde/rosso | Solo griglia 7.5px |
| Errore | — | Rosso + componente torna al drawer | Nessun errore |
| Fili | Auto-generati | Step a step guidato | Manuali pin→pin |
| Skip | — | Sì (bottone avanti) | — |
| Appunti | Sì | Sì | Sì |

---

## ComponentDrawer (dal basso)

- Sfondo bianco, bordo top arrotondato 12px, ombra leggera
- Altezza: ~160px espanso, ~48px collassato (solo titolo)
- Handle di trascinamento in alto (linea grigia 40px)

### In Monta tu:
- 1 step alla volta: icona componente + testo semplice ("Prendi il resistore da 470Ω...")
- Hint collassabile con spiegazione extra
- Bottoni: "Avanti" (skip) + contatore "Passo 3 di 8"
- Animazione ingresso step: fade-in delicato

### In Sandbox guidata:
- Griglia componenti: icona (stile libro) + nome sotto
- Tutti i componenti dell'esperimento, draggabili
- Guida laterale consultabile (icona ? che espande le istruzioni)

---

## Componenti filtrati per volume (cumulativi)

### Vol.1 (Capitoli 4-8):
batteria 9V, breadboard, resistore, LED rosso, LED RGB, filo, pulsante (push-button)

### Vol.2 (Capitoli 9-14): Vol.1 +
potenziometro, buzzer piezo, fotoresistenza, motore DC, servo, diodo

### Vol.3 (Capitoli 15-18): Vol.1 + Vol.2 +
Arduino Nano R4, MOSFET-N, LCD 16x2, fototransistor, reed switch

Implementazione: campo `volumeAvailableFrom: 1|2|3` in `registry.js` per ogni componente.
Il drawer filtra: `component.volumeAvailableFrom <= selectedVolume`

---

## Batteria 9V — Ridisegno

La batteria SVG va resa **identica al libro PDF**:
- Riferimento: volume1.pdf pagine 30-48 (illustrazioni circuiti)
- Corpo scuro rettangolare + clip connettore
- Stessa orientazione delle illustrazioni
- Testo "9V" leggibile
- Pin `positive` e `negative` restano come nomi (backward compatible con solver)
- Fili: rosso = +, nero = -

**Nessuna modifica ai nomi pin** → CircuitSolver, buildSteps, WireRenderer non cambiano.

---

## Pannello Appunti (NotesPanel)

Ispirato alla sezione "NOTE" del libro (pag.42):
- Sfondo: pattern circuiti verde leggero (come libro)
- Righe orizzontali per testo (come quaderno)
- Penne raffinate: sottile (1px), media (2px), larga (4px)
- Colori penna: navy (#1E4D8C), lime (#7CB342), rosso (#E54B3D), nero
- Salvato in localStorage per utente/esperimento
- Accessibile via bottone icona (📝) nella toolbar del simulatore
- Design elegante, minimalista, palette ELAB

---

## File plan

### Nuovi:
- `src/components/simulator/panels/ComponentDrawer.jsx` — drawer dal basso
- `src/components/simulator/BuildModeManager.jsx` — state machine orchestratore
- `src/hooks/useBuildMode.js` — hook logica build
- `src/components/simulator/panels/NotesPanel.jsx` — pannello appunti

### Modifiche:
- `src/components/simulator/components/Battery9V.jsx` — ridisegno identico al libro
- `src/components/simulator/panels/ExperimentPicker.jsx` — 3a opzione "Sandbox guidata"
- `src/components/simulator/NewElabSimulator.jsx` — integrazione BuildModeManager + NotesPanel
- `src/components/simulator/canvas/SimulatorCanvas.jsx` — validazione drop position
- `src/components/simulator/components/registry.js` — campo `volumeAvailableFrom`

### NON toccare:
- `CircuitSolver.js` — zero
- `WireRenderer.jsx` — zero
- `emailService.js` — come da regola
- Tutta la logica di simulazione AVR/compilation

---

## Garanzia zero regressioni

Strategia **additive, not destructive**:
1. Modalità "Completo" = path code identico ad oggi
2. BuildModeManager si attiva SOLO se `buildMode === 'guided'` o `'sandbox'`
3. Batteria: cambia grafica SVG, nomi pin identici → solver non impattato
4. SimulatorCanvas: validazione aggiunta come layer opzionale (prop `validatePlacement`)
5. ComponentDrawer: componente nuovo, non sostituisce ComponentPalette
6. Build verificabile: `npm run build` deve passare senza errori/warning nuovi
