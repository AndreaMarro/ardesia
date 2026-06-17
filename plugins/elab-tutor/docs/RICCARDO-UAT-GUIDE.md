# UAT — Caricare un programma sulla Arduino Nano R4 dal browser

**Per:** Andrea, Tea, Riccardo (Omaric) — chi ha in mano la scheda fisica.
**Sprint B / iter 103.** Aggiornato 2026-05-22.

> Questa è una **UAT di scoperta**, non una conferma. Il caricamento dal browser
> sulla Nano R4 reale **non è mai stato provato su hardware**. Questo test serve
> a scoprire se funziona e — se non funziona — a raccogliere i dati esatti per
> capire perché. È possibile che fallisca: è previsto, è lo scopo del test.

---

## Cosa è già verificato (non serve rifarlo)

- **Compilazione dal browser** per Nano R4: `#compile-home` → blocchi → **Compila**
  → il programma viene compilato sul cloud e torna un file HEX reale (verificato
  in produzione, ~38 KB per il programma LED lampeggiante).
- **Bottone "Carica sul kit fisico"**: appare attivo (verde, cliccabile) appena
  c'è un programma — non più finto-disattivato (correzione iter 103).

## Cosa NON è ancora verificato (lo scopre questa UAT)

Il caricamento vero: doppio RESET → selettore USB → scrittura DFU sulla Nano R4
→ **il LED lampeggia**. Nessun pezzo di questa catena è stato provato su una
scheda reale. Il codice segue il modello **plain DFU** (lo stesso dello strumento
ufficiale Arduino `dfu-util`), ma se la libreria DFU del browser si comporti come
previsto con la Nano R4 si saprà solo facendo questo test.

---

## Prerequisiti

- **Computer** (non tablet). Browser **Chrome** o **Edge** — Safari e Firefox
  non supportano il caricamento USB dal browser.
- **Arduino Nano R4** del kit ELAB + **cavo USB dati** (non un cavo solo-carica).
- Indirizzo: **https://www.elabtutor.school/#compile-home**
- **Apri la console del browser PRIMA di iniziare**: tasto **F12** → scheda
  **Console**. Lì compaiono i dati diagnostici che servono ad Andrea.

---

## Procedura passo-passo

1. Apri **`#compile-home`**. Resta in modalità **"Blocchi"**.
2. Scegli un programma pronto: **"Accendi un LED"**.
3. Premi **"Compila"**. Attendi il messaggio di compilazione completata con la
   dimensione del programma in byte.
4. Collega la **Nano R4** al computer con il cavo USB.
5. Premi **due volte, rapidamente, il tasto RESET** sulla Nano R4: la scheda
   entra in **modalità aggiornamento** (bootloader DFU). Procedi subito ai passi
   successivi — la modalità aggiornamento può scadere dopo pochi secondi.
6. Premi **"Carica sul kit fisico"**.
7. Si apre il **selettore USB del browser**: scegli la Nano R4 e premi
   **"Connetti"**.
8. Se la scheda non compare, o se appare il messaggio "la Nano R4 non è in
   modalità aggiornamento": ripeti il doppio RESET (passo 5) e premi
   **"Riprova caricamento"**.
9. Attendi la scrittura. Esito atteso (se tutto va bene): messaggio di successo
   **e LED che lampeggia** (circa 1 secondo acceso / 1 secondo spento).

---

## Esiti — cosa significano

| Cosa vedi | Significato | Azione |
|---|---|---|
| LED lampeggia + messaggio "Caricamento reale ... completato" | Caricamento reale riuscito | **UAT PASS** |
| "la Nano R4 non è in modalità aggiornamento" | La scheda è in modalità esecuzione, non aggiornamento | Doppio RESET, "Riprova caricamento" |
| "Compilazione completata… collegate il Nano R4" | Nessuna scheda scelta nel selettore USB | Scegli la scheda, "Riprova caricamento" |
| Messaggio di simulazione / "completato (simulato)" | Caricamento **non reale** — la scheda non è stata scritta | **Non è un PASS** — segnala ad Andrea |
| "Caricamento fallito" / errore | Errore durante la scrittura DFU | Annota il messaggio esatto + i log console |
| Errore di compilazione | Il programma non compila | Annota l'errore esatto |

---

## Cosa segnalare ad Andrea dopo il test (IMPORTANTE)

Anche se il test fallisce, questi dati servono a capire perché:

- Esito finale (quale riga della tabella sopra). **Il LED lampeggia? sì / no.**
- Browser e sistema operativo usati.
- **Dalla console (F12 → Console): copia testualmente le righe che iniziano con
  `[ELAB DFU flash]`.** Riportano vendor/product ID, versione DFU e descrittori
  della scheda — sono il dato chiave per sapere come si comporta davvero la
  Nano R4 nel browser.
- Eventuali messaggi di errore copiati testualmente.
- Uno screenshot della console, se più comodo.

---

## Note oneste

- **Stato reale.** La compilazione dal browser è verificata end-to-end. Il
  caricamento NO: nessuna Nano R4 ha mai completato un flash dal browser. La
  correzione iter 103 **non ha "eliminato il rischio"** — ha tolto un'ipotesi
  sbagliata dal codice (un indirizzo DfuSe esplicito che la Nano R4 non usa) e
  ha aggiunto la **strumentazione diagnostica** che rende utile questo test. La
  semantica DFU reale della Nano R4 nel browser è ancora da verificare: è ciò
  che questa UAT fa.
- Il caricamento fisico USB su Nano R4 reale **non è verificabile in automatico**
  senza la scheda: per questo serve questa UAT manuale.
- Lo stato "simulato" è previsto solo per i test automatici. Su scheda vera deve
  sempre risultare **reale**: se vedi "simulato" su hardware vero, è un problema
  da segnalare.
- `#compile-home` funziona su computer con Chrome/Edge, non su tablet.
- Finché una Nano R4 non ha completato un flash dal browser ed è ripartita con
  il LED lampeggiante, il caricamento dal browser **non va presentato come
  funzionante** a un partner.
