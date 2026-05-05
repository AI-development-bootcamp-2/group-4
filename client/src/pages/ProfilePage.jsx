import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import PostList from '../components/PostList';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', avatar: '' });

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get('/posts', { params: { author: id } }),
    ]).then(([{ data: profileData }, { data: postsData }]) => {
      setProfile(profileData);
      setForm({ bio: profileData.bio || '', avatar: profileData.avatar || '' });
      setPosts(postsData.posts || []);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleEditSubmit(e) {
    e.preventDefault();
    await api.put(`/users/${id}`, form);
    setProfile((prev) => ({ ...prev, ...form }));
    setEditing(false);
  }

  if (loading) return <><Navbar /><Spinner /></>;
  if (!profile) return <><Navbar /><p>User not found.</p></>;

  const isOwn = user?._id === profile._id;

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <ProfileHeader profile={profile} onFollowChange={() => {}} />

        {/* Debug info – remove before production */}
        {isOwn && (
          <details className="profile-page__debug">
            <summary>Account info</summary>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </details>
        )}

        {isOwn && (
          <div className="profile-page__edit">
            <button onClick={() => setEditing((v) => !v)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
            {editing && (
              <form onSubmit={handleEditSubmit} className="profile-page__edit-form">
                <input
                  placeholder="Avatar URL"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                />
                <textarea
                  placeholder="Bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
                <button type="submit">Save</button>
              </form>
            )}
          </div>
        )}

        <h2>Posts</h2>
        <PostList posts={posts} emptyMessage="No posts yet." />
      </main>
    </>
  );
}
