import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, within } from "storybook/test"

import SavedLessonsPanel from "../SavedLessonsPanel"
import { LessonOsApiClient } from "../lessonos/apiClient"

const OFFLINE_BASE_URL = "https://offline.invalid"
const offlineFetch = fn<typeof fetch>(async () => {
  throw new TypeError("Synthetic offline transport")
})
const offlineClient = new LessonOsApiClient({
  baseUrl: OFFLINE_BASE_URL,
  fetch: offlineFetch,
})

const meta = {
  title: "Product/Saved lessons/Panel",
  component: SavedLessonsPanel,
  args: {
    client: offlineClient,
  },
} satisfies Meta<typeof SavedLessonsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Offline: Story = {
  beforeEach: () => {
    offlineFetch.mockClear()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(/lezioni salvate non disponibili/i),
    ).toBeVisible()
    await expect(
      canvas.getByText(/impossibile raggiungere il servizio delle lezioni salvate/i),
    ).toBeVisible()
    await expect(offlineFetch).toHaveBeenCalledTimes(1)
    await expect(offlineFetch).toHaveBeenCalledWith(
      `${OFFLINE_BASE_URL}/v1/saved-lessons`,
      expect.objectContaining({ method: "GET" }),
    )
  },
}
