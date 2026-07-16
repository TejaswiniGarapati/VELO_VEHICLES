/**
 * Auth Context
 * Provides user state and login/logout/signup to whole app
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    vehicleNumber: userData.vehicleNumber || '',
    vehicleClass: userData.vehicleClass || '',
    vehicleUsage: userData.vehicleUsage || '',
    transportType: userData.transportType || '',
    logisticsAvailable: Boolean(userData.logisticsAvailable),
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load, check if we have a stored token and fetch user
  useEffect(() => {
    const token = localStorage.getItem('velo_token');
    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(normalizeUser(res.user));
        })
        .catch(() => {
          localStorage.removeItem('velo_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('velo_token', token);
    setUser(normalizeUser(userData));
  };

  const logout = () => {
    localStorage.removeItem('velo_token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(normalizeUser(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
