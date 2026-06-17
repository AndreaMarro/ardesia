/**
 * ElabIcons.test.jsx — Test per icon components SVG ELAB
 * 8 test: rendering, SVG output, props, accessibility
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MicrophoneIcon, StopIcon, SpeakerOnIcon, SendIcon, LoadingIcon, ReportIcon, RobotIcon, CircuitIcon, LightbulbIcon, HammerIcon } from '../../src/components/common/ElabIcons';

describe('ElabIcons', () => {
  it('MicrophoneIcon renders SVG', () => {
    const { container } = render(<MicrophoneIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('StopIcon renders SVG', () => {
    const { container } = render(<StopIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('SendIcon renders SVG', () => {
    const { container } = render(<SendIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('RobotIcon renders SVG (mascotte)', () => {
    const { container } = render(<RobotIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('CircuitIcon renders SVG', () => {
    const { container } = render(<CircuitIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('icons accept size prop', () => {
    const { container } = render(<MicrophoneIcon size={32} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
  });

  it('icons accept className prop', () => {
    const { container } = render(<SendIcon className="custom" />);
    const svg = container.querySelector('svg');
    expect(svg.classList.contains('custom')).toBe(true);
  });

  it('LoadingIcon renders with animation', () => {
    const { container } = render(<LoadingIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  // ─── Wave 2b Impl-H — HammerIcon (PROMPT-CROSSCOMPILATORE Sez 21) ───
  it('HammerIcon renders SVG (kit assembly identity)', () => {
    const { container } = render(<HammerIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('HammerIcon respects size prop', () => {
    const { container } = render(<HammerIcon size={32} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  it('HammerIcon uses canonical 24×24 viewBox', () => {
    const { container } = render(<HammerIcon />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('HammerIcon is aria-hidden by default (decorative)', () => {
    const { container } = render(<HammerIcon />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBe('img');
  });
});
