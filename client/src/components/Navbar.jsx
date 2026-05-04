import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link className="navbar__brand" to="/">Forum</Link>

      <div className="navbar__links">
        <Link to="/search">Search</Link>

        {user ? (
          <>
            <Link to="/posts/new">New Post</Link>
            <Link to="/messages">Messages</Link>
            <NotificationBell />
            <Link to={`/profile/${user._id}`}>{user.username}</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <button className="navbar__btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        <button className="navbar__btn" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
