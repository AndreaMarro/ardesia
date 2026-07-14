---
id: ardesia-ui-quality-plan
status: proposed
freshness: 2026-07-14T23:28:39+02:00
baseline_sha: a7167657ba027e957731775895911d2428036071
authority: design-contract
---

# Ardesia — piano Storybook, accessibilità e Chromatic

Storybook e Chromatic non sono installati al baseline. La loro adozione serve a
rendere verificabili gli stati iPad-first, non a creare una seconda applicazione
o una galleria scollegata dal prodotto.

## Confine

- Storybook importa componenti pubblici e adapter di test, mai provider reali.
- Fixture solo test, deterministiche, sintetiche e de-identificate.
- Nessuna fixture viene distribuita come demo o spacciata per dato reale.
- Nessun audio, transcript, prompt, board reale o screenshot di lezione esce.
- I componenti restano nel prodotto; le stories non duplicano logica dominio.
- La tavola visuale fornita da Andrea è una direzione UX, non un contratto
  eseguibile: le invarianti derivano da ADR, test e golden path.

## Inventario minimo delle stories

| Stato | Varianti obbligatorie |
|---|---|
| scope selector | studente globale, studente+percorso, gruppo, manifest mix |
| consenso audio | off, opt-in, recording visibile, revoca |
| durability | persisted, saving, degraded, emergency export |
| continuità | offline, open loop, evidence missing, evidence withdrawn |
| evidence chip | observed, deterministic, model proposal, teacher attested |
| proposal review | citations, diff, accept/edit/reject, expired, invalid evidence |
| artifact actions | attest, save, publish e apply distinti |
| recovery | reload, restore, clone, invalid bundle |
| provider state | queued, timeout, refusal, unavailable, capture-only |
| iPad layout | portrait, landscape, touch target e software keyboard |

Le stories non simulano “successo pedagogico”. Visualizzano stati contrattuali
e fallimenti reali del sistema.

## Test a strati

1. Render deterministico e smoke di ogni story.
2. Interaction test per tastiera, focus, touch e transizioni consentite.
3. `@storybook/addon-a11y` configurato con `parameters.a11y.test = "error"` in
   CI: una violazione automatica blocca la slice.
4. Chromatic su componenti delimitati; evitare snapshot dell'intera lavagna
   Excalidraw, instabile e poco diagnostica.
5. Revisione manuale VoiceOver su iPad reale: axe non sostituisce screen reader,
   zoom, contrasto percepito e uso durante la lezione.

## Scomposizione entro il ratchet dei cinque file

**PR UI-Q1 — dependency/config**, dopo approvazione esplicita:

- `apps/studio/package.json` e lockfile;
- `.storybook/main.ts`;
- `.storybook/preview.ts`;
- un test di avvio/configurazione se necessario.

**PR UI-Q2+ — stories**: massimo cinque file totali per slice, una sola famiglia
di stato. Il numero di stories nello stesso file non estende mai il limite. Se
un componente non è isolabile, si apre prima una slice di refactor del suo
boundary; non si mescolano refactor e baseline visuale.

**PR UI-Q3 — Chromatic**, soltanto quando Storybook locale e CI sono stabili:

- dipendenza/CLI e script pinning;
- job root con `workingDir: apps/studio`;
- project token in GitHub Actions secrets;
- branch/head strategy coerente e history sufficiente;
- receipt con SHA e URL del build, senza dati di lezione.

Chromatic parte `advisory`. Diventa required solo quando Andrea approva la
baseline, i rerun sono deterministici e il team ha una procedura per accettare
o respingere i diff. Un writer non auto-approva il proprio cambiamento visuale.

Prima del primo upload il progetto Chromatic deve essere privato, con accessi
least-privilege e DPA/residenza/retention verificati. La CI ispeziona il bundle
statico che verrà caricato e fallisce per fixture, asset o stringhe non
allowlisted. Export e cancellazione di build/progetto vengono provati con soli
dati sintetici. Il token è ruotabile e il suo owner è registrato; nessun link
pubblico non autenticato può esporre lo Storybook.

## Criteri di accettazione

- nessuna dipendenza prima del gate umano;
- Storybook build riproducibile dallo stesso lockfile di Studio;
- zero fixture con PII o contenuto didattico reale;
- zero violazioni axe nei casi coperti;
- tutte le azioni autoritative restano visivamente distinte;
- layout usabile a 1024×768, portrait iPad supportato dove previsto e target
  touch conformi alla decisione UX corrente;
- diff Chromatic legato all'esatto commit SHA;
- progetto privato, retention e cancellazione verificate;
- test su iPad reale ricevuto separatamente prima di `ENGINEERING_READY`.

## Debito deliberatamente non introdotto

Non vengono adottati ora addon community, librerie di design aggiuntive,
component explorer alternativi o plugin Obsidian per orchestrare Storybook.
Ogni nuova dipendenza deve risolvere un gap misurato e avere owner, licenza,
policy di aggiornamento e rimozione.
