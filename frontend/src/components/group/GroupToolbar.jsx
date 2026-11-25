import { useState } from 'react'
import Button from '../shared/Button'
import ExpenseModal from '../expense/ExpenseModal'
import IntegrantModal from '../integrant/IntegrantModal'

/**
 * The two things done most in an open group: add an expense, add a person.
 * Expenses need someone to have paid them, so that button waits for the first integrant.
 */
function GroupToolbar({ integrants, groupCurrency, selectedIntegrantId, expenseApi, integrantApi, onAddExpense, onAddIntegrant }) {
    const [dialog, setDialog] = useState(null)   // 'expense' | 'integrant' | null
    const hasIntegrants = integrants.length > 0

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="primary" disabled={!hasIntegrants} onClick={() => setDialog('expense')}>Agregar gasto</Button>
            <Button variant={hasIntegrants ? 'secondary' : 'primary'} onClick={() => setDialog('integrant')}>Agregar integrante</Button>
            {!hasIntegrants && <p className="text-sm text-gray-700">Primero agregá al menos un integrante para poder cargar gastos.</p>}

            <ExpenseModal
                isOpen={dialog === 'expense'}
                defaultPayerId={selectedIntegrantId}
                integrants={integrants}
                groupCurrency={groupCurrency}
                loading={expenseApi.saving}
                error={expenseApi.error}
                onSubmit={onAddExpense}
                onClose={() => setDialog(null)}
            />
            <IntegrantModal
                isOpen={dialog === 'integrant'}
                loading={integrantApi.loading}
                error={integrantApi.actionError}
                onSubmit={onAddIntegrant}
                onClose={() => setDialog(null)}
            />
        </div>
    )
}

export default GroupToolbar
