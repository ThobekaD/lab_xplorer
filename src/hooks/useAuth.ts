import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getProfile } from '@/lib/supabase';
import { Tables } from '@/lib/supabase';

export interface AuthUser extends User {
  profile?: Tables<'profiles'>;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await getProfile(authUser.id);
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
            avatar_url: authUser.user_metadata?.avatar_url,
          })
          .select()
          .single();
          
        if (!createError && newProfile) {
          setUser({ ...authUser, profile: newProfile });
        } else {
          setUser(authUser);
        }
      } else if (!error && profile) {
        setUser({ ...authUser, profile });
      } else {
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}