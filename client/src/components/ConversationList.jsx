import './ConversationList.css';

export default function ConversationList({ conversations, activeId, onSelect }) {
  if (!conversations.length) {
    return <p className="conv-list__empty">No conversations yet.</p>;
  }

  return (
    <ul className="conv-list">
      {conversations.map((conv) => (
        <li
          key={conv.userId}
          className={`conv-list__item${conv.userId === activeId ? ' conv-list__item--active' : ''}`}
          onClick={() => onSelect(conv.userId)}
        >
          <div className="conv-list__avatar">
            {conv.username?.[0]?.toUpperCase()}
          </div>
          <div className="conv-list__info">
            <span
              className="conv-list__name"
              title={conv.email}
            >
              {conv.username}
            </span>
            <span className="conv-list__preview">{conv.lastMessage}</span>
          </div>
          {conv.unread > 0 && (
            <span className="conv-list__badge">{conv.unread}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
