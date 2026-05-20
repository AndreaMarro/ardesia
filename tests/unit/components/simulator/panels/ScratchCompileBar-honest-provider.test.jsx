import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../../../../../src/components/lavagna/CompileUploadButton', () => ({
  default: () => React.createElement('button', { type: 'button' }, 'Carica sul kit Arduino'),
}));
vi.mock('../../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import ScratchCompileBar from '../../../../../src/components/simulator/panels/ScratchCompileBar.jsx';

describe('ScratchCompileBar — provider honesty', () => {
  it('renders legacy AVR fallback as syntax verification without fake Nano R4 size', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="verified-legacy"
        compilationSize={{ bytes: 1200, total: 262144, percent: 0 }}
        compileButtonLabel="Compila"
      />,
    );

    expect(screen.getByText(/Codice verificato/i)).toBeTruthy();
    expect(screen.getByText(/compilatore Nano R4 non/i)).toBeTruthy();
    expect(screen.queryByText(/1\.2 KB/i)).toBeNull();
    expect(screen.queryByText(/256/i)).toBeNull();
    expect(screen.queryByText(/Compilato(?:\s|—|$)/i)).toBeNull();
  });
});
