// @vitest-environment jsdom
import {afterEach, expect, test} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

afterEach(cleanup);
const result = {
  activityId: "kinematics-v1", version: 1,
  parameters: {positionX: 0, positionY: 0, velocityX: 3, velocityY: 4, accelerationX: 0, accelerationY: -2, time: 2, duration: 4},
  timeS: 2, positionXM: 6, positionYM: 4, velocityXMS: 3, velocityYMS: 0,
  accelerationXMS2: 0, accelerationYMS2: -2, speedMS: 3, displacementM: 7.21110255,
  samples: [
    {timeS: 0, positionXM: 0, positionYM: 0, velocityXMS: 3, velocityYMS: 4, accelerationXMS2: 0, accelerationYMS2: -2},
    {timeS: 2, positionXM: 6, positionYM: 4, velocityXMS: 3, velocityYMS: 0, accelerationXMS2: 0, accelerationYMS2: -2},
    {timeS: 4, positionXM: 12, positionYM: 0, velocityXMS: 3, velocityYMS: -4, accelerationXMS2: 0, accelerationYMS2: -2},
  ],
};

test("trajectory and linked x-v-a graphs require a revealed Core result", async () => {
  const {ScientificKinematicsModel} = await import("../components/ScientificKinematicsModel");
  const view = render(<ScientificKinematicsModel result={null} />);
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.queryByRole("table")).toBeNull();
  view.rerender(<ScientificKinematicsModel result={result} />);
  expect(screen.getByRole("img", {name: /traiettoria/i})).toBeTruthy();
  expect(screen.getAllByRole("img")).toHaveLength(1);
  expect(screen.getByText(/v = \(3; 0\) m\/s/)).toBeTruthy();
  expect(screen.getByText(/a = \(0; −2\) m\/s²/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", {name: "Posizione nel tempo"}));
  expect(screen.getByRole("img", {name: /posizione.*tempo/i})).toBeTruthy();
  fireEvent.click(screen.getByRole("button", {name: "Velocità nel tempo"}));
  expect(screen.getByRole("img", {name: /velocità.*tempo/i})).toBeTruthy();
  expect(screen.getByRole("table").textContent).toContain("m/s");
  fireEvent.click(screen.getByRole("button", {name: "Accelerazione nel tempo"}));
  expect(screen.getByRole("img", {name: /accelerazione.*tempo/i})).toBeTruthy();
  expect(screen.getByRole("table").textContent).toContain("m/s²");
  expect(screen.getAllByRole("img")).toHaveLength(1);
});

test("the renderer preserves supplied samples rather than deriving a second motion law", async () => {
  const {ScientificKinematicsModel} = await import("../components/ScientificKinematicsModel");
  const unusual = {...result, samples: result.samples.map(s => ({...s, positionXM: 99}))};
  render(<ScientificKinematicsModel result={unusual} />);
  expect(screen.getByRole("table").textContent).toContain("99");
  expect(screen.getByText(/spostamento.*distanza percorsa/i)).toBeTruthy();
});

test("stationary results and negative coordinates stay finite; external remount restores only supplied data", async () => {
  const {ScientificKinematicsModel} = await import("../components/ScientificKinematicsModel");
  const stationary = {...result, positionXM: -1, positionYM: -2, velocityXMS: 0, velocityYMS: 0, accelerationYMS2: 0,
    samples: result.samples.map(s => ({...s, positionXM: -1, positionYM: -2, velocityXMS: 0, velocityYMS: 0, accelerationYMS2: 0}))};
  const first = render(<ScientificKinematicsModel result={stationary} />);
  expect(first.container.innerHTML).not.toMatch(/NaN|Infinity/);
  const points = screen.getByTestId("kinematics-trajectory").getAttribute("points");
  first.unmount();
  render(<ScientificKinematicsModel result={JSON.parse(JSON.stringify(stationary))} />);
  expect(screen.getByTestId("kinematics-trajectory").getAttribute("points")).toBe(points);
});

test.each([{...result, version: 2}, {...result, samples: []}, {...result, velocityXMS: NaN},
  {...result, samples: [{...result.samples[0], positionXM: 1e308}]}])("corrupt motion cannot create invalid coordinates", async bad => {
  const {ScientificKinematicsModel} = await import("../components/ScientificKinematicsModel");
  render(<ScientificKinematicsModel result={bad} />);
  expect(screen.getByRole("status").textContent).toMatch(/non disponibili/i);
  expect(screen.queryByRole("img")).toBeNull();
});
