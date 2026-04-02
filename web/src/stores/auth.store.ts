import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  org_id?: string;
  territory_id?: string;
  territory_level?: string;
  avatar_url?: string;
  is_active: boolean;
  device_id?: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      setSession: (session) =>
        set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
      },
      hasRole: (role) => {
        const { profile } = get();
        if (!profile) return false;
        if (profile.role === 'super_admin') return true;
        if (Array.isArray(role)) {
          return role.includes(profile.role);
        }
        return profile.role === role;
      },
    }),
    {
      name: 'poliintel-auth',
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
);

// Initialize auth listener
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setLoading(false);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
  if (session?.user) {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) useAuthStore.getState().setProfile(data as UserProfile);
      });
  } else {
    useAuthStore.getState().setProfile(null);
  }
});
