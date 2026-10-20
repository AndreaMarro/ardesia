// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { openPdf } from "../integrations/notebook/pdfDocument";
const dependencies = vi.hoisted(() => ({ getDocument:vi.fn(), create:vi.fn() }));
vi.mock("pdfjs-dist", () => ({
  getDocument:dependencies.getDocument,
  PDFWorker:{create:dependencies.create},
}));
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({default:"/worker-review.mjs"}));
function deferred<T=unknown>() {
  let resolve!: (value:T)=>void;
  let reject!: (error:Error)=>void;
  const promise = new Promise<T>((yes,no)=>{resolve=yes;reject=no;});
  return {promise,resolve,reject};
}
const ports: Array<WorkerPort> = [];
class WorkerPort extends EventTarget {
  terminate = vi.fn();
  constructor(_url: string, _options: object) {
    super(); ports.push(this);
  }
}
let pdfworker:{destroy:ReturnType<typeof vi.fn>};
let source:ReturnType<typeof deferred>;
let documentTask:{promise:Promise<unknown>;destroy:ReturnType<typeof vi.fn>};
beforeEach(()=>{
  ports.length=0;
  vi.useFakeTimers();
  vi.stubGlobal("Worker",WorkerPort);
  dependencies.getDocument.mockReset(); dependencies.create.mockReset();
  pdfworker={destroy:vi.fn()};
  source=deferred();
  documentTask={promise:source.promise,destroy:vi.fn(async()=>{})};
  dependencies.create.mockReturnValue(pdfworker);
  dependencies.getDocument.mockReturnValue(documentTask);
});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});

test("aborted before asynchronous imports resume creates no port",async()=>{
  const controller=new AbortController();
  const pending=openPdf(new ArrayBuffer(1),controller.signal);
  controller.abort();
  await expect(pending).rejects.toThrow();
  expect(ports).toHaveLength(0);
});

test("success uses one supplied port and repeated destroy terminates only once",async()=>{
  const task=await openPdf(new ArrayBuffer(1),new AbortController().signal);
  const pdf={numPages:1};
  source.resolve(pdf);
  expect(await task.promise).toBe(pdf);
  expect(dependencies.create).toHaveBeenCalledWith({port:ports[0]});
  expect(dependencies.getDocument.mock.calls[0][0].worker).toBe(pdfworker);
  const one=task.destroy(),two=task.destroy();
  expect(one).toBe(two);
  await one;
  expect(documentTask.destroy).toHaveBeenCalledOnce();
  expect(pdfworker.destroy).toHaveBeenCalledOnce();
  expect(ports[0].terminate).toHaveBeenCalledOnce();
});

test("failed startup rejects without awaiting hung cleanup and next attempt owns a fresh port",async()=>{
  documentTask.destroy.mockReturnValue(new Promise(()=>{}));
  const old=await openPdf(new ArrayBuffer(1),new AbortController().signal);
  const rejected=expect(old.promise).rejects.toThrow("pdf_worker_failed");
  ports[0].dispatchEvent(new Event("error"));
  expect((await old.failure).message).toBe("pdf_worker_failed");
  await rejected;
  const freshSource=deferred();
  const freshDestroy=vi.fn(async()=>{});
  dependencies.getDocument.mockReturnValue({promise:freshSource.promise,destroy:freshDestroy});
  const fresh=await openPdf(new ArrayBuffer(1),new AbortController().signal);
  expect(ports).toHaveLength(2);
  freshSource.resolve({numPages:1});
  await fresh.promise;
  await vi.advanceTimersByTimeAsync(1000);
  expect(ports[0].terminate).toHaveBeenCalledOnce();
  expect(ports[1].terminate).not.toHaveBeenCalled();
  await fresh.destroy();
});

test("abort during pending loading closes race and bounds port cleanup",async()=>{
  documentTask.destroy.mockReturnValue(new Promise(()=>{}));
  const controller=new AbortController();
  const task=await openPdf(new ArrayBuffer(1),controller.signal);
  const rejected=expect(task.promise).rejects.toThrow("pdf_closed");
  controller.abort();
  await rejected;
  await vi.advanceTimersByTimeAsync(1000);
  expect(ports[0].terminate).toHaveBeenCalledOnce();
});

test("late native port failure is observable after the document promise resolved",async()=>{
  const task=await openPdf(new ArrayBuffer(1),new AbortController().signal);
  source.resolve({numPages:1}); await task.promise;
  ports[0].dispatchEvent(new Event("messageerror"));
  expect((await task.failure).message).toBe("pdf_worker_failed");
  await task.destroy();
  expect(ports[0].terminate).toHaveBeenCalledOnce();
});

test("synchronous document setup failure destroys the wrapper and native port",async()=>{
  dependencies.getDocument.mockImplementation(()=>{throw new Error("invalid parameters");});
  await expect(openPdf(new ArrayBuffer(1),new AbortController().signal)).rejects.toThrow("invalid parameters");
  expect(pdfworker.destroy).toHaveBeenCalledOnce();
  expect(ports[0].terminate).toHaveBeenCalledOnce();
});
