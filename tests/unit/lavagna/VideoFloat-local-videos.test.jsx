import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import VideoFloat from '../../../src/components/lavagna/VideoFloat.jsx';

vi.mock('../../../src/components/lavagna/FloatingWindow', () => ({
  default: ({ title, children }) => (
    <section data-testid="floating-window" aria-label={title}>
      {children}
    </section>
  ),
}));

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('VideoFloat local TikTok videocorsi', () => {
  it('shows the two local videos in a virtualized Videocorsi list and plays them inline', () => {
    render(<VideoFloat visible />);

    fireEvent.click(screen.getByRole('tab', { name: /videocorsi elab/i }));
    const virtualList = screen.getByTestId('videocorsi-virtual-list');
    expect(virtualList).toHaveAttribute('data-virtualized', 'true');
    expect(within(virtualList).getAllByRole('button', { name: /videolezione/i })).toHaveLength(2);

    fireEvent.click(within(virtualList).getByRole('button', { name: /videolezione elab 2/i }));

    const player = screen.getByTestId('videofloat-local-player');
    expect(player).toHaveAttribute('src', '/videos/tiktok-elab-2.mp4');
    expect(screen.queryByTitle(/youtube/i)).not.toBeInTheDocument();
  });
});
