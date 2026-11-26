import { formatMoney } from "../../utils/moneyUtils"
import { formatDate } from "../../utils/dateUtils"
import Button from "../shared/Button"

/**
 * Expenses of one integrant, one row each.
 *
 * @param {Object} props
 * @param {boolean} props.disabled  Closed group: nothing can be changed
 */
function ExpenseList({ groupCurrency, expenses, integrant, onEdit, onDelete, disabled }){
    if (expenses.length === 0) return (
        <p className="py-6 text-center text-sm text-gray-700">{integrant.name} no tiene gastos registrados.</p>
    )

    const total = expenses.reduce((acc, e) => acc + e.amount, 0)

    return (
        <>
            <ul className="divide-y divide-gray-100">
                {expenses.map(expense => (
                    <li key={expense.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-2 py-3 md:px-3">
                        <div className="min-w-0 flex-1 basis-40">
                            <p className="break-words font-semibold text-gray-900">{expense.description}</p>
                            <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                        </div>
                        <p className="font-bold text-gray-900">{formatMoney(expense.amount, groupCurrency)}</p>
                        {!disabled && (
                            <div className="flex w-full gap-2 md:w-auto">
                                <Button size="sm" variant="quiet" aria-label={`Editar gasto ${expense.description}`} onClick={() => onEdit(expense)}>
                                    Editar
                                </Button>
                                <Button size="sm" variant="danger" aria-label={`Eliminar gasto ${expense.description}`} onClick={() => onDelete(expense)}>
                                    Eliminar
                                </Button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                <span className="font-semibold text-gray-800">Total de {integrant.name}</span>
                <span className="font-bold text-blue-700">{formatMoney(total, groupCurrency)}</span>
            </div>
        </>
    )
}

export default ExpenseList
