"""Official SDK Client -> actual stdio subprocess -> actual Study HTTP/SQLite.

This proves this transport and Core session boundary, not any commercial host,
Supabase Auth, PostgreSQL, remote deployment or MCP Apps rendering.
"""
from contextlib import asynccontextmanager
import asyncio
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import URLError
from urllib.request import urlopen

import httpx2
from mcp import Client, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.types import Implementation

ROOT = Path(__file__).resolve().parents[3]
SERVICE = ROOT / 'services' / 'study-mcp'


class StdioCoreTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        api_python = os.environ.get('ARDESIA_MCP_TEST_API_PYTHON')
        if not api_python or not Path(api_python).is_file():
            raise RuntimeError('Set ARDESIA_MCP_TEST_API_PYTHON to the separate Study API Python environment.')
        cls.directory = tempfile.TemporaryDirectory(prefix='ardesia-mcp-core-')
        cls.private = Path(cls.directory.name)
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            cls.port = sock.getsockname()[1]
        cls.origin = f'http://127.0.0.1:{cls.port}'
        cls.api_log = open(cls.private / 'core-stderr.log', 'w+')
        cls.process = subprocess.Popen([api_python, str(SERVICE / 'tests/core_http_fixture.py'),
            '--directory', str(cls.private), '--port', str(cls.port)],
            env={**os.environ, 'PYTHONPATH':os.pathsep.join((str(ROOT/'packages/engine'), str(ROOT/'services/study-api')))},
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=cls.api_log)
        cls.addClassCleanup(cls.stop_api)
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            if cls.process.poll() is not None:
                raise RuntimeError('Isolated Core fixture failed; inspect private test directory locally.')
            try:
                with urlopen(cls.origin + '/study/health', timeout=.2) as response:
                    if response.status == 200:
                        break
            except (URLError, TimeoutError):
                time.sleep(.03)
        else:
            raise RuntimeError('Isolated Core fixture did not become healthy.')
        cls.fixture = json.loads((cls.private / 'private-fixture.json').read_text())

    @classmethod
    def stop_api(cls):
        if cls.process.poll() is None:
            cls.process.terminate()
            try:
                cls.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                cls.process.kill()
                cls.process.wait(timeout=2)
        cls.api_log.close()
        cls.directory.cleanup()

    @asynccontextmanager
    async def client(self, actor='tutor'):
        token = self.fixture['tokens'][actor]
        with tempfile.TemporaryFile(mode='w+') as errors:
            params = StdioServerParameters(command=sys.executable, args=['-m', 'study_mcp'], cwd=str(SERVICE),
                env={'PYTHONPATH':str(SERVICE), 'ARDESIA_STUDY_ORIGIN':self.origin,
                     'ARDESIA_STUDY_SESSION':token,
                     # A broken proxy in the environment must not intercept Core.
                     'HTTP_PROXY':'http://127.0.0.1:1', 'HTTPS_PROXY':'http://127.0.0.1:1', 'ALL_PROXY':'http://127.0.0.1:1'})
            @asynccontextmanager
            async def transport():
                async with stdio_client(params, errlog=errors) as streams:
                    yield streams
            async with Client(transport(), mode='2026-07-28', read_timeout_seconds=10,
                client_info=Implementation(name='teacher-admin-untrusted-clientInfo', version='999')) as client:
                yield client
            errors.seek(0)
            diagnostics = errors.read()
            # Never show raw diagnostics on an assertion failure.
            self.assertFalse(any(secret in diagnostics for secret in self.fixture['tokens'].values()),
                             'MCP diagnostics contained a private session.')
            self.assertFalse('Traceback' in diagnostics, 'MCP transport emitted a traceback.')

    def packet(self, result):
        self.assertEqual(len(result.content), 1)
        parsed = json.loads(result.content[0].text)
        self.assertEqual(parsed, result.structured_content)
        self.assertEqual(result.is_error, parsed['status'] == 'unavailable')
        self.assertFalse(parsed['capabilities']['interactiveUI'])
        self.assertEqual(parsed['representation'], 'text-fallback')
        self.assertNotIn('_meta', parsed)
        return parsed

    def refs(self, revision=None):
        source = self.fixture['source']
        return {'contextId':source['contextId'], 'resourceId':source['id'],
                'revisionId':revision or source['revisionId']}

    async def test_discovery_is_exact_read_only_stateless_protocol_and_no_ui(self):
        async with self.client() as client:
            self.assertEqual(client.protocol_version, '2026-07-28')
            tools = (await client.list_tools()).tools
            self.assertEqual({tool.name for tool in tools}, {'course.list_mine', 'lesson.get_context', 'submission.get_receipt'})
            for tool in tools:
                self.assertTrue(tool.annotations.read_only_hint)
                self.assertFalse(tool.annotations.destructive_hint)
                self.assertFalse(tool.input_schema['additionalProperties'])
                self.assertIsNotNone(tool.output_schema)
                self.assertIsNone(tool.meta)
            context = next(tool for tool in tools if tool.name == 'lesson.get_context')
            self.assertEqual(set(context.input_schema['required']), {'contextId','resourceId','revisionId'})
            self.assertIsNone(client.server_capabilities.resources)
            self.assertIsNone(client.server_capabilities.prompts)

    async def test_courses_are_bounded_mine_only_and_cursor_works(self):
        async with self.client('tutor') as client:
            first = self.packet(await client.call_tool('course.list_mine', {'limit':1}))
            self.assertEqual([item['id'] for item in first['data']['items']], ['fluidi'])
            self.assertEqual(first['data']['nextCursor'], 'fluidi')
            second = self.packet(await client.call_tool('course.list_mine', {'limit':1, 'cursor':first['data']['nextCursor']}))
            self.assertEqual([item['id'] for item in second['data']['items']], ['fluidi-second'])
            self.assertIsNone(second['data']['nextCursor'])
            self.assertIsNone(second['sourceVersion']['scheduleVersion'])
        async with self.client('student') as client:
            page = self.packet(await client.call_tool('course.list_mine', {}))
            self.assertEqual([item['id'] for item in page['data']['items']], ['fluidi'])
        async with self.client('other-tutor') as client:
            page = self.packet(await client.call_tool('course.list_mine', {}))
            self.assertEqual([item['id'] for item in page['data']['items']], ['unrelated-edition'])

    async def test_tutor_gets_exact_historical_submission_but_no_private_head_or_v0(self):
        async with self.client('tutor') as client:
            packet = self.packet(await client.call_tool('lesson.get_context', self.refs()))
            self.assertEqual(packet['status'], 'ok')
            self.assertEqual(packet['data']['sourceState'], 'HISTORICAL')
            self.assertEqual(packet['data']['resource']['text'], self.fixture['source']['text'])
            self.assertEqual(packet['sourceVersion']['sha256'], self.fixture['source']['sha256'])
            for revision in (self.fixture['headRevisionId'], self.fixture['unsubmittedRevisionId']):
                denied = self.packet(await client.call_tool('lesson.get_context', self.refs(revision)))
                self.assertEqual(denied['error'], 'NOT_AVAILABLE')
                self.assertIsNone(denied['data'])
        async with self.client('student') as client:
            packet = self.packet(await client.call_tool('lesson.get_context', self.refs(self.fixture['headRevisionId'])))
            self.assertEqual(packet['data']['sourceState'], 'CURRENT')

    async def test_peer_and_other_tutor_cannot_read_context_or_receipt_even_with_client_info(self):
        for actor in ('peer', 'other-tutor'):
            async with self.client(actor) as client:
                for name,args in (('lesson.get_context',self.refs()),
                                  ('submission.get_receipt',{'receiptId':self.fixture['receipt']['receiptId']})):
                    packet = self.packet(await client.call_tool(name, args))
                    self.assertEqual(packet['error'], 'NOT_AVAILABLE')
                    self.assertIsNone(packet['sourceVersion'])
                    self.assertEqual(packet['evidenceRefs'], [])

    async def test_receipt_version_is_actual_and_owner_and_tutor_can_read(self):
        receipt = self.fixture['receipt']
        for actor in ('student', 'tutor'):
            async with self.client(actor) as client:
                packet = self.packet(await client.call_tool('submission.get_receipt', {'receiptId':receipt['receiptId']}))
                self.assertEqual(packet['sourceVersion'], {key:receipt[key] for key in ('receiptId','submissionId','revision')})
                self.assertEqual(packet['data']['courseContext'], receipt['courseContext'])
                self.assertEqual(packet['data']['state'], 'received')

    async def test_assigned_diary_transfer_preserves_canonical_rubric_and_access(self):
        receipt_id = self.fixture['transferReceipt']['receiptId']
        async with httpx2.AsyncClient(trust_env=False) as http:
            response = await http.get(self.origin+'/study/receipts/'+receipt_id,
                headers={'Cookie':'study_session='+self.fixture['tokens']['student']})
            self.assertEqual(response.status_code, 200)
            canonical = response.json()
        self.assertIsInstance(canonical['activityContext']['rubric'], dict)
        self.assertIs(canonical['activityContext']['rubric']['procedureRequired'], True)
        for actor in ('student', 'tutor'):
            async with self.client(actor) as client:
                packet = self.packet(await client.call_tool('submission.get_receipt', {'receiptId':receipt_id}))
                self.assertEqual(packet['status'], 'ok')
                self.assertEqual(packet['data']['activityContext'], canonical['activityContext'])
                self.assertEqual(packet['sourceVersion'], {key:canonical[key]
                    for key in ('receiptId','submissionId','revision')})
                self.assertTrue(any('unsupported' in loss for loss in packet['losses']))
        for actor in ('peer', 'other-tutor'):
            async with self.client(actor) as client:
                packet = self.packet(await client.call_tool('submission.get_receipt', {'receiptId':receipt_id}))
                self.assertEqual(packet['error'], 'NOT_AVAILABLE')
                self.assertIsNone(packet['data'])
                self.assertEqual(packet['evidenceRefs'], [])

    async def test_invalid_args_and_factory_tools_are_denied_without_authority(self):
        async with self.client() as client:
            cases = [('lesson.get_context',{'contextId':self.refs()['contextId']}),
                     ('lesson.get_context',{**self.refs(),'query':'x'*501}),
                     ('lesson.get_context',{**self.refs(),'factory':'execute'}),
                     ('course.list_mine',{'limit':True}),
                     ('submission.get_receipt',{'receiptId':'../../study/factory'}),
                     ('submission.get_receipt',{'receiptId':'r','url':'http://evil.invalid'})]
            for name,args in cases:
                packet = self.packet(await client.call_tool(name,args))
                self.assertEqual(packet['error'], 'INVALID_ARGUMENTS')
            for name in ('factory.run','calendar.write','lesson.delete','ui.open','receipt.get'):
                packet = self.packet(await client.call_tool(name,{}))
                self.assertEqual(packet['error'], 'NOT_SUPPORTED')

    async def test_revoked_isolated_session_is_rechecked_on_next_tool_call(self):
        async with self.client('revocable') as client:
            before = self.packet(await client.call_tool('course.list_mine', {}))
            self.assertEqual(before['status'], 'ok')
            async with httpx2.AsyncClient(trust_env=False) as http:
                response = await http.delete(self.origin+'/study/session',
                    headers={'Cookie':'study_session='+self.fixture['tokens']['revocable']})
                self.assertEqual(response.status_code, 200)
            after = self.packet(await client.call_tool('course.list_mine', {}))
            self.assertEqual(after['error'], 'AUTH_REQUIRED')

    async def test_stdio_eof_and_bad_config_exit_cleanly_without_stdout_banner_or_secret(self):
        for token,code in ((self.fixture['tokens']['student'],0), ('bad;private-sentinel',1)):
            process = await asyncio.create_subprocess_exec(sys.executable, '-m','study_mcp', cwd=SERVICE,
                env={**os.environ,'PYTHONPATH':str(SERVICE),'ARDESIA_STUDY_ORIGIN':self.origin,'ARDESIA_STUDY_SESSION':token},
                stdin=asyncio.subprocess.PIPE,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
            try:
                stdout,stderr = await asyncio.wait_for(process.communicate(b''),5)
            finally:
                if process.returncode is None:
                    process.kill()
                    await process.wait()
            self.assertEqual(process.returncode,code)
            self.assertEqual(stdout,b'')
            self.assertFalse(token.encode() in stderr, 'stderr exposed a private configuration value.')


if __name__ == '__main__':
    unittest.main()
