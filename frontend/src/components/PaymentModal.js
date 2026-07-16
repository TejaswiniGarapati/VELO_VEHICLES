/**
 * Payment Modal - Used by FASTag, Insurance, Challan, Checkup, etc.
 * Amount (optional max e.g. 10000), CAPTCHA (optional), mandatory payment method:
 * UPI (Paytm, Google Pay, PhonePe), Bank Transfer (dropdown), Card (number, expiry, CVV).
 * Buttons: PAY, CANCEL.
 */
import React, { useState, useMemo } from 'react';
import './PaymentModal.css';

function getCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `${a} + ${b} = ?`, answer: String(a + b) };
}

const UPI_OPTIONS = [
  { id: 'paytm', label: 'Paytm' },
  { id: 'gpay', label: 'Google Pay' },
  { id: 'phonepe', label: 'PhonePe' },
];

const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Other',
];

export default function PaymentModal({
  title,
  onClose,
  onConfirm,
  loading,
  defaultAmount,
  maxAmount = null,
  showCaptcha = false,
}) {
  const [amount, setAmount] = useState(defaultAmount != null ? String(defaultAmount) : '');
  const [method, setMethod] = useState('upi');
  const [upiOption, setUpiOption] = useState('paytm');
  const [bank, setBank] = useState(BANKS[0]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [captcha, setCaptcha] = useState(() => getCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [methodError, setMethodError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const amountNum = useMemo(() => (amount ? parseFloat(amount) : 0), [amount]);
  const amountValid = amountNum > 0 && (maxAmount == null || amountNum <= maxAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCaptchaError('');
    setMethodError('');
    setSubmitError('');

    if (!amountValid) return;
    if (maxAmount != null && amountNum > maxAmount) return;

    if (showCaptcha && captchaInput !== captcha.answer) {
      setCaptchaError('CAPTCHA incorrect');
      return;
    }

    const paymentDetails = {
      amount: amountNum,
      paymentMethod: method,
      upiOption: method === 'upi' ? upiOption : undefined,
      bank: method === 'bank' ? bank : undefined,
      cardLast4: method === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
    };

    setSubmitting(true);
    try {
      await Promise.resolve(onConfirm(paymentDetails));
      setPaymentSuccess(true);
      window.setTimeout(() => {
        setPaymentSuccess(false);
        setCaptchaInput('');
        setCaptchaError('');
        setSubmitError('');
        onClose();
      }, 2000);
    } catch (err) {
      setSubmitError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaptchaInput('');
    setCaptchaError('');
    setSubmitError('');
    setPaymentSuccess(false);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        if (submitting || paymentSuccess) return;
        handleClose();
      }}
    >
      <div className="modal-box payment-modal-box glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            disabled={submitting || paymentSuccess}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {paymentSuccess ? (
          <div className="payment-success-state" role="status">
            <div className="payment-success-icon" aria-hidden>✓</div>
            <p className="payment-success-title">Payment successful</p>
            <p className="payment-success-sub">Your transaction completed. Closing…</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount (₹) {maxAmount != null && `(max ₹${maxAmount.toLocaleString()})`}</label>
            <input
              type="number"
              min="1"
              max={maxAmount != null ? maxAmount : undefined}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
            {maxAmount != null && amountNum > maxAmount && (
              <span className="error-msg">Maximum amount is ₹{maxAmount.toLocaleString()}</span>
            )}
          </div>

          <div className="form-group">
            <label>Payment Method *</label>
            <div className="payment-method-tabs">
              {['upi', 'bank', 'card'].map((m) => (
                <label key={m} className={`payment-tab ${method === m ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                  />
                  <span>{m === 'upi' ? 'UPI' : m === 'bank' ? 'Bank Transfer' : 'Card'}</span>
                </label>
              ))}
            </div>

            {method === 'upi' && (
              <div className="payment-sub-options">
                {UPI_OPTIONS.map((opt) => (
                  <label key={opt.id} className="radio-option small">
                    <input
                      type="radio"
                      name="upiOption"
                      value={opt.id}
                      checked={upiOption === opt.id}
                      onChange={() => setUpiOption(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {method === 'bank' && (
              <div className="payment-sub-options">
                <select value={bank} onChange={(e) => setBank(e.target.value)}>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {method === 'card' && (
              <div className="payment-sub-options card-fields">
                <input
                  type="text"
                  placeholder="Card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  maxLength={16}
                />
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>
            )}
          </div>

          {showCaptcha && (
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
          )}

          {methodError && <p className="error-msg">{methodError}</p>}
          {submitError && <p className="error-msg">{submitError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting || loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loading || !amountValid || (maxAmount != null && amountNum > maxAmount)}
            >
              {submitting || loading ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
