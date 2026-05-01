import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const email = params.get('email') ?? '';
    const token = params.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErrors([]);

        if (password !== confirmPassword) {
            setErrors(['Passwords do not match']);
            return;
        }

        if (!email || !token) {
            setErrors(['Invalid password reset link']);
            return;
        }

        setLoading(true);
        const response = await authApi.register(email, password);
        setLoading(false);

        if (response.success) {
            setSuccess(true);
        } else {
            setErrors(response.errors || ['Password reset failed']);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Password Reset</h1>
                {success ? (
                    <div className="success-message">
                        <p>Your password has been reset successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="password">New Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />

                        <p className="hint">Min 10 characters, at least one uppercase letter, one lowercase letter, and one number</p>
                        {errors.length > 0 && <div className="error-list">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
                        <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                    </form>
                )}


                <div className="auth-links">
                    <Link to="/login">Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
}
