// An installed module receives numerical inputs and a drawing surface. Learner records contain only its identity.
const builtins = {
  meccanica: 'calibro campione vettori binario volo caduta cerchio forze coppia piano molla gravita percorso urto leva',
  fluidi: 'fasi strati vasca manometro pressa galleggia condotto profilo rete film goccia capillare',
  termica: 'pistone termometro calorimetro fase barra convezione radiazione ciclo motore microstati',
  campi: 'cariche piastre dipoli filo circuito condensatori bussola lorentz spira',
  onde: 'oscillatore onda onde2 sorgente doppler em assorbitore fotone nucleo decadimento ottica',
};
const groups = new Map(Object.entries(builtins).flatMap(([family, ids]) => ids.split(' ').map(id => [id, family])));
const builtinCourses = new Set(['C1', 'C2', 'C3', 'C4', 'C5', 'C6']);

export async function resolveEngine(record, load = (path) => import(path)) {
  if (record.engine) {
    const ref = record.engine, manifest = record.engineSpec;
    if (!manifest || manifest.apiVersion !== '1.0.0' || manifest.id !== ref.id || manifest.version !== ref.version ||
        !/^[a-z][a-z0-9-]{0,47}$/.test(ref.id) || !/^\d+\.\d+\.\d+$/.test(ref.version) ||
        !/^[a-f0-9]{64}$/.test(manifest.sha256)) throw Error('Contratto del motore non valido.');
    const module = await load('/api/v1/engines/' + ref.id + '/' + ref.version + '/' + manifest.sha256 + '.js');
    if (typeof module.measure !== 'function' || typeof module.draw !== 'function') throw Error('Motore incompleto.');
    if (!Array.isArray(manifest.checkpoints) || manifest.checkpoints.length < 3) throw Error('Griglia di verifica assente.');
    for (const [x, expected] of [...manifest.references, ...record.references, ...manifest.checkpoints]) {
      const actual = module.measure(x);
      if (!Number.isFinite(actual) || Math.abs(actual - expected) > 1e-12 + 1e-9 * Math.abs(expected))
        throw Error('La misura del motore non coincide con il riferimento indipendente.');
    }
    return {law: {measure: module.measure, observe: manifest.observe, apparatus: (x, y) => ({x, y})},
      instrument: module.draw, legend: manifest.legend};
  }
  const family = groups.get(record.apparatus);
  if (!builtinCourses.has(record.course) || !family) throw Error('Modello della voce non disponibile.');
  const [{experiments}, mod] = await Promise.all([
    import('./modelli/' + record.course + '.js'), import('./apparati/' + family + '.js'),
  ]);
  const law = experiments[record.id], instrument = mod[family === 'onde' ? 'ondulatoria' : family][record.apparatus];
  if (!law || !instrument) throw Error('Modello della voce non disponibile.');
  return {law, instrument};
}
