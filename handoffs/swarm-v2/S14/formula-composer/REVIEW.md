# Review tecnica separata — 26 ottobre 2026

Revisore in contesto indipendente, read-only sul commit21f979e3; nessuna
approvazione umana e nessuna prova browser attribuita alla review statica.

Tre rilievi P2 accettati:

1. `format: latex` non seleziona l'editor math nel donor quando il cursore è in
   testo. Aggiunto `mode: math`. Test di contratto host RED→GREEN; il test è del
   parametro, non prova il comportamento del donor in tutte le modalità.
2. `readOnly` consente intenzionalmente editing nei prompt MathLive sbloccati.
   Il pending usa anche `disabled`, ripristinato nel finally. Test host RED→GREEN;
   prompt e tastiera reali ancora da provare nel browser.
3. Il toggle esterno Room può smontare il composer e azzerare il single-flight
   locale. La patchv2 mantiene il mutex nel consumer e blocca il toggle sia
   nel DOM sia tramite guard sincrona. Aggiunte prove di richiesta differita,
   toggle/doppio invio, rigetto e cambio lifecycle.

`room-insert-math.patch` v1 è **SUPERSEDED_NOT_APPLIED**. Non applicarla.
Usare `room-insert-math-v2.patch`, ancora non applicata al file sorgente in
questo checkout. La correzione cosmetica dei context blank (spazio finale)
risolve il FAIL hygiene della21f senza modificare i gate; il file originale
resta nel commit21f e il suo esito non viene riscritto.

Controprova consumer: lo script verify-room-patch.py copia Room e il test in
una directory temporanea, applica lì la patch e carica le copie tramite il
loader Vite. Il modulo conserva gli import del consumer reale; nessun file
shared è modificato. Control: nuove asserzioni + Room originale →3FAIL
(toggle abilitato e promesse risolte anziché rigettate). Candidata: Room e test
patchati →3PASS/95test non selezionati,2.03s. È una composizione locale, non
un'integrazione in main. Numeri di riga nelle trace control possono riflettere
il sorgente originale, perché il loader non genera una sourcemap nuova.

```sh
python3 handoffs/swarm-v2/S14/formula-composer/verify-room-patch.py --control --output /absolute/work/room-red.log
# expected exit1
python3 handoffs/swarm-v2/S14/formula-composer/verify-room-patch.py --output /absolute/work/room-green.log
# expected exit0
```

Il revisore ha lasciato esplicitamente non verificati: desktop/mobile,
accessibilità e focus effettivi, persistenza/round-trip, futura Room S07,
typecheck/build/CI. Queste attività restano nel piano di verifica; nessun
rilievo minore differito e nessun rilievo P2 respinto.

## Addendum 26 ottobre 2026 — v3 e prova nativa

Le istruzioni v2 sopra sono storiche: la candidata attuale è esclusivamente
`room-insert-math-v3.patch`. La v3 aggiunge chiusura del menu mobile all'apertura
di Formula; 4 RED con Room originale → 4 PASS su copie candidate. Sorgente
Room non applicata, integrazione riservata da S00 nella stessa PR dopo la 311.

Runner 12 su fonte 23604bc + Room v3 da copia ha verificato 15 comportamenti
nativi con EXIT0 e zero errori inattesi, incluso export/import in store nuovo.
La lettura visuale ha però trovato clipping del pannello a 390px: il controllo
sul solo document.scrollWidth era insufficiente. Il PASS raw rimane storico
con questo limite; nessuna certificazione visuale di mobile al checkpoint 12.
Il delta 5142865 corregge il contenimento CSS e aggiunge rettangoli di pannello,
campo e controlli. Controprova breve e review del solo delta ancora pendenti.

Follow-up review statica indipendente su 23604bc→5142865: nessun finding nel
CSS/import, controllo negativo limita la disattivazione al solo CSS nuovo.
Il revisore ha segnalato il limite delle asserzioni solo orizzontali prima
della tastiera; estese in d269cb8 a top/bottom e verifica del pannello sopra
la tastiera aperta nella sola viewport 390×844. Nessuna prova attribuita al
revisore, nessuna certificazione di ogni altezza/formula o dello shadow DOM.

La prova nativa 14 conferma bounds e hit-test del pannello con il delta 7cf3d66,
ma trova un difetto distinto nel cleanup: tastiera condivisa ancora visible
dopo unmount. Aggiunto il comando hideVirtualKeyboard prima della rimozione,
controprova nativa pendente. Nessuna review statica è usata come verde runtime.
