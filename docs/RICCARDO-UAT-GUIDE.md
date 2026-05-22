# UAT — Carica un programma sul kit fisico Arduino Nano R4

**Per:** Andrea, Tea, Riccardo (Omaric) — chi ha in mano la scheda fisica.
**Sprint B / iter 103.** Aggiornato 2026-05-21.

Questo test va fatto con una **scheda Arduino Nano R4 vera in mano**. Serve a
verificare l'ultima parte della catena — il caricamento fisico del programma —
che non è verificabile senza hardware.

---

## Cosa è già verificato (non serve rifarlo)

- **Compilazione dal browser** per Nano R4: `#compile-home` → blocchi → **Compila**
  → il programma viene compilato sul cloud e torna un file HEX reale.
- **Bottone "Carica sul kit fisico"**: appare attivo (verde, cliccabile) appena
  c'è un programma — non più finto-disattivato (correzione iter 103).

## Cosa verifica questa UAT (serve la scheda)

Il caricamento vero: selettore USB del browser → scrittura del programma sulla
Nano R4 → **il LED lampeggia**. Questo conferma che il programma gira davvero
sulla scheda fisica.

---

## Prerequisiti

- **Computer** (non tablet). Browser **Chrome** o **Edge** — Safari e Firefox
  non supportano il caricamento USB dal browser.
- **Arduino Nano R4** del kit ELAB + **cavo USB dati** (non un cavo solo-carica).
- Indirizzo: **https://www.elabtutor.school/#compile-home**

---

## Procedura passo-passo

1. Apri **`#compile-home`**. Resta in modalità **"Blocchi"**.
2. Scegli un programma pronto: **"Accendi un LED"**.
3. Premi **"Compila"**. Attendi il messaggio di compilazione completata con la
   dimensione del programma in byte.
4. Collega la **Nano R4** al computer con il cavo USB.
5. Premi **"Carica sul kit fisico"**.
6. Si apre il **selettore USB del browser**: scegli la Nano R4 e premi
   **"Connetti"**.
7. Se il caricamento non parte: premi **due volte il tasto RESET** sulla Nano R4
   (entra in modalità bootloader), poi premi **"Riprova caricamento"**.
8. Attendi la scrittura. Esito atteso: messaggio di successo **e LED che
   lampeggia** (circa 1 secondo acceso / 1 secondo spento).

---

## Esiti — cosa significano

| Cosa vedi | Significato | Azione |
|---|---|---|
| LED lampeggia + "Caricato sul kit fisico Nano R4" | Caricamento reale riuscito | **UAT PASS** |
| "Compilazione completata… collegate il Nano R4" | Nessuna scheda scelta nel selettore USB | Collega la scheda, "Riprova caricamento" |
| Messaggio di simulazione / "completato (simulato)" | Caricamento **non reale** — la scheda non è stata scritta | **Non è un PASS** — segnala ad Andrea |
| "Caricamento fallito" / errore | Errore durante la scrittura DFU | Doppio RESET, riprova; annota il messaggio esatto |
| Errore di compilazione | Il programma non compila | Annota l'errore esatto |

---

## Cosa segnalare ad Andrea dopo il test

- Esito finale (quale riga della tabella sopra).
- **Il LED lampeggia? sì / no.**
- Browser e sistema operativo usati.
- Se ci sono errori: screenshot della console (tasto **F12** → scheda **Console**).
- I messaggi di errore copiati testualmente.

---

## Note oneste

- Il caricamento fisico USB su Nano R4 reale **non è verificabile in automatico**
  senza la scheda: per questo serve questa UAT manuale.
- Lo stato "simulato" è previsto solo per i test automatici. Su scheda vera deve
  sempre risultare **reale**: se vedi "simulato" su hardware vero, è un problema
  da segnalare.
- `#compile-home` funziona su computer con Chrome/Edge, non su tablet.
