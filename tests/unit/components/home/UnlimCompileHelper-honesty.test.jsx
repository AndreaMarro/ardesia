import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../../../../src/components/common/ElabIcons', () => ({
  RobotIcon: () => React.createElement('span', { 'data-testid': 'robot-icon' }),
}));

import UnlimCompileHelper from '../../../../src/components/home/UnlimCompileHelper.jsx';

describe('UnlimCompileHelper — compile honesty', () => {
  it('does not invite loading the kit when only the legacy AVR fallback verified syntax', () => {
    render(<UnlimCompileHelper compileStatus="verified-legacy" />);

    expect(screen.getByText(/compilatore Nano R4 non/i)).toBeTruthy();
    expect(screen.queryByText(/caricare il programma sul vostro kit/i)).toBeNull();
    expect(screen.queryByText(/Compilazione riuscita/i)).toBeNull();
  });
});
