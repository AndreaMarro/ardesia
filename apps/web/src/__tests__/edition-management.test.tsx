// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Courses } from "../features/Courses";
import { EditionManager } from "../components/EditionManager";
import type { AdminEdition, OfferPreview } from "../editionAdmin";
const teacher = { id: "tutor", role: "teacher" as const, synthetic: true as const };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const dates = [3, 5, 10, 12].map((day) => ({ localStart: `2026-11-${String(day).padStart(2, "0")}T18:00` }));
const edition = (id = "edition"): AdminEdition => ({ id, teacherId: "tutor", capacity: 10, priceMinor: 4900,
  state: "draft", sessions: [], timezone: "Europe/Rome", managementRevision: 0, starts: [],
  legacyUnversionedOffer: false, paymentMode: "test", scientificApproval: "NOT_ATTESTED", title: id,
  courseId: "analisi-1", packId: "taylor-exp-v1", packVersion: 1, packSha256: "a".repeat(64) });
const configured = (id = "edition"): AdminEdition => ({ ...edition(id), managementRevision: 1, starts: dates,
  sessions: dates.map(({ localStart }) => ({ start: localStart + ":00+01:00", end: localStart.replace("18:00", "19:30") + ":00+01:00" })) });
const preview: OfferPreview = { previewId: "a".repeat(32), previewHash: "b".repeat(64), expectedRevision: 1,
  expiresAt: 1000, offer: { ...configured(), editorialStatus: "DRAFT", scope: "Proposta originale da rivedere." } };
function fillDates() {
  dates.forEach((item, index) => fireEvent.change(screen.getByLabelText(`Incontro ${index + 1} · inizio`), { target: { value: item.localStart } }));
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

test("an empty tutor workspace creates a private draft, preserving fields and key after a failed request", async () => {
  const changed = vi.fn(); let attempts = 0;
  const fetcher = vi.fn(async (path: string, _init?: RequestInit) => path.endsWith("coursepacks") ? json({ items: [{ packId: "taylor-exp-v1", packVersion: 1, title: "Taylor", editorialStatus: "DRAFT", scope: "Originale da rivedere" }] }) : ++attempts === 1 ? json({ error: "server_busy" }, 503) : json({ edition: edition("new-owned") }));
  vi.stubGlobal("fetch", fetcher);
  render(<Courses me={teacher} data={null} editions={[]} onUpdate={async () => {}} onClassroom={() => {}} onManaged={changed} />);
  fireEvent.click(screen.getByRole("button", { name: "Nuova edizione" }));
  await screen.findByRole("option", { name: "Taylor · DRAFT" });
  const form = screen.getByRole("form", { name: "Crea un’edizione" });
  fireEvent.change(within(form).getByLabelText("Posti (massimo 10)"), { target: { value: "8" } });
  fireEvent.change(within(form).getByLabelText("Prezzo indicativo"), { target: { value: "3900" } });
  fireEvent.submit(form);
  await screen.findByRole("alert");
  expect((within(form).getByLabelText("Posti (massimo 10)") as HTMLInputElement).value).toBe("8");
  expect(changed).not.toHaveBeenCalled();
  fireEvent.submit(form);
  await waitFor(() => expect(changed).toHaveBeenCalledWith("new-owned"));
  const calls = fetcher.mock.calls.filter(([path]) => path === "/study/admin/editions");
  expect(calls).toHaveLength(2);
  expect(calls[0][1]?.headers).toEqual(calls[1][1]?.headers);
  expect(JSON.parse(String(calls[1][1]?.body))).toEqual({ packId: "taylor-exp-v1", packVersion: 1, capacity: 8, priceMinor: 3900 });
  expect(fetcher.mock.calls.some(([path]) => path.endsWith("/approve"))).toBe(false);
});

test("four wall dates reach Core unchanged; preview needs a deliberate checkbox before confirmation", async () => {
  const changed = vi.fn();
  const fetcher = vi.fn(async (path: string, init?: RequestInit) => {
    if (path.endsWith("/offer/preview")) return json(preview);
    if (path.endsWith("/offer/confirm")) return json({ edition: { ...configured(), state: "offered", managementRevision: 2 } });
    if (init?.method === "PATCH") return json({ edition: configured() });
    return json(edition());
  });
  vi.stubGlobal("fetch", fetcher);
  render(<EditionManager editionId="edition" defaultOpen onChanged={changed} />);
  await screen.findByRole("heading", { name: "Prepara date e condizioni" });
  fillDates(); fireEvent.submit(screen.getByRole("form", { name: "Date e condizioni dell’edizione" }));
  await screen.findByText(/Date e condizioni salvate/);
  const saved = fetcher.mock.calls.find(([, init]) => init?.method === "PATCH")!;
  expect(JSON.parse(String(saved[1]?.body)).starts).toEqual(dates);
  fireEvent.click(screen.getByRole("button", { name: "Rileggi l’offerta completa" }));
  const offer = await screen.findByRole("region", { name: "Anteprima dell’offerta" });
  expect(offer.textContent).toContain("2026");
  expect(offer.textContent).toContain("GMT+1");
  const confirm = within(offer).getByRole("button", { name: "Conferma offerta di test" });
  expect((confirm as HTMLButtonElement).disabled).toBe(true);
  expect(fetcher.mock.calls.filter(([path]) => path.endsWith("/offer/confirm"))).toHaveLength(0);
  fireEvent.click(within(offer).getByRole("checkbox")); fireEvent.click(confirm);
  await screen.findByRole("heading", { name: "Offerta di test confermata" });
  expect(fetcher.mock.calls.filter(([path]) => path.endsWith("/offer/confirm"))).toHaveLength(1);
  expect(screen.queryByRole("button", { name: /Approva/ })).toBeNull();
  expect(changed.mock.calls).toEqual([["edition"], ["edition"]]);
});

test.each([200, 409])("late save ACK/error (%s) cannot replace another selected edition", async (status) => {
  let release!: (value: Response) => void;
  const changed = vi.fn();
  vi.stubGlobal("fetch", vi.fn(async (path: string, init?: RequestInit) => {
    if (init?.method === "PATCH") return new Promise<Response>((resolve) => { release = resolve; });
    return json(edition(path.endsWith("other") ? "other" : "edition"));
  }));
  const view = render(<EditionManager editionId="edition" defaultOpen onChanged={changed} />);
  await screen.findByRole("heading", { name: "Prepara date e condizioni" });
  fillDates(); fireEvent.submit(screen.getByRole("form", { name: "Date e condizioni dell’edizione" }));
  await waitFor(() => expect(release).toBeTypeOf("function"));
  view.rerender(<EditionManager editionId="other" defaultOpen onChanged={changed} />);
  await screen.findByRole("heading", { name: "Prepara date e condizioni" });
  await act(async () => { release(status === 200 ? json({ edition: configured() }) : json({ error: "stale_edition" }, status)); });
  expect(changed).not.toHaveBeenCalled();
  expect(screen.queryByRole("alert")).toBeNull();
  expect((screen.getByLabelText("Incontro 1 · inizio") as HTMLInputElement).value).toBe("");
});

test("a late creation ACK after actor change cannot select a course or expose tutor controls", async () => {
  let release!: (value: Response) => void;
  const changed = vi.fn();
  vi.stubGlobal("fetch", vi.fn(async (path: string) => path.endsWith("coursepacks") ? json({ items: [{ packId: "taylor-exp-v1", packVersion: 1, title: "Taylor", editorialStatus: "DRAFT", scope: "DRAFT" }] }) : new Promise<Response>((resolve) => { release = resolve; })));
  const props = { data: null, editions: [], onUpdate: async () => {}, onClassroom: () => {}, onManaged: changed };
  const view = render(<Courses me={teacher} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Nuova edizione" }));
  await screen.findByRole("option", { name: "Taylor · DRAFT" });
  fireEvent.submit(screen.getByRole("form", { name: "Crea un’edizione" }));
  await waitFor(() => expect(release).toBeTypeOf("function"));
  view.rerender(<Courses me={{ id: "student", role: "student", synthetic: true }} {...props} />);
  await act(async () => { release(json({ edition: edition("late") })); });
  expect(changed).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Nuova edizione" })).toBeNull();
});
