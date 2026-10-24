// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Workspace } from "../api";
import { Review } from "../features/Review";

const empty: Workspace = {
  edition: { id: "synthetic-refresh", teacherId: "synthetic-teacher", capacity: 10, priceMinor: 0,
    state: "collecting", sessions: [], timezone: "Europe/Rome", packId: "algebra-v1", packVersion: 1 },
  enrolled: true, resources: [], layouts: [], layoutSaved: false, layoutVersion: "a".repeat(64), submissions: [],
};
const delivered: Workspace = { ...empty, submissions: [{ id: "synthetic-submission", student_id: "synthetic-student",
  activity_id: "historical-algebra", revision: 1, parent_id: null, text: "Originale da conservare",
  asset_refs: [], source_refs: [], receipt_id: "synthetic-receipt", state: "received", feedback: [] }] };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("the tutor explicitly rereads a new delivery and cannot overlap refreshes", async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => { finish = resolve; });
  const read = vi.fn(() => pending);
  function Tutor() {
    const [data, setData] = useState(empty);
    return <Review data={data} onUpdate={async () => { await read(); setData(delivered); }} onDiary={() => {}} />;
  }
  render(<Tutor />);
  const refresh = screen.getByRole("button", { name: "Aggiorna consegne" });
  refresh.focus();
  fireEvent.click(refresh);
  expect((screen.getByRole("button", { name: "Aggiornamento…" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(refresh);
  expect(read).toHaveBeenCalledTimes(1);
  await act(async () => { finish(); await pending; });
  expect(screen.getByRole("button", { name: /synthetic-student/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Aggiorna consegne" })).toBe(document.activeElement);
});

test("a failed reread preserves the selected original and supports retry", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ threads: [] }))));
  const read = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  render(<Review data={delivered} onUpdate={read} onDiary={() => {}} />);
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /synthetic-student/ })); });
  expect(screen.getByText("Originale da conservare")).toBeTruthy();
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Aggiorna consegne" })); });
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.getByText("Originale da conservare")).toBeTruthy();
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Riprova" })); });
  expect(read).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("Originale da conservare")).toBeTruthy();
});
