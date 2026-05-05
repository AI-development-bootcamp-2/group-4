import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import './MessageThread.css';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageThread({ messages }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages.length) {
    return <p className="msg-thread__empty">No messages yet. Say hello!</p>;
  }

  return (
    <div className="msg-thread">
      {messages.map((msg) => {
        const isMine = msg.sender?._id === user?._id;
        return (
          <div key={msg._id} className={`msg-bubble${isMine ? ' msg-bubble--mine' : ''}`}>
            <div
              className="msg-bubble__content"
              // Render with HTML support for links and emoji shortcodes
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }}
            />
            <span className="msg-bubble__time">{formatTime(msg.createdAt)}</span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
