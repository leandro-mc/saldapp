import { useState } from 'react'
import Card from '../shared/Card'
import ConfirmDialog from '../shared/ConfirmDialog'
import ErrorMessage from '../shared/ErrorMessage'
import LoadingState from '../shared/LoadingState'
import { formatMoney } from '../../utils/moneyUtils'
import IntegrantList from './IntegrantList'
import IntegrantModal from './IntegrantModal'

/**
 * Balances of the group's integrants, with edit and delete.
 *
 * @param {Object} props
 * @param {Object} props.integrantApi  Result of useIntegrant
 * @param {(message?: string) => void} props.onMutation  Called after a change, so the page re-reads what depends on it
 */
function IntegrantsSection({
    balances, loading, error, groupCurrency, isClosed, selectedId, integrantApi, onSelect, onMutation,
}) {
    const [editing, setEditing] = useState(null)    // balance row being edited
    const [deleting, setDeleting] = useState(null)  // balance row being deleted
    const [deleteAttempted, setDeleteAttempted] = useState(false)  // so an old failure of another action isn't shown here

    async function handleUpdate(data) {
        const updated = await integrantApi.updateIntegrant(editing.integrantId, data)
        if (updated) onMutation('Integrante actualizado.')
        return updated
    }

    function closeDelete() {
        setDeleting(null)
        setDeleteAttempted(false)
    }

    async function handleDelete() {
        setDeleteAttempted(true)
        const removed = await integrantApi.removeIntegrant(deleting.integrantId)
        if (!removed) return
        closeDelete()
        onMutation(`${deleting.integrantName} se eliminó del grupo.`)
    }

    // Anyone who paid something has expenses, and the backend refuses to delete them: say so up front
    const hasExpenses = deleting && deleting.totalPaid > 0

    return (
        <Card title="Integrantes y balances">
            {loading ? <LoadingState /> : error ? <ErrorMessage error={error} /> : (
                <IntegrantList
                    groupCurrency={groupCurrency}
                    integrantsBalances={balances}
                    selectedId={selectedId}
                    disabled={isClosed}
                    onSelect={onSelect}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                />
            )}

            <IntegrantModal
                isOpen={editing !== null}
                integrant={editing && { name: editing.integrantName }}
                loading={integrantApi.loading}
                error={integrantApi.actionError}
                onSubmit={handleUpdate}
                onClose={() => setEditing(null)}
            />

            <ConfirmDialog
                isOpen={deleting !== null}
                title="Eliminar integrante"
                message={hasExpenses
                    ? `${deleting.integrantName} pagó ${formatMoney(deleting.totalPaid, groupCurrency)} en gastos, así que no se puede eliminar. Primero eliminá o reasigná esos gastos.`
                    : `¿Seguro que querés eliminar a ${deleting?.integrantName}?`}
                confirmLabel="Eliminar"
                error={deleteAttempted ? integrantApi.actionError : null}
                onConfirm={hasExpenses ? undefined : handleDelete}
                onCancel={closeDelete}
            />
        </Card>
    )
}

export default IntegrantsSection
