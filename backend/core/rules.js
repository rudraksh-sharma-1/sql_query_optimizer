const analyzeNodes = (nodes) => {

    const grouped = {
        rootCause: [],
        secondary: [],
    }

    nodes.forEach(node => {

        // rule 1 — repeated sequential scan
        // uses totalActualRows (actualRows × loops) instead of raw rows
        if (node.type === 'Seq Scan' && node.loops > 10) {
            grouped.rootCause.push({
                issue: 'Repeated Sequential Scan',
                explanation: `Table "${node.table}" is scanned ${node.loops} times. True total rows processed: ${node.totalActualRows?.toLocaleString()} (${node.actualRows?.toLocaleString()} rows × ${node.loops} loops).`,
                suggestion: `Add an index on the join or filter column of "${node.table}" to avoid repeated full table scans.`,
                raw: node.raw,
            })
        }

        // rule 2 — nested loop with inner sequential scan
        // uses totalActualTime to show true cost of the inner scan
        if (node.type === 'Nested Loop') {
            const innerScan = nodes.find(n => n.type === 'Seq Scan' && n.loops > 10)
            if (innerScan) {
                grouped.rootCause.push({
                    issue: 'Nested Loop Causing Repeated Scans',
                    explanation: `Nested Loop executes ${innerScan.loops} iterations over "${innerScan.table}". Per-loop time: ${innerScan.actualEndTime}ms × ${innerScan.loops} loops = true total: ${innerScan.totalActualTime?.toLocaleString()}ms (${innerScan.timingPercent}% of query time).`,
                    suggestion: `Create an index on "${innerScan.table}" join column to replace repeated full scans with index lookups.`,
                    raw: node.raw,
                })
            }
        }

        // rule 3 — high estimated cost
        // uses estTotalCost instead of old single cost field
        if (node.estTotalCost && node.estTotalCost > 1000) {
            grouped.secondary.push({
                issue: 'High Estimated Cost',
                explanation: `Node startup cost: ${node.estStartCost}, total cost: ${node.estTotalCost}.`,
                suggestion: `Consider adding indexes or restructuring the query to reduce the cost of this "${node.type}" operation.`,
                raw: node.raw,
            })
        }

        // rule 4 — row estimation mismatch
        // uses isRowEstimateMismatch flag and rowEstimationRatio from parser
        if (node.isRowEstimateMismatch) {
            grouped.secondary.push({
                issue: 'Row Estimation Mismatch',
                explanation: `PostgreSQL estimated ${node.estRows?.toLocaleString()} rows but got ${node.actualRows?.toLocaleString()} rows per loop (ratio: ${node.rowEstimationRatio}x). True total rows: ${node.totalActualRows?.toLocaleString()}.`,
                suggestion: `Run ANALYZE on "${node.table || 'this table'}" to refresh planner statistics and improve estimates.`,
                raw: node.raw,
            })
        }

        // rule 5 — slow node
        // uses totalActualTime (actualEndTime × loops) instead of raw actualTime
        if (node.isSlow) {
            grouped.secondary.push({
                issue: 'Slow Operation Detected',
                explanation: `Per-loop time: ${node.actualEndTime}ms × ${node.loops} loops = true total: ${node.totalActualTime?.toLocaleString()}ms (${node.timingPercent}% of total query time).`,
                suggestion: `Investigate "${node.type}"${node.table ? ` on "${node.table}"` : ''} — consider indexing or rewriting this part of the query.`,
                raw: node.raw,
            })
        }

        // rule 6 — high filter rejection rate
        // new rule using rowsRemovedByFilter from parser
        if (node.rowsRemovedByFilter != null && node.actualRows != null) {
            const totalScanned = node.actualRows + node.rowsRemovedByFilter
            const wastedRatio = node.rowsRemovedByFilter / totalScanned
            if (wastedRatio > 0.8) {
                grouped.secondary.push({
                    issue: 'High Filter Rejection Rate',
                    explanation: `${node.rowsRemovedByFilter?.toLocaleString()} rows scanned and discarded, only ${node.actualRows?.toLocaleString()} rows kept (${Math.round(wastedRatio * 100)}% wasted work).`,
                    suggestion: `Add an index on the filter column of "${node.table || 'this table'}" to avoid scanning rows that are immediately discarded.`,
                    raw: node.raw,
                })
            }
        }

    })

    // ── global root cause override ────────────────────────────────────────
    // if nested loop + problematic scan both exist, consolidate into one
    // precise root cause with sql recommendation
    const nestedLoopNode = nodes.find(n => n.type === 'Nested Loop')
    const problematicScan = nodes.find(n => n.type === 'Seq Scan' && n.loops > 10)

    if (nestedLoopNode && problematicScan) {
        let recommended_sql = null

        if (problematicScan.filter) {
            const match = problematicScan.filter.match(/(\w+)\.(\w+)/)
            if (match) {
                const table = match[1]
                const column = match[2]
                recommended_sql = `CREATE INDEX idx_${table}_${column} ON ${table}(${column});`
            }
        }

        grouped.rootCause = [{
            issue: 'Missing Index on Join Column',
            explanation: `"${problematicScan.table}" is scanned ${problematicScan.loops} times by Nested Loop. True total rows processed: ${problematicScan.totalActualRows?.toLocaleString()}. True total time: ${problematicScan.totalActualTime?.toLocaleString()}ms (${problematicScan.timingPercent}% of query time).`,
            suggestion: `Create an index on the join column of "${problematicScan.table}" to convert repeated full scans into index lookups.`,
            recommended_sql,
            raw: problematicScan.raw,
        }]
    }

    // ── deduplicate secondary issues ──────────────────────────────────────
    const seen = new Set()
    grouped.secondary = grouped.secondary.filter(s => {
        if (seen.has(s.issue)) return false
        seen.add(s.issue)
        return true
    })

    // ── success case ──────────────────────────────────────────────────────
    if (grouped.rootCause.length === 0 && grouped.secondary.length === 0) {
        return { success: true, message: 'Query plan looks good!' }
    }

    return grouped
}

export default analyzeNodes