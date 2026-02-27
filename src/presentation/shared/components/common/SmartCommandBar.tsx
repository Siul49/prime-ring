import { useState, useEffect, useRef } from 'react'
import * as chrono from 'chrono-node'
import { useEventStore } from '../../../calendar/events/stores/eventStore'
import { useCategoryStore } from '../../../settings/stores/categoryStore'
import { useModalStore } from '../../../calendar/events/stores/modalStore'
import toast from 'react-hot-toast'
import './SmartCommandBar.css'

export function SmartCommandBar() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [preview, setPreview] = useState<{ date: Date; title: string; categoryId?: string } | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { addEvent } = useEventStore()
    const { categories } = useCategoryStore()
    const { openModal } = useModalStore() // Fallback to manual if needed

    // Toggle with shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Parse input in real-time
    useEffect(() => {
        if (!input.trim()) {
            setPreview(null)
            return
        }

        // 1. Chrono: Date Parsing (Korean supported via ko property, but standard chrono works well for basic formats)
        // Note: 'chrono-node' basic import supports English/Japanese. For Korean "내일 3시", we might need standard logic or strict format.
        // Actually chrono supports many languages. Let's try parsing.
        const parsed = chrono.ko ? chrono.ko.parse(input) : chrono.parse(input) // Check if 'ko' locale is available or use standard

        // Use custom heuristic if chrono 'ko' isn't explicitly exported in this version, 
        // or just use standard parsing which often catches "Tomorrow at 3pm".
        // For distinct Korean support we might need 'chrono-node/ko' if available, otherwise we rely on numeric dates or simple English patterns.
        // *Correction*: chrono-node has 'ko' locale support built-in.

        const results = chrono.parse(input, new Date(), { forwardDate: true })
        // If chrono.ko is not automatically picking up Korean, we might need a specific locale import.
        // For this MVP, we assume basic date/time or English keywords, OR we implement a simple regex for Korean "내일", "오후" etc if chrono fails on them.

        /* 
           Simulating Korean Parsing Logic for common cases since chrono default might be English-centric:
           - "내일" (tomorrow), "오늘" (today)
           - "오후 3시" (3 PM), "15시" (15:00)
        */

        let targetDate = new Date()
        const hasTomorrow = input.includes('내일')
        const hasToday = input.includes('오늘')

        if (hasTomorrow) targetDate.setDate(targetDate.getDate() + 1)

        // Simple Time Extraction (Regex for "N시" or "N:MM")
        const timeMatch = input.match(/(\d{1,2})시(\s*(\d{1,2})분)?/) || input.match(/(\d{1,2}):(\d{2})/)
        const isPm = input.includes('오후')

        if (timeMatch) {
            let hour = parseInt(timeMatch[1])
            const minute = parseInt(timeMatch[3] || timeMatch[2] || '0')
            if (isPm && hour < 12) hour += 12
            targetDate.setHours(hour, minute, 0, 0)
        } else {
            // Default to next nearest hour if no time specified but date keywords exist
            if (hasTomorrow || hasToday) {
                targetDate.setHours(9, 0, 0, 0) // Default 9 AM
            } else {
                // If neither, verify if standard chrono found something
                if (results.length > 0) {
                    targetDate = results[0].start.date()
                } else {
                    // No date found
                    setPreview(null)
                    return
                }
            }
        }

        // 2. Category Matching
        // Auto-detect category based on keywords in category names
        let detectedCategory = categories[0]?.id
        for (const cat of categories) {
            if (input.includes(cat.name)) {
                detectedCategory = cat.id
                break
            }
        }

        // 3. Title Extraction
        // Remove date keywords from title? For now, keep full text as it's more context.
        const cleanTitle = input
            .replace('내일', '')
            .replace('오늘', '')
            .replace(/오후\s*\d+시/, '')
            .replace(/\d+시/, '')
            .trim() || '새로운 일정'

        setPreview({
            date: targetDate,
            title: cleanTitle,
            categoryId: detectedCategory
        })

    }, [input, categories])

    const handleExecute = async () => {
        if (!preview) return

        try {
            await addEvent({
                title: preview.title,
                startDate: preview.date,
                endDate: new Date(preview.date.getTime() + 60 * 60 * 1000), // Default 1 hour
                allDay: false,
                categoryId: preview.categoryId || categories[0]?.id || 'default',
                tags: [],
                priority: 'medium',
                userId: 'demo'
            })

            toast.success(
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>일정이 추가되었습니다!</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>
                        {preview.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {preview.title}
                    </span>
                </div>
            )
            setInput('')
            setIsOpen(false)
        } catch (error) {
            toast.error('일정 추가 실패')
        }
    }

    if (!isOpen) return null

    return (
        <div className="command-bar-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-bar glass" onClick={e => e.stopPropagation()}>
                <div className="command-input-wrapper">
                    <span className="command-icon">✨</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input"
                        placeholder="예: 내일 오후 2시 디자인 회의 (Enter로 추가)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleExecute()}
                    />
                    <div className="command-shortcut">Esc</div>
                </div>

                {preview && (
                    <div className="command-preview">
                        <div className="preview-row">
                            <span className="preview-label">일시</span>
                            <span className="preview-value date">
                                {preview.date.toLocaleDateString()} {preview.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="preview-row">
                            <span className="preview-label">제목</span>
                            <span className="preview-value">{preview.title}</span>
                        </div>
                        <div className="preview-row">
                            <span className="preview-label">카테고리</span>
                            <span className="preview-value badge">
                                {categories.find(c => c.id === preview.categoryId)?.name || '기본'}
                            </span>
                        </div>
                        <button className="btn btn-primary preview-action" onClick={handleExecute}>
                            일정 생성하기 ↵
                        </button>
                    </div>
                )}

                {!preview && input.trim() && (
                    <div className="command-hint">
                        '내일', '오후 3시' 같은 단어를 포함해보세요.
                    </div>
                )}
            </div>
        </div>
    )
}
