import AuthLayout from '../components/auth/AuthLayout'
import AuthForm from '../components/auth/AuthForm'

const Signup = () => {
    return (
        <AuthLayout
            title="Create account"
            subtitle="Start analyzing your SQL queries today"
        >
            <AuthForm mode="signup" />
        </AuthLayout>
    )
}

export default Signup