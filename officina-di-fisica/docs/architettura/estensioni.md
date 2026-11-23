# Installare una disciplina, un motore o un provider

Dalla cartella dell’applicazione, avvia una copia temporanea con il motore di geometria. I comandi richiedono Python 3.11 o successivo per gli strumenti di confezionamento e Node 22 per i test. Il servizio per studenti utilizza la libreria standard Python e gli asset inclusi.

```sh
export ASTRA_DATA="$(mktemp -d)"
export ASTRA_EXTENSIONS="$PWD/examples/extensions"
python3 app.py serve --port 8848
```

In un secondo terminale, dalla stessa directory e con la stessa variabile `ASTRA_DATA`, esegui `python3 app.py autore --port 8848`. In **Area autore → Importa ed esporta** seleziona `examples/geometria.json`, controlla il lotto, importalo in bozza e pubblica insieme i tre materiali dall’archivio. Apri il quaderno di prova, scegli **Geometria delle figure → Lezioni → Misurare una superficie**. Apri la simulazione nel paragrafo «Disponi tre file». Con base 2 cm l’area è 6 cm². Con base 5 cm misuri 15 cm². La differenza di 9 cm² corrisponde a tre nuove colonne da tre quadratini. [Lotto completo](../../examples/geometria.json) · [Motore installabile](../../examples/extensions/area-rettangolo/1.0.0)

Per integrare un altro sistema, leggi `GET /api/v1/openapi.json`. Con una sessione studente autorizzata, `GET /api/v1/courses/GEO/learning-path` restituisce versione della lezione, prerequisiti, competenze, risorse e prossima azione. La selezione della legge per un nuovo contenuto usa solo `engine.id` e `engine.version`. Un corso può aggiungere un proprio `assessmentProfile` per fascicoli, scelte, completamenti, durata e penalità. Il test di integrazione pubblica una prova di geometria di cinque minuti, cambia il profilo e ricorregge la prima sessione al punteggio originale. [Schema delle prove](../../contracts/exam-v1.schema.json)

Il client MCP esterno può avviare il seguente comando come server stdio. La directory di lavoro deve essere quella dell’applicazione. I parametri `--allow` e `--course` sono ripetibili. Il client negozia il protocollo, elenca gli strumenti e invia invocazioni con argomenti tipizzati.

```sh
python3 -m tools.assistente_editoriale mcp --course C6 --allow search --allow read
```

Per lavorare su materiale aggiunto dall’autore, scarica **Lezioni pubblicate del corso** da **Importa ed esporta → Rivedi una proposta di aiuto didattico**. Passa il file con `--library lezioni-GEO.json --course GEO`. La ricerca collega termini, alias disciplinari e prerequisiti. Un vocabolario locale si può fornire con `--concepts`. La ricerca «rimbalzo del suono» risale alla lezione sull’eco. [Client indipendente di prova](../../tests/platform.test.js) · [Protocollo MCP](https://modelcontextprotocol.io/specification/2025-11-25)

Un operatore con un modello Ollama già installato può produrre una proposta con il comando seguente, sostituendo il nome del modello. Per un servizio compatibile Chat Completions si sceglie `--provider chat-completions`, l’URL completo HTTPS dell’endpoint e il modello supportato. La credenziale opzionale si passa solo nell’ambiente privato con `ASTRA_EDITOR_PROVIDER_TOKEN`. Il file JSON risultante può essere incollato nel pannello di revisione. Il modello riceve una richiesta solo all’esecuzione di `suggest`. [Protocollo Ollama](https://docs.ollama.com/api/chat) · [Adattatori](../../server/adapters/providers.py)

```sh
python3 -m tools.assistente_editoriale suggest --provider ollama \
  --endpoint http://127.0.0.1:11434/api/chat --model NOME_LOCALE \
  --course C6 --object C6-L01 --allow read --allow propose
```
