# Demo Gate — `<esp-id>`

**Template Sprint A workflow-v2 fase 15.** Demo gate finale: P0 fallisce → esp NON entra in demo. Andrea mandate: FAI UN LAVORO IMPECCABILE.

---

## Libro (riferimento canonico)

- [ ] Riferimento PDF trovato e citato (file + pagine)
- [ ] Pagine corrette (printed ↔ pdf physical mapping verified)
- [ ] Crop generati in `reference/vol<N>/<esp-id>/`
- [ ] Manifest.json populated con states
- [ ] Step libro identificati per modalità passo-passo

## Geometria (visiva)

- [ ] Breadboard uguale a libro (orientamento + scala + zona)
- [ ] Batteria/Arduino uguale (posizione + entrata cavi + scala relativa)
- [ ] Componenti uguali (forma + colore + valore + orientamento)
- [ ] Pin nei fori corretti (matcha libro)
- [ ] Fili visibili matchano libro (colore + curva + lunghezza)
- [ ] Curve fili matchano libro (no router automatico generico)
- [ ] **Nessun filo extra rispetto a libro**
- [ ] **Nessun componente extra rispetto a libro**
- [ ] Spaziatura componenti uguale libro

## Elettrica (funzionale)

- [ ] Netlist corretta (connessioni effettive)
- [ ] Polarità corretta (LED anodo+, condensatore +/−)
- [ ] Valori corretti (resistor Ω, capacitor μF, batteria V)
- [ ] Codice coerente con pin spec libro (Vol3 Arduino)
- [ ] Simulazione funzionante (LED si accende / cap si carica / sequenza temporizzata)
- [ ] No short circuit
- [ ] No componente saturo/oversized

## Passo-passo (workflow-v2 fase 10)

- [ ] Parte smontato (stato iniziale = solo bb + bat)
- [ ] Procede correttamente (build sequence libro)
- [ ] **Non cambia geometria tra step** (solo subset progressivo della scena canonica)
- [ ] Prossimo esperimento resta in passo-passo (cliffhanger → next_id workflow)
- [ ] Annotazioni manuale restano funzionanti

## Demo experience

- [ ] Screenshot approvato (visual diff vs libro < 10% delta)
- [ ] Responsive approvato (desktop 1440, laptop 1280, tablet)
- [ ] Compattezza preservata su resize/zoom/pan
- [ ] UNLIM coerente (context completo, riferimento Vol/pag corretto)
- [ ] Nessun errore in console
- [ ] Nessun warning React/Vite
- [ ] LIM-first light mode contrast OK

## Pedagogia (Principio Zero)

- [ ] Docente capisce cosa dire ai ragazzi
- [ ] UNLIM cita Vol/pag verbatim libro
- [ ] Ragazzi sul kit fisico hanno SAME reference (Morfismo Sense 2)
- [ ] Kit Omaric → simulatore SVG → volume = stesso prodotto morfico

## Verdetto demo gate

`<PASS | FAIL | BLOCK>`

**Reason if FAIL/BLOCK** (P0 blockers):
- 
- 

**Reviewed by**: Andrea (verifica risultato) — Claude (bake)

**Date**:
