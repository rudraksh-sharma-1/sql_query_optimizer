import { useState } from 'react'

const NODE_COLORS = {
    'Seq Scan': 'text-red-400 border-red-500/30 bg-red-500/5',
    'Index Scan': 'text-green-400 border-green-500/30 bg-green-500/5',
    'Index Only Scan': 'text-green-400 border-green-500/30 bg-green-500/5',
    'Bitmap Heap Scan': 'text-teal-400 border-teal-500/30 bg-teal-500/5',
    'Hash Join': 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    'Merge Join': 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    'Nested Loop': 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    'Sort': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    'Hash': 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    'Aggregate': 'text-pink-400 border-pink-500/30 bg-pink-500/5',
    'Limit': 'text-gray-400 border-gray-500/30 bg-gray-500/5',
}

const getNodeStyle = (type) =>
    NODE_COLORS[type] || 'text-gray-400 border-gray-500/30 bg-gray-500/5'

// format ms into readable string
// e.g. 3000000ms → "50m 0s", 150ms → "150ms"
const formatTime = (ms) => {
    if (ms === null || ms === undefined) return null
    if (ms >= 60000) {
        const mins = Math.floor(ms / 60000)
        const secs = Math.floor((ms % 60000) / 1000)
        return `${mins}m ${secs}s`
    }
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
    return `${ms}ms`
}

// stat pill used in the stats grid
const Stat = ({ label, value, highlight, mono }) => {
    if (value === null || value === undefined) return null
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs text-gray-600 uppercase tracking-wider leading-none">
                {label}
            </span>
            <span className={`text-xs font-medium leading-tight ${highlight ? 'text-orange-300' : 'text-gray-300'} ${mono ? 'font-mono' : ''}`}>
                {value}
            </span>
        </div>
    )
}

const TreeNode = ({ node, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true)
    const [detailOpen, setDetailOpen] = useState(false)
    const hasChildren = node.children && node.children.length > 0
    const nodeStyle = getNodeStyle(node.type)

    // decide if node is concerning
    const isConcerning = node.isSlow || node.isRowEstimateMismatch ||
        (node.type === 'Seq Scan' && node.loops > 10)

    return (
        <div className="flex flex-col">
            <div style={{ paddingLeft: depth === 0 ? '0px' : '20px' }}>

                {/* tree connector */}
                {depth > 0 && (
                    <div className="flex items-center mb-1.5">
                        <div className="w-4 h-4 border-l-2 border-b-2 border-gray-700 rounded-bl mr-2 shrink-0" />
                    </div>
                )}

                {/* ── NODE CARD ───────────────────────────────────── */}
                <div className={`border rounded-xl flex flex-col ${nodeStyle}`}>

                    {/* ── HEADER ROW ────────────────────────────── */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3">

                        <div className="flex items-center gap-2 min-w-0">
                            {/* expand/collapse children */}
                            {hasChildren && (
                                <button
                                    onClick={() => setExpanded(p => !p)}
                                    className="cursor-pointer shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <svg
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}

                            {/* warning dot */}
                            {isConcerning && (
                                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                            )}

                            {/* node type */}
                            <span className="text-sm font-semibold truncate">
                                {node.type}
                            </span>

                            {/* table */}
                            {node.table && (
                                <span className="text-xs text-gray-500 shrink-0">
                                    on <span className="text-gray-300 font-mono">{node.table}</span>
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* timing percent badge */}
                            {node.timingPercent !== null && node.timingPercent !== undefined && (
                                <span className={`text-xs font-mono px-2 py-0.5 rounded-lg border
                                    ${node.timingPercent > 80
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : node.timingPercent > 40
                                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                            : 'bg-gray-800 border-gray-700 text-gray-400'
                                    }`}
                                >
                                    {node.timingPercent}%
                                </span>
                            )}

                            {/* detail toggle */}
                            <button
                                onClick={() => setDetailOpen(p => !p)}
                                className="text-xs text-gray-600 hover:text-gray-300 transition-colors cursor-pointer px-2 py-0.5 rounded-lg border border-transparent hover:border-gray-700"
                            >
                                {detailOpen ? 'Less' : 'More'}
                            </button>
                        </div>
                    </div>

                    {/* ── QUICK STATS (always visible) ──────────── */}
                    <div className="px-4 pb-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/5 pt-2">

                        {/* timing */}
                        {node.totalActualTime !== null && node.totalActualTime !== undefined && (
                            <Stat
                                label="Total Time"
                                value={formatTime(node.totalActualTime)}
                                highlight={node.isSlow}
                            />
                        )}

                        {/* rows */}
                        {(node.totalActualRows !== null && node.totalActualRows !== undefined) && (
                            <Stat
                                label="Actual Rows"
                                value={node.totalActualRows?.toLocaleString()}
                                highlight={node.isRowEstimateMismatch}
                            />
                        )}
                        {node.totalEstRows !== null && node.totalEstRows !== undefined && (
                            <Stat label="Est. Rows" value={node.totalEstRows?.toLocaleString()} />
                        )}

                        {/* cost */}
                        {node.estTotalCost !== null && node.estTotalCost !== undefined && (
                            <Stat label="Cost" value={`${node.estStartCost} → ${node.estTotalCost}`} mono />
                        )}

                        {/* loops */}
                        {node.loops > 1 && (
                            <Stat label="Loops" value={node.loops?.toLocaleString()} highlight />
                        )}

                    </div>

                    {/* ── DETAIL PANEL (toggle) ─────────────────── */}
                    {detailOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-white/5 flex flex-col gap-3">

                            {/* detailed stats grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">

                                <Stat
                                    label="Startup Time (per loop)"
                                    value={node.actualStartTime !== null ? `${node.actualStartTime}ms` : null}
                                />
                                <Stat
                                    label="End Time (per loop)"
                                    value={node.actualEndTime !== null ? `${node.actualEndTime}ms` : null}
                                />
                                <Stat
                                    label="Total Startup Time"
                                    value={node.totalStartupTime !== null ? formatTime(node.totalStartupTime) : null}
                                />
                                <Stat
                                    label="Total Actual Time"
                                    value={node.totalActualTime !== null ? formatTime(node.totalActualTime) : null}
                                    highlight={node.isSlow}
                                />
                                <Stat
                                    label="Est. Rows"
                                    value={node.totalEstRows?.toLocaleString()}
                                />
                                <Stat
                                    label="Actual Rows (per loop)"
                                    value={node.actualRows?.toLocaleString()}
                                />
                                <Stat
                                    label="True Total Rows"
                                    value={node.totalActualRows?.toLocaleString()}
                                    highlight={node.isRowEstimateMismatch}
                                />
                                <Stat
                                    label="Est. Startup Cost"
                                    value={node.estStartCost}
                                    mono
                                />
                                <Stat
                                    label="Est. Total Cost"
                                    value={node.estTotalCost}
                                    mono
                                />
                                <Stat
                                    label="Plan Width"
                                    value={node.width !== null ? `${node.width} bytes` : null}
                                />
                                <Stat
                                    label="Row Est. Ratio"
                                    value={node.rowEstimationRatio !== null ? `${node.rowEstimationRatio}x` : null}
                                    highlight={node.isRowEstimateMismatch}
                                />

                            </div>

                            {/* filter */}
                            {node.filter && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-600 uppercase tracking-wider">Filter</span>
                                    <span className="text-xs text-gray-300 font-mono bg-gray-800 px-3 py-2 rounded-lg break-all">
                                        {node.filter}
                                    </span>
                                </div>
                            )}

                            {/* rows removed by filter */}
                            {node.rowsRemovedByFilter !== null && node.rowsRemovedByFilter !== undefined && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-600 uppercase tracking-wider">Rows Removed by Filter</span>
                                    <span className="text-xs text-orange-300 font-mono">
                                        {node.rowsRemovedByFilter?.toLocaleString()}
                                    </span>
                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* ── CHILDREN ────────────────────────────────────── */}
                {hasChildren && expanded && (
                    <div className="mt-2 flex flex-col gap-2 pl-3 border-l-2 border-gray-800">
                        {node.children.map((child, i) => (
                            <TreeNode key={i} node={child} depth={depth + 1} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default TreeNode