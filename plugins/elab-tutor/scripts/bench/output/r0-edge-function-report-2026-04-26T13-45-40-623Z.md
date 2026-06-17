# R0 Edge Function Baseline FAILURE — 2026-04-26T13-45-40-623Z

Zero successful responses against https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat.

## Failures (5)
- r0-001: HTTP 401: {"success":false,"error":"unauthorized","reason":"missing X-Elab-Api-Key header"}
- r0-002: HTTP 401: {"success":false,"error":"unauthorized","reason":"missing X-Elab-Api-Key header"}
- r0-003: HTTP 401: {"success":false,"error":"unauthorized","reason":"missing X-Elab-Api-Key header"}
- r0-004: HTTP 401: {"success":false,"error":"unauthorized","reason":"missing X-Elab-Api-Key header"}
- r0-005: HTTP 401: {"success":false,"error":"unauthorized","reason":"missing X-Elab-Api-Key header"}

## Diagnosis
- Edge Function may be cold-stuck, undeployed, or rejecting auth
- Manual retry: `curl -X POST https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat -H 'apikey: $SUPABASE_ANON_KEY' -H 'Authorization: Bearer $SUPABASE_ANON_KEY' -H 'Content-Type: application/json' -d '{"message":"ping","sessionId":"test"}'`
- Check deploy: `SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions list --project-ref euqpdueopmlllqjmqnyb`

## Note
Sprint S iter 3 R0 re-run NOT MEASURED. Document failure mode, do NOT fake numbers.
