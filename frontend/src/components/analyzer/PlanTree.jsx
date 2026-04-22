import { useState } from 'react'
import TreeNode from './TreeNode'

const PlanTree = ({ tree, totalExecutionTime }) => {
    const [collapsed, setCollapsed] = useState(false)

    if (!tree) return null

    return (
        <div className="flex flex-col gap-3">

            {/* header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                    </svg>
                    <h3 className="text-sm font-semibold text-white">
                        Execution Plan Tree
                    </h3>
                    {/* total execution time badge */}
                    {totalExecutionTime && (
                        <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg font-mono">
                            {totalExecutionTime}ms total
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(p => !p)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                >
                    {collapsed ? 'Expand' : 'Collapse'}
                </button>
            </div>

            {/* legend */}
            {!collapsed && (
                <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        Problematic node
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-2 rounded bg-red-500/20 border border-red-500/30" />
                        High % of query time
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-2 rounded bg-orange-500/20 border border-orange-500/30" />
                        Moderate % of query time
                    </span>
                </div>
            )}

            {/* tree */}
            {!collapsed && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                    <TreeNode node={tree} depth={0} />
                </div>
            )}

        </div>
    )
}

export default PlanTree