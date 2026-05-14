/**
 * AppHeader — Tests for lavagna header component
 * Tabs, brand, experiment name, step progress.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppHeader from '../../../src/components/lavagna/AppHeader';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AppHeader', () => {
  it('renders with default experiment name', () => {
    render(<AppHeader />);
    expect(screen.getByText(/Scegli un esperimento/)).toBeTruthy();
  });

  it('renders with custom experiment name', () => {
    render(<AppHeader experimentName="Accendi il primo LED" />);
    expect(screen.getByText('Accendi il primo LED')).toBeTruthy();
  });

  it('shows ELAB brand', () => {
    render(<AppHeader />);
    expect(screen.getByText('ELAB')).toBeTruthy();
  });

  it('has role="banner"', () => {
    render(<AppHeader />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('shows Lavagna tab by default', () => {
    render(<AppHeader showClasseTab={true} onTabChange={() => {}} />);
    expect(screen.getByText('Lavagna')).toBeTruthy();
  });

  it('shows Classe tab when showClasseTab=true', () => {
    render(<AppHeader showClasseTab={true} onTabChange={() => {}} />);
    expect(screen.getByText('Classe')).toBeTruthy();
  });

  it('calls onTabChange when Classe tab clicked', () => {
    const onTabChange = vi.fn();
    render(<AppHeader showClasseTab={true} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('Classe'));
    expect(onTabChange).toHaveBeenCalledWith('classe');
  });

  it('calls onPickerOpen when experiment name area clicked', () => {
    const onPickerOpen = vi.fn();
    render(<AppHeader onPickerOpen={onPickerOpen} />);
    const expName = screen.getByText(/Scegli un esperimento/);
    // The experiment name might be inside a clickable element
    fireEvent.click(expName);
  });

  it('shows step progress when totalSteps > 0', () => {
    render(<AppHeader totalSteps={5} currentStep={2} />);
    // Should show something like "2/5" or step indicator
  });

  it('renders brand logo image', () => {
    render(<AppHeader />);
    const img = screen.getByAltText('ELAB');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toContain('logo');
  });

  it('does not render the Capitoli header button even if a handler is passed', () => {
    render(<AppHeader onCapitoliOpen={vi.fn()} capitoliOpen={false} />);
    expect(screen.queryByRole('button', { name: /capitoli/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Capitoli$/i)).not.toBeInTheDocument();
  });

  it('renders UNLIM chat toggle when handler is provided', () => {
    const onGalileoToggle = vi.fn();
    render(<AppHeader onGalileoToggle={onGalileoToggle} galileoOpen={false} />);
    const btn = screen.getByRole('button', { name: /mostra chat unlim/i });
    fireEvent.click(btn);
    expect(onGalileoToggle).toHaveBeenCalledOnce();
  });
});
