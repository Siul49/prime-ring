import { useState, useEffect } from 'react'
import { useDiaryStore } from '../../stores/diaryStore'
import { aiService, type AIAnalysisResult } from '../../services/aiService'
import { toast } from 'react-hot-toast'
import type { Diary } from '../../types'

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

    function getMoodEmoji(mood: string) {
        switch (mood) {
            case 'happy': return '😊'
            case 'sad': return '😢'
            case 'angry': return '😡'
            case 'excited': return '🤩'
            case 'neutral': return '😐'
            default: return mood // Return the emoji itself if it's already an emoji
        }
    }

    return (
        <div className="fixed inset-0 bg-deep-navy/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="px-8 py-6 border-b border-deep-navy/5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-deep-navy font-serif">
                            {existingDiary ? 'Edit Entry' : 'New Journal Entry'}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/40 mt-1">
                            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button className="text-serene-blue/40 hover:text-deep-navy transition-colors" onClick={onClose}>✕</button>
                </header>

                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Today's Mood</label>
                        <div className="flex gap-3">
                            {MOODS.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`text-2xl p-4 rounded-xl transition-all ${mood === m ? 'bg-neutral-100 ring-1 ring-deep-navy/10 scale-110' : 'opacity-40 hover:opacity-100 hover:bg-neutral-50'}`}
                                    onClick={() => setMood(m)}
                                    title={m}
                                >
                                    {getMoodEmoji(m)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Title</label>
                            <input
                                type="text"
                                className="w-full px-0 py-2 bg-transparent border-b border-deep-navy/10 focus:border-deep-navy outline-none transition-all text-xl font-bold text-deep-navy placeholder:text-serene-blue/20"
                                placeholder="Give this moment a name..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-serene-blue/60 ml-1">Content</label>
                            <textarea
                                className="w-full px-0 py-2 bg-transparent focus:outline-none transition-all text-deep-navy leading-relaxed placeholder:text-serene-blue/20 resize-none min-h-[200px]"
                                placeholder="Write your thoughts here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="pt-8 border-t border-deep-navy/5">
                        {!aiResult && !isAnalyzing && (
                            <button
                                type="button"
                                className="w-full py-4 bg-neutral-50 hover:bg-neutral-100 border border-deep-navy/5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-deep-navy transition-all flex items-center justify-center gap-2 group"
                                onClick={handleAnalyze}
                            >
                                <span className="group-hover:rotate-12 transition-transform">✨</span>
                                AI Reflection & Flow Analysis
                            </button>
                        )}

                        {isAnalyzing && (
                            <div className="py-8 text-center space-y-4 bg-neutral-50 rounded-xl border border-dashed border-deep-navy/10">
                                <div className="w-5 h-5 border-2 border-deep-navy/10 border-t-deep-navy rounded-full animate-spin mx-auto" />
                                <p className="text-[11px] font-bold uppercase tracking-widest text-serene-blue/60">
                                    {aiProgress || 'Analyzing your day...'}
                                </p>
                            </div>
                        )}

                        {aiResult && (
                            <div className="space-y-8 bg-neutral-50 p-8 rounded-2xl border border-deep-navy/5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-deep-navy mb-4 block">Summary</span>
                                    <p className="text-sm text-serene-blue/80 leading-relaxed italic">"{aiResult.summary}"</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-deep-navy mb-4 block">Day Flow</span>
                                    <div className="space-y-4 pl-4 border-l-2 border-deep-navy/5">
                                        {aiResult.flow.map((step, idx) => (
                                            <div key={idx} className="relative text-xs text-serene-blue font-medium">
                                                <div className="absolute -left-[21px] top-1 w-2 h-2 bg-white ring-2 ring-deep-navy/10 rounded-full" />
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-deep-navy mb-4 block">AI Insight</span>
                                    <div className="bg-white p-4 rounded-lg ring-1 ring-deep-navy/5 shadow-sm text-xs text-serene-blue/80 leading-relaxed">
                                        {aiResult.tips}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="px-8 py-6 border-t border-deep-navy/5 flex justify-end gap-4 flex-shrink-0">
                    <button
                        type="button"
                        className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-serene-blue/40 hover:text-deep-navy transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-10 py-2 bg-deep-navy text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-deep-navy/10"
                        onClick={handleSave}
                    >
                        Save Journal
                    </button>
                </footer>
            </div>
        </div>
    )
}
