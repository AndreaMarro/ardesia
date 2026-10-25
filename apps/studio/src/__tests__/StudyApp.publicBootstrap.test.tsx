// @vitest-environment jsdom
import { StrictMode } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import StudyApp from "../study/StudyApp"
import { beginStudySessionCheck } from "../study/sessionBoundary"

vi.mock("../study/PhysicsActivity", () => ({ PhysicsActivity: () => null }))
vi.mock("../study/StudyWorkspace", () => ({ StudyWorkspace: ({ me }: { me: { id: string; role: string } }) => <p>Spazio privato {me.id} · {me.role}</p> }))

const course = { id: "synthetic-edition", title: "Corso sintetico disponibile", capacity: 10, priceMinor: 3900, state: "draft", sessions: [], timezone: "Europe/Rome", confirmedTest: 0, available: 10, scope: "Relazioni e fluidi", duration: "quattro incontri" }
const pack = { title: "Banco sintetico leggibile", scope: "Fixture di sola lettura", status: "DRAFT", activities: [], exercises: [], transferTests: [], reviewRubric: [] }
const response = (value: unknown, status = 200, headers?: HeadersInit) => new Response(JSON.stringify(value), { status, headers })
type Call = { url: string; options: RequestInit; signal: AbortSignal }
type Pending = Call & { resolve(value: Response): void }
function server({ deferCourse = false } = {}) {
  const calls: Call[] = [], me: Pending[] = [], courses: Pending[] = [], packs: Pending[] = []
  vi.stubGlobal("fetch", vi.fn((url: string, options: RequestInit = {}) => {
    const signal = options.signal as AbortSignal
    const call = { url, options, signal }; calls.push(call)
    return new Promise<Response>((resolve, reject) => {
      // Real cancellation: the old child request rejects when the epoch aborts it.
      const abort = () => reject(new DOMException("Aborted", "AbortError"))
      signal.addEventListener("abort", abort, { once: true })
      if (signal.aborted) { abort(); return }
      if (url === "/study/me") { me.push({ ...call, resolve }); return }
      if (url === "/study/course" && deferCourse) { courses.push({ ...call, resolve }); return }
      if (url === "/study/coursepack" && deferCourse) { packs.push({ ...call, resolve }); return }
      const value = url === "/study/course" ? response(course)
        : url === "/study/coursepack" ? response(pack)
        : url === "/study/interests" ? response({ id: "interest-synthetic" })
          : url === "/study/invitations/accept" ? response({ id: "student-invited", role: "student", synthetic: true })
            : url === "/study/session" && options.method === "DELETE" ? response({ serverRevocation: "CONFIRMED" })
              : url === "/study/session" ? response({ error: "invalid_demo_access" }, 401)
              : response({ error: "unexpected_request" }, 404)
      queueMicrotask(() => resolve(value))
    })
  }))
  return { calls, me, courses, packs }
}
beforeEach(() => beginStudySessionCheck())
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

test("anonymous bootstrap waits for /me, then loads the course and enables interest submission", async () => {
  const api = server(); render(<StudyApp />)
  expect(api.me).toHaveLength(1)
  expect(api.calls.filter(call => call.url === "/study/course")).toHaveLength(0)
  expect(api.calls.filter(call => call.url === "/study/coursepack")).toHaveLength(0)
  expect(screen.queryByRole("button", { name: "Invia interesse" })).toBeNull()
  await act(async () => { api.me[0]!.resolve(response({ error: "unauthenticated" }, 401, { "X-Study-Session-Rejected": "missing" })) })
  await screen.findByText(course.title)
  await screen.findByText(pack.title)
  const button = screen.getByRole("button", { name: "Invia interesse" }) as HTMLButtonElement
  expect(button.disabled).toBe(false)
  expect(api.calls.filter(call => call.url === "/study/course")).toHaveLength(1)
  expect(api.calls.find(call => call.url === "/study/course")!.signal.aborted).toBe(false)
  fireEvent.change(screen.getByRole("textbox", { name: "Contatto sintetico" }), { target: { value: "synthetic@example.invalid" } })
  fireEvent.click(screen.getByRole("checkbox", { name: "Acconsento alla registrazione di questa richiesta sintetica" }))
  fireEvent.submit(button.closest("form")!)
  await screen.findByText("Interesse ricevuto · riferimento interest-synthetic")
  expect(new Headers(api.calls.find(call => call.url === "/study/interests")!.options.headers).get("Idempotency-Key")).toBeTruthy()
  expect(screen.queryByText(/Spazio privato/)).toBeNull()
})

test("a valid cookie activates only its private workspace and logout returns to a fresh public course", async () => {
  const api = server(); render(<StudyApp />)
  await act(async () => { api.me[0]!.resolve(response({ id: "teacher-current", role: "teacher", synthetic: true })) })
  await screen.findByText("Spazio privato teacher-current · teacher")
  expect(api.calls.filter(call => call.url === "/study/course")).toHaveLength(0)
  expect(api.calls.filter(call => call.url === "/study/coursepack")).toHaveLength(0)
  expect(screen.queryByRole("button", { name: "Invia interesse" })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Esci" }))
  await screen.findByText(course.title)
  expect((screen.getByRole("button", { name: "Invia interesse" }) as HTMLButtonElement).disabled).toBe(false)
  expect(screen.queryByText(/Spazio privato/)).toBeNull()
})

test("StrictMode aborts the first check and only the second identity can become private", async () => {
  const api = server(); render(<StrictMode><StudyApp /></StrictMode>)
  expect(api.me).toHaveLength(2)
  expect(api.me[0]!.signal.aborted).toBe(true)
  expect(api.me[1]!.signal.aborted).toBe(false)
  await act(async () => {
    api.me[0]!.resolve(response({ id: "teacher-stale", role: "teacher", synthetic: true }))
    api.me[1]!.resolve(response({ id: "student-current", role: "student", synthetic: true }))
  })
  await screen.findByText("Spazio privato student-current · student")
  expect(screen.queryByText(/teacher-stale/)).toBeNull()
  expect(api.calls.filter(call => call.url === "/study/course")).toHaveLength(0)
})

test("unmount aborts an unfinished check and its late reply cannot start public or private reads", async () => {
  const api = server(), view = render(<StudyApp />)
  view.unmount()
  expect(api.me[0]!.signal.aborted).toBe(true)
  await act(async () => { api.me[0]!.resolve(response({ id: "teacher-late", role: "teacher", synthetic: true })) })
  expect(api.calls.filter(call => call.url === "/study/course")).toHaveLength(0)
  expect(screen.queryByText(/Spazio privato/)).toBeNull()
})

test("an anonymous visitor can exchange an invitation and enter the returned student scope", async () => {
  const api = server(); render(<StudyApp />)
  await act(async () => { api.me[0]!.resolve(response({ error: "unauthenticated" }, 401)) })
  await screen.findByText(course.title)
  fireEvent.click(screen.getByText("Accedi alla demo"))
  fireEvent.click(screen.getByRole("checkbox", { name: "Usa invito monouso" }))
  fireEvent.change(screen.getByLabelText("Accesso sintetico"), { target: { value: "synthetic-invitation" } })
  fireEvent.submit(screen.getByRole("button", { name: "Accedi" }).closest("form")!)
  await screen.findByText("Spazio privato student-invited · student")
  expect(api.calls.filter(call => call.url === "/study/invitations/accept")).toHaveLength(1)
  expect(screen.queryByRole("button", { name: "Invia interesse" })).toBeNull()
})

test("the login form stays available while the initial check is still pending", async () => {
  const api = server(); render(<StudyApp />)
  expect(api.me).toHaveLength(1)
  expect(screen.queryByRole("button", { name: "Invia interesse" })).toBeNull()
  fireEvent.click(screen.getByText("Accedi alla demo"))
  fireEvent.click(screen.getByRole("checkbox", { name: "Usa invito monouso" }))
  fireEvent.change(screen.getByLabelText("Accesso sintetico"), { target: { value: "synthetic-invitation" } })
  fireEvent.submit(screen.getByRole("button", { name: "Accedi" }).closest("form")!)
  await screen.findByText("Spazio privato student-invited · student")
  expect(api.me[0]!.signal.aborted).toBe(true)
  expect(api.calls.filter(call => call.url === "/study/invitations/accept")).toHaveLength(1)
  await act(async () => { api.me[0]!.resolve(response({ id: "teacher-stale", role: "teacher", synthetic: true })) })
  expect(screen.queryByText(/teacher-stale/)).toBeNull()
})

test("a failed login replaces an aborted public course read with one fresh read", async () => {
  const api = server({ deferCourse: true }); render(<StudyApp />)
  await act(async () => { api.me[0]!.resolve(response({ error: "unauthenticated" }, 401)) })
  expect(api.courses).toHaveLength(1)
  expect(api.packs).toHaveLength(1)
  fireEvent.click(screen.getByText("Accedi alla demo"))
  fireEvent.change(screen.getByLabelText("Accesso sintetico"), { target: { value: "synthetic-invalid-token" } })
  fireEvent.submit(screen.getByRole("button", { name: "Accedi" }).closest("form")!)
  await screen.findByText("Accesso demo non valido, già usato o scaduto.")
  expect(api.courses).toHaveLength(2)
  expect(api.packs).toHaveLength(2)
  expect(api.courses[0]!.signal.aborted).toBe(true)
  expect(api.courses[1]!.signal.aborted).toBe(false)
  expect(api.packs[0]!.signal.aborted).toBe(true)
  expect(api.packs[1]!.signal.aborted).toBe(false)
  await act(async () => { api.courses[1]!.resolve(response(course)); api.packs[1]!.resolve(response(pack)) })
  await screen.findByText(course.title)
  await screen.findByText(pack.title)
  expect((screen.getByRole("button", { name: "Invia interesse" }) as HTMLButtonElement).disabled).toBe(false)
  expect(api.calls.filter(call => call.url === "/study/course")).toHaveLength(2)
  expect(api.calls.filter(call => call.url === "/study/coursepack")).toHaveLength(2)
})
