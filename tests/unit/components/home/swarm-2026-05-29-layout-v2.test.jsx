/**
 * Swarm 2 — HomeCompileLayoutV2 render contract tests.
 *
 * Reference audit: docs/audits/2026-05-29-edukit-reference-audit.md
 * Component:        src/components/home/HomeCompileLayoutV2.jsx
 *
 * Pure-render contract — component owns no state. Tests verify slot pass-
 * through, prop gating, status copy mapping, accessibility labels.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.board) return `${key}|board:${opts.board}`;
      if (opts && typeof opts.pct === 'number') return `${key}|pct:${opts.pct}`;
      return key;
    },
    i18n: { language: 'it', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

import HomeCompileLayoutV2 from '../../../../src/components/home/HomeCompileLayoutV2.jsx';

describe('HomeCompileLayoutV2 — Swarm 2 edukit-inspired layout', () => {
  beforeEach(() => { cleanup(); });

  it('renders without crashing with empty props', () => {
    const { container } = render(<HomeCompileLayoutV2 />);
    expect(container.querySelector('[data-testid="home-compile-layout-v2"]')).toBeTruthy();
  });

  it('passes editorSlot through to the editor area', () => {
    render(<HomeCompileLayoutV2 editorSlot={<div data-testid="editor-mock">EDITOR</div>} />);
    expect(screen.getByTestId('editor-mock')).toBeTruthy();
  });

  it('renders editor placeholder when no editorSlot given', () => {
    render(<HomeCompileLayoutV2 />);
    expect(screen.getByText('home_compile_v2.editor.placeholder')).toBeTruthy();
  });

  it('passes bannerSlot through under the topbar', () => {
    render(<HomeCompileLayoutV2 bannerSlot={<span>BANNER</span>} />);
    expect(screen.getByText('BANNER')).toBeTruthy();
  });

  it('hides banner strip when bannerSlot is null', () => {
    const { container } = render(<HomeCompileLayoutV2 />);
    expect(container.querySelectorAll('[aria-label="home_compile_v2.banner_label"]')).toHaveLength(0);
  });

  it('passes boardPickerSlot through inside the aside', () => {
    render(<HomeCompileLayoutV2 boardPickerSlot={<span>PICKER</span>} />);
    expect(screen.getByText('PICKER')).toBeTruthy();
  });

  it('passes unlimChatSlot through and hides the quick-question fallback', () => {
    render(<HomeCompileLayoutV2 unlimChatSlot={<div data-testid="chat-mock">CHAT</div>} />);
    expect(screen.getByTestId('chat-mock')).toBeTruthy();
    expect(screen.queryByText('home_compile_v2.unlim.fallback_hint')).toBeNull();
  });

  it('renders quick-question chips when no unlimChatSlot', () => {
    render(<HomeCompileLayoutV2 />);
    expect(screen.getByText('home_compile_v2.quick.read')).toBeTruthy();
    expect(screen.getByText('home_compile_v2.quick.fix')).toBeTruthy();
    expect(screen.getByText('home_compile_v2.quick.next')).toBeTruthy();
  });

  it('disables quick chips when onAskUnlim is missing', () => {
    render(<HomeCompileLayoutV2 />);
    const chip = screen.getByText('home_compile_v2.quick.read').closest('button');
    expect(chip).toBeTruthy();
    expect(chip.disabled).toBe(true);
  });

  it('forwards quick-chip click to onAskUnlim with the resolved label', () => {
    const onAskUnlim = vi.fn();
    render(<HomeCompileLayoutV2 onAskUnlim={onAskUnlim} />);
    fireEvent.click(screen.getByText('home_compile_v2.quick.read'));
    expect(onAskUnlim).toHaveBeenCalledTimes(1);
    expect(onAskUnlim).toHaveBeenCalledWith('home_compile_v2.quick.read');
  });

  it('invokes onCompile when the primary pill is clicked', () => {
    const onCompile = vi.fn();
    render(<HomeCompileLayoutV2 onCompile={onCompile} canCompile />);
    fireEvent.click(screen.getByText('home_compile_v2.btn.compile'));
    expect(onCompile).toHaveBeenCalledTimes(1);
  });

  it('disables compile pill when canCompile is false', () => {
    const onCompile = vi.fn();
    render(<HomeCompileLayoutV2 onCompile={onCompile} canCompile={false} />);
    const btn = screen.getByText('home_compile_v2.btn.compile').closest('button');
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onCompile).not.toHaveBeenCalled();
  });

  it('shows compiling label when compileStatus is compiling', () => {
    render(<HomeCompileLayoutV2 compileStatus="compiling" canCompile />);
    expect(screen.getByText('home_compile_v2.btn.compiling')).toBeTruthy();
    const btn = screen.getByText('home_compile_v2.btn.compiling').closest('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.disabled).toBe(true);
  });

  it('invokes onUpload only when canUpload', () => {
    const onUpload = vi.fn();
    const { rerender } = render(<HomeCompileLayoutV2 onUpload={onUpload} canUpload={false} />);
    const btn = screen.getByText('home_compile_v2.btn.upload').closest('button');
    fireEvent.click(btn);
    expect(onUpload).not.toHaveBeenCalled();

    rerender(<HomeCompileLayoutV2 onUpload={onUpload} canUpload />);
    fireEvent.click(screen.getByText('home_compile_v2.btn.upload').closest('button'));
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it('renders the size strip only when compileSize.flashPercent is a number', () => {
    const { rerender, container } = render(<HomeCompileLayoutV2 />);
    expect(container.querySelectorAll('[aria-label="home_compile_v2.size_label"]')).toHaveLength(0);
    rerender(<HomeCompileLayoutV2 compileSize={{ flashUsed: '34 KB', flashTotal: '256 KB', flashPercent: 13.5 }} />);
    expect(screen.getByText('home_compile_v2.size.flash')).toBeTruthy();
    expect(screen.getByText(/14%/)).toBeTruthy();
  });

  it('passes the board label into status interpolation', () => {
    render(<HomeCompileLayoutV2 boardLabel="UNO R3" />);
    expect(screen.getByText('home_compile_v2.status.idle|board:UNO R3')).toBeTruthy();
  });

  it('reflects compileStatus on the data-tone attribute', () => {
    const { container, rerender } = render(<HomeCompileLayoutV2 compileStatus="success" canCompile />);
    expect(container.querySelector('[data-testid="home-compile-layout-v2"]').getAttribute('data-tone')).toBe('success');
    rerender(<HomeCompileLayoutV2 compileStatus="error" canCompile />);
    expect(container.querySelector('[data-testid="home-compile-layout-v2"]').getAttribute('data-tone')).toBe('danger');
    rerender(<HomeCompileLayoutV2 compileStatus="verified-legacy" canCompile />);
    expect(container.querySelector('[data-testid="home-compile-layout-v2"]').getAttribute('data-tone')).toBe('warning');
  });

  it('invokes onBackHome when the back button is clicked', () => {
    const onBackHome = vi.fn();
    render(<HomeCompileLayoutV2 onBackHome={onBackHome} />);
    fireEvent.click(screen.getByLabelText('home_compile_v2.back_home'));
    expect(onBackHome).toHaveBeenCalledTimes(1);
  });

  it('renders the board pill with the boardLabel value', () => {
    render(<HomeCompileLayoutV2 boardLabel="UNO R3 (legacy)" />);
    expect(screen.getByText('UNO R3 (legacy)')).toBeTruthy();
  });

  it('renders the serial slot footer when serialMonitorSlot is provided', () => {
    render(<HomeCompileLayoutV2 serialMonitorSlot={<span>SERIAL</span>} />);
    expect(screen.getByText('SERIAL')).toBeTruthy();
  });

  it('omits serial footer when serialMonitorSlot is null', () => {
    const { container } = render(<HomeCompileLayoutV2 />);
    expect(container.querySelectorAll('[aria-label="home_compile_v2.serial_label"]')).toHaveLength(0);
  });

  it('exposes data-elab-layout="hcv2-edukit" for orchestrator pick-up', () => {
    const { container } = render(<HomeCompileLayoutV2 />);
    expect(container.querySelector('[data-elab-layout="hcv2-edukit"]')).toBeTruthy();
  });

  it('renders sketch preview details with the first lines of the sketch', () => {
    const code = ['void setup() {', '  pinMode(13, OUTPUT);', '}'].join('\n');
    render(<HomeCompileLayoutV2 sketchCode={code} />);
    const pre = document.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre.textContent).toContain('pinMode(13, OUTPUT)');
  });

  it('falls back to placeholder sketch text when sketchCode is empty', () => {
    render(<HomeCompileLayoutV2 />);
    const pre = document.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre.textContent).toContain('home_compile_v2.sketch.empty');
  });
});
