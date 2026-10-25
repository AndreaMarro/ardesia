// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SubmissionPanel } from "../../../studio/src/study/SubmissionPanel";

const me = {
  id: "student",
  role: "student" as const,
  synthetic: true as const,
};
let cache: Map<string, string>;
beforeEach(() => {
  cache = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => cache.get(k) ?? null,
    setItem: (k: string, v: string) => cache.set(k, v),
    removeItem: (k: string) => cache.delete(k),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("Taylor sends course-specific frozen parameters and retry retains the original human procedure after a switch", async () => {
  const calls: { body: unknown; key: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      calls.push({
        body: JSON.parse(init.body as string),
        key: (init.headers as Record<string, string>)["Idempotency-Key"],
      });
      return new Response(
        JSON.stringify(
          calls.length === 1
            ? { error: "offline" }
            : {
                receiptId: "ack-analysis",
                revision: 1,
                courseContext: {
                  modelId: "taylor-exp-v1",
                  parameters: { x: 0.5, degree: 3 },
                },
              },
        ),
        { status: calls.length === 1 ? 503 : 200 },
      );
    }),
  );
  const first = render(
    <SubmissionPanel
      me={me}
      editionId="analysis"
      activityId="taylor-exp-v1"
      activityParameters={{ x: 0.5, degree: 3 }}
      source={null}
      parentId={null}
      onUpdate={async () => {}}
    />,
  );
  fireEvent.change(screen.getByLabelText("La tua spiegazione"), {
    target: {
      value:
        "Prevedo 1,6; costruisco i quattro termini con k! e maggioro il resto.",
    },
  });
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText(/Invio non ancora confermato/);
  expect(calls[0].body).toMatchObject({
    editionId: "analysis",
    activityId: "taylor-exp-v1",
    activityParameters: { x: 0.5, degree: 3 },
    parentId: null,
  });
  first.unmount();
  const physics = render(
    <SubmissionPanel
      me={me}
      editionId="physics"
      source={null}
      parentId={null}
      onUpdate={async () => {}}
    />,
  );
  expect(
    (screen.getByLabelText("La tua spiegazione") as HTMLTextAreaElement).value,
  ).toBe("");
  physics.unmount();
  render(
    <SubmissionPanel
      me={me}
      editionId="analysis"
      activityId="taylor-exp-v1"
      activityParameters={{ x: -1, degree: 8 }}
      source={null}
      parentId={null}
      onUpdate={async () => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Consegna" }));
  await screen.findByText(/ack-analysis/);
  expect(calls[1]).toEqual(calls[0]);
  expect(cache.has("ardesia-study-draft:student:analysis")).toBe(false);
});
test("an upload acknowledged after switching course updates only its original draft", async () => {
  const randomUUID = crypto.randomUUID.bind(crypto);
  vi.stubGlobal("crypto", {
    randomUUID,
    subtle: { digest: async () => new Uint8Array([10]).buffer },
  });
  let release!: (value: Response) => void;
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      calls.push(path);
      return new Promise<Response>((r) => {
        release = r;
      });
    }),
  );
  const file = new File([new Uint8Array([1, 2])], "note.png", {
    type: "image/png",
  });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new Uint8Array([1, 2]).buffer,
  });
  const first = render(
    <SubmissionPanel
      me={me}
      editionId="analysis"
      source={null}
      parentId={null}
      onUpdate={async () => {}}
    />,
  );
  fireEvent.change(screen.getByLabelText("Aggiungi originale privato"), {
    target: { files: [file] },
  });
  await vi.waitFor(() => expect(release).toBeTypeOf("function"));
  first.unmount();
  const second = render(
    <SubmissionPanel
      me={me}
      editionId="physics"
      source={null}
      parentId={null}
      onUpdate={async () => {}}
    />,
  );
  release(new Response(JSON.stringify({ id: "asset-analysis" })));
  await vi.waitFor(() =>
    expect(cache.get("ardesia-study-draft:student:analysis")).toContain(
      "asset-analysis",
    ),
  );
  expect(screen.getByText(/0 allegati privati/)).toBeTruthy();
  second.unmount();
  render(
    <SubmissionPanel
      me={me}
      editionId="analysis"
      source={null}
      parentId={null}
      onUpdate={async () => {}}
    />,
  );
  expect(screen.getByText(/1 allegati privati/)).toBeTruthy();
  expect(calls).toEqual(["/study/assets?editionId=analysis"]);
});
