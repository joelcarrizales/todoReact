import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErrors([]);

        if (password !== confirmPassword) {
            setErrors(['Passwords do not match']);
            return;
        }

        setLoading(true);
        const response = await authApi.register(email, password);
        setLoading(false);

        if (response.success) {
            navigate('/login', {
                state: { message: "Account created successfully. Please log in." }
            });
        } else {
            setErrors(response.errors ?? ['Registration failed']);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Create Account</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />

                    <p className="hint">Min 10 characters, at least one uppercase letter, one lowercase letter, and one number</p>
                    {errors.length > 0 && <div className="error-list">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
                    <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
                </form>

                <div className="auth-links">
                    <Link to="/login">Already have an account? Sign In</Link>
                </div>
            </div>
        </div>
    );
}
