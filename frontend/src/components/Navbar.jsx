import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../../public/logo.png'

const LogoutModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto">
                    {/* <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg> */}
                    <img src={logo} alt="Logo" />
                </div>
                <div className="text-center">
                    <h3 className="text-gray-900 font-semibold text-lg">Sign out</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Are you sure you want to sign out of your account?
                    </p>
                </div>
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors duration-200 cursor-pointer"
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
    const location = useLocation()
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
            <nav className="w-full bg-white border-b border-gray-200 px-6 py-3.5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* logo */}
                    <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                        <span className="text-gray-900 font-semibold text-sm group-hover:text-blue-600 transition-colors duration-200">
                            SQL Analyzer
                        </span>
                    </Link>

                    {/* right side */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:block text-xs text-gray-400 max-w-[180px] truncate">
                                {user.email}
                            </span>
                            <Link
                                to="/history"
                                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${location.pathname === '/history'
                                        ? 'bg-indigo-50 border-indigo-200 text-blue-600'
                                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:block">History</span>
                            </Link>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 hover:border-red-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-red-500 transition-all duration-200 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:block">Sign out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">

                            {/* sign in button */}
                            <Link
                                to="/login"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${isLogin
                                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                        : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                Sign in
                            </Link>

                            {/* sign up button */}
                            <Link
                                to="/signup"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${isSignup
                                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                        : 'text-gray-500 hover:text-gray-800'
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