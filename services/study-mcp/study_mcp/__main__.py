"""stdio only: stdout belongs exclusively to SDK protocol frames."""
import asyncio
import logging
import sys

from mcp.server.stdio import stdio_server

from .config import Settings
from .server import create_server


async def serve(settings):
    server = create_server(settings)
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main():
    # Avoid request/exception logging from dependencies: it can contain source
    # text, private response bodies or a session. Diagnostics are fixed strings.
    logging.disable(logging.CRITICAL)
    try:
        settings = Settings.from_environment()
    except ValueError:
        print('Study MCP configuration unavailable.', file=sys.stderr)
        return 1
    try:
        asyncio.run(serve(settings))
    except (KeyboardInterrupt, BrokenPipeError):
        return 0
    except Exception:
        print('Study MCP transport unavailable.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
