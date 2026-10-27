import type { CasInput, CasResult } from "./cas";
/** One job, one worker, one isolated engine. Termination bounds synchronous CAS work. */
export function runCas(
  input: CasInput,
  signal: AbortSignal,
): Promise<CasResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Calcolo annullato.", "AbortError"));
      return;
    }
    const worker = new Worker(new URL("./cas.worker.ts", import.meta.url), {
      type: "module",
    });
    let timer: ReturnType<typeof setTimeout>,
      done = false,
      started = false;
    const finish = (result?: CasResult, error?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      worker.terminate();
      if (error) reject(error);
      else resolve(result!);
    };
    const cancel = () =>
      finish(undefined, new DOMException("Calcolo annullato.", "AbortError"));
    signal.addEventListener("abort", cancel, { once: true });
    timer = setTimeout(
      () =>
        finish(
          undefined,
          new Error("Il motore non si è caricato entro 15 secondi. Riprova."),
        ),
      15000,
    );
    worker.onerror = () =>
      finish(undefined, new Error("Impossibile avviare il motore. Riprova."));
    worker.onmessage = (event) => {
      if (event.data.ready && !started) {
        started = true;
        clearTimeout(timer);
        timer = setTimeout(
          () =>
            finish(
              undefined,
              new Error(
                "Calcolo interrotto dopo 2,5 secondi. Suddividi le espressioni.",
              ),
            ),
          2500,
        );
        worker.postMessage(input);
      } else if (started && event.data.error)
        finish(undefined, new Error(event.data.error));
      else if (started && event.data.result) finish(event.data.result);
    };
  });
}
