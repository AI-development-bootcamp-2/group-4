import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import MessageInput from '../components/MessageInput';
import Spinner from '../components/Spinner';
import api from '../services/api';
import './InboxPage.css';

export default function InboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get('with');

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);

  useEffect(() => {
    api.get('/messages')
      .then(({ data }) => setConversations(data.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setThreadLoading(true);
    // Load conversation by recipient ID from URL — enables direct linking to any conversation
    api.get(`/messages/${activeId}`)
      .then(({ data }) => setMessages(data.messages || []))
      .finally(() => setThreadLoading(false));
  }, [activeId]);

  function handleSelect(userId) {
    setSearchParams({ with: userId });
  }

  function handleSent(message) {
    setMessages((prev) => [...prev, message]);
  }

  return (
    <>
      <Navbar />
      <div className="inbox">
        <aside className="inbox__sidebar">
          <h2 className="inbox__title">Messages</h2>
          {loading ? <Spinner /> : (
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
            />
          )}
        </aside>
        <main className="inbox__main">
          {!activeId ? (
            <p className="inbox__placeholder">Select a conversation to start messaging</p>
          ) : threadLoading ? (
            <Spinner />
          ) : (
            <>
              <MessageThread messages={messages} />
              <MessageInput recipientId={activeId} onSent={handleSent} />
            </>
          )}
        </main>
      </div>
    </>
  );
}
