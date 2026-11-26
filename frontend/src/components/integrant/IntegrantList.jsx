import { formatMoney, formatSignedMoney } from "../../utils/moneyUtils"
import BalanceAmount from "../shared/BalanceAmount"
import Button from "../shared/Button"

/**
 * One row per integrant: who they are, what they paid, what they are owed or owe, and what can be done.
 * Rows (not a table) so they reflow on a phone without hiding the actions off-screen.
 *
 * @param {Object} props
 * @param {number | undefined} props.selectedId  Integrant whose expenses are being shown
 * @param {boolean} props.disabled               Closed group: nothing can be changed
 */
function IntegrantList({ groupCurrency, integrantsBalances, selectedId, onSelect, onEdit, onDelete, disabled }){
    if (integrantsBalances.length === 0) return (
        <div className="py-8 text-center">
            <p className="text-sm font-medium text-gray-700">Todavía no hay integrantes en este grupo.</p>
            {!disabled && <p className="mt-1 text-sm text-gray-600">Agregá a quienes comparten los gastos con «Agregar integrante».</p>}
        </div>
    )

    const totalPaid = integrantsBalances.reduce((acc, b) => acc + b.totalPaid, 0)
    const balanceSum = integrantsBalances.reduce((acc, b) => acc + b.balance, 0)
    const leftoverCents = Math.round(balanceSum * 100)

    return (
        <>
            <ul className="divide-y divide-gray-100">
                {integrantsBalances.map(balance => {
                    const isSelected = balance.integrantId === selectedId
                    const name = balance.integrantName
                    return (
                        <li key={balance.integrantId} className={`px-2 py-3 md:px-3 ${isSelected ? 'rounded-md bg-blue-50 ring-1 ring-blue-200' : ''}`}>
                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                                <div className="min-w-0 flex-1 basis-40">
                                    <p className="break-words font-semibold text-gray-900">{name}</p>
                                    <p className="text-sm text-gray-600">Pagó {formatMoney(balance.totalPaid, groupCurrency)}</p>
                                </div>

                                <BalanceAmount amount={balance.balance} currency={groupCurrency} />

                                <div className="flex w-full flex-wrap gap-2 md:w-auto">
                                    <Button
                                        size="sm"
                                        aria-pressed={isSelected}
                                        aria-label={`Ver gastos de ${name}`}
                                        onClick={() => onSelect(isSelected ? null : balance.integrantId)}
                                        className={isSelected ? 'border-blue-600 bg-blue-100 text-blue-900' : ''}
                                    >
                                        Ver gastos
                                    </Button>
                                    {!disabled && (
                                        <>
                                            <Button size="sm" variant="quiet" aria-label={`Editar a ${name}`} onClick={() => onEdit(balance)}>
                                                Editar
                                            </Button>
                                            <Button size="sm" variant="danger" aria-label={`Eliminar a ${name}`} onClick={() => onDelete(balance)}>
                                                Eliminar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                <span className="font-semibold text-gray-800">Total pagado</span>
                <span className="font-bold text-blue-700">{formatMoney(totalPaid, groupCurrency)}</span>
            </div>
            {leftoverCents !== 0 && (
                <p className="mt-2 text-xs text-gray-600">
                    Los balances suman {formatSignedMoney(balanceSum, groupCurrency)}: al repartir en partes iguales,
                    los centavos que sobran no se asignan a nadie.
                </p>
            )}
        </>
    )
}

export default IntegrantList
