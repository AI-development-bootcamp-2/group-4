import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostForm from '../components/PostForm';
import api from '../services/api';
import './CreatePostPage.css';

export default function CreatePostPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(data) {
    setLoading(true);
    try {
      const { data: post } = await api.post('/posts', data);
      navigate(`/posts/${post._id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="create-post-page">
        <h1>New Post</h1>
        <PostForm onSubmit={handleSubmit} loading={loading} />
      </main>
    </>
  );
}
