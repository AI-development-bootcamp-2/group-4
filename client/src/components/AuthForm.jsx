import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from './Spinner';
import './AuthForm.css';

export default function AuthForm({ mode }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('[auth] submitting form:', form);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      login(data.token, data.user);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <p className="auth-form__error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? <Spinner /> : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
}
