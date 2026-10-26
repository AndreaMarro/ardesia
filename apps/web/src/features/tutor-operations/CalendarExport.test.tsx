// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CalendarExport } from "./CalendarExport";
import { json } from "../../__tests__/register-fixtures";
import { download } from "./model";
vi.mock("./model", async () => ({ ...await vi.importActual<typeof import("./model")>("./model"), download: vi.fn() }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
const preview = () => ({ previewId: "a".repeat(32), previewHash: "b".repeat(64), sourceVersion: "c".repeat(64),
  plan: { editionId: "fluidi", provider: "ics", timezone: "Europe/Rome", sessions: [1, 2, 3, 4].map((ordinal) => ({
    sessionId: String(ordinal).repeat(32), startUtc: `2026-11-0${ordinal}T17:00:00Z`, endUtc: `2026-11-0${ordinal}T18:30:00Z`,
  })) } });
const published = () => ({ state: "published", provider: "ics", previewId: preview().previewId, sourceVersion: preview().sourceVersion });
test("calendar requires a visible preview before confirmation and uses the real blob endpoint", async () => {
  const fetcher = vi.fn(async (path: string) => path.includes("/ics?") ? new Response("BEGIN:VCALENDAR\r\nEND:VCALENDAR", { headers: { "Content-Type": "text/calendar" } }) : json(path.endsWith("/preview") ? preview() : published()));
  vi.stubGlobal("fetch", fetcher);
  render(<CalendarExport editionId="fluidi" ready />);
  fireEvent.click(screen.getByRole("button", { name: "Prepara calendario .ics" }));
  await screen.findByRole("region", { name: "Anteprima calendario" });
  expect(screen.getAllByRole("listitem")[0].textContent).toMatch(/2026.*18:00.*(?:GMT|UTC)\+1.*19:30/);
  expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Conferma e scarica .ics" }));
  await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
  expect(fetcher.mock.calls.map(([path]) => path)).toEqual(["/study/calendar/preview", "/study/calendar/confirm", "/study/calendar/ics?editionId=fluidi&previewId=" + "a".repeat(32)]);
});
test("lost confirmation ACK retries the identical key rather than publishing a second intent", async () => {
  let confirmations = 0;
  const fetcher = vi.fn(async (path: string) => {
    if (path.endsWith("/preview")) return json(preview());
    if (path.endsWith("/confirm") && ++confirmations === 1) throw TypeError("Failed to fetch");
    return path.includes("/ics?") ? new Response("BEGIN:VCALENDAR", { headers: { "Content-Type": "text/calendar" } }) : json(published());
  });
  vi.stubGlobal("fetch", fetcher); render(<CalendarExport editionId="fluidi" ready />);
  fireEvent.click(screen.getByRole("button", { name: "Prepara calendario .ics" }));
  fireEvent.click(await screen.findByRole("button", { name: "Conferma e scarica .ics" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Conferma e scarica .ics" }));
  await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
  const calls = fetcher.mock.calls as unknown as [string, RequestInit][];
  const confirm = calls.filter(([path]) => path.endsWith("/confirm"));
  expect(new Headers(confirm[0][1].headers).get("Idempotency-Key")).toBe(new Headers(confirm[1][1].headers).get("Idempotency-Key"));
  expect(confirm[0][1].body).toBe(confirm[1][1].body);
});
test("foreign edition or invalid calendar response cannot be confirmed", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => json({ ...preview(), plan: { ...preview().plan, editionId: "another" } })));
  render(<CalendarExport editionId="fluidi" ready />);
  fireEvent.click(screen.getByRole("button", { name: "Prepara calendario .ics" }));
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Conferma e scarica .ics" })).toBeNull();
});
test("forbidden confirmation removes the formerly authorized date preview", async () => {
  vi.stubGlobal("fetch", vi.fn(async (path: string) => path.endsWith("/preview") ? json(preview()) : json({ error: "forbidden" }, 403)));
  render(<CalendarExport editionId="fluidi" ready />);
  fireEvent.click(screen.getByRole("button", { name: "Prepara calendario .ics" }));
  fireEvent.click(await screen.findByRole("button", { name: "Conferma e scarica .ics" }));
  await screen.findByRole("alert");
  expect(screen.queryByRole("region", { name: "Anteprima calendario" })).toBeNull();
  expect(download).not.toHaveBeenCalled();
});
test("a confirmation for another source is not treated as a completed calendar", async () => {
  const fetcher = vi.fn(async (path: string) => json(path.endsWith("/preview") ? preview() : { ...published(), sourceVersion: "d".repeat(64) }));
  vi.stubGlobal("fetch", fetcher); render(<CalendarExport editionId="fluidi" ready />);
  fireEvent.click(screen.getByRole("button", { name: "Prepara calendario .ics" }));
  fireEvent.click(await screen.findByRole("button", { name: "Conferma e scarica .ics" }));
  await screen.findByRole("alert");
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(download).not.toHaveBeenCalled();
});
