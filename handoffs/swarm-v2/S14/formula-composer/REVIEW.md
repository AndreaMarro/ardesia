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
