import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import validateQueryPlan from '../../utils/validateQueryPlan'

const DB_OPTIONS = [
    { value: 'postgresql', label: 'PostgreSQL', available: true, icon: '🐘' },
    { value: 'mysql', label: 'MySQL', available: false, icon: '🐬' },
    { value: 'mssql', label: 'Microsoft SQL Server', available: false, icon: '🪟' },
    { value: 'oracle', label: 'Oracle DB', available: false, icon: '🔴' },
    { value: 'sqlite', label: 'SQLite', available: false, icon: '🗄️' },
]

const LoginPromptModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 border border-blue-100 mx-auto">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-gray-900 font-semibold text-lg">Sign in to analyze</h3>
                    <p className="text-gray-600 text-sm mt-1">
                        Create a free account to analyze your query plans and save your history.
                    </p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <Link
                        to="/signup"
                        className="w-full py-2.5 bg-blue-400 hover:bg-blue-600 rounded-xl text-sm font-medium text-white text-center transition-colors duration-200 cursor-pointer"
                    >
                        Create free account
                    </Link>
                    <Link
                        to="/login"
                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 text-center transition-colors duration-200 cursor-pointer"
                    >
                        Sign in
                    </Link>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    )
}

const QueryInput = ({ onAnalyze, loading }) => {
    const { user } = useAuth()
    const [queryPlan, setQueryPlan] = useState('')
    const [sqlQuery, setSqlQuery] = useState('')
    const [showSqlInput, setShowSqlInput] = useState(false)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const [selectedDb, setSelectedDb] = useState('postgresql')
    const [validationError, setValidationError] = useState(null)

    const selectedDbOption = DB_OPTIONS.find(db => db.value === selectedDb)
    const isAvailable = selectedDbOption?.available

    const handleAnalyze = () => {
        if (!user) {
            setShowLoginPrompt(true)
            return
        }

        const { valid, error } = validateQueryPlan(queryPlan)
        if (!valid) {
            setValidationError(error)
            return
        }

        setValidationError(null)
        onAnalyze({ queryPlan, sqlQuery, dbType: selectedDb })
    }

    return (
        <>
            <div className="w-full flex flex-col gap-5">

                {/* db selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Database Type
                    </label>
                    <div className="relative w-fit">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">
                            {selectedDbOption?.icon}
                        </div>
                        <select
                            value={selectedDb}
                            onChange={(e) => setSelectedDb(e.target.value)}
                            className="pl-9 pr-10 py-2.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-xl text-sm text-gray-700 font-medium transition-all duration-200 cursor-pointer appearance-none shadow-sm min-w-[180px]"
                        >
                            {DB_OPTIONS.map(db => (
                                <option key={db.value} value={db.value}>
                                    {db.label} {!db.available ? '(coming soon)' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* coming soon warning */}
                    {!isAvailable && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p className="text-xs text-amber-700">
                                Support for <span className="font-semibold">{selectedDbOption?.label}</span> is coming soon. Currently only PostgreSQL is supported.
                            </p>
                        </div>
                    )}
                </div>

                {/* query plan input */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">
                            Execution Plan
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <span className="text-xs text-gray-400">
                            Paste your EXPLAIN ANALYZE output
                        </span>
                    </div>
                    <textarea
                        value={queryPlan}
                        onChange={(e) => {
                            setQueryPlan(e.target.value)
                            setValidationError(null)
                        }}
                        placeholder={`Seq Scan on users (cost=0.00..35.50 rows=1550 width=36)\n  Filter: (status = 'active')\n  Rows Removed by Filter: 1200\nPlanning Time: 0.8 ms\nExecution Time: 12.4 ms`}
                        rows={10}
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-700 placeholder-gray-300 font-mono resize-none transition-all duration-200 shadow-sm
                            ${validationError
                                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                            } focus:outline-none`}
                    />

                    {/* validation error */}
                    {validationError && (
                        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-red-600">{validationError}</p>
                        </div>
                    )}
                </div>

                {/* optional sql query toggle */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShowSqlInput(prev => !prev)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors duration-200 cursor-pointer w-fit"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${showSqlInput ? 'rotate-90' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-600 font-medium">Add SQL query</span>
                        <span className="text-xs text-gray-400 font-normal">(optional)</span>
                    </button>

                    {showSqlInput && (
                        <textarea
                            value={sqlQuery}
                            onChange={(e) => setSqlQuery(e.target.value)}
                            placeholder={`SELECT * FROM users WHERE status = 'active';`}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-xl text-sm text-gray-700 placeholder-gray-300 font-mono resize-none transition-all duration-200 shadow-sm"
                        />
                    )}
                </div>

                {/* analyze button */}
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !queryPlan.trim() || !isAvailable}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analyze Query Plan
                        </>
                    )}
                </button>

                {/* hint for non logged in users */}
                {!user && (
                    <p className="text-center text-xs text-gray-500">
                        You need to{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors duration-200 font-medium">
                            sign in
                        </Link>
                        {' '}to analyze and save your results
                    </p>
                )}

            </div>

            {showLoginPrompt && (
                <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
            )}
        </>
    )
}

export default QueryInput