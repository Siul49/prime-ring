import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
// CommonJS handles __dirname automatically, but for TS file treated as module:
// const __dirname = path.dirname(fileURLToPath(import.meta.url)) // (Removing this)

// 데이터 저장 경로 (문서/PrimeRing)
const DATA_DIR = path.join(app.getPath('documents'), 'PrimeRing')

// 저장소 초기화
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    // 개발 환경: Vite Dev Server 주소
    // 프로덕션: 빌드된 파일
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173'

    console.log('🚀 Electron starting with URL:', startUrl)
    console.log('ME: NODE_ENV=', process.env.NODE_ENV)
    console.log('ME: app.isPackaged=', app.isPackaged)

    const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'

    if (isDev) {
        mainWindow.loadURL(startUrl).catch(e => {
            console.error('❌ Failed to load URL:', e)
            // Retry once after 3 seconds
            setTimeout(() => {
                console.log('🔄 Retrying load URL...')
                mainWindow.loadURL(startUrl)
            }, 3000)
        })
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('❌ Page failed to load:', errorCode, errorDescription)
    })

    mainWindow.webContents.on('dom-ready', () => {
        console.log('✅ DOM Ready')
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// IPC Handlers
function ensureSafePath(filename: string): string {
    const resolvedDataDir = path.resolve(DATA_DIR)
    const resolvedFilePath = path.resolve(path.join(DATA_DIR, filename))
    const relativePath = path.relative(resolvedDataDir, resolvedFilePath)

    const isOutside = relativePath.startsWith('..') && (relativePath.length === 2 || relativePath[2] === path.sep)
    if (isOutside || path.isAbsolute(relativePath)) {
        throw new Error('Access denied: Invalid file path')
    }
    return resolvedFilePath
}

ipcMain.handle('save-file', async (event, filename: string, content: string) => {
    try {
        const filePath = ensureSafePath(filename)
        fs.writeFileSync(filePath, content, 'utf-8')
        return { success: true }
    } catch (error: any) {
        console.error('File save error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('load-file', async (event, filename: string) => {
    try {
        const filePath = ensureSafePath(filename)
        if (!fs.existsSync(filePath)) {
            return { success: true, data: null } // 파일 없으면 null 반환
        }
        const data = fs.readFileSync(filePath, 'utf-8')
        return { success: true, data }
    } catch (error: any) {
        console.error('File load error:', error)
        return { success: false, error: error.message }
    }
})
