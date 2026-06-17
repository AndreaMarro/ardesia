// Mock for `virtual:pwa-register` (vite-plugin-pwa virtual module).
// Tests don't run vite-plugin-pwa transform, so this stub satisfies dynamic
// import("virtual:pwa-register") in src/components/common/UpdatePrompt.jsx.
// Aliased in vitest.config.js resolve.alias.
export function registerSW(_options) {
  // Returns the SW updater function (caller can invoke to force update).
  return () => Promise.resolve();
}
