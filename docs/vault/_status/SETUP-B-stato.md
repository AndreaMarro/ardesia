# SETUP B — stato (2026-06-16)
## FATTO (MacBook-local)
- Zone: `_inbox/` `_status/` `_agent-out/` + `90-DIRETTIVE.md` + convenzione.
- git init locale del vault + commit (storia su disco, pronto al push).
## BLOCCATO (serve azione)
- [ ] **Push vault → GitHub privato `ardesia-vault`**: gh-token MacBook INVALIDO + Mini SSH down. Sblocco: `gh auth login` sul MacBook, oppure Mini risale (gh ok lì).
- [ ] **Obsidian Sync**: `"sync": false` sul vault → abilitarlo in App → Impostazioni → Sync → connetti remote (passo GUI/account = tuo, ~1 min).
- [ ] **Syncthing folder** vault MacBook↔Mini: serve Mini su.
- [ ] **Strategos legge `_inbox/`** + scrive `_status/`: codice Mini, serve Mini su.
- [ ] **Watcher host-up OFF-Mini** (il deadman gira sul Mini, non vede il Mini giù).
## NOTA
Mini Tailscale irraggiungibile da ~10min: controlla Mini/Tailscale.
