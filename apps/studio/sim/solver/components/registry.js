/**
 * ELAB Simulator — Component Registry
 * Registro modulare: type → componente React SVG
 * Per aggiungere un componente: importalo e registralo con registerComponent()
 * © Andrea Marro — 10/02/2026
 */

const registry = new Map();

/**
 * Registra un componente nel simulatore
 * @param {string} type - ID tipo (es. "led", "resistor", "battery9v")
 * @param {object} config - { component, pins, defaultState, category, label, icon }
 */
export function registerComponent(type, config) {
  registry.set(type, {
    type,
    component: config.component,
    pins: config.pins || [],
    defaultState: config.defaultState || {},
    category: config.category || 'passive',
    label: config.label || type,
    icon: config.icon || '',
    ...config
  });
}

/**
 * Ottieni un componente registrato per tipo
 * @param {string} type
 * @returns {object|null}
 */
export function getComponent(type) {
  return registry.get(type) || null;
}

/**
 * Ottieni tutti i componenti registrati
 * @returns {Map}
 */
export function getAllComponents() {
  return registry;
}

/**
 * Ottieni componenti filtrati per categoria
 * @param {string} category - 'input' | 'output' | 'passive' | 'power' | 'board' | 'wire'
 * @returns {Array}
 */
export function getComponentsByCategory(category) {
  return Array.from(registry.values()).filter(c => c.category === category);
}

/**
 * Get components available for a specific volume (cumulative).
 * Vol.1 = components with volumeAvailableFrom <= 1
 * Vol.2 = components with volumeAvailableFrom <= 2
 * Vol.3 = all components
 * @param {number} volumeNumber — 1, 2, or 3
 * @returns {Array}
 */
export function getComponentsByVolume(volumeNumber) {
  return Array.from(registry.values()).filter(
    c => (c.volumeAvailableFrom || 1) <= volumeNumber
  );
}

/**
 * Crea stato iniziale per un componente
 * @param {string} type
 * @returns {object}
 */
export function createDefaultState(type) {
  const comp = registry.get(type);
  return comp ? { ...comp.defaultState } : {};
}

/**
 * Ottieni le definizioni pin per un componente
 * @param {string} type
 * @returns {Array}
 */
export function getPinDefinitions(type) {
  const comp = registry.get(type);
  return comp ? [...comp.pins] : [];
}

export default registry;
