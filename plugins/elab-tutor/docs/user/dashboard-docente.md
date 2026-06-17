# Dashboard Docente — Guida d'uso

**Audience**: docente secondaria di primo grado (scuola media) con o senza competenze tecniche.
**Prerequisiti**: account ELAB Tutor attivo con ruolo `docente`. Smartphone/tablet/PC con browser moderno.
**Versione documento**: 19 aprile 2026.

## Cosa fa la Dashboard

La Dashboard Docente monitora la classe in tempo reale. Ti dice:

- **Chi sta lavorando oggi** e chi non si connette da più di 7 giorni.
- **Dove si blocca la classe**: gli esperimenti con più errori, i concetti in confusione.
- **Come è andata la settimana**: trend linea degli esperimenti completati.
- **Dove intervenire**: gli studenti con tempo basso o errori ricorrenti su cui mandare un nudge.

Tutto si aggiorna automaticamente quando lo studente usa ELAB. Tu non devi cliccare "Aggiorna".

## Come entrare

1. Vai su https://www.elabtutor.school.
2. Fai login con le tue credenziali docente.
3. Nel menu in alto, clicca **"Classe"** oppure scrivi nell'URL `#dashboard`.

La Dashboard si apre sulla sezione "Progressi classe".

## Le tre schede principali

### 1. Classe

Due viste:

- **Progressi** (default): lista studenti con stato (attivo / inattivo / bloccato), ultimo accesso, esperimenti completati.
- **Giardino**: vista visuale con mascotte per ogni studente. Il mascotte cresce quando lo studente avanza.

Clicca un nome per aprire la scheda dettaglio di quello studente (esperimenti fatti, tempo, errori, concetti in confusione).

### 2. Report

Tre sotto-schede:

- **Meteo**: un emoji che riassume come va la classe (☀️ bene, ⛅ attenzione, 🌧️ intervento necessario).
- **Report**: numeri chiave — attivi oggi, inattivi da 7+ giorni, esperimenti totali completati, tempo medio.
- **Attività**: classifica settimanale, chi ha fatto di più, chi è regredito.

### 3. Impostazioni

- **Classi**: crea nuove classi, invita studenti con codice.
- **Documenti**: PDF da condividere (verifiche, dispense, note).
- **PNRR**: metriche per rendicontazione (ore di attività per studente).
- **Audit**: log eventi sicurezza (chi ha acceduto, quando).

## Filtri e ricerca

In alto a destra:

- **Ricerca testuale**: scrivi nome/cognome/email per filtrare la lista.
- **Filtro volume**: "tutti", "Volume 1", "Volume 2", "Volume 3". Mostra solo gli studenti che stanno lavorando sul volume selezionato.

I filtri si ricordano tra una visita e l'altra (session storage).

## Esportare i dati (CSV)

Nella sezione "Report" c'è il pulsante **"Esporta CSV"**.

Scarica un file `studenti_export_AAAA-MM-GG.csv` con:
- Nome studente
- Esperimenti completati
- Tempo totale
- Ultimo accesso
- Punteggio medio giochi

Il file si apre con Excel, LibreOffice, Google Sheets. Formato Italiano (virgola come separatore decimale, date `gg/mm/aaaa`).

**Uso tipico**: lo incolli nel registro elettronico o lo mandi al Dirigente per il monitoraggio.

## Mandare un nudge

Nella scheda singolo studente, sezione **"Nudge"**:

1. Scrivi un messaggio breve (es. "Forza, ricomincia dall'esperimento 3").
2. Seleziona il canale (chat interna ELAB oppure email).
3. Clicca **"Invia"**.

Il nudge arriva allo studente nella sua area UNLIM oppure via email.

Puoi anche scegliere da **suggerimenti pre-scritti** se non sai cosa dire.

## Cosa fare se...

### Non vedo nessuno studente

Possibili cause:
1. **Nessuno studente ha ancora attivato l'account.** Vai in Impostazioni → Classi → invita studenti con codice.
2. **Supabase è offline temporaneamente.** Vedi banner in alto "Dati non sincronizzati". Ricarica la pagina dopo qualche minuto.
3. **Sei connesso con account docente sbagliato.** Controlla l'email in alto a destra.

### I dati sembrano vecchi

Tre livelli di sorgenti dati, in ordine di priorità:
1. **Cloud** (Supabase) — dati cross-device aggiornati.
2. **Server ELAB** — dati del tuo PC/tablet sincronizzati.
3. **Locale** — solo questo browser, non sincronizzati.

Se vedi scritto "Local" in alto nella Dashboard, significa che la sync cloud non ha funzionato. Controlla internet o ricarica.

### L'Export CSV è vuoto

Apri il file: se ha solo l'intestazione senza righe, vuol dire che nessuno studente ha ancora completato esperimenti. Normale a inizio anno scolastico.

### Non funziona lo screen reader

Stiamo migliorando l'accessibilità (audit in corso 19/04). Se hai segnalazioni specifiche su VoiceOver/NVDA/JAWS scrivi a supporto@elabtutor.school.

## Performance attese

- Primo caricamento: <3s su WiFi scolastica tipica (audit iPad-first).
- Aggiornamento dati: istantaneo (push Supabase real-time dove disponibile).
- Export CSV: <1s per classi fino a 100 studenti; 5-10s per 1000+ studenti.

## Privacy

- I dati studenti sono memorizzati su Supabase UE (Francoforte) — GDPR compliant.
- Il docente vede solo studenti delle sue classi. Gli altri sono invisibili.
- L'esportazione CSV contiene dati personali: custodiscilo secondo policy scolastica (GDPR Art. 5).

## Contatti

- Supporto: supporto@elabtutor.school
- Documentazione tecnica: `docs/user/` del repository `AndreaMarro/elab-tutor`
- Feedback prodotto: thumbs-down/up nella Dashboard stessa (in basso a sinistra)

---

*Documento revisionato 19 aprile 2026. Aggiornamenti: `docs/HISTORY.md`.*
