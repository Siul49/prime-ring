import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/sidebar/Sidebar'
import { CalendarView } from './components/calendar/CalendarView'
import { ListView } from './components/list/ListView'
import { DiaryView } from './components/diary/DiaryView'
import { EventModal } from './components/calendar/EventModal'
import { SettingsModal } from './components/settings/SettingsModal'
import { SmartCommandBar } from './components/common/SmartCommandBar'
import { useAppStore } from './stores/appStore'
import { useEvents } from './hooks/useEvents'
import './App.css'

import { Toaster } from 'react-hot-toast'
import { useModalStore } from './stores/modalStore'
import { useEventStore } from './stores/eventStore'

function App() {
  const { currentView, setCurrentView } = useAppStore()
  const { loading } = useEvents() // 데이터 구독 로직 캡슐화
  const { isOpen, selectedDate, openModal, closeModal } = useModalStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()

  const handleOpenNewEvent = () => {
    useEventStore.getState().setSelectedEvent(null)
    openModal(new Date())
  }

  return (
    <div className="app relative">
      <div className="grid-background" />
      <div className="grain-overlay" />
      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 99999,
          top: 80,
        }}
        toastOptions={{
          className: 'glass-toast',
          style: {
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--glass-shadow)',
            padding: '16px',
            borderRadius: '12px',
            zIndex: 99999,
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: 'white',
            },
          },
        }}
      />
      <div className="app-content relative z-10">
        <header className="app-header border-b border-deep-navy/10 py-6">
          <h1 className="header-logo !text-deep-navy !bg-none !bg-clip-border !fill-none">
            🌟 PrimeRing
          </h1>

          <nav className="header-nav bg-neutral-100/50 border-neutral-200">
            <button
              className={`nav-tab ${currentView === 'month' ? 'nav-tab-active' : ''}`}
              onClick={() => setCurrentView('month')}
            >
              📅 캘린더
            </button>
            <button
              className={`nav-tab ${currentView === 'list' ? 'nav-tab-active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              📋 리스트
            </button>
            <button
              className={`nav-tab ${currentView === 'diary' ? 'nav-tab-active' : ''}`}
              onClick={() => setCurrentView('diary')}
            >
              📝 일기
            </button>
          </nav>

          <Header />
        </header>

        <div className="app-layout">
          <Sidebar
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
          <main className="main">
            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <p>일정을 불러오는 중...</p>
              </div>
            ) : (
              <>
                {currentView === 'month' && <CalendarView />}
                {currentView === 'list' && <ListView />}
                {currentView === 'diary' && <DiaryView />}
              </>
            )}
          </main>
        </div>
      </div>

      <button className="fab" onClick={handleOpenNewEvent} title="새 일정 추가">
        +
      </button>

      {isOpen && (
        <EventModal
          isOpen={true}
          onClose={closeModal}
          initialDate={selectedDate}
        />
      )}
      <SettingsModal />
      <SmartCommandBar />
    </div>
  )
}

export default App
