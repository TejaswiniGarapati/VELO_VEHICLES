/**
 * Environment Checkup Page
 * Box1: Last Checkup Date, Valid Up To Date.
 * Box2: Slot Booking - select date (only within next 3 days), vehicle type dropdown, fee by vehicle, payment (same as FASTag).
 * Post-payment: status Slot Booked / Slot Not Booked; if failed: amount refunded, notification.
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import './PaymentModules.css';
import './Checkup.css';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Fee by vehicle type (for slot booking)
const CHECKUP_FEES = { '2W': 200, '3W': 250, '4W': 300, 'MEDIUM': 400, 'LARGE': 500, 'HEAVY': 600 };

function getNextThreeDays() {
  const days = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function Checkup() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotDate, setSlotDate] = useState('');
  const [slotVehicleType, setSlotVehicleType] = useState('4W');
  const [modalOpen, setModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');
  const [slotStatus, setSlotStatus] = useState(null);

  const nextThreeDays = getNextThreeDays();
  const fee = CHECKUP_FEES[slotVehicleType] ?? 300;
  const effectiveSlotDate = slotDate || nextThreeDays[0];

  useEffect(() => {
    setSlotVehicleType(user?.vehicleType || '4W');
  }, [user]);

  useEffect(() => {
    api.get('/payments/overview')
      .then((res) => setOverview(res))
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (paymentDetails) => {
    setPaying(true);
    setMessage('');
    setSlotStatus(null);
    try {
      await api.post('/payments/checkup', {
        amount: paymentDetails.amount,
        paymentMethod: paymentDetails.paymentMethod,
        slotDate: effectiveSlotDate,
        vehicleType: slotVehicleType,
      });
      setSlotStatus('booked');
      setMessage('Slot booked successfully!');
    } catch (err) {
      setSlotStatus('not_booked');
      setMessage(err.message || 'Slot booking failed. Amount will be refunded and you will receive a notification.');
      throw err;
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="container page-container">Loading...</div>;

  const checkup = overview?.checkup || {};
  const lastDate = checkup.lastDate;
  const validUpTo = checkup.nextDate || checkup.validUpTo;

  return (
    <div className="container page-container">
      <h1 className="page-title">Environment Checkup</h1>

      <div className="checkup-layout">
        <div className="checkup-box card">
          <h3>Checkup Schedule</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Last Checkup Date</span>
              <span className="value">{formatDate(lastDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">Valid Up To Date</span>
              <span className="value">{formatDate(validUpTo)}</span>
            </div>
          </div>
        </div>

        <div className="checkup-box card">
          <h3>Slot Booking</h3>
          <p className="hint">Select a date within the next 3 days.</p>
          <div className="form-group">
            <label>Select Date</label>
            <select
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
            >
              <option value="">Choose date</option>
              {nextThreeDays.map((d) => (
                <option key={d} value={d}>{formatDate(d)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Vehicle Type</label>
            <select
              value={slotVehicleType}
              onChange={(e) => setSlotVehicleType(e.target.value)}
            >
              <option value="2W">2 Wheeler</option>
              <option value="3W">3 Wheeler</option>
              <option value="4W">4 Wheeler</option>
              <option value="MEDIUM">Medium Vehicle</option>
              <option value="LARGE">Large Vehicle</option>
              <option value="HEAVY">Heavy Vehicle</option>
            </select>
          </div>
          <div className="checkup-fee">
            Fee: <strong>₹{fee}</strong> (varies by vehicle type)
          </div>
          {message && <p className={message.includes('success') ? 'success-msg' : 'error-msg'}>{message}</p>}
          {slotStatus === 'booked' && (
            <div className="checkup-status booked">Slot Booked</div>
          )}
          {slotStatus === 'not_booked' && (
            <div className="checkup-status not-booked">
              Slot Not Booked. Amount will be refunded. Notification generated.
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            Book Slot
          </button>
        </div>
      </div>

      {modalOpen && (
        <PaymentModal
          title="Environment Checkup - Pay Slot Fee"
          defaultAmount={fee}
          onClose={() => setModalOpen(false)}
          onConfirm={handlePayment}
          loading={paying}
        />
      )}
    </div>
  );
}
