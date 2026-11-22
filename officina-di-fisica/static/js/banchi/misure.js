export const g = 9.81;
export const rad = (degrees) => (degrees * Math.PI) / 180;
const numberFormat = new Intl.NumberFormat('it-IT', { maximumSignificantDigits: 4 });
export const n = (value) => (Number.isFinite(value) ? numberFormat.format(value) : '—');
export const param = (key, label, unit, min, max, step, value) => ({
  key,
  label,
  unit,
  min,
  max,
  step,
  value,
});
export const select = (key, label, options, value) => ({ key, label, options, value });
export const defaults = (params) => Object.fromEntries(params.map((p) => [p.key, p.value]));
export function inRange(params, input) {
  return params.every((p) =>
    p.options
      ? p.options.some(([v]) => v === input[p.key])
      : Number.isFinite(input[p.key]) && input[p.key] >= p.min && input[p.key] <= p.max,
  );
}
export const curve = (name, lo, hi, fn, count = 60) => ({
  name,
  points: Array.from({ length: count + 1 }, (_, i) => {
    const x = lo + ((hi - lo) * i) / count;
    return [x, fn(x)];
  }),
});
export const chart = (title, x, y, series, at) => ({ title, x, y, series, at });
export const norm = (v) => Math.hypot(...v);
export const sum = (a, b) => a.map((x, i) => x + b[i]);
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const mul = (a, k) => a.map((x) => x * k);

export function nextTime(t, elapsed, duration, rate, loop) {
  if (!(duration > 0)) return 0;
  const next = t + Math.max(0, elapsed) * rate;
  return loop ? next % duration : Math.min(next, duration);
}
