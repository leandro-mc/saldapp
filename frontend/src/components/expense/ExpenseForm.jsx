import { useState } from 'react'
import { todayInputValue } from '../../utils/dateUtils'
import { useFormValidation } from '../../hooks/useFormValidation'
import Button from '../shared/Button'
import ErrorMessage from '../shared/ErrorMessage'
import FormField from '../shared/FormField'
import SelectList from '../shared/SelectList'
import { controlClassName } from '../shared/controlStyles'

/**
 * Adds an expense, or edits one (`isEditing`: the date can't change, so it isn't asked again).
 * `onSubmit` must resolve to something truthy when it saved; after adding, description and amount
 * are emptied (payer and date stay: consecutive expenses usually share them) so several can be
 * entered in a row.
 *
 * @param {Object} props
 * @param {string} props.groupCurrency
 * @param {string} [props.cancelLabel]  Label of the secondary button, shown only with `onCancel`
 */
function ExpenseForm({
    initialData = {}, isEditing = false, integrants, groupCurrency,
    onSubmit, onCancel, cancelLabel = 'Cancelar', loading, error,
}){
    const [payedBy, setPayedBy] = useState(initialData.payedBy || '')
    const [description, setDescription] = useState(initialData.description || '')
    const [amount, setAmount] = useState(initialData.amount || '')
    const [date, setDate] = useState(todayInputValue())
    const { formRef, errorOf, check, clear } = useFormValidation(error)

    async function handleSubmit(e) {
        e.preventDefault()

        const problems = {}
        if (!payedBy) problems.payedBy = 'Elegí quién pagó.'
        // Same limit as the backend's @Size(min = 4): saying it here avoids a round trip and an English message
        if (description.trim().length < 4) problems.description = 'Describí el gasto con al menos 4 caracteres.'
        if (!(Number(amount) > 0)) problems.amount = 'Ingresá un monto mayor a 0.'
        if (!isEditing && !date) problems.date = 'Elegí la fecha del gasto.'
        if (!check(problems)) return

        const saved = await onSubmit({
            payedBy,
            description,
            amount,
            ...(isEditing ? {} : { date: date + 'T00:00:00' }),
        })
        if (saved && !isEditing) {
            setDescription('')
            setAmount('')
            formRef.current.querySelector('input').focus()
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Pagado por" error={errorOf('payedBy')}>
                {props => (
                    <SelectList
                        {...props}
                        options={integrants}
                        getLabel={integrant => integrant.name}
                        getValue={integrant => integrant.id}
                        value={payedBy}
                        onChange={value => { setPayedBy(value); clear('payedBy') }}
                        placeholder="Seleccionar integrante"
                    />
                )}
            </FormField>

            <FormField label="Descripción" error={errorOf('description')}>
                {props => (
                    <input
                        {...props}
                        value={description}
                        onChange={e => { setDescription(e.target.value); clear('description') }}
                        placeholder="Ej: Peajes de ida"
                        autoComplete="off"
                        className={controlClassName}
                    />
                )}
            </FormField>

            <FormField label="Monto" error={errorOf('amount')}>
                {props => (
                    <div className="flex">
                        <span className="flex items-center rounded-l-md border border-r-0 border-gray-400 bg-gray-50 px-3 text-gray-700">
                            {groupCurrency.trim()}
                        </span>
                        <input
                            {...props}
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={e => { setAmount(e.target.value); clear('amount') }}
                            placeholder="0.00"
                            className={`${controlClassName} rounded-l-none`}
                        />
                    </div>
                )}
            </FormField>

            {!isEditing && (
                <FormField label="Fecha del gasto" error={errorOf('date')}>
                    {props => (
                        <input
                            {...props}
                            type="date"
                            value={date}
                            onChange={e => { setDate(e.target.value); clear('date') }}
                            className={controlClassName}
                        />
                    )}
                </FormField>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {onCancel && <Button onClick={onCancel}>{cancelLabel}</Button>}
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar gasto'}
                </Button>
            </div>

            <ErrorMessage error={error} inline />
        </form>
    )
}

export default ExpenseForm
