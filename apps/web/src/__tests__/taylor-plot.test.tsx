// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TaylorLab } from "../components/TaylorLab";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function canonical(degree = 3) {
  const values = degree === 0 ? [1, 1, 1] : [1 / 3, 1, 8 / 3];
  return {
    value: degree === 0 ? 1 : 79 / 48, x: .5, degree, terms: degree + 1,
    remainderBound: degree === 0 ? 1.5 : 1 / 128,
    referenceValue: 1.6487212707001282,
    absoluteError: degree === 0 ? .6487212707001282 : .0028879373667949,
    domain: "Exp reale, centro 0, −1 ≤ x ≤ 1, grado 0–12.", scientificApproval: "NOT_RUN",
    plot: { schemaVersion: 1, domain: [-1, 1], samples: [-1, 0, 1].map((x, index) => ({
      x, value: values[index], referenceValue: [.36787944117144233, 1, 2.718281828459045][index],
      absoluteError: Math.abs([.36787944117144233, 1, 2.718281828459045][index] - values[index]),
      remainderBound: degree === 0 ? [1, 0, 3][index] : [1 / 24, 0, 1 / 8][index],
    })) },
  };
}
function predict() {
  fireEvent.change(screen.getByLabelText("La tua previsione e il controllo del resto"), { target: { value: "Mi aspetto una curva più vicina aumentando il grado; controllo il maggiorante." } });
}
function compare() { fireEvent.click(screen.getByRole("button", { name: "Registra la previsione e confronta" })); }
function fetchResult(value: unknown) { return vi.fn(async () => new Response(JSON.stringify(value))); }

test("no comparison before a prediction; the graph uses canonical samples and degree controls invalidate it", async () => {
  const fetch = fetchResult(canonical()); vi.stubGlobal("fetch", fetch);
  const onCommit = vi.fn(); render(<TaylorLab onCommit={onCommit} />);
  expect(screen.queryByRole("img")).toBeNull();
  compare(); expect(fetch).not.toHaveBeenCalled();
  predict(); compare();
  const graph = await screen.findByRole("img", { name: /Curva di exp e polinomio di grado 3/ });
  const polynomial = graph.querySelector('[data-series="polynomial"]')!;
  expect(polynomial.getAttribute("d")).toContain("L");
  expect(graph.querySelector('[data-series="bound"]')).not.toBeNull();
  expect(screen.getByText(/Scarto numerico rispetto a exp del Core/)).toBeTruthy();
  expect(onCommit).toHaveBeenLastCalledWith(expect.objectContaining({ parameters: { x: .5, degree: 3 } }));
  fireEvent.click(screen.getByRole("button", { name: "Grado successivo" }));
  expect(screen.getByLabelText("Grado del polinomio")).toHaveProperty("value", "4");
  expect(screen.queryByRole("img")).toBeNull();
  expect(onCommit).toHaveBeenLastCalledWith(null);
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("degree zero has a horizontal canonical polynomial; it changes after a new prediction and degree", async () => {
  const fetch = fetchResult(canonical(0)); vi.stubGlobal("fetch", fetch);
  render(<TaylorLab onCommit={vi.fn()} />); predict();
  fireEvent.change(screen.getByLabelText("Grado del polinomio"), { target: { value: "0" } }); compare();
  const first = await screen.findByRole("img", { name: /polinomio di grado 0/ });
  const firstPath = first.querySelector('[data-series="polynomial"]')!.getAttribute("d");
  expect(screen.getByRole("button", { name: "Grado precedente" })).toHaveProperty("disabled", true);
  fetch.mockImplementation(fetchResult(canonical()));
  fireEvent.change(screen.getByLabelText("Grado del polinomio"), { target: { value: "3" } }); compare();
  const next = await screen.findByRole("img", { name: /polinomio di grado 3/ });
  expect(next.querySelector('[data-series="polynomial"]')!.getAttribute("d")).not.toBe(firstPath);
});

test("a legacy numeric result remains committable with an explicit unavailable graph", async () => {
  const { plot: _plot, x: _x, referenceValue: _reference, absoluteError: _error, ...legacy } = canonical();
  vi.stubGlobal("fetch", fetchResult(legacy)); const commit = vi.fn();
  render(<TaylorLab onCommit={commit} />); predict(); compare();
  await screen.findByText(/Maggiorante conservativo/);
  expect(screen.getByText(/Grafico non disponibile/)).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
  expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({ activityId: "taylor-exp-v1" }));
});

test.each(["nonfinite", "unordered", "oversized", "degree", "request-x", "missing-request-x", "range-overflow"])("rejects malformed %s canonical data without inventing a curve", async (kind) => {
  const value = canonical();
  if (kind === "nonfinite") value.plot.samples[0].remainderBound = 1e309;
  if (kind === "unordered") value.plot.samples.reverse();
  if (kind === "oversized") value.plot.samples = Array.from({ length: 42 }, () => value.plot.samples[0]);
  if (kind === "degree") value.degree = 8;
  if (kind === "request-x") value.x = -.5;
  if (kind === "missing-request-x") delete (value as Partial<typeof value>).x;
  if (kind === "range-overflow") { value.plot.samples[0].value = -1e308; value.plot.samples[2].value = 1e308; }
  vi.stubGlobal("fetch", fetchResult(value)); const commit = vi.fn();
  render(<TaylorLab onCommit={commit} />); predict(); compare();
  await screen.findByRole("alert");
  expect(screen.queryByRole("img")).toBeNull();
  expect(commit.mock.calls.every(([item]) => item === null)).toBe(true);
});

test("invalid inputs do not call; a response for edited inputs never restores a stale curve or commit", async () => {
  let resolve!: (value: Response) => void;
  const fetch = vi.fn(() => new Promise<Response>((done) => { resolve = done; })); vi.stubGlobal("fetch", fetch);
  const commit = vi.fn(); render(<TaylorLab onCommit={commit} />); predict();
  fireEvent.change(screen.getByLabelText("Argomento x"), { target: { value: "2" } }); compare();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Argomento x"), { target: { value: ".5" } }); compare();
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText("Argomento x"), { target: { value: "-.5" } });
  await act(async () => { resolve(new Response(JSON.stringify(canonical()))); });
  expect(screen.queryByRole("img")).toBeNull();
  expect(commit.mock.calls.every(([item]) => item === null)).toBe(true);
});

test("a failed comparison preserves the prediction and a retry can render canonical data", async () => {
  const fetch = vi.fn(async () => new Response(JSON.stringify({ error: "unavailable" }), { status: 503 }));
  vi.stubGlobal("fetch", fetch); const commit = vi.fn();
  render(<TaylorLab onCommit={commit} />); predict();
  const prediction = screen.getByLabelText("La tua previsione e il controllo del resto") as HTMLTextAreaElement;
  const original = prediction.value;
  compare(); await screen.findByRole("alert");
  expect(prediction.value).toBe(original);
  expect(screen.queryByRole("img")).toBeNull();
  expect(commit.mock.calls.every(([item]) => item === null)).toBe(true);
  fetch.mockImplementation(fetchResult(canonical())); compare();
  await screen.findByRole("img", { name: /polinomio di grado 3/ });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(commit).toHaveBeenLastCalledWith(expect.objectContaining({ parameters: { x: .5, degree: 3 } }));
});
