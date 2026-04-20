import http from 'http'
import type { AddressInfo } from 'net'

export interface LoopbackResult {
    code: string
    state: string
}

export interface StartedServer {
    port: number
    redirectUri: string
    /** Resolves with the OAuth code on first valid callback, rejects on invalid state or timeout. */
    waitForCode: () => Promise<LoopbackResult>
    close: () => void
}

const TIMEOUT_MS = 5 * 60 * 1000 // 5 min for the user to complete consent

/**
 * Start a 1-shot localhost HTTP server on a random ephemeral port.
 * The OAuth provider redirects the browser here with `code` + `state`.
 * Server shuts itself down after the first valid callback (or on timeout / close()).
 *
 * Caller flow:
 *   const srv = await startLoopbackServer(expectedState)
 *   // build authUrl with srv.redirectUri, open browser
 *   const { code } = await srv.waitForCode()
 */
export async function startLoopbackServer(expectedState: string): Promise<StartedServer> {
    let resolveCode!: (r: LoopbackResult) => void
    let rejectCode!: (e: Error) => void
    const codePromise = new Promise<LoopbackResult>((res, rej) => {
        resolveCode = res
        rejectCode = rej
    })

    const server = http.createServer((req, res) => {
        if (!req.url) return
        // Only accept callback path; ignore favicon etc.
        const u = new URL(req.url, 'http://127.0.0.1')
        if (u.pathname !== '/callback') {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('Not Found')
            return
        }
        const code = u.searchParams.get('code')
        const state = u.searchParams.get('state')
        const errParam = u.searchParams.get('error')

        if (errParam) {
            sendHtml(res, 400, htmlMessage('인증이 취소되었습니다', `오류: ${errParam}`))
            rejectCode(new Error(`OAuth provider returned error: ${errParam}`))
            return
        }
        if (!code || !state) {
            sendHtml(res, 400, htmlMessage('잘못된 요청', 'code 또는 state 파라미터가 누락되었습니다.'))
            rejectCode(new Error('Missing code or state in callback'))
            return
        }
        if (state !== expectedState) {
            sendHtml(res, 400, htmlMessage('인증 거부', 'state 불일치 (CSRF 방어).'))
            rejectCode(new Error('State mismatch — possible CSRF'))
            return
        }
        sendHtml(
            res,
            200,
            htmlMessage(
                '✅ PrimeRing 연결 완료',
                '이 창은 닫아도 됩니다. PrimeRing 앱으로 돌아가세요.'
            )
        )
        resolveCode({ code, state })
    })

    await new Promise<void>((res, rej) => {
        server.once('error', rej)
        server.listen(0, '127.0.0.1', () => res())
    })
    const port = (server.address() as AddressInfo).port

    // Auto-timeout
    const timer = setTimeout(() => {
        rejectCode(new Error('OAuth callback timed out (no response in 5 minutes)'))
        server.close()
    }, TIMEOUT_MS)

    const waitForCode = async (): Promise<LoopbackResult> => {
        try {
            return await codePromise
        } finally {
            clearTimeout(timer)
            server.close()
        }
    }

    return {
        port,
        redirectUri: `http://127.0.0.1:${port}/callback`,
        waitForCode,
        close: () => {
            clearTimeout(timer)
            server.close()
        },
    }
}

function sendHtml(res: http.ServerResponse, code: number, body: string) {
    res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(body)
}

function htmlMessage(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f172a; color:#e2e8f0;
         display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }
  .card { background:#1e293b; padding:32px 40px; border-radius:12px; max-width:420px; text-align:center;
          box-shadow:0 8px 32px rgba(0,0,0,0.4); }
  h1 { margin:0 0 12px; font-size:1.4rem; }
  p { margin:0; color:#94a3b8; }
</style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(body)}</p>
  </div>
</body>
</html>`
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
    )
}
