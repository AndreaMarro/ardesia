import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

vi.mock('../../../../src/components/tutor/shared/SafeMarkdown', () => ({
  default: function MockSafeMarkdown(props) {
    return React.createElement('div', { className: props.className }, props.text);
  },
}));

vi.mock('../../../../src/components/tutor/ChatOverlay.module.css', () => ({
  default: new Proxy({}, { get: (_, name) => name }),
}));

import ChatOverlay, { UNLIM_WAITING_PHRASES } from '../../../../src/components/tutor/ChatOverlay.jsx';

function props(overrides = {}) {
  return {
    messages: [{ id: 'welcome', role: 'assistant', content: 'Ciao' }],
    input: '',
    onInputChange: vi.fn(),
    onSend: vi.fn(),
    isLoading: true,
    onRetry: vi.fn(),
    quickActions: [],
    visible: true,
    onClose: vi.fn(),
    expanded: false,
    onToggleExpanded: vi.fn(),
    onScreenshot: vi.fn(),
    onVoiceToggle: vi.fn(),
    voiceEnabled: false,
    onVoiceRecord: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ChatOverlay waiting copy', () => {
  it('shows a single clean waiting phrase and rotates through 10 prepared alternatives', () => {
    vi.useFakeTimers();
    const { container } = render(React.createElement(ChatOverlay, props()));

    fireEvent.click(screen.getByLabelText('Espandi chat UNLIM'));

    expect(UNLIM_WAITING_PHRASES).toHaveLength(10);
    expect(container.textContent.match(/Sto ELABorando\.\.\./g)).toHaveLength(1);
    expect(container.textContent).not.toContain('Sto elaborando');
    expect(container.textContent).not.toContain('elaborandg');

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(container.textContent).toContain(UNLIM_WAITING_PHRASES[1]);
    expect(container.textContent).not.toContain('Sto ELABorando...');
  });
});
