import crypto from 'crypto'
import { shell } from 'electron'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import {
    createOAuthClient,
    buildAuthUrl,
    loadOAuthCredentials,
    SCOPES,
} from './oauthClient'
import { startLoopbackServer } from './loopbackServer'
import { saveTokens, loadTokens, clearTokens } from './tokenStore'

export type AuthStatus =
    | { connected: false }
    | { connected: true; email: string }

let inFlightLogin: Promise<AuthStatus> | null = null

/**
 * Load refresh token from keychain and build a ready-to-use OAuth2Client.
 * Returns null if no token saved (user hasn't connected).
 *
 * The Google client library will auto-refresh access tokens on demand.
 */
export async function getAuthenticatedClient(): Promise<OAuth2Client | null> {
    const saved = await loadTokens()
    if (!saved) return null

    const { clientId, clientSecret } = loadOAuthCredentials()
    // For an already-authenticated client we don't need a redirect URI.
    const client = createOAuthClient({
        clientId,
        clientSecret,
        redirectUri: 'http://127.0.0.1', // not used after initial auth
    })
    client.setCredentials({ refresh_token: saved.refresh_token })
    return client
}

export async function getStatus(): Promise<AuthStatus> {
    const saved = await loadTokens()
    if (!saved) return { connected: false }
    return { connected: true, email: saved.account_email ?? '(이메일 미저장)' }
}

/**
 * Full OAuth flow. Idempotent: returns existing in-flight promise if called
 * twice in a row (prevents two browser windows opening).
 *
 *   1. Start loopback server on random port
 *   2. Open user's default browser to Google consent
 *   3. Wait for callback with code
 *   4. Exchange code for tokens
 *   5. Look up email
 *   6. Persist refresh_token + email to OS keychain
 */
export async function login(): Promise<AuthStatus> {
    if (inFlightLogin) return inFlightLogin
    inFlightLogin = doLogin().finally(() => {
        inFlightLogin = null
    })
    return inFlightLogin
}

async function doLogin(): Promise<AuthStatus> {
    const { clientId, clientSecret } = loadOAuthCredentials()
    const state = crypto.randomBytes(32).toString('base64url')
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url')

    const server = await startLoopbackServer(state)
    try {
        const client = createOAuthClient({
            clientId,
            clientSecret,
            redirectUri: server.redirectUri,
        })
        const authUrl = buildAuthUrl(client, state, codeChallenge)
        await shell.openExternal(authUrl)

        const { code } = await server.waitForCode()
        const { tokens } = await client.getToken({
            code,
            codeVerifier,
            redirect_uri: server.redirectUri,
        })

        if (!tokens.refresh_token) {
            throw new Error(
                'No refresh_token returned by Google. ' +
                    'Revoke app access at https://myaccount.google.com/permissions and retry.'
            )
        }

        client.setCredentials(tokens)
        const email = await lookupEmail(client)
        await saveTokens({
            refresh_token: tokens.refresh_token,
            issued_at: new Date().toISOString(),
            account_email: email,
        })
        return { connected: true, email }
    } finally {
        server.close()
    }
}

async function lookupEmail(client: OAuth2Client): Promise<string> {
    try {
        const oauth2 = google.oauth2({ version: 'v2', auth: client })
        const me = await oauth2.userinfo.get()
        return me.data.email ?? '(unknown)'
    } catch {
        return '(unknown)'
    }
}

export async function logout(): Promise<void> {
    // Best-effort revoke (doesn't matter if it fails, we're clearing local anyway)
    try {
        const client = await getAuthenticatedClient()
        if (client) await client.revokeCredentials()
    } catch {
        // ignore
    }
    await clearTokens()
}

export { SCOPES }
