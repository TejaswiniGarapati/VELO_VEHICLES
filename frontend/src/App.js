/**
 * VELO - Vehicle E-Services
 * Main App with routing
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Authentication Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// User Pages
import Home from './pages/Home';
import Tollgate from './pages/Tollgate';
import Fuel from './pages/Fuel';
import Insurance from './pages/Insurance';
import Checkup from './pages/Checkup';
import Tax from './pages/Tax';
import Challan from './pages/Challan';
import Notifications from './pages/Notifications';
import Logistics from './pages/Logistics';

import { getVehicleVisibility } from './utils/vehicleVisibility';

// Admin
import AdminDashboard from './pages/AdminDashboard';

// Theme Context
export const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {}
});

// Layout wrapper for protected pages
function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main>
        {children}
      </main>
    </>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  const visibility = getVehicleVisibility(user);

  const [theme, setTheme] = useState(
    () => localStorage.getItem('velo-theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    localStorage.setItem('velo-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'light' ? 'dark' : 'light'
    );
  };

  // Show loading screen while authentication is checked
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="app">

        <Routes>

          {/* Default Route */}
          <Route
            path="/"
            element={
              user ? (
                <PrivateRoute>
                  <MainLayout>
                    <Home />
                  </MainLayout>
                </PrivateRoute>
              ) : (
                <Login />
              )
            }
          />

          {/* Login */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            }
          />

          {/* Signup */}
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Signup />
              )
            }
          />

          {/* Tollgate */}
          <Route
            path="/tollgate"
            element={
              <PrivateRoute>
                {visibility.showTollPayments ? (
                  <MainLayout>
                    <Tollgate />
                  </MainLayout>
                ) : (
                  <Navigate to="/" replace />
                )}
              </PrivateRoute>
            }
          />

          {/* FASTag */}
          <Route
            path="/fastag"
            element={
              <PrivateRoute>
                {visibility.showFASTag ? (
                  <MainLayout>
                    <Tollgate />
                  </MainLayout>
                ) : (
                  <Navigate to="/" replace />
                )}
              </PrivateRoute>
            }
          />

          {/* Fuel */}
          <Route
            path="/fuel"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Fuel />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Insurance */}
          <Route
            path="/insurance"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Insurance />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Vehicle Checkup */}
          <Route
            path="/checkup"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Checkup />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Tax */}
          <Route
            path="/tax"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Tax />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Challan */}
          <Route
            path="/challan"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Challan />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Logistics */}
          <Route
            path="/logistics"
            element={
              <PrivateRoute>
                {visibility.showLogistics ? (
                  <MainLayout>
                    <Logistics />
                  </MainLayout>
                ) : (
                  <Navigate to="/" replace />
                )}
              </PrivateRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Unknown Route */}
          <Route
            path="*"
            element={
              <Navigate
                to={user ? '/' : '/login'}
                replace
              />
            }
          />

        </Routes>

      </div>
    </ThemeContext.Provider>
  );
}