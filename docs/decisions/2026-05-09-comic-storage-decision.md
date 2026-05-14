# Decision Record - Storage Fumetti

Data: 2026-05-09

## Decisione

Preferenza implementativa: Supabase Storage per asset fumetti pre-generati. Vercel Blob o storage S3-like restano fallback accettabili.

## Ragione

Supabase e' gia' il data plane del progetto: progressi, album, badge, RLS e condivisione docente vivono nello stesso ecosistema. Questo rende piu' semplice collegare `comic_assets.asset_url`, `student_album.comic_asset_url` e `student_progress.comic_asset_url` con URL stabile per studente/esperimento.

## Regole operative

- Generazione: pipeline admin/editoriale con Leonardo AI.
- Input generazione: screenshot sessione, contesto sessione, cronologia messaggi, memoria UNLIM e materiale Tea.
- Runtime lezione: solo lettura asset + metadata.
- Niente rigenerazione on-demand al completamento esperimento.
- Rigenerazione ammessa solo in modalita admin/editoriale.

## Schema metadata minimo

```json
{
  "experiment_id": "v3-cap6-semaforo",
  "narrative_map_id": "v3-cap6-semaforo",
  "storage_provider": "supabase-storage",
  "generation_provider": "leonardo-ai",
  "asset_url": "https://...",
  "runtime_policy": "read-pre-generated-asset-only",
  "panel_limit": 6,
  "session_sources": {
    "screenshot": true,
    "context": "...",
    "messages_count": 12,
    "unlim_memory": true,
    "tea_material": true
  }
}
```

