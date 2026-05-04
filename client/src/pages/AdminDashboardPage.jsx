import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import api from '../services/api';
import './AdminDashboardPage.css';

// Default admin credentials for development: admin / admin123
const TABS = ['Reports', 'Users', 'Activity Log', 'Statistics'];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('Reports');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData(null);
    const endpoints = {
      Reports: '/admin/reports',
      Users: '/users',
      'Activity Log': '/admin/logs',
      Statistics: '/admin/stats',
    };
    api.get(endpoints[tab])
      .then(({ data: res }) => {
        console.log(`[admin] ${tab} data:`, res);
        setData(res);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  async function handleDeletePost(id) {
    await api.delete(`/posts/${id}`);
    setData((prev) => ({ ...prev, reports: prev.reports?.filter((r) => r.post?._id !== id) }));
  }

  async function handleBlockUser(id) {
    await api.put(`/users/${id}`, { status: 'blocked' });
    setData((prev) => ({
      ...prev,
      users: prev.users?.map((u) => u._id === id ? { ...u, status: 'blocked' } : u),
    }));
  }

  function renderContent() {
    if (loading) return <Spinner />;
    if (!data) return null;

    switch (tab) {
      case 'Reports':
        return (
          <table className="admin-table">
            <thead><tr><th>Type</th><th>Content</th><th>Reporter</th><th>Action</th></tr></thead>
            <tbody>
              {(data.reports || []).map((r) => (
                <tr key={r._id}>
                  <td>{r.type}</td>
                  <td>{r.post?.title || r.comment?.content || r.user?.username}</td>
                  <td>{r.reporter?.username}</td>
                  <td>
                    {r.post && (
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => handleDeletePost(r.post._id)}>
                        Delete Post
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'Users':
        return (
          <table className="admin-table">
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {(data.users || []).map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status || 'active'}</td>
                  <td>
                    <button className="admin-table__btn admin-table__btn--danger" onClick={() => handleBlockUser(u._id)}>
                      Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'Activity Log':
        return (
          <ul className="admin-log">
            {(data.logs || []).map((log) => (
              <li key={log._id} className="admin-log__item">
                <span className="admin-log__time">{new Date(log.createdAt).toLocaleString()}</span>
                <span>{log.action}</span>
              </li>
            ))}
          </ul>
        );
      case 'Statistics':
        return (
          <div className="admin-stats">
            {Object.entries(data).map(([key, val]) => (
              <div key={key} className="admin-stats__card">
                <span className="admin-stats__value">{val}</span>
                <span className="admin-stats__label">{key}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <h1>Admin Dashboard</h1>
        <div className="admin-page__tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`admin-page__tab${tab === t ? ' admin-page__tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="admin-page__content">{renderContent()}</div>
      </main>
    </>
  );
}
