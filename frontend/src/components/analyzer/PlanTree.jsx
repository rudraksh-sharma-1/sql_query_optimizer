import { useState } from 'react'
import TreeNode from './TreeNode'

const PlanTree = ({ tree, totalExecutionTime }) => {
    const [collapsed, setCollapsed] = useState(false)

    if (!tree) return null

    return (
        <div className="flex flex-col gap-3">

            {/* header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-800">
                        Execution Plan Tree
                    </h3>
                    {totalExecutionTime && (
                        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-2.5 py-0.5 rounded-lg font-mono font-medium">
                            {totalExecutionTime}ms total
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(p => !p)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer font-medium"
                >
                    {collapsed ? 'Expand' : 'Collapse'}
                    <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* legend */}
            {!collapsed && (
                <div className="flex items-center gap-5 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        Problematic node
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                        High % of query time
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        Moderate % of query time
                    </span>
                </div>
            )}

            {/* tree */}
            {!collapsed && (
                <div className="flex flex-col gap-2">
                    <TreeNode node={tree} depth={0} />
                </div>
            )}

        </div>
    )
}

export default PlanTree