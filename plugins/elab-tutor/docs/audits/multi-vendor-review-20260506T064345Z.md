# Multi-Vendor Review — 20260506T064345Z

**Target**: Diff: e9f3f37..HEAD -- src/services/wakeWord.js src/components/simulator/canvas/DrawingOverlay.jsx
**Vendors**: kimi,mistral

## Anti-bias mandate
- 2+ vendor disagreement = flag for Andrea ratify
- Score >7 require Opus indipendente review (G45 mandate)
- NO compiacenza — output technical fragments

## Kimi K2.6 (Moonshot)

L'utente richiede una review brutale, tecnica, senza compiacenza, di un diff specifico. Il target è un'app educativa React per bambini 8-14 (ELAB Tutor), con principio zero docente plurale, kit fisico Omaric.

 Devo rispondere in 5 sezioni:
 1. RISCHI (top 3 edge case ignorati)
 2. SECURITY (input validation, XSS, GDPR, prompt injection)
 3. ANTI-PATTERN (technical debt + smell)
 4. SCORE 0-10 onesto Sprint V iter 1 (G45 cap 7.0 senza external review)
 5. TOP 3 FIX iter 2 + effort S/M/L

 Il diff riguarda due file:
 - `src/components/simulator/canvas/DrawingOverlay.jsx`: fix parziale per gestione conflitti local/remote su paths di disegno. Cambia logica skip remote overwrite.
 - `src/services/wakeWord.js`: dispatch evento custom quando SpeechRecognition non supportato (Safari/Firefox).

 Analisi del codice:

 **DrawingOverlay.jsx**
 - Contesto: sincronizzazione paths disegno tra locale e remoto (probabilmente Supabase/DB).
 - Prima: skip remote se `remoteIsEmpty && localHasPaths && !remoteIsNewer`.
 - Dopo: skip remote se `remoteIsEmpty && localHasPaths` (incondizionato). E skip anche se `!remoteIsEmpty && localHasPaths && !remoteIsNewer`.
 - Problema: il commento ammette "perdita solo se utente cancella esplicitamente da altro device (edge case non primario classe LIM)". Questo è data loss accettata per semplicità.
 - Edge cases ignorati:
   - `localHasPaths` è calcolato come `localPaths.length > 0`. Se l'utente ha cancellato tutto localmente (paths vuoto) ma remote ha dati, `localHasPaths` è false → remote sovrascrive locale (potrebbe essere ok, ma se l'utente vuole cancellare?).
   - Non c'è gestione di "deleted paths" esplicita: se l'utente cancella localmente, `paths` diventa `[]`, `lastLocalSaveAtRef.current` potrebbe essere aggiornato? Se sì, `localTs` > 0, `remoteIsEmpty` true, `localHasPaths` false → non skip? remote empty sovrascrive locale empty. OK. Ma se remote non è empty e locale è empty? `!remoteIsEmpty && localHasPaths` è false, quindi setPaths(remote.paths). Sembra corretto.
   - Ma: se ci sono multiple tab aperte, il localStorage/sessionStorage? No, sembra usare Supabase realtime o polling. `remoteTs > localTs` confronta timestamp. Se il clock è skewed? Non c'è vector clock o CRDT.
   - Race condition: se l'utente sta disegnando (local paths cresce) e arriva un update remoto vecchio, `remoteIsEmpty && localHasPaths` blocca. Ma se `!remoteIsEmpty`, `remoteIsNewer` è false, blocca. Sembra ok.
   - Però: se `localHasPaths` è true, e remote è empty, si skippa incondizionatamente. Questo significa che se l'utente su device A cancella tutto (remote diventa empty con ts alto), su device B che ha già paths locali, lo stato rimane non-empty per sempre (fino a refresh?). Il commento lo ammette.
   - Non c'è cleanup del listener `drawing-sync`? Non vediamo il diff completo, ma il fix è nel callback.
   - `lastLocalSaveAtRef.current` inizializzato a 0. Se l'utente non ha mai salvato, localTs=0. Remote empty con ts=0? Allora remoteIsEmpty=true, localHasPaths=true (se ci sono paths), skip. OK.
   - Se localPaths è popolato da load iniziale? `localHasPaths` è true. Remote empty → skip. Ma se il load iniziale è da remote? Forse no.

 **wakeWord.js**
 - Dispatch evento custom `elab-wake-word-error` su window se non supportato.
 - Messaggio hardcoded in italiano: `"Ragazzi, su Safari/Firefox la voce \"Ehi UNLIM\" non funziona, usate Chrome o Edge."`
 - Problema: messaggio user-facing in service layer. Violazione separazione concern. Service deve restituire errore, UI deve decidere il testo.
 - Problema: `window` access senza check robusto (c'è `typeof window !== 'undefined'` ma in React potrebbe essere SSR).
 - Problema: il listener è a `window`, evento globale. Qualsiasi componente può intercettarlo. Non è un pattern React ideale (usare context o callback).
 - Problema: `onWake`/`onCommand` callback non validati.
 - Problema: message hardcoded potenziale XSS? No, è stringa literal. Ma se in futuro interpolazione?
 - GDPR: messaggio raccoglie implicitamente info sul browser? No, ma logging?

 Ora costruisco le 5 sezioni in stile "caveman" (frammenti tecnici concetti, brutali).

 1. RISCHI (top 3 edge case ignorati)
    - Data loss silenzioso cross-device: se utente cancella da device A (remote empty + ts alto), device B con `localHasPaths` true ignora per sempre. Stale divergence senza reconciliation.
    - Multi-tab same-device race: due tab Chrome, entrambe scrivono. `lastLocalSaveAtRef` è per tab, non shared. Remote empty skip incondizionato blocca propagate delete. Ghost state permanente.
    - SSR/hydration mismatch su `window` event: wakeWord.js tocca `window` in top-level function. Se importato in SSR (Next.js/Gatsby), `typeof window` check salva ma l'event dispatch è side-effect in funzione, non al top level. Tuttavia, se chiamato during render? Il check è dentro la funzione, quindi ok. Ma se il componente chiama `startWakeWordListener` in `useEffect` senza check supporto prima? L'evento viene dispatch, ma se il listener non è montato ancora? Race UI.

 2. SECURITY
    - XSS via CustomEvent `detail`: sebbene ora literal, il pattern `window.dispatchEvent

## Mistral Large

### 1. RISCHI (top 3 edge case ignorati)
- **Race condition su `lastLocalSaveAtRef.current`**: Se `remoteTs` arriva *prima* che `localTs` sia aggiornato (es. dopo `setPaths`), il confronto `remoteIsNewer` è inaffidabile. **Ignorato**.
- **Stale `localHasPaths`**: Se `localHasPaths` è calcolato su uno stato non sincronizzato con `lastLocalSaveAtRef`, il check `remoteIsEmpty && localHasPaths` può dare falsi positivi. **Ignorato**.
- **Concorrenza device multipli**: Se un device cancella esplicitamente (es. LIM) mentre un altro disegna, il fix incondizionato sovrascrive la cancellazione remota. **Edge case accettato ma non documentato come trade-off**.

---

### 2. SECURITY
- **XSS in `wakeWord.js`**: `message` iniettato in `CustomEvent` viene renderizzato in UI (LavagnaShell) senza sanitization. **Vulnerabilità se `message` arriva da fonte non controllata** (es. futuro refactor con API esterne).
- **GDPR**: `lang = 'it-IT'` hardcoded ignora preferenze utente (violazione art. 22 GDPR su profilazione implicita). **Rischio legale**.
- **Prompt injection**: Nessuna mitigazione per `onCommand` (es. comandi vocali iniettati via audio sintetizzato). **Debolezza se `onCommand` esegue azioni sensibili**.

---

### 3. ANTI-PATTERN
- **Magic strings**: `'elab-wake-word-error'` e `'unsupported'` duplicati in LavagnaShell. **Debt: coupling implicito**.
- **Empty catch**: `catch (_) { /* ignore */ }` in `wakeWord.js` nasconde errori di `dispatchEvent` (es. `window` non disponibile in SSR). **Smell: silent failure**.
- **Logica di sincronizzazione sparpagliata**: Condizioni di `DrawingOverlay` sono un *spaghetti* di flag booleani (`remoteIsEmpty`, `localHasPaths`, `remoteIsNewer`). **Debt: complessità ciclomatica alta**.

---

### 4. SCORE 0-10 (Sprint V iter 1)
**5.5/10**
- **✅ Fix parziale**: Risolve il wipe locale per `remoteIsEmpty` (A2.1) e feedback docente (A1.1).
- **❌ Debt tecnico**: Edge case ignorati, XSS, GDPR, e anti-pattern pesano. **Manca external review → cap a 7.0 non raggiunto**.

---

### 5. TOP 3 FIX iter 2 + effort
1. **Sanitize `CustomEvent` + test XSS**
   - Usa `DOMPurify.sanitize()` su `message` prima di `dispatchEvent`.
   - **Effort: S** (1h).

2. **Refactor condizioni `DrawingOverlay`**
   - Estrai logica in funzione pura `shouldOverwriteLocal(remote, local)` con commenti per edge case.
   - **Effort: M** (3h).

3. **GDPR compliance**
   - Aggiungi `lang` come prop configurabile con fallback a `navigator.language`.
   - **Effort: S** (1h).

## Note Claude Opus 4.7 (orchestrator + 4th vendor)

_Claude Opus 4.7 review attached separately by orchestrator._

## Disagreement detection

TODO orchestrator: parse score 0-10 per vendor, flag >2.0 spread.

