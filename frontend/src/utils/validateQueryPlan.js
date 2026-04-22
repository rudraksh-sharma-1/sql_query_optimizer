const REQUIRED_PATTERNS = [
    /cost=\d+\.\d+\.\.\d+\.\d+/,        // cost=0.00..35.50
    /rows=\d+/,                           // rows=1550
    /width=\d+/,                          // width=36
]

const VALID_NODE_TYPES = [
    'Seq Scan',
    'Index Scan',
    'Index Only Scan',
    'Bitmap Heap Scan',
    'Bitmap Index Scan',
    'Nested Loop',
    'Hash Join',
    'Merge Join',
    'Hash',
    'Sort',
    'Aggregate',
    'Group',
    'Limit',
    'Unique',
    'Gather',
    'Gather Merge',
    'Subquery Scan',
    'CTE Scan',
    'Result',
    'Append',
    'MergeAppend',
    'Values Scan',
    'Function Scan',
    'WindowAgg',
    'Materialize',
]

const validateQueryPlan = (input) => {

    // empty check
    if (!input || !input.trim()) {
        return { valid: false, error: 'Please paste your EXPLAIN ANALYZE output.' }
    }

    const trimmed = input.trim()

    // minimum length
    if (trimmed.length < 20) {
        return { valid: false, error: 'Enter a valid execution plan.' }
    }

    // maximum length - prevent huge payloads
    if (trimmed.length > 50000) {
        return { valid: false, error: 'Input is too large. Please paste a single query plan.' }
    }

    // must contain at least one known node type
    const hasNodeType = VALID_NODE_TYPES.some(node => trimmed.includes(node))
    if (!hasNodeType) {
        return {
            valid: false,
            error: 'No valid PostgreSQL node type found. Make sure you paste the output of EXPLAIN ANALYZE, not a raw SQL query.'
        }
    }

    // must contain cost and rows pattern
    const missingPatterns = REQUIRED_PATTERNS.filter(p => !p.test(trimmed))
    if (missingPatterns.length > 0) {
        return {
            valid: false,
            error: 'Missing cost or row information. Make sure you use EXPLAIN ANALYZE, not just EXPLAIN.'
        }
    }

    // reject if it looks like a raw sql query
    const sqlKeywords = [
        /^SELECT\s/i,
        /^INSERT\s/i,
        /^UPDATE\s/i,
        /^DELETE\s/i,
        /^CREATE\s/i,
        /^DROP\s/i,
        /^ALTER\s/i,
    ]
    const looksLikeSQL = sqlKeywords.some(pattern => pattern.test(trimmed))
    if (looksLikeSQL) {
        return {
            valid: false,
            error: 'This looks like a raw SQL query. Please run EXPLAIN ANALYZE on your query first and paste the output here.'
        }
    }

    // reject if it looks like plain text / gibberish
    const hasSpecialChars = /[()=.]/.test(trimmed)
    if (!hasSpecialChars) {
        return {
            valid: false,
            error: 'Input does not look like a valid execution plan. Please paste the EXPLAIN ANALYZE output directly from your database client.'
        }
    }

    return { valid: true, error: null }
}

export default validateQueryPlan