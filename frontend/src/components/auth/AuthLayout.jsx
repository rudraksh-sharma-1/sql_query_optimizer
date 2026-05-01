import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AuthLayout = ({ children, title, subtitle }) => {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) navigate('/', { replace: true })
    }, [user, navigate])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* logo / brand */}
                <div className="text-center mb-8 flex flex-col items-center gap-3">
                    {/* <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-sm">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 8h4" />
                        </svg>
                    </div> */}
                    <h1 className="text-2xl font-bold text-gray-900">
                        SQL Query Analyzer
                    </h1>
                </div>

                {/* card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>

                {/* footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    SQL Query Analyzer &copy; {new Date().getFullYear()}
                </p>

            </div>
        </div>
    )
}

export default AuthLayout