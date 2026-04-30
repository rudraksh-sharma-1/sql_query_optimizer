import QueryInput from '../components/analyzer/QueryInput'
import PlanTree from '../components/analyzer/PlanTree'
import SuggestionPanel from '../components/analyzer/SuggestionPanel'
import useAnalyzer from '../hooks/useAnalyzer'

const Home = () => {
    const { analyze, loading, error, result } = useAnalyzer()

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">

                {/* header */}
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">
                        SQL Query Analyzer
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Paste your PostgreSQL EXPLAIN ANALYZE output and get instant optimization suggestions
                    </p>
                </div>

                {/* input */}
                <QueryInput onAnalyze={analyze} loading={loading} />

                {/* api error */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                {/* results */}
                {result && (
                    <div className="flex flex-col gap-6">
                        <PlanTree tree={result.tree} totalExecutionTime={result.totalExecutionTime} />
                        <SuggestionPanel suggestions={result.suggestions} historyId={result.history_id} />
                    </div>
                )}

            </div>
        </div>
    )
}

export default Home