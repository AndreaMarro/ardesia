# PLUGIN-STATE
last-verified: 2026-06-25
verified-by: extract (PROJECT-RECON, ADR-ARDESIA-P0, ELAB-AS-PLUGIN-CANON)

- plugin-host (ToolHost / maestro-studio) MOUNTED + working (Reference Sim on lavagna, board.write; ed25519/kill-switch/CSP by design). NOT mounted in prod (demo srcDoc bypasses signing) = GATE-ANDREA.
- manifest missing kind: tool|pack|manual|workflow|copilot = gap#1.
- ELABTutor = first pack. HOST-BOUNDARY: ELAB owns components/simulator/, rest VIETATO (renderEmbeddable + lint-gate anti-reimport). elab-tutor PR #195-200 CI-red.
- marketplace = greenfield (piggyback MCP/Moodle/GitHub; build only pack-hub).

Deep: ~/ardesia-vault/ELAB-AS-PLUGIN-CANON, PLUGIN-MARKETPLACE-CANON, MARKETPLACE-PLUGIN-ARCH-v1.
