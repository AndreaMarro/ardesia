# Research: Supabase Realtime per Classroom Sync

Data: 2026-04-09

## Fonti
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [FreeCodeCamp: Social Learning Platform](https://www.freecodecamp.org/news/how-to-build-a-social-learning-platform-using-nextjs-stream-and-supabase/)

## Key Findings

1. **Supabase Realtime e' gia' nel nostro stack**: ELAB usa Supabase con nudgeService che ha BroadcastChannel + Realtime subscription. La base c'e'.

2. **Pattern per classroom sync**:
   - Docente pubblica su `nudges` table → Realtime trigger → studente riceve
   - Studente completa esperimento → `student_progress` update → dashboard docente si aggiorna
   - Tutto via Postgres LISTEN/NOTIFY (zero server custom)

3. **Free tier sufficiente**: Supabase free tier include Realtime con 200 concurrent connections. Una classe da 30 studenti + 1 docente = 31 connessioni. OK.

4. **ELAB ha gia' 80% dell'implementazione**:
   - supabaseSync.js: salva sessioni e progressi
   - nudgeService.js: delivery nudge con Realtime
   - teacherDataService.js: legge dati classe
   - Manca: auto-refresh dashboard quando studente completa

5. **Il pezzo mancante**: `subscribeToProgress(classId, callback)` che fa subscribe alla tabella `student_progress` per la classe. Quando uno studente completa, il dashboard del docente si aggiorna LIVE.

## Applicabilita' ELAB

ELAB e' al 80% di avere classroom sync live. Serve:
1. Subscribe a `student_progress` changes nella dashboard
2. Subscribe a `student_sessions` per vedere chi sta lavorando
3. Un indicatore "LIVE" nel dashboard

## Action Items

1. [P2] Aggiungere `subscribeToProgress` in teacherDataService.js (~20 righe)
2. [P2] Dashboard: auto-refresh quando arriva update Realtime
3. [P3] Indicatore "LIVE" quando Supabase Realtime connesso
4. [P3] Mostrare "chi sta lavorando adesso" nella dashboard
