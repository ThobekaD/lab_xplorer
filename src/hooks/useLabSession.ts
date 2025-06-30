//src/hooks/useLabSession.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createLabSession, joinLabSession, getLabSession } from '@/lib/supabase';
import { Inserts } from '@/lib/supabase';

export function useLabSession(sessionId: string) {
  return useQuery({
    queryKey: ['lab-session', sessionId],
    queryFn: () => getLabSession(sessionId),
    select: (data) => data.data,
    enabled: !!sessionId,
  });
}

export function useCreateLabSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: Inserts<'lab_sessions'>) => createLabSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-sessions'] });
    },
  });
}

export function useJoinLabSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, userId, role }: { 
      sessionId: string; 
      userId: string; 
      role?: 'leader' | 'member' | 'observer' 
    }) => joinLabSession(sessionId, userId, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lab-session', variables.sessionId] });
    },
  });
}