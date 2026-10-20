// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Courses } from "../features/Courses";
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
const pack = {
  title: "Contenuti originali di prova",
  scope: "Revisione scientifica da eseguire",
  status: "DRAFT",
  activities: [{ id: "units-v1", title: "Unità" }],
  exercises: [],
  transferTests: [],
  reviewRubric: [],
};
for (const surface of [
  "student-courses",
  "tutor-courses",
  "tutor-materials",
] as const)
  test(`${surface}: closed preview makes no content or evaluation request; opening is explicit and closing unmounts it`, async () => {
    const requests: { path: string; method: string }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string, options?: RequestInit) => {
        requests.push({ path, method: options?.method ?? "GET" });
        return new Response(
          JSON.stringify(
            path.startsWith("/study/coursepack")
              ? pack
              : path.endsWith("/activities/evaluate")
                ? {
                    value: 10000,
                    calculatedVariable: "Area",
                    unit: "cm²",
                    domain: "Conversione geometrica",
                  }
                : {
                    members: [],
                    waitlist: [],
                    invitations: [],
                    capabilities: { invitationCodes: false },
                  },
          ),
        );
      }),
    );
    const actor =
      surface === "student-courses"
        ? me
        : { ...me, id: "tutor-synthetic", role: "teacher" as const };
    render(
      surface.endsWith("materials") ? (
        <Materials me={actor} data={data} onUpdate={async () => {}} />
      ) : (
        <Courses
          me={actor}
          data={data}
          onUpdate={async () => {}}
          onClassroom={() => {}}
        />
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const previewCalls = () =>
      requests.filter(
        (request) =>
          request.path.startsWith("/study/coursepack") ||
          request.path === "/study/activities/evaluate",
      );
    expect(previewCalls()).toEqual([]);
    const summary = screen.getByText(
      surface.endsWith("materials")
        ? "Banco dei contenuti originali in revisione"
        : "Programma e materiali in preparazione",
      { exact: true },
    );
    fireEvent.click(summary);
    await screen.findByRole("heading", { name: pack.title });
    await waitFor(() =>
      expect(previewCalls()).toEqual([
        { path: "/study/coursepack?editionId=fluidi", method: "GET" },
        { path: "/study/activities/evaluate", method: "POST" },
      ]),
    );
    fireEvent.click(summary);
    await waitFor(() =>
      expect(
        document.querySelector(
          'section[aria-label="Banco di revisione contenuti"]',
        ),
      ).toBeNull(),
    );
    const count = previewCalls().length;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(previewCalls()).toHaveLength(count);
  });
