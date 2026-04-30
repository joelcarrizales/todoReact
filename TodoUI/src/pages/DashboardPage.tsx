import { useAuth } from "../context/AuthContext"; 

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
      <div className="auth-container">
          <div className="auth-card">
              <h1>Dashboard</h1>
              <p>You are logged in.</p>
              <button onClick={logout}>Logout</button>
          </div>
      </div>
  );
}