/**
 * Notifications Page - All notifications with type, date, status icon.
 * Payment success/failed, refund, slot booked/not booked, insurance renewed, FASTag recharge.
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Notifications.css';

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNotifTypeAndIcon(n) {
  const t = (n.type || '').toLowerCase();
  const title = (n.title || '').toLowerCase();
  const msg = (n.message || '').toLowerCase();
  if (t.includes('success') || title.includes('success') || msg.includes('success')) return { type: 'Payment Successful', icon: '✓' };
  if (t.includes('fail') || title.includes('fail') || msg.includes('unsuccessful')) return { type: 'Payment Unsuccessful', icon: '✕' };
  if (t.includes('refund') || title.includes('refund')) return { type: 'Refund Processed', icon: '↩' };
  if (t.includes('slot') && (title.includes('book') || msg.includes('book'))) return { type: 'Slot Booked', icon: '📅' };
  if (t.includes('slot') && (title.includes('not') || msg.includes('not book'))) return { type: 'Slot Not Booked', icon: '⚠' };
  if (title.includes('insurance')) return { type: 'Insurance Renewed', icon: '🛡️' };
  if (title.includes('fastag') || title.includes('recharge')) return { type: 'FASTag Recharge', icon: '🏷️' };
  return { type: n.type || n.title || 'Notification', icon: '🔔' };
}

export default function Notifications() {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get('/notifications')
      .then(setData)
      .catch(() => setData({ notifications: [], unreadCount: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = (id) => {
    api.patch(`/notifications/${id}/read`, {})
      .then(() => fetchNotifications())
      .catch(() => {});
  };

  const markAllRead = () => {
    api.patch('/notifications/read-all', {})
      .then(() => fetchNotifications())
      .catch(() => {});
  };

  if (loading) return <div className="container page-container">Loading...</div>;

  const { notifications, unreadCount } = data;

  return (
    <div className="container page-container">
      <h1 className="page-title">Notifications</h1>
      <div className="notif-actions">
        {unreadCount > 0 && (
          <button type="button" className="btn btn-secondary" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <p className="no-notif">No notifications yet.</p>
        ) : (
          notifications.map((n) => {
            const { type: notifType, icon } = getNotifTypeAndIcon(n);
            return (
              <div
                key={n._id}
                className={`notif-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => !n.read && markRead(n._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !n.read && markRead(n._id)}
              >
                <div className="notif-header">
                  <span className="notif-status-icon" aria-hidden>{icon}</span>
                  <span className="notif-type">{notifType}</span>
                </div>
                <div className="notif-title">{n.title}</div>
                <div className="notif-message">{n.message}</div>
                {(n.paymentType || n.amount) && (
                  <div className="notif-meta">
                    {n.paymentType && <span>{n.paymentType}</span>}
                    {n.amount > 0 && <span>₹{n.amount}</span>}
                  </div>
                )}
                <div className="notif-time">{formatDateTime(n.createdAt)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
