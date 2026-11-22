"""Run as python3 -m tools.assistente_editoriale. Capabilities and courses are operator choices."""
import argparse
import json
import os
import sys
from pathlib import Path

from server.adapters.contracts import schema
from server.adapters.editorial_mcp import MCP, check_proposal
from server.adapters.providers import ChatCompletions, Ollama
from server.domain.errors import Problem
from server.editorial.service import EditorialWorkspace
from server.store import ROOT, catalog_seed


def main():
    parser = argparse.ArgumentParser(description="Strumenti editoriali Cric")
    parser.add_argument("operation", choices=("mcp", "suggest"))
    parser.add_argument("--course", action="append", required=True)
    parser.add_argument("--allow", action="append", choices=("search", "read", "propose"), required=True)
    parser.add_argument("--concepts", type=Path, default=ROOT / "examples/authoring/concepts.json")
    parser.add_argument("--provider", choices=("ollama", "chat-completions"))
    parser.add_argument("--endpoint")
    parser.add_argument("--model")
    parser.add_argument("--object")
    args = parser.parse_args()
    workspace = EditorialWorkspace(catalog_seed(), set(args.course), json.loads(args.concepts.read_text()), args.allow)
    if args.operation == "mcp":
        MCP(workspace).serve(sys.stdin.buffer, sys.stdout)
        return
    if not all((args.provider, args.endpoint, args.model, args.object)):
        parser.error("suggest richiede provider, endpoint, model e object.")
    adapter = Ollama if args.provider == "ollama" else ChatCompletions
    provider = adapter(args.endpoint, args.model, os.environ.get("ASTRA_EDITOR_PROVIDER_TOKEN"))
    print(json.dumps(workspace.suggest(args.object, provider, schema("proposal-v1"), check_proposal),
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (Problem, ValueError, KeyError, OSError) as error:
        sys.exit("Operazione editoriale interrotta: " + str(error))
