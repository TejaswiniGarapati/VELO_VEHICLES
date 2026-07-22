/**
 * Tax Payments - Vehicle tax details, payment option
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import './PaymentModules.css';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Tax() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/payments/overview')
      .then((res) => setOverview(res))
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async ({ amount, paymentMethod }) => {
    setPaying(true);
    setMessage('');
    try {
      await api.post('/api/payments/tax', { amount, paymentMethod });
      setMessage('Tax paid successfully!');
      setOverview((prev) => prev ? {
        ...prev,
        tax: { ...prev.tax, paid: true, amount: amount },
      } : null);
    } catch (err) {
      setMessage(err.message || 'Payment failed');
      throw err;
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="container page-container">Loading...</div>;

  const tax = overview?.tax || { amount: 0, dueDate: null, paid: false };

  return (
    <div className="container page-container">
      <h1 className="page-title">Tax Payments</h1>
      <div className="payment-module card">
        <h3>Vehicle Tax</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Tax Amount</span>
            <span className="value">₹{tax.amount || 0}</span>
          </div>
          <div className="info-item">
            <span className="label">Due Date</span>
            <span className="value">{formatDate(tax.dueDate)}</span>
          </div>
          <div className="info-item">
            <span className="label">Status</span>
            <span className="value">{tax.paid ? 'Paid' : 'Pending'}</span>
          </div>
        </div>
        {message && <p className={message.includes('success') ? 'success-msg' : 'error-msg'}>{message}</p>}
        {!tax.paid && (
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            Pay Tax
          </button>
        )}
      </div>
      {modalOpen && (
        <PaymentModal
          title="Pay Vehicle Tax"
          onClose={() => setModalOpen(false)}
          onConfirm={handlePayment}
          loading={paying}
        />
      )}
    </div>
  );
}
