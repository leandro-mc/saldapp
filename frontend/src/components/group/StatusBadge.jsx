/** Open groups accept changes; closed ones are read-only (neutral, not an error). */
function StatusBadge({ isClosed }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                        ${isClosed ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
            {isClosed ? 'Cerrado' : 'Abierto'}
        </span>
    )
}

export default StatusBadge
