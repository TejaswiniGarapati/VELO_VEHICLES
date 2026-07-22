/**
 * VELO - Goods Carrier Logistics
 * Additional feature only for Goods Carrier vehicles.
 */

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Logistics.css';

export default function Logistics() {
  const { user } = useAuth();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    goodsType: '',
    pickupLocation: '',
    destination: '',
    goodsWeight: '',
    customerName: '',
    customerPhone: '',
    transportCharge: '',
  });

  const isGoodsCarrier =
    user?.transportType === 'Goods Carrier';

  useEffect(() => {
    if (isGoodsCarrier) {
      loadDeliveries();
    } else {
      setLoading(false);
    }
  }, [isGoodsCarrier]);

  const loadDeliveries = async () => {
    setLoading(true);

    try {
      const res = await api.get('/logistics');

      setDeliveries(
        Array.isArray(res) ? res : res.deliveries || []
      );
    } catch (err) {
      setMessage(
        err.message || 'Unable to load logistics information'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();

    setMessage('');

    try {
      await api.post('/logistics', {
        goodsType: form.goodsType,
        pickupLocation: form.pickupLocation,
        destination: form.destination,
        goodsWeight: Number(form.goodsWeight),
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        transportCharge: Number(form.transportCharge),
      });

      setForm({
        goodsType: '',
        pickupLocation: '',
        destination: '',
        goodsWeight: '',
        customerName: '',
        customerPhone: '',
        transportCharge: '',
      });

      setMessage('Transport job created successfully');

      await loadDeliveries();
    } catch (err) {
      setMessage(
        err.message || 'Unable to create transport job'
      );
    }
  };

  const updateStatus = async (deliveryId, status) => {
    setMessage('');

    try {
      await api.patch(
        `/logistics/${deliveryId}/status`,
        {
          status,
        }
      );

      await loadDeliveries();
    } catch (err) {
      setMessage(
        err.message || 'Unable to update delivery status'
      );
    }
  };

  if (!isGoodsCarrier) {
    return (
      <div className="container page-container">
        <h1 className="page-title">Logistics</h1>

        <div className="logistics-restricted card">
          <h3>Logistics Unavailable</h3>

          <p>
            Logistics services are available only for
            Goods Carrier vehicles.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container page-container">
        Loading Logistics...
      </div>
    );
  }

  const activeDeliveries = deliveries.filter(
    (delivery) => delivery.status !== 'DELIVERED'
  );

  const deliveryHistory = deliveries.filter(
    (delivery) => delivery.status === 'DELIVERED'
  );

  return (
    <div className="container page-container">
      <h1 className="page-title">
        Goods Carrier Logistics
      </h1>

      {message && (
        <p className="logistics-message">
          {message}
        </p>
      )}

      <div className="logistics-vehicle card">
        <h3>Goods Carrier Vehicle</h3>

        <div className="info-grid">
          <div className="info-item">
            <span className="label">
              Vehicle Number
            </span>

            <span className="value">
              {user?.vehicleNumber || '—'}
            </span>
          </div>

          <div className="info-item">
            <span className="label">
              Transport Type
            </span>

            <span className="value">
              {user?.transportType || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="logistics-create card">
        <h3>Create Transport Job</h3>

        <form
          className="logistics-form"
          onSubmit={handleCreateDelivery}
        >
          <input
            type="text"
            name="goodsType"
            value={form.goodsType}
            onChange={handleChange}
            placeholder="Goods Type"
            required
          />

          <input
            type="text"
            name="pickupLocation"
            value={form.pickupLocation}
            onChange={handleChange}
            placeholder="Pickup Location"
            required
          />

          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            placeholder="Destination"
            required
          />

          <input
            type="number"
            name="goodsWeight"
            value={form.goodsWeight}
            onChange={handleChange}
            placeholder="Goods Weight (KG)"
            min="1"
            required
          />

          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Customer Name"
            required
          />

          <input
            type="tel"
            name="customerPhone"
            value={form.customerPhone}
            onChange={handleChange}
            placeholder="Customer Phone"
            required
          />

          <input
            type="number"
            name="transportCharge"
            value={form.transportCharge}
            onChange={handleChange}
            placeholder="Transport Charge (₹)"
            min="1"
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Transport Job
          </button>
        </form>
      </div>

      <div className="logistics-section">
        <h2>Active Deliveries</h2>

        {activeDeliveries.length === 0 ? (
          <div className="card logistics-empty">
            No active deliveries.
          </div>
        ) : (
          <div className="logistics-grid">
            {activeDeliveries.map((delivery) => (
              <div
                className="logistics-job card"
                key={delivery._id}
              >
                <h3>{delivery.goodsType}</h3>

                <p>
                  <strong>Pickup:</strong>{' '}
                  {delivery.pickupLocation}
                </p>

                <p>
                  <strong>Destination:</strong>{' '}
                  {delivery.destination}
                </p>

                <p>
                  <strong>Weight:</strong>{' '}
                  {delivery.goodsWeight} KG
                </p>

                <p>
                  <strong>Customer:</strong>{' '}
                  {delivery.customerName}
                </p>

                <p>
                  <strong>Transport Charge:</strong>{' '}
                  ₹{delivery.transportCharge}
                </p>

                <p>
                  <strong>Status:</strong>{' '}

                  <span className="logistics-status">
                    {delivery.status}
                  </span>
                </p>

                <div className="logistics-actions">
                  {delivery.status === 'ASSIGNED' && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        updateStatus(
                          delivery._id,
                          'PICKED UP'
                        )
                      }
                    >
                      Mark Picked Up
                    </button>
                  )}

                  {delivery.status === 'PICKED UP' && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        updateStatus(
                          delivery._id,
                          'IN TRANSIT'
                        )
                      }
                    >
                      Start Transport
                    </button>
                  )}

                  {delivery.status === 'IN TRANSIT' && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        updateStatus(
                          delivery._id,
                          'DELIVERED'
                        )
                      }
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="logistics-section">
        <h2>Delivery History</h2>

        {deliveryHistory.length === 0 ? (
          <div className="card logistics-empty">
            No completed deliveries.
          </div>
        ) : (
          <div className="logistics-grid">
            {deliveryHistory.map((delivery) => (
              <div
                className="logistics-job card"
                key={delivery._id}
              >
                <h3>{delivery.goodsType}</h3>

                <p>
                  {delivery.pickupLocation}
                  {' → '}
                  {delivery.destination}
                </p>

                <p>
                  <strong>Charge:</strong>{' '}
                  ₹{delivery.transportCharge}
                </p>

                <span className="logistics-delivered">
                  DELIVERED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}