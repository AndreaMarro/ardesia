// @vitest-environment node
//
// P0-D authoring — test harness dello handshake per autori di plugin: il
// lato HOST simulato consegna host.hello (nonce fresco, porta nei
// transferables) e verifica che il tool risponda tool.ready SULLA PORTA con
// l'eco esatto del nonce, entro il timeout. Report falsificabile con check
// chiusi — ogni modo di sbagliare l'handshake ha il suo check che fallisce.
// Il contratto è quello REALE (schemi zod di toolhost-protocol/messages).

import { describe, expect, it } from "vitest"
import {
  runHandshakeHarness,
  type HarnessToolTarget,
} from "../toolhost/authoring/testHarness.ts"
import type { HostHello } from "../toolhost-protocol/messages.ts"

function check(report: Awaited<ReturnType<typeof runHandshakeHarness>>, id: string) {
  const found = report.checks.find((c) => c.id === id)
  if (!found) throw new Error(`check ${id} assente dal report`)
  return found
}

/** Tool corretto: risponde tool.ready sulla porta ecoando nonce e protocolVersion. */
function goodTool(): HarnessToolTarget {
  return {
    deliverHello(hello: HostHello, port: MessagePort) {
      port.postMessage({
        jsonrpc: "2.0",
        id: "ready-1",
        method: "tool.ready",
        params: { nonce: hello.params.nonce, protocolVersion: hello.params.protocolVersion },
      })
    },
  }
}

describe("runHandshakeHarness", () => {
  it("tool corretto → report ok, tutti i check pass", async () => {
    const report = await runHandshakeHarness(goodTool(), { timeoutMs: 200 })
    expect(report.ok).toBe(true)
    expect(check(report, "tool-ready-received").pass).toBe(true)
    expect(check(report, "nonce-echoed").pass).toBe(true)
    expect(check(report, "ready-well-formed").pass).toBe(true)
    expect(check(report, "no-out-of-band-reply").pass).toBe(true)
  })

  it("il nonce è FRESCO a ogni run (mai riusato)", async () => {
    const seen: string[] = []
    const spyTool: HarnessToolTarget = {
      deliverHello(hello, port) {
        seen.push(hello.params.nonce)
        port.postMessage({
          jsonrpc: "2.0",
          id: "ready-1",
          method: "tool.ready",
          params: { nonce: hello.params.nonce, protocolVersion: hello.params.protocolVersion },
        })
      },
    }
    await runHandshakeHarness(spyTool, { timeoutMs: 200 })
    await runHandshakeHarness(spyTool, { timeoutMs: 200 })
    expect(seen).toHaveLength(2)
    expect(seen[0]).not.toBe(seen[1])
    expect(seen[0].length).toBeGreaterThanOrEqual(16)
  })

  it("nonce sbagliato → nonce-echoed FAIL (report non ok)", async () => {
    const badNonceTool: HarnessToolTarget = {
      deliverHello(hello, port) {
        port.postMessage({
          jsonrpc: "2.0",
          id: "ready-1",
          method: "tool.ready",
          params: { nonce: "x".repeat(16), protocolVersion: hello.params.protocolVersion },
        })
      },
    }
    const report = await runHandshakeHarness(badNonceTool, { timeoutMs: 200 })
    expect(report.ok).toBe(false)
    expect(check(report, "tool-ready-received").pass).toBe(true)
    expect(check(report, "nonce-echoed").pass).toBe(false)
  })

  it("tool muto → timeout, tool-ready-received FAIL", async () => {
    const silentTool: HarnessToolTarget = { deliverHello() {} }
    const report = await runHandshakeHarness(silentTool, { timeoutMs: 50 })
    expect(report.ok).toBe(false)
    expect(check(report, "tool-ready-received").pass).toBe(false)
  })

  it("risposta malformata (params fuori schema) → ready-well-formed FAIL", async () => {
    const malformedTool: HarnessToolTarget = {
      deliverHello(hello, port) {
        port.postMessage({
          jsonrpc: "2.0",
          id: "ready-1",
          method: "tool.ready",
          params: { nonce: hello.params.nonce }, // manca protocolVersion
        })
      },
    }
    const report = await runHandshakeHarness(malformedTool, { timeoutMs: 200 })
    expect(report.ok).toBe(false)
    expect(check(report, "ready-well-formed").pass).toBe(false)
  })

  it("risposta fuori-canale (non sulla porta) → no-out-of-band-reply FAIL (mai token in window)", async () => {
    const outOfBandTool: HarnessToolTarget = {
      deliverHello(hello, port) {
        // risponde correttamente sulla porta MA duplica la risposta fuori-canale
        port.postMessage({
          jsonrpc: "2.0",
          id: "ready-1",
          method: "tool.ready",
          params: { nonce: hello.params.nonce, protocolVersion: hello.params.protocolVersion },
        })
        this.outOfBand?.({ leaked: hello.params.nonce })
      },
      onOutOfBandMessage(cb) {
        ;(this as { outOfBand?: (d: unknown) => void }).outOfBand = cb
        return () => {}
      },
    } as HarnessToolTarget & { outOfBand?: (d: unknown) => void }
    const report = await runHandshakeHarness(outOfBandTool, { timeoutMs: 200 })
    expect(report.ok).toBe(false)
    expect(check(report, "no-out-of-band-reply").pass).toBe(false)
  })

  it("al tool.ready valido il harness consegna il ReadyAck (bearer di prova + caps concesse)", async () => {
    let ack: unknown = null
    const ackAwareTool: HarnessToolTarget = {
      deliverHello(hello, port) {
        port.onmessage = (e) => {
          ack = e.data
        }
        port.postMessage({
          jsonrpc: "2.0",
          id: "ready-7",
          method: "tool.ready",
          params: { nonce: hello.params.nonce, protocolVersion: hello.params.protocolVersion },
        })
      },
    }
    const report = await runHandshakeHarness(ackAwareTool, {
      timeoutMs: 200,
      grantedCaps: { "board.read": {} },
    })
    expect(report.ok).toBe(true)
    // l'ack arriva async sulla porta del tool
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(ack).toMatchObject({
      jsonrpc: "2.0",
      id: "ready-7",
      result: { grantedCaps: { "board.read": {} } },
    })
  })
})
