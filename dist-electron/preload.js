"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    saveData: (filename, data) => electron_1.ipcRenderer.invoke('save-file', filename, data),
    loadData: (filename) => electron_1.ipcRenderer.invoke('load-file', filename),
});
