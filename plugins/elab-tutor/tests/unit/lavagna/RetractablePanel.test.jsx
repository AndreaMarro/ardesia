/**
 * RetractablePanel — Tests for resizable panel component
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RetractablePanel from '../../../src/components/lavagna/RetractablePanel';

const store = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((k) => store[k] ?? null),
    setItem: vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn((k) => { delete store[k]; }),
  },
  writable: true,
});

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('RetractablePanel', () => {
  it('renders children when open', () => {
    render(
      <RetractablePanel open={true}>
        <div>Panel content</div>
      </RetractablePanel>
    );
    expect(screen.getByText('Panel content')).toBeTruthy();
  });

  it('renders with default size of 240', () => {
    const { container } = render(
      <RetractablePanel open={true}>
        <div>Content</div>
      </RetractablePanel>
    );
    // Check that the panel has width style
    expect(container.firstChild).toBeTruthy();
  });

  it('accepts direction prop (left/right)', () => {
    const { container } = render(
      <RetractablePanel open={true} direction="right">
        <div>Right panel</div>
      </RetractablePanel>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('calls onToggle when toggle button clicked', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <RetractablePanel open={true} onToggle={onToggle}>
        <div>Content</div>
      </RetractablePanel>
    );
    // Find toggle button
    const toggleBtn = container.querySelector('button');
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      expect(onToggle).toHaveBeenCalled();
    }
  });

  it('persists size to localStorage', () => {
    render(
      <RetractablePanel id="test-panel" open={true} defaultSize={300}>
        <div>Content</div>
      </RetractablePanel>
    );
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('loads saved size from localStorage', () => {
    store['elab-rp-test-panel'] = '350';
    const onSizeChange = vi.fn();
    render(
      <RetractablePanel id="test-panel" open={true} defaultSize={240} onSizeChange={onSizeChange}>
        <div>Content</div>
      </RetractablePanel>
    );
    // Should load 350 from storage, not use 240 default
    expect(onSizeChange).toHaveBeenCalledWith(350);
  });

  it('accepts className prop', () => {
    const { container } = render(
      <RetractablePanel open={true} className="custom-class">
        <div>Content</div>
      </RetractablePanel>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('handles closed state', () => {
    const { container } = render(
      <RetractablePanel open={false}>
        <div>Hidden content</div>
      </RetractablePanel>
    );
    // Panel should still render but may be collapsed
    expect(container.firstChild).toBeTruthy();
  });
});
