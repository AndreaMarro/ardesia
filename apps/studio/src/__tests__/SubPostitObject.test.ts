// S3 — sub-post-it: linkage al parent, round-trip con provenienza, orphan
// policy esplicita (detach/remove/keep), zero branch plugin-specifici, restore
// fail-closed.

import { describe, expect, it } from "vitest"
import {
  childrenOf,
  createSubPostitObject,
  detachSubPostit,
  detectOrphans,
  resolveOrphans,
  restoreSubPostitObject,
  serializeSubPostitObject,
  SUB_POSTIT_ROLES,
  type SubPostitObject,
  type SubPostitRole,
} from "../toolhost/subPostitObject.ts"

const bounds = { x: 10, y: 20, width: 200, height: 120 }

function child(
  instanceId: string,
  parentInstanceId: string | null,
  role: SubPostitRole = "notes",
  evidenceRefs: string[] = ["board:elem-1"],
): SubPostitObject {
  return createSubPostitObject({
    instanceId,
    parentInstanceId,
    role,
    bounds,
    provenance: { evidenceRefs },
    state: { note: "x" },
  })
}

describe("createSubPostitObject", () => {
  it("figlio legato al parent per instanceId", () => {
    const c = child("sub-1", "plugin-a")
    expect(c.kind).toBe("sub-postit-object")
    expect(c.instanceId).toBe("sub-1")
    expect(c.parentInstanceId).toBe("plugin-a")
    expect(childrenOf([c], "plugin-a")).toHaveLength(1)
    expect(childrenOf([c], "plugin-b")).toHaveLength(0)
  })

  it("id/parent malformati → throw (fail-closed)", () => {
    expect(() => child("Bad/Id", "plugin-a")).toThrow()
    expect(() => child("sub-1", "Bad.Parent")).toThrow()
  })

  it("provenienza di default vuota; input clonato (no aliasing)", () => {
    const refs = ["manual:vol1:p3"]
    const c = createSubPostitObject({
      instanceId: "sub-2",
      parentInstanceId: "plugin-a",
      role: "manual",
      bounds,
      provenance: { evidenceRefs: refs },
      state: {},
    })
    refs.push("mutato-dopo")
    expect(c.provenance.evidenceRefs).toEqual(["manual:vol1:p3"])
  })
})

describe("ruoli generici — un solo percorso di codice", () => {
  it("ogni role attraversa create/serialize/restore identico", () => {
    for (const role of SUB_POSTIT_ROLES) {
      const c = child(`sub-${role}`, "plugin-a", role, [`manual:vol1:${role}`])
      const round = restoreSubPostitObject(serializeSubPostitObject(c))
      expect(round.role).toBe(role)
      expect(round.provenance.evidenceRefs).toEqual([`manual:vol1:${role}`])
    }
  })
})

describe("serialize / restore round-trip", () => {
  it("preserva provenienza e stato", () => {
    const c = child("sub-1", "plugin-a", "diagnostics", ["board:e1", "plugin:com.ardesia.manual-evidence@0.1.0"])
    const restored = restoreSubPostitObject(serializeSubPostitObject(c))
    expect(restored).toEqual(c)
    expect(restored.provenance.evidenceRefs).toEqual([
      "board:e1",
      "plugin:com.ardesia.manual-evidence@0.1.0",
    ])
  })

  it("figlio detached (parent null) round-trippa", () => {
    const c = detachSubPostit(child("sub-1", "plugin-a"))
    expect(c.parentInstanceId).toBeNull()
    const restored = restoreSubPostitObject(serializeSubPostitObject(c))
    expect(restored.parentInstanceId).toBeNull()
  })

  it("payload malformati → throw", () => {
    expect(() => restoreSubPostitObject(null)).toThrow()
    expect(() => restoreSubPostitObject({ kind: "wrong" })).toThrow()
    expect(() =>
      restoreSubPostitObject({ ...serializeSubPostitObject(child("s", "p")), role: "bogus" }),
    ).toThrow()
    expect(() =>
      restoreSubPostitObject({ ...serializeSubPostitObject(child("s", "p")), provenance: { evidenceRefs: [1] } }),
    ).toThrow()
  })
})

describe("orphan policy esplicita", () => {
  const live = ["plugin-a"] // solo plugin-a è vivo
  const kids = () => [child("sub-a", "plugin-a"), child("sub-b", "plugin-gone"), detachSubPostit(child("sub-c", "plugin-a"))]

  it("detectOrphans: parent mancante = orfano; detached NON è orfano", () => {
    const orphans = detectOrphans(kids(), live)
    expect(orphans.map((c) => c.instanceId)).toEqual(["sub-b"])
  })

  it("keep: lascia tutto invariato", () => {
    const out = resolveOrphans(kids(), live, "keep")
    expect(out.map((c) => c.instanceId)).toEqual(["sub-a", "sub-b", "sub-c"])
    expect(out.find((c) => c.instanceId === "sub-b")?.parentInstanceId).toBe("plugin-gone")
  })

  it("remove: elimina gli orfani", () => {
    const out = resolveOrphans(kids(), live, "remove")
    expect(out.map((c) => c.instanceId)).toEqual(["sub-a", "sub-c"])
  })

  it("detach: promuove gli orfani a standalone (parent null)", () => {
    const out = resolveOrphans(kids(), live, "detach")
    expect(out.map((c) => c.instanceId)).toEqual(["sub-a", "sub-b", "sub-c"])
    expect(out.find((c) => c.instanceId === "sub-b")?.parentInstanceId).toBeNull()
    // il non-orfano resta legato
    expect(out.find((c) => c.instanceId === "sub-a")?.parentInstanceId).toBe("plugin-a")
  })
})
