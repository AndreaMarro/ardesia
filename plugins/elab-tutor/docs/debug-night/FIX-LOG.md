# FIX LOG — Debug Totale Notturno (FINALE)

| Ciclo | File | Prima | Dopo | Test |
|-------|------|-------|------|------|
| 1 | supabase/functions/unlim-gdpr/index.ts | URL path routing → 404 | body.action → 200 | 1075 |
| 1 | supabase/functions/unlim-gdpr/index.ts | No status action | + status, consent, delete, export | 1075 |
| 1 | supabase/functions/unlim-gdpr/index.ts | .catch() silente | try-catch esplicito audit log | 1075 |
| 1 | supabase/functions/unlim-diagnose/index.ts | Solo Flash → 500 | Flash→Flash-Lite→Brain → 200 | 1075 |
| 1 | supabase/functions/unlim-tts/index.ts | No fallback info | fallback:'browser' | 1075 |
| 1 | src/components/VetrinaSimulatore.jsx | "Inizia in 3 secondi" | "Accedi al Simulatore" | 1075 |
| 1 | src/components/VetrinaSimulatore.jsx | "ANTEPRIMA" | "IL SIMULATORE" | 1075 |
| 1 | src/components/unlim/UnlimWrapper.jsx | TTS muted sempre | ON in Lavagna, OFF altrove | 1075 |
| 1 | Supabase DB | parental_consents UUID | TEXT columns | - |
| 1 | Supabase DB | rate_limits missing | Creata + RPC | - |
| 1 | Supabase DB | gdpr_audit_log missing | Creata con uuid-ossp | - |
| 5 | e2e/*.spec.js | Test non aggiornati | 20/20 PASS | 1075+20 |
| 6 | TeacherDashboard.module.css | font-size: 11px | 13px | 1075 |
| 6 | StudentDashboard.module.css | font-size: 11px | 13px | 1075 |
| 8 | MascotPresence.jsx | #0F3460 | #153d6f (darker navy) | 1075 |
| 8 | useSessionTracker.js | console.warn prod | silent catch | 1075 |
| 8 | voiceCommands.js | console.warn prod | silent catch | 1075 |
