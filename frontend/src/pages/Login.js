/**
 * Login Page
 * Left: Decorative panel. Right: Login form card.
 * Login using Phone Number OR Email ID + Password (toggle/radio).
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';
import './Login.css';

export default function Login() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!vehicleNumber.trim() || !password) {
      setError('Please enter vehicle number and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { vehicleNumber: vehicleNumber.trim().toUpperCase(), password });
      login(res.token, res.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.errors?.[0]?.msg || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-velo-header">
        <Link to="/" className="login-velo-brand">VELO</Link>
      </div>

      <div className="login-layout">
        {/* Left: Decorative panel */}
        <div className="login-decor-panel">
          <div className="login-decor-shapes" />
          <div className="login-decor-content">
            <span className="login-decor-icon">🔐</span>
            <p>Welcome back</p>
            <p className="login-decor-tagline">Sign in to access FASTag, fuel, insurance & more.</p>
          </div>
        </div>

        {/* Right: Login form card */}
        <div className="login-form-panel glass-card">
          <h1 className="auth-title">VELO</h1>
          <p className="auth-subtitle">Vehicle E-Services</p>
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="Enter vehicle number (e.g. KA01AB1234)"
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
