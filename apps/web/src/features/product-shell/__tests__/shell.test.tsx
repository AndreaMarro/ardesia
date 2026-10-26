// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

test("IME confirmation and composition arrows do not navigate away from the search", () => {
  const navigate = vi.fn();
  render(<Shell me={me} view="today" onView={navigate} onLogout={() => {}}>Contenuto</Shell>);
  fireEvent.click(screen.getByRole("button", { name: /Cerca nello spazio/ }));
  const search=screen.getByRole("searchbox");
  search.focus();
  fireEvent.compositionStart(search);
  fireEvent.keyDown(search, {key:"ArrowDown",isComposing:true});
  expect(document.activeElement).toBe(search);
  fireEvent.keyDown(search, {key:"Enter",keyCode:229,isComposing:true});
  fireEvent.compositionEnd(search);
  fireEvent.submit(screen.getByRole("search"));
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.keyDown(search, {key:"Enter"});
  fireEvent.submit(screen.getByRole("search"));
  expect(navigate).toHaveBeenCalledWith("today");
});

test("mounted-route availability controls both navigation and command results", () => {
  const navigate=vi.fn();
  render(<Shell me={me} view="today" enabledViews={["today", "independent-study"]} onView={navigate} onLogout={() => {}}>Contenuto</Shell>);
  const nav=screen.getByRole("navigation",{name:"Navigazione principale"});
  expect(within(nav).getAllByRole("button")).toHaveLength(2);
  expect(within(nav).queryByRole("button",{name:"Lezione"})).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:/Cerca nello spazio/}));
  fireEvent.change(screen.getByRole("searchbox"),{target:{value:"autonomo"}});
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button",{name:/Studio autonomo/}));
  expect(navigate).toHaveBeenCalledWith("independent-study");
});

test("an open command dialog contains focus and uses current routes after a destination disappears", async () => {
  const previousNavigate = vi.fn(), currentNavigate = vi.fn();
  const { rerender } = render(<Shell me={me} view="today" enabledViews={["today", "memory"]} onView={previousNavigate} onLogout={() => {}}>Contenuto</Shell>);
  fireEvent.click(screen.getByRole("button", { name: /Cerca nello spazio/ }));
  const dialog = screen.getByRole("dialog", { name: "Dove vuoi andare?" });
  const memory = within(dialog).getByRole("button", { name: /Memoria delle idee/ });
  memory.focus();
  expect(document.activeElement).toBe(memory);

  rerender(<Shell me={me} view="today" enabledViews={["today"]} onView={currentNavigate} onLogout={() => {}}>Contenuto</Shell>);
  expect(within(dialog).queryByRole("button", { name: /Memoria delle idee/ })).toBeNull();
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  const search = screen.getByRole("searchbox", { name: "Cerca una destinazione" });
  search.focus();
  fireEvent.keyDown(search, { key: "Enter" });
  fireEvent.submit(screen.getByRole("search"));
  expect(previousNavigate).not.toHaveBeenCalled();
  expect(currentNavigate).toHaveBeenCalledExactlyOnceWith("today");
});
