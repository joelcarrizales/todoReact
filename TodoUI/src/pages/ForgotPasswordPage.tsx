import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
export default function ForgotPasswordPage() {
    const[email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setLoading(true);
        await authApi.forgotPassword(email);
        setLoading(false);
        setSent(true);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Forgot Password</h1>
                {sent ? (
                    <div className="success-message">
                        <p>If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
                    </div>
                ) : (
                    <>
                        <p className="hint">Enter your email address to receive a password reset link.</p>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                        </form>
                    </>
                )}
                <div className="auth-links"><Link to="/login">Back to Sign In</Link></div>
            </div>
        </div>
    );
}