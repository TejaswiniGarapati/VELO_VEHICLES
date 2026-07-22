/**
 * FASTag Page
 * Left: FASTag Balance + Total Spent
 * Recharge History
 * Right: FASTag Recharge
 * Restricted for 2-Wheeler / 3-Wheeler
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { getVehicleVisibility } from '../utils/vehicleVisibility';
import './PaymentModules.css';
import './FASTag.css';

function formatDate(d) {
  if (!d) return '—';

  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Tollgate() {
  const { user } = useAuth();
  const visibility = getVehicleVisibility(user);

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
      console.error('Unable to load payment overview:', err);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     REFRESH OVERVIEW AFTER PAYMENT

     IMPORTANT:
     Do not use setLoading(true) here.
     PaymentModal must stay on screen so that
     the green success tick can be displayed.
  ======================================== */

  const refreshOverview = async () => {
    try {
      const res = await api.get('/payments/overview');
      setOverview(res);
    } catch (err) {
      console.error('Unable to refresh FASTag overview:', err);
    }
  };

  /* ========================================
     HANDLE FASTAG PAYMENT
  ======================================== */

  const handlePayment = async (paymentDetails) => {
    if (!vehicle) {
      const msg = 'No vehicle is configured for this account';

      setMessage(msg);
      throw new Error(msg);
    }

    if (['2W', '3W'].includes(vehicle.vehicleType)) {
      const msg =
        'FASTag services are not applicable for this vehicle.';

      setMessage(msg);
      throw new Error(msg);
    }

    setPaying(true);
    setMessage('');

    try {
      await api.post('/api/payments/tollgate', {
        amount: paymentDetails.amount,
        paymentMethod: paymentDetails.paymentMethod,
        vehicleId: vehicle._id,
      });

      /*
       * Refresh FASTag information without
       * removing PaymentModal.
       */

      await refreshOverview();

      /*
       * PaymentModal receives successful completion.
       * It will display:
       *
       * ✓
       * Payment successful
       * Your transaction completed. Closing...
       */

      return true;
    } catch (err) {
      const msg = err.message || 'FASTag recharge failed';

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
        <h1 className="page-title">FASTag</h1>

        <div className="payment-module card">
          <p>No vehicle is configured for this account.</p>
        </div>
      </div>
    );
  }

  /* ========================================
     FASTAG DATA
  ======================================== */

  const isRestricted =
    !visibility.showFASTag ||
    ['2W', '3W'].includes(vehicle.vehicleType);

  const tollgate = overview?.tollgate || {
    balance: 0,
    lastRecharge: 0,
  };

  const fastagBalance =
    vehicle.fastagBalance ??
    tollgate.balance ??
    0;

  const totalSpent =
    overview?.tollgate?.totalSpent ??
    0;

  const lastRechargeDate =
    vehicle.lastFastagRechargeDate ||
    overview?.tollgate?.lastRechargeDate;

  const lastRechargeAmount =
    vehicle.lastFastagRecharge ??
    tollgate.lastRecharge ??
    0;

  /* ========================================
     RESTRICTED VEHICLE
  ======================================== */

  if (isRestricted) {
    return (
      <div className="container page-container">
        <h1 className="page-title">FASTag</h1>

        <div className="fastag-restricted card">
          <p className="fastag-restricted-msg">
            FASTag services are not applicable for this vehicle.
          </p>

          <p className="fastag-restricted-hint">
            This applies to restricted vehicle classes and
            transport configurations.
          </p>
        </div>
      </div>
    );
  }

  /* ========================================
     FASTAG PAGE
  ======================================== */

  return (
    <div className="container page-container">
      <h1 className="page-title">FASTag</h1>

      <div className="fastag-layout">

        {/* =================================
            LEFT SECTION
        ================================= */}

        <div className="fastag-left">

          {/* FASTAG BALANCE */}

          <div className="fastag-box card">
            <h3>FASTag Balance</h3>

            <div className="fastag-value">
              ₹{fastagBalance}
            </div>

            <div className="info-item">
              <span className="label">
                Total Amount Spent
              </span>

              <span className="value">
                ₹{totalSpent}
              </span>
            </div>
          </div>

          {/* FASTAG RECHARGE HISTORY */}

          <div className="fastag-box card">
            <h3>FASTag Recharge History</h3>

            <div className="info-item">
              <span className="label">
                Last Recharge Date
              </span>

              <span className="value">
                {formatDate(lastRechargeDate)}
              </span>
            </div>

            <div className="info-item">
              <span className="label">
                Amount (₹)
              </span>

              <span className="value">
                ₹{lastRechargeAmount}
              </span>
            </div>
          </div>

        </div>

        {/* =================================
            RIGHT SECTION
        ================================= */}

        <div className="fastag-right">

          <div className="fastag-box card fastag-recharge-box">

            <h3>Recharge FASTag</h3>

            {/* SHOW PAYMENT ERROR ONLY */}

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
            >
              Recharge
            </button>

          </div>

        </div>

      </div>

      {/* ====================================
          PAYMENT MODAL
      ==================================== */}

      {modalOpen && (
        <PaymentModal
          title="FASTag Recharge"
          onClose={() => setModalOpen(false)}
          onConfirm={handlePayment}
          loading={paying}
          maxAmount={10000}
          showCaptcha
        />
      )}

    </div>
  );
}