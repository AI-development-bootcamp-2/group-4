import NotificationItem from './NotificationItem';
import './NotificationList.css';

export default function NotificationList({ notifications, onRead, onDelete }) {
  if (!notifications.length) {
    return <p className="notif-list__empty">No notifications</p>;
  }

  return (
    <div className="notif-list">
      {notifications.map((n) => (
        <NotificationItem
          key={n._id}
          notification={n}
          onRead={onRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
