import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../../../../src/components/common/ElabIcons', () => ({
  RobotIcon: () => React.createElement('span', { 'data-testid': 'robot-icon' }),
}));

import UnlimCompileHelper from '../../../../src/components/home/UnlimCompileHelper.jsx';

describe('UnlimCompileHelper — compile honesty', () => {
  it('does not invite loading the kit when only the legacy AVR fallback verified syntax', () => {
    // iter 104 C3 component rewrite (commit 5fe1df5c) shipped verified-legacy
    // copy "Codice verificato, ma non ancora per Nano R4." (UnlimCompileHelper.jsx
    // getStatusMessage line 56). Test sync 2026-05-25 PR #166 base merge:
    // assert on actually-shipped honest copy + retain anti-regression negatives
    // (no "Compilazione OK" success copy + no kit-upload invitation).
    render(<UnlimCompileHelper compileStatus="verified-legacy" />);

    expect(screen.getByText(/Codice verificato, ma non ancora per Nano R4/i)).toBeTruthy();
    expect(screen.queryByText(/caricare il programma sul vostro kit/i)).toBeNull();
    expect(screen.queryByText(/Compilazione OK\. Potete caricare sulla Nano R4/i)).toBeNull();
  });
});
