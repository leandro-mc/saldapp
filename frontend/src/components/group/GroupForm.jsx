import { useState } from 'react'
import { todayInputValue } from '../../utils/dateUtils'
import { useFormValidation } from '../../hooks/useFormValidation'
import Button from '../shared/Button'
import ErrorMessage from '../shared/ErrorMessage'
import FormField from '../shared/FormField'
import SelectList from '../shared/SelectList'
import { controlClassName } from '../shared/controlStyles'

const CURRENCIES = ['₡', '$', '€', '£', '¥', 'CHF ', 'R$', 'S/', '$U ', '₲', 'Bs.', 'RD$', 'Q ', 'L ', 'C$', 'B/.']

/**
 * Creates a group, or edits one (`isEditing`: the start date can't change, so it isn't asked again).
 * The title is up to whoever contains the form.
 */
function GroupForm({ isEditing = false, initialData = {}, onSubmit, onCancel, loading, error }) {
    const [name, setName] = useState(initialData.name || '')
    const [description, setDescription] = useState(initialData.description || '')
    const [startDate, setStartDate] = useState(todayInputValue())
    const [currency, setCurrency] = useState(initialData.currency || '')
    const { formRef, errorOf, check, clear } = useFormValidation(error)

    function handleSubmit(e) {
        e.preventDefault()

        const problems = {}
        if (!name.trim()) problems.name = 'Ingresá un nombre para el grupo.'
        if (!currency) problems.currency = 'Elegí la moneda del grupo.'
        if (!isEditing && !startDate) problems.startDate = 'Elegí la fecha de inicio.'
        if (!check(problems)) return

        onSubmit({
            name,
            description,
            currency,
            ...(isEditing ? {} : { startDate: startDate + 'T00:00:00' }),
        })
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Nombre del grupo" error={errorOf('name')}>
                {props => (
                    <input
                        {...props}
                        value={name}
                        onChange={e => { setName(e.target.value); clear('name') }}
                        placeholder="Ej: Viaje a la playa"
                        autoComplete="off"
                        className={controlClassName}
                    />
                )}
            </FormField>

            <FormField label="Moneda" error={errorOf('currency')}>
                {props => (
                    <SelectList
                        {...props}
                        options={CURRENCIES}
                        getLabel={c => c}
                        getValue={c => c}
                        value={currency}
                        onChange={value => { setCurrency(value); clear('currency') }}
                        placeholder="Seleccionar moneda"
                    />
                )}
            </FormField>

            {!isEditing && (
                <FormField label="Fecha de inicio" error={errorOf('startDate')}>
                    {props => (
                        <input
                            {...props}
                            type="date"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); clear('startDate') }}
                            className={controlClassName}
                        />
                    )}
                </FormField>
            )}

            <FormField label="Descripción" optional error={errorOf('description')}>
                {props => (
                    <textarea
                        {...props}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={2}
                        className={`${controlClassName} resize-none`}
                    />
                )}
            </FormField>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {onCancel && <Button onClick={onCancel}>Cancelar</Button>}
                <Button type="submit" variant="primary" disabled={loading} className={onCancel ? '' : 'w-full'}>
                    {loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear grupo'}
                </Button>
            </div>

            <ErrorMessage error={error} inline />
        </form>
    )
}

export default GroupForm
