import { afterEach, expect, test, vi } from "vitest";
import { runCas } from "./casClient";
import { initialInput } from "./worksheet";
class TestWorker {
  static instances: TestWorker[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() {
    TestWorker.instances.push(this);
  }
  receive(data: unknown) {
    this.onmessage?.({ data });
  }
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  TestWorker.instances = [];
});
test("cancellation and timeout terminate actual job ownership, including cold-load budget", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("Worker", TestWorker);
  const controller = new AbortController(),
    promise = runCas(initialInput, controller.signal);
  const worker = TestWorker.instances[0];
  worker.receive({ ready: true });
  expect(worker.postMessage).toHaveBeenCalledWith(initialInput);
  const rejected = expect(promise).rejects.toThrow("annullato");
  controller.abort();
  await rejected;
  expect(worker.terminate).toHaveBeenCalledTimes(1);
  const timeout = runCas(initialInput, new AbortController().signal),
    second = TestWorker.instances[1];
  second.receive({ ready: true });
  const timed = expect(timeout).rejects.toThrow("2,5");
  await vi.advanceTimersByTimeAsync(2500);
  await timed;
  expect(second.terminate).toHaveBeenCalledTimes(1);
  const cold = runCas(initialInput, new AbortController().signal),
    third = TestWorker.instances[2];
  const coldRejected = expect(cold).rejects.toThrow("15 secondi");
  await vi.advanceTimersByTimeAsync(15000);
  await coldRejected;
  expect(third.postMessage).not.toHaveBeenCalled();
  expect(third.terminate).toHaveBeenCalledTimes(1);
});
