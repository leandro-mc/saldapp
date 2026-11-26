import { formatMoney } from "../../utils/moneyUtils"

/** Who pays whom, one payment per row. */
function SettlementList({ settlements, groupCurrency }) {
    if (settlements.length === 0) return (
        <div className="py-6 text-center">
            <p className="text-sm font-medium text-green-800">No hay deudas pendientes</p>
            <p className="mt-1 text-sm text-gray-600">Todos los gastos están equilibrados.</p>
        </div>
    )

    return (
        <ul className="divide-y divide-gray-100">
            {settlements.map((transaction, index) => (
                <li key={index} className="flex items-center justify-between gap-4 py-3">
                    <p className="min-w-0 break-words">
                        <span className="font-semibold text-red-800">{transaction.fromIntegrantName}</span>
                        <span className="sr-only"> paga a </span>
                        <span aria-hidden="true" className="mx-2 text-gray-500">→</span>
                        <span className="font-semibold text-green-800">{transaction.toIntegrantName}</span>
                    </p>
                    <p className="shrink-0 font-bold text-gray-900">{formatMoney(transaction.amount, groupCurrency)}</p>
                </li>
            ))}
        </ul>
    )
}

export default SettlementList
