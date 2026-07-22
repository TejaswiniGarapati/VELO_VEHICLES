/**
 * Fuel Payment Page
 * Requires vehicle selection
 * Disables Fuel payment for 2-Wheeler / 3-Wheeler
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import './PaymentModules.css';

export default function Fuel() {
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const [message, setMessage] = useState('');

  /* ========================================
     LOAD DEFAULT VEHICLE
  ======================================== */

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const v = await api.get('/users/vehicle/default');

        setVehicle(v);
      } catch (err) {
        console.error('Unable to load vehicle:', err);

        setVehicle(null);
      } finally {
        setVehiclesLoading(false);
      }
    };

    loadVehicle();
  }, []);

  /* ========================================
     LOAD INITIAL PAYMENT OVERVIEW
  ======================================== */

  useEffect(() => {
    if (vehicle) {
      loadOverview();
    }
  }, [vehicle]);

  const loadOverview = async () => {
    setLoading(true);

    try {
      const res = await api.get('/payments/overview');

      setOverview(res);
    } catch (err) {
      console.error('Unable to load fuel overview:', err);

      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     REFRESH OVERVIEW AFTER PAYMENT

     IMPORTANT:
     Do not use setLoading(true) here.
     PaymentModal must remain visible so the
     green success tick can be displayed.
  ======================================== */

  const refreshOverview = async () => {
    try {
      const res = await api.get('/payments/overview');

      setOverview(res);
    } catch (err) {
      console.error('Unable to refresh fuel overview:', err);
    }
  };

  /* ========================================
     HANDLE FUEL PAYMENT
  ======================================== */

  const handlePayment = async ({ amount, paymentMethod }) => {
    if (!vehicle) {
      const msg = 'No vehicle is configured for this account';

      setMessage(msg);

      throw new Error(msg);
    }

    if (['2W', '3W'].includes(vehicle.vehicleType)) {
      const msg =
        'Fuel payment is not applicable for 2-Wheeler and 3-Wheeler vehicles';

      setMessage(msg);

      throw new Error(msg);
    }

    setPaying(true);
    setMessage('');

    try {
      await api.post('/api/payments/fuel', {
        amount,
        paymentMethod,
        vehicleId: vehicle._id,
      });

      /*
       * Refresh payment information without
       * changing the whole page to Loading...
       */

      await refreshOverview();

      /*
       * Do not set a success message here.
       *
       * PaymentModal will display:
       *
       * ✓
       * Payment successful
       * Your transaction completed. Closing...
       */

      return true;
    } catch (err) {
      const msg = err.message || 'Fuel payment failed';

      setMessage(msg);

      throw err;
    } finally {
      setPaying(false);
    }
  };

  /* ========================================
     INITIAL LOADING
  ======================================== */

  if (vehiclesLoading || loading) {
    return (
      <div className="container page-container">
        Loading...
      </div>
    );
  }

  /* ========================================
     NO VEHICLE
  ======================================== */

  if (!vehicle) {
    return (
      <div className="container page-container">
        <h1 className="page-title">
          Fuel Payments
        </h1>

        <div className="payment-module card">
          <p>
            No vehicle is configured for this account.
          </p>
        </div>
      </div>
    );
  }

  /* ========================================
     FUEL DATA
  ======================================== */

  const isTwoWheeler = ['2W', '3W'].includes(
    vehicle.vehicleType
  );

  const fuel = overview?.fuel || {
    balance: 0,
    lastAmount: 0,
  };

  const fuelBalance =
    vehicle.fuelWalletBalance ??
    fuel.balance ??
    0;

  /* ========================================
     FUEL PAGE
  ======================================== */

  return (
    <div className="container page-container">

      <h1 className="page-title">
        Fuel Payments
      </h1>

      {/* ====================================
          VEHICLE INFORMATION
      ==================================== */}

      <div
        className="payment-module card"
        style={{ marginBottom: '1rem' }}
      >
        <h3>Selected Vehicle</h3>

        <div className="info-grid">

          <div className="info-item">
            <span className="label">
              Vehicle Number
            </span>

            <span className="value">
              {user?.vehicleNumber ||
                vehicle.vehicleNumber}
            </span>
          </div>

          <div className="info-item">
            <span className="label">
              Vehicle Type
            </span>

            <span className="value">
              {vehicle.vehicleType === '2W'
                ? '2 Wheeler'
                : vehicle.vehicleType === '3W'
                ? '3 Wheeler'
                : vehicle.vehicleType === '4W'
                ? '4 Wheeler'
                : 'Large Vehicle'}
            </span>
          </div>

        </div>
      </div>

      {/* ====================================
          FUEL PAYMENT SECTION
      ==================================== */}

      <div className="payment-module card">

        <h3>Fuel Wallet</h3>

        {isTwoWheeler ? (

          <div className="reminder-box">
            <strong>
              FASTag and Fuel payments are not applicable
              for 2-Wheeler and 3-Wheeler vehicles.
            </strong>
          </div>

        ) : (

          <>

            <div className="info-grid">

              <div className="info-item">
                <span className="label">
                  Current Fuel Wallet Balance
                </span>

                <span className="value">
                  ₹{fuelBalance}
                </span>
              </div>

              <div className="info-item">
                <span className="label">
                  Last Spent Amount
                </span>

                <span className="value">
                  ₹{fuel.lastAmount ?? 0}
                </span>
              </div>

            </div>

            {/* SHOW ERROR MESSAGE ONLY */}

            {message && (
              <p className="error-msg">
                {message}
              </p>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setMessage('');
                setModalOpen(true);
              }}
              disabled={isTwoWheeler}
            >
              Make Fuel Payment
            </button>

          </>

        )}

      </div>

      {/* ====================================
          PAYMENT MODAL
      ==================================== */}

      {modalOpen && !isTwoWheeler && (
        <PaymentModal
          title="Fuel Payment"
          onClose={() => setModalOpen(false)}
          onConfirm={handlePayment}
          loading={paying}
        />
      )}

    </div>
  );
}