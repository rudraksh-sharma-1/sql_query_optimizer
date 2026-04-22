import AuthLayout from '../components/auth/AuthLayout'
import AuthForm from '../components/auth/AuthForm'

const Login = () => {
    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account to continue"
        >
            <AuthForm mode="login" />
        </AuthLayout>
    )
}

export default Login