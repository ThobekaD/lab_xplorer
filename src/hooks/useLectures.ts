//src/hooks/useLectures.ts
import { useQuery } from '@tanstack/react-query';
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

export function useLectures(experimentId?: string) {
  return useQuery({
    queryKey: ['lectures', experimentId],
    queryFn: async () => {
      if (!experimentId) return [];

      const { data, error } = await supabase
        .from('video_lectures')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching lectures:', error);
        return [];
      }

      return data as VideoLecture[];
    },
    enabled: !!experimentId,
  });
}

export function useLecture(lectureId: string) {
  return useQuery({
    queryKey: ['lecture', lectureId],
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