/**
 * SafeMarkdown.test.jsx — Test per safe markdown renderer
 * 8 test: rendering, XSS prevention, edge cases
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafeMarkdown from '../../src/components/tutor/shared/SafeMarkdown';

describe('SafeMarkdown', () => {
  it('renders null for empty text', () => {
    const { container } = render(<SafeMarkdown text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null for null text', () => {
    const { container } = render(<SafeMarkdown text={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders plain text', () => {
    const { container } = render(<SafeMarkdown text="Hello world" />);
    expect(container.textContent).toContain('Hello world');
  });

  it('renders bold text with **', () => {
    const { container } = render(<SafeMarkdown text="This is **bold** text" />);
    const bold = container.querySelector('strong');
    expect(bold).toBeTruthy();
    expect(bold.textContent).toBe('bold');
  });

  it('renders inline code with backticks', () => {
    const { container } = render(<SafeMarkdown text="Use `pinMode(13, OUTPUT)`" />);
    const code = container.querySelector('code');
    expect(code).toBeTruthy();
    expect(code.textContent).toBe('pinMode(13, OUTPUT)');
  });

  it('does NOT use dangerouslySetInnerHTML (XSS safe)', () => {
    const { container } = render(<SafeMarkdown text="<script>alert('xss')</script>" />);
    expect(container.innerHTML).not.toContain('<script>');
  });

  it('strips [AZIONE:...] tags when stripActions=true', () => {
    const { container } = render(<SafeMarkdown text="Hello [AZIONE:test] world" stripActions={true} />);
    expect(container.textContent).not.toContain('[AZIONE:');
    expect(container.textContent).toContain('Hello');
    expect(container.textContent).toContain('world');
  });

  it('applies custom className', () => {
    const { container } = render(<SafeMarkdown text="test" className="custom-class" />);
    expect(container.firstChild.classList.contains('custom-class')).toBe(true);
  });
});
