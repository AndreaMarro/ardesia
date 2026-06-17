# BUG TRACKER — Debug Totale Notturno (FINALE)

| ID | Sev | File:Line | Descrizione | Stato | Ciclo |
|----|-----|-----------|-------------|-------|-------|
| B01 | P0 | supabase/functions/unlim-gdpr/index.ts:36 | GDPR routing by URL path instead of body.action | FIXED | 1 |
| B02 | P0 | supabase/functions/unlim-diagnose/index.ts:74 | Diagnose 500 — no model fallback | FIXED | 1 |
| B03 | P1 | VPS 72.60.129.50:8880 | TTS Voxtral server down (503) | OPEN-INFRA | 1 |
| B04 | P1 | supabase/schema.sql | parental_consents UUID→TEXT | FIXED | 1 |
| B05 | P1 | src/components/VetrinaSimulatore.jsx:242 | "Inizia in 3 secondi" → "Accedi al Simulatore" | FIXED | 1 |
| B06 | P2 | ExperimentPicker | Close button — NOT A BUG (test artifact) | CLOSED | 6 |
| B07 | P2 | src/components/teacher/TeacherDashboard.module.css:775 | font-size 11px→13px | FIXED | 6 |
| B08 | P2 | src/components/student/StudentDashboard.module.css:52 | font-size 11px→13px | FIXED | 6 |
| B09 | P1 | Rate limit | Serverless race condition (DB counter 12/33) | OPEN-INFRA | 4 |
| B10 | P2 | src/components/lavagna/LavagnaShell.jsx:37-126 | SVG component colors — BY DESIGN (real electronics) | WONTFIX | 8 |
| B11 | P2 | src/components/lavagna/MascotPresence.jsx:21 | Face screen #0F3460 → #153d6f (darker navy) | FIXED | 8 |
| B12 | P2 | src/hooks/useSessionTracker.js:88 | console.warn → silent catch | FIXED | 8 |
| B13 | P2 | src/services/voiceCommands.js:276 | console.warn → silent catch | FIXED | 8 |

## Totale: 9 FIXED | 2 OPEN-INFRA | 1 CLOSED | 1 WONTFIX
