import { useEffect } from 'react'

/** Sets the browser tab / history title while the page is shown, then puts the previous one back. */
export function useDocumentTitle(title) {
    useEffect(() => {
        const previous = document.title
        if (title) document.title = `${title} · SaldApp`
        return () => { document.title = previous }
    }, [title])
}
