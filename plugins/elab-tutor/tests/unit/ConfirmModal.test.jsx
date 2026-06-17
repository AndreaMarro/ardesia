/**
 * ConfirmModal — Tests for confirmation dialog component and useConfirmModal hook
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal, useConfirmModal } from '../../src/components/common/ConfirmModal';

vi.mock('../../src/hooks/useFocusTrap', () => ({
  default: vi.fn(() => ({ current: null })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConfirmModal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(
      <ConfirmModal open={false} message="Test?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders dialog when open=true', () => {
    render(
      <ConfirmModal open={true} message="Sei sicuro?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('Sei sicuro?')).toBeTruthy();
  });

  it('shows default title "Conferma"', () => {
    render(
      <ConfirmModal open={true} message="Test" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('Conferma')).toBeTruthy();
  });

  it('shows custom title', () => {
    render(
      <ConfirmModal open={true} title="Attenzione" message="Test" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('Attenzione')).toBeTruthy();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal open={true} message="Test" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText('Elimina'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} message="Test" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText('Annulla'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when overlay clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} message="Test" onConfirm={() => {}} onCancel={onCancel} />
    );
    // Click the overlay (the dialog role element)
    fireEvent.click(screen.getByRole('dialog'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} message="Test" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('uses custom button labels', () => {
    render(
      <ConfirmModal open={true} message="Test" confirmLabel="Si" cancelLabel="No" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('Si')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
  });

  it('has aria-modal and role=dialog', () => {
    render(
      <ConfirmModal open={true} message="Test" onConfirm={() => {}} onCancel={() => {}} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });
});

describe('useConfirmModal hook', () => {
  function TestHookComponent() {
    const { confirm, ConfirmDialog } = useConfirmModal();
    return (
      <div>
        <button onClick={() => confirm('Confermi?')}>Open</button>
        <ConfirmDialog />
      </div>
    );
  }

  it('renders without dialog initially', () => {
    render(<TestHookComponent />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows dialog after confirm() is called', () => {
    render(<TestHookComponent />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Confermi?')).toBeTruthy();
  });
});
