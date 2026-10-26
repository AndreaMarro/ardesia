import { calculate } from "./cas";
self.onmessage = (event) => {
  try {
    self.postMessage({ result: calculate(event.data) });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error ? error.message : "Calcolo non disponibile.",
    });
  }
};
self.postMessage({ ready: true });
