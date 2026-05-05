import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './PostCard.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPreview(content = '') {
  // Strip markdown syntax for a clean HTML preview
  const html = content
    .replace(/#{1,6}\s(.+)/g, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');
  return html.slice(0, 200) + (html.length > 200 ? '...' : '');
}

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <div className="post-card__meta">
        <span
          className="post-card__author"
          title={post.author?.email}
        >
          {post.author?.username}
        </span>
        <span className="post-card__date">{formatDate(post.createdAt)}</span>
        {post.category && <span className="post-card__category">{post.category}</span>}
      </div>

      <Link className="post-card__title" to={`/posts/${post._id}`}>
        <h2>{post.title}</h2>
      </Link>

      <div
        className="post-card__preview"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getPreview(post.content)) }}
      />

      <div className="post-card__footer">
        <span>❤️ {post.likes?.length ?? 0}</span>
        <Link to={`/posts/${post._id}`}>Comments</Link>
        {post.tags?.map((tag) => (
          <span key={tag} className="post-card__tag">#{tag}</span>
        ))}
      </div>
    </div>
  );
}
