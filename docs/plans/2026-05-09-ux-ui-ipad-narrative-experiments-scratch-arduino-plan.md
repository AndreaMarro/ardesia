# Piano UX/UI - iPad, Libro Narrativo, Scratch e Arduino

Data: 2026-05-09

## Obiettivo

ELAB non deve mostrare 94 esperimenti come schede isolate. Deve far percepire una progressione: ogni esperimento e' una scena di una storia tecnica, dove il circuito, il codice, Scratch, Arduino, report, album e fumetto sono viste diverse dello stesso percorso.

## Principi

1. Primo schermo operativo, non marketing.
2. iPad come superficie principale: zero overflow, controlli grandi, chat non invasiva, gesto sempre reversibile.
3. Libro e software paralleli: volume, capitolo, pagina e arco narrativo devono restare visibili come contesto, non come citazione decorativa.
4. Scratch e Arduino non sono due mondi separati: Scratch e' la versione visiva del ragionamento; Arduino e' la versione testuale verificabile.
5. UNLIM risponde prima con orientamento operativo, poi esegue/diagnostica/verifica in parallelo.

## Architettura Esperienza

### Vista Volume

- Timeline narrativa dei capitoli.
- Stato studente: esperimenti completati, badge server-side, fumetti disponibili, errori ricorrenti.
- Indicatore arco narrativo: problema, scoperta, costruzione, verifica, capstone.
- Accesso rapido: continua ultimo esperimento, ripassa concetto fragile, genera report docente.

### Vista Capitolo

- Capitolo come episodio.
- Esperimenti ordinati come evoluzione, non griglia piatta.
- Ogni esperimento mostra:
  - cosa abbiamo gia imparato;
  - cosa cambia nel circuito;
  - componente nuovo;
  - rischio tipico;
  - pagina libro;
  - stato fumetto/album.

### Vista Esperimento

- Split mentale, non layout pesante:
  - sinistra/alto: circuito e azioni;
  - destra/basso: percorso libro + UNLIM.
- iPad portrait:
  - circuito primo;
  - barra compatta volume/capitolo/pagina;
  - UNLIM come pannello flottante non coprente;
  - Scratch/Arduino in sheet espandibile.
- iPad landscape:
  - circuito + editor affiancati;
  - percorso narrativo come rail;
  - chat compatta in basso/destra.

## Scratch

- Caricamento workspace come azione verificata.
- Blocchi generati solo quando richiesto o quando il libro sta introducendo programmazione visuale.
- Ogni blocco deve essere collegato a:
  - concetto didattico;
  - equivalente Arduino;
  - errore tipico;
  - step narrativo.
- Test richiesti:
  - load workspace reale;
  - no workspace inventato quando utente chiede solo di aprire Scratch;
  - passaggio Scratch -> Arduino con codice equivalente;
  - verifica che il workspace non produca `[object Object]` o white screen.

## Arduino

- `setcode` sempre verificato con readback editor.
- `compile` sempre verificato dal risultato reale.
- Risposta UNLIM:
  - immediata sotto 2s per intenzioni note;
  - compile/diagnosi asincrona con stato aggiornato;
  - mai "compilato" se il tool fallisce.
- Test richiesti:
  - Blink non confuso con semaforo;
  - semaforo non degradato a Blink;
  - setcode + compile sequenziali;
  - errore compile riportato e non dichiarato PASS;
  - upload/hardware solo con log hardware reale.

## UNLIM 1-2 Secondi

Il target va definito correttamente:

- PASS: prima risposta operativa o orientamento entro 1-2s.
- PASS: azione locale verificabile lanciata subito e verificata entro budget separato.
- Non garantibile oggi: audio completo Voxtral sotto 2s per frasi lunghe.

Per avvicinare voce sotto 2s:

- frasi TTS corte;
- cache per frasi frequenti;
- warm path Voxtral;
- streaming/chunking audio;
- speak-first con frase breve, poi dettaglio testuale.

## Fumetto e Leonardo.ai - Prossima Sessione

- Benchmark dedicato da fare nella sessione successiva, come richiesto.
- Pipeline admin/editoriale:
  - usa `narrative_map`;
  - usa screenshot sessione;
  - usa cronologia e memoria UNLIM;
  - usa fumetti v2 come reference;
  - genera massimo 6 pannelli;
  - salva asset e metadata su storage.
- Runtime lezione:
  - legge solo asset finali;
  - non rigenera live;
  - collega fumetto ad album studente e capitolo.

## Gate

- No production senza CoV, quality audit e test post-deploy.
- No hardware PASS senza log hardware.
- No voce clone percettiva PASS senza ascolto umano o test percettivo.
