/**
 * E-Challans Page
 * Selection: Vehicle Number / Challan Number / Phone Number (radio).
 * Input + CAPTCHA -> SHOW CHALLANS.
 * Results: New Challans & Old Challans. Each card: number, amount, date, status, PAY.
 * Payment same as FASTag; result dialog: Payment Successful / Unsuccessful.
 */
import React, { useState, useMemo } from 'react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import './PaymentModules.css';
import './Challan.css';

function getCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Demo data; backend can replace
const DEMO_CHALLANS = [
  { id: '1', challanNumber: 'CH001', description: 'Over speeding', amount: 1000, paid: false, date: new Date().toISOString(), status: 'Pending' },
  { id: '2', challanNumber: 'CH002', description: 'No helmet', amount: 500, paid: true, date: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Paid' },
  { id: '3', challanNumber: 'CH003', description: 'Signal violation', amount: 1500, paid: false, date: new Date(Date.now() - 86400000 * 45).toISOString(), status: 'Pending' },
];

export default function Challan() {
  const [searchType, setSearchType] = useState('vehicle');
  const [searchInput, setSearchInput] = useState('');
  const [captcha, setCaptcha] = useState(() => getCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [challans, setChallans] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  const handleShowChallans = (e) => {
    e.preventDefault();
    setCaptchaError('');
    if (captchaInput !== captcha.answer) {
      setCaptchaError('CAPTCHA incorrect');
      return;
    }
    setLoading(true);
    setSearched(true);
    api.get('/payments/overview')
      .then((res) => {
        const list = res.challans && res.challans.length ? res.challans : DEMO_CHALLANS;
        setChallans(Array.isArray(list) ? list : DEMO_CHALLANS);
      })
      .catch(() => setChallans(DEMO_CHALLANS))
      .finally(() => setLoading(false));
  };

  const handlePayment = async (paymentDetails) => {
    setPaying(true);
    setMessage('');
    setPaymentResult(null);
    try {
      await api.post('/payments/challan', {
        amount: paymentDetails.amount,
        paymentMethod: paymentDetails.paymentMethod,
        description: selectedChallan?.description || 'E-Challan',
      });
      setMessage('Challan paid successfully!');
      setPaymentResult('success');
      setChallans((prev) =>
        prev.map((c) =>
          (c.id === selectedChallan?.id || c._id === selectedChallan?._id) ? { ...c, paid: true, status: 'Paid' } : c
        )
      );
      setSelectedChallan(null);
    } catch (err) {
      setMessage(err.message || 'Payment failed');
      setPaymentResult('failed');
      throw err;
    } finally {
      setPaying(false);
    }
  };

  const openPayModal = (challan) => {
    if (challan.paid) return;
    setSelectedChallan(challan);
    setModalOpen(true);
    setPaymentResult(null);
  };

  const now = Date.now();
  const thirtyDays = 30 * 86400000;
  const newChallans = useMemo(() => challans.filter((c) => !c.paid && (new Date(c.date).getTime() > now - thirtyDays)), [challans]);
  const oldChallans = useMemo(() => challans.filter((c) => !c.paid && (new Date(c.date).getTime() <= now - thirtyDays)), [challans]);
  const paidChallans = useMemo(() => challans.filter((c) => c.paid), [challans]);

  return (
    <div className="container page-container">
      <h1 className="page-title">E-Challans</h1>

      <div className="challan-search-card card">
        <h3>Search Challans</h3>
        <form onSubmit={handleShowChallans}>
          <div className="challan-search-type">
            {['vehicle', 'challan', 'phone'].map((type) => (
              <label key={type} className="radio-option">
                <input
                  type="radio"
                  name="searchType"
                  value={type}
                  checked={searchType === type}
                  onChange={() => setSearchType(type)}
                />
                <span>
                  {type === 'vehicle' ? 'Vehicle Number' : type === 'challan' ? 'Challan Number' : 'Phone Number'}
                </span>
              </label>
            ))}
          </div>
          <div className="form-group">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                searchType === 'vehicle'
                  ? 'e.g. KA01AB1234'
                  : searchType === 'challan'
                  ? 'Challan number'
                  : 'Phone number'
              }
            />
          </div>
          <div className="form-group captcha-group">
            <label>CAPTCHA *</label>
            <div className="captcha-box">
              <span className="captcha-question">{captcha.question}</span>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(''); }}
                placeholder="Answer"
              />
            </div>
            {captchaError && <span className="error-msg">{captchaError}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Show Challans'}
          </button>
        </form>
      </div>

      {message && (
        <p className={message.includes('success') ? 'success-msg' : 'error-msg'}>{message}</p>
      )}

      {paymentResult === 'success' && (
        <div className="challan-result-dialog card success">
          <strong>Payment Successful</strong>
          <p>Your challan payment was processed successfully.</p>
        </div>
      )}
      {paymentResult === 'failed' && (
        <div className="challan-result-dialog card error">
          <strong>Payment Unsuccessful</strong>
          <p>Please try again or use another payment method.</p>
        </div>
      )}

      {searched && (
        <>
          <section className="challan-section">
            <h3>New Challans</h3>
            {newChallans.length === 0 ? (
              <p className="challan-empty">No new pending challans.</p>
            ) : (
              <div className="challan-list">
                {newChallans.map((c) => (
                  <div key={c.id || c._id} className="challan-item card">
                    <div className="challan-card-body">
                      <span className="challan-num">{c.challanNumber || c.id || '—'}</span>
                      <span className="challan-amount">₹{c.amount}</span>
                      <span className="challan-date">{formatDate(c.date)}</span>
                      <span className={`challan-status ${c.paid ? 'paid' : 'pending'}`}>
                        {c.status || (c.paid ? 'Paid' : 'Pending')}
                      </span>
                    </div>
                    {!c.paid && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => openPayModal(c)}>
                        Pay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="challan-section">
            <h3>Old Challans</h3>
            {oldChallans.length === 0 ? (
              <p className="challan-empty">No old pending challans.</p>
            ) : (
              <div className="challan-list">
                {oldChallans.map((c) => (
                  <div key={c.id || c._id} className="challan-item card">
                    <div className="challan-card-body">
                      <span className="challan-num">{c.challanNumber || c.id || '—'}</span>
                      <span className="challan-amount">₹{c.amount}</span>
                      <span className="challan-date">{formatDate(c.date)}</span>
                      <span className={`challan-status ${c.paid ? 'paid' : 'pending'}`}>
                        {c.status || (c.paid ? 'Paid' : 'Pending')}
                      </span>
                    </div>
                    {!c.paid && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => openPayModal(c)}>
                        Pay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {modalOpen && selectedChallan && (
        <PaymentModal
          title={`Pay Challan: ${selectedChallan.description || selectedChallan.challanNumber || 'Challan'}`}
          defaultAmount={selectedChallan.amount}
          onClose={() => {
            setModalOpen(false);
            setSelectedChallan(null);
          }}
          onConfirm={handlePayment}
          loading={paying}
        />
      )}
    </div>
  );
}
