import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { hashMapOrder, longHashCode, PriorityQueue, stringHashCode } from '../src/demo/domain/javaCollections.js'

describe('stringHashCode', () => {
    it('matches Java String.hashCode', () => {
        assert.equal(stringHashCode(''), 0)
        assert.equal(stringHashCode('a'), 97)
        assert.equal(stringHashCode('hello'), 99162322)
        assert.equal(stringHashCode('description'), -1724546052)   // overflows int, like Java
    })
})

describe('hashMapOrder', () => {
    it('iterates by bucket, then by insertion', () => {
        // 16 buckets: 1 and 17 share bucket 1 and keep their insertion order, 16 goes to bucket 0
        assert.deepEqual(hashMapOrder([17, 1, 16, 2], longHashCode), [16, 17, 1, 2])
    })

    it('grows the table after 12 entries, which changes the order', () => {
        const ids = Array.from({ length: 13 }, (_, i) => i + 16)
        // 13 entries -> 32 buckets, so 16..31 stay in ascending order instead of wrapping around 16 buckets
        assert.deepEqual(hashMapOrder(ids, longHashCode), ids)
        // 12 entries still fit in 16 buckets: 16 wraps to bucket 0 and comes first, 17 to bucket 1, ...
        assert.deepEqual(hashMapOrder([27, 16, 28], longHashCode), [16, 27, 28])
    })
})

describe('PriorityQueue', () => {
    it('polls in comparator order', () => {
        const queue = new PriorityQueue((a, b) => a - b)
        for (const n of [5, 1, 4, 2, 3, 9, 0]) queue.offer(n)

        const polled = []
        while (!queue.isEmpty()) polled.push(queue.poll())

        assert.deepEqual(polled, [0, 1, 2, 3, 4, 5, 9])
    })

    it('returns undefined when empty', () => {
        assert.equal(new PriorityQueue((a, b) => a - b).poll(), undefined)
    })

    it('is not stable: equal elements come out in heap order, like Java', () => {
        // Verified against java.util.PriorityQueue: offering a,b,c,d (all equal) polls a, d, c, b
        const queue = new PriorityQueue((x, y) => x.priority - y.priority)
        for (const name of ['a', 'b', 'c', 'd']) queue.offer({ name, priority: 1 })

        const polled = []
        while (!queue.isEmpty()) polled.push(queue.poll().name)

        assert.deepEqual(polled, ['a', 'd', 'c', 'b'])
    })
})
