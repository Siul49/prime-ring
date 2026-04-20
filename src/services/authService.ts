import type { AuthStatusDTO } from '../electron.d'

function ensureElectron() {
    if (!window.electron) throw new Error('Electron API not available')
}

export const AuthService = {
    getStatus: async (): Promise<AuthStatusDTO> => {
        if (!window.electron) return { connected: false }
        const res = await window.electron.auth.status()
        if (!res.success) throw new Error(res.error)
        return res.data
    },

    login: async (): Promise<AuthStatusDTO> => {
        ensureElectron()
        const res = await window.electron.auth.login()
        if (!res.success) throw new Error(res.error)
        return res.data
    },

    logout: async (): Promise<void> => {
        ensureElectron()
        const res = await window.electron.auth.logout()
        if (!res.success) throw new Error(res.error)
    },
}
