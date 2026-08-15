import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, logout, register, getCurrentUser, updateProfile, changePassword } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { set, get, KEYS } from '../services/storageService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial Supabase session fetch
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const teacherObj = {
            id: u.id,
            fullName: u.user_metadata?.fullName || u.user_metadata?.full_name || u.email?.split('@')[0],
            email: u.email,
            phone: u.user_metadata?.phone || '',
            role: 'teacher',
            avatar: null,
          };
          setUser(teacherObj);
          set(KEYS.CURRENT_USER, teacherObj);
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const teacherObj = {
          id: u.id,
          fullName: u.user_metadata?.fullName || u.user_metadata?.full_name || u.email?.split('@')[0],
          email: u.email,
          phone: u.user_metadata?.phone || '',
          role: 'teacher',
          avatar: null,
        };
        setUser(teacherObj);
        set(KEYS.CURRENT_USER, teacherObj);
      } else {
        // If logged out from Supabase and no local user
        const localUser = getCurrentUser();
        if (!localUser) {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      setUser(result.teacher);
    } else {
      setError(result.error);
    }
    setLoading(false);
    return result;
  }, []);

  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    const result = await register(userData);
    if (result.success) {
      setUser(result.teacher);
    } else {
      setError(result.error);
    }
    setLoading(false);
    return result;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const handleUpdateProfile = useCallback(async (updates) => {
    const result = await updateProfile(updates);
    if (result.success) {
      setUser(result.teacher);
    }
    return result;
  }, []);

  const handleChangePassword = useCallback(async (currentPassword, newPassword) => {
    return await changePassword(currentPassword, newPassword);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      updateProfile: handleUpdateProfile,
      changePassword: handleChangePassword,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
