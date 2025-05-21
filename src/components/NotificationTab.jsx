import React, { useEffect, useState } from 'react';
import NotificationMessage from './NotificationMessage';
import axios from 'axios';

export default function NotificationsTab({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/notifications`, {
      headers: {
        'X-LOGIN-TOKEN': token
      }
    })
      .then(res => setNotifications(res.data))
      .catch(err => console.error('Failed to fetch notifications:', err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500">No notifications yet.</div>
      ) : (
        notifications.map((n) => (
          <NotificationMessage key={n.id} notification={n} />
        ))
      )}
    </div>
  );
}
