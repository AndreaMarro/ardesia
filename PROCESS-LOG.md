# LessonOS — Process Log (RETRO / auto-miglioramento dei processi di Hermes)
Append-only. Una riga per retro: `RETRO <data>: attrito=… → miglioria=… [applicata: file/skill | proposta]`.

- 2026-06-06 setup — baseline processi: pipeline AGENTS §3, debug §11, retro §12, coord §13, wiki §10. Nessun attrito registrato ancora.
- 2026-06-07 RETRO #1: attrito=STATUS.md non aggiornato quando HEAD avanza (M3-task1 committato senza STATUS entry) + cost_usd sempre 0 anche quando dovuto. → **miglioria: commit message include sempre `cost_usd: <stimato>` + gate status** — già in atto parzialmente (gate status in body), aggiungere cost_usd esplicito. [applicata: convention nei nuovi commit]
