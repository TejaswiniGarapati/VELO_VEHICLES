/**
 * Admin Dashboard - View users, payments, notifications, app activity
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('activity');
  const [activity, setActivity] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === 'activity') {
      api.get('/api/admin/activity')
        .then(setActivity)
        .catch(() => setActivity(null))
        .finally(() => setLoading(false));
    } else if (tab === 'users') {
      api.get('/api/admin/users')
        .then(setUsers)
        .catch(() => setUsers([]))
        .finally(() => setLoading(false));
    } else if (tab === 'payments') {
      api.get('/api/admin/payments')
        .then(setPayments)
        .catch(() => setPayments([]))
        .finally(() => setLoading(false));
    } else if (tab === 'notifications') {
      api.get('/api/admin/notifications')
        .then(setNotifications)
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="container page-container admin-page">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="admin-subtitle">Monitor users, payments, notifications and app activity.</p>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'activity' ? 'active' : ''}
          onClick={() => setTab('activity')}
        >
          Activity
        </button>
        <button
          type="button"
          className={tab === 'users' ? 'active' : ''}
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button
          type="button"
          className={tab === 'payments' ? 'active' : ''}
          onClick={() => setTab('payments')}
        >
          Payments
        </button>
        <button
          type="button"
          className={tab === 'notifications' ? 'active' : ''}
          onClick={() => setTab('notifications')}
        >
          Notifications
        </button>
      </div>

      <div className="admin-content">
        {loading && <p>Loading...</p>}

        {!loading && tab === 'activity' && activity && (
          <div className="admin-card">
            <h3>Overview</h3>
            <div className="admin-stats">
              <div className="stat-item">
                <span className="stat-value">{activity.totalUsers}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{activity.totalPayments}</span>
                <span className="stat-label">Total Payments</span>
              </div>
            </div>
            <h4>Recent Payments</h4>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(activity.recentPayments || []).map((p) => (
                    <tr key={p._id}>
                      <td>{p.userId?.firstName} {p.userId?.lastName}</td>
                      <td>{p.type}</td>
                      <td>₹{p.amount}</td>
                      <td>{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === 'users' && (
          <div className="admin-card">
            <h3>All Users</h3>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.firstName} {u.middleName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === 'payments' && (
          <div className="admin-card">
            <h3>All Payments</h3>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{p.userId?.firstName} {p.userId?.lastName}</td>
                      <td>{p.type}</td>
                      <td>₹{p.amount}</td>
                      <td>{p.paymentMethod}</td>
                      <td>{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === 'notifications' && (
          <div className="admin-card">
            <h3>Notifications</h3>
            <div className="notif-list-admin">
              {notifications.length === 0 ? (
                <p>No notifications.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="notif-row">
                    <span>{n.title}</span>
                    <span>{n.userId?.firstName} {n.userId?.lastName}</span>
                    <span>{n.amount ? `₹${n.amount}` : '—'}</span>
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
