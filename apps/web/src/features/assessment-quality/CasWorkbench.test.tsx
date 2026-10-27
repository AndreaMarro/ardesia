// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import CasWorkbench from "./CasWorkbench";
import { initialInput, WORKSHEET_KIND } from "./worksheet";
vi.mock("./EquationInput", () => ({
  EquationInput: ({
    label,
    value,
    onChange,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => (
    <label>
      Formula {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  ),
}));
const base = "/editions/fluidi/question-banks/physics",
  source = {
    bankId: "physics",
    questionId: "q1",
    questionVersion: 1,
    contentSha256: "a".repeat(64),
  };
const detail = {
  ...source,
  question: {
    title: "Moto uniforme",
    prompt: "Distanza e tempo.",
    answer: { text: "4", unit: "m" },
  },
};
const worksheet = {
  schema: 1,
  source,
  input: initialInput,
  notes: "Controllare le unità.",
  result: { symbolicZero: true },
};
const resource = {
  id: "r1",
  revisionId: "v1",
  contextId: "c1",
  ownerId: "teacher",
  editionId: "fluidi",
  kind: WORKSHEET_KIND,
  visibility: "private",
  text: JSON.stringify(worksheet),
  sha256: "c".repeat(64),
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("lost create retries reuse one key while an identical new sheet gets its own resource", async () => {
  const keys: string[] = [],
    bodies: string[] = [];
  let loseResponse = true;
  const ledger = new Map<string, typeof resource>();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, options: RequestInit) => {
      if (path.endsWith("/study/resources") && options.method === "POST") {
        const key = new Headers(options.headers).get("Idempotency-Key")!;
        keys.push(key);
        const body = JSON.parse(String(options.body));
        bodies.push(body.text);
        if (!ledger.has(key))
          ledger.set(key, {
            ...resource,
            id: `r${ledger.size + 1}`,
            text: body.text,
          });
        if (loseResponse) {
          loseResponse = false;
          throw new Error("network_error");
        }
        return new Response(JSON.stringify(ledger.get(key)));
      }
      return new Response(
        JSON.stringify(
          path.includes("/workspace?") ? { resources: [] } : detail,
        ),
      );
    }),
  );
  render(<CasWorkbench base={base} questionId="q1" onClose={() => {}} />);
  await screen.findByLabelText("Fogli privati salvati");
  await waitFor(() =>
    expect(screen.getByLabelText("Osservazioni sul foglio")).toHaveProperty(
      "disabled",
      false,
    ),
  );
  fireEvent.change(screen.getByLabelText("Osservazioni sul foglio"), {
    target: { value: "Stesso contenuto" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salva foglio privato" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Salva foglio privato" }));
  await screen.findByText(
    "Foglio privato salvato nel Core. Puoi riaprirlo dopo il ricaricamento.",
  );
  expect(keys[0]).toBe(keys[1]);
  fireEvent.click(screen.getByRole("button", { name: "Nuovo foglio" }));
  fireEvent.change(screen.getByLabelText("Osservazioni sul foglio"), {
    target: { value: "Stesso contenuto" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salva foglio privato" }));
  await screen.findByText(
    "Foglio privato salvato nel Core. Puoi riaprirlo dopo il ricaricamento.",
  );
  expect(bodies[0]).toBe(bodies[2]);
  expect(keys[2]).not.toBe(keys[0]);
  expect(ledger.size).toBe(2);
});
test("reopen discards saved verdict; save uses Core CAS, conflict keeps draft and cannot overwrite", async () => {
  const calls: { path: string; body: Record<string, unknown> | null }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, options: RequestInit) => {
      const body = options.body ? JSON.parse(String(options.body)) : null;
      calls.push({ path, body });
      if (path.endsWith("/revise"))
        return new Response(JSON.stringify({ error: "stale_revision" }), {
          status: 409,
        });
      return new Response(
        JSON.stringify(
          path.includes("/review/questions/")
            ? detail
            : path.includes("/workspace?")
              ? { resources: [resource] }
              : resource,
        ),
      );
    }),
  );
  render(<CasWorkbench base={base} questionId="q1" onClose={() => {}} />);
  const select = await screen.findByLabelText("Fogli privati salvati");
  await waitFor(() =>
    expect((select as HTMLSelectElement).options).toHaveLength(2),
  );
  fireEvent.change(select, { target: { value: "r1" } });
  await screen.findByText(
    "Foglio riaperto. Ripeti il calcolo per ottenere un risultato attuale.",
  );
  expect(
    screen.queryByRole("region", { name: "Risultato della controprova" }),
  ).toBeNull();
  fireEvent.change(screen.getByLabelText("Osservazioni sul foglio"), {
    target: { value: "La mia bozza" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salva foglio privato" }));
  await screen.findByText(/Un’altra scheda ha aggiornato/);
  expect(screen.getByLabelText("Osservazioni sul foglio")).toHaveProperty(
    "value",
    "La mia bozza",
  );
  expect(
    screen.getByRole("button", { name: "Salva foglio privato" }),
  ).toHaveProperty("disabled", true);
  expect(
    calls.find((call) => call.path.endsWith("/revise"))?.body?.expectedRevision,
  ).toBe("v1");
  expect(calls.filter((call) => call.path.endsWith("/resources"))).toHaveLength(
    0,
  );
});
test("revoked source clears private inputs and results before any save", async () => {
  let denied = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (path: string) =>
        new Response(
          JSON.stringify(
            denied
              ? { error: "forbidden" }
              : path.includes("/workspace?")
                ? { resources: [] }
                : detail,
          ),
          { status: denied ? 403 : 200 },
        ),
    ),
  );
  render(<CasWorkbench base={base} questionId="q1" onClose={() => {}} />);
  await screen.findByLabelText("Fogli privati salvati");
  await waitFor(() =>
    expect(screen.getByLabelText("Formula A")).toHaveProperty(
      "disabled",
      false,
    ),
  );
  fireEvent.change(screen.getByLabelText("Osservazioni sul foglio"), {
    target: { value: "Privato" },
  });
  denied = true;
  fireEvent.click(screen.getByRole("button", { name: "Salva foglio privato" }));
  await waitFor(() =>
    expect(screen.queryByLabelText("Osservazioni sul foglio")).toBeNull(),
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
});
test("changed question version blocks save without rebinding the old draft", async () => {
  let changed = false,
    writes = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, options: RequestInit) => {
      if (options.method === "POST") writes++;
      return new Response(
        JSON.stringify(
          path.includes("/workspace?")
            ? { resources: [] }
            : {
                ...detail,
                questionVersion: changed ? 2 : 1,
                contentSha256: changed ? "b".repeat(64) : detail.contentSha256,
              },
        ),
      );
    }),
  );
  render(<CasWorkbench base={base} questionId="q1" onClose={() => {}} />);
  await screen.findByLabelText("Fogli privati salvati");
  await waitFor(() =>
    expect(screen.getByLabelText("Formula A")).toHaveProperty(
      "disabled",
      false,
    ),
  );
  fireEvent.change(screen.getByLabelText("Osservazioni sul foglio"), {
    target: { value: "Verifica sulla versione 1" },
  });
  changed = true;
  fireEvent.click(screen.getByRole("button", { name: "Salva foglio privato" }));
  await screen.findByText(/Questo foglio riguarda una versione precedente/);
  expect(writes).toBe(0);
  expect(screen.getByText(/Versione corrente 2/)).toBeTruthy();
  expect(
    screen.getByText(`Fonte corrente SHA-256: ${"b".repeat(64)}`),
  ).toBeTruthy();
  expect(screen.getByText(/Foglio: versione 1/)).toBeTruthy();
  expect(screen.getByLabelText("Osservazioni sul foglio")).toHaveProperty(
    "value",
    "Verifica sulla versione 1",
  );
  expect(
    screen.getByRole("button", { name: "Salva foglio privato" }),
  ).toHaveProperty("disabled", true);
});
