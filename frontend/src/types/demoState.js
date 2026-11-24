/**
 * Shape of the demo backend's state, the one persisted in localStorage.
 * Only used when demo mode is on (see src/demo).
 */

/**
 * @typedef {Object} DemoGroup
 * @property {number} id
 * @property {string} name
 * @property {string | null} description
 * @property {string} currency
 * @property {string} startDate         // ISO 8601 format
 * @property {string | null} endDate    // ISO 8601 format, null while the group is open
 */

/**
 * @typedef {Object} DemoIntegrant
 * @property {number} id
 * @property {number} groupId
 * @property {string} name
 */

/**
 * @typedef {Object} DemoExpense
 * @property {number} id
 * @property {number} groupId
 * @property {number} payedBy      // Integrant id
 * @property {string} description
 * @property {number} amountCents  // Integer. The API exposes it as a decimal amount
 * @property {string} date         // ISO 8601 format
 */

/**
 * @typedef {Object} DemoState
 * @property {number} version
 * @property {{ groups: number, integrants: number, expenses: number }} nextIds  // Next id to hand out per table, like DB sequences
 * @property {DemoGroup[]} groups
 * @property {DemoIntegrant[]} integrants
 * @property {DemoExpense[]} expenses
 * @property {number[]} sampleGroupIds  // Groups created by the seed, listed on the home page
 */
