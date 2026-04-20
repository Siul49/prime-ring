import { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'

export function SyncSettingsPanel() {
    const { connected, email, loading, refreshStatus, login, logout } = useAuthStore()

    useEffect(() => {
        refreshStatus()
    }, [refreshStatus])

    return (
        <div className="settings-section">
            <h3>Google Calendar 연동</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                연결하면 PrimeRing의 일정을 Google Calendar와 자동으로 양방향 동기화합니다.
                연결 전에는 모든 데이터가 로컬에만 저장됩니다.
            </p>

            <div
                className="setting-item"
                style={{ marginTop: '16px', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}
            >
                {connected && email ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#22c55e' }}>●</span>
                            <span>연결됨: <strong>{email}</strong></span>
                        </div>
                        <button
                            className="btn"
                            onClick={logout}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                        >
                            연결 해제
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#94a3b8' }}>○</span>
                            <span>아직 연결되지 않음</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={login}
                            disabled={loading}
                        >
                            {loading ? '연결 중...' : 'Google 계정 연결'}
                        </button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            클릭하면 기본 브라우저가 열려 Google 로그인 화면으로 이동합니다.
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
