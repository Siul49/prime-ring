export interface IElectronAPI {
    saveData: (filename: string, data: string) => Promise<{ success: boolean; error?: string }>
    loadData: (filename: string) => Promise<{ success: boolean; data: string | null; error?: string }>
}

declare global {
    interface Window {
        electron: IElectronAPI
    }
}
