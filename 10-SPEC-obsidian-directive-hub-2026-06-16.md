---
tipo: spec
sotto-progetto: B — Obsidian-as-directive-hub
data: 2026-06-16
stato: DRAFT (attende review Andrea)
parte-di: "[[00-PIANO-MAXDEV-2026-06-15]]"
prossimo: writing-plans -> implementazione
---

# SPEC B — Obsidian come hub di idee/direttive

## 1. Problema (la tua frase)
"Telegram troppo limitato, non posso dare idee e direttive" + "Obsidian non è usata come app che ho scaricato". Sei **soprattutto al telefono, fuori casa**. Serve un canale RICCO per dare direttive da mobile, e gli agenti devono leggerle e AGIRE, non solo loggare. Obsidian (che già paghi e hai nel dock) diventa quel canale; Telegram retrocede a notifiche realtime.

## 2. Stato reale (verificato live 16/06 — onesto)
- ✅ Obsidian app installata (MacBook, confermato dock); `~/ARDESIA-VAULT` È un vault vero (`.obsidian/`), aperto nell'app (`obsidian.json`, vault `ed174f1f...`). Vault piccolo: **632K, testo**.
- ⚠️ **Obsidian Sync paga­to MA `"sync": false` su questo vault** (`core-plugins.json`) → NON sta sincronizzando. Causa concreta del "non è usata". **Fix step-0 = abilitarlo.**
- ✅ Syncthing gira su **entrambe** le macchine (MacBook PID 1091/1670; Mini visto pre-timeout). Relay vault MacBook↔Mini fattibile.
- ❌ `~/ARDESIA-VAULT` **assente sul Mini** (lì c'è solo `ardesia-wiki`) → gli agenti Mini oggi NON vedono il vault governance.
- ❌ Nessun community plugin nel vault → **no Local REST API** (gli agenti toccano file grezzi, non l'app).
- ⚠️ **Mini SSH (Tailscale) caduto a metà sessione** (2 timeout) → conferma: serve un watcher host-up FUORI dal Mini (vedi §7). Voci Mini-side da ri-confermare a Mini risalito.

## 3. Architettura — 3 tratte di sync (riusa ciò che hai)
```
[ Telefono Obsidian ] --Obsidian Sync (paid)--> [ MacBook Obsidian ] --Syncthing--> [ Mini (file) ] --git--> [ GitHub backup ]
        ^  rich editing, offline-ok, mobile-native           ^ relay continuo                ^ agenti leggono/scrivono file   ^ durabilità+storia
```
1. **Telefono ↔ MacBook = Obsidian Sync** (lo hai). Abilitarlo sul vault. Editing ricco, mobile-nativo, offline-queue.
2. **MacBook ↔ Mini = Syncthing** (gira su entrambi). Sync continuo della cartella vault.
3. **Mini → GitHub = git auto-commit** (launchd, come i 3 repo di oggi). Backup + storia + versioning della vista-Mini.

Headless-friendly: il Mini NON deve eseguire Obsidian; legge/scrive **file** sincronizzati.

## 4. Pipeline direttive (il cuore)
1. Scrivi in `_inbox/` (anche una riga dal telefono) o `90-DIRETTIVE.md`.
2. **Strategos** (Mini) scandisce `_inbox/` a ogni ciclo → parsa → converte in **pin / route-change** (meccanismo COORDINATION esistente) → **AGISCE**.
3. L'agente scrive ACK+stato in `_status/` (o inline nella tua nota) → risincronizza → **lo vedi in Obsidian sul telefono** ("preso in carico" / "fatto", con link al commit/PR).
4. Convenzione leggera prima riga della nota: `#pin lessonos: ...` · `#pin studio: ...` · `#idea: ...` · `#domanda: ...` → routing affidabile con attrito ~zero in scrittura.

## 5. Write-zones (zero conflitti Syncthing/Sync)
| Zona | Proprietario | Contenuto |
|---|---|---|
| `_inbox/`, `90-DIRETTIVE.md`, `0x-*.md` | **Andrea** | idee, direttive, governance |
| `_status/`, `_agent-out/`, `wiki/` | **agenti** | ack, report, output |
Mai lo stesso file da due lati → niente merge-conflict.

## 6. Telegram residuo (thin realtime)
Resta per: alert deadman/milestone, screenshot live, comandi rapidi (pin/modello/stop), + ping "nuova direttiva vista/fatta". La COMPOSIZIONE di idee/direttive si sposta su Obsidian. (Voce opzionale: app audio nel dock → fase-2 voce→trascrizione→`_inbox/`, vedi §9.)

## 7. Reliability — watcher host-up FUORI dal Mini (finding 16/06)
Il deadman (`com.ardesia.deadman`) gira SUL Mini → non può allertare se il Mini/host è giù (oggi caduto). Serve un check esterno: MacBook (launchd) o ping cloud che pinga Mini/Tailscale ogni N min e avvisa Telegram se irraggiungibile > soglia. **Appartiene al sotto-progetto C ma è emerso qui.**

## 8. Fasi
- **MVP (B-1):** abilita Obsidian Sync sul vault · Syncthing folder vault MacBook↔Mini · `_inbox/` + write-zones · Strategos legge `_inbox/`→pin + scrive `_status/` · git-backup Mini→GitHub (nuovo repo privato `ardesia-vault` o riuso).
- **B-2:** ping Telegram "direttiva vista/fatta" · convenzione `#pin/#idea/#domanda` parser robusto.
- **B-3 (opz):** voce→trascrizione→`_inbox/` (whisper; l'ogg 13/06 non trascritto è il sintomo) · Local REST API su MacBook per desktop-Claude↔app-live.

## 9. Decisioni aperte
1. Intake direttive: **`_inbox/` free-form + convenzione leggera** (consigliato, attrito minimo) vs `90-DIRETTIVE.md` template rigido. → *attende conferma.*
2. Vault su GitHub: nuovo repo privato `ardesia-vault`? (sì consigliato per durabilità — coerente con lessonos/ardesia-studio/ardesia-tools).
3. Voce dal telefono (B-3) sì/no.

## 10. Criteri di successo (misurabili)
- Scrivo una direttiva dal telefono → entro X min compare sul Mini → Strategos crea il pin → entro Y vedo ACK in Obsidian mobile. (X,Y da fissare; target X≤15min Mac-sveglio.)
- Zero merge-conflict in 1 settimana (write-zones tengono).
- Telegram non più usato per comporre direttive (solo alert/comandi).

## 11. Fuori scope (spec separate)
- **A — Memoria** (mem0 deploy da zero + agentmemory su MacBook + distillazione GDPR-safe one-way). agentmemory: 70.6k obs ma **0 memorie distillate**; mem0 **inesistente**. Spec dedicata.
- **C — Cleanup/consolidation** + watcher host-up (§7) + claude-mem SPOF.
