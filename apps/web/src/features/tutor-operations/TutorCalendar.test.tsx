// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import TutorCalendar from "./TutorCalendar";
import { edition } from "../../__tests__/register-fixtures";

const dates = [
  { start: "2026-10-25T00:30:00Z", end: "2026-10-25T00:55:00Z" },
  { start: "2026-10-25T01:30:00Z", end: "2026-10-25T01:55:00Z" },
];
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("real calendar keeps history, filters owner/cancelled and shows both Rome offsets", async () => {
  render(<TutorCalendar tutorId="tutor" editions={[
    { ...edition, sessions: dates },
    { ...edition, id: "foreign", title: "Privato altrui", teacherId: "other", sessions: dates },
    { ...edition, id: "cancelled", title: "Cancellato", state: "cancelled", sessions: dates },
  ]} />);
  await screen.findByRole("button", { name: "Mese" });
  expect(screen.queryByText(/Privato altrui|Cancellato/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Lista" }));
  const first = await screen.findByText("Fluidi · 1"), second = await screen.findByText("Fluidi · 2");
  expect(first.closest(".tutor-calendar-event")?.getAttribute("tabindex")).toBe("0");
  fireEvent.click(first);
  expect(screen.getByText(/GMT\+2.*GMT\+2/)).toBeTruthy();
  fireEvent.click(second);
  expect(screen.getByText(/GMT\+1.*GMT\+1/)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Apri questa edizione" }).getAttribute("href")).toBe("?view=courses&edition=fluidi");
});

test("filter and refreshed source remove selected stale appointment", async () => {
  const source = [{ ...edition, sessions: dates }, { ...edition, id: "next", title: "Altra edizione", sessions: dates }];
  const view = render(<TutorCalendar tutorId="tutor" editions={source} />);
  fireEvent.click(screen.getByRole("button", { name: "Lista" }));
  fireEvent.click(await screen.findByText("Fluidi · 1 · sovrapposto"));
  fireEvent.change(screen.getByLabelText("Edizioni nel calendario"), { target: { value: "next" } });
  await waitFor(() => expect(screen.queryByRole("link", { name: "Apri questa edizione" })).toBeNull());
  expect(screen.queryByText("Fluidi · 1 · sovrapposto")).toBeNull();
  fireEvent.click(await screen.findByText("Altra edizione · 1 · sovrapposto"));
  view.rerender(<TutorCalendar tutorId="tutor" editions={[]} />);
  await waitFor(() => expect(screen.queryByRole("link", { name: "Apri questa edizione" })).toBeNull());
  expect(screen.getByText("Nessun incontro nelle edizioni selezionate.")).toBeTruthy();
});
