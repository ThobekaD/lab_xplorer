import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotebookEntry, getNotebookEntries } from '@/lib/supabase';
import { Inserts } from '@/lib/supabase';

export function useNotebookEntries(sessionId: string) {
  return useQuery({
    queryKey: ['notebook-entries', sessionId],
    queryFn: () => getNotebookEntries(sessionId),
    select: (data) => data.data,
    enabled: !!sessionId,
  });
}

export function useCreateNotebookEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entryData: Inserts<'notebook_entries'>) => createNotebookEntry(entryData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notebook-entries', variables.session_id] });
    },
  });
}