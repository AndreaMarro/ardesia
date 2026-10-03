import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

// Actual SDK stdio client -> MCP process -> canonical HTTP service -> browser.
test.skip(!process.env.ARDESIA_SHARED_E2E || !process.env.ARDESIA_MCP_TEST_PYTHON,
  'Requires the local room service and an existing Python runtime with MCP SDK 2.x')
const runner = `
import asyncio,json,os,sys
from mcp import Client,StdioServerParameters
async def main():
    request=json.load(sys.stdin)
    env={k:v for k,v in os.environ.items() if k.startswith('ARDESIA_MCP_')}
    async with Client(StdioServerParameters(command=sys.executable,args=[sys.argv[1]],env=env)) as client:
        response=await client.call_tool(request['tool'],request['arguments'])
        print(json.dumps({'error':response.is_error,'value':response.structured_content}))
asyncio.run(main())
`

test('MCP reads a browser drawing, changes it on the canvas and undoes only its own change', async ({ page, request }, info) => {
  test.setTimeout(60_000)
  const service = 'http://127.0.0.1:4318'
  const created = await (await request.post(`${service}/rooms`, { data: { title: 'Lavagna e MCP', clientId: 'browser-mcp-test' } })).json()
  const mcp = (tool: string, args: object = {}) => {
    const response = JSON.parse(execFileSync(process.env.ARDESIA_MCP_TEST_PYTHON!,
      ['-c', runner, resolve('../../services/room-sync/mcp_server.py')], {
        input: JSON.stringify({ tool, arguments: args }), encoding: 'utf8', timeout: 15_000,
        env: { ...process.env, ARDESIA_MCP_ORIGIN: service, ARDESIA_MCP_ROOM_ID: created.roomId,
          ARDESIA_MCP_TOKEN: created.token, ARDESIA_MCP_CLIENT_ID: 'mcp-browser-test', ARDESIA_MCP_ALLOW_WRITE: '1' },
      }))
    expect(response.error).toBe(false)
    return response.value
  }
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/?shared=1#${created.roomId}&sync=${encodeURIComponent(service)}&access=${created.token}`)
  await expect(page.getByTestId('sync-status')).toHaveText('Lavagna sincronizzata')
  const draw = async (x: number, y: number) => {
    await page.keyboard.press('Escape')
    await page.locator('label').filter({ has: page.getByTestId('toolbar-rectangle') }).click()
    await page.mouse.move(x, y); await page.mouse.down()
    await page.mouse.move(x + 100, y + 70, { steps: 4 }); await page.mouse.up()
    await page.keyboard.press('Escape')
  }
  await draw(400, 400)
  await expect.poll(() => mcp('room_snapshot').elements.length).toBe(1)
  const before = mcp('room_snapshot')
  const original = before.elements[0]
  mcp('room_apply', { operation_id: 'mcp-color', changes: [{ id: original.id,
    baseVersion: before.objectVersions[original.id], element: { ...original, strokeColor: '#e03131', version: original.version + 1 } }] })
  const color = () => page.evaluate(id => (window as any).__MAESTRO_TEST__?.apiRef.current?.getSceneElements()
    .find((element: any) => element.id === id)?.strokeColor, original.id)
  await expect.poll(color).toBe('#e03131')
  await draw(650, 500)
  await expect.poll(() => mcp('room_snapshot').elements.length).toBe(2)
  mcp('room_undo', { operation_id: 'mcp-undo-color', target_operation_id: 'mcp-color' })
  await expect.poll(color).toBe(original.strokeColor)
  expect(mcp('room_snapshot').elements).toHaveLength(2)
  await page.screenshot({ path: info.outputPath('browser-mcp-canvas.png'), fullPage: true })
  expect(errors).toEqual([])
})
