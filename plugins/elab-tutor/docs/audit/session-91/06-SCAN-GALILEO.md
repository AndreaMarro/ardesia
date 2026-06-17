# 06 — Galileo AI Chat Scan
**Data**: 2026-03-08 | **Stato**: DONE | **Bug Count**: 2

## Bugs Found

| # | Sev | Area | Descrizione | Repro | Expected | Actual | Screenshot |
|---|-----|------|-------------|-------|----------|--------|------------|
| G1 | P1 | Chat/Backend | Galileo chat does NOT respond to user messages — zero HTTP requests sent | Open chat (Ctrl+K), type "ciao galileo", press Enter | Message sent to nanobot, loading indicator, AI response | User message appears briefly then disappears. No loading indicator, no error, no network request to chat/nanobot endpoint | ss_8761wwwo6 |
| G2 | P2 | Chat/UX | User messages vanish from chat history after a few seconds | Send any message in Galileo chat | Message persists in chat history | Message disappears within ~10-15 seconds, chat resets to initial state with quick action buttons | ss_84683p1ut |

## Working Features

| Feature | Status | Notes |
|---------|--------|-------|
| GALILEO toolbar button (experiment explanation) | ✅ WORKS | Contextual explanation of Cap. 7 Esp. 2 "Pulsante accende LED" — correctly described pin 6 INPUT_PULLUP, setup/loop, code structure | ss_9794miwgd |
| Chat panel open/close (Ctrl+K) | ✅ WORKS | Opens smoothly with "Galileo • Sono qui" status |
| Quick action buttons | ✅ VISIBLE | "Apri Manuale Vol1", "Apri Simulatore Base", "Checklist Lezione", "Altro (13)" — not tested (clicking would navigate away) |
| Camera/screenshot button | ✅ VISIBLE | Camera icon present next to input |
| Modalità Guida toggle | ✅ VISIBLE | OFF by default |
| AI disclaimer | ✅ PRESENT | "Le risposte di Galileo sono generate dall'AI e potrebbero non essere accurate." |
| Action tag execution | ✅ WORKS | "switcheditor:scratch" action was executed (shown with ✅ checkmark in chat) |

## Root Cause Hypothesis — G1

The chat input `handleSend()` in `ElabTutorV4.jsx` sends messages to the nanobot `/chat` endpoint. The fact that ZERO network requests are made when typing and pressing Enter suggests:

1. **Most likely**: The `handleSend()` function is not being called — the Enter key handler or send button click handler may be broken, OR
2. The fetch URL is malformed (similar to S62 `.trim()` bug), causing the request to fail silently before even being sent, OR
3. The chat component state prevents sending when the panel is in its "initial" state (showing quick action buttons instead of chat mode)

**Note**: The "GALILEO SPIEGA L'ESPERIMENTO" modal (toolbar button) uses a DIFFERENT code path — likely `handleGalileoExplain()` which calls a different endpoint and works correctly.

## Galileo Auto-Open Pattern (Cross-reference with 03-SCAN-SIMULATOR.md)

The Galileo chat/panel auto-opens on multiple triggers (documented as S3/S4/S8 in simulator scan):
1. Closing experiment info panel
2. Switching build modes (Già Montato/Passo Passo/Libero)
3. Switching editor tabs (Blocchi ↔ Arduino C++)
4. Clicking Compila & Carica
5. First load of some experiments

**Root cause**: Right-side panel state machine defaults to Galileo when no other panel is active.
