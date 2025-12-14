import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
    saveData: (filename: string, data: string) => ipcRenderer.invoke('save-file', filename, data),
    loadData: (filename: string) => ipcRenderer.invoke('load-file', filename),
})
