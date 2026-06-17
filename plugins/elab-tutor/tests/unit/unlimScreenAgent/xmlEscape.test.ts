import { describe, expect, test } from 'vitest';
import { escapeXml } from '../../../src/features/unlimScreenAgent/utils/xmlEscape';

describe('unlimScreenAgent escapeXml', () => {
  test('returns empty string unchanged', () => {
    expect(escapeXml('')).toBe('');
  });

  test('escapes ampersand', () => {
    expect(escapeXml('A & B')).toBe('A &amp; B');
  });

  test('escapes less-than', () => {
    expect(escapeXml('x < 10')).toBe('x &lt; 10');
  });

  test('escapes greater-than', () => {
    expect(escapeXml('x > 10')).toBe('x &gt; 10');
  });

  test('escapes double quote', () => {
    expect(escapeXml('Serial.print("ok")')).toBe('Serial.print(&quot;ok&quot;)');
  });

  test('escapes single quote', () => {
    expect(escapeXml("char c = '&';")).toBe('char c = &apos;&amp;&apos;;');
  });

  test('leaves text without XML special characters unchanged', () => {
    expect(escapeXml('digitalWrite 13 HIGH')).toBe('digitalWrite 13 HIGH');
  });

  test('escapes C++ containing all five XML special characters', () => {
    const cpp = 'if (x < 10 && y > 3) { Serial.print("&"); char q = \'\\"\'; }';

    expect(escapeXml(cpp)).toBe(
      'if (x &lt; 10 &amp;&amp; y &gt; 3) { Serial.print(&quot;&amp;&quot;); char q = &apos;\\&quot;&apos;; }',
    );
  });
});
