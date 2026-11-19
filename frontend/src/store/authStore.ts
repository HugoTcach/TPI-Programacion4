import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axiosInstance } from '../shared/api/axiosInstance';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  disabled: boolean;
  created_at: string;
}

interface AuthState {
  usuario: User | null;
  cargando: boolean;
  login: (usuario: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: (usuario) => set({ usuario }),
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch (e) {
          console.error(e);
        } finally {
          set({ usuario: null });
        }
      },
      checkSession: async () => {
        try {
          const res = await axiosInstance.get('/auth/me');
          set({ usuario: res.data, cargando: false });
        } catch (e) {
          set({ usuario: null, cargando: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
