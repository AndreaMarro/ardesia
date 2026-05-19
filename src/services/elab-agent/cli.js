#!/usr/bin/env node
/**
 * src/services/elab-agent/cli.js
 *
 * Iter 69 A2 — Executable entry point for the ELAB Compile/Upload Agent.
 *
 * Usage:
 *   $ node src/services/elab-agent/cli.js
 *   $ ELAB_AGENT_PORT=8765 node src/services/elab-agent/cli.js
 *
 * On install (iter 70+ packaged distribution):
 *   The package.json `bin` field points here; macOS launcher script
 *   `scripts/setup-elab-compile-agent.sh` (iter 65) wires this into
 *   a launchd plist for boot-time start.
 *
 * Behavior:
 *   - Boots Express HTTP server (see http-server.js)
 *   - Logs ready URL to stdout (consumed by setup script + Activity Monitor)
 *   - Handles SIGINT / SIGTERM gracefully (closes sockets within 5s)
 *   - Exits non-zero on listen() error so launchd / systemd can restart
 *
 * Iter 69 honesty caveats:
 *   - Requires `express` installed (Andrea ratify iter 70)
 *   - Cross-platform launcher (Win / Linux) NOT in this iter
 *   - arduino-cli presence checked lazily on first /compile call —
 *     /health surfaces arduino_cli_absent so the banner (R5 iter 66)
 *     can prompt the docente to install
 *
 * @copyright © Andrea Marro — 2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { createHttpServer, DEFAULT_AGENT_PORT } from './http-server.js';

const SHUTDOWN_TIMEOUT_MS = 5_000;

async function main() {
  const port = Number(process.env.ELAB_AGENT_PORT || DEFAULT_AGENT_PORT);

  let instance;
  try {
    instance = await createHttpServer({ port });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[elab-agent] failed to start on port ${port}: ${err.message}`);
    process.exit(1);
    return; // unreachable but satisfies static analysers
  }

  // eslint-disable-next-line no-console
  console.log(`[elab-agent] listening http://${instance.host}:${instance.port}`);
  // eslint-disable-next-line no-console
  console.log(`[elab-agent] endpoints: GET /health, GET /boards, POST /compile, POST /upload, POST /compile-and-upload, GET /jobs/:id/status`);

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    // eslint-disable-next-line no-console
    console.log(`[elab-agent] received ${signal}, draining connections...`);
    const timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn(`[elab-agent] shutdown timeout after ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    instance.stop().then(() => {
      clearTimeout(timer);
      // eslint-disable-next-line no-console
      console.log('[elab-agent] stopped cleanly');
      process.exit(0);
    }).catch((err) => {
      clearTimeout(timer);
      // eslint-disable-next-line no-console
      console.error(`[elab-agent] error during shutdown: ${err.message}`);
      process.exit(1);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Only run main() if this file was invoked directly (not imported).
// Use a robust check that works under both ESM file:// URLs and bare paths.
const invokedDirectly = (() => {
  try {
    const arg = process.argv[1] || '';
    return import.meta.url.endsWith(arg) || import.meta.url.endsWith('/cli.js');
  } catch {
    return false;
  }
})();

if (invokedDirectly) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[elab-agent] fatal:', err);
    process.exit(1);
  });
}

export { main };
