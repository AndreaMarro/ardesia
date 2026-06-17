# G16 FASE 2 — Contesto Classe

**Data**: 28/03/2026
**Build**: PASSA (45s)

## Cosa è stato fatto

### classProfile.js (NUOVO — ~165 LOC)
Servizio che legge TUTTE le sessioni salvate e costruisce il profilo classe.

#### `buildClassProfile()` → oggetto con:
- `lastExperimentId`, `lastExperimentTitle`, `lastSessionDate`
- `experimentsCompleted` — lista univoca di tutti gli esperimenti fatti
- `conceptsLearned` — aggregato da `session_save.concepts_covered` di ogni lesson path
- `commonErrors` — top 5 errori frequenti con conteggio
- `nextSuggested`, `nextSuggestedTitle` — dal campo `session_save.next_suggested`
- `resumeMessage` — dal campo `session_save.resume_message`
- `isFirstTime` — true se nessuna sessione salvata

#### `buildClassContext()` → stringa per system prompt AI
```
[CONTESTO CLASSE]
Sessioni totali: 5
Ultimo esperimento: Accendi il tuo primo LED (v1-cap6-esp1)
Esperimenti fatti: v1-cap6-esp1, v1-cap6-esp2, v1-cap6-esp3
Concetti appresi: circuito_chiuso, LED_polarita, breadboard_base
Errori frequenti classe: polarita(x3), cortocircuito(x1)
Prossimo suggerito: LED senza resistore (v1-cap6-esp2)
```

#### `getWelcomeMessage()` → messaggio contestuale
- **Prima volta**: "Ciao! È la prima volta? Iniziamo dal primo esperimento: accendiamo un LED!"
- **Ritorno**: usa `session_save.resume_message` del lesson path ("L'ultima volta avete acceso il vostro primo LED! Oggi scopriamo cosa succede senza il resistore...")
- **Fallback**: "Bentornati! L'ultima volta avete fatto '[titolo]'. Pronti per continuare?"

#### `getNextLessonSuggestion()` → suggerimento prossima lezione
- **Prima volta**: suggerisce v1-cap6-esp1
- **Ritorno**: usa `session_save.next_suggested` dell'ultimo esperimento

### Integrazione in UnlimWrapper.jsx
- `buildClassContext()` iniettato nell'`experimentContext` di ogni chiamata a Galileo
- `getWelcomeMessage()` usato per il messaggio di benvenuto quando UNLIM apre senza esperimento
- `getNextLessonSuggestion()` mostrato 4s dopo il benvenuto

## Verifiche
| Check | Risultato |
|-------|-----------|
| Build exit 0 | ✅ |
| classProfile.js creato | ✅ |
| buildClassContext iniettato in handleSend | ✅ |
| Welcome contestuale (prima volta) | ✅ |
| Welcome contestuale (ritorno) | ✅ |
| Resume message dal lesson path | ✅ |
| Contesto classe nel system prompt | ✅ |
