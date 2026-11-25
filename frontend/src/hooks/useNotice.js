import { useEffect, useState } from 'react'

const VISIBLE_MS = 6000

/** A short confirmation message that clears itself. Returns [message, show]. */
export function useNotice() {
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!message) return
        const timer = setTimeout(() => setMessage(''), VISIBLE_MS)
        return () => clearTimeout(timer)
    }, [message])

    return [message, setMessage]
}
