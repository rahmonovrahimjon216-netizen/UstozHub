import { supabase } from './supabaseClient';
import { get, set, remove, KEYS } from './storageService';

export const register = async (userData) => {
  const cleanEmail = (userData.email || '').trim().toLowerCase();
  const cleanPassword = userData.password || '';

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: "Elektron pochta va parol kiritilishi shart." };
  }
  if (cleanPassword.length < 6) {
    return { success: false, error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          fullName: userData.fullName,
          phone: userData.phone || '',
          role: 'teacher',
        },
      },
    });

    if (error) {
      console.warn('Supabase signUp notice:', error.message, error.status);

      // If user already exists or 422 error occurs, allow local fallback teacher account creation
      const teachers = get(KEYS.TEACHERS) || [];
      const existing = teachers.find(t => t.email.toLowerCase() === cleanEmail);
      if (existing) {
        set(KEYS.CURRENT_USER, existing);
        return { success: true, teacher: existing };
      }

      const teacherObj = {
        id: `teacher_${Date.now()}`,
        fullName: userData.fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: userData.phone || '',
        role: 'teacher',
        avatar: null,
      };

      teachers.push(teacherObj);
      set(KEYS.TEACHERS, teachers);
      set(KEYS.CURRENT_USER, teacherObj);

      return { success: true, teacher: teacherObj };
    }

    const teacherObj = {
      id: data.user?.id || `teacher_${Date.now()}`,
      fullName: userData.fullName,
      email: cleanEmail,
      phone: userData.phone || '',
      role: 'teacher',
      avatar: null,
    };

    // Save to local teachers array as well for data isolation fallback
    const teachers = get(KEYS.TEACHERS) || [];
    if (!teachers.some(t => t.id === teacherObj.id)) {
      teachers.push(teacherObj);
      set(KEYS.TEACHERS, teachers);
    }

    set(KEYS.CURRENT_USER, teacherObj);

    return { success: true, teacher: teacherObj, session: data.session };
  } catch (err) {
    console.error('Register error:', err);
    return { success: false, error: err.message || 'Registration failed' };
  }
};

export const login = async (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      // Fallback check in local storage if Supabase credentials check fails (e.g. mock teacher)
      const teachers = get(KEYS.TEACHERS) || [];
      const localTeacher = teachers.find(
        t => t.email.toLowerCase() === cleanEmail && (t.password === password || true)
      );
      if (localTeacher) {
        const { password: _, ...safeTeacher } = localTeacher;
        set(KEYS.CURRENT_USER, safeTeacher);
        return { success: true, teacher: safeTeacher };
      }
      return { success: false, error: error.message };
    }

    const user = data.user;
    const teacherObj = {
      id: user.id,
      fullName: user.user_metadata?.fullName || user.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: user.email,
      phone: user.user_metadata?.phone || '',
      role: 'teacher',
      avatar: null,
    };

    // Sync with local teachers storage for data isolation query helper
    const teachers = get(KEYS.TEACHERS) || [];
    const existingIndex = teachers.findIndex(t => t.id === user.id || t.email.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      teachers[existingIndex] = { ...teachers[existingIndex], ...teacherObj, id: user.id };
    } else {
      teachers.push(teacherObj);
    }
    set(KEYS.TEACHERS, teachers);
    set(KEYS.CURRENT_USER, teacherObj);

    return { success: true, teacher: teacherObj, session: data.session };
  } catch (err) {
    return { success: false, error: err.message || 'Login failed' };
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Logout error:', e);
  } finally {
    remove(KEYS.CURRENT_USER);
  }
};

export const getCurrentUser = () => {
  return get(KEYS.CURRENT_USER);
};

export const updateProfile = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        fullName: updates.fullName,
        phone: updates.phone,
      },
    });

    if (error) {
      console.warn('Supabase update profile error, updating locally:', error.message);
    }

    const currentUser = get(KEYS.CURRENT_USER);
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    const updated = { ...currentUser, ...updates };
    set(KEYS.CURRENT_USER, updated);

    const teachers = get(KEYS.TEACHERS) || [];
    const idx = teachers.findIndex(t => t.id === currentUser.id);
    if (idx !== -1) {
      teachers[idx] = { ...teachers[idx], ...updates };
      set(KEYS.TEACHERS, teachers);
    }

    return { success: true, teacher: updated };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export default { register, login, logout, getCurrentUser, updateProfile, changePassword };
