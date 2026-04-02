// web/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session:   Session | null;
  user:      User | null;
  userRole:  string | null;
  userLevel: number | null;  // 1-6 pirámide política

  setSession: (session: Session | null) => void;
  signOut:    () => Promise<void>;
  init:       () => () => void;  // retorna unsubscribe
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session:   null,
      user:      null,
      userRole:  null,
      userLevel: null,

      setSession: (session) => {
        const role  = (session?.user?.user_metadata?.['role']  ?? null) as string | null;
        const level = (session?.user?.user_metadata?.['level'] ?? null) as number | null;
        set({ session, user: session?.user ?? null, userRole: role, userLevel: level });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, userRole: null, userLevel: null });
      },

      init: () => {
        // Cargar sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
          const role  = (session?.user?.user_metadata?.['role']  ?? null) as string | null;
          const level = (session?.user?.user_metadata?.['level'] ?? null) as number | null;
          set({ session, user: session?.user ?? null, userRole: role, userLevel: level });
        });

        // Escuchar cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            const role  = (session?.user?.user_metadata?.['role']  ?? null) as string | null;
            const level = (session?.user?.user_metadata?.['level'] ?? null) as number | null;
            set({ session, user: session?.user ?? null, userRole: role, userLevel: level });
          }
        );

        return () => subscription.unsubscribe();
      },
    }),
    {
      name:       'poliintel-auth',
      partialize: (s) => ({
        userRole:  s.userRole,
        userLevel: s.userLevel,
      }),
    }
  )
);
