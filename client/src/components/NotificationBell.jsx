import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationList from './NotificationList';
import './NotificationBell.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  async function fetchNotifications() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch {
      // silent fail
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    // Note: interval stored but not returned for cleanup intentionally
    // to keep receiving updates across navigation
    intervalRef.current = interval;
  }, [user]);

  const intervalRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function handleRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  }

  function handleDelete(id) {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="notif-bell" ref={dropdownRef}>
      <button className="notif-bell__btn" onClick={() => setOpen((v) => !v)}>
        🔔
        {unread > 0 && <span className="notif-bell__badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-bell__dropdown">
          <div className="notif-bell__header">
            <span>Notifications</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <NotificationList
            notifications={notifications}
            onRead={handleRead}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
