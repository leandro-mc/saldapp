const pad = (value, length = 2) => String(value).padStart(length, '0')

/**
 * Formats a date the way the backend serializes a LocalDateTime: local time, no zone,
 * seconds always present and a fraction only when there is one ("2026-03-01T09:00:00").
 *
 * @param {Date} date
 * @returns {string}
 */
export function toLocalDateTime(date) {
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    const millis = date.getMilliseconds()
    return `${day}T${time}${millis === 0 ? '' : '.' + pad(millis, 3).replace(/0+$/, '')}`
}

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/

/**
 * Whether the backend would accept `text` for its @JsonFormat("yyyy-MM-dd'T'HH:mm:ss") fields.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isLocalDateTime(text) {
    const match = LOCAL_DATE_TIME.exec(text)
    if (!match) return false

    const [year, month, day, hour, minute, second] = match.slice(1).map(Number)
    const calendarDay = new Date(0)
    calendarDay.setUTCFullYear(year, month - 1, day)

    return calendarDay.getUTCFullYear() === year
        && calendarDay.getUTCMonth() === month - 1
        && calendarDay.getUTCDate() === day
        && hour <= 23 && minute <= 59 && second <= 59
}
