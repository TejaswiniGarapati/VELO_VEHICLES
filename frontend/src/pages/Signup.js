/**
 * Signup Page
 * Left: Signup form (name, phone, email, password, CAPTCHA, vehicle fields)
 * Right: Decorative panel (light blue gradient / abstract)
 * Vehicle Type (radio), Vehicle Registration (10 char format), Vehicle Usage (radio)
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';
import './Signup.css';

function getCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

// Validate vehicle registration: 2 letters + 2 digits + 2 letters + 4 digits (e.g. KA01AB1234)
function validateVehicleReg(reg) {
  if (!reg || reg.length !== 10) return false;
  const part1 = /^[A-Z]{2}$/.test(reg.slice(0, 2));
  const part2 = /^\d{2}$/.test(reg.slice(2, 4));
  const part3 = /^[A-Z]{2}$/.test(reg.slice(4, 6));
  const part4 = /^\d{4}$/.test(reg.slice(6, 10));
  return part1 && part2 && part3 && part4;
}

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    vehicleRegistrationNumber: '',
  });
  const [vehicleClass, setVehicleClass] = useState('');
  const [vehicleUsage, setVehicleUsage] = useState('');
  const [transportType, setTransportType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [logisticsAvailable, setLogisticsAvailable] = useState('');

  const [captcha, setCaptcha] = useState(() => getCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'vehicleRegistrationNumber') {
      val = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
    setForm((prev) => ({ ...prev, [name]: val }));
    if (name === 'vehicleRegistrationNumber') setVehicleNumber(val);
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = 'First name is required';
    if (!form.lastName.trim()) err.lastName = 'Last name is required';
    if (!form.phone.trim()) err.phone = 'Phone is required';
    if (!form.email.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email';
    if (!form.password) err.password = 'Password is required';
    else if (form.password.length < 6) err.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Passwords do not match';
    if (captchaInput !== captcha.answer) err.captcha = 'CAPTCHA answer is incorrect';

    // Vehicle fields - now mandatory
    if (!form.vehicleRegistrationNumber) {
      err.vehicleRegistrationNumber = 'Vehicle registration number is required';
    } else if (form.vehicleRegistrationNumber.length !== 10) {
      err.vehicleRegistrationNumber = 'Must be exactly 10 characters (e.g. KA01AB1234)';
    } else if (!validateVehicleReg(form.vehicleRegistrationNumber)) {
      err.vehicleRegistrationNumber = 'Format: 2 letters (state) + 2 digits + 2 letters + 4 digits';
    }
    if (!vehicleClass) err.vehicleClass = 'Vehicle class is required';
    if (!vehicleUsage) err.vehicleUsage = 'Vehicle usage is required';
    if (!transportType) err.transportType = 'Transport type is required';
    if (transportType === 'Goods Carrier' && !logisticsAvailable) {
      err.logisticsAvailable = 'Please specify logistics availability';
    }

    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        captchaAnswer: captchaInput,
        vehicleNumber: vehicleNumber,
        vehicleClass,
        vehicleUsage,
        transportType,
        logisticsAvailable: transportType === 'Goods Carrier' ? logisticsAvailable === 'Yes' : false,
      };

      const res = await api.post('/auth/signup', payload);
      login(res.token, res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.message ||
          (Array.isArray(err.errors) && err.errors[0]?.msg) ||
          'Registration failed'
      );
      setCaptcha(getCaptcha());
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      {/* Header: VELO top-left */}
      <div className="signup-velo-header">
        <Link to="/" className="signup-velo-brand">VELO</Link>
      </div>

      <div className="signup-layout">
        {/* Left: Form card */}
        <div className="signup-form-panel glass-card">
          <h1 className="auth-title">VELO</h1>
          <p className="auth-subtitle">Create Account</p>
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row three-cols">
              <div className="form-group">
                <label>First Name *</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
                {fieldErrors.firstName && <span className="error-msg">{fieldErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                {fieldErrors.lastName && <span className="error-msg">{fieldErrors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
              {fieldErrors.phone && <span className="error-msg">{fieldErrors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
              {fieldErrors.email && <span className="error-msg">{fieldErrors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
                {fieldErrors.password && <span className="error-msg">{fieldErrors.password}</span>}
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm" />
                {fieldErrors.confirmPassword && <span className="error-msg">{fieldErrors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Vehicle Number *</label>
              <input
                name="vehicleRegistrationNumber"
                value={form.vehicleRegistrationNumber}
                onChange={handleChange}
                placeholder="e.g. KA01AB1234"
                maxLength={10}
              />
              <span className="hint-text">
                Format: 2 letters (state) + 2 digits + 2 letters + 4 digits (e.g. KA01AB1234)
              </span>
              {fieldErrors.vehicleRegistrationNumber && <span className="error-msg">{fieldErrors.vehicleRegistrationNumber}</span>}
            </div>

            <div className="form-group">
              <label>Vehicle Class *</label>
              <div className="radio-row">
                {['2 Wheeler', '3 Wheeler', '4 Wheeler', 'Other Vehicles'].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="vehicleClass"
                      value={option}
                      checked={vehicleClass === option}
                      onChange={(e) => {
                        setVehicleClass(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, vehicleClass: '' }));
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {fieldErrors.vehicleClass && <span className="error-msg">{fieldErrors.vehicleClass}</span>}
            </div>

            <div className="form-group">
              <label>Vehicle Usage *</label>
              <div className="radio-row">
                {['Commercial', 'Non Commercial'].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="vehicleUsage"
                      value={option}
                      checked={vehicleUsage === option}
                      onChange={(e) => {
                        setVehicleUsage(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, vehicleUsage: '' }));
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {fieldErrors.vehicleUsage && <span className="error-msg">{fieldErrors.vehicleUsage}</span>}
            </div>

            <div className="form-group">
              <label>Transport Type *</label>
              <div className="radio-row">
                {['Passenger', 'Goods Carrier'].map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="transportType"
                      value={option}
                      checked={transportType === option}
                      onChange={(e) => {
                        setTransportType(e.target.value);
                        if (e.target.value !== 'Goods Carrier') setLogisticsAvailable('');
                        setFieldErrors((prev) => ({ ...prev, transportType: '', logisticsAvailable: '' }));
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
              {fieldErrors.transportType && <span className="error-msg">{fieldErrors.transportType}</span>}
            </div>

            {transportType === 'Goods Carrier' && (
              <div className="form-group">
                <label>Logistics Available *</label>
                <div className="radio-row">
                  {['Yes', 'No'].map((option) => (
                    <label key={option}>
                      <input
                        type="radio"
                        name="logisticsAvailable"
                        value={option}
                        checked={logisticsAvailable === option}
                        onChange={(e) => {
                          setLogisticsAvailable(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, logisticsAvailable: '' }));
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {fieldErrors.logisticsAvailable && <span className="error-msg">{fieldErrors.logisticsAvailable}</span>}
              </div>
            )}

            <div className="form-group captcha-group">
              <label>CAPTCHA Verification *</label>
              <div className="captcha-box">
                <span className="captcha-question">{captcha.question}</span>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Your answer"
                  className="captcha-input"
                />
              </div>
              {fieldErrors.captcha && <span className="error-msg">{fieldErrors.captcha}</span>}
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        {/* Right: Decorative panel */}
        <div className="signup-decor-panel">
          <div className="signup-decor-shapes" />
          <div className="signup-decor-content">
            <span className="signup-decor-icon">🚗</span>
            <p>Vehicle E-Services</p>
            <p className="signup-decor-tagline">One platform for FASTag, fuel, insurance & compliance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
