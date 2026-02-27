import { useState } from 'react'
import { Header } from './shared/components/layout/Header'
import { Sidebar } from './shared/components/sidebar/Sidebar'
import { CalendarView } from './calendar/events/components/CalendarView'
import { ListView } from './calendar/events/components/ListView'
import { DiaryView } from './diary/components/DiaryView'
import { EventModal } from './calendar/events/components/EventModal'
import { SettingsModal } from './settings/components/SettingsModal'
import { SmartCommandBar } from './shared/components/common/SmartCommandBar'
import { useAppStore } from './settings/stores/appStore'
import { useEvents } from './calendar/events/hooks/useEvents'
import './App.css'

import { Toaster } from 'react-hot-toast'
import { useModalStore } from './calendar/events/stores/modalStore'
import { useEventStore } from './calendar/events/stores/eventStore'

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
    <div className="app">
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
      <div className="app-content">
        <header className="app-header glass">
          <h1 className="header-logo">🌟 PrimeRing</h1>

          <nav className="header-nav">
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
