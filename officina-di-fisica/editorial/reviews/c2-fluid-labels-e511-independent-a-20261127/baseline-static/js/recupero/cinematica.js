// SI throughout. Velocity at an interior boundary belongs to the following leg.
export function traiettoria({ origin = 0, legs }) {
  if (!Number.isFinite(origin) || !Array.isArray(legs) || !legs.length)
    throw new RangeError('Origine o tratti non validi.');
  let duration = 0,
    end = origin,
    length = 0;
  const positions = [origin];
  const parts = legs.map(({ velocity, duration: seconds }) => {
    if (!Number.isFinite(velocity) || !Number.isFinite(seconds) || seconds <= 0)
      throw new RangeError('Velocità o durata non valida.');
    const part = { start: duration, x: end, distance: length, velocity, seconds };
    duration += seconds;
    end += velocity * seconds;
    length += Math.abs(velocity) * seconds;
    if (![duration, end, length].every(Number.isFinite)) throw new RangeError('Misura fuori scala.');
    positions.push(end);
    return part;
  });
  function at(time) {
    if (!Number.isFinite(time) || time < 0 || time > duration)
      throw new RangeError('Istante fuori dal moto.');
    const part = parts.find((p) => time < p.start + p.seconds) ?? parts.at(-1);
    const elapsed = time - part.start;
    const x = part.x + part.velocity * elapsed;
    return {
      time,
      x,
      displacement: x - origin,
      distance: part.distance + Math.abs(part.velocity) * elapsed,
      velocity: part.velocity,
    };
  }
  return {
    at,
    duration,
    origin,
    boundaries: [...parts.map((p) => p.start), duration],
    min: Math.min(...positions),
    max: Math.max(...positions),
  };
}

export function numeroConSegno(raw) {
  const value = raw.trim().replace('−', '-').replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return NaN;
  return Number(value);
}

export function verificaSpostamento(raw, end) {
  const value = numeroConSegno(raw);
  if (!Number.isFinite(value)) return 'numero';
  // Allow floating point round-off in a sum of signed legs, even close to the origin.
  const equals = (expected) => Math.abs(value - expected) <= 8 * Number.EPSILON * end.distance;
  if (equals(end.displacement)) return 'corretto';
  if (equals(-end.displacement)) return 'segno';
  if (equals(end.distance)) return 'distanza';
  return 'calcolo';
}
