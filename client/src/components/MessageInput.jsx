import { useState } from 'react';
import api from '../services/api';
import './MessageInput.css';

export default function MessageInput({ recipientId, onSent }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/messages/${recipientId}`, { content });
      setContent('');
      onSent?.(data.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className="msg-input" onSubmit={handleSubmit}>
      <textarea
        className="msg-input__field"
        placeholder="Type a message... (Enter to send)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !content.trim()}>
        Send
      </button>
    </form>
  );
}
