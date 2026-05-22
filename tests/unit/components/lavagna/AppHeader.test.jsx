import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AppHeader from '../../../../src/components/lavagna/AppHeader.jsx';

afterEach(() => {
  cleanup();
});

describe('AppHeader navigation controls', () => {
  it('renders a Home button when onHome is provided', () => {
    render(<AppHeader onHome={() => {}} />);

    expect(screen.getByRole('button', { name: /torna alla home/i })).toBeInTheDocument();
  });

  it('calls onHome when the Home button is clicked', () => {
    const onHome = vi.fn();
    render(<AppHeader onHome={onHome} />);

    fireEvent.click(screen.getByRole('button', { name: /torna alla home/i }));

    expect(onHome).toHaveBeenCalledTimes(1);
  });
});
