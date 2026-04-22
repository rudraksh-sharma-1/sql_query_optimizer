const NODE_TYPES = [
    'Index Only Scan',
    'Bitmap Heap Scan',
    'Bitmap Index Scan',
    'Merge Join',
    'Nested Loop',
    'Hash Join',
    'Index Scan',
    'Seq Scan',
    'Aggregate',
    'Hash',
    'Sort',
    'Limit',
]

const parseExplainPlain = (plainText) => {
    const lines = plainText
        .split('\n')
        .map(line => line.replace(/\t/g, ' '))
        .filter(Boolean)

    const nodes = []
    let lastNode = null
    let totalExecutionTime = null  // captured from last line

    // ── first pass: capture planning/execution time ──────────────────
    lines.forEach(line => {
        const trimmed = line.trim()
        const execMatch = trimmed.match(/^Execution Time:\s*([\d.]+)\s*ms/)
        if (execMatch) totalExecutionTime = parseFloat(execMatch[1])
    })

    // ── second pass: parse nodes ─────────────────────────────────────
    lines.forEach(line => {
        const indent = line.search(/\S/)
        const trimmed = line.trim()

        const matchedType = NODE_TYPES.find(type => line.includes(type))
        const isNode = !!matchedType

        if (isNode) {

            // ── type ─────────────────────────────────────────────────
            const type = matchedType

            // ── table name ───────────────────────────────────────────
            const tableMatch = line.match(/on\s+(\w+)/)
            const table = tableMatch ? tableMatch[1] : null

            // ── estimated: cost=startCost..totalCost ─────────────────
            const costMatch = line.match(/cost=([\d.]+)\.\.([\d.]+)/)
            const estStartCost = costMatch ? parseFloat(costMatch[1]) : null
            const estTotalCost = costMatch ? parseFloat(costMatch[2]) : null

            // ── estimated rows (first rows= before actual) ───────────
            // PostgreSQL format: (...rows=N width=N) (actual time=...rows=N...)
            // estimated rows is in the first parenthesis group
            const estRowsMatch = line.match(/\(cost=[\d.]+\.\.[\d.]+\s+rows=(\d+)\s+width=(\d+)\)/)
            const estRows = estRowsMatch ? parseInt(estRowsMatch[1]) : null
            const width = estRowsMatch ? parseInt(estRowsMatch[2]) : null
            

            // ── actual time: actual time=startTime..endTime ──────────
            const actualTimeMatch = line.match(/actual\s+time=([\d.]+)\.\.([\d.]+)/)
            const actualStartTime = actualTimeMatch ? parseFloat(actualTimeMatch[1]) : null
            const actualEndTime = actualTimeMatch ? parseFloat(actualTimeMatch[2]) : null

            // ── actual rows (second rows= after actual time) ─────────
            const actualRowsMatch = line.match(/actual\s+time=[\d.]+\.\.[\d.]+\s+rows=(\d+)/)
            const actualRows = actualRowsMatch ? parseInt(actualRowsMatch[1]) : null

            // ── loops ────────────────────────────────────────────────
            const loopsMatch = line.match(/loops=(\d+)/)
            const loops = loopsMatch ? parseInt(loopsMatch[1]) : 1

            // ── CALCULATIONS ─────────────────────────────────────────
            // true total time = end time per loop × loops
            const totalActualTime = actualEndTime !== null
                ? parseFloat((actualEndTime * loops).toFixed(3))
                : null

            // true startup time = start time per loop × loops
            const totalStartupTime = actualStartTime !== null
                ? parseFloat((actualStartTime * loops).toFixed(3))
                : null

            // true total estimated rows = estRows × loops
            const totalEstRows = (estRows !== null && loops)
                ? estRows * loops
                : null

            // true total rows = actual rows per loop × loops
            const totalActualRows = actualRows !== null
                ? actualRows * loops
                : null

            // timing percentage relative to total execution time
            const timingPercent = (totalActualTime !== null && totalExecutionTime)
                ? parseFloat(((totalActualTime / totalExecutionTime) * 100).toFixed(1))
                : null

            // row estimation ratio
            const rowEstimationRatio = (estRows && actualRows !== null)
                ? parseFloat((actualRows / estRows).toFixed(2))
                : null

            // flags for rules engine
            const isRowEstimateMismatch = rowEstimationRatio !== null &&
                (rowEstimationRatio > 10 || rowEstimationRatio < 0.1)

            const isSlow = totalActualTime !== null && totalActualTime > 100

            const node = {
                // identity
                type,
                table,

                // estimated (as written in plan)
                estStartCost,
                estTotalCost,
                estRows,
                width,

                // actual per loop (as written in plan)
                actualStartTime,
                actualEndTime,
                actualRows,
                loops,

                // calculated true values
                totalActualTime,      // actualEndTime × loops
                totalStartupTime,     // actualStartTime × loops
                totalActualRows,      // actualRows × loops
                totalEstRows,         // estRows × loops
                timingPercent,        // totalActualTime / executionTime × 100

                // analysis flags
                rowEstimationRatio,
                isRowEstimateMismatch,
                isSlow,

                // extra fields (populated in second pass below)
                filter: null,
                rowsRemovedByFilter: null,

                raw: trimmed,
                indent,
                children: []
            }

            nodes.push(node)
            lastNode = node

        } else if (lastNode) {

            // ── filter ───────────────────────────────────────────────
            if (trimmed.startsWith('Filter:')) {
                const filterMatch = trimmed.match(/Filter:\s*\((.*)\)/)
                if (filterMatch) lastNode.filter = filterMatch[1]
            }

            // ── rows removed by filter ───────────────────────────────
            if (trimmed.startsWith('Rows Removed by Filter:')) {
                const removedMatch = trimmed.match(/Rows Removed by Filter:\s*(\d+)/)
                if (removedMatch) lastNode.rowsRemovedByFilter = parseInt(removedMatch[1])
            }
        }
    })

    // ── build tree using indent level ────────────────────────────────
    const stack = []
    let root = null

    nodes.forEach(node => {
        while (stack.length && stack[stack.length - 1].indent >= node.indent) {
            stack.pop()
        }
        if (stack.length === 0) {
            root = node
        } else {
            stack[stack.length - 1].children.push(node)
        }
        stack.push(node)
    })

    // attach execution time to root node for reference
    if (root) root.executionTime = totalExecutionTime

    return { root, nodes, totalExecutionTime }
}

export default parseExplainPlain