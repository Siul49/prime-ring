import { OAuth2Client, CodeChallengeMethod } from 'google-auth-library'

export const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
]

export interface OAuthConfig {
    clientId: string
    clientSecret: string
    redirectUri: string
}

/**
 * Build a configured OAuth2Client. Caller is responsible for redirect URI
 * (which depends on the loopback port chosen at login time).
 */
export function createOAuthClient(config: OAuthConfig): OAuth2Client {
    return new OAuth2Client({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
    })
}

/**
 * Generate the consent URL with PKCE code_challenge + state nonce.
 * `state` MUST be checked on callback to prevent CSRF.
 */
export function buildAuthUrl(
    client: OAuth2Client,
    state: string,
    codeChallenge: string
): string {
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // force refresh_token issuance even on repeat login
        scope: SCOPES,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: CodeChallengeMethod.S256,
    })
}

export function loadOAuthCredentials(): { clientId: string; clientSecret: string } {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        throw new Error(
            'Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in environment. ' +
                'Copy .env.example to .env.local and fill in your OAuth credentials.'
        )
    }
    return { clientId, clientSecret }
}
