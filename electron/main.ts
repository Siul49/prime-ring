import { app, BrowserWindow } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { openDb, setDb, closeDb } from './db'
import { runMigrations } from './db/migrate'
import { migrateJsonToSqlite } from './db/migrate-json'
import { registerIpcHandlers, showFatalDbError } from './ipc'

// Load .env.local before anything that reads process.env (auth credentials etc).
// Repo root is two levels up from dist-electron/main.js (dist-electron/main.js → ../../)
const ENV_PATH = path.resolve(__dirname, '..', '.env.local')
dotenv.config({ path: ENV_PATH })

const DATA_DIR = path.join(app.getPath('documents'), 'PrimeRing')
const DB_PATH = path.join(DATA_DIR, 'prime-ring.db')
const MIGRATIONS_DIR = path.join(__dirname, 'db', 'migrations')

let mainWindow: BrowserWindow | null = null

// Enforce single instance so WAL locking stays simple
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.show()
            mainWindow.focus()
        }
    })
}

function initDatabase(): boolean {
    try {
        const db = openDb(DB_PATH)
        runMigrations(db, MIGRATIONS_DIR)
        const result = migrateJsonToSqlite(db, DATA_DIR)
        if (result.attempted) {
            console.log(
                `📦 JSON migration: ${result.events} events, ${result.diaries} diaries` +
                    (result.error ? ` (error: ${result.error})` : '')
            )
        }
        setDb(db)
        registerIpcHandlers(db)
        return true
    } catch (err) {
        console.error('❌ Database init failed:', err)
        showFatalDbError(err as Error)
        return false
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173'
    const isDev = !app.isPackaged || process.env.NODE_ENV === 'development'

    console.log('🚀 Electron starting:', { startUrl, isDev, isPackaged: app.isPackaged })

    if (isDev) {
        mainWindow.loadURL(startUrl).catch((e) => {
            console.error('❌ Failed to load URL:', e)
            setTimeout(() => mainWindow.loadURL(startUrl), 3000)
        })
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
        console.error('❌ Page failed to load:', code, desc)
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.whenReady().then(() => {
    if (!initDatabase()) {
        app.quit()
        return
    }
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    closeDb()
    if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
    closeDb()
})
