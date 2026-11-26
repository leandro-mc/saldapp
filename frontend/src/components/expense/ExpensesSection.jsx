import { useEffect, useState } from "react"
import Button from "../shared/Button"
import Card from "../shared/Card"
import ConfirmDialog from "../shared/ConfirmDialog"
import ErrorMessage from "../shared/ErrorMessage"
import LoadingState from "../shared/LoadingState"
import { formatMoney } from "../../utils/moneyUtils"
import ExpenseList from "./ExpenseList"
import ExpenseModal from "./ExpenseModal"

/**
 * Expenses of the integrant picked in the balances list, with edit and delete.
 * Until someone is picked it explains how to see them, so the page doesn't change shape when one is.
 *
 * @param {Object} props
 * @param {Object} props.expenseApi  Result of useExpense
 * @param {{ id: number, name: string } | undefined} props.selectedIntegrant
 * @param {(message?: string) => void} props.onMutation  Called after a change, so the page re-reads what depends on it
 */
function ExpensesSection({ groupCurrency, isClosed, integrants, selectedIntegrant, expenseApi, onClear, onMutation }){
    const { integrantExpenses, loading, saving, error, loadError, loadByIntegrant, updateExpense, removeExpense } = expenseApi
    const [editing, setEditing] = useState(null)    // expense being edited
    const [deleting, setDeleting] = useState(null)  // expense being deleted
    const [deleteAttempted, setDeleteAttempted] = useState(false)  // so an old failure of another action isn't shown here

    const selectedId = selectedIntegrant?.id
    useEffect(() => {
        if (selectedId) loadByIntegrant(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId])

    function closeDelete() {
        setDeleting(null)
        setDeleteAttempted(false)
    }

    async function handleUpdate(data) {
        const updated = await updateExpense(editing.id, data)
        if (updated) onMutation('Gasto actualizado.')
        return updated
    }

    async function handleDelete() {
        setDeleteAttempted(true)
        if (!await removeExpense(deleting.id)) return
        closeDelete()
        onMutation('Gasto eliminado.')
    }

    if (!selectedIntegrant) return (
        <Card title="Gastos">
            <p className="text-sm text-gray-700">
                Elegí «Ver gastos» en un integrante para revisar{isClosed ? '' : ', editar o eliminar'} lo que pagó.
            </p>
        </Card>
    )

    return (
        <Card
            title={`Gastos de ${selectedIntegrant.name}`}
            actions={<Button size="sm" variant="quiet" onClick={onClear}>Ocultar</Button>}
        >
            {loading ? <LoadingState /> : loadError ? <ErrorMessage error={loadError} /> : (
                <ExpenseList
                    disabled={isClosed}
                    groupCurrency={groupCurrency}
                    expenses={integrantExpenses}
                    integrant={selectedIntegrant}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                />
            )}

            <ExpenseModal
                isOpen={editing !== null}
                expense={editing}
                integrants={integrants}
                groupCurrency={groupCurrency}
                loading={saving}
                error={error}
                onSubmit={handleUpdate}
                onClose={() => setEditing(null)}
            />

            <ConfirmDialog
                isOpen={deleting !== null}
                title="Eliminar gasto"
                message={`¿Seguro que querés eliminar «${deleting?.description}» (${formatMoney(deleting?.amount, groupCurrency)})?`}
                confirmLabel="Eliminar"
                error={deleteAttempted ? error : null}
                onConfirm={handleDelete}
                onCancel={closeDelete}
            />
        </Card>
    )
}

export default ExpensesSection
