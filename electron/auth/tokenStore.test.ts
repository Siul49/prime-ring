import { test } from 'node:test'
import assert from 'node:assert'
import {
    saveTokens,
    loadTokens,
    clearTokens,
    _setBackendForTests,
    _resetBackendForTests,
    type KeychainBackend,
} from './tokenStore.ts'

function memoryBackend(): KeychainBackend & { _store: Map<string, string> } {
    const _store = new Map<string, string>()
    const k = (s: string, a: string) => `${s}::${a}`
    return {
        _store,
        async getPassword(s, a) {
            return _store.get(k(s, a)) ?? null
        },
        async setPassword(s, a, v) {
            _store.set(k(s, a), v)
        },
        async deletePassword(s, a) {
            const key = k(s, a)
            const had = _store.has(key)
            _store.delete(key)
            return had
        },
    }
}

test('tokenStore', async (t) => {
    let backend: ReturnType<typeof memoryBackend>

    t.beforeEach(() => {
        backend = memoryBackend()
        _setBackendForTests(backend)
    })

    t.afterEach(() => {
        _resetBackendForTests()
    })

    await t.test('loadTokens returns null when nothing stored', async () => {
        assert.strictEqual(await loadTokens(), null)
    })

    await t.test('saveTokens + loadTokens roundtrip', async () => {
        await saveTokens({
            refresh_token: 'rt-abc',
            issued_at: '2026-04-20T00:00:00.000Z',
            account_email: 'user@example.com',
        })
        const got = await loadTokens()
        assert.deepStrictEqual(got, {
            refresh_token: 'rt-abc',
            issued_at: '2026-04-20T00:00:00.000Z',
            account_email: 'user@example.com',
        })
    })

    await t.test('clearTokens removes the entry', async () => {
        await saveTokens({ refresh_token: 'rt-x' })
        const removed = await clearTokens()
        assert.strictEqual(removed, true)
        assert.strictEqual(await loadTokens(), null)
    })

    await t.test('clearTokens returns false when nothing to clear', async () => {
        assert.strictEqual(await clearTokens(), false)
    })

    await t.test('corrupt JSON in keychain → loadTokens returns null', async () => {
        backend._store.set('PrimeRing::google_oauth_token', '{not json')
        assert.strictEqual(await loadTokens(), null)
    })

    await t.test('refresh_token written as JSON, never plain text', async () => {
        await saveTokens({ refresh_token: 'super-secret' })
        const raw = backend._store.get('PrimeRing::google_oauth_token')!
        // Must be JSON-wrapped, not raw token
        assert.notStrictEqual(raw, 'super-secret')
        assert.match(raw, /^\{.*"refresh_token":"super-secret"/)
    })
})
