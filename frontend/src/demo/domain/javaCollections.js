/**
 * Emulation of the java.util collections whose iteration order leaks into the backend's
 * responses. Both are needed for byte-for-byte parity: the order in which balances are listed
 * (a HashMap) and the tie-breaking when settling debts (a PriorityQueue) are not "sorted by id".
 */

/** Long.hashCode for the ids the demo hands out (sequential from 1, far below 2^32). */
export const longHashCode = id => id | 0

/** String.hashCode, over UTF-16 code units like Java. */
export function stringHashCode(text) {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
        hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0
    }
    return hash
}

/**
 * Returns `keys` in the order a java.util.HashMap built with those keys (inserted in that order,
 * default capacity) would iterate them: by bucket, and by insertion inside a bucket.
 *
 * Not emulated: a bucket holding 9+ keys makes Java grow the table early (or turn it into a tree).
 * That takes 9 ids congruent modulo the table size inside one group, which the demo can't produce.
 *
 * @template K
 * @param {K[]} keys  Distinct keys, in insertion order
 * @param {(key: K) => number} hashCode
 * @returns {K[]}
 */
export function hashMapOrder(keys, hashCode) {
    // The table starts at 16 buckets and doubles whenever it holds more than 75% of that
    let capacity = 16
    while (keys.length > capacity * 0.75) capacity *= 2

    return keys
        .map((key, insertion) => {
            const hash = hashCode(key)
            return { key, insertion, bucket: (hash ^ (hash >>> 16)) & (capacity - 1) }
        })
        .sort((a, b) => a.bucket - b.bucket || a.insertion - b.insertion)
        .map(entry => entry.key)
}

/**
 * java.util.PriorityQueue with a comparator: a binary heap that is NOT stable, so elements that
 * compare equal come out in an order determined by the sift-up/sift-down steps below. These mirror
 * OpenJDK's siftUpUsingComparator / siftDownUsingComparator exactly.
 *
 * @template T
 */
export class PriorityQueue {
    /** @param {(a: T, b: T) => number} comparator */
    constructor(comparator) {
        this.comparator = comparator
        /** @type {T[]} */
        this.heap = []
    }

    isEmpty() {
        return this.heap.length === 0
    }

    /** @param {T} element */
    offer(element) {
        let child = this.heap.length
        this.heap.push(element)
        while (child > 0) {
            const parent = (child - 1) >>> 1
            if (this.comparator(element, this.heap[parent]) >= 0) break
            this.heap[child] = this.heap[parent]
            child = parent
        }
        this.heap[child] = element
    }

    /** @returns {T | undefined} The smallest element according to the comparator */
    poll() {
        if (this.heap.length === 0) return undefined
        const head = this.heap[0]
        const last = this.heap.pop()
        const size = this.heap.length
        if (size > 0) this.#siftDown(last, size)
        return head
    }

    /** Places `element` at the root and sinks it to its position. */
    #siftDown(element, size) {
        let index = 0
        const half = size >>> 1
        while (index < half) {
            let child = 2 * index + 1
            const right = child + 1
            if (right < size && this.comparator(this.heap[child], this.heap[right]) > 0) child = right
            if (this.comparator(element, this.heap[child]) <= 0) break
            this.heap[index] = this.heap[child]
            index = child
        }
        this.heap[index] = element
    }
}
