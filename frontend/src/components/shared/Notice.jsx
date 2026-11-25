/**
 * Confirmation of something that just happened ("Gasto eliminado."). The live region is always in the
 * page, so screen readers announce the text when it appears; with no message it takes no space.
 */
function Notice({ message }) {
    return (
        <div
            role="status"
            className={message ? 'rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-900' : 'sr-only'}
        >
            {message}
        </div>
    )
}

export default Notice
