# Tool Configuration — ELAB Automa

## Modelli e API

| Tool | Modello | API Key / Endpoint | Ruolo |
|------|---------|-------------------|-------|
| Claude Code | Opus 4.6 | ANTHROPIC_API_KEY (abbonamento) | Lavora: codice, fix, test, deploy, debug |
| DeepSeek | deepseek-reasoner (R1) | DEEPSEEK_API_KEY (in .env) | Ragionamento judge/scoring |
| Gemini | gemini-2.5-pro / gemini-3-deepthink | GEMINI_API_KEY (in .env) | Vision, ricerca, thinking |
| Kimi | K2.5 | KIMI_API_KEY (in .env) | Review, vision, agent swarm |
| Brain V13 | Qwen3.5-2B fine-tuned | BRAIN_URL (in .env) | Routing proprietario |

## API Endpoints
- DeepSeek: https://api.deepseek.com/v1/chat/completions
- Gemini: https://generativelanguage.googleapis.com/v1beta/models/
- Kimi: https://api.moonshot.cn/v1/chat/completions
- Brain: http://72.60.129.50:11434/api/chat (model: galileo-brain-v13)

## Budget
- Totale: €50/mese
- Claude Code: abbonamento (già pagato, fuori budget)
- DeepSeek R1: ~€15/mese (scoring + classi simulate)
- Gemini 2.5 Pro: €0 (free tier)
- Kimi K2.5: ~€5/mese (review on-demand)
- Brain VPS: €4/mese
- AutoResearchClaw: ~€10/mese (2 deep research)
- Buffer: ~€16/mese

## Tool headless affidabili (per il loop)
- ✅ Claude Code: `claude -p "prompt" --bare`
- ✅ Codex CLI: `codex exec "prompt"`
- ✅ Gemini CLI: `gemini -p "prompt"` (con API key, NON OAuth)
- ✅ AutoResearchClaw: `researchclaw run --auto-approve`
- ✅ Playwright: `npx playwright test`
- ❌ OpenCode: bug hang #10411, NON usare nel loop
- ❌ claude-octopus: non testato headless

## Tool per test simulatore
- Playwright per test ripetitivi (load, play, viewport)
- Control Chrome MCP per test con ragionamento (Claude Code interattivo)
- window.__ELAB_API come interfaccia programmatica al simulatore
- BackstopJS per visual regression
- Lighthouse + axe-core per performance + accessibilità
