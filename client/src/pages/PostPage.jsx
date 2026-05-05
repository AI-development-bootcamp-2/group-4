import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostContent from '../components/PostContent';
import LikeButton from '../components/LikeButton';
import CommentList from '../components/CommentList';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PostPage.css';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/posts/${id}/comments`),
    ]).then(([{ data: postData }, { data: commentsData }]) => {
      setPost(postData);
      setComments(commentsData.comments || []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${id}`);
    navigate('/');
  }

  if (loading) return <><Navbar /><Spinner /></>;
  if (!post) return <><Navbar /><p>Post not found.</p></>;

  const isAuthor = user?._id === post.author?._id;

  return (
    <>
      <Navbar />
      <main className="post-page">
        <div className="post-page__header">
          <h1>{post.title}</h1>
          <div className="post-page__meta">
            <Link to={`/profile/${post.author?._id}`}>{post.author?.username}</Link>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.category && <span className="post-page__category">{post.category}</span>}
          </div>
          {isAuthor && (
            <div className="post-page__actions">
              <Link to={`/posts/${id}/edit`} className="post-page__btn">Edit</Link>
              <button className="post-page__btn post-page__btn--danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>

        <PostContent content={post.content} />

        <div className="post-page__interactions">
          <LikeButton postId={post._id} initialLikes={post.likes || []} />
        </div>

        <CommentList postId={post._id} comments={comments} />
      </main>
    </>
  );
}
