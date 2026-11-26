function LoadingState({ label = 'Cargando…' }) {
    return (
        <div role="status" className="flex items-center justify-center gap-3 py-12 text-gray-600">
            <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 motion-reduce:animate-none"
            />
            <p className="text-sm">{label}</p>
        </div>
    )
}

export default LoadingState
