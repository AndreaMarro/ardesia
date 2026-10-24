# Review indipendente del percorso pubblico

Base Git `f456ade218acee1a8b65f5dc24e9220681658b11` più diff degli autori. Il revisore non ha scritto prodotto. Browser plugin/skill non disponibili nell'elenco della sessione: usato Playwright 1.60.0 già installato nel package, Chromium 148.0.7778.96. Nessuna dipendenza aggiunta e nessuna suite completa eseguita.

Flusso: `/esperienza/` → previsione → risultato Core → grafico/recupero → cambio vincolo → problema diverso → ripetizione/reset. URL iniziale `http://127.0.0.1:5413/esperienza/`; viewport 360×800, 390×844, 820×1180, 1440×1000. [result.json](result.json) conserva **118 controlli mirati PASS**, zero eccezioni, nessuna modifica dei sette sorgenti hashati durante il run. Non è un risultato della suite Vitest né una certificazione di tutti i browser.

| Controllo | Prova |
| --- | --- |
| Identità, contenuto, assenza overlay | Titolo Ardesia Fisica, pagina significativa e nessun Vite error overlay in tutte le larghezze |
| Previsione prima del risultato | Nessun rapporto, tracciante o grafico prima dell'invio; input vuoto o mille cifre non abilita il calcolo |
| Vincoli e trasporto | Raggio doppio: Δp fissa → Q/Q₀=16, v/v₀=4; Q fissa → Δp/Δp₀=0,0625, v/v₀=0,25. Risultati della proiezione Core, non formula donor |
| Tastiera/movimento | Skip, Home/End sul range, Invio; transform reale fermo dopo pausa e mobile reduced-motion senza animazione |
| Contesto e ripartenza | Aiuto dichiarato assistito, formula collegata, nuovo problema e reset senza risultato precedente |
| Rete | Zero errori pagina, HTTP o richieste fallite; nessuna richiesta Study e solo origine locale |
| Visuale | Nessun overflow laterale con dati ordinari e input lungo; schermate delle quattro larghezze, scena, controlli, rapporto e grafico ispezionati |

## Finding P2, corretto dall'autore

`apps/web/src/styles.css`, `.discovery-model .pipe-reference { opacity: .72 }`, attenuava anche le etichette `riferimento` e `2r₀`. Fill rgb(63,93,77), fondo rgb(255,254,250): composizione a .72 → **3,656:1**. Testo effettivo 10,52 px a 360 e 11,58 px a 390; la criticità era presente anche sul desktop. La controprova browser-only con opacity 1 portava il rapporto a 7,215:1.

L'autore ha applicato opacità soltanto a corpo/assi/dimensioni. Ricontrollo indipendente sul build aggiornato 5413: **7,215:1 a tutte e quattro le larghezze**, testo con opacity 1. RED e GREEN restano distinti: [RED sullo snapshot composto ancora precedente al fix](contrast-red-recheck.json), [GREEN sul build aggiornato](contrast-green.json). In seguito il root ha ricomposto anche 5414: il RED documenta l'istante della cattura, non uno stato attuale attribuito retroattivamente.

Il primo runner di review conteneva un locator rimasto `Guarda il grafico` dopo averlo aperto: è stato corretto in `Nascondi il grafico` prima del run completo. Era un errore del probe, non un difetto del prodotto.

## Attribuzione e limiti

[served-artifacts-and-http.json](served-artifacts-and-http.json) fissa SHA-256 degli asset HTTP osservati dopo il fix e le intestazioni. Il runner originario conserva i manifest dei sorgenti prima/dopo; i ricontrolli successivi non vengono presentati come il medesimo snapshot. I file `initial-*` del primo run mostrano il target del link skip con focus; `first-use-*` documenta invece il primo viewport senza quel gesto.

Il trasferimento C è una specifica e un'implementazione originale di controllo del vincolo/trasporto medio. Circuiti, formule elettriche, codice e asset GPL non sono stati incorporati. Nessun circuito è stato ricostruito; non è una prova di efficacia didattica, microfono fisico, distribuzione remota o autorizzazione al rilascio.

Comando del probe: `node work/deep-build/review/C-public-review.cjs` dalla root del checkout con runtime del lock. Runner conservato qui per audit; i percorsi locali di output/browser vanno adattati in un altro ambiente.

## Delta sul composto finale

Ricontrollo indipendente su `http://127.0.0.1:5414/esperienza/`: [contrasto finale](final-contrast.json) **7,215:1 su 360/390/820/1440**, opacity del testo 1. [final-delta.json](final-delta.json) conserva **8/8 PASS mirati** sul nuovo focus dopo “Un problema diverso”, condizione annunciata, risultato nascosto, voce avviata solo dall’utente, pausa da tastiera e fallback leggibile con retry dopo un errore WAV indotto esplicitamente. Il gesto di errore è separato dagli errori spontanei; non viene descritto come rete interamente riuscita.

L’URL realmente decodificato è `http://127.0.0.1:5414/esperienza/lesson-demo/poiseuille.wav`: 1.806.784 byte, SHA-256 `cba509da0fbc7892d2e2ff6f94fa8f040788ffc411cc5be99223e09e0a885508`. Questa prova attesta i byte serviti e la riproduzione nel browser; la provenienza/licenza è documentata separatamente dal root. I delta successivi non vengono sommati ai 118 come se fossero un’unica esecuzione o una suite completa. Nessun finding pubblico resta aperto nel perimetro ispezionato.
