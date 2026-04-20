import keytar from 'keytar'

const SERVICE = 'PrimeRing'
const ACCOUNT = 'google_oauth_token'

export interface StoredTokens {
    refresh_token: string
    issued_at?: string
    account_email?: string
}

/**
 * Minimal keychain interface (subset of the keytar API we use).
 * Allowing injection makes this module testable without the keytar native binding.
 */
export interface KeychainBackend {
    getPassword(service: string, account: string): Promise<string | null>
    setPassword(service: string, account: string, password: string): Promise<void>
    deletePassword(service: string, account: string): Promise<boolean>
}

let backend: KeychainBackend = keytar

/** Test hook — swap the backend with an in-memory implementation. */
export function _setBackendForTests(b: KeychainBackend) {
    backend = b
}
export function _resetBackendForTests() {
    backend = keytar
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
    await backend.setPassword(SERVICE, ACCOUNT, JSON.stringify(tokens))
}

export async function loadTokens(): Promise<StoredTokens | null> {
    const raw = await backend.getPassword(SERVICE, ACCOUNT)
    if (!raw) return null
    try {
        return JSON.parse(raw) as StoredTokens
    } catch {
        return null
    }
}

export async function clearTokens(): Promise<boolean> {
    return backend.deletePassword(SERVICE, ACCOUNT)
}
