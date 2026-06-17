import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// --- Configuration ---
const NANOBOT_URL = process.env.GALILEO_URL || 'https://elab-galileo.onrender.com';

// Rate limiting: nanobot enforces 3 requests per 10 seconds
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 3;
let requestTimestamps = [];

async function waitForRateLimit() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < RATE_WINDOW_MS);
  if (requestTimestamps.length >= RATE_MAX) {
    const oldest = requestTimestamps[0];
    const waitMs = RATE_WINDOW_MS - (now - oldest) + 100; // +100ms buffer
    await new Promise(r => setTimeout(r, waitMs));
    requestTimestamps = requestTimestamps.filter(t => Date.now() - t < RATE_WINDOW_MS);
  }
  requestTimestamps.push(Date.now());
}

async function nanobotFetch(path, body = null, method = 'GET') {
  await waitForRateLimit();
  const start = Date.now();
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${NANOBOT_URL}${path}`, opts);
  const latency = Date.now() - start;

  if (!res.ok) {
    const text = await res.text().catch(() => 'no body');
    throw new Error(`Nanobot ${method} ${path} returned ${res.status}: ${text}`);
  }
  const data = await res.json();
  return { ...data, _latency: latency };
}

// Extract [AZIONE:cmd:args] tags from response text
function extractActions(text) {
  const regex = /\[AZIONE:(\w+)(?::([^\]]*))?\]/g;
  const actions = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    actions.push({ type: match[1], args: match[2] || null });
  }
  return actions;
}

// Evaluate test result: PASS / PARTIAL / FAIL
function evaluateResult(response, actions, question) {
  if (!response || response.length < 10) return 'FAIL';

  // Check for filter blocks
  const filterPatterns = [
    /non posso/i, /non sono in grado/i, /non rispondo/i,
    /filtro di sicurezza/i, /bloccato/i
  ];
  if (filterPatterns.some(p => p.test(response))) return 'FAIL';

  // If question expects an action verb, check if action tags were generated
  const actionVerbs = /\b(avvia|carica|apri|evidenzia|pausa|reset|pulisci|compila|aggiungi|rimuovi|sposta|premi|quiz|cerca video|imposta codice)\b/i;
  if (actionVerbs.test(question) && actions.length === 0) return 'PARTIAL';

  return 'PASS';
}

// --- MCP Server ---
const server = new McpServer({
  name: 'galileo-mcp',
  version: '1.0.0',
  description: 'MCP server for testing Galileo AI tutor (ELAB Tutor platform)',
});

// Tool 1: Health check
server.tool(
  'galileo_health',
  'Check nanobot server health, version, and available AI providers',
  {},
  async () => {
    try {
      const data = await nanobotFetch('/health');
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    } catch (e) {
      return {
        content: [{ type: 'text', text: `Health check failed: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool 2: Send message to Galileo
server.tool(
  'galileo_chat',
  'Send a message to Galileo and get response with extracted action tags and latency',
  {
    message: z.string().describe('The message to send to Galileo'),
    experimentId: z.string().optional().describe('Current experiment ID (e.g., "1.1")'),
    sessionId: z.string().optional().describe('Session ID for memory continuity'),
    circuitState: z.object({}).passthrough().optional().describe('Current circuit state JSON'),
    context: z.object({}).passthrough().optional().describe('Additional context (activeTab, currentVolume, etc.)'),
  },
  async ({ message, experimentId, sessionId, circuitState, context }) => {
    try {
      const body = {
        message,
        ...(experimentId && { experimentId }),
        ...(sessionId && { sessionId: sessionId || `mcp-test-${Date.now()}` }),
        ...(circuitState && { circuitState }),
        ...(context && { context }),
      };
      const data = await nanobotFetch('/chat', body, 'POST');
      const actions = extractActions(data.response || '');

      const result = {
        response: data.response,
        source: data.source,
        layer: data.layer,
        actions,
        actionCount: actions.length,
        latency: data._latency,
        success: data.success,
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (e) {
      return {
        content: [{ type: 'text', text: `Chat failed: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool 3: Circuit diagnosis
server.tool(
  'galileo_diagnose',
  'Diagnose a circuit for issues (missing connections, wrong wiring, etc.)',
  {
    circuitState: z.object({}).passthrough().describe('Circuit state JSON with components and connections'),
    experimentId: z.string().optional().describe('Expected experiment ID'),
  },
  async ({ circuitState, experimentId }) => {
    try {
      const body = { circuitState, ...(experimentId && { experimentId }) };
      const data = await nanobotFetch('/diagnose', body, 'POST');
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    } catch (e) {
      return {
        content: [{ type: 'text', text: `Diagnose failed: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool 4: Progressive hints
server.tool(
  'galileo_hints',
  'Get progressive hints for an experiment (each call returns next hint level)',
  {
    experimentId: z.string().describe('Experiment ID (e.g., "1.1", "3.7")'),
    hintLevel: z.number().optional().describe('Hint level (1=gentle, 2=medium, 3=direct)'),
  },
  async ({ experimentId, hintLevel }) => {
    try {
      const body = { experimentId, ...(hintLevel && { hintLevel }) };
      const data = await nanobotFetch('/hints', body, 'POST');
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    } catch (e) {
      return {
        content: [{ type: 'text', text: `Hints failed: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// Tool 5: Batch test with auto rate limiting
server.tool(
  'galileo_batch_test',
  'Test N questions sequentially with auto rate limiting. Returns PASS/PARTIAL/FAIL per question and overall success rate.',
  {
    questions: z.array(z.string()).describe('Array of question strings to test'),
    experimentId: z.string().optional().describe('Experiment ID context for all questions'),
    context: z.object({}).passthrough().optional().describe('Shared context for all questions'),
  },
  async ({ questions, experimentId, context }) => {
    const results = [];
    let pass = 0, partial = 0, fail = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        const body = {
          message: q,
          sessionId: `batch-test-${Date.now()}`,
          ...(experimentId && { experimentId }),
          ...(context && { context }),
        };
        const data = await nanobotFetch('/chat', body, 'POST');
        const actions = extractActions(data.response || '');
        const verdict = evaluateResult(data.response, actions, q);

        if (verdict === 'PASS') pass++;
        else if (verdict === 'PARTIAL') partial++;
        else fail++;

        results.push({
          index: i + 1,
          question: q,
          verdict,
          actions: actions.map(a => `${a.type}${a.args ? ':' + a.args : ''}`),
          responseLength: (data.response || '').length,
          latency: data._latency,
          responsePreview: (data.response || '').substring(0, 200),
        });
      } catch (e) {
        fail++;
        results.push({
          index: i + 1,
          question: q,
          verdict: 'FAIL',
          error: e.message,
        });
      }
    }

    const summary = {
      total: questions.length,
      pass,
      partial,
      fail,
      successRate: `${((pass / questions.length) * 100).toFixed(1)}%`,
      passPartialRate: `${(((pass + partial) / questions.length) * 100).toFixed(1)}%`,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ summary, results }, null, 2),
      }],
    };
  }
);

// Tool 6: Memory operations
server.tool(
  'galileo_memory',
  'Read or sync student memory for a session',
  {
    operation: z.enum(['read', 'sync']).describe('"read" to get memory, "sync" to save'),
    sessionId: z.string().describe('Session ID'),
    memoryData: z.object({}).passthrough().optional().describe('Memory data to sync (required for "sync")'),
  },
  async ({ operation, sessionId, memoryData }) => {
    try {
      if (operation === 'read') {
        const data = await nanobotFetch(`/memory/${sessionId}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      } else {
        const data = await nanobotFetch('/memory/sync', {
          sessionId,
          ...(memoryData || {}),
        }, 'POST');
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }
    } catch (e) {
      return {
        content: [{ type: 'text', text: `Memory ${operation} failed: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// --- Start ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Galileo MCP server running on stdio');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
