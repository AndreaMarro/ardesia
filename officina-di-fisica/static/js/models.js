// Pure models. Input units match the editor and the printed laboratory notes.
import specification from '../lab-models.json' with { type: 'json' };
export const { parameters, modes } = specification;
export function initial(model, overrides = {}) {
  const d = {};
  for (const [k, , , min, max, , value] of parameters[model]) {
    const v = overrides[k];
    d[k] = Number.isFinite(v) && v >= min && v <= max ? v : value;
  }
  if (modes[model]) d.mode = modes[model].includes(overrides.mode) ? overrides.mode : modes[model][0];
  return d;
}
export const models = {
  C1({ m, F, mu }) {
    const n = m * 9.81,
      limit = mu * n,
      moving = F > limit,
      friction = moving ? 0.75 * limit : F;
    return { n, limit, moving, friction, a: (F - friction) / m };
  },
  C2({ r, dp, eta }) {
    const radius = r / 1000,
      viscosity = eta / 1000,
      q = (Math.PI * radius ** 4 * dp) / (8 * viscosity * 0.25),
      mean = q / (Math.PI * radius ** 2),
      re = (1000 * 2 * radius * mean) / viscosity;
    return { q: q * 1e6, mean, re, relative: dp ? r ** 4 : null };
  },
  C3({ ratio, mode }) {
    const g = 5 / 3,
      V = mode === 'Isocora' ? 1 : ratio;
    let p, W;
    if (mode === 'Isoterma') {
      p = 100 / V;
      W = 100 * Math.log(V);
    } else if (mode === 'Isobara') {
      p = 100;
      W = 100 * (V - 1);
    } else if (mode === 'Isocora') {
      p = 100 * ratio;
      W = 0;
    } else {
      p = 100 / V ** g;
      W = (100 - p * V) / (g - 1);
    }
    const T = (300 * p * V) / 100,
      U = 1.5 * (p * V - 100);
    return { V, p, T, W, U, Q: Math.abs(U + W) < 1e-10 ? 0 : U + W };
  },
  C4({ U, R1, R2, mode }) {
    const series = mode === 'Serie',
      R = series ? R1 + R2 : (R1 * R2) / (R1 + R2),
      I = U / R,
      I1 = series ? I : U / R1,
      I2 = series ? I : U / R2;
    return { R, I, I1, I2, V1: I1 * R1, V2: I2 * R2, P: U * I };
  },
  C5({ p, f }) {
    if (p === f) return { q: Infinity, m: null, type: 'all’infinito' };
    const q = (f * p) / (p - f);
    return { q, m: -q / p, type: q > 0 ? 'reale, capovolta' : 'virtuale, diritta' };
  },
};
