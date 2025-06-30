//src/hooks/useVideoLectures.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface VideoLecture {
  id: string;
  experiment_id: string;
  lecture_title: string;
  tavus_video_id: string | null;
  tavus_persona_id: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  language_code: string;
  created_at: string;
}

// Fetch video lectures for an experiment
export function useVideoLectures(experimentId?: string) {
  return useQuery({
    queryKey: ['video-lectures', experimentId],
    queryFn: async () => {
      let query = supabase
        .from('video_lectures')
        .select('*')
        .order('created_at', { ascending: true });

      if (experimentId) {
        query = query.eq('experiment_id', experimentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VideoLecture[];
    },
    enabled: !!experimentId,
  });
}

// Fetch a single video lecture
export function useVideoLecture(lectureId: string) {
  return useQuery({
    queryKey: ['video-lecture', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_lectures')
        .select('*')
        .eq('id', lectureId)
        .single();

      if (error) throw error;
      return data as VideoLecture;
    },
    enabled: !!lectureId,
  });
}

// Create a new video lecture
export function useCreateVideoLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lecture: Omit<VideoLecture, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('video_lectures')
        .insert(lecture)
        .select()
        .single();

      if (error) throw error;
      return data as VideoLecture;
    },
    onSuccess: (data) => {
      // Invalidate and refetch lectures
      queryClient.invalidateQueries({ 
        queryKey: ['video-lectures', data.experiment_id] 
      });
    },
  });
}

// Update video lecture
export function useUpdateVideoLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<VideoLecture> 
    }) => {
      const { data, error } = await supabase
        .from('video_lectures')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as VideoLecture;
    },
    onSuccess: (data) => {
      // Invalidate and refetch lectures
      queryClient.invalidateQueries({ 
        queryKey: ['video-lectures', data.experiment_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['video-lecture', data.id] 
      });
    },
  });
}

// Delete video lecture
export function useDeleteVideoLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_lectures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate all video lectures queries
      queryClient.invalidateQueries({ 
        queryKey: ['video-lectures'] 
      });
    },
  });
}