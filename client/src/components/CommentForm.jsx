import { useState } from 'react';
import api from '../services/api';
import Spinner from './Spinner';
import './CommentForm.css';

export default function CommentForm({ postId, parentId = null, onAdded }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, {
        content,
        parent: parentId,
      });
      setContent('');
      onAdded?.(data.comment);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-form__input"
        placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? <Spinner /> : parentId ? 'Reply' : 'Comment'}
      </button>
    </form>
  );
}
