import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LogoutModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mx-auto">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>
                <div className="text-center">
                    <h3 className="text-white font-semibold text-lg">Sign out</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Are you sure you want to sign out of your account?
                    </p>
                </div>
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors duration-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium text-white transition-colors duration-200 cursor-pointer"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    )
}

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()          // ← track current route
    const [showModal, setShowModal] = useState(false)

    const handleLogoutConfirm = async () => {
        await logout()
        setShowModal(false)
        navigate('/login', { replace: true })
    }

    const isLogin = location.pathname === '/login'
    const isSignup = location.pathname === '/signup'

    return (
        <>
            <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* logo */}
                    <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 8h4" />
                            </svg>
                        </div>
                        <span className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors duration-200">
                            SQL Analyzer
                        </span>
                    </Link>

                    {/* right side */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-xs text-gray-500 max-w-[180px] truncate">
                                {user.email}
                            </span>
                            <Link
                                to="/history"
                                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${location.pathname === '/history'
                                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:block">History</span>
                            </Link>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-600/10 hover:border-red-500/30 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:text-red-400 transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:block">Sign out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1">

                            {/* sign in button */}
                            <Link
                                to="/login"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${isLogin
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign in
                            </Link>

                            {/* sign up button */}
                            <Link
                                to="/signup"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${isSignup
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign up
                            </Link>

                        </div>
                    )}

                </div>
            </nav>

            {showModal && (
                <LogoutModal
                    onConfirm={handleLogoutConfirm}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </>
    )
}

export default Navbar