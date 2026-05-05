import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostForm from '../components/PostForm';
import Spinner from '../components/Spinner';
import api from '../services/api';
import './CreatePostPage.css';

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/posts/${id}`).then(({ data }) => setPost(data));
  }, [id]);

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await api.put(`/posts/${id}`, data);
      navigate(`/posts/${id}`);
    } finally {
      setLoading(false);
    }
  }

  if (!post) return <><Navbar /><Spinner /></>;

  return (
    <>
      <Navbar />
      <main className="create-post-page">
        <h1>Edit Post</h1>
        <PostForm initial={post} onSubmit={handleSubmit} loading={loading} />
      </main>
    </>
  );
}
