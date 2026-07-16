/**
 * Navbar - VELO top-left, nav links, Notifications, Logout top-right.
 * Hide FASTag & Fuel for 2W/3W; show Logistics only for Transport/Goods Carrier.
 */
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVehicleVisibility } from '../utils/vehicleVisibility';
import { ThemeContext } from '../App';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibility = getVehicleVisibility(user);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(visibility.showFASTag ? [{ path: '/fastag', label: 'FASTag' }] : []),
    { path: '/fuel', label: 'Fuel' },
    { path: '/insurance', label: 'Insurance' },
    { path: '/checkup', label: 'Environment Checkup' },
    { path: '/tax', label: 'Tax' },
    { path: '/challan', label: 'E-Challans' },
    ...(visibility.showLogistics ? [{ path: '/logistics', label: 'Logistics' }] : []),
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          VELO
        </Link>
        <nav className="navbar-menu">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/notifications" className="nav-link nav-icon" title="Notifications">
            🔔 Notifications
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button type="button" className="btn btn-secondary nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
