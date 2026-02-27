import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
// CommonJS handles __dirname automatically, but for TS file treated as module:
// const __dirname = path.dirname(fileURLToPath(import.meta.url)) // (Removing this)

// 데이터 저장 경로 (문서/PrimeRing)
const DATA_DIR = path.join(app.getPath('documents'), 'PrimeRing')
const MAX_DATA_FILE_SIZE_BYTES = 5 * 1024 * 1024

// 저장소 초기화
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

const sanitizeStartUrl = (candidateUrl: string): string => {
    try {
        const parsed = new URL(candidateUrl)
        const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:'
        const isLoopback = parsed.hostname === 'localhost'
            || parsed.hostname === '127.0.0.1'
            || parsed.hostname === '::1'

        if (isHttp && isLoopback) {
            return parsed.toString()
        }
    } catch {
        // fallback below
    }

    return 'http://localhost:5173'
}

const isTrustedRenderer = (url: string): boolean => {
    if (!url) return false

    const isDevRenderer = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(url)
    const isPackagedRenderer = url.startsWith('file://')
    return isDevRenderer || isPackagedRenderer
}

const resolveSafeDataPath = (filename: string): string => {
    if (!/^[a-zA-Z0-9._-]+\.json$/.test(filename)) {
        throw new Error('Invalid filename')
    }

    const resolvedPath = path.resolve(DATA_DIR, filename)
    const dataDirPrefix = DATA_DIR.endsWith(path.sep) ? DATA_DIR : `${DATA_DIR}${path.sep}`
    if (!resolvedPath.startsWith(dataDirPrefix)) {
        throw new Error('Path traversal detected')
    }

    return resolvedPath
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
        },
    })

    // 개발 환경: Vite Dev Server 주소
    // 프로덕션: 빌드된 파일
    const startUrl = sanitizeStartUrl(process.env.ELECTRON_START_URL || 'http://localhost:5173')

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
        if (process.env.OPEN_DEVTOOLS === 'true') {
            mainWindow.webContents.openDevTools()
        }
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!isTrustedRenderer(url)) {
            event.preventDefault()
            console.warn('Blocked unexpected navigation:', url)
        }
    })

    mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

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
ipcMain.handle('save-file', async (event, filename: string, content: string) => {
    try {
        if (!isTrustedRenderer(event.senderFrame.url)) {
            throw new Error('Untrusted renderer')
        }
        if (Buffer.byteLength(content, 'utf-8') > MAX_DATA_FILE_SIZE_BYTES) {
            throw new Error('File too large')
        }

        const filePath = resolveSafeDataPath(filename)
        await fs.promises.writeFile(filePath, content, 'utf-8')
        return { success: true }
    } catch (error: any) {
        console.error('File save error:', error)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('load-file', async (event, filename: string) => {
    try {
        if (!isTrustedRenderer(event.senderFrame.url)) {
            throw new Error('Untrusted renderer')
        }

        const filePath = resolveSafeDataPath(filename)
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8')
            if (Buffer.byteLength(data, 'utf-8') > MAX_DATA_FILE_SIZE_BYTES) {
                throw new Error('File too large')
            }
            return { success: true, data }
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return { success: true, data: null } // 파일 없으면 null 반환
            }
            throw error
        }
    } catch (error: any) {
        console.error('File load error:', error)
        return { success: false, error: error.message }
    }
})
