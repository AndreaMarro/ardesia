// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Courses } from "../features/Courses";

const teacher = { id: "teacher-a", role: "teacher" as const, synthetic: true as const };
const props = { data: null, editions: [], onUpdate: async () => {}, onClassroom: () => {} };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const inventory = {
  programmes: [{ id: "taylor-exp-v1@1", title: "Taylor e resto", subject: "analisi", packId: "taylor-exp-v1", packVersion: 1,
    packSha256: "a".repeat(64), entryActivityId: "taylor-exp-v1", scope: "Solo exp reale, centro zero.",
    activities: [{ id: "taylor-exp-v1", title: "Grado e resto" }], exerciseCount: 4, transferCount: 2, solutionCount: 6,
    prerequisites: ["fattoriale"], learningObjectives: ["Giustificare un limite del resto"], editorialStatus: "DRAFT",
    scientificReview: "NOT_ATTESTED", creatable: true, rights: "Materiale originale da revisionare.", sources: [], gaps: ["Revisione scientifica"] }],
  collections: [{ id: "physics-semestre-2026@1:sf-u4", title: "Onde meccaniche", subject: "fisica", bankId: "physics-semestre-2026", bankVersion: 1,
    bankSha256: "b".repeat(64), academicYear: "2026/2027", unitIds: ["U4"], microareas: ["Interferenza"], topics: ["Battimenti"],
    prerequisites: ["Lettura di una formula"], learningObjectives: ["Confrontare due frequenze"], questionCount: 272,
    familyCount: 17, solutionCount: 272, countsByDifficulty: { base: 68, facile: 68, medio: 68, difficile: 68 }, countsByFormat: { completion: 80, multiple_choice: 192 },
    selection: { miniCourseId: "sf-u4" }, questionRefs: [{ id: "fixture-wave-01", version: 1, contentSha256: "c".repeat(64) }],
    editorialStatus: "DRAFT", scientificReview: "NOT_RUN", creatable: false,
    gaps: ["CoursePack e sequenza incontri assenti", "Revisione scientifica/editoriale", "Collaudo del percorso"] }],
  sharedPrerequisites: [{ label: "Lettura di una formula", entryIds: ["one", "two"] }],
};

function pathwayFixture() {
  const coverage = { questionCount: 272, familyCount: 17, unitIds: ["U4"], prerequisites: ["Lettura di una formula"],
    learningObjectives: ["Confrontare due frequenze"], microareas: ["Interferenza"], countsByAuthoringStatus: { DRAFT: 272 },
    editorialStatus: "DRAFT", scientificReview: "NOT_ATTESTED", publicationStatus: "EDITION_SCOPED", creatable: false, gaps: ["Sequenza da deliberare"] };
  return { id: "fixture-composition", version: 2, sha256: "d".repeat(64),
    bankRef: { bankId: "physics-semestre-2026", bankVersion: 1, bankSha256: "b".repeat(64) },
    items: [{ ...coverage, id: "fixture-path", title: "Percorso sintetico", units: [{ ...coverage, id: "U4", title: "Onde meccaniche", collectionIds: [inventory.collections[0].id] }] }],
    coverage, transversalCollectionIds: [] };
}

afterEach(() => { history.replaceState(null, "", "/"); cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

test("teacher opens a real curriculum inventory on demand, with content references and separate draft states", async () => {
  const fetcher = vi.fn(async (_path: string, _init?: RequestInit) => json({ items: [], inventory }));
  vi.stubGlobal("fetch", fetcher);
  render(<Courses me={teacher} {...props} />);
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Apri catalogo e copertura" }));
  await screen.findByRole("heading", { name: "Taylor e resto" });
  expect(fetcher.mock.calls[0][0]).toBe("/study/admin/coursepacks?includeInventory=true");
  expect(screen.getByText("Solo exp reale, centro zero.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Raccolte da progettare/ }));
  const card = screen.getByRole("article", { name: "Onde meccaniche" });
  fireEvent.click(within(card).getByText("Contenuti, riferimenti e lacune"));
  expect(card.textContent).toContain("272 quesiti");
  expect(card.textContent).toContain("fixture-wave-01");
  expect(card.textContent).toContain("CoursePack e sequenza incontri assenti");
  expect(card.textContent).toContain("Non è ancora un programma per un’edizione");
  expect(within(card).queryByRole("button", { name: /Crea|Pubblica|Approva/ })).toBeNull();
  expect(fetcher.mock.calls.every(([, init]) => init?.method === "GET")).toBe(true);
});

test("search matches actual topics and announces an empty result without inventing a course", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => json({ items: [], inventory })));
  render(<Courses me={teacher} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Apri catalogo e copertura" }));
  await screen.findByRole("heading", { name: "Taylor e resto" });
  fireEvent.click(screen.getByRole("button", { name: /Raccolte da progettare/ }));
  fireEvent.change(screen.getByLabelText("Cerca nel catalogo"), { target: { value: "battimenti" } });
  expect(screen.getByRole("heading", { name: "Onde meccaniche" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Cerca nel catalogo"), { target: { value: "corso-inesistente" } });
  expect(screen.getByRole("status").textContent).toContain("Nessun risultato");
  expect(screen.queryByRole("heading", { name: "Onde meccaniche" })).toBeNull();
});

test("student never requests private inventory and a late teacher response cannot restore it", async () => {
  let finish!: (response: Response) => void;
  const fetcher = vi.fn(() => new Promise<Response>((resolve) => { finish = resolve; }));
  vi.stubGlobal("fetch", fetcher);
  const student = { id: "student", role: "student" as const, synthetic: true as const };
  const view = render(<Courses me={student} {...props} />);
  expect(screen.queryByRole("button", { name: "Apri catalogo e copertura" })).toBeNull();
  expect(fetcher).not.toHaveBeenCalled();
  view.rerender(<Courses me={teacher} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Apri catalogo e copertura" }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  view.rerender(<Courses me={student} {...props} />);
  await act(async () => { finish(json({ items: [], inventory })); });
  expect(screen.queryByRole("heading", { name: "Taylor e resto" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Apri catalogo e copertura" })).toBeNull();
});


test("catalog links reopen the exact unit and reject an obsolete composition without a fallback", async () => {
  const pathways = pathwayFixture();
  const url = `/?catalog=pathways&pathway=fixture-path&unit=U4&catalogVersion=2&catalogSha=${pathways.sha256}`;
  history.replaceState(null, "", url);
  vi.stubGlobal("fetch", vi.fn(async () => json({ items: [], inventory: { ...inventory, pathways, pathwaysError: null } })));
  render(<Courses me={teacher} {...props} />);
  await screen.findByRole("heading", { name: "U4 · Onde meccaniche" });
  expect(screen.getByRole("article", { name: "Onde meccaniche" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Pubblica|Approva|Consegna/ })).toBeNull();
  history.replaceState(null, "", url.replace("catalogVersion=2", "catalogVersion=999"));
  fireEvent(window, new PopStateEvent("popstate"));
  expect(screen.getByRole("heading", { name: "Riferimento non disponibile" })).toBeTruthy();
  expect(screen.queryByRole("article", { name: "Onde meccaniche" })).toBeNull();
  fireEvent.click(screen.getByRole("link", { name: "Tutti i percorsi" }));
  expect(screen.getByRole("article", { name: "Percorso sintetico" })).toBeTruthy();
});


test("a popstate at the first visible unit rejects its obsolete reference before passive effects", async () => {
  const pathways = pathwayFixture();
  const url = `/?catalog=pathways&pathway=fixture-path&unit=U4&catalogVersion=2&catalogSha=${pathways.sha256}`;
  history.replaceState(null, "", url);
  vi.stubGlobal("fetch", vi.fn(async () => json({ items: [], inventory: { ...inventory, pathways, pathwaysError: null } })));
  let navigateWhenVisible!: () => void;
  const navigated = new Promise<void>((resolve) => { navigateWhenVisible = resolve; });
  // A committed heading can be observed before React runs its passive effects.
  // Dispatch at that boundary, without delaying or mocking the subscription.
  const observer = new MutationObserver(() => {
    if (!screen.queryByRole("heading", { name: "U4 · Onde meccaniche" })) return;
    observer.disconnect();
    history.replaceState(null, "", url.replace("catalogVersion=2", "catalogVersion=999"));
    fireEvent(window, new PopStateEvent("popstate"));
    navigateWhenVisible();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  try {
    render(<Courses me={teacher} {...props} />);
    await navigated;
    expect(screen.getByRole("heading", { name: "Riferimento non disponibile" })).toBeTruthy();
    expect(screen.queryByRole("article", { name: "Onde meccaniche" })).toBeNull();
  } finally {
    observer.disconnect();
  }
});
