import { formatMoney } from '../../utils/moneyUtils'

function Stat({ label, hint, className = '', children }) {
    return (
        <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
            <dt className="text-sm text-gray-600">{label}</dt>
            <dd className="mt-1">
                <span className="block text-2xl font-bold text-gray-900">{children}</span>
                {hint && <span className="mt-1 block text-xs text-gray-600">{hint}</span>}
            </dd>
        </div>
    )
}

/** The three numbers that summarize the group. */
function GroupStats({ group }) {
    const perPerson = group.integrantCount > 0 ? group.totalExpenses / group.integrantCount : 0

    return (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Total de gastos" className="col-span-2 sm:col-span-1">
                <span className="text-blue-700">{formatMoney(group.totalExpenses, group.currency)}</span>
            </Stat>
            <Stat label="Cuota por persona" hint="Total dividido entre los integrantes">
                {formatMoney(perPerson, group.currency)}
            </Stat>
            <Stat label="Integrantes">{group.integrantCount}</Stat>
        </dl>
    )
}

export default GroupStats
