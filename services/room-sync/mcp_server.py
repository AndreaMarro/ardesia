"""MCP stdio per una stanza ARDESIA; usa soltanto l'API HTTP canonica locale.

Richiede Python 3.12 e l'SDK mcp 2.x già disponibile nel runtime selezionato.
In questa versione dello SDK FastMCP si chiama MCPServer. Nessuna installazione,
ricerca di credenziali o scoperta automatica di stanze avviene all'avvio.
"""
from __future__ import annotations

from dataclasses import dataclass
import http.client
import json
import logging
import os
import re
import sys
from typing import Any, Mapping
from urllib.parse import urlsplit
from uuid import uuid4

from mcp.server import MCPServer
from mcp.types import CallToolResult, TextContent, ToolAnnotations


ID = re.compile(r'^[A-Za-z0-9_-]{1,128}$')
TOKEN = re.compile(r'^[A-Za-z0-9_-]{43}$')
MAX_BYTES = 32 * 1024 * 1024
SAFE_ERRORS = frozenset({
    'unauthorized', 'room_not_found', 'read_only', 'conflict', 'operation_id_reused',
    'operation_not_found', 'operation_not_yours', 'operation_already_undone',
    'invalid_payload', 'invalid_changes', 'invalid_change', 'invalid_element',
    'invalid_files', 'invalid_file', 'invalid_file_data_url', 'invalid_file_base64',
    'invalid_file_time', 'file_too_large', 'file_id_conflict', 'room_files_too_large',
    'missing_image_file', 'element_too_large', 'element_count_limit',
    'operation_history_limit', 'room_storage_limit', 'request_too_large',
    'host_not_allowed', 'origin_not_allowed', 'internal_error',
})


def valid_id(value: str) -> bool:
    return bool(ID.fullmatch(value)) and value not in {'__proto__', 'constructor', 'prototype'}


@dataclass(frozen=True, repr=False)
class Config:
    """La configurazione non è rappresentabile con repr: contiene una capability."""
    host: str
    port: int
    room_id: str
    token: str
    client_id: str
    allow_write: bool

    @classmethod
    def from_env(cls, env: Mapping[str, str] | None = None) -> Config:
        env = os.environ if env is None else env
        try:
            origin = urlsplit(env.get('ARDESIA_MCP_ORIGIN', 'http://127.0.0.1:4318'))
            if (origin.scheme != 'http' or origin.hostname not in {'127.0.0.1', 'localhost', '::1'}
                    or origin.username is not None or origin.password is not None
                    or origin.path not in {'', '/'} or origin.query or origin.fragment):
                raise ValueError
            port = 80 if origin.port is None else origin.port
            if not 1 <= port <= 65535:
                raise ValueError
        except ValueError:
            raise ValueError('ARDESIA_MCP_ORIGIN deve essere un’origine HTTP loopback senza percorso o credenziali.') from None
        room_id, token = env.get('ARDESIA_MCP_ROOM_ID', ''), env.get('ARDESIA_MCP_TOKEN', '')
        if not valid_id(room_id) or not TOKEN.fullmatch(token):
            raise ValueError('Imposta ARDESIA_MCP_ROOM_ID e ARDESIA_MCP_TOKEN con un accesso valido.')
        client_id = env.get('ARDESIA_MCP_CLIENT_ID') or f'mcp-{uuid4()}'
        if not valid_id(client_id):
            raise ValueError('ARDESIA_MCP_CLIENT_ID non valido.')
        if env.get('ARDESIA_MCP_ALLOW_WRITE', '0') not in {'0', '1'}:
            raise ValueError('ARDESIA_MCP_ALLOW_WRITE ammette soltanto 0 oppure 1.')
        # localhost è fissato numericamente: niente proxy, DNS o destinazioni
        # scelte da argomenti dei tool, redirect o contenuto della lavagna.
        return cls('127.0.0.1' if origin.hostname == 'localhost' else origin.hostname,
                   port, room_id, token, client_id, env.get('ARDESIA_MCP_ALLOW_WRITE') == '1')


def result(payload: dict[str, Any], *, error: bool = False) -> CallToolResult:
    return CallToolResult(content=[TextContent(type='text', text=json.dumps(payload, ensure_ascii=False))],
                          structured_content=payload, is_error=error)


class RoomApi:
    def __init__(self, config: Config):
        self.config = config

    def call(self, resource: str, body: dict[str, Any] | None = None) -> CallToolResult:
        connection = http.client.HTTPConnection(self.config.host, self.config.port, timeout=8)
        try:
            encoded = None if body is None else json.dumps(body, ensure_ascii=False, allow_nan=False).encode('utf-8')
            if encoded is not None and len(encoded) > 30 * 1024 * 1024:
                return result({'error': 'request_too_large'}, error=True)
            connection.request('GET' if body is None else 'POST',
                               f'/rooms/{self.config.room_id}/{resource}', body=encoded,
                               headers={'Authorization': f'Bearer {self.config.token}',
                                        'Content-Type': 'application/json'})
            response = connection.getresponse()
            if 300 <= response.status < 400:
                return result({'error': 'redirect_refused', 'status': response.status}, error=True)
            raw = response.read(MAX_BYTES + 1)
            if len(raw) > MAX_BYTES:
                return result({'error': 'response_too_large'}, error=True)
            data = json.loads(raw)
            if not isinstance(data, dict):
                return result({'error': 'invalid_service_response'}, error=True)
            if response.status != 200:
                code = data.get('error')
                failure: dict[str, Any] = {'error': code if code in SAFE_ERRORS else 'service_rejected', 'status': response.status}
                if code == 'conflict':
                    failure.update({key: data[key] for key in ('conflicts', 'snapshot') if key in data})
                return result(failure, error=True)
            if (data.get('roomId') != self.config.room_id or data.get('role') not in {'owner', 'editor', 'viewer'}
                    or not isinstance(data.get('elements'), list) or not isinstance(data.get('objectVersions'), dict)):
                return result({'error': 'invalid_service_response'}, error=True)
            return result(data)
        except (OSError, http.client.HTTPException, ValueError, TypeError, OverflowError):
            # Non includere eccezioni di rete, header, URL o payload nei log MCP.
            return result({'error': 'service_unavailable', 'retry': 'Riusa lo stesso operation_id senza cambiare il contenuto.'}, error=True)
        finally:
            connection.close()


def build_server(config: Config | None = None) -> MCPServer:
    config = config or Config.from_env()
    api = RoomApi(config)
    server = MCPServer('ardesia-room-sync', version='0.1.0', log_level='CRITICAL',
                       instructions='Accesso a una sola lavagna ARDESIA configurata dall’utente. '
                       'Leggi objectVersions prima di proporre modifiche. Mantieni operation_id '
                       'e contenuto identici nei retry. Un conflitto richiede una scelta esplicita; '
                       'non sostituire automaticamente baseVersion con quella più recente. '
                       'Non inviare appunti privati fra elementi o allegati condivisi.')

    @server.tool(name='room_snapshot', description='Legge la lavagna condivisa autorizzata, con versioni server degli oggetti e allegati. Non include appunti personali.',
                 annotations=ToolAnnotations(read_only_hint=True, destructive_hint=False, idempotent_hint=True, open_world_hint=False))
    def room_snapshot() -> CallToolResult:
        return api.call('snapshot')

    if config.allow_write:
        @server.tool(name='room_apply', description='Applica un batch atomico di elementi Excalidraw nella stanza configurata. changes: [{id,baseVersion,element}]; element null cancella. Nuovi oggetti usano baseVersion 0. Un conflitto non viene risolto automaticamente.',
                     annotations=ToolAnnotations(read_only_hint=False, destructive_hint=True, idempotent_hint=True, open_world_hint=False))
        def room_apply(operation_id: str, changes: list[dict[str, Any]], files: dict[str, Any] | None = None) -> CallToolResult:
            if not valid_id(operation_id):
                return result({'error': 'invalid_operation_id'}, error=True)
            return api.call('operations', {'operationId': operation_id, 'clientId': config.client_id,
                                           'changes': changes, 'files': files or {}})

        @server.tool(name='room_undo', description='Annulla solo un’operazione di questo client MCP e grant, se nessun altro ha successivamente modificato i suoi oggetti. Mantieni operation_id uguale nei retry.',
                     annotations=ToolAnnotations(read_only_hint=False, destructive_hint=True, idempotent_hint=True, open_world_hint=False))
        def room_undo(operation_id: str, target_operation_id: str) -> CallToolResult:
            if not valid_id(operation_id) or not valid_id(target_operation_id):
                return result({'error': 'invalid_operation_id'}, error=True)
            return api.call('undo', {'operationId': operation_id, 'clientId': config.client_id,
                                     'targetOperationId': target_operation_id})
    return server


if __name__ == '__main__':
    logging.disable(logging.CRITICAL)
    try:
        build_server().run('stdio')
    except Exception:
        print('MCP ARDESIA non avviato: verifica SDK, configurazione ambiente e servizio locale.', file=sys.stderr)
        raise SystemExit(1) from None
