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
    // copy. PR #181 (2026-05-28) made the mascot board-aware: the placeholder
    // is interpolated from the new `boardLabel` prop. With the Nano R4 picker
    // selection forwarded, the verified-legacy line still names the board
    // honestly + the success line still doesn't appear.
    render(<UnlimCompileHelper compileStatus="verified-legacy" boardLabel="Nano R4" />);

    expect(screen.getByText(/Codice verificato, ma non ancora per Nano R4/i)).toBeTruthy();
    expect(screen.queryByText(/caricare il programma sul vostro kit/i)).toBeNull();
    expect(screen.queryByText(/Compilazione OK\. Potete caricare sulla Nano R4/i)).toBeNull();
  });

  it('verified-legacy without boardLabel falls back to generic "scheda" instead of "Nano R4"', () => {
    // PR #181 anti-regression: with no boardLabel, the copy no longer
    // hardcodes "Nano R4" — prevents the mismatch Andrea hit when the
    // picker said UNO R3 but the mascot kept saying Nano R4.
    render(<UnlimCompileHelper compileStatus="verified-legacy" />);
    expect(screen.getByText(/Codice verificato, ma non ancora per scheda/i)).toBeTruthy();
  });
});
