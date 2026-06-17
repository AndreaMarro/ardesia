# review-autoload

`bin/review.sh` carica automaticamente le skill di questa cartella nel prompt del
reviewer. Documenta il meccanismo che chiude il loop "crea skill → non viene applicata".

## When-to-apply

- Sempre: ogni `./bin/review.sh` inietta `cat skills/*.md` nel prompt PRIMA di costruire
  la richiesta di review. Non serve più caricare manualmente le skill.
- Quando si aggiunge una nuova skill: basta creare `skills/<nome>.md` — sarà attiva alla
  review successiva senza modificare `review.sh`.

## Checklist/Procedura

- [ ] Ogni nuova skill sta in `skills/<nome>.md` col formato a 4 sezioni (Titolo, When-to-apply, Checklist/Procedura, Origine-RETRO).
- [ ] Non duplicare le checklist nel prompt inline di `review.sh`: la fonte unica sono i file in `skills/`.
- [ ] Dopo aver creato/modificato una skill, esegui `./bin/review.sh` su un diff per confermare che la sezione SKILLS compaia nel prompt.
- [ ] Esegui `bin/check-frictions.sh` ad ogni RETRO per verificare che gli attriti ricorrenti abbiano una skill/guard.

## Origine-RETRO

- RETRO #6.1 e RETRO #7.2: la skill `lessonos-grounding-check` esisteva ma NON veniva caricata automaticamente prima della review → la review trovava 4-5 fix veri ogni volta. Il loop era aperto (crea → non carica → ricorre). Auto-load in `review.sh` lo chiude.
