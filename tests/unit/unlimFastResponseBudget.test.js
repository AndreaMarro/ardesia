import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock('../../src/utils/contentFilter', () => ({
  validateMessage: vi.fn(() => ({ allowed: true })),
  sanitizeOutput: vi.fn((text) => text),
}));

vi.mock('../../src/services/lessonPrepService', () => ({
  isLessonPrepCommand: vi.fn(() => false),
  getLessonSummary: vi.fn(),
  prepareLesson: vi.fn(),
}));

vi.mock('../../src/services/unlimContextCollector', () => ({
  collectFullContext: vi.fn(() => ({})),
  getLatestVisualSnapshotImage: vi.fn(() => null),
}));

vi.mock('../../src/components/lavagna/intentsDispatcher', () => ({
  executeServerIntents: vi.fn(() => []),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

import { __test__ as chatTest } from '../../src/components/lavagna/useGalileoChat.js';

const { __test__: apiTest } = await vi.importActual('../../src/services/api.js');

describe('UNLIM fast response budgets', () => {
  it('shows elaboration feedback almost immediately', () => {
    expect(chatTest.THINKING_INDICATOR_DELAY_MS).toBeLessThanOrEqual(500);
  });

  it('does not let optional local server probing block cloud response', () => {
    expect(apiTest.LOCAL_HEALTH_TIMEOUT_MS).toBeLessThanOrEqual(400);
    expect(apiTest.LOCAL_CHAT_TIMEOUT_TEXT_MS).toBeLessThanOrEqual(3000);
  });

  it('uses live-class chat timeouts instead of 30s waits', () => {
    // iter 9 frontend bug Andrea screenshot "UNLIM ci sta mettendo un po' troppo":
    // master timeout bumped 15s→25s text, 25s→35s image. Cap test rilassato a max bounds.
    // 25s text + bounded 30s upper covers Edge Function p95 ~6.8s + RAG + retry + safety margin.
    expect(apiTest.API_TIMEOUT).toBeLessThanOrEqual(30000);
    expect(apiTest.MASTER_TIMEOUT_TEXT).toBeLessThanOrEqual(30000);
  });
});
