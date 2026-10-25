// @vitest-environment jsdom
import {afterEach, expect, test, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
const gate = vi.hoisted(() => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => {release = resolve;});
  return {ready, release};
});
vi.mock("../features/Classroom", async () => {await gate.ready; return vi.importActual("../features/Classroom");});
import App from "../App";
afterEach(() => {cleanup(); vi.unstubAllGlobals(); history.replaceState(null, "", "/");});

test("an authorized course can finish routing while its real Classroom module remains pending, then renders after that module resolves", async () => {
  history.replaceState(null, "", "/?edition=analysis-loading&view=classroom");
  const edition = {id: "analysis-loading", title: "Analisi loading probe", teacherId: "teacher", courseId: "analisi-1", packId: "taylor-exp-v1", packVersion: 1, packSha256: "a".repeat(64), subject: "analisi", state: "collecting", sessions: [], timezone: "Europe/Rome"};
  vi.stubGlobal("localStorage", {getItem: () => null, setItem: () => {}, removeItem: () => {}});
  vi.stubGlobal("fetch", vi.fn(async (path: string) => new Response(JSON.stringify(path.endsWith("/me") ? {id: "student-loading", role: "student", synthetic: true} : path.includes("/editions?") ? {items: [edition], nextCursor: null} : {edition, enrolled: true, resources: [], submissions: [], layouts: [], layoutSaved: false, layoutVersion: "b".repeat(64)}))));
  render(<App />);
  await screen.findByText("Analisi loading probe");
  await screen.findByText("Sto aprendo questa parte del tuo spazio…");
  expect(screen.queryByRole("heading", {name: "Quanto basta per approssimare?"})).toBeNull();
  expect(new URLSearchParams(location.search).get("view")).toBe("classroom");
  gate.release();
  await import("../features/Classroom");
  await screen.findByRole("heading", {name: "Quanto basta per approssimare?"});
});
