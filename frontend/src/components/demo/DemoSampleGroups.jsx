import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSampleGroups } from '../../demo/sampleGroups.js'
import { formatMoney } from '../../utils/moneyUtils'
import StatusBadge from '../group/StatusBadge'
import Card from '../shared/Card'

/** Home page section: direct access to the seeded groups (the app has no way to list groups). */
function DemoSampleGroups() {
    const [groups] = useState(getSampleGroups)

    return (
        <Card title="Probá un grupo de ejemplo">
            <p className="-mt-2 mb-4 text-sm text-gray-700">
                Datos ficticios para explorar la app sin crear nada: abrí uno, agregá gastos y mirá cómo cambian los balances.
            </p>

            <ul className="grid gap-4 md:grid-cols-3">
                {groups.map(group => (
                    <li key={group.id}>
                        <Link
                            to={`/groups/${group.id}`}
                            className="flex h-full flex-col gap-2 rounded-lg border border-gray-300 p-4 transition-colors
                                       hover:border-blue-600 hover:bg-blue-50"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-bold text-gray-900">{group.name}</h3>
                                <StatusBadge isClosed={group.endDate !== null} />
                            </div>
                            <p className="flex-1 text-sm text-gray-700">{group.description}</p>
                            <p className="text-sm text-gray-800">
                                {group.integrantCount} integrantes · Total {formatMoney(group.totalExpenses, group.currency)}
                            </p>
                            <span className="text-sm font-medium text-blue-700">Abrir grupo →</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

export default DemoSampleGroups
