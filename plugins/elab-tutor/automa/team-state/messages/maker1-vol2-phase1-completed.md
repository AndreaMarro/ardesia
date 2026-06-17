# Maker-1 Vol2 Phase 1 Completion
- Date: 2026-05-07T02:45:33Z
- Esperimenti audited: 13/13
- Chapters covered: 3, 4, 5, 6
- Output file: automa/state/maker1-vol2-ch3-6-audit.md
- File size: 265 lines
- Top 3 findings:
  1. v2-cap5-esp1 + v2-cap5-esp2 SEVERITY HIGH: code usa due battery9v 9V mentre PDF usa 3-4 batterie AA/AAA da 1.5V (1.5+1.5=3V, 1.5x3=4.5V, 1.5x4=6V). Concetto somma in serie match, ma materiale fisico divergente vs ground truth narrativa libro.
  2. v2-cap6-esp4 SEVERITY HIGH: PDF usa funzione 'prova diodi e continuita' standalone (coccodrilli direttamente su LED senza alimentazione esterna), code costruisce circuito completo (batteria + R + LED + multimetro in parallelo). Stesso obiettivo (misura Vf) MA metodologia divergente. Code desc dice 'NO breadboard, solo coccodrilli' contraddicendo poi components/steps che includono breadboard + 11 wires.
  3. Cross-cutting PRINCIPIO ZERO violation: 13/13 esperimenti usano linguaggio singolare imperativo "Posiziona/Collega/Prendi" anziche plurale docente "Ragazzi, posizioniamo/collegate"; 13/13 unlimPrompt non citano Vol/pag verbatim ("Vol.2 pag.X").
- Gaps/issues:
  - v2-cap4-esp3: PDF richiede 3 misure separate ai punti specifici J1/J5/J9 fila opposta breadboard; code descrive genericamente "ai capi di ogni resistore" senza struttura 3 letture distinte (medium severity).
  - v2-cap6-esp2 + v2-cap6-esp3: variazioni colori multiple PDF (tabella 3 righe combinazioni; LED rosso+verde+giallo) collapsed in single config code (medium severity).
  - 0/13 esperimenti hanno variations_collapsed_to_separate_esp = true. Cap3-6 non mostrano evidenza forte di "spiattellamento" iter 21 mandate Andrea (potenziale concentrazione spiattellamento e in altri capitoli o Vol3).
- Status: COMPLETED
