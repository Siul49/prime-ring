# 🔐 보안 가이드

PrimeRing 프로젝트의 보안 개선사항 및 모범 사례를 설명합니다.

## 📋 목차

- [보안 개선사항](#-보안-개선사항)
- [보안 아키텍처](#-보안-아키텍처)
- [알려진 제한사항](#-알려진-제한사항)
- [보안 취약점 신고](#-보안-취약점-신고)

---

## ✅ 보안 개선사항

### 1. Path Traversal 방어 (Electron IPC)

#### 문제점
악의적인 렌더러 프로세스가 파일 경로를 조작하여 시스템 파일에 접근할 수 있었습니다.

```typescript
// ❌ 취약한 코드 (수정 전)
ipcMain.handle('save-file', async (event, filename: string, content: string) => {
    const filePath = path.join(DATA_DIR, filename)  // 위험!
    fs.writeFileSync(filePath, content, 'utf-8')
})

// 공격 시나리오
await window.electron.saveData('../../../secrets.txt', 'hacked!')
// 결과: /Users/Documents/PrimeRing/../../../secrets.txt
//     = /Users/secrets.txt (의도하지 않은 위치!)
```

#### 해결 방법
**7단계 검증 시스템** 구현:

1. **입력값 검증**: 문자열 타입 확인
2. **경로 정규화**: `path.basename()`으로 경로 제거
3. **패턴 검증**: 안전한 문자만 허용 (`/^[\w\-. ]+$/`)
4. **숨김 파일 차단**: `.`으로 시작하는 파일명 거부
5. **길이 제한**: 255자 이하로 제한
6. **안전한 경로 생성**: `path.join()` 사용
7. **최종 경로 검증**: `path.resolve()`로 절대 경로 변환 후 DATA_DIR 내부인지 확인

```typescript
// ✅ 안전한 코드 (수정 후)
function validateAndGetFilePath(filename: string): string {
    // 1. 입력값 검증
    if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename')
    }

    // 2. 파일명만 추출
    const sanitized = path.basename(filename)  // '../../../secret.txt' → 'secret.txt'

    // 3. 안전한 패턴 검증
    if (!/^[\w\-. ]+$/.test(sanitized)) {
        throw new Error('Invalid filename')
    }

    // 4-7. 추가 검증...

    const filePath = path.join(DATA_DIR, sanitized)
    const normalized = path.resolve(filePath)

    // 최종 경로가 DATA_DIR 내부인지 확인
    if (!normalized.startsWith(path.resolve(DATA_DIR))) {
        throw new Error('Access denied')
    }

    return normalized
}
```

#### 테스트 결과
```typescript
// ✅ 정상 파일명
validateAndGetFilePath('events.json')         // OK
validateAndGetFilePath('diary_2024.json')     // OK

// ❌ 차단되는 공격
validateAndGetFilePath('../../../etc/passwd') // Error: Invalid filename
validateAndGetFilePath('..\\..\\system32')    // Error: Invalid filename
validateAndGetFilePath('.env')                // Error: Hidden files not allowed
validateAndGetFilePath('event<>.json')        // Error: Unsafe characters
```

---

### 2. localStorage 용량 초과 방어

#### 문제점
브라우저 localStorage는 5-10MB로 제한되며, 초과 시 `QuotaExceededError` 발생하여 앱이 크래시됩니다.

```typescript
// ❌ 취약한 코드 (수정 전)
localStorage.setItem(FILE_NAME, jsonData)  // 에러 처리 없음!

// 결과
Uncaught DOMException: QuotaExceededError
→ 앱 크래시, 데이터 손실
```

#### 해결 방법

1. **사전 크기 체크**: `Blob` API로 데이터 크기 측정
2. **크기 제한**: 5MB 이하로 제한 (대부분의 브라우저에서 안전)
3. **에러 처리**: `QuotaExceededError` 명시적 처리
4. **사용자 안내**: 친절한 에러 메시지 제공

```typescript
// ✅ 안전한 코드 (수정 후)
try {
    const MAX_STORAGE_SIZE = 5 * 1024 * 1024  // 5MB
    const dataSize = new Blob([jsonData]).size

    // 사전 크기 체크
    if (dataSize > MAX_STORAGE_SIZE) {
        const sizeMB = (dataSize / 1024 / 1024).toFixed(2)
        throw new Error(
            `데이터가 너무 큽니다 (${sizeMB}MB). ` +
            `오래된 데이터를 삭제하거나 데스크톱 앱을 사용하세요.`
        )
    }

    localStorage.setItem(FILE_NAME, jsonData)

    // 개발 모드에서 용량 로깅
    if (import.meta.env.DEV) {
        const sizeKB = (dataSize / 1024).toFixed(2)
        console.log(`✅ Saved: ${sizeKB}KB / 5MB`)
    }
} catch (error: any) {
    // QuotaExceededError 처리
    if (error.name === 'QuotaExceededError') {
        throw new Error('저장 공간이 부족합니다. 오래된 데이터를 삭제하세요.')
    }
    throw error
}
```

#### 용량 가이드
| 브라우저 | localStorage 제한 | PrimeRing 제한 |
|---------|------------------|---------------|
| Chrome  | ~10MB            | 5MB (안전)    |
| Firefox | ~10MB            | 5MB (안전)    |
| Safari  | ~5MB             | 5MB (안전)    |
| Edge    | ~10MB            | 5MB (안전)    |

**예상 저장 가능량** (5MB 기준):
- 다이어리: 약 5,000개 (각 1KB 가정)
- 이벤트: 약 10,000개 (각 500B 가정)

---

### 3. 파일 크기 제한 (DoS 방어)

#### 문제점
악의적인 사용자가 매우 큰 파일을 저장하여 시스템 리소스를 고갈시킬 수 있습니다.

#### 해결 방법

```typescript
// electron/main.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB

// 저장 전 크기 체크
const contentSize = Buffer.byteLength(content, 'utf-8')
if (contentSize > MAX_FILE_SIZE) {
    return {
        success: false,
        error: `File too large: ${(contentSize / 1024 / 1024).toFixed(2)}MB`
    }
}

// 읽기 전 크기 체크
const stats = fs.statSync(filePath)
if (stats.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large' }
}
```

---

## 🏗️ 보안 아키텍처

### Electron 보안 모델

```
┌─────────────────────────────────────┐
│   Renderer Process (브라우저)        │
│   - nodeIntegration: false ✅        │
│   - contextIsolation: true ✅        │
│   - 직접 파일 접근 불가 ✅            │
└──────────────┬──────────────────────┘
               │ IPC (제한적 통신)
               ▼
┌─────────────────────────────────────┐
│   Preload Script (중간 계층)         │
│   - 안전한 API만 노출                │
│   - window.electron.saveData()      │
│   - window.electron.loadData()      │
└──────────────┬──────────────────────┘
               │ contextBridge
               ▼
┌─────────────────────────────────────┐
│   Main Process (Node.js)            │
│   - 파일 시스템 접근 권한            │
│   - 입력 검증 ✅                     │
│   - 경로 검증 ✅                     │
│   - 크기 제한 ✅                     │
└─────────────────────────────────────┘
```

### 방어 계층 (Defense in Depth)

1. **렌더러 프로세스**: Node.js 접근 차단
2. **Preload Script**: 최소 권한 API만 노출
3. **IPC 핸들러**: 입력 검증 및 크기 제한
4. **파일 시스템**: 경로 검증 및 권한 확인

---

## ⚠️ 알려진 제한사항

### 1. Firebase 설정 시 보안
Firebase 사용 시 주의사항:

```env
# ❌ 절대 Git에 커밋하지 마세요!
VITE_FIREBASE_API_KEY=your_api_key_here

# ✅ .env.local 파일은 .gitignore에 포함됨
```

**권장사항:**
- Firebase Security Rules 설정
- API 키 제한 (HTTP Referrer, IP 주소)
- 인증 규칙 강화

### 2. 브라우저 모드 제한
- **localStorage는 암호화되지 않음** → 민감한 데이터는 Electron 앱 사용 권장
- **동기화 없음** → 브라우저 데이터 삭제 시 복구 불가

### 3. AI 모델 보안
- 로컬 실행으로 데이터 유출 위험 없음 ✅
- 프롬프트 인젝션 가능성 있음 (낮은 위험도)

---

## 🐛 보안 취약점 신고

보안 취약점을 발견하셨나요?

### 신고 방법

**이메일**: GitHub Issues에 **공개하지 말고** 프로젝트 관리자에게 직접 연락하세요.

### 신고 시 포함할 정보

1. **취약점 설명**
2. **재현 단계** (PoC)
3. **영향 범위**
4. **제안 해결책** (선택사항)

### 처리 프로세스

1. **24시간 내** 접수 확인
2. **7일 내** 취약점 분석
3. **30일 내** 패치 릴리스
4. **공개**: 패치 후 60일 뒤 공개 (합의 하에)

---

## 📚 추가 자료

### Electron 보안 가이드
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### 보안 도구
- [electron-builder code signing](https://www.electron.build/code-signing)
- [ESLint security plugins](https://www.npmjs.com/package/eslint-plugin-security)

---

**최종 업데이트**: 2026-01-11
**작성자**: PrimeRing Security Team
