import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

const savedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
let savedUser: User | null = null;
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    savedUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error("Failed to parse saved user", e);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser,
  token: savedToken,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  updateUser: (partialUser) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...partialUser };
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
  isAdmin: () => {
    return get().user?.role === 'admin';
  },
  isStaff: () => {
    const role = get().user?.role;
    return role === 'admin' || role === 'staff';
  },
}));
