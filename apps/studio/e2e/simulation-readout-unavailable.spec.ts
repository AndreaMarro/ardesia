import { test, expect } from "@playwright/test"

for (const viewport of [{ name: "desktop", width: 1365, height: 950 }, { name: "mobile", width: 390, height: 844 }]) {
  test(`${viewport.name}: absent provider current stays unknown before and after board restore`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
    await page.goto("/?vista=simulatore-postit")
    await expect(page.getByTestId("multi-postit-workbench")).toHaveAttribute("data-multi-postit-workbench", "ready")
    const missing = page.locator('[data-solver-output-instance="sim-b"]')
    const measured = page.locator('[data-solver-output-instance="sim-a"]')
    await expect(missing).toHaveText("led current ?")
    await expect(measured).toHaveText("led current 0.0153")
    await page.getByRole("button", { name: "salva board post-it", exact: true }).click()
    await page.getByRole("button", { name: "ricarica board post-it", exact: true }).click()
    await expect(page.getByTestId("multi-postit-workbench")).toHaveAttribute("data-board-postit-reload-status", "board-reloaded")
    await expect(missing).toHaveText("led current ?")
    await expect(measured).toHaveText("led current 0.0153")
    await page.reload()
    await expect(missing).toHaveText("led current ?")
    await expect(measured).toHaveText("led current 0.0153")
    await missing.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath("unknown-provider-current.png") })
    expect(errors).toEqual([])
  })

  test(`${viewport.name}: real cable short and undo keep strip and canvas consistent`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
    await page.goto("/?vista=simulatore")
    const strip = page.locator("[data-live-physics-status]")
    await expect(strip).toHaveAttribute("data-live-physics-status", "ok")
    await page.locator('[aria-label="palette Cavo"]').click()
    await page.locator('[data-bb-hole="bb1:bus-top-plus-2"]').click()
    await page.locator('[data-bb-hole="bb1:b9"]').click()
    await expect(strip).toHaveAttribute("data-live-physics-status", "blocked")
    await expect(strip.locator("[data-led-readout]")).toHaveText("LED ?")
    await expect(strip).toContainText("corto circuito rilevato")
    await expect(strip).toHaveAttribute("data-live-physics-current-ma", "?")
    const canvas = page.locator("[data-experiment-id]").first()
    await expect(canvas.locator("[data-battery-led-readout]")).toHaveAttribute("data-battery-led-readout", "unknown")
    await expect(canvas).toContainText("corrente ? mA")
    await expect(canvas.locator('[aria-label$="stato non disponibile"]')).toHaveCount(1)
    await strip.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath("workbench-short-unknown.png") })
    // Undo is keyboard-activated on the real, focused SVG control.
    await page.locator("[data-montaggio-canvas-undo]").focus()
    await page.keyboard.press("Enter")
    await expect(strip).toHaveAttribute("data-live-physics-status", "ok")
    await expect(strip.locator("[data-led-readout]")).toHaveText("LED ON")
    await expect(canvas.locator("[data-battery-led-readout]")).toHaveAttribute("data-battery-led-readout", "on")
    expect(errors).toEqual([])
  })

  for (const scenario of ["healthy", "no-rgb", "unsupported", "short-circuit"] as const) {
    test(`${viewport.name}: RGB ${scenario} gives honest readout after cold restore`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      const errors: string[] = []
      page.on("pageerror", error => errors.push(error.message))
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
      await page.goto("/")
      await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15000 })
      await page.evaluate(async kind => {
        const sourcePath = "/src/toolhost/ToolCanvasEmbeddable.tsx"
        const factories = await import(/* @vite-ignore */ sourcePath)
        const scene = factories.createV1Cap9Esp6SimulationScene()
        if (kind === "no-rgb") scene.components = scene.components.filter((component: { type: string }) => component.type !== "rgb-led")
        if (kind === "unsupported") scene.components.push({ id: "unsupported-nano", type: "nano-r4", label: "Nano" })
        if (kind === "short-circuit") scene.connections.push({ from: "bat1:positive", to: "bat1:negative", color: "red", kind: "wire" })
        const element = factories.createToolEmbedElement({
          embedId: factories.ELAB_V1_RGB_LAMP_EMBED_ID,
          state: { kind: "simulation-scene-v1", scene },
        })
        const harness = (window as unknown as { __MAESTRO_TEST__?: { apiRef?: { current?: { updateScene(state: { elements: unknown[] }): void } } } }).__MAESTRO_TEST__
        if (!harness?.apiRef?.current) throw new Error("existing dev board harness unavailable")
        harness.apiRef.current.updateScene({ elements: [element] })
      }, scenario)
      const canvas = page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]').first()
      await expect(canvas).toBeVisible({ timeout: 15000 })
      // The shared readout lives in the existing legacy harness, adjacent to
      // the core canvas. It is not a descendant of the core renderer.
      const legacy = page.locator("[data-legacy-free-assembly-harness]").first()
      await legacy.locator("summary").dispatchEvent("click")
      const readout = legacy.locator("[data-led-readout]")
      await expect(readout).toHaveAttribute("data-led-readout", scenario === "healthy" ? "on" : "unknown")
      await expect(readout).toContainText(scenario === "healthy" ? "LED RGB ON" : "LED RGB ?")
      if (scenario !== "healthy") {
        await expect(legacy.locator("[data-rgb-channels]")).toContainText("solve non disponibile")
        if (scenario !== "no-rgb") await expect(legacy.locator('[aria-label^="LED RGB"]')).toHaveAttribute("aria-label", "LED RGB stato non disponibile")
      }
      await expect.poll(() => page.evaluate(() => Object.values(localStorage).some(value => typeof value === "string" && value.includes("maestro-tool://"))), { timeout: 8000 }).toBe(true)
      await page.reload()
      await expect(legacy).toBeAttached({ timeout: 20000 })
      await legacy.locator("summary").dispatchEvent("click")
      await expect(readout).toHaveAttribute("data-led-readout", scenario === "healthy" ? "on" : "unknown", { timeout: 20000 })
      await expect(readout).toContainText(scenario === "healthy" ? "LED RGB ON" : "LED RGB ?")
      await readout.scrollIntoViewIfNeeded()
      await page.screenshot({ path: testInfo.outputPath(`rgb-${scenario}.png`) })
      expect(errors).toEqual([])
    })
  }
}
