import { useEffect } from 'react'
import { useDiaryStore } from '../stores/diaryStore'

export function useDiaries() {
    const { diaries, loading, loadDiaries } = useDiaryStore()

    useEffect(() => {
        loadDiaries()
    }, [loadDiaries])

    return { diaries, loading }
}
