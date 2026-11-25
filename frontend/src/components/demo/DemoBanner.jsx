import { useState } from 'react'
import { resetDemoData } from '../../demo/data/store.js'
import ConfirmDialog from '../shared/ConfirmDialog'

const REPOSITORY_URL = 'https://github.com/leandro-mc/saldapp'

/** Notice shown on every page of the demo, with the way back to the original data. */
function DemoBanner() {
    const [isConfirming, setIsConfirming] = useState(false)

    function handleReset() {
        resetDemoData()
        // A full load from the home page: hooks keep data in memory and the group on screen may no longer exist
        window.location.assign('/')
    }

    return (
        <div role="status" className="sticky top-0 z-40 bg-amber-100 border-b border-amber-300 text-amber-950">
            <div className="max-w-7xl mx-auto px-4 py-2 md:px-8 flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-4">
                <p className="flex-1">
                    <strong>Modo demo:</strong> estás viendo datos ficticios porque este despliegue no tiene un
                    backend conectado (proyecto de portafolio, sin costos de hosting). Tus cambios se guardan
                    solo en tu navegador.{' '}
                    <a
                        href={REPOSITORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline hover:text-amber-800"
                    >
                        Ver el código en GitHub
                    </a>
                </p>
                <button
                    type="button"
                    onClick={() => setIsConfirming(true)}
                    className="self-start md:self-auto whitespace-nowrap px-3 py-1 rounded-md border border-amber-800
                                bg-white text-amber-950 font-medium hover:bg-amber-50 transition-colors"
                >
                    Restablecer datos de demo
                </button>
            </div>

            <ConfirmDialog
                isOpen={isConfirming}
                title="Restablecer datos de demo"
                message="Se perderán tus cambios y volverás a los grupos de ejemplo."
                confirmLabel="Restablecer"
                onConfirm={handleReset}
                onCancel={() => setIsConfirming(false)}
            />
        </div>
    )
}

export default DemoBanner
