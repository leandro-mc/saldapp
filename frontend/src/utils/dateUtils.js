export function formatDate(isoString) {
    if (!isoString) return null
    return new Date(isoString).toLocaleDateString('es-CR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

export function formatDateTime(isoString) {
    if (!isoString) return null
    return new Date(isoString).toLocaleString('es-CR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}


/** Today as the value of an <input type="date"> (yyyy-MM-dd, local time). */
export function todayInputValue() {
    const now = new Date()
    const pad = value => String(value).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
