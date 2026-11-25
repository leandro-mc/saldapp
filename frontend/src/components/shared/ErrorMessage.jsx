/**
 * Error from the API.
 *
 * With `inline` (inside a form that already shows each field's error next to the field), only a
 * summary is shown: the backend's own "Validation failed..." text is in English and says nothing new.
 */
function ErrorMessage({ error, inline = false }){
    if(!error) return null

    const fieldErrors = Object.entries(error.errors ?? {})
    const hasFieldErrors = fieldErrors.length > 0

    return (
        <div role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">
                {inline && hasFieldErrors ? 'Revisá los campos marcados.' : error.message}
            </p>
            {!inline && fieldErrors.map(([field, msg]) => (
                <p key={field} className="mt-1 text-xs text-red-700">
                    <strong className="capitalize">{field}:</strong> {msg}
                </p>
            ))}
        </div>
    )
}

export default ErrorMessage
