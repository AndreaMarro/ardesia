# G22 — SEZIONI VOLUME + MODALITA' INVENTORE

Esegui il piano in `docs/plans/2026-03-29-volume-sections-and-roadmap.md` — sessione G22.

## CONTESTO RAPIDO
- G21 ha fixato UNLIM (60 parole, input bar, markdown, vocabolario).
- Il 70% dell'infrastruttura Volume Sections esiste gia':
  - `volumeAvailableFrom` su 22 componenti SVG
  - `ComponentPalette` con `volumeFilter` funzionante
  - `ExperimentPicker` con `userKits` filtro
  - `selectedVolume` stato in ElabTutorV4
- Design approvato: UNLIM chiede "Quale volume?" + ritorno "Bentornati + Continua"

## OBIETTIVO G22
Implementare sezioni volume complete. 1 click per entrare nel volume giusto.

## TASK

### Task 1: Sostituire welcome modal con Volume Chooser (4h)
- Rimuovere il welcome modal "BENVENUTO NEL TUTOR"
- Al suo posto: schermata UNLIM con 4 scatole:
  - [🔋 Volume 1 — 38 esperimenti]
  - [⚡ Volume 2 — 18 esperimenti]
  - [🤖 Volume 3 — 11 esperimenti]
  - [💡 Inventore — Tutti i pezzi]
- Mascotte UNLIM visibile con messaggio: "Ciao! Quale volume usate oggi?"
- Palette colori: Vol1=#4A7A25, Vol2=#E8941C, Vol3=#E54B3D, Inventore=#1E4D8C
- Touch target: ogni scatola minimo 80x80px

### Task 2: Stato activeVolume (2h)
- Nuovo stato `activeVolume` (1, 2, 3, 'all', o null)
- Passare `activeVolume` a NewElabSimulator
- NewElabSimulator passa a ExperimentPicker come filtro numerico
- NewElabSimulator passa a ComponentPalette come `volumeFilter`
- Componenti CUMULATIVI: Vol2 = componenti Vol1 + Vol2

### Task 3: Ritorno "Bentornati + Continua" (2h)
- In classProfile.js: salvare `lastVolume` e `lastExperimentId` nella sessione
- buildClassProfile() ritorna `lastVolume`
- Se lastVolume esiste: mostrare "Bentornati! Ultima volta: Volume X, Cap Y. Continuiamo?"
- Bottoni: [▶ Continua] + [Cambia volume]
- "Continua" → carica lastVolume + lastExperiment

### Task 4: Barra superiore con "Volume X [Cambia]" (1h)
- Sostituire "Versione di prova — Volume 1 (38 esperimenti)"
- Con: "Volume X — N esperimenti [Cambia]"
- [Cambia] ri-mostra il volume chooser

### Task 5: Modalita' Inventore (2h)
- activeVolume = 'all'
- Breadboard vuota (nessun esperimento pre-caricato)
- Tutti i componenti nella palette
- Disclosure level 2 (editor/Scratch/Serial visibili)
- UNLIM: "Modalita' Inventore! Hai tutti i pezzi. Cosa vuoi costruire?"
- Nessun LessonPath (il pannello non si apre)

### Task 6: Contesto AI con volume attivo (0.5h)
- Nel system prompt: "L'insegnante sta usando il Volume X"
- Se Inventore: "L'insegnante e' in modalita' libera — tutti i componenti"

## VERIFICA 8 STRATI CoV
1. Build & Test Gate
2. Browser: primo accesso → 4 scatole volume (non welcome modal)
3. Browser: tocca Vol 2 → solo 18 esperimenti nel selettore
4. Browser: palette Vol 2 → componenti Vol1+2, NO Arduino/LCD/Servo
5. Browser: ritorno → "Bentornati, Volume 2, Continuiamo?"
6. Browser: Inventore → tutti i componenti, breadboard vuota, editor visibile
7. LIM 1024x768: scatole grandi, toccabili, leggibili
8. Prof.ssa Rossi: 1 click → sei nel volume giusto

## REGOLE
- ZERO REGRESSIONI
- Non toccare engine/
- I 62 lesson paths JSON NON cambiano
- Le 3 modalita' (Gia' Montato/Passo Passo/Libero) restano identiche
