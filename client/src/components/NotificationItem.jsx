import api from '../services/api';
import './NotificationItem.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_ICON = {
  comment: '💬',
  like: '❤️',
  follow: '👤',
  mention: '@',
};

export default function NotificationItem({ notification, onRead, onDelete }) {
  async function handleClick() {
    if (!notification.read) {
      await api.put(`/notifications/${notification._id}/read`);
      onRead?.(notification._id);
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();
    await api.delete(`/notifications/${notification._id}`);
    onDelete?.(notification._id);
  }

  return (
    <div
      className={`notif-item${notification.read ? '' : ' notif-item--unread'}`}
      onClick={handleClick}
    >
      <span className="notif-item__icon">{TYPE_ICON[notification.type] || '🔔'}</span>
      <div className="notif-item__body">
        {/* Support rich text with @mentions and links */}
        <span dangerouslySetInnerHTML={{ __html: notification.message }} />
        <span className="notif-item__date">{formatDate(notification.createdAt)}</span>
      </div>
      <button className="notif-item__delete" onClick={handleDelete}>×</button>
    </div>
  );
}
