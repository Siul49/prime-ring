import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import { AuthService } from '../services/authService'

interface AuthState {
    connected: boolean
    email: string | null
    loading: boolean
    refreshStatus: () => Promise<void>
    login: () => Promise<void>
    logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    connected: false,
    email: null,
    loading: false,

    refreshStatus: async () => {
        try {
            const s = await AuthService.getStatus()
            if (s.connected) {
                set({ connected: true, email: s.email })
            } else {
                set({ connected: false, email: null })
            }
        } catch (err) {
            console.error('auth status failed:', err)
            set({ connected: false, email: null })
        }
    },

    login: async () => {
        set({ loading: true })
        try {
            const s = await AuthService.login()
            if (s.connected) {
                set({ connected: true, email: s.email, loading: false })
                toast.success(`Google 계정 연결됨: ${s.email}`)
            } else {
                set({ connected: false, email: null, loading: false })
            }
        } catch (err) {
            set({ loading: false })
            toast.error(`Google 연결 실패: ${(err as Error).message}`)
        }
    },

    logout: async () => {
        try {
            await AuthService.logout()
            set({ connected: false, email: null })
            toast.success('Google 계정 연결 해제됨')
        } catch (err) {
            toast.error(`연결 해제 실패: ${(err as Error).message}`)
        }
    },
}))
