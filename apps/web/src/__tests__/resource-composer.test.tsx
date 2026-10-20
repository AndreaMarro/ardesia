// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Classroom } from "../features/Classroom";
import { Materials } from "../features/Materials";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const me = {
  id: "student-01",
  role: "student" as const,
  synthetic: true as const,
};
const data = {
  enrolled: true,
  edition: {
    id: "fluidi",
    teacherId: "tutor-synthetic",
    capacity: 10,
    priceMinor: 4900,
    state: "collecting",
    sessions: [],
    timezone: "Europe/Rome",
  },
  resources: [],
  submissions: [],
  layouts: [],
  layoutSaved: true,
  layoutVersion: "b".repeat(64),
};
const resource = {
  id: "r-1",
  revisionId: "rev-1",
  contextId: "ctx-1",
  ownerId: me.id,
  editionId: "fluidi",
  kind: "notes",
  visibility: "private",
  text: "Una previsione.",
  sha256: "a".repeat(64),
};
function setup() {
  vi.stubGlobal("localStorage", {
    getItem: () => null,
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
}
const surfaces = [
  {
    name: "Classroom",
    Component: Classroom,
    label: "Una nota, una domanda, un procedimento",
  },
  {
    name: "Materials",
    Component: Materials,
    label: "Titolo e contenuto della nota",
  },
];
for (const surface of surfaces)
  test(`${surface.name}: retry reuses an immutable draft key and a new draft rotates it`, async () => {
    setup();
    const requests: { key: string; body: string }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, options?: RequestInit) => {
        requests.push({
          key: (options?.headers as Record<string, string>)["Idempotency-Key"],
          body: options?.body as string,
        });
        return new Response(
          JSON.stringify(
            requests.length === 1 ? { error: "storage_unavailable" } : resource,
          ),
          { status: requests.length === 1 ? 503 : 200 },
        );
      }),
    );
    render(<surface.Component me={me} data={data} onUpdate={async () => {}} />);
    if (surface.name === "Materials")
      fireEvent.click(screen.getByText("Aggiungi una nota privata"));
    const input = screen.getByLabelText(surface.label);
    fireEvent.change(input, { target: { value: resource.text } });
    fireEvent.click(screen.getByRole("button", { name: "Salva nota privata" }));
    await screen.findByRole("alert");
    expect((input as HTMLTextAreaElement).value).toBe(resource.text);
    fireEvent.click(screen.getByRole("button", { name: "Salva nota privata" }));
    await screen.findByText("Nota salvata nel tuo spazio privato.");
    expect(requests).toHaveLength(2);
    expect(requests[0].key).toMatch(/^[a-f0-9-]{36}$/);
    expect(requests[0]).toEqual(requests[1]);
    fireEvent.change(input, { target: { value: "Seconda previsione." } });
    fireEvent.click(screen.getByRole("button", { name: "Salva nota privata" }));
    await screen.findByText("Nota salvata nel tuo spazio privato.");
    expect(requests).toHaveLength(3);
    expect(requests[2].key).not.toBe(requests[0].key);
  });

test("a confirmed creation remains saved when the subsequent course reload fails", async () => {
  setup();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(resource))),
  );
  render(
    <Classroom
      me={me}
      data={data}
      onUpdate={async () => {
        throw Error("unavailable");
      }}
    />,
  );
  fireEvent.change(
    screen.getByLabelText("Una nota, una domanda, un procedimento"),
    { target: { value: resource.text } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Salva nota privata" }));
  await screen.findByText(/Nota salvata nel tuo spazio privato/);
  expect(
    screen.queryByText("Il salvataggio non è riuscito. Il testo è ancora qui."),
  ).toBeNull();
});
