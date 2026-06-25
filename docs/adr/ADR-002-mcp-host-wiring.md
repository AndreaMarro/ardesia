# ADR-002: Wire the lessonos stdio MCP transport into a host/launchd/client config

## Status

Proposed

Date: 2026-06-25

## Context

The WF1 read-only GitHub deep audit established:

- A new **stdio MCP transport** exists on the local-only branch
  **`feat/mcp-stdio-transport`** (lessonos). The audit **CONFIRMED this branch is
  local-only on the mac-mini** — `gh api` returns "Branch not found" (404). It has
  never been pushed to GitHub.
- The transport is runnable as a module: **`python -m lessonos.mcp`** (a 6-tool
  MCP server, per the task framing grounded in this branch).
- As with ADR-001, the durability root cause is the **local-bare origin**
  (`/Users/progettibelli/lessonos.git`): the branch lives on the bare repo and
  the mac-mini only, not on GitHub.

Today the MCP server is runnable but **not wired into any host**: there is no
launchd unit that starts it, and no client (Claude Code / Hermes worker)
configuration that registers it. A runnable-but-unwired server delivers no value
to any consumer.

Evidence boundary: the audit names the branch (`feat/mcp-stdio-transport@943fd38`)
and the run command (`python -m lessonos.mcp`) and the 6-tool count at the level
the task framing supports. The audit did **not** enumerate the six tools' names
or their schemas; those should be verified firsthand from the branch before
wiring a client config that references them.

## Decision Drivers

- **Make the server reachable** by a real consumer (Claude Code or a Hermes worker).
- **Choose a transport-appropriate host** — stdio MCP servers are spawned by the
  client as a child process, not a long-lived network daemon.
- **Durability** — the branch must reach GitHub before the wiring is durable.
- **Least privilege / loopback** — the server should not widen the network surface.

## Considered Options

### Option 1: Register as a stdio MCP server in the client config (Claude Code / Hermes)

- **Pros**: Matches the transport — the client spawns `python -m lessonos.mcp`
  on demand over stdio; no long-running daemon, no open port, no extra network
  surface; lifecycle is owned by the client.
- **Cons**: Only available while the client is running; each client needs its own
  registration.

### Option 2: Run it as a persistent launchd service

- **Pros**: Always-on, survives reboots, single managed process.
- **Cons**: **Mismatched to a stdio transport** — stdio MCP servers communicate
  over the spawning process's stdin/stdout, so a detached launchd daemon has no
  stdio peer to talk to. A launchd unit only makes sense if/when the transport is
  extended to a socket/HTTP listener (not what this branch ships).

### Option 3: Leave it runnable-but-unwired (status quo)

- **Pros**: Zero change.
- **Cons**: No consumer can reach the 6 tools; the work is inert.

## Decision

Adopt **Option 1**: wire `feat/mcp-stdio-transport` into a **client MCP config**
(Claude Code and/or Hermes worker) as a stdio server invoked via
`python -m lessonos.mcp`, **preconditioned** on pushing the local-only branch to
GitHub so the wiring is durable, and on firsthand enumeration of the 6 tools'
names/schemas before they are referenced.

Defer a launchd unit unless and until the transport gains a socket/HTTP listener;
launchd is the wrong host for a pure stdio server.

## Consequences

### Positive

- The 6-tool MCP server becomes reachable by a real consumer over the transport
  it was built for (stdio), with no new open ports.
- Lifecycle is owned by the client — no orphaned daemon to monitor.

### Negative

- The server is only available while the registering client runs.
- Each consuming client requires its own registration entry.
- Until the branch is pushed, the registration points at code that exists only on
  the local-bare/mac-mini lineage.

### Risks / Mitigations

- **Risk**: registering tools whose schemas were assumed rather than verified.
  **Mitigation**: enumerate the 6 tools firsthand from the branch before wiring.
- **Risk**: branch never pushed → config references non-durable code.
  **Mitigation**: push `feat/mcp-stdio-transport` to GitHub as a precondition.

## Implementation Notes

1. Push `feat/mcp-stdio-transport` (local-only `@943fd38`) to GitHub.
2. Enumerate the 6 tools (names + schemas) firsthand from the branch.
3. Add a stdio MCP server entry to the client config:
   command `python -m lessonos.mcp` (with the correct working dir / interpreter
   for the served environment).
4. Verify the client can list and call the 6 tools.

## Alternatives

See Considered Options. Launchd (Option 2) rejected as transport-mismatched for
a stdio server; status quo (Option 3) rejected as inert.

## Related Decisions

- ADR-001 (arm strict auth) — companion local-only lessonos branch sharing the
  same push/durability precondition.
- ADR-003 (engine re-import) — same local-bare-origin lineage trap.

## References

- WF1 audit evidence: GitHub deep audit — `feat/mcp-stdio-transport` CONFIRMED
  local-only (gh api "Branch not found"); lessonos local-bare origin
  `/Users/progettibelli/lessonos.git`.
