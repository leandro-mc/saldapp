import { useId } from 'react'

/**
 * Label + control + hint + error, wired together for assistive technology: the label is bound to
 * the control, and the hint and the error are announced with it.
 *
 * `children` is a function that receives the props the control must spread:
 *   <FormField label="Nombre">{props => <input {...props} />}</FormField>
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.hint]       Help shown under the label, always visible (unlike a placeholder)
 * @param {string} [props.error]
 * @param {boolean} [props.optional]  Marks the field as optional; required is the default
 */
function FormField({ label, hint, error, optional = false, children }) {
    const id = useId()
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-800">
                {label}
                {optional && <span className="ml-1 font-normal text-gray-600">(opcional)</span>}
            </label>
            {hint && <p id={hintId} className="text-xs text-gray-600">{hint}</p>}
            <div className="mt-1">
                {children({
                    id,
                    'aria-describedby': describedBy || undefined,
                    'aria-invalid': error ? true : undefined,
                })}
            </div>
            {error && <p id={errorId} className="mt-1 text-sm font-medium text-red-700">{error}</p>}
        </div>
    )
}

export default FormField
