import { expect, test } from "vitest";
import type { Edition } from "../api";
import { baseActivity, isTaylor } from "../course";

const edition: Edition = {
  id: "synthetic-course",
  teacherId: "teacher",
  capacity: 10,
  priceMinor: 0,
  state: "collecting",
  sessions: [],
  timezone: "Europe/Rome",
};

test.each([
  ["relazioni-fluidi-v1", "poiseuille-v1"],
  ["taylor-exp-v1", "taylor-exp-v1"],
])("only the known historical %s version retains its legacy binding", (packId, expected) => {
  expect(baseActivity({ ...edition, packId, packVersion: 1 })).toBe(expected);
  expect(baseActivity({ ...edition, packId, packVersion: 2 })).toBeNull();
  expect(baseActivity({ ...edition, packId })).toBeNull();
});

test("an unrelated physics course, missing binding and unknown pack never inherit Poiseuille", () => {
  expect(baseActivity(edition)).toBeNull();
  expect(baseActivity({ ...edition, packId: "mechanics-v1", packVersion: 1, subject: "fisica" })).toBeNull();
});

test("an explicit supported activity controls dispatch even when the pack name differs", () => {
  const next = { ...edition, packId: "approximation-v2", packVersion: 2, entryActivityId: "taylor-exp-v1" };
  expect(baseActivity(next)).toBe("taylor-exp-v1");
  expect(isTaylor(next)).toBe(true);
});

test.each([null, "future-lab-v1", ""])("an explicit unsupported activity %s never falls back to a legacy lab", entryActivityId => {
  const next = { ...edition, packId: "relazioni-fluidi-v1", packVersion: 1, entryActivityId };
  expect(baseActivity(next)).toBeNull();
  expect(isTaylor({ ...next, packId: "taylor-exp-v1" })).toBe(false);
});
