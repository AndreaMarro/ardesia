# Pilot Open Design per Modalita Percorso Morfica

## Decisione

Open Design non diventa il motore runtime di Percorso. Percorso resta governato da ELAB Tutor: registry canonico, volumi, Supabase, stato lezione, `percorsoMorphicAdapter`, simulator, memoria docente/classe e tool calling.

Open Design diventa invece un laboratorio di forma: genera e critica prototipi UI/UX per capire come deve apparire la regia didattica morfica prima di portare pattern selezionati nel codice React.

## Perche usarlo

Open Design e adatto per:

- prototipi rapidi di Regia docente, LIM, debug e report;
- confronto tra varianti per docente esperto, docente al primo anno, classe fragile, classe avanzata;
- applicazione coerente di `DESIGN.md`;
- critique gate su gerarchia, specificita, accessibilita e anti-pattern;
- esportazione HTML/immagini utili per review Tea/Andrea.

Open Design non e adatto per:

- fonte canonica dei volumi;
- stato runtime della lezione;
- memoria docente/classe;
- Supabase Realtime;
- tool calling operativo;
- simulator state;
- enforcement di produzione di Principio Zero.

## Pacchetto creato

1. `docs/design/open-design/ELAB-DESIGN.md`
   - Design system portable per Open Design.
   - Copiare in Open Design come `design-systems/elab/DESIGN.md`.

2. `docs/design/open-design/skills/elab-percorso-morfico/SKILL.md`
   - Skill artifact-first per generare e criticare superfici Percorso.
   - Copiare in Open Design come `skills/elab-percorso-morfico/SKILL.md`.

3. `docs/design/open-design/prototypes/percorso-morfico/index.html`
   - Prototipo statico funzionante, apribile via browser o server locale.
   - Contiene tre varianti morfiche reali sullo stesso esperimento: docente esperto/verifica, docente primo anno/costruzione, report finale.
   - Verificato da `tests/e2e/09-open-design-percorso-prototype.spec.js`.

## Prompt pilota consigliato

```text
Usa la skill elab-percorso-morfico e il design system ELAB.

Genera un prototipo HTML statico per lo stesso esperimento in tre varianti:
1. docente esperto, classe avanzata, fase verifica, LIM 4K;
2. docente al primo anno, classe fragile 10-11 anni, fase costruzione, LIM 1080p;
3. report finale per la classe, tablet docente.

Stato canonico:
- volume: 1
- capitolo: LED
- esperimento: Accendi il rosso del RGB
- pagina: 36
- prossimo esperimento: LED con pulsante
- kit: ELAB fisico, Omaric base
- errore ricorrente: polarita LED

Vincoli:
- studenti non chattano con UNLIM;
- docente guida;
- testo classe inizia con "Ragazzi,";
- mostra "Vol.1 pag.36";
- non mostrare raw ID esperimento;
- evidenzia kit fisico e controllo polarita;
- niente estetica chatbot, niente gradienti AI, niente card annidate.
```

## Criteri di accettazione del prototipo

- Il docente capisce il prossimo intervento in meno di 5 secondi.
- La LIM non mostra backstage, comandi privati o copy imperativo al docente.
- Il kit fisico ELAB e visibile o nominato nella prima schermata.
- Ogni variante mantiene lo stesso percorso canonico.
- La differenza tra varianti e morfica: densita, lessico, micro-step, componenti, layout, enfasi.
- Non compaiono raw ID come `v1-cap7-esp1`.
- Non compaiono "Docente, leggi", "Insegnante, leggi", "Ora fai", "Ora di'", "Ora distribuisci".

## Validazione automatica

Il prototipo ha un E2E dedicato:

```bash
npx playwright test --config tests/e2e/playwright.config.js tests/e2e/09-open-design-percorso-prototype.spec.js --workers=1
```

Il test verifica:

- rendering non vuoto e titolo pagina;
- `Ragazzi,`, `kit fisico ELAB`, `Vol.1 pag.36`;
- assenza di raw ID nella vista LIM;
- separazione tra vista pubblica LIM e regia privata;
- cambio reale tra varianti `Docente esperto`, `Primo anno`, `Report`;
- viewport tablet docente senza collasso layout.

## Come riportare pattern nel codice

Quando un prototipo e convincente:

1. Annotare il pattern in `docs/audits/` o nel piano dell'iter corrente.
2. Tradurlo in piccoli cambi React/CSS entro scope.
3. Collegarlo a dati reali: `volume-references`, `lesson-paths`, `percorsoMorphicAdapter`, Supabase se necessario.
4. Aggiungere test: unit per copy/invarianti, E2E per differenza morfica reale.
5. Verificare Principio Zero: `Ragazzi,`, kit fisico ELAB, `Vol.N pag.M`, zero raw ID classe.

## Prossimo atom consigliato

Generare il primo prototipo Open Design fuori dal repo runtime, poi scegliere uno solo tra:

- Regia docente compatta per fase costruzione;
- LIM read-only per fase verifica;
- Report finale con errore ricorrente e prossimo esperimento.

Solo dopo review umana, portare il pattern selezionato dentro `PercorsoCapitoloView` o nella futura dual-view Regia/LIM.

## Riferimenti esterni

- Open Design repo: https://github.com/nexu-io/open-design
- Open Design site: https://opendesigner.io/
