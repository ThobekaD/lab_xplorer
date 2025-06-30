import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useRealtimeSubscription(
  channelName: string,
  config: {
    table: string;
    filter?: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  },
  callback: (payload: any) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create channel
    channelRef.current = supabase.channel(channelName);

    // Add postgres changes listener
    channelRef.current.on(
      'postgres_changes',
      {
        event: config.event || '*',
        schema: 'public',
        table: config.table,
        filter: config.filter,
      },
      callback
    );

    // Subscribe to channel
    channelRef.current.subscribe();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [channelName, config.table, config.filter, config.event, callback]);

  return channelRef.current;
}

export function useLabSessionRealtime(sessionId: string, callback: (payload: any) => void) {
  return useRealtimeSubscription(
    `lab_session:${sessionId}`,
    {
      table: 'lab_sessions',
      filter: `id=eq.${sessionId}`,
    },
    callback
  );
}

export function useNotebookRealtime(sessionId: string, callback: (payload: any) => void) {
  return useRealtimeSubscription(
    `notebook:${sessionId}`,
    {
      table: 'notebook_entries',
      filter: `session_id=eq.${sessionId}`,
    },
    callback
  );
}

export function useMeasurementsRealtime(sessionId: string, callback: (payload: any) => void) {
  return useRealtimeSubscription(
    `measurements:${sessionId}`,
    {
      table: 'measurements',
      filter: `session_id=eq.${sessionId}`,
    },
    callback
  );
}

export function useSessionMembersRealtime(sessionId: string, callback: (payload: any) => void) {
  return useRealtimeSubscription(
    `session_members:${sessionId}`,
    {
      table: 'session_members',
      filter: `session_id=eq.${sessionId}`,
    },
    callback
  );
}

export function useUserAchievementsRealtime(userId: string, callback: (payload: any) => void) {
  return useRealtimeSubscription(
    `achievements:${userId}`,
    {
      table: 'user_achievements',
      filter: `user_id=eq.${userId}`,
      event: 'INSERT',
    },
    callback
  );
}