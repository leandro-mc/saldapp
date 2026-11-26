import { useEffect, useRef, useState } from 'react'

/**
 * Field-level errors for a form: the ones the form finds itself before sending (instant, in
 * Spanish) and the ones the API returns in `error.errors`, keyed by field name.
 *
 * On a failed attempt the keyboard goes to the first invalid field, so the problem is not missed.
 *
 * @param {import('../utils/ApiError').ApiError | null} serverError
 */
export function useFormValidation(serverError) {
    const formRef = useRef(null)
    const [clientErrors, setClientErrors] = useState({})
    const [attempt, setAttempt] = useState(0)

    const errorOf = field => clientErrors[field] ?? serverError?.errors?.[field]

    // Keyed on the attempt, not on the errors: fixing one field must not pull focus away from it
    useEffect(() => {
        formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
    }, [attempt, serverError])

    /**
     * @param {Record<string, string>} problems  Message per invalid field
     * @returns {boolean} true when the form can be sent
     */
    function check(problems) {
        setClientErrors(problems)
        setAttempt(count => count + 1)
        return Object.keys(problems).length === 0
    }

    /** Called when the user edits a field: its error no longer applies. */
    function clear(field) {
        setClientErrors(current => {
            if (!(field in current)) return current
            const { [field]: removed, ...rest } = current  // eslint-disable-line no-unused-vars
            return rest
        })
    }

    return { formRef, errorOf, check, clear }
}
