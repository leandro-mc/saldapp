import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSampleGroups } from '../../demo/sampleGroups.js'
import { formatMoney } from '../../utils/moneyUtils'

/** Home page section: direct access to the seeded groups (the app has no way to list groups). */
function DemoSampleGroups() {
    const [groups] = useState(getSampleGroups)

    return (
        <section aria-labelledby="sample-groups-title" className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 id="sample-groups-title" className="text-2xl font-bold text-blue-600 mb-2 border-b pb-3">
                Grupos de ejemplo
            </h2>
            <p className="text-sm text-gray-500 mb-4">
                Datos ficticios para explorar la app sin crear nada: abrí uno, agregá gastos y mirá cómo cambian los balances.
            </p>

            <ul className="grid gap-4 md:grid-cols-3">
                {groups.map(group => {
                    const isClosed = group.endDate !== null
                    return (
                        <li key={group.id}>
                            <Link
                                to={`/groups/${group.id}`}
                                className="block h-full rounded-lg border border-gray-200 p-4 hover:border-blue-500
                                            hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {isClosed ? 'Cerrado' : 'Abierto'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                <p className="text-sm text-gray-700 mt-3">
                                    {group.integrantCount} integrantes · Total {formatMoney(group.totalExpenses, group.currency)}
                                </p>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export default DemoSampleGroups
