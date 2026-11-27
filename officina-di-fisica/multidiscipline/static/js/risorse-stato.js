// Public case links contain model state only, never notebook notes or identity.
export const CASE_SCHEMA = 'cric.resource-case/1';

export function encodeCase(value) {
  const clean = {
    schema: value.schema,
    resource: { id: value.resource.id, version: value.resource.version, sha256: value.resource.sha256 },
    model: { id: value.model.id, sha256: value.model.sha256 },
    parameters: { ...value.parameters }, time: value.time, view: value.view,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  if (bytes.length > 4096) throw Error('Questo caso è troppo grande per un collegamento.');
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeCase(token) {
  if (typeof token !== 'string' || token.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(token))
    throw Error('Il collegamento al caso non è valido.');
  try {
    const raw = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const result = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(raw, c => c.charCodeAt(0))));
    if (result?.schema !== CASE_SCHEMA || !result.resource || !result.model || !result.parameters)
      throw Error();
    return result;
  } catch {
    throw Error('Il collegamento al caso non è valido o usa una versione non supportata.');
  }
}

export function caseRoute(value) {
  return 'strumento/' + encodeURIComponent(value.resource.id) + '/' + encodeCase(value);
}

export function caseFromState(spec, current) {
  return {
    schema: CASE_SCHEMA,
    resource: { id: spec.resource.id, version: spec.resource.version, sha256: spec.resource.sha256 },
    model: { ...spec.model }, parameters: { ...current.parameters },
    time: current.time, view: current.view,
  };
}
