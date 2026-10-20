// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Shell } from "../components/Shell";
import { Public } from "../features/Public";
import { Courses } from "../features/Courses";
import { Work } from "../features/Work";
import type { Workspace } from "../api";

vi.mock("../features/Diary", () => ({ Diary: () => <h1>Diario</h1> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const me = { id: "student-01", role: "student" as const, synthetic: true as const };
const edition = {
  id: "edition-one", title: "Fisica: relazioni e fluidi", teacherId: "teacher",
  capacity: 10, priceMinor: 4900, state: "collecting", sessions: [], timezone: "Europe/Rome",
};
const data: Workspace = {
  edition, enrolled: true, resources: [], layouts: [], layoutSaved: true,
  layoutVersion: "a".repeat(64), submissions: [{
    id: "submission", student_id: me.id, activity_id: "poiseuille-v1", revision: 1,
    parent_id: null, text: "Il mio procedimento", asset_refs: [], source_refs: [],
    receipt_id: "receipt", state: "submitted", feedback: [{
      id: "feedback", text: "", state: "reviewed", stale: false, authorType: "teacher",
      submissionRevision: 1, review: { id: "review", text: "Controlla le unità.", decision: "revise", syntheticTutor: true },
    }],
  }],
};

test("public and private brand links retain the complete visible name", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(edition))));
  const publicView = render(<Public onLogin={() => {}} />);
  expect(within(screen.getByRole("banner")).getByRole("link", { name: "ardesia." })).toBeTruthy();
  await screen.findByText("Massimo 10 persone per edizione");
  publicView.unmount();
  render(<Shell me={me} view="today" onView={() => {}} onLogout={() => {}}>Contenuto</Shell>);
  expect(screen.getByRole("link", { name: "ardesia." })).toBeTruthy();
});

test("skip links target a main that can receive focus without joining the tab order", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(edition))));
  const publicView = render(<Public onLogin={() => {}} />);
  expect(screen.getByRole("main").getAttribute("tabindex")).toBe("-1");
  expect(screen.getByRole("link", { name: "Vai al contenuto" }).getAttribute("href")).toBe("#public-content");
  await screen.findByText("Massimo 10 persone per edizione");
  publicView.unmount();
  render(<Shell me={me} view="today" onView={() => {}} onLogout={() => {}}>Contenuto</Shell>);
  expect(screen.getByRole("main").getAttribute("tabindex")).toBe("-1");
  expect(screen.getByRole("link", { name: "Vai al contenuto" }).getAttribute("href")).toBe("#content");
});

test("two editions of the same course are articles rather than indistinguishable region landmarks", () => {
  const select = vi.fn();
  render(<Courses data={null} me={me} editions={[edition, { ...edition, id: "edition-two" }]}
    onEdition={select} onUpdate={async () => {}} onClassroom={() => {}} />);
  expect(screen.queryAllByRole("region", { name: edition.title })).toHaveLength(0);
  expect(screen.getAllByRole("article", { name: edition.title })).toHaveLength(2);
  fireEvent.click(screen.getAllByRole("button", { name: "Apri l’aula" })[1]);
  expect(select).toHaveBeenCalledWith("edition-two");
});

test("deliveries progress from the page heading to each attempt and then its feedback", () => {
  render(<Work me={me} data={data} onRetry={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "Consegne e feedback" }));
  expect(screen.getAllByRole("heading").map((heading) => [heading.tagName, heading.textContent])).toEqual([
    ["H1", "Le tue consegne."], ["H2", "Tentativo 1 · Laboratorio Fluidi"], ["H3", "Il tutor ha scritto"],
  ]);
});
