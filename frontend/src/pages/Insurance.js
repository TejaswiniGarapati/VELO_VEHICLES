/**
 * Insurance Page
 * Box1: Last Paid Date, Valid Till Date.
 * Box2: Renewal - vehicle type (from logged-in user), amount, payment.
 * On success: Valid Till = +3 years from payment, Last Paid = payment date.
 */

import React, { useState, useEffect } from "react";
import api from "../services/api";
import PaymentModal from "../components/PaymentModal";
import { useAuth } from "../context/AuthContext";
import "./PaymentModules.css";
import "./Insurance.css";

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const VEHICLE_TYPE_LABELS = {
  "2W": "2 Wheeler",
  "3W": "3 Wheeler",
  "4W": "4 Wheeler",
  MEDIUM: "Medium Vehicle",
  LARGE: "Large Vehicle",
  HEAVY: "Heavy Vehicle",
};

export default function Insurance() {
  const { user } = useAuth();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [renewVehicleType, setRenewVehicleType] = useState("4W");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  /* Get vehicle type from logged-in user */
  useEffect(() => {
    if (user?.vehicleType) {
      setRenewVehicleType(user.vehicleType);
      return;
    }
    if (user?.vehicleClass === '2 Wheeler') setRenewVehicleType('2W');
    else if (user?.vehicleClass === '3 Wheeler') setRenewVehicleType('3W');
    else if (user?.vehicleClass) setRenewVehicleType('4W');
  }, [user]);

  /* Fetch insurance overview */
  useEffect(() => {
    api
      .get("/payments/overview")
      .then((res) => {
        setOverview(res);
      })
      .catch(() => {
        setOverview(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* Handle Insurance Payment */
  const handlePayment = async (paymentDetails) => {
    setPaying(true);
    setMessage("");

    try {
      await api.post("/payments/insurance", {
        amount: paymentDetails.amount,
        paymentMethod: paymentDetails.paymentMethod,
        vehicleType: renewVehicleType,
      });

      const paymentDate = new Date();
      const validTill = new Date(paymentDate);
      validTill.setFullYear(validTill.getFullYear() + 3);

      setMessage("Insurance renewed successfully!");

      setOverview((prev) => ({
        ...prev,
        insurance: {
          ...(prev?.insurance || {}),
          lastPaidDate: paymentDate.toISOString(),
          validTillDate: validTill.toISOString(),
          policyEnd: validTill.toISOString(),
          renewalAmount: paymentDetails.amount,
          lastRenewal: paymentDate.toISOString(),
        },
      }));
    } catch (err) {
      const msg = err.message || "Renewal failed";
      setMessage(msg);
      throw err;
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return <div className="container page-container">Loading...</div>;

  const ins = overview?.insurance || {};
  const lastPaid = ins.lastPaidDate || ins.lastRenewal || ins.policyEnd;
  const validTill = ins.validTillDate || ins.policyEnd;
  const renewalAmount = ins.renewalAmount || 5000;

  return (
    <div className="container page-container">
      <h1 className="page-title">Insurance</h1>

      <div className="insurance-layout">
        {/* Policy Details */}
        <div className="insurance-box card">
          <h3>Policy Details</h3>

          <div className="info-grid">
            <div className="info-item">
              <span className="label">Last Paid Date</span>
              <span className="value">{formatDate(lastPaid)}</span>
            </div>

            <div className="info-item">
              <span className="label">Valid Till Date</span>
              <span className="value">{formatDate(validTill)}</span>
            </div>
          </div>
        </div>

        {/* Renewal Section */}
        <div className="insurance-box card">
          <h3>Renewal</h3>

          {message && (
            <p
              className={
                message.includes("success") ? "success-msg" : "error-msg"
              }
            >
              {message}
            </p>
          )}

          <div className="form-group">
            <label>Vehicle Type</label>

            {/* Vehicle type locked from user profile */}
            <select value={renewVehicleType} disabled>
              {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Vehicle Number</label>
            <input type="text" readOnly value={user?.vehicleNumber || '—'} />
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="text" readOnly value={renewalAmount} />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            Renew Insurance
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {modalOpen && (
        <PaymentModal
          title="Renew Insurance"
          defaultAmount={renewalAmount}
          onClose={() => setModalOpen(false)}
          onConfirm={handlePayment}
          loading={paying}
        />
      )}
    </div>
  );
}