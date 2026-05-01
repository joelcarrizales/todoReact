import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            const response = await authApi.login(email, password);
            if (response.success && response.token) {
                login(response.token);
                navigate('/dashboard');
            }
            else {
                setErrors(['Invalid email or password']);
            }
        } catch (error) {
            setErrors(['Login failed']);
        } finally {
            setLoading(false);
        }
    }

  return (
      <div className="auth-container">
          <div className="auth-card">
              <h1>Sign In</h1>
              <form onSubmit={handleSubmit}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                  {errors.length > 0 && <div className="error-list">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
                  <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
              </form>

              <div className="auth-links">
                  <Link to="/register">Don't have an account? Sign Up</Link>
                  <Link to="/forgot-password">Forgot Password?</Link>
              </div>
          </div>
      </div>
  );
}
