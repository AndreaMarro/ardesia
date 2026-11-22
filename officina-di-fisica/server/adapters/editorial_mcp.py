"""MCP stdio transport for the explicitly granted editorial tools, with no write tool."""
import json

from ..domain.errors import Problem
from .contracts import schema, validate

VERSION = "2025-11-25"
OBJECT = {"type": "object", "additionalProperties": False}
TOOLS = {
    "search": ("Cerca competenze e prerequisiti nei corsi autorizzati.",
               {**OBJECT, "properties": {"query": {"type": "string", "minLength": 1, "maxLength": 240}}, "required": ["query"]}),
    "read": ("Leggi i passaggi citabili di una lezione.", {**OBJECT, "properties": {"id": {"type": "string", "maxLength": 96}}, "required": ["id"]}),
    "propose": ("Verifica una proposta per il docente.", schema("proposal-v1")),
}


def check_proposal(value):
    validate(value, schema("proposal-v1"))


class MCP:
    def __init__(self, workspace):
        self.workspace = workspace
        self.phase = "new"

    def handle(self, msg):
        identifier = msg.get("id") if isinstance(msg, dict) else None

        def reply(value):
            return {"jsonrpc": "2.0", "id": identifier, **value}

        if not isinstance(msg, dict) or msg.get("jsonrpc") != "2.0" or not isinstance(msg.get("method"), str):
            return reply({"error": {"code": -32600, "message": "Invalid Request"}})
        name, params = msg["method"], msg.get("params", {})
        if name == "notifications/initialized" and self.phase == "starting":
            self.phase = "ready"
        if "id" not in msg:
            return None
        if name == "initialize" and self.phase == "new" and isinstance(params, dict) and isinstance(params.get("protocolVersion"), str):
            self.phase = "starting"
            return reply({"result": {"protocolVersion": VERSION, "capabilities": {"tools": {}},
                                     "serverInfo": {"name": "officina-editoriale", "version": "1.0.0"}}})
        if name == "ping":
            return reply({"result": {}})
        if self.phase != "ready":
            return reply({"error": {"code": -32600, "message": "Initialize the session first"}})
        if name == "tools/list":
            return reply({"result": {"tools": [{"name": k, "description": v[0], "inputSchema": v[1]}
                    for k, v in TOOLS.items() if k in self.workspace.permissions]}})
        if name != "tools/call":
            return reply({"error": {"code": -32601, "message": "Method not found"}})
        tool = params.get("name") if isinstance(params, dict) else None
        if not isinstance(tool, str) or tool not in self.workspace.permissions:
            return reply({"error": {"code": -32602, "message": "Tool not available in this session"}})
        arguments = params.get("arguments", {})
        try:
            validate(arguments, TOOLS[tool][1])
            if tool == "search":
                result = self.workspace.search(arguments["query"])
            elif tool == "read":
                result = self.workspace.read(arguments["id"])
            else:
                result = self.workspace.validate_proposal(arguments, check_proposal)
            return reply({"result": {"content": [{"type": "text", "text": json.dumps(result, ensure_ascii=False)}]}})
        except (ValueError, TypeError, Problem) as error:
            return reply({"result": {"isError": True, "content": [{"type": "text", "text": str(error)}]}})

    def serve(self, input_stream, output_stream):
        while True:
            line = input_stream.readline(65537)
            if not line:
                return
            if len(line) > 65536:
                return
            try:
                message = json.loads(line)
            except (ValueError, RecursionError):
                out = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
            else:
                out = self.handle(message)
            if out is not None:
                print(json.dumps(out, ensure_ascii=False), file=output_stream, flush=True)
