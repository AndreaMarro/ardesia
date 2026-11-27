// Exact arithmetic for the short rational expressions used in the five workshops.
// Monomials are sorted lists of symbols. The empty key represents a constant.
const one = () => new Map([['', 1n]]);
function addTerms(out, key, value) {
  const sum = (out.get(key) || 0n) + value;
  if (sum) out.set(key, sum);
  else out.delete(key);
  if (out.size > 80) throw Error('Espressione troppo lunga');
}
function multiply(a, b) {
  const result = new Map();
  for (const [ka, va] of a)
    for (const [kb, vb] of b) {
      const key = [ka, kb].join(' ').split(' ').filter(Boolean).sort().join(' ');
      if (key.length > 160) throw Error('Grado troppo alto');
      addTerms(result, key, va * vb);
    }
  return result;
}
function product([a, b], [c, d]) {
  return [multiply(a, c), multiply(b, d)];
}
function parse(input, symbols) {
  const s = input
    .replaceAll('·', '*')
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('ρ', 'rho')
    .replaceAll('λ', 'lambda')
    .replaceAll('Δ', 'd')
    .replaceAll('₀', '0')
    .replaceAll('²', '^2')
    .replaceAll('³', '^3')
    .replace(/\s+/g, '');
  if (!s || s.length > 72) throw Error('Lunghezza non valida');
  const vars = [...symbols].sort((a, b) => b.length - a.length);
  let i = 0;
  function atom() {
    if (s[i] === '(') {
      i++;
      const value = sum();
      if (s[i++] !== ')') throw Error('Parentesi');
      return value;
    }
    const name = vars.find((v) => s.startsWith(v, i));
    if (name) {
      i += name.length;
      return [new Map([[name, 1n]]), one()];
    }
    const match = /^\d{1,4}(?!\d)/.exec(s.slice(i));
    if (!match) throw Error('Simbolo sconosciuto');
    i += match[0].length;
    const value = BigInt(match[0]);
    return [value ? new Map([['', value]]) : new Map(), one()];
  }
  function factor() {
    if (s[i] === '-') {
      i++;
      return product([new Map([['', -1n]]), one()], factor());
    }
    const value = atom();
    if (s[i] !== '^') return value;
    i++;
    if (!/^[1-4](?!\d)/.test(s.slice(i))) throw Error('Esponente non ammesso');
    const n = Number(s[i++]);
    let result = value;
    for (let j = 1; j < n; j++) result = product(result, value);
    return result;
  }
  function term() {
    let value = factor();
    while (i < s.length && !['+', '-', ')'].includes(s[i])) {
      const divide = s[i] === '/';
      if (divide || s[i] === '*') i++;
      const [num, den] = factor();
      // Known nonzero factors may occur in a denominator. Sums may not.
      if (divide && num.size !== 1) throw Error('Denominatore non ammesso');
      value = product(value, divide ? [den, num] : [num, den]);
    }
    return value;
  }
  function sum() {
    let [a, b] = term();
    while (['+', '-'].includes(s[i])) {
      const sign = s[i++] === '+' ? 1n : -1n;
      const [c, d] = term(),
        out = multiply(a, d);
      for (const [key, value] of multiply(c, b)) addTerms(out, key, sign * value);
      a = out;
      b = multiply(b, d);
    }
    return [a, b];
  }
  const result = sum();
  if (i !== s.length) throw Error('Espressione incompleta');
  return result;
}
export function equivalent(input, expected, symbols, target) {
  try {
    input = input.replaceAll('λ', 'lambda').replaceAll('ρ', 'rho');
    const pieces = input.trim().split('=');
    if (pieces.length === 2 && pieces[0].trim() === target) input = pieces[1];
    else if (pieces.length === 2 && pieces[1].trim() === target) input = pieces[0];
    const [a, b] = parse(input, symbols),
      [c, d] = parse(expected, symbols);
    const left = multiply(a, d),
      right = multiply(c, b);
    return left.size === right.size && [...left].every(([key, v]) => right.get(key) === v);
  } catch {
    return false;
  }
}
