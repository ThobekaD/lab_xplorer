import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, Tables } from '@/lib/supabase';

interface AuthState {
  user: Tables<'profiles'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Tables<'profiles'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile from database - use maybeSingle() to handle no rows gracefully
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              set({
                user: profile,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Create profile if it doesn't exist
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
                  avatar_url: session.user.user_metadata?.avatar_url,
                })
                .select()
                .single();
                
              if (newProfile) {
                set({
                  user: newProfile,
                  isAuthenticated: true,
                  isLoading: false,
                });
              }
            }
          } else {
            set({ isLoading: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profile) {
                set({
                  user: profile,
                  isAuthenticated: true,
                });
              } else {
                // Create profile if it doesn't exist
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
                    avatar_url: session.user.user_metadata?.avatar_url,
                  })
                  .select()
                  .single();
                  
                if (newProfile) {
                  set({
                    user: newProfile,
                    isAuthenticated: true,
                  });
                }
              }
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                isAuthenticated: false,
              });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { error: error.message };
          }

          return {};
        } catch (error) {
          return { error: 'An unexpected error occurred' };
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
              },
            },
          });

          if (error) {
            return { error: error.message };
          }

          return {};
        } catch (error) {
          return { error: 'An unexpected error occurred' };
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateProfile: async (updates: Partial<Tables<'profiles'>>) => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (!error && data) {
            set({ user: data });
          }
        } catch (error) {
          console.error('Profile update error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);