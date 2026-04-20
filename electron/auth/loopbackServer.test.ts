import { test } from 'node:test'
import assert from 'node:assert'
import http from 'http'
import { startLoopbackServer } from './loopbackServer.ts'

function get(url: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = ''
            res.on('data', (c) => (body += c))
            res.on('end', () => resolve({ status: res.statusCode ?? 0, body }))
        }).on('error', reject)
    })
}

test('loopbackServer', async (t) => {
    await t.test('valid callback returns code', async () => {
        const srv = await startLoopbackServer('expected-state')
        const codePromise = srv.waitForCode()
        const res = await get(`${srv.redirectUri}?code=abc&state=expected-state`)
        assert.strictEqual(res.status, 200)
        assert.match(res.body, /연결 완료/)
        const result = await codePromise
        assert.strictEqual(result.code, 'abc')
    })

    await t.test('state mismatch rejects + returns 400', async () => {
        const srv = await startLoopbackServer('correct-state')
        // Attach rejection handler IMMEDIATELY to prevent unhandled rejection
        const rejection = assert.rejects(srv.waitForCode(), /State mismatch/)
        const res = await get(`${srv.redirectUri}?code=abc&state=wrong`)
        assert.strictEqual(res.status, 400)
        await rejection
    })

    await t.test('missing code rejects', async () => {
        const srv = await startLoopbackServer('s')
        const rejection = assert.rejects(srv.waitForCode(), /Missing code/)
        const res = await get(`${srv.redirectUri}?state=s`)
        assert.strictEqual(res.status, 400)
        await rejection
    })

    await t.test('OAuth provider error param rejects', async () => {
        const srv = await startLoopbackServer('s')
        const rejection = assert.rejects(srv.waitForCode(), /access_denied/)
        const res = await get(`${srv.redirectUri}?error=access_denied`)
        assert.strictEqual(res.status, 400)
        await rejection
    })

    await t.test('non-/callback path returns 404 without rejecting', async () => {
        const srv = await startLoopbackServer('s')
        // Attach a no-op handler to prevent unhandled rejection on close()
        srv.waitForCode().catch(() => {})
        const res = await get(`http://127.0.0.1:${srv.port}/favicon.ico`)
        assert.strictEqual(res.status, 404)
        srv.close()
    })

    await t.test('listens on 127.0.0.1 only', async () => {
        const srv = await startLoopbackServer('s')
        srv.waitForCode().catch(() => {})
        assert.match(srv.redirectUri, /^http:\/\/127\.0\.0\.1:\d+\/callback$/)
        srv.close()
    })
})
