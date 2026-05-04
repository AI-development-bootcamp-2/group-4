import { useState } from 'react';
import CommentForm from './CommentForm';
import './CommentList.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CommentItem({ comment, postId, allComments, onAdded }) {
  const [showReply, setShowReply] = useState(false);
  const replies = allComments.filter((c) => c.parent === comment._id);

  return (
    <div className="comment">
      <div className="comment__meta">
        <span
          className="comment__author"
          title={comment.author?.email}
        >
          {comment.author?.username}
        </span>
        <span className="comment__date">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="comment__content">{comment.content}</p>
      <button className="comment__reply-btn" onClick={() => setShowReply((v) => !v)}>
        {showReply ? 'Cancel' : 'Reply'}
      </button>
      {showReply && (
        <CommentForm postId={postId} parentId={comment._id} onAdded={(c) => { onAdded(c); setShowReply(false); }} />
      )}
      {replies.length > 0 && (
        <div className="comment__replies">
          {replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} postId={postId} allComments={allComments} onAdded={onAdded} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentList({ postId, comments: initial = [] }) {
  const [comments, setComments] = useState(initial);
  const roots = comments.filter((c) => !c.parent);

  function handleAdded(comment) {
    setComments((prev) => [...prev, comment]);
  }

  return (
    <div className="comment-list">
      <h3>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h3>
      {roots.map((c) => (
        <CommentItem key={c._id} comment={c} postId={postId} allComments={comments} onAdded={handleAdded} />
      ))}
      <CommentForm postId={postId} onAdded={handleAdded} />
    </div>
  );
}
