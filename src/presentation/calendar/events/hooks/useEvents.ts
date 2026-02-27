import { useEffect } from 'react'
import { useEventStore } from '../stores/eventStore'

export function useEvents() {
    const { events, loading, loadEvents } = useEventStore()

    useEffect(() => {
        loadEvents()
    }, [loadEvents])

    return { events, loading }
}
