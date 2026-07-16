/**
 * Landing Page - Shown when user is NOT logged in
 * Header: VELO (top-left), Login + Register (top-right)
 * Hero: FASTag, Fuel, Insurance, Vehicles imagery + description
 */
import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Global header: VELO top-left, Login/Register top-right */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-brand">
            VELO
          </Link>
          <nav className="landing-nav">
            <Link to="/login" className="landing-btn landing-btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="landing-btn landing-btn-primary">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content - centered hero */}
      <main className="landing-main">
        <div className="landing-hero">
          <h1 className="landing-hero-title">VELO</h1>
          <p className="landing-hero-tagline">
            Smart vehicle e-services platform
          </p>
          <p className="landing-hero-desc">
            VELO is a smart vehicle e-services platform for FASTag, fuel,
            insurance, vehicle management, and compliance in one place.
          </p>
        </div>

        {/* Hero section with vehicle-related imagery */}
        <div className="landing-cards">
          <div className="landing-card glass-card">
            <div className="landing-card-icon">🏷️</div>
            <h3>FASTag</h3>
            <p>Recharge and manage toll payments seamlessly.</p>
          </div>
          <div className="landing-card glass-card">
            <div className="landing-card-icon">⛽</div>
            <h3>Fuel</h3>
            <p>Digital fuel payments and wallet.</p>
          </div>
          <div className="landing-card glass-card">
            <div className="landing-card-icon">🛡️</div>
            <h3>Insurance</h3>
            <p>Renew insurance and stay compliant.</p>
          </div>
          <div className="landing-card glass-card">
            <div className="landing-card-icon">🚗</div>
            <h3>Vehicles</h3>
            <p>Manage all your vehicles in one place.</p>
          </div>
        </div>

        <div className="landing-cta">
          <Link to="/signup" className="landing-btn landing-btn-primary landing-cta-btn">
            Get Started
          </Link>
          <Link to="/login" className="landing-btn landing-btn-secondary landing-cta-btn">
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
