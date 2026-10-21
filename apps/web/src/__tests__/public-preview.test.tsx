// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Public } from "../features/Public";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const course = {
  id: "fluidi-public-v1",
  duration: "Quattro incontri proposti",
  capacity: 10,
  priceMinor: null,
  sessions: [],
  timezone: "Europe/Rome",
};

test("public preview sends neither API requests, predictions nor contacts", async () => {
  const calls: { url: string; body?: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options: RequestInit) => {
      calls.push({
        url,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      });
      return Response.json(
        url.endsWith("/course")
          ? course
          : {
              ratio: 5.0625,
              calculatedVariable: "Q/Q0",
              fixedQuantity: "pressure",
              domain: "Modello laminare",
            },
      );
    }),
  );
  render(<Public publicPreview />);
  await screen.findByText("Quattro incontri proposti");
  expect(screen.queryByText(/Accedi al tuo spazio/)).toBeNull();
  expect(
    screen.queryByRole("textbox", { name: "Contatto sintetico" }),
  ).toBeNull();
  expect(screen.queryByText(/€|Date sintetiche/)).toBeNull();
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "Una riflessione privata" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  await screen.findByTestId("physics-ratio");
  expect(calls).toEqual([]);
});

test("API-backed course errors remain recoverable and the lab stays available", async () => {
  let unavailable = true;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      unavailable
        ? Response.json({ error: "unavailable" }, { status: 503 })
        : Response.json(course),
    ),
  );
  render(<Public />);
  await screen.findByText("La scheda del corso non è disponibile.");
  expect(screen.getByRole("button", { name: "Metti alla prova" })).toBeTruthy();
  unavailable = false;
  fireEvent.click(screen.getByRole("button", { name: /riprova/i }));
  await screen.findByText("Quattro incontri proposti");
  expect(
    screen.queryByText("La scheda del corso non è disponibile."),
  ).toBeNull();
});
