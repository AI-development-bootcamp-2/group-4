import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './LikeButton.css';

export default function LikeButton({ postId, initialLikes = [] }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const liked = user ? likes.includes(user._id) : false;

  async function handleLike() {
    if (!user) return;
    // Optimistic update
    if (liked) {
      setLikes((prev) => prev.filter((id) => id !== user._id));
      await api.delete(`/posts/${postId}/like`).catch(() => setLikes(initialLikes));
    } else {
      setLikes((prev) => [...prev, user._id]);
      await api.post(`/posts/${postId}/like`).catch(() => setLikes(initialLikes));
    }
  }

  return (
    <button className={`like-btn${liked ? ' like-btn--liked' : ''}`} onClick={handleLike}>
      ❤️ {likes.length}
    </button>
  );
}
