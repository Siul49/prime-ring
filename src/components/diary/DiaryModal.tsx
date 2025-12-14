import { useState, useEffect } from 'react'
import { useDiaryStore } from '../../stores/diaryStore'
import { aiService, type AIAnalysisResult } from '../../services/aiService'
import { toast } from 'react-hot-toast'
import type { Diary } from '../../types'
import './DiaryModal.css'

interface DiaryModalProps {
    isOpen: boolean
    onClose: () => void
    initialDate?: Date
    existingDiary?: Diary | null
}

const MOODS = ['😊', '😐', '😢', '😡', '🥳']

export function DiaryModal({ isOpen, onClose, initialDate, existingDiary }: DiaryModalProps) {
    const { addDiary, updateDiary } = useDiaryStore()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [mood, setMood] = useState<string>('😐')
    const [date, setDate] = useState(new Date())
    const [weather, setWeather] = useState('')

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [aiProgress, setAiProgress] = useState<string>('')
    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null)

    useEffect(() => {
        if (isOpen) {
            if (existingDiary) {
                setTitle(existingDiary.title)
                setContent(existingDiary.content)
                setMood(existingDiary.mood)
                setDate(new Date(existingDiary.date))
                setWeather(existingDiary.weather || '')
            } else {
                setTitle('')
                setContent('')
                setMood('😐')
                setDate(initialDate || new Date())
                setWeather('')
            }
            // Reset AI state when opening
            setAiResult(null)
            setIsAnalyzing(false)
            setAiProgress('')
        }
    }, [existingDiary, isOpen, initialDate])

    const handleAnalyze = async () => {
        if (!content.trim()) {
            toast.error('먼저 일기 내용을 작성해주세요!')
            return
        }

        setIsAnalyzing(true)
        setAiProgress('AI 모델 준비 중...')

        try {
            const result = await aiService.analyzeDiary(content, date, (progress: any) => {
                setAiProgress(progress.text)
            })
            setAiResult(result)
            toast.success('AI 분석 완료!')
        } catch (error) {
            console.error(error)
            toast.error('AI 분석 중 오류가 발생했습니다.')
        } finally {
            setIsAnalyzing(false)
            setAiProgress('')
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return

        // We create a temp object to validate or use, but for store we might need to separate ID
        const diaryData: Diary = {
            id: existingDiary?.id || crypto.randomUUID(),
            title,
            content,
            date: date,
            mood: mood as any,
            weather
        }

        if (existingDiary) {
            await updateDiary(diaryData.id, diaryData)
        } else {
            // Store expects data without ID/Meta, it handles creation
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...dataWithoutId } = diaryData
            await addDiary(dataWithoutId)
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="diary-modal-backdrop" onClick={onClose}>
            <div className="diary-modal glass" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{existingDiary ? '기록 수정' : '오늘의 기록'}</h2>
                    <div className="modal-date">{date.toLocaleDateString()}</div>
                </div>

                <div className="diary-form">
                    <div className="form-group">
                        <label>오늘의 기분</label>
                        <div className="mood-selector">
                            {MOODS.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`mood-btn ${mood === m ? 'selected' : ''}`}
                                    onClick={() => setMood(m)}
                                    title={m}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="오늘의 제목을 지어주세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label>내용</label>
                        <textarea
                            className="input"
                            placeholder="무슨 일이 있었나요?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ height: '300px', resize: 'none' }}
                            required
                        />
                    </div>

                    {/* AI Analysis Section */}
                    <div className="ai-section">
                        {!aiResult && !isAnalyzing && (
                            <button type="button" className="btn btn-ai" onClick={handleAnalyze}>
                                ✨ AI 요약 및 흐름 분석 (Local)
                            </button>
                        )}

                        {isAnalyzing && (
                            <div className="ai-loading">
                                <div className="spinner-sm" />
                                <span>{aiProgress || 'AI가 생각하는 중...'}</span>
                            </div>
                        )}

                        {aiResult && (
                            <div className="ai-result-card">
                                <div className="ai-summary">
                                    <span className="ai-label">📝 요약</span>
                                    <p>{aiResult.summary}</p>
                                </div>
                                <div className="ai-flow">
                                    <span className="ai-label">🔗 하루의 흐름</span>
                                    <div className="flow-steps">
                                        {aiResult.flow.map((step, idx) => (
                                            <div key={idx} className="flow-step">
                                                <span className="step-dot" />
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="ai-tips">
                                    <span className="ai-label">💡 AI의 한마디</span>
                                    <p>{aiResult.tips}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            취소
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
