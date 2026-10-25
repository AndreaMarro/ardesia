// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import createDOMPurify from "dompurify"
import mermaid from "mermaid"

// Narrow dependency characterizations for the installed sanitizer, whose version
// is pinned by Studio's override. These non-default modes are advisory probes;
// they do not establish an exploit through Ardesia's current string/SVG consumer.
describe("DOMPurify dependency security contract", () => {
  it("removes split template expressions from an attached shadow root", () => {
    // GHSA-cg2g-xh64-v4q7; inert marker, never evaluated as a template.
    const purifier = createDOMPurify(window)
    const host = document.createElement("div")
    const shadow = host.attachShadow({ mode: "open" })
    shadow.append(
      document.createTextNode("$"),
      document.createElement("object"),
      document.createTextNode("{ardesia_probe}"),
    )

    purifier.sanitize(host, { IN_PLACE: true, SAFE_FOR_TEMPLATES: true })
    shadow.normalize()

    expect(shadow.querySelector("object")).toBeNull()
    expect(shadow.textContent).not.toContain("${ardesia_probe}")
  })

  it("disarms a resource node when a hook removes its parent", () => {
    // GHSA-mrv2-3pqr-j5jr. No resource is loaded and no handler is executed.
    const purifier = createDOMPurify(window)
    const root = document.createElement("div")
    root.innerHTML = '<figure><img class="drop"><img id="retained" onerror="ardesia_probe"></figure><p>safe</p>'
    const retained = root.querySelector("#retained")!
    purifier.addHook("afterSanitizeAttributes", (node) => {
      if (node.getAttribute?.("class") === "drop") node.parentElement?.remove()
    })

    purifier.sanitize(root, { IN_PLACE: true })

    expect(root.innerHTML).toBe("<p>safe</p>")
    expect(retained.getAttribute("onerror")).toBeNull()
  })
})

it("preserves a Mermaid paste label while sanitizing its untrusted HTML", async () => {
  // The same Mermaid parser and default security level used by Excalidraw's
  // paste adapter. Parsing exercises its real label sanitizer without SVG layout.
  mermaid.initialize({ startOnLoad: false, flowchart: { curve: "linear" }, maxEdges: 500, maxTextSize: 50000 })
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(
    'flowchart TD\nA["Fisica <img onerror=ardesia_probe>"] --> B["Prova"]',
  )
  if (!("getVertices" in diagram.db) || typeof diagram.db.getVertices !== "function") {
    throw new Error("Mermaid flowchart vertices are unavailable")
  }
  const vertices = diagram.db.getVertices() as Map<string, { text: string }>
  const label = vertices.get("A")!.text
  const template = document.createElement("template")
  template.innerHTML = label

  expect(template.content.textContent).toContain("Fisica")
  expect(vertices.get("B")!.text).toBe("Prova")
  expect([...template.content.querySelectorAll("*")].flatMap((element) =>
    [...element.attributes].filter((attribute) => /^on/i.test(attribute.name)),
  )).toEqual([])
})
