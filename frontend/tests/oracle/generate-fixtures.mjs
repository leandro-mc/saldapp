// Regenerates fixtures.json by running the REAL backend SettlementCalculator (plus a copy of the
// balance calculation, see java/Oracle.java) over a few hundred pseudo-random scenarios.
//
//   node tests/oracle/generate-fixtures.mjs
//
// Needs a JDK (javac + java 17+) on the PATH. The output is committed, so day-to-day
// `npm test` does not need Java; rerun this only if the backend algorithm changes.
// The scenarios are deterministic (fixed seed), so a rerun produces the same file.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const calculatorSource = join(here, '../../../backend/src/main/java/com/lmora/saldapp/domain/service/SettlementCalculator.java')

// ── scenarios ────────────────────────────────────────────────────────────────

/** Small deterministic PRNG (mulberry32) so the fixtures are reproducible. */
function createRandom(seed) {
    let state = seed
    return () => {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const random = createRandom(20260101)
const int = (min, max) => min + Math.floor(random() * (max - min + 1))
const pick = list => list[int(0, list.length - 1)]
const shuffle = list => list.map(value => ({ value, key: random() })).sort((a, b) => a.key - b.key).map(item => item.value)

/** Integrant ids in the shapes that stress HashMap ordering: runs, scattered ids and ids sharing a bucket. */
function integrantIds() {
    const shape = pick(['run', 'run', 'scattered', 'sameBucket'])
    if (shape === 'run') {
        const first = int(1, 90)
        return Array.from({ length: int(1, 30) }, (_, i) => first + i)
    }
    if (shape === 'sameBucket') {
        const first = int(1, 16)
        return Array.from({ length: int(2, 8) }, (_, i) => first + 16 * i)
    }
    return shuffle(Array.from({ length: 200 }, (_, i) => i + 1)).slice(0, int(2, 20))
}

function groupScenario() {
    const ids = integrantIds()
    // Equal amounts on purpose: they create equal balances, where the queues' tie-breaking decides the output
    const amountPool = pick([null, [1000, 2000, 2500, 5000], [333, 1000]])
    const expenses = Array.from({ length: int(0, 30) }, () => ({
        payedBy: pick(ids),
        amount: amountPool ? pick(amountPool) : int(1, 2_000_000),
    }))
    return { integrantIds: random() < 0.3 ? shuffle(ids) : ids, expenses }
}

function settlementScenario() {
    const ids = shuffle(Array.from({ length: 100 }, (_, i) => i + 1)).slice(0, int(0, 12))
    const values = pick([[-5000, -2500, -1000, 1000, 2500, 5000], null])
    return ids.map(integrantId => ({ integrantId, balance: values ? pick(values) : int(-300_000, 300_000) }))
}

const groups = Array.from({ length: 120 }, groupScenario)
const settlements = Array.from({ length: 120 }, settlementScenario)

// ── run the Java reference ───────────────────────────────────────────────────

const input = [
    ...groups.map(g => `G ${g.integrantIds.join(',')} | ${g.expenses.map(e => `${e.payedBy}:${e.amount}`).join(',')}`),
    ...settlements.map(s => `S ${s.map(b => `${b.integrantId}:${b.balance}`).join(',')}`),
].join('\n')

const out = mkdtempSync(join(tmpdir(), 'saldapp-oracle-'))
const javaSources = ['java/Oracle.java', 'java/com/lmora/saldapp/domain/model/Balance.java', 'java/com/lmora/saldapp/domain/model/Transaction.java']
    .map(file => join(here, file))

// `javac` is the usual way; the second form reaches the same compiler on setups that only expose it as a module
const hasJavac = spawnSync('javac', ['-version']).status === 0
const compile = hasJavac
    ? ['javac', ['-d', out, ...javaSources, calculatorSource]]
    : ['java', ['-m', 'jdk.compiler/com.sun.tools.javac.Main', '-d', out, ...javaSources, calculatorSource]]

const compiled = spawnSync(compile[0], compile[1], { encoding: 'utf8' })
if (compiled.status !== 0) throw new Error(`Could not compile the Java oracle:\n${compiled.stderr}`)

const run = spawnSync('java', ['-cp', out, 'Oracle'], { input, encoding: 'utf8' })
if (run.status !== 0) throw new Error(`The Java oracle failed:\n${run.stderr}`)

// Ignore JVM notices (JAVA_TOOL_OPTIONS and friends) that some environments print to stdout
const results = run.stdout.split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line))
if (results.length !== groups.length + settlements.length) {
    throw new Error(`Expected ${groups.length + settlements.length} results, got ${results.length}`)
}

// ── write fixtures (one scenario per line to keep diffs readable) ────────────

const lines = list => `[\n${list.map(item => '    ' + JSON.stringify(item)).join(',\n')}\n  ]`

writeFileSync(join(here, 'fixtures.json'), `{
  "comment": "Generated by tests/oracle/generate-fixtures.mjs with the Java backend as reference. Amounts are cents. balances: [integrantId, totalPaid, balance]. settlements: [fromId, toId, amount].",
  "groups": ${lines(groups.map((g, i) => ({ ...g, ...results[i] })))},
  "settlements": ${lines(settlements.map((s, i) => ({ balances: s, settlements: results[groups.length + i].settlements })))}
}
`)
console.log(`Wrote ${groups.length} group and ${settlements.length} settlement scenarios.`)
