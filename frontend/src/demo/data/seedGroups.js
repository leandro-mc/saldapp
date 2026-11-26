import { toLocalDateTime } from '../domain/dates.js'

/**
 * Fictional groups the demo starts with, modeled after /seed/seed.mjs (the data the Docker stack
 * loads) so both setups look alike. Dates are relative to the moment the demo is first opened,
 * and no text mentions a month or a year, so the data reads coherently whenever that is.
 *
 * `payer` is an index into `members`. `daysAgo` counts back from the moment of seeding.
 */
const SEED_GROUPS = [
    {
        name: 'Viaje a Madrid',
        description: 'Boletos de avión, hospedaje, comidas y tours de la escapada a Madrid',
        currency: '€',
        startedDaysAgo: 75,
        members: ['Ana Torres', 'Bruno Salas', 'Carla Méndez', 'Diego Rojas', 'Elena Vargas', 'Fabián Castro', 'Gabriela Núñez'],
        expenses: [
            { payer: 0, description: 'Boletos de avión ida y vuelta', amount: 1890.0, daysAgo: 74 },
            { payer: 1, description: 'Hospedaje (apartamento 5 noches)', amount: 1150.5, daysAgo: 70 },
            { payer: 2, description: 'Cena de bienvenida en La Latina', amount: 214.8, daysAgo: 69 },
            { payer: 3, description: 'Entradas Museo del Prado', amount: 126.0, daysAgo: 68 },
            { payer: 4, description: 'Tour a Toledo en autobús', amount: 245.0, daysAgo: 67 },
            { payer: 5, description: 'Almuerzo en Toledo', amount: 167.35, daysAgo: 67 },
            { payer: 0, description: 'Taxis y transporte público', amount: 98.4, daysAgo: 66 },
            { payer: 6, description: 'Tapas en Mercado San Miguel', amount: 142.75, daysAgo: 66 },
            { payer: 2, description: 'Supermercado para el apartamento', amount: 87.9, daysAgo: 65 },
            { payer: 1, description: 'Entradas al Bernabéu', amount: 280.0, daysAgo: 64 },
            { payer: 3, description: 'Souvenirs compartidos', amount: 55.0, daysAgo: 63 },
            { payer: 4, description: 'Cena de despedida', amount: 198.6, daysAgo: 62 },
        ],
    },
    {
        name: 'Casa compartida',
        description: 'Alquiler, servicios y compras del mes en el apartamento',
        currency: '$',
        startedDaysAgo: 16,
        members: ['Marcos Pineda', 'Lucía Herrera', 'Tomás Quesada', 'Valeria Jiménez'],
        expenses: [
            { payer: 0, description: 'Alquiler del mes', amount: 1200.0, daysAgo: 15 },
            { payer: 1, description: 'Electricidad', amount: 84.35, daysAgo: 12 },
            { payer: 2, description: 'Internet fibra óptica', amount: 45.0, daysAgo: 11 },
            { payer: 3, description: 'Supermercado semanal', amount: 212.8, daysAgo: 9 },
            { payer: 1, description: 'Artículos de limpieza', amount: 29.9, daysAgo: 6 },
            { payer: 0, description: 'Agua y alcantarillado', amount: 31.2, daysAgo: 4 },
            { payer: 2, description: 'Pizza de la noche de películas', amount: 38.5, daysAgo: 2 },
        ],
    },
    {
        name: 'Asado del equipo',
        description: 'Carne, bebidas y decoración de la fiesta del equipo (grupo ya saldado)',
        currency: '₡',
        startedDaysAgo: 120,
        closedDaysAgo: 116,
        members: ['Sofía Ramírez', 'Mateo Vargas', 'Camila Solís', 'Andrés Brenes', 'Paula Chaves'],
        expenses: [
            { payer: 0, description: 'Carne y embutidos', amount: 46500, daysAgo: 119 },
            { payer: 1, description: 'Bebidas y hielo', amount: 23125, daysAgo: 119 },
            { payer: 2, description: 'Ensaladas y postres', amount: 16075, daysAgo: 118 },
            { payer: 3, description: 'Carbón y gas', amount: 6750, daysAgo: 118 },
            { payer: 4, description: 'Decoración y desechables', amount: 10450, daysAgo: 117 },
        ],
    },
]

/**
 * Builds the initial data. Ids are handed out in creation order, as the backend would
 * if the same groups were loaded through its API into an empty database.
 *
 * @param {Date} now
 * @returns {Omit<import('../../types/demoState.js').DemoState, 'version'>}
 */
export function buildSeedData(now) {
    const at = (daysAgo, hour) => {
        const moment = new Date(now.getTime() - daysAgo * 86_400_000)
        moment.setHours(hour, 0, 0, 0)
        return toLocalDateTime(moment)
    }

    const data = { nextIds: { groups: 1, integrants: 1, expenses: 1 }, groups: [], integrants: [], expenses: [], sampleGroupIds: [] }

    for (const seed of SEED_GROUPS) {
        const groupId = data.nextIds.groups++
        data.sampleGroupIds.push(groupId)
        data.groups.push({
            id: groupId,
            name: seed.name,
            description: seed.description,
            currency: seed.currency,
            startDate: at(seed.startedDaysAgo, 9),
            endDate: seed.closedDaysAgo === undefined ? null : at(seed.closedDaysAgo, 18),
        })

        const memberIds = seed.members.map(name => {
            const id = data.nextIds.integrants++
            data.integrants.push({ id, groupId, name })
            return id
        })

        for (const expense of seed.expenses) {
            data.expenses.push({
                id: data.nextIds.expenses++,
                groupId,
                payedBy: memberIds[expense.payer],
                description: expense.description,
                amountCents: Math.round(expense.amount * 100),   // all seed amounts have at most 2 decimals
                date: at(expense.daysAgo, 12),
            })
        }
    }

    return data
}
