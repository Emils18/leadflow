import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lf_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('lf_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const checkSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Session expired.');
        }

        setUser(data.user);
      } catch (err) {
        console.error('Session validation error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Authentication credentials rejected.');
    }

    localStorage.setItem('lf_token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);