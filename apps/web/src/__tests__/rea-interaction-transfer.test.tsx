// @vitest-environment jsdom
import {afterEach, expect, test} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {PhysicsLab} from "../components/PhysicsLab";

afterEach(cleanup);
test("REA A: advancing to a different problem hides the solution and focuses the next prediction", async () => {
  render(<PhysicsLab publicPreview numericPrediction />);
  const prediction = screen.getByLabelText("Rapporto previsto");
  fireEvent.change(prediction, {target: {value: "4"}});
  fireEvent.click(screen.getByRole("button", {name: "Metti alla prova"}));
  expect((await screen.findByTestId("physics-ratio")).textContent).toBe("Q/Q0 = 16");
  const next = screen.getByRole("button", {name: "Un problema diverso"});
  next.focus(); fireEvent.click(next);
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect((screen.getByLabelText("Rapporto dei raggi") as HTMLInputElement).value).toBe("0.5");
  expect((screen.getByLabelText("Grandezza fissata") as HTMLSelectElement).value).toBe("flow");
  expect(screen.getByText("Nuovo problema: la pompa mantiene Q, ma il raggio si dimezza.").getAttribute("role")).toBe("status");
  expect(document.activeElement).toBe(prediction);
});
