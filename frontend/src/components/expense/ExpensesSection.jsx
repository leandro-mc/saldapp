import { useEffect, useState } from "react"
import { useExpense } from "../../hooks/useExpense"
import LoadingState from "../shared/LoadingState"
import ExpenseForm from "./ExpenseForm"
import ExpenseList from "./ExpenseList"
import Card from "../shared/Card"

function ExpensesSection({groupId, isClosed, groupCurrency, integrants, selectedIntegrant, onMutation}){
    const { integrantExpenses, loading, error, loadByIntegrant, addExpense, updateExpense, removeExpense } = useExpense(groupId)
    const [ editingExpense, setEditingExpense ] = useState(null)

    useEffect(() => {
        if (selectedIntegrant) loadByIntegrant(selectedIntegrant.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIntegrant])   

    async function handleMutation() {
        onMutation?.()
    } 

    if (loading) return (
        <div className="flex-1 w-full bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <LoadingState />
        </div>
        )

    if (editingExpense && !isClosed) return (
        <Card title="Editar gasto" className="flex-1 w-full">
            <ExpenseForm 
                key={editingExpense.id}
                isEditing
                initialData={editingExpense}
                integrants={integrants}
                groupCurrency={groupCurrency}
                loading={loading}
                error={error}
                onCancel={() => setEditingExpense(null)}
                onSubmit={async (data) => {
                    const updated = await updateExpense(editingExpense.id, data)
                    if (updated) {
                        setEditingExpense(null)
                        handleMutation()
                    }
                    return updated
                }}
            />
        </Card>
    )

    if (!selectedIntegrant && isClosed) return null

    return (
        <>        
        {selectedIntegrant && (
        <div className="flex-1 w-full space-y-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <ExpenseList 
                    disabled={isClosed}
                    groupCurrency={groupCurrency}
                    expenses={integrantExpenses}
                    integrant={selectedIntegrant}
                    onEdit={(expenseId) => {
                        const expense = integrantExpenses.find(e => e.id === expenseId)
                        setEditingExpense(expense)
                    }}
                    onDelete={async (expenseId) => {
                        await removeExpense(expenseId)
                        handleMutation()
                    }}
                />
            </div>
        </div>
        )}
        

        
        {!isClosed && ( 
            <div className="flex-1 w-full space-y-4">
                <Card title="Agregar gasto">
                    <ExpenseForm 
                        integrants={integrants}
                        groupCurrency={groupCurrency}
                        loading={loading}
                        error={error}
                        onSubmit={async (data) => {
                            const created = await addExpense(data)
                            if (created) handleMutation()
                            return created
                        }}
                    />
                </Card>
            </div>
        )}        
        
        </>
    )
}

export default ExpensesSection