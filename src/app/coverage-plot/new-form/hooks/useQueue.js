import { useState, useCallback, useEffect } from 'react'

export function useQueue() {
    const [queuePosition, setQueuePosition] = useState(null)
    const [queueStatus, setQueueStatus] = useState('idle') // idle, joining, waiting, processing, error
    const [userId, setUserId] = useState(null)

    // Generate a semi-persistent user ID if not logged in
    useEffect(() => {
        let id = localStorage.getItem('automation_user_id')
        if (!id) {
            id = 'user_' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('automation_user_id', id)
        }
        setUserId(id)
    }, [])

    const joinQueue = useCallback(async (userName = 'Guest', processType = 'Coverage Plot') => {
        if (!userId) return

        try {
            setQueueStatus('joining')
            const res = await fetch('/api/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userName, processType })
            })

            if (!res.ok) throw new Error('Failed to join queue')

            const data = await res.json()
            setQueuePosition(data.position)
            setQueueStatus('waiting')

            return data.position
        } catch (error) {
            console.error('Queue join error:', error)
            setQueueStatus('error')
            throw error
        }
    }, [userId])

    const leaveQueue = useCallback(async () => {
        if (!userId) return

        try {
            await fetch(`/api/queue?userId=${userId}`, { method: 'DELETE' })
            setQueuePosition(null)
            setQueueStatus('idle')
        } catch (error) {
            console.error('Queue leave error:', error)
        }
    }, [userId])

    const checkStatus = useCallback(async () => {
        if (!userId) return

        try {
            // Re-join/check status logic creates a similar effect to polling status
            // But effectively we just want to know our position
            const res = await fetch('/api/queue', {
                method: 'POST', // Using POST as "upsert/check"
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userName: 'Guest', processType: 'Coverage Plot' }) // Name update ignored if exists
            })

            if (res.ok) {
                const data = await res.json()
                setQueuePosition(data.position)
                return data.position
            }
        } catch (error) {
            console.error('Queue check error:', error)
        }
        return -1
    }, [userId])

    return {
        queuePosition,
        queueStatus,
        joinQueue,
        leaveQueue,
        checkStatus,
        userId
    }
}
