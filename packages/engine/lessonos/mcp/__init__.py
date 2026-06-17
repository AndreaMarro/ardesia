"""MCP wrappers exposing LessonOS engine capabilities (M3 white-label B2B).

In-process, dependency-free JSON-RPC 2.0 surfaces (MCP semantics). No network,
no fs/shell capability — the transport is the caller's concern.
"""

from lessonos.mcp.grounded_memory import (
    GroundedMemoryServer,
    PROTOCOL_VERSION,
    TOOL_NAME,
)

__all__ = ["GroundedMemoryServer", "PROTOCOL_VERSION", "TOOL_NAME"]
