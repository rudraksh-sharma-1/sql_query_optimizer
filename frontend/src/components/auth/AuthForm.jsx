import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import GoogleButton from './GoogleButton'

const AuthForm = ({ mode }) => {
    const { login, signup } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState(null)

    const isLogin = mode === 'login'

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError(null)
    }

    const validate = () => {
        if (!formData.email || !formData.password) {
            setError('Email and password are required')
            return false
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address')
            return false
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return false
        }
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                await login(formData.email, formData.password)
                navigate('/', { replace: true })
            } else {
                await signup(formData.email, formData.password)
                setSuccessMessage('Account created! You can now log in.')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">

            {/* google button */}
            <GoogleButton label={isLogin ? 'Continue with Google' : 'Sign up with Google'} />

            {/* divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* email */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-400">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-white placeholder-gray-600 transition-colors duration-200"
                    />
                </div>

                {/* password */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-gray-400">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-white placeholder-gray-600 transition-colors duration-200"
                    />
                </div>

                {/* confirm password - signup only */}
                {!isLogin && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-gray-400">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:outline-none rounded-xl text-sm text-white placeholder-gray-600 transition-colors duration-200"
                        />
                    </div>
                )}

                {/* error message */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                {/* success message - signup only */}
                {successMessage && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-xs text-green-400">{successMessage}</p>
                    </div>
                )}

                {/* submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {loading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                    )}
                    {loading
                        ? isLogin ? 'Signing in...' : 'Creating account...'
                        : isLogin ? 'Sign in' : 'Create account'
                    }
                </button>

            </form>

            {/* switch between login and signup */}
            <p className="text-center text-sm text-gray-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Link
                    to={isLogin ? '/signup' : '/login'}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                    {isLogin ? 'Sign up' : 'Sign in'}
                </Link>
            </p>

        </div>
    )
}

export default AuthForm