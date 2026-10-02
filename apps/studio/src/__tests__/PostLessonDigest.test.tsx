// @vitest-environment jsdom
// Synthetic identity/lifecycle evidence through the actual store, log and view.
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb"
import RecapView from "../RecapView"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"
import * as eventLogs from "../lessonos/indexedDbEventLog"
import { createEventEnvelopeV2, type JsonObject } from "../core/contracts/eventEnvelope"
import { readCircuitProof, type CircuitTraceStep } from "../toolhost/circuitCheckAdapter"
import { circuitProofEvent, circuitTraceEvent } from "../lessonos/circuitCheckEvent"
import { buildCircuitCheckInsert } from "../toolhost/ToolCanvasEmbeddable"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import type { LessonOsEvent } from "../lessonos/eventlog"

const A = "recap-proof-a"
const B = "recap-proof-b"
const SESSION = "11111111-1111-4111-8111-111111111111"
const producer = { id: "test.local.postlesson", version: "1.0.0", commitSha: "a".repeat(40) }
let nextId = 0
const uuid = () => `00000000-0000-4000-8000-${(++nextId).toString(16).padStart(12, "0")}`

function workspace() {
  const data = new Map<string, ArrayBuffer>()
  const driver: WorkspaceDriver = {
    name: "synthetic-memory", available: () => true, init: async () => true,
    read: async (path) => data.has(path) ? new Blob([data.get(path)!]) : null,
    write: async (path, blob) => { data.set(path, await blob.arrayBuffer()) },
    delete: async (path) => { data.delete(path) },
    list: async (prefix) => [...data].filter(([p]) => !prefix || p.startsWith(prefix))
      .map(([path, bytes]) => ({ path, data: new Blob([bytes]), mtime: 0 })),
  }
  const store = new WorkspaceStore()
  Object.assign(store, { driver, fallback: driver })
  return store
}

async function logWithLessons(started = false) {
  const log = await eventLogs.createEventLogStore({ factory: undefined })
  for (const room of [A, B]) {
    if (started) await log.appendEnvelope(createEventEnvelopeV2({ lessonId: room, sessionId: SESSION,
      kind: "lesson.started", actor: { type: "teacher", id: "synthetic" }, producer,
      causationId: null, idempotencyKey: null, evidence: [{ ref: `lesson:${room}`, resolution: "verified" }],
      payload: { room },
    }, { eventId: uuid, now: () => new Date(900) }))
    await log.appendEnvelope(createEventEnvelopeV2({ lessonId: room, sessionId: SESSION,
      kind: "concept.introduced", actor: { type: "teacher", id: "synthetic" }, producer,
      causationId: null, idempotencyKey: null, evidence: [{ ref: `board:${room}`, resolution: "verified" }],
      payload: { conceptId: room, labels: { it: room === A ? "Concetto SOLO A" : "Concetto SOLO B" } },
    }, { eventId: uuid, now: () => new Date(1000) }))
  }
  return log
}

// Per-room legacy compatibility keeps the digest lifecycle tests focused.
// Actual producer bytes are covered separately by lessonRecapRecorder.test.ts.
async function visibleRecap(store: WorkspaceStore, room: string) {
  const text = JSON.stringify({ t: 1000, type: "math.insert", latex: "V = R I" })
  await store.write(roomPaths(room).journal, new Blob([text]))
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe("post-lesson canonical identity", () => {
  it("shows A's observed circuit step in B only after explicit retrieval, without importing B's correction", async () => {
    const store = workspace()
    await visibleRecap(store,B)
    const netlist = "V1 p 0 14 volt\nR1 p q 4 ohm\nR2 q 0 6 ohm\n? voltage R2"
    const fingerprint = "e".repeat(64)
    const proof = readCircuitProof({outcome:"solved",netlist,fingerprint,
      source_sha:"a".repeat(40),lesson_build:"b".repeat(64),title:"Tensione R2",method:"divider",
      verification:{electrical_claim:"VERIFIED",backend:"CLOSED",lesson:"exact-answer-crosscheck",product_verified:false},
      answer:{exact:"42/5",unit:"V",reference:"q → 0"},
      steps:[{title:"Serie",explanation:"Riduzione",svg:'<svg xmlns="http://www.w3.org/2000/svg"></svg>',equations:["R1+R2=10 Ω"]}],
    },netlist)
    const step: CircuitTraceStep = {transcription:"R1+R2=20 Ω",operation:"serie",first:"R1",second:"R2",
      claimed_value:"20",reading:"clear"}
    const inserted = buildCircuitCheckInsert([])!
    await store.write(roomPaths(A).scene,new Blob([JSON.stringify({elements:[{...inserted.embed,customData:{
      [EMBED_DATA_KEY]:{owner:"io.ardesia.circuit-reasoning",state:{kind:"circuitcheck-proof-v1",
        netlist,method:"auto",proof,selectedStep:0,trace:[],diagnosis:null}},
    }}]})]))
    const factory = new IDBFactory()
    vi.stubGlobal("indexedDB",factory)
    vi.stubGlobal("IDBKeyRange",IDBKeyRange)
    const writer = new eventLogs.IndexedDbEventLog({factory})
    await writer.open()
    const append = async (event: LessonOsEvent, lessonId: string) => {
      const {kind,t:_t,evidence,...payload} = event
      await writer.appendEnvelope(createEventEnvelopeV2<string,JsonObject>({lessonId,sessionId:SESSION,kind,
        actor:{type:"teacher",id:"synthetic"},producer,causationId:null,idempotencyKey:null,
        evidence:evidence.map(ref => ({ref,resolution:"verified" as const})),payload:payload as unknown as JsonObject,
      },{eventId:uuid,now:()=>new Date(1000)}))
    }
    await append(await circuitProofEvent(proof,inserted.embedId,1000),A)
    const wrong = await circuitTraceEvent(proof,[step],{outcome:"first_invalid",step:1,
      message:"Somma errata",focus:["R1"],circuit_fingerprint:fingerprint},inserted.embedId,1100)
    await append(wrong,A)
    await append(await circuitTraceEvent(proof,[{...step,claimed_value:"10"}],{
      outcome:"valid_so_far",step:null,message:"Corretto",focus:[],circuit_fingerprint:fingerprint,
    },inserted.embedId,1200,wrong.errorId),B)
    await writer.close()
    render(<RecapView store={store} room={B} />)
    await screen.findByRole("button",{name:"Cerca lezioni precedenti"})
    expect(screen.queryByText("R1+R2=20 Ω")).toBeNull()
    fireEvent.click(screen.getByRole("button",{name:"Cerca lezioni precedenti"}))
    await screen.findByRole("combobox",{name:"Lezione precedente"})
    fireEvent.click(screen.getByRole("button",{name:"Apri evidenze"}))
    await screen.findByText(/Passaggio osservato 1: R1\+R2=20 Ω/)
    expect(screen.getByText(/Passaggio ancora da rivedere/)).toBeDefined()
    expect(screen.getByText(/Risultato storico del circuito: 42\/5 V/)).toBeDefined()
    const check = new eventLogs.IndexedDbEventLog({factory})
    await check.open()
    expect(await check.readEnvelopesByLesson(B)).toHaveLength(1)
    await check.close()
  })

  for (const started of [false, true]) it(`excludes overlapping B facts from A (start=${started})`, async () => {
    const store = workspace()
    await visibleRecap(store, A)
    const log = await logWithLessons(started)
    vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")?.srcdoc).toContain("Concetto SOLO A"))
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO B")
  })

  it("clears the prior digest if reading the next lesson fails", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    await visibleRecap(store, B)
    const log = await logWithLessons()
    const factory = vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container, rerender } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")?.srcdoc).toContain("Concetto SOLO A"))
    factory.mockRejectedValue(new Error("synthetic read failure"))
    rerender(<RecapView store={store} room={B} />)
    await waitFor(() => expect(container.textContent).not.toContain("caricamento…"))
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO A")
  })

  it("does not assign unscoped legacy facts to a named lesson", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    const log = await eventLogs.createEventLogStore({ factory: undefined })
    await log.append({ kind: "concept.introduced", conceptId: "unassigned",
      labels: { it: "Unassigned private fact" }, t: 1000, evidence: ["board:legacy"] })
    vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull())
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Unassigned private fact")
  })

  it("closes the opened log even when reading rejects", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    const log = await logWithLessons()
    const close = vi.fn().mockResolvedValue(undefined)
    Object.assign(log, { close })
    vi.spyOn(log, "readAll").mockRejectedValue(new Error("synthetic read failure"))
    vi.spyOn(log, "readEnvelopesByLesson").mockRejectedValue(new Error("synthetic read failure"))
    vi.spyOn(eventLogs, "createEventLogStore").mockResolvedValue(log)
    const { container } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(container.querySelector("iframe")).not.toBeNull())
    expect(close).toHaveBeenCalledOnce()
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO")
  })

  it("ignores a late result after navigating to a different lesson", async () => {
    const store = workspace()
    await visibleRecap(store, A)
    await visibleRecap(store, B)
    const log = await logWithLessons()
    let resolveOpen!: (value: typeof log) => void
    const pending = new Promise<typeof log>((resolve) => { resolveOpen = resolve })
    const factory = vi.spyOn(eventLogs, "createEventLogStore")
      .mockReturnValueOnce(pending).mockResolvedValue(log)
    const { container, rerender } = render(<RecapView store={store} room={A} />)
    await waitFor(() => expect(factory).toHaveBeenCalledOnce())
    rerender(<RecapView store={store} room={B} />)
    await waitFor(() => expect(container.querySelector("iframe")?.srcdoc).toContain("Concetto SOLO B"))
    await act(async () => { resolveOpen(log); await pending })
    expect(container.querySelector("iframe")?.srcdoc).not.toContain("Concetto SOLO A")
  })
})
