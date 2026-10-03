"""Client MCP stdio reale contro il processo HTTP Node canonico, su loopback."""
import asyncio
import http.client
import importlib.util
import json
import os
from pathlib import Path
import re
import selectors
import shutil
import subprocess
import sys

import pytest
from mcp import Client, StdioServerParameters


ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location('ardesia_room_mcp', ROOT / 'mcp_server.py')
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


@pytest.fixture
def room(tmp_path):
    node = shutil.which('node')
    assert node, 'Serve Node.js già installato per i test HTTP reali.'
    process = subprocess.Popen([node, str(ROOT / 'server.mjs')], stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE, text=True,
                               env={**os.environ, 'ROOM_SYNC_PORT': '0', 'ROOM_SYNC_HOST': '127.0.0.1',
                                    'ROOM_SYNC_DATA_DIR': str(tmp_path / 'private-rooms')})
    try:
        with selectors.DefaultSelector() as selector:
            selector.register(process.stdout, selectors.EVENT_READ)
            assert selector.select(timeout=10), 'Il servizio HTTP non è partito.'
            startup = process.stdout.readline()
        match = re.search(r'127\.0\.0\.1:(\d+)', startup)
        assert match, 'Il servizio non ha comunicato una porta loopback.'
        port = int(match[1])
        def request(method, resource, token=None, body=None):
            connection = http.client.HTTPConnection('127.0.0.1', port, timeout=8)
            headers = {'Content-Type': 'application/json'}
            if token:
                headers['Authorization'] = f'Bearer {token}'
            try:
                connection.request(method, resource, json.dumps(body) if body is not None else None, headers)
                response = connection.getresponse()
                return response.status, json.loads(response.read())
            finally:
                connection.close()
        status, owner = request('POST', '/rooms', body={'title': 'MCP interoperability', 'clientId': 'browser-owner'})
        assert status == 201
        route = f'/rooms/{owner["roomId"]}'
        status, editor = request('POST', f'{route}/grants', owner['token'], {'role': 'editor'})
        assert status == 200
        def parameters(token=editor['token'], allow_write='0'):
            return StdioServerParameters(command=sys.executable, args=[str(ROOT / 'mcp_server.py')],
                                         env={'ARDESIA_MCP_ORIGIN': f'http://127.0.0.1:{port}',
                                              'ARDESIA_MCP_ROOM_ID': owner['roomId'], 'ARDESIA_MCP_TOKEN': token,
                                              'ARDESIA_MCP_CLIENT_ID': 'mcp-test-client',
                                              'ARDESIA_MCP_ALLOW_WRITE': allow_write,
                                              'HTTP_PROXY': 'http://127.0.0.1:1', 'HTTPS_PROXY': 'http://127.0.0.1:1'})
        yield {'request': request, 'owner': owner, 'editor': editor, 'route': route, 'parameters': parameters}
    finally:
        process.terminate()
        try:
            process.communicate(timeout=8)
        except subprocess.TimeoutExpired:
            process.kill(); process.communicate(timeout=3)


def element(identity, x=0):
    return {'id': identity, 'type': 'rectangle', 'x': x, 'y': 0, 'width': 100, 'height': 60, 'version': 1}


def test_real_stdio_is_readonly_by_default_and_has_no_credential_or_room_arguments(room, capfd):
    async def run():
        async with Client(room['parameters']()) as client:
            tools = (await client.list_tools()).tools
            assert [tool.name for tool in tools] == ['room_snapshot']
            assert tools[0].annotations.read_only_hint is True
            assert tools[0].input_schema.get('properties', {}) == {}
            snapshot = await client.call_tool('room_snapshot')
            assert not snapshot.is_error
            assert snapshot.structured_content['roomId'] == room['owner']['roomId']
            assert snapshot.structured_content['role'] == 'editor'
            rejected = await client.call_tool('room_apply', {'operation_id': 'forbidden', 'changes': []})
            assert rejected.is_error
    asyncio.run(run())
    captured = capfd.readouterr()
    assert room['editor']['token'] not in captured.out + captured.err


def test_browser_and_stdio_read_write_in_both_directions_with_conflicts_own_undo_and_retry(room, capfd):
    request, route, owner = room['request'], room['route'], room['owner']
    status, _ = request('POST', f'{route}/operations', owner['token'], {
        'operationId': 'browser-first', 'clientId': 'browser-owner',
        'changes': [{'id': 'A', 'baseVersion': 0, 'element': element('A', 10)}]})
    assert status == 200
    async def run():
        async with Client(room['parameters'](allow_write='1')) as client:
            tools = {tool.name: tool for tool in (await client.list_tools()).tools}
            assert set(tools) == {'room_snapshot', 'room_apply', 'room_undo'}
            assert set(tools['room_apply'].input_schema['properties']) == {'operation_id', 'changes', 'files'}
            before = (await client.call_tool('room_snapshot')).structured_content
            assert before['elements'][0]['x'] == 10
            args = {'operation_id': 'mcp-first', 'changes': [{'id': 'B', 'baseVersion': 0, 'element': element('B', 20)}]}
            applied = await client.call_tool('room_apply', args)
            assert not applied.is_error and applied.structured_content['revision'] == 2
            retried = await client.call_tool('room_apply', args)
            assert not retried.is_error and retried.structured_content['idempotent'] is True
            status, seen_by_browser = request('GET', f'{route}/snapshot', owner['token'])
            assert status == 200 and {item['id'] for item in seen_by_browser['elements']} == {'A', 'B'}
            status, _ = request('POST', f'{route}/operations', owner['token'], {
                'operationId': 'browser-second', 'clientId': 'browser-owner',
                'changes': [{'id': 'A', 'baseVersion': 1, 'element': element('A', 30)}]})
            assert status == 200
            seen_by_mcp = (await client.call_tool('room_snapshot')).structured_content
            assert next(item for item in seen_by_mcp['elements'] if item['id'] == 'A')['x'] == 30
            stale = await client.call_tool('room_apply', {'operation_id': 'stale', 'changes': [
                {'id': 'A', 'baseVersion': 1, 'element': element('A', 99)}]})
            assert stale.is_error and stale.structured_content['status'] == 409
            assert stale.structured_content['conflicts'][0]['current']['x'] == 30
            assert stale.structured_content['snapshot']['objectVersions']['A'] == 2
            foreign = await client.call_tool('room_undo', {'operation_id': 'foreign-undo', 'target_operation_id': 'browser-second'})
            assert foreign.is_error and foreign.structured_content['error'] == 'operation_not_yours'
            undone = await client.call_tool('room_undo', {'operation_id': 'undo-first', 'target_operation_id': 'mcp-first'})
            assert not undone.is_error
            assert [item['id'] for item in undone.structured_content['elements']] == ['A']
            assert undone.structured_content['elements'][0]['x'] == 30
        # Riavvio del vero subprocess stdio, stessa identità configurata.
        async with Client(room['parameters'](allow_write='1')) as restarted:
            retry = await restarted.call_tool('room_undo', {'operation_id': 'undo-first', 'target_operation_id': 'mcp-first'})
            assert not retry.is_error and retry.structured_content['idempotent'] is True
            assert retry.structured_content['revision'] == 4
    asyncio.run(run())
    captured = capfd.readouterr()
    assert room['editor']['token'] not in captured.out + captured.err


def test_write_flag_does_not_elevate_viewer_and_revocation_is_checked_each_call(room):
    request, route, owner = room['request'], room['route'], room['owner']
    status, viewer = request('POST', f'{route}/grants', owner['token'], {'role': 'viewer'})
    assert status == 200
    async def run():
        async with Client(room['parameters'](viewer['token'], '1')) as client:
            initial = await client.call_tool('room_snapshot')
            assert not initial.is_error and initial.structured_content['role'] == 'viewer'
            write = await client.call_tool('room_apply', {'operation_id': 'viewer-write', 'changes': [
                {'id': 'forbidden', 'baseVersion': 0, 'element': element('forbidden')}]})
            assert write.is_error and write.structured_content == {'error': 'read_only', 'status': 403}
            assert request('DELETE', f'{route}/grants/{viewer["grantId"]}', owner['token'])[0] == 200
            revoked = await client.call_tool('room_snapshot')
            assert revoked.is_error and revoked.structured_content == {'error': 'unauthorized', 'status': 401}
            assert 'elements' not in revoked.structured_content
    asyncio.run(run())


@pytest.mark.parametrize('origin', ['https://127.0.0.1', 'http://example.com', 'http://127.0.0.2',
                                  'http://127.0.0.1/rooms/a', 'http://secret@127.0.0.1',
                                  'http://127.0.0.1?token=x', 'http://localhost#other', 'http://127.0.0.1:0'])
def test_configuration_refuses_nonloopback_credentials_paths_and_invalid_ports(origin):
    with pytest.raises(ValueError, match='ORIGIN'):
        MODULE.Config.from_env({'ARDESIA_MCP_ORIGIN': origin, 'ARDESIA_MCP_ROOM_ID': 'room', 'ARDESIA_MCP_TOKEN': 'x' * 43})


def test_configuration_keeps_token_out_of_repr_and_fixes_localhost_to_numeric_loopback():
    config = MODULE.Config.from_env({'ARDESIA_MCP_ORIGIN': 'http://localhost:4318',
                                   'ARDESIA_MCP_ROOM_ID': 'room', 'ARDESIA_MCP_TOKEN': 'x' * 43})
    assert config.host == '127.0.0.1' and config.allow_write is False
    assert config.token not in repr(config)


def test_invalid_startup_does_not_print_the_configuration_secret():
    secret = 'untrusted-secret-configuration'
    failure = subprocess.run([sys.executable, str(ROOT / 'mcp_server.py')], capture_output=True, text=True, timeout=10,
                             env={**os.environ, 'ARDESIA_MCP_ROOM_ID': 'room', 'ARDESIA_MCP_TOKEN': secret})
    assert failure.returncode == 1 and failure.stdout == ''
    assert secret not in failure.stderr and 'Traceback' not in failure.stderr
