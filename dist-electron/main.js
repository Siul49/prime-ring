"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// CommonJS handles __dirname automatically, but for TS file treated as module:
// const __dirname = path.dirname(fileURLToPath(import.meta.url)) // (Removing this)
// 데이터 저장 경로 (문서/PrimeRing)
const DATA_DIR = path_1.default.join(electron_1.app.getPath('documents'), 'PrimeRing');
// 저장소 초기화
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
function createWindow() {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // 개발 환경: Vite Dev Server 주소
    // 프로덕션: 빌드된 파일
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    console.log('🚀 Electron starting with URL:', startUrl);
    console.log('ME: NODE_ENV=', process.env.NODE_ENV);
    console.log('ME: app.isPackaged=', electron_1.app.isPackaged);
    const isDev = !electron_1.app.isPackaged || process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL(startUrl).catch(e => {
            console.error('❌ Failed to load URL:', e);
            // Retry once after 3 seconds
            setTimeout(() => {
                console.log('🔄 Retrying load URL...');
                mainWindow.loadURL(startUrl);
            }, 3000);
        });
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('❌ Page failed to load:', errorCode, errorDescription);
    });
    mainWindow.webContents.on('dom-ready', () => {
        console.log('✅ DOM Ready');
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC Handlers
electron_1.ipcMain.handle('save-file', (event, filename, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filePath = path_1.default.join(DATA_DIR, filename);
        fs_1.default.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    }
    catch (error) {
        console.error('File save error:', error);
        return { success: false, error: error.message };
    }
}));
electron_1.ipcMain.handle('load-file', (event, filename) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filePath = path_1.default.join(DATA_DIR, filename);
        if (!fs_1.default.existsSync(filePath)) {
            return { success: true, data: null }; // 파일 없으면 null 반환
        }
        const data = fs_1.default.readFileSync(filePath, 'utf-8');
        return { success: true, data };
    }
    catch (error) {
        console.error('File load error:', error);
        return { success: false, error: error.message };
    }
}));
