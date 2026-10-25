// @vitest-environment jsdom
import {afterEach, expect, test} from "vitest";
import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";

afterEach(cleanup);

// Hand-checked fixtures deliberately include nonphysical graph points: the view
// must plot supplied Core values, never run its own Ohm/wave calculation.
const electrical = {
  activityId: "dc-resistance-v1", version: 1,
  parameters: {voltage: 12, resistance1: 4, resistance2: 8, topology: "series" as const},
  currentA: 1, equivalentResistanceOhm: 12, totalPowerW: 12,
  branches: [
    {id: "R1", resistanceOhm: 4, currentA: 1, voltageV: 4, powerW: 4},
    {id: "R2", resistanceOhm: 8, currentA: 1, voltageV: 8, powerW: 8},
  ],
  ivSamples: [{voltageV: 0, currentA: 0, totalPowerW: 0}, {voltageV: 12, currentA: .75, totalPowerW: 9}],
};
const wave = {
  activityId: "harmonic-wave-v1", version: 1,
  parameters: {speed: 4, frequency: 2, amplitude: .1, time: 0, phase: 0},
  wavelengthM: 2, periodS: .5, probeDisplacementM: .025,
  spatialSamples: [{xM: 0, displacementM: .025}, {xM: .5, displacementM: .08}, {xM: 1, displacementM: -.025}],
  temporalSamples: [{timeS: 0, displacementM: .025}, {timeS: .125, displacementM: -.08}, {timeS: .25, displacementM: -.025}],
};

test("unrevealed models expose no calculated values, samples or solution graphics", async () => {
  const {ScientificElectricalModel} = await import("../components/ScientificElectricalModel");
  const {ScientificWaveModel} = await import("../components/ScientificWaveModel");
  render(<><ScientificElectricalModel result={null} /><ScientificWaveModel result={null} /></>);
  expect(screen.queryAllByRole("img")).toHaveLength(0);
  expect(screen.queryAllByRole("table")).toHaveLength(0);
  expect(screen.queryByText("12 W")).toBeNull();
  expect(screen.getAllByText(/previsione/i)).toHaveLength(2);
});

test("circuit drawing, branches and both linked graphs render supplied values with SI units", async () => {
  const {ScientificElectricalModel} = await import("../components/ScientificElectricalModel");
  const view = render(<ScientificElectricalModel result={electrical} />);
  expect(screen.getByRole("img", {name: /circuito.*serie/i})).toBeTruthy();
  expect(screen.getByRole("img", {name: /corrente.*tensione/i})).toBeTruthy();
  expect(screen.getByRole("img", {name: /potenza.*tensione/i})).toBeTruthy();
  const table = screen.getByRole("table", {name: /resistori/i});
  expect(within(table).getAllByRole("row")).toHaveLength(3);
  expect(table.textContent).toContain("R2");
  expect(table.textContent).toContain("Ω");
  expect(screen.getByTestId("electrical-iv-curve").getAttribute("points")).toContain("430,40");
  expect(screen.getByTestId("electrical-power-curve").getAttribute("points")).toContain("430,40");
  // A JSON resource and an external remount preserve values, with no view storage.
  view.unmount(); render(<ScientificElectricalModel result={JSON.parse(JSON.stringify(electrical))} />);
  expect(screen.getByRole("table", {name: /resistori/i}).textContent).toBe(table.textContent);
});

test("wave view distinguishes space from time and never recomputes supplied displacements", async () => {
  const {ScientificWaveModel} = await import("../components/ScientificWaveModel");
  const view = render(<ScientificWaveModel result={wave} />);
  expect(screen.getByRole("img", {name: /profilo spaziale/i})).toBeTruthy();
  expect(screen.getByRole("img", {name: /punto.*tempo/i})).toBeTruthy();
  expect(screen.getByText(/verso \+x/i)).toBeTruthy();
  expect(screen.getByText(/0,025 m/)).toBeTruthy();
  expect(screen.getByRole("table", {name: /campioni spaziali/i}).textContent).toContain("0,08");
  expect(screen.getByRole("table", {name: /campioni temporali/i}).textContent).toContain("−0,08");
  const before = screen.getByTestId("wave-spatial-curve").getAttribute("points");
  fireEvent.click(screen.getByText("Valori del profilo e del punto"));
  expect(screen.getByTestId("wave-spatial-curve").getAttribute("points")).toBe(before);
  view.rerender(<ScientificWaveModel result={null} />);
  expect(screen.queryByRole("table")).toBeNull();
  expect(screen.queryByTestId("wave-spatial-curve")).toBeNull();
});

test("zero voltage and zero amplitude have finite SVG coordinates and textual alternatives", async () => {
  const {ScientificElectricalModel} = await import("../components/ScientificElectricalModel");
  const {ScientificWaveModel} = await import("../components/ScientificWaveModel");
  const zeroCircuit = {...electrical, parameters: {...electrical.parameters, voltage: 0}, currentA: 0, totalPowerW: 0,
    ivSamples: [{voltageV: 0, currentA: 0, totalPowerW: 0}, {voltageV: 0, currentA: 0, totalPowerW: 0}]};
  const flat = {...wave, parameters: {...wave.parameters, amplitude: 0}, probeDisplacementM: 0,
    spatialSamples: [{xM: 0, displacementM: 0}, {xM: 1, displacementM: 0}]};
  const {container} = render(<><ScientificElectricalModel result={zeroCircuit} /><ScientificWaveModel result={flat} /></>);
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(screen.getAllByRole("table")).toHaveLength(4);
  expect(screen.getByText(/ampiezza nulla/i)).toBeTruthy();
});

test.each([
  {activityId: "dc-resistance-v1", version: 99},
  {...electrical, ivSamples: []}, {...electrical, branches: []},
  {...electrical, currentA: Number.NaN}, {...electrical, ivSamples: [{voltageV: 0, currentA: Infinity, totalPowerW: 0}]},
  {...electrical, ivSamples: [{voltageV: -1e308, currentA: -1e308, totalPowerW: 0}, {voltageV: 1e308, currentA: 1e308, totalPowerW: 1e308}]},
])("corrupt or incompatible circuit data leave a readable fallback without executing a substitute model", async bad => {
  const {ScientificElectricalModel} = await import("../components/ScientificElectricalModel");
  render(<ScientificElectricalModel result={bad as typeof electrical} />);
  expect(screen.getByRole("status").textContent).toMatch(/non disponibili/i);
  expect(screen.queryByRole("img")).toBeNull();
});

test.each([
  {...wave, version: 2}, {...wave, spatialSamples: []}, {...wave, temporalSamples: []},
  {...wave, wavelengthM: 0}, {...wave, probeDisplacementM: Infinity},
  {...wave, spatialSamples: [{xM: 0, displacementM: NaN}]},
  {...wave, spatialSamples: [{xM: -1e308, displacementM: 0}, {xM: 1e308, displacementM: 0}]},
])("corrupt wave samples and unknown versions have a readable fallback", async bad => {
  const {ScientificWaveModel} = await import("../components/ScientificWaveModel");
  render(<ScientificWaveModel result={bad} />);
  expect(screen.getByRole("status").textContent).toMatch(/non disponibili/i);
  expect(screen.queryByRole("img")).toBeNull();
});
