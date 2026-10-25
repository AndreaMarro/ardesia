// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Shell } from "../../../components/Shell";

afterEach(cleanup);
const me = { id: "student-synthetic", role: "student" as const, synthetic: true as const };
const edition = { id: "fluidi", title: "Relazioni e fluidi", teacherId: "teacher", capacity: 10, priceMinor: 4900, state: "collecting", sessions: [], timezone: "Europe/Rome" };

test("every existing destination including the lesson has a current navigation entry", () => {
  const navigate = vi.fn();
  render(<Shell me={me} view="classroom" onView={navigate} onLogout={() => {}}><h1>Lezione</h1></Shell>);
  const nav = screen.getByRole("navigation", { name: "Navigazione principale" });
  const lesson = within(nav).getByRole("button", { name: "Lezione" });
  expect(lesson.getAttribute("aria-current")).toBe("page");
  fireEvent.click(lesson);
  expect(navigate).toHaveBeenCalledWith("classroom");
  expect(within(nav).queryByRole("button", { name: "Da correggere" })).toBeNull();
});

test("command search finds a notebook alias, navigates, and clears on reopening", () => {
  const navigate = vi.fn();
  render(<Shell me={me} view="today" onView={navigate} onLogout={() => {}} editions={[edition]} editionId="fluidi"><h1>Oggi</h1></Shell>);
  fireEvent.click(screen.getByRole("button", { name: /Cerca nello spazio/ }));
  fireEvent.change(screen.getByRole("searchbox", { name: "Cerca una destinazione" }), { target: { value: "quaderno" } });
  const dialog = screen.getByRole("dialog", { name: "Dove vuoi andare?" });
  fireEvent.click(within(dialog).getByRole("button", { name: /Il mio lavoro/ }));
  expect(navigate).toHaveBeenCalledWith("work");
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Cerca nello spazio/ }));
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
});

test("command search exposes only permitted destinations and supports a no-result recovery", () => {
  render(<Shell me={me} view="today" onView={() => {}} onLogout={() => {}}><h1>Oggi</h1></Shell>);
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  const search = screen.getByRole("searchbox", { name: "Cerca una destinazione" });
  fireEvent.change(search, { target: { value: "correggere" } });
  expect(screen.getByRole("status").textContent).toContain("Nessuna destinazione");
  fireEvent.click(screen.getByRole("button", { name: "Mostra tutte le destinazioni" }));
  expect(screen.getByRole("dialog").textContent).not.toContain("Da correggere");
  expect((search as HTMLInputElement).value).toBe("");
});

test("search selects only an edition supplied by the existing API projection", () => {
  const select = vi.fn();
  render(<Shell me={me} view="today" onView={() => {}} onLogout={() => {}} editions={[edition]} editionId="fluidi" onEdition={select}><h1>Oggi</h1></Shell>);
  fireEvent.click(screen.getByRole("button", { name: /Cerca nello spazio/ }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "fluidi" } });
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /Relazioni e fluidi/ }));
  expect(select).toHaveBeenCalledWith("fluidi");
});
