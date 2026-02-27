import { create } from 'zustand'

interface ModalState {
    isOpen: boolean
    selectedDate: Date | undefined
    openModal: (date?: Date) => void
    closeModal: () => void

    isSettingsOpen: boolean
    openSettings: () => void
    closeSettings: () => void
}

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    selectedDate: undefined,
    openModal: (date) => set({ isOpen: true, selectedDate: date }),
    closeModal: () => set({ isOpen: false }),

    isSettingsOpen: false,
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
}))
