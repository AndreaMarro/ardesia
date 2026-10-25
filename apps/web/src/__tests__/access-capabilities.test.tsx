// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Login } from "../components/Login";
import { AccessPanel } from "../../../studio/src/study/AccessPanel";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const loginProps = () => ({
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  restoreFocus: null,
});

test("login offers invitation codes only after the runtime explicitly supports them", async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    ),
  );
  render(<Login {...loginProps()} />);
  expect(screen.queryByRole("checkbox")).toBeNull();
  finish(
    new Response(JSON.stringify({ capabilities: { invitationCodes: true } })),
  );
  await screen.findByRole("checkbox", { name: "Sto usando un invito monouso" });
});

test("real Supabase runtime shows account access without promising unavailable invitations", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({ capabilities: { invitationCodes: false } }),
        ),
    ),
  );
  render(<Login {...loginProps()} />);
  await screen.findByText(/Gli inviti monouso non sono attivi/);
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(screen.getByLabelText("Codice di accesso sintetico")).toBeTruthy();
});

test("supported invitation login uses its dedicated endpoint and server identity", async () => {
  const requests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requests.push(url);
      return new Response(
        JSON.stringify(
          url.endsWith("/health")
            ? { capabilities: { invitationCodes: true } }
            : { id: "student-01", role: "student", synthetic: true },
        ),
      );
    }),
  );
  const props = loginProps();
  render(<Login {...props} />);
  fireEvent.click(
    await screen.findByRole("checkbox", {
      name: "Sto usando un invito monouso",
    }),
  );
  fireEvent.change(screen.getByLabelText("Invito monouso"), {
    target: { value: "synthetic-one-use-code" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Accedi" }));
  await waitFor(() =>
    expect(props.onSuccess).toHaveBeenCalledWith({
      id: "student-01",
      role: "student",
      synthetic: true,
    }),
  );
  expect(requests).toEqual(["/study/health", "/study/invitations/accept"]);
});

test("access panel shows persisted roster and waitlist without unsupported invitation actions", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            members: ["student-01", "student-02"],
            waitlist: ["student-11", "student-12"],
            invitations: [],
            capabilities: { invitationCodes: false },
          }),
        ),
    ),
  );
  render(<AccessPanel />);
  const members = await screen.findByRole("table", {
    name: "Iscritti confermati",
  });
  const waiting = screen.getByRole("table", { name: "Lista d’attesa" });
  expect(members.textContent).toContain("student-01");
  expect(waiting.textContent).toContain("student-12");
  expect(
    screen.queryByRole("button", { name: "Crea invito monouso" }),
  ).toBeNull();
  await screen.findByText(/Gli inviti monouso non sono attivi/);
});

test("unknown capability never creates an invitation promise and access loading can be retried", async () => {
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      ++calls === 1
        ? new Response(JSON.stringify({ error: "storage_unavailable" }), {
            status: 503,
          })
        : new Response(
            JSON.stringify({ members: [], waitlist: [], invitations: [] }),
          ),
    ),
  );
  render(<AccessPanel />);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  await screen.findByText("Nessun iscritto confermato.");
  expect(
    screen.queryByRole("button", { name: "Crea invito monouso" }),
  ).toBeNull();
  expect(calls).toBe(2);
});
