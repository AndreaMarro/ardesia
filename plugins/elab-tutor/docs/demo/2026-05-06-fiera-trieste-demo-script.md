# Demo Script Fiera Trieste 06/05/2026 — ELAB Tutor con Omaric

**Durata target**: 5-7 minuti per ciclo demo (ripetibile multiplo visitatori)
**Target audience**: docenti scuole pubbliche italiane, dirigenti scolastici, distributori didattica
**Setup**: laptop + LIM esterna (HDMI/USB-C) + speaker audio + kit fisico Omaric su tavolo + Volumi cartacei a portata
**Prerequisito tecnico**: ELAB prod LIVE (https://www.elabtutor.school) + n8n compile webhook OK + UNLIM Edge Fn deployed
**Ruolo**: Andrea conduce + Tea support (volumi mostrati) + Omaric (kit fisico)

---

## §1 — Apertura "il problema docente" (60 sec)

**Pitch**:
> "Quanti di voi insegnano elettronica o Arduino e perdono 15 minuti a inizio lezione per capire cosa fare oggi? Quanti vorrebbero che il docente arrivi davanti alla LIM e inizi SUBITO senza attrito? Questo è ELAB Tutor."

Mostra Volumi cartacei (Vol1+Vol2+Vol3) sul tavolo. Indica: "I libri ci sono. Il kit c'è (Omaric). Ma il software che li unisce in classe — è quello che manca."

---

## §2 — Apri ELAB + Lavagna (45 sec)

**Andrea**: apri Chrome → naviga `https://www.elabtutor.school` → click "Lavagna".

**Mostra**:
- Pagina si carica < 2sec
- LIM-ready interface (font grande, palette ELAB Navy/Lime/Orange)
- Mascotte UNLIM in basso destra
- Toolbar 4 strumenti: Pen, Wire, Select, Delete

**Pitch**: "Tutto pulito. Niente menu nascosti. Il docente è davanti alla classe — non davanti al computer."

---

## §3 — Mount esperimento Vol1 cap6 LED (60 sec)

**Andrea**: dalla sidebar pannello sinistro → Volume 1 → Capitolo 6 (LED) → Esperimento 1 "Lampeggia LED".

**Mostra**:
- Schermata si popola: simulator canvas mostra NanoR4 Arduino + breadboard + LED + resistenza 220Ω
- Pannello destro: testo Vol.1 pag.29 VERBATIM (cita libro)
- Componenti pre-piazzati come da kit fisico Omaric

**Pitch**: "L'esperimento esiste a pagina 29 del Volume 1. Sullo schermo vedete LE STESSE PAROLE. Stesso ordine, stesso disegno. Il docente legge dal libro O dallo schermo — è la stessa cosa."

**Mostra confronto**: Tea apre Volume 1 a pagina 29. Stessa figura. Stessa terminologia. **Morfismo Sense 2** in azione.

---

## §4 — UNLIM voice "spiegami il LED" (90 sec)

**Andrea**: click microfono UNLIM (top-right) o dice "Ehi UNLIM, spiegami il LED a pagina 29".

**Mostra**:
- Wave audio attiva
- Mascotte UNLIM in stato "ascolta"
- Dopo ~2sec risposta:
  - **Voce Isabella italiana** legge: "Ragazzi, il LED è come una piccola lampadina elettronica. Si accende solo se la corrente entra dal lato corretto, come un rubinetto che fa passare l'acqua in una sola direzione. Vedete a pagina 29 del Volume 1: questo è l'esperimento di base."
  - Testo a schermo: stesse parole + tag `[AZIONE:highlight:led1]` → simulator highlight LED in giallo

**Pitch**: "Plurale 'Ragazzi'. Cita Volume + pagina. Massimo 60 parole. Analogia rubinetto. Il docente sa esattamente cosa dire alla classe — non un imperativo a lui, ma il linguaggio rivolto alla classe."

**Onestà**: se Edge TTS WS è instabile, UNLIM usa fallback browser SpeechSynthesis (audible, non perfetto).

---

## §5 — Compila + carica circuito (90 sec)

**Andrea**: click "Compila & Carica" sul pannello codice (mostra editor C++ pre-popolato con `digitalWrite(13, HIGH); delay(500); ...`).

**Mostra**:
- Compilazione ~3sec (n8n webhook compile)
- HEX file emulato avr8js nel browser
- LED simulator inizia a lampeggiare (giallo on/off ogni 500ms)
- Scratch/Blockly tab disponibile a fianco (per docenti più giovani / classi primarie)

**Pitch**: "Compila in 3 secondi. Niente installazioni Arduino IDE. Niente cavi USB. Il LED lampeggia nel simulatore — i ragazzi vedono SUBITO il risultato. Poi costruiscono la stessa cosa sul kit FISICO sul banco."

**Ora Omaric**: prendi kit fisico. Mostra LED reale + breadboard + Arduino Nano. Setup identico al simulator.

---

## §6 — Vision: "guarda cosa abbiamo fatto" (75 sec)

**Andrea**: click "Webcam" UNLIM oppure dice "UNLIM guarda il mio circuito".

**Mostra**:
- UNLIM cattura screenshot del simulator OR webcam reale del kit
- Analisi vision (Gemini Vision):
  - "Ragazzi, vedo il vostro LED collegato al pin 13. La resistenza è da 220 ohm — perfetta per limitare la corrente. Il catodo (lato corto) è correttamente sul negativo. Volume 1 pagina 29 — esattamente come nel libro."

**Pitch**: "ELAB VEDE cosa hanno costruito i ragazzi. Diagnosi visiva istantanea. Il docente non deve passare in ogni banco — UNLIM aiuta tutti."

---

## §7 — Modalità Percorso + Passo-Passo (60 sec)

**Andrea**: dimostra 3 modalità switch:

1. **Percorso** (lettura libro): scroll narrativo capitolo come pagina libro. Docente vede al volo cosa dire prossimo. "Occhio scorre" — zero training necessario.
2. **Passo-Passo**: step sequenziali costruzione kit. Verifica componente per componente.
3. **Libero**: sandbox post-completamento. Studenti sperimentano variazioni.

**Pitch**: "Tre modi di usare lo stesso esperimento. Il docente decide. La classe partecipa. Niente è imposto."

---

## §8 — Fumetto fine sessione (45 sec)

**Andrea**: click "Crea Fumetto" oppure dice "UNLIM, leggi il rapporto".

**Mostra**:
- Genera fumetto sessione: 6 vignette con foto del LED costruito + narrazione
- Citazione Vol.1 pag.29 VERBATIM nei dialoghi
- Voice Isabella legge il fumetto vignetta per vignetta
- Export PDF disponibile per quaderno classe

**Pitch**: "Ogni lezione lascia una traccia. Il fumetto va nel quaderno della classe. Tea, la nostra collaboratrice, ha disegnato gli stili — coerenti con i Volumi cartacei."

---

## §9 — Pacchetti + pricing (45 sec)

**Andrea mostra slide 1-pager Tea**:

| Pacchetto | Cosa include | Target | Prezzo |
|-----------|--------------|--------|--------|
| **Base** | Lavagna + UNLIM chat + Vol1+2+3 + 92 esperimenti | Docenti curiosi | €X/mese |
| **Pro** | Base + Voice Isabella + Vision diagnosi | Scuole innovative | €X+15/mese |
| **Premium Video** | Pro + 92 video lezioni Tea narrate UNLIM | Scuole top | €X+50/mese |

**Differenziatore vs competitor**:
- Tinkercad / Wokwi: NO RAG italiano, NO voice, NO video
- LabsLand: hardware-only, NO software UNLIM
- ELAB = unico sistema Volumi + Kit + Software COERENTE

---

## §10 — Chiusura + call-to-action (30 sec)

**Pitch**:
> "ELAB Tutor è LIVE. Prova ora. Dai il QR alla classe. Il docente entra in 30 secondi. La fiera dura 2 giorni — io e Omaric siamo qui. Davide cura MePA. Giovanni l'export. Vi diamo demo gratuita 30 giorni."

**Distribuisci**:
- QR code → https://www.elabtutor.school
- Brochure 1-pager (Tea design)
- Biglietto da visita Andrea + Omaric

---

## §11 — Backup demo (in caso di failure tecnico)

Se prod va giù durante demo:
1. **Internet down**: switch a localhost ELAB (laptop pre-configurato `npm run dev`)
2. **n8n compile down**: skip §5, mostra LED già lampeggiante via simulator demo state
3. **UNLIM down**: skip §4 §6, fallback a "vedete il libro a pagina 29"
4. **TTS down**: voce Isabella browser fallback OR leggi tu il testo
5. **Vision down**: skip §6, mostra solo simulator

---

## §12 — Setup pre-fiera (ultimi 2 giorni Andrea + Tea)

**04/05 (Domenica)**:
- Brochure 1-pager Tea finale (con palette ELAB)
- 50 QR card stampati
- Demo prove laptop con LIM esterna (luminosità + audio)
- Backup laptop secondario sincronizzato

**05/05 (Lunedì)**:
- NO modifiche tecniche al prodotto
- Stress test prod 10 esperimenti diversi end-to-end
- Voice Isabella speaker test ambient noise (fiera = rumore)
- Pacchetti pricing sticker decisi e stampati

**06/05 (Martedì) — Fiera**:
- Setup ore 8:00 (apertura 9:00)
- Andrea conduce demo + Omaric kit + Tea support
- Cicli demo ogni 5-7 min
- Capture lead emails + QR scan analytics

---

## §13 — Honesty caveats demo

**Cose che funzionano BENE** (mostrare):
- Lavagna mount esperimento + verbatim citation
- UNLIM chat "Ragazzi" plurale
- Compile + simulator AVR8js LED
- Fumetto sessione end
- Pacchetti tier video lezioni differenziatore

**Cose con caveat** (mostrare con consapevolezza):
- Voice TTS browser fallback (non Edge TTS WS perfect)
- Vision Gemini latency 3-8s (acceptable demo)
- n8n compile dipende Vercel env corretta (verificare 06/05)

**Cose da NON mostrare**:
- Bench scores interni (recall@5, R5, ecc.)
- Console errors browser (open dev tools → close)
- Mac Mini factotum (irrelevant per visitatori)
- ADR / docs PDR (interno dev only)
- Backfill metadata (invisible utente)

---

**End of demo script v1 2026-04-28**

Refs: docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md + docs/adrs/ADR-019 + ADR-022 + CLAUDE.md DUE PAROLE D'ORDINE
