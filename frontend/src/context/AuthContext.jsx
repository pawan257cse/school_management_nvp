import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, logoutApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nvp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nvp_token') || '');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('nvp_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification note:', err.message);
          // Only clear session if server explicitly rejected the token with 401
          if (err.response && err.response.status === 401) {
            if (err.response.data?.isPasswordChanged) {
              sessionStorage.setItem('password_reset_alert', err.response.data.message || 'Your password was changed. Please log in again with your new password.');
            }
            logout();
          }
          // If it was a network glitch or Render cold-start, keep saved user active!
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('nvp_token', newToken);
        localStorage.setItem('nvp_user', JSON.stringify(userData));
        showToast(`Welcome back, ${userData.name}!`, 'success');
        return { success: true, role: userData.role };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      if (token) await logoutApi();
    } catch (err) {
      // ignore logout errors
    } finally {
      setUser(null);
      setToken('');
      localStorage.removeItem('nvp_token');
      localStorage.removeItem('nvp_user');
      showToast('Logged out successfully.', 'info');
    }
  };

  const getDefaultRouteForRole = (role) => {
    switch (role) {
      case 'HEAD':
        return '/head-dashboard';
      case 'PRINCIPAL':
        return '/principal-dashboard';
      case 'TEACHER':
        return '/teacher-dashboard';
      case 'STUDENT':
        return '/student-dashboard';
      default:
        return '/login';
    }
  };

  const updateCurrentUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('nvp_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateCurrentUser,
      toast,
      showToast,
      getDefaultRouteForRole
    }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm ${
            toast.type === 'error' ? 'bg-rose-600' :
            toast.type === 'info' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75 font-bold">✕</button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
