#!/usr/bin/env node
// ================================================================
//  SaldApp — demo data seed
//
//  Loads fictional groups, members and expenses through the REST API.
//  Requires Node 18+ (global fetch) and no npm packages.
//
//    Docker:  runs automatically as the `seed` service in docker-compose.yml
//    Local:   node seed/seed.mjs            (API_URL defaults to http://localhost:8080)
//
//  Safe to run more than once: it only seeds an empty database
//  (i.e. when group #1 does not exist yet), so it never duplicates
//  data or touches groups you created yourself.
//
//  Env: API_URL, FRONTEND_URL (only used for the final hint),
//       SEED_DEMO_DATA=false to skip.
// ================================================================

const API = (process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '')
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

if (process.env.SEED_DEMO_DATA === 'false') {
  console.log('[seed] SEED_DEMO_DATA=false → skipping demo data.')
  process.exit(0)
}

// ── helpers ──────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** ISO local date-time without millis/zone, as the API expects: yyyy-MM-dd'T'HH:mm:ss */
const daysAgo = (days, hour = 12) => {
  const d = new Date(Date.now() - days * 86_400_000)
  d.setUTCHours(hour, 0, 0, 0)
  return d.toISOString().slice(0, 19)
}

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { ok: res.ok, status: res.status, data }
}

async function mustCall(method, path, body) {
  const r = await call(method, path, body)
  if (!r.ok) {
    throw new Error(`${method} ${path} → HTTP ${r.status}: ${JSON.stringify(r.data)}`)
  }
  return r.data
}

async function waitForApi(retries = 90, delayMs = 2000) {
  console.log(`[seed] Waiting for the API at ${API} ...`)
  for (let i = 1; i <= retries; i++) {
    try {
      // Any HTTP answer (even 404) means the server is up
      await fetch(`${API}/groups/0`)
      console.log('[seed] API is up.')
      return
    } catch {
      if (i % 5 === 0) console.log(`[seed]   still waiting (${i}/${retries})...`)
      await sleep(delayMs)
    }
  }
  throw new Error(`API not reachable at ${API} after ${retries} attempts`)
}

// ── demo data ────────────────────────────────────────────────────
// payer = index into `members`
const GROUPS = [
  {
    name: 'Viaje a Madrid',
    description: 'Boletos de avión, hospedaje, comidas y tours de la escapada de mayo',
    currency: 'USD',
    startDaysAgo: 75,
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
    name: 'Casa compartida - Noviembre',
    description: 'Alquiler, servicios y compras del mes en el apartamento',
    currency: 'USD',
    startDaysAgo: 16,
    members: ['Marcos Pineda', 'Lucía Herrera', 'Tomás Quesada', 'Valeria Jiménez'],
    expenses: [
      { payer: 0, description: 'Alquiler de noviembre', amount: 1200.0, daysAgo: 15 },
      { payer: 1, description: 'Electricidad', amount: 84.35, daysAgo: 12 },
      { payer: 2, description: 'Internet fibra óptica', amount: 45.0, daysAgo: 11 },
      { payer: 3, description: 'Supermercado semanal', amount: 212.8, daysAgo: 9 },
      { payer: 1, description: 'Artículos de limpieza', amount: 29.9, daysAgo: 6 },
      { payer: 0, description: 'Agua y alcantarillado', amount: 31.2, daysAgo: 4 },
      { payer: 2, description: 'Pizza de la noche de películas', amount: 38.5, daysAgo: 2 },
    ],
  },
  {
    name: 'Asado de fin de año',
    description: 'Carne, bebidas y decoración de la fiesta del equipo (grupo ya saldado)',
    currency: 'USD',
    startDaysAgo: 120,
    closeAtEnd: true,
    members: ['Sofía Ramírez', 'Mateo Vargas', 'Camila Solís', 'Andrés Brenes', 'Paula Chaves'],
    expenses: [
      { payer: 0, description: 'Carne y embutidos', amount: 186.0, daysAgo: 119 },
      { payer: 1, description: 'Bebidas y hielo', amount: 92.5, daysAgo: 119 },
      { payer: 2, description: 'Ensaladas y postres', amount: 64.25, daysAgo: 118 },
      { payer: 3, description: 'Carbón y gas', amount: 27.0, daysAgo: 118 },
      { payer: 4, description: 'Decoración y desechables', amount: 41.8, daysAgo: 117 },
    ],
  },
]

// ── main ─────────────────────────────────────────────────────────
async function main() {
  await waitForApi()

  const first = await call('GET', '/groups/1')
  if (first.ok) {
    console.log('[seed] Group #1 already exists → database is not empty, nothing to do.')
    return
  }
  if (first.status !== 404) {
    throw new Error(`Unexpected answer from GET /groups/1: HTTP ${first.status} ${JSON.stringify(first.data)}`)
  }

  console.log('[seed] Empty database → loading demo data...')
  const summary = []

  for (const g of GROUPS) {
    const group = await mustCall('POST', '/groups', {
      name: g.name,
      description: g.description,
      currency: g.currency,
      startDate: daysAgo(g.startDaysAgo, 9),
    })

    const ids = []
    for (const name of g.members) {
      const integrant = await mustCall('POST', `/groups/${group.id}/integrants`, { name })
      ids.push(integrant.id)
    }

    for (const e of g.expenses) {
      await mustCall('POST', `/groups/${group.id}/expenses`, {
        payedBy: ids[e.payer],
        description: e.description,
        amount: e.amount,
        date: daysAgo(e.daysAgo),
      })
    }

    if (g.closeAtEnd) {
      await mustCall('POST', `/groups/${group.id}/close`)
    }

    summary.push({ id: group.id, name: g.name, closed: !!g.closeAtEnd })
    console.log(`[seed]   ✓ "${g.name}" (id ${group.id}): ${g.members.length} members, ${g.expenses.length} expenses${g.closeAtEnd ? ', closed' : ''}`)
  }

  console.log('\n[seed] Done. Enter these group IDs on the home screen:')
  for (const s of summary) {
    console.log(`         • ${FRONTEND}/groups/${s.id}  —  ${s.name}${s.closed ? ' (closed)' : ''}`)
  }
}

main().catch((err) => {
  console.error(`[seed] ERROR: ${err.message}`)
  process.exit(1)
})
