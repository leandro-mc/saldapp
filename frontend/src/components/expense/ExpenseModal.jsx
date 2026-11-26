import { useState } from 'react'
import Modal from '../shared/Modal'
import ExpenseForm from './ExpenseForm'

/**
 * Window to add an expense, or to edit one (`expense`).
 * Adding keeps the window open and confirms each expense, so a few can be entered in a row
 * ("Listo" closes it); editing closes it as soon as it is saved.
 *
 * @param {Object} props
 * @param {Object | null} [props.expense]      The one being edited; null to add
 * @param {number} [props.defaultPayerId]      Who is preselected when adding
 * @param {(data: Object) => Promise<{ description: string } | undefined>} props.onSubmit  Resolves to the saved expense
 */
function ExpenseModal({ isOpen, expense = null, defaultPayerId, integrants, groupCurrency, onClose, onSubmit, loading, error }) {
    const [lastAdded, setLastAdded] = useState(null)
    const [attempted, setAttempted] = useState(false)   // hides an old failure when the window is opened again
    const isEditing = expense !== null

    function close() {
        setLastAdded(null)
        setAttempted(false)
        onClose()
    }

    async function handleSubmit(data) {
        setAttempted(true)
        const saved = await onSubmit(data)
        if (!saved) return false

        setAttempted(false)
        if (isEditing) close()
        else setLastAdded(saved.description)
        return true
    }

    return (
        <Modal isOpen={isOpen} title={isEditing ? 'Editar gasto' : 'Agregar gasto'} onClose={close}>
            {/* Always present so the confirmation is announced when its text appears */}
            <div role="status">
                {lastAdded && (
                    <p className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-900">
                        «{lastAdded}» se agregó. Podés cargar otro.
                    </p>
                )}
            </div>
            <ExpenseForm
                isEditing={isEditing}
                initialData={expense ?? { payedBy: defaultPayerId }}
                integrants={integrants}
                groupCurrency={groupCurrency}
                onSubmit={handleSubmit}
                onCancel={close}
                cancelLabel={isEditing ? 'Cancelar' : 'Listo'}
                loading={loading}
                error={attempted ? error : null}
            />
        </Modal>
    )
}

export default ExpenseModal
