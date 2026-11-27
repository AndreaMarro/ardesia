// These inputs select exercises only. Expected measurements always come from the installed law.
export function assessmentPoints(record, fallback) {
  if (!Object.hasOwn(record, 'assessmentSelection')) return [...fallback];
  const selection = record.assessmentSelection;
  const invalid = () => { throw Error('Selezione delle verifiche non valida.'); };
  if (!selection || typeof selection !== 'object' || Array.isArray(selection) ||
      Object.keys(selection).sort().join(',') !== 'points,schemaVersion' || selection.schemaVersion !== '1.0.0' ||
      !Array.isArray(selection.points) || selection.points.length !== 2 ||
      !selection.points.every(Number.isFinite) || selection.points[0] === selection.points[1]) invalid();
  const c = record.control;
  if (!c || ![c.min,c.max,c.step].every(Number.isFinite) || !(c.step > 0) || !(c.max > c.min)) invalid();
  for (const x of selection.points) {
    const offset = (x-c.min)/c.step;
    if (!(x >= c.min && x <= c.max) || !Number.isFinite(offset) || Math.abs(offset-Math.round(offset)) > 1e-9) invalid();
  }
  return [...selection.points];
}
