import { contextBridge, ipcRenderer } from 'electron'

const api = {
    events: {
        list: () => ipcRenderer.invoke('events:list'),
        get: (id: string) => ipcRenderer.invoke('events:get', id),
        upsert: (row: unknown) => ipcRenderer.invoke('events:upsert', row),
        patch: (payload: unknown) => ipcRenderer.invoke('events:patch', payload),
        delete: (id: string) => ipcRenderer.invoke('events:delete', id),
    },
    diaries: {
        list: () => ipcRenderer.invoke('diaries:list'),
        upsert: (row: unknown) => ipcRenderer.invoke('diaries:upsert', row),
        delete: (id: string) => ipcRenderer.invoke('diaries:delete', id),
    },
    categories: {
        list: () => ipcRenderer.invoke('categories:list'),
        upsert: (row: unknown) => ipcRenderer.invoke('categories:upsert', row),
        delete: (id: string) => ipcRenderer.invoke('categories:delete', id),
    },
    auth: {
        status: () => ipcRenderer.invoke('auth:status'),
        login: () => ipcRenderer.invoke('auth:login'),
        logout: () => ipcRenderer.invoke('auth:logout'),
    },
}

contextBridge.exposeInMainWorld('electron', api)

export type ElectronAPI = typeof api
