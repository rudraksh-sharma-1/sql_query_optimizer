import { useState } from 'react'

// Node type → { icon bg color, icon color, card border/bg }
const NODE_STYLES = {
    'Seq Scan':         { dot: 'bg-red-500',    icon: 'bg-red-100 text-red-500',       card: 'bg-red-50/60 border-red-200' },
    'Index Scan':       { dot: 'bg-green-500',  icon: 'bg-green-100 text-green-600',   card: 'bg-green-50/60 border-green-200' },
    'Index Only Scan':  { dot: 'bg-green-500',  icon: 'bg-green-100 text-green-600',   card: 'bg-green-50/60 border-green-200' },
    'Bitmap Heap Scan': { dot: 'bg-teal-500',   icon: 'bg-teal-100 text-teal-600',     card: 'bg-teal-50/60 border-teal-200' },
    'Hash Join':        { dot: 'bg-blue-500',   icon: 'bg-blue-100 text-blue-600',     card: 'bg-blue-50/60 border-blue-200' },
    'Merge Join':       { dot: 'bg-cyan-500',   icon: 'bg-cyan-100 text-cyan-600',     card: 'bg-cyan-50/60 border-cyan-200' },
    'Nested Loop':      { dot: 'bg-orange-500', icon: 'bg-orange-100 text-orange-600', card: 'bg-orange-50/60 border-orange-200' },
    'Sort':             { dot: 'bg-yellow-500', icon: 'bg-yellow-100 text-yellow-600', card: 'bg-yellow-50/60 border-yellow-200' },
    'Hash':             { dot: 'bg-purple-500', icon: 'bg-purple-100 text-purple-600', card: 'bg-purple-50/60 border-purple-200' },
    'Aggregate':        { dot: 'bg-pink-500',   icon: 'bg-pink-100 text-pink-600',     card: 'bg-pink-50/60 border-pink-200' },
    'Limit':            { dot: 'bg-gray-400',   icon: 'bg-gray-100 text-gray-500',     card: 'bg-gray-50/60 border-gray-200' },
}

const getNodeStyle = (type) =>
    NODE_STYLES[type] || { dot: 'bg-gray-400', icon: 'bg-gray-100 text-gray-500', card: 'bg-white border-gray-200' }

// SVG icons per node type
const NodeIcon = ({ type, className }) => {
    const icons = {
        'Seq Scan': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        ),
        'Index Scan': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
        ),
        'Index Only Scan': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
        ),
        'Nested Loop': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        'Hash Join': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        ),
        'Hash': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        ),
        'Sort': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
        ),
        'Aggregate': (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    }
    return icons[type] || (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
        </svg>
    )
}

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

const Stat = ({ label, value, highlight, mono }) => {
    if (value === null || value === undefined) return null
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs text-gray-400 leading-none">
                {label}
            </span>
            <span className={`text-sm font-semibold leading-tight ${highlight ? 'text-orange-500' : 'text-gray-800'} ${mono ? 'font-mono' : ''}`}>
                {value}
            </span>
        </div>
    )
}

const TreeNode = ({ node, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true)
    const [detailOpen, setDetailOpen] = useState(false)
    const hasChildren = node.children && node.children.length > 0
    const style = getNodeStyle(node.type)

    const isConcerning = node.isSlow || node.isRowEstimateMismatch ||
        (node.type === 'Seq Scan' && node.loops > 10)

    // percent badge color
    const percentBadge = node.timingPercent > 80
        ? 'bg-red-500 text-white'
        : node.timingPercent > 40
            ? 'bg-orange-400 text-white'
            : 'bg-purple-500 text-white'

    return (
        <div className="flex flex-col">
            <div style={{ paddingLeft: depth === 0 ? '0px' : '20px' }}>

                {/* tree connector */}
                {depth > 0 && (
                    <div className="flex items-center mb-2">
                        <div className="w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl mr-2 shrink-0" />
                    </div>
                )}

                {/* NODE CARD */}
                <div className={`border rounded-2xl overflow-hidden bg-white ${style.card}`}>

                    {/* HEADER ROW */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">

                            {/* colored icon circle */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.icon}`}>
                                <NodeIcon type={node.type} className="w-5 h-5" />
                            </div>

                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                {/* warning dot */}
                                {isConcerning && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                )}

                                {/* node type */}
                                <span className="text-sm font-bold text-gray-900">
                                    {node.type}
                                </span>

                                {/* table */}
                                {node.table && (
                                    <span className="text-sm text-gray-400">
                                        on <span className="text-gray-600 font-medium">{node.table}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {/* timing percent badge */}
                            {node.timingPercent !== null && node.timingPercent !== undefined && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${percentBadge}`}>
                                    {node.timingPercent}%
                                </span>
                            )}

                            {/* expand/collapse children */}
                            {hasChildren && (
                                <button
                                    onClick={() => setExpanded(p => !p)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    <svg
                                        className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* QUICK STATS */}
                    <div className="px-4 pb-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-100 pt-3">
                        {node.totalActualTime !== null && node.totalActualTime !== undefined && (
                            <Stat label="Total Time" value={formatTime(node.totalActualTime)} highlight={node.isSlow} />
                        )}
                        {node.totalActualRows !== null && node.totalActualRows !== undefined && (
                            <Stat label="Actual Rows" value={node.totalActualRows?.toLocaleString()} highlight={node.isRowEstimateMismatch} />
                        )}
                        {node.totalEstRows !== null && node.totalEstRows !== undefined && (
                            <Stat label="Est. Rows" value={node.totalEstRows?.toLocaleString()} />
                        )}
                        {node.estTotalCost !== null && node.estTotalCost !== undefined && (
                            <Stat label="Cost" value={`${node.estStartCost} → ${node.estTotalCost}`} mono />
                        )}
                        {node.loops > 1 && (
                            <Stat label="Loops" value={node.loops?.toLocaleString()} highlight />
                        )}

                        {/* detail toggle inline */}
                        <button
                            onClick={() => setDetailOpen(p => !p)}
                            className="self-end text-xs text-blue-500 hover:text-blue-700 transition-colors cursor-pointer font-medium"
                        >
                            {detailOpen ? 'Less ↑' : 'More ↓'}
                        </button>
                    </div>

                    {/* DETAIL PANEL */}
                    {detailOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <Stat label="Startup Time (per loop)" value={node.actualStartTime !== null ? `${node.actualStartTime}ms` : null} />
                                <Stat label="End Time (per loop)" value={node.actualEndTime !== null ? `${node.actualEndTime}ms` : null} />
                                <Stat label="Total Startup Time" value={node.totalStartupTime !== null ? formatTime(node.totalStartupTime) : null} />
                                <Stat label="Total Actual Time" value={node.totalActualTime !== null ? formatTime(node.totalActualTime) : null} highlight={node.isSlow} />
                                <Stat label="Est. Rows" value={node.totalEstRows?.toLocaleString()} />
                                <Stat label="Actual Rows (per loop)" value={node.actualRows?.toLocaleString()} />
                                <Stat label="True Total Rows" value={node.totalActualRows?.toLocaleString()} highlight={node.isRowEstimateMismatch} />
                                <Stat label="Est. Startup Cost" value={node.estStartCost} mono />
                                <Stat label="Est. Total Cost" value={node.estTotalCost} mono />
                                <Stat label="Plan Width" value={node.width !== null ? `${node.width} bytes` : null} />
                                <Stat label="Row Est. Ratio" value={node.rowEstimationRatio !== null ? `${node.rowEstimationRatio}x` : null} highlight={node.isRowEstimateMismatch} />
                            </div>

                            {node.filter && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Filter</span>
                                    <span className="text-xs text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded-lg break-all">
                                        {node.filter}
                                    </span>
                                </div>
                            )}

                            {node.rowsRemovedByFilter !== null && node.rowsRemovedByFilter !== undefined && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Rows Removed by Filter</span>
                                    <span className="text-xs text-orange-500 font-mono font-semibold">
                                        {node.rowsRemovedByFilter?.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* CHILDREN */}
                {hasChildren && expanded && (
                    <div className="mt-2 flex flex-col gap-2 pl-3 border-l-2 border-gray-200">
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