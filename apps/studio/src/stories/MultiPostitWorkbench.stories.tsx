import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import MultiPostitWorkbench from "../design/MultiPostitWorkbench"

const meta = {
  title: "Product/Multi post-it workbench",
  component: MultiPostitWorkbench,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MultiPostitWorkbench>

export default meta
type Story = StoryObj<typeof meta>

export const Recovery: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const workbench = canvas.getByTestId("multi-postit-workbench")

    await step("freeze a real serializable snapshot", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /esporta post-it/i }))
      await expect(workbench).toHaveAttribute("data-postit-restore-status", "snapshot-ready")
      await expect(workbench).toHaveAttribute("data-serialized-postit-count", "3")
    })

    await step("mutate the visible workbench", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /seleziona LED su sim-a/i }))
      await userEvent.click(canvas.getByRole("button", { name: /espandi sim-a/i }))
      await expect(
        canvasElement.querySelector('[data-selected-component-instance="sim-a"]'),
      ).toHaveTextContent("led-a")
      await expect(
        canvasElement.querySelector('[data-function-surface-instance="sim-a"]'),
      ).toHaveAttribute("data-function-surface-mode", "expanded")
    })

    await step("restore the exact snapshot", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /ripristina post-it/i }))
      await expect(workbench).toHaveAttribute("data-postit-restore-status", "restored")
      await expect(
        canvasElement.querySelector('[data-selected-component-instance="sim-a"]'),
      ).toHaveTextContent("nessuno")
      await expect(
        canvasElement.querySelector('[data-function-surface-instance="sim-a"]'),
      ).toHaveAttribute("data-function-surface-mode", "normal")
    })
  },
}
