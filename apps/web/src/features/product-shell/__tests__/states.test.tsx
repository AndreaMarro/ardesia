// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SourceStatus, SurfaceState } from "../SurfaceState";
afterEach(cleanup);
test("a revoked source hides its revision and has no link to the original", () => {
  render(<SourceStatus state="revoked" revision="private-revision" />);
  expect(screen.getByLabelText("Stato della fonte").textContent).toContain("Accesso revocato");
  expect(screen.queryByText("private-revision")).toBeNull();
  expect(screen.queryByRole("link")).toBeNull();
});
test("historical and unknown source states never imply a current revision", () => {
  const view = render(<SourceStatus state="historical" revision="r1" />);
  expect(screen.getByText("Revisione storica")).toBeTruthy();
  expect(screen.getByText("r1")).toBeTruthy();
  view.rerender(<SourceStatus state="unknown" />);
  expect(screen.getByText("Stato da verificare")).toBeTruthy();
  expect(screen.queryByText("Revisione corrente")).toBeNull();
});
test("recovery is supplied by its feature owner and pending does not repeat it", () => {
  const retry = vi.fn();
  const view = render(<SurfaceState state="error" action={{label:"Ricarica la fonte", onClick:retry}} />);
  expect(screen.getByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", {name:"Ricarica la fonte"}));
  expect(retry).toHaveBeenCalledTimes(1);
  view.rerender(<SurfaceState state="pending" action={{label:"Ricarica la fonte",onClick:retry}} />);
  expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});
