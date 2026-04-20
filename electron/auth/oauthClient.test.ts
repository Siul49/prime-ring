import { test } from 'node:test'
import assert from 'node:assert'
import { createOAuthClient, buildAuthUrl, loadOAuthCredentials, SCOPES } from './oauthClient.ts'

test('oauthClient', async (t) => {
    await t.test('createOAuthClient sets credentials', () => {
        const client = createOAuthClient({
            clientId: 'cid',
            clientSecret: 'csecret',
            redirectUri: 'http://127.0.0.1:12345/callback',
        })
        assert.strictEqual((client as any)._clientId, 'cid')
        assert.ok(client)
    })

    await t.test('buildAuthUrl includes required OAuth params', () => {
        const client = createOAuthClient({
            clientId: 'CID',
            clientSecret: 'CS',
            redirectUri: 'http://127.0.0.1:55555/callback',
        })
        const url = buildAuthUrl(client, 'state-nonce-123', 'pkce-challenge-abc')
        const u = new URL(url)
        assert.strictEqual(u.searchParams.get('access_type'), 'offline')
        assert.strictEqual(u.searchParams.get('prompt'), 'consent')
        assert.strictEqual(u.searchParams.get('state'), 'state-nonce-123')
        assert.strictEqual(u.searchParams.get('code_challenge'), 'pkce-challenge-abc')
        assert.strictEqual(u.searchParams.get('code_challenge_method'), 'S256')
        const scope = u.searchParams.get('scope') ?? ''
        for (const s of SCOPES) assert.ok(scope.includes(s), `missing scope ${s}`)
    })

    await t.test('loadOAuthCredentials throws if env missing', () => {
        const oldId = process.env.GOOGLE_CLIENT_ID
        const oldSecret = process.env.GOOGLE_CLIENT_SECRET
        delete process.env.GOOGLE_CLIENT_ID
        delete process.env.GOOGLE_CLIENT_SECRET
        try {
            assert.throws(() => loadOAuthCredentials(), /Missing GOOGLE_CLIENT_ID/)
        } finally {
            if (oldId) process.env.GOOGLE_CLIENT_ID = oldId
            if (oldSecret) process.env.GOOGLE_CLIENT_SECRET = oldSecret
        }
    })

    await t.test('loadOAuthCredentials returns env values', () => {
        const oldId = process.env.GOOGLE_CLIENT_ID
        const oldSecret = process.env.GOOGLE_CLIENT_SECRET
        process.env.GOOGLE_CLIENT_ID = 'test-id'
        process.env.GOOGLE_CLIENT_SECRET = 'test-secret'
        try {
            const c = loadOAuthCredentials()
            assert.strictEqual(c.clientId, 'test-id')
            assert.strictEqual(c.clientSecret, 'test-secret')
        } finally {
            if (oldId) process.env.GOOGLE_CLIENT_ID = oldId
            else delete process.env.GOOGLE_CLIENT_ID
            if (oldSecret) process.env.GOOGLE_CLIENT_SECRET = oldSecret
            else delete process.env.GOOGLE_CLIENT_SECRET
        }
    })
})
