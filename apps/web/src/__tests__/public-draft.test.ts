// @vitest-environment jsdom
import {afterEach, beforeEach, expect, test, vi} from "vitest";
import {erasePublicDraft, readPublicDraft, savePublicDraft} from "../publicDraft";
import {publicSpring, publicSpringCase, publicSpringGraph} from "../publicPreview";
import {installPublicBrowserStorage} from "./public-storage-fixture";

beforeEach(installPublicBrowserStorage);
afterEach(() => {localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals();});
const key = "ardesia.public-demo.v1.spring";
const valid = {force: 4, stiffness: 20, prediction: "0,2", transfer: false};

test.each([
  "broken JSON", JSON.stringify({schemaVersion: 2, model: "spring", data: valid}),
  JSON.stringify({schemaVersion: 1, model: "hydrostatic", data: valid}),
  ...[{...valid, force: 4.1}, {...valid, stiffness: 0}, {...valid, prediction: "NaN"},
    {...valid, prediction: "-1"}, {...valid, prediction: "1".repeat(41)},
    {...valid, result: {value: 999}}].map(data => JSON.stringify({schemaVersion: 1, model: "spring", data})),
])("unsupported or corrupt local data is ignored: %s", raw => {
  localStorage.setItem(key, raw);
  expect(readPublicDraft("spring")).toBeNull();
});

test("local copies remain scoped by model and contain only a configuration and a prediction", () => {
  expect(savePublicDraft("spring", valid)).toBe("saved");
  expect(readPublicDraft("spring")).toEqual(valid);
  expect(readPublicDraft("hydrostatic")).toBeNull();
  expect(readPublicDraft("poiseuille")).toBeNull();
  const raw = localStorage.getItem(key)!;
  expect(raw).not.toMatch(/result|score|mastery|student|identity|receipt/);
  expect(erasePublicDraft("spring")).toBe(true);
  expect(readPublicDraft("spring")).toBeNull();
});

test("unavailable browser reads and removals fail safely", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {throw new Error("unavailable");});
  expect(readPublicDraft("spring")).toBeNull();
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {throw new Error("unavailable");});
  expect(erasePublicDraft("spring")).toBe(false);
});

test("the spring lookup never interpolates or extrapolates outside the 63 Core states", () => {
  expect(publicSpring.cases).toHaveLength(63);
  expect(publicSpringCase(6, 80).result.value).toBe(.075);
  for (const stiffness of [20, 40, 80]) expect(publicSpringGraph(stiffness)).toHaveLength(21);
  for (const [force, stiffness] of [[NaN, 20], [Infinity, 20], [-.5, 20], [10.5, 20], [4.1, 20], [4, 0], [4, 25]])
    expect(() => publicSpringCase(force, stiffness)).toThrow(/non disponibile/);
});
