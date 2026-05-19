import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('voice audio unlock CSP compatibility', () => {
  it('does not use data: audio URLs that production CSP blocks', () => {
    const source = readFileSync(join(ROOT, 'src/services/voiceService.js'), 'utf8');

    expect(source).not.toContain('data:audio');
    expect(source).toContain('URL.createObjectURL');
    expect(source).toContain('URL.revokeObjectURL');
  });
});
