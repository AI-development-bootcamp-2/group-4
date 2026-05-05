import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

const VALID_ROLES = ['user', 'admin'];

function getStoredUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      clearAuth();
      return null;
    }
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const userData = JSON.parse(stored);
    // Cross-check role against the JWT payload so a manually edited
    // localStorage role doesn't grant elevated privileges in the UI.
    // TODO: replace with a /api/me call so role is always server-authoritative.
    const jwtPayload = JSON.parse(atob(token.split('.')[1]));
    if (!VALID_ROLES.includes(userData.role) || userData.role !== jwtPayload.role) {
      userData.role = jwtPayload.role ?? 'user';
    }
    return userData;
  } catch {
    clearAuth();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  function login(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
