import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('Lavagna drawing sync feature flag', () => {
  it('does not enable remote scribble_paths sync unless explicitly configured', () => {
    const source = readFileSync(
      join(ROOT, 'src/components/lavagna/LavagnaShell.jsx'),
      'utf8',
    );

    expect(source).toContain('VITE_ENABLE_DRAWING_SYNC');
    expect(source).toContain('const DRAWING_SYNC_ENABLED');
    expect(source).toContain('enableDrawingSync={DRAWING_SYNC_ENABLED}');
    expect(source).not.toMatch(/<NewElabSimulator[\s\S]*?\benableDrawingSync\s*(?:\/>|>)/);
  });
});
