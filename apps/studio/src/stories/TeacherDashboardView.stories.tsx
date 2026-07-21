import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import TeacherDashboardView, {
  type TeacherDashboardViewDeps,
} from "../design/TeacherDashboardView"
import type { AppendedEvent } from "../lessonos/eventlog"
import {
  STORY_JOURNAL_EVENTS,
  STORY_LESSON_EVENTS,
  STORY_READ_ONLY_EVENTS,
  storyEventLog,
} from "./contractFixtures"

const appendDenied: NonNullable<TeacherDashboardViewDeps["appendEvent"]> = async () => {
  throw new Error("Storybook projection fixture is read-only")
}

function readyDeps(
  events: readonly AppendedEvent[] = STORY_LESSON_EVENTS,
  journalEvents = STORY_JOURNAL_EVENTS,
): TeacherDashboardViewDeps {
  return {
    loadEvents: async () => events,
    loadJournalEvents: async () => journalEvents,
    journalRoom: "classe-pseudonima-a",
    appendEvent: appendDenied,
    eventLog: storyEventLog(events),
  }
}

const meta = {
  title: "Product/Teacher dashboard",
  component: TeacherDashboardView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TeacherDashboardView>

export default meta
type Story = StoryObj<typeof meta>

export const Normal: Story = {
  args: { deps: readyDeps() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const lessons = await canvas.findByTestId("zstat-lessons.count")
    await expect(lessons).toHaveAttribute("data-zstat-value", "1")
    await expect(
      await canvas.findByRole("button", { name: /genera pack/i }),
    ).toBeVisible()
  },
}

export const Empty: Story = {
  args: { deps: readyDeps([]) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(/nessun candidato in coda/i)).toBeVisible()
    await expect(await canvas.findByTestId("zstat-lessons.count")).toHaveAttribute(
      "data-zstat-value",
      "0",
    )
  },
}

export const Loading: Story = {
  args: {
    deps: {
      loadEvents: () => new Promise<readonly AppendedEvent[]>(() => undefined),
      loadJournalEvents: async () => [],
      appendEvent: appendDenied,
      eventLog: storyEventLog([]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/calcolo le statistiche/i)).toHaveAttribute(
      "aria-busy",
      "true",
    )
    await expect(canvas.getByText(/leggo l.event log/i)).toBeVisible()
  },
}

export const Failure: Story = {
  name: "Error",
  args: {
    deps: {
      loadEvents: async () => {
        throw new Error("storybook:event-log-unavailable")
      },
      loadJournalEvents: async () => [],
      appendEvent: appendDenied,
      eventLog: storyEventLog([]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(/memoria della lezione non leggibile/i),
    ).toBeVisible()
    await expect(canvas.queryByText(/nessun candidato in coda/i)).not.toBeInTheDocument()
  },
}

/**
 * The dashboard data path is a read-only LessonOS projection. Its explicit
 * product actions remain append-only and are intentionally not exercised here.
 */
export const ReadOnlyProjection: Story = {
  args: {
    deps: {
      ...readyDeps(STORY_READ_ONLY_EVENTS, []),
      focusNodeId: "concetto:legge-ohm",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(/projection LessonOS \(read-only\) \+ azioni append-only/i),
    ).toBeVisible()
    await expect(await canvas.findByTestId("zgraph-focus")).toHaveTextContent(
      "Legge di Ohm",
    )
    await expect(await canvas.findByText(/nessun candidato in coda/i)).toBeVisible()
    await expect(
      canvas.queryByRole("button", { name: /genera pack|esporta/i }),
    ).not.toBeInTheDocument()
    const evidence = canvasElement.querySelector(
      '[data-zgraph-evidence="board:wire-pseudonimo-1"]',
    )
    await expect(evidence).not.toBeNull()
    await expect(evidence).toBeVisible()
  },
}
