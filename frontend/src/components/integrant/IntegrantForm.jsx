import { useState } from 'react'
import { useFormValidation } from '../../hooks/useFormValidation'
import Button from '../shared/Button'
import ErrorMessage from '../shared/ErrorMessage'
import FormField from '../shared/FormField'
import { controlClassName } from '../shared/controlStyles'

/**
 * Adds an integrant, or edits one when `initialData` has a name.
 * `onSubmit` must resolve to something truthy when it saved; after adding, the field is emptied and
 * focused again so several people can be entered in a row.
 *
 * @param {Object} props
 * @param {string} [props.cancelLabel]  Label of the secondary button, shown only with `onCancel`
 */
function IntegrantForm({ initialData = {}, onSubmit, onCancel, cancelLabel = 'Cancelar', loading, error }) {
    const [name, setName] = useState(initialData.name || '')
    const { formRef, errorOf, check, clear } = useFormValidation(error)
    const isEditing = !!initialData.name

    async function handleSubmit(e) {
        e.preventDefault()
        if (!check(name.trim() ? {} : { name: 'Ingresá el nombre del integrante.' })) return

        const saved = await onSubmit({ name })
        if (saved && !isEditing) {
            setName('')
            formRef.current.querySelector('input').focus()
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Nombre" error={errorOf('name')}>
                {props => (
                    <input
                        {...props}
                        value={name}
                        onChange={e => { setName(e.target.value); clear('name') }}
                        autoComplete="off"
                        className={controlClassName}
                    />
                )}
            </FormField>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {onCancel && <Button onClick={onCancel}>{cancelLabel}</Button>}
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar'}
                </Button>
            </div>

            <ErrorMessage error={error} inline />
        </form>
    )
}

export default IntegrantForm
