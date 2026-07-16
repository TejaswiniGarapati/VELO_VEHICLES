/**
 * User Home Page (after login)
 * VELO branding in Navbar. Hero banner, descriptive content for FASTag, Fuel, Insurance, Compliance, Vehicle management.
 * Quick links respect vehicle type: hide FASTag & Fuel for 2W/3W.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVehicleVisibility } from '../utils/vehicleVisibility';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const displayName = user?.firstName || user?.fullName || 'User';
  const visibility = getVehicleVisibility(user);

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero banner */}
        <section className="home-hero glass-card">
          <div className="home-hero-content">
            <h1 className="home-welcome">Welcome, {displayName}</h1>
            <p className="home-subtitle">
              Manage your vehicle services in one place.
            </p>
            <p className="home-hero-desc">
              VELO brings FASTag, fuel payments, insurance, compliance, and vehicle management together on a single platform.
            </p>
          </div>
          <div className="home-hero-visual">
            <span className="home-hero-icon">🚗</span>
            <span className="home-hero-icon">💳</span>
          </div>
        </section>

        {/* Descriptive content blocks */}
        <section className="home-sections">
          {visibility.showFASTag && (
            <div className="home-section-card glass-card">
              <span className="home-section-icon">🏷️</span>
              <h3>FASTag</h3>
              <p>Recharge your FASTag and pay tolls seamlessly. View balance and recharge history.</p>
              <Link to="/tollgate" className="home-section-link">Go to FASTag →</Link>
            </div>
          )}
          <div className="home-section-card glass-card">
            <span className="home-section-icon">⛽</span>
            <h3>Fuel Payments</h3>
            <p>Digital fuel wallet and payments at partner pumps.</p>
            <Link to="/fuel" className="home-section-link">Go to Fuel →</Link>
          </div>
          <div className="home-section-card glass-card">
            <span className="home-section-icon">🛡️</span>
            <h3>Insurance & Compliance</h3>
            <p>Renew insurance and keep your vehicle compliant. Track policy and validity.</p>
            <Link to="/insurance" className="home-section-link">Go to Insurance →</Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-links">
          <h2>Quick Actions</h2>
          <div className="quick-grid">
            {visibility.showFASTag && <Link to="/tollgate" className="quick-card glass-card">Recharge FASTag</Link>}
            <Link to="/fuel" className="quick-card glass-card">Fuel Payment</Link>
            <Link to="/insurance" className="quick-card glass-card">Renew Insurance</Link>
            <Link to="/tax" className="quick-card glass-card">Pay Tax</Link>
            <Link to="/challan" className="quick-card glass-card">E-Challan</Link>
            <Link to="/checkup" className="quick-card glass-card">Environment Checkup</Link>
            {visibility.showLogistics && <Link to="/logistics" className="quick-card glass-card">Logistics</Link>}
          </div>
        </section>
      </div>
    </div>
  );
}
