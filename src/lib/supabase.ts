import { createClient } from '@supabase/supabase-js';
import { RealtimeClient } from '@supabase/realtime-js';
import { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const realtimeClient = new RealtimeClient(
  `${supabaseUrl || ''}/realtime/v1`,
  {
    apiKey: supabaseAnonKey || '',
    params: {
      eventsPerSecond: 10,
    },
  }
);

// Type-safe database helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Auth helpers
export const signUp = async (email: string, password: string, displayName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Updates<'profiles'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Experiment helpers
export const getExperiments = async (filters?: {
  subject?: string;
  difficulty?: number;
  is_free?: boolean;
}) => {
  let query = supabase.from('experiments').select('*');
  
  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  if (filters?.is_free !== undefined) {
    query = query.eq('is_free', filters.is_free);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

export const getExperimentBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('experiments')
    .select(`
      *,
      experiment_steps (*)
    `)
    .eq('slug', slug)
    .single();
  return { data, error };
};

// Lab session helpers
export const createLabSession = async (sessionData: Inserts<'lab_sessions'>) => {
  const { data, error } = await supabase
    .from('lab_sessions')
    .insert(sessionData)
    .select()
    .single();
  return { data, error };
};

export const joinLabSession = async (sessionId: string, userId: string, role: 'leader' | 'member' | 'observer' = 'member') => {
  const { data, error } = await supabase
    .from('session_members')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
    })
    .select()
    .single();
  return { data, error };
};

export const getLabSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('lab_sessions')
    .select(`
      *,
      experiments (*),
      session_members (
        *,
        profiles (display_name, avatar_url)
      )
    `)
    .eq('id', sessionId)
    .single();
  return { data, error };
};

// Notebook helpers
export const createNotebookEntry = async (entryData: Inserts<'notebook_entries'>) => {
  const { data, error } = await supabase
    .from('notebook_entries')
    .insert(entryData)
    .select()
    .single();
  return { data, error };
};

export const getNotebookEntries = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('notebook_entries')
    .select(`
      *,
      profiles (display_name, avatar_url)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  return { data, error };
};

// Measurement helpers
export const recordMeasurement = async (measurementData: Inserts<'measurements'>) => {
  const { data, error } = await supabase
    .from('measurements')
    .insert(measurementData)
    .select()
    .single();
  return { data, error };
};

export const getMeasurements = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp_recorded', { ascending: true });
  return { data, error };
};

// Assessment helpers
export const getAssessments = async (experimentId: string, type?: 'pre_lab' | 'post_lab' | 'checkpoint') => {
  let query = supabase
    .from('assessments')
    .select('*')
    .eq('experiment_id', experimentId);
    
  if (type) {
    query = query.eq('assessment_type', type);
  }
  
  const { data, error } = await query.order('difficulty', { ascending: true });
  return { data, error };
};

export const submitAssessment = async (attemptData: Inserts<'assessment_attempts'>) => {
  const { data, error } = await supabase
    .from('assessment_attempts')
    .insert(attemptData)
    .select()
    .single();
  return { data, error };
};

// Gamification helpers
export const awardAchievement = async (achievementData: Inserts<'user_achievements'>) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .insert(achievementData)
    .select()
    .single();
  return { data, error };
};

export const getUserAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  return { data, error };
};

export const recordGameScore = async (scoreData: Inserts<'game_scores'>) => {
  const { data, error } = await supabase
    .from('game_scores')
    .insert(scoreData)
    .select()
    .single();
  return { data, error };
};

export const getLeaderboard = async (subject?: 'physics' | 'chemistry' | 'biology', limit = 10) => {
  let query = supabase
    .from('profiles')
    .select('id, display_name, avatar_url, xp')
    .order('xp', { ascending: false })
    .limit(limit);
    
  const { data, error } = await query;
  return { data, error };
};

// Real-time subscription helpers
export const subscribeToLabSession = (sessionId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`lab_session:${sessionId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'lab_sessions',
      filter: `id=eq.${sessionId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'session_members',
      filter: `session_id=eq.${sessionId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notebook_entries',
      filter: `session_id=eq.${sessionId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'measurements',
      filter: `session_id=eq.${sessionId}`,
    }, callback)
    .subscribe();
};

export const subscribeToNotebook = (sessionId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notebook:${sessionId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notebook_entries',
      filter: `session_id=eq.${sessionId}`,
    }, callback)
    .subscribe();
};

export const subscribeToUserAchievements = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`achievements:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'user_achievements',
      filter: `user_id=eq.${userId}`,
    }, callback)
    .subscribe();
};