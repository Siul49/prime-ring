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

// ==========================================
// 보안: 파일 경로 검증 함수
// ==========================================
/**
 * 파일명을 검증하고 안전한 경로를 반환합니다.
 * Path Traversal 공격을 방지합니다.
 *
 * @param filename - 검증할 파일명
 * @returns 검증된 안전한 파일 경로
 * @throws Error - 유효하지 않은 파일명인 경우
 */
function validateAndGetFilePath(filename: string): string {
    // 1️⃣ 입력값 검증
    if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename: must be a non-empty string')
    }

    // 2️⃣ 파일명만 추출 (경로 제거)
    // path.basename()은 '../../../secret.txt' → 'secret.txt'로 변환
    const sanitizedFilename = path.basename(filename)

    // 3️⃣ 안전한 파일명 패턴 검증
    // 허용: 영문, 숫자, 하이픈, 언더스코어, 점, 공백
    // 차단: .., /, \, 특수문자 등
    const safePattern = /^[\w\-. ]+$/
    if (!safePattern.test(sanitizedFilename)) {
        throw new Error(`Invalid filename: "${sanitizedFilename}" contains unsafe characters`)
    }

    // 4️⃣ 숨김 파일 차단 (선택사항)
    if (sanitizedFilename.startsWith('.')) {
        throw new Error('Hidden files are not allowed')
    }

    // 5️⃣ 파일명 길이 제한
    if (sanitizedFilename.length > 255) {
        throw new Error('Filename too long (max 255 characters)')
    }

    // 6️⃣ 안전한 경로 생성
    const filePath = path.join(DATA_DIR, sanitizedFilename)

    // 7️⃣ 경로 정규화 및 검증
    // path.resolve()로 절대 경로 변환 후
    // DATA_DIR 내부인지 확인
    const normalizedPath = path.resolve(filePath)
    const normalizedDataDir = path.resolve(DATA_DIR)

    if (!normalizedPath.startsWith(normalizedDataDir)) {
        throw new Error('Access denied: path outside allowed directory')
    }

    return normalizedPath
}

// ==========================================
// IPC Handlers (보안 강화됨)
// ==========================================

ipcMain.handle('save-file', async (event, filename: string, content: string) => {
    try {
        // 🔒 보안: 파일 경로 검증
        const filePath = validateAndGetFilePath(filename)

        // 🔒 보안: 파일 크기 제한 (10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
        const contentSize = Buffer.byteLength(content, 'utf-8')

        if (contentSize > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File too large: ${(contentSize / 1024 / 1024).toFixed(2)}MB (max 10MB)`
            }
        }

        // 파일 저장
        fs.writeFileSync(filePath, content, 'utf-8')

        console.log(`✅ File saved: ${path.basename(filePath)} (${(contentSize / 1024).toFixed(2)}KB)`)
        return { success: true }
    } catch (error: any) {
        console.error('❌ File save error:', error.message)
        return { success: false, error: error.message }
    }
})

ipcMain.handle('load-file', async (event, filename: string) => {
    try {
        // 🔒 보안: 파일 경로 검증
        const filePath = validateAndGetFilePath(filename)

        // 파일 존재 여부 확인
        if (!fs.existsSync(filePath)) {
            return { success: true, data: null } // 파일 없으면 null 반환
        }

        // 🔒 보안: 파일 크기 확인 (읽기 전)
        const stats = fs.statSync(filePath)
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

        if (stats.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`
            }
        }

        // 파일 읽기
        const data = fs.readFileSync(filePath, 'utf-8')

        console.log(`✅ File loaded: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(2)}KB)`)
        return { success: true, data }
    } catch (error: any) {
        console.error('❌ File load error:', error.message)
        return { success: false, error: error.message }
    }
})
