//src/hooks/useExperimentStats.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ExperimentStats {
  [experimentId: string]: {
    completions: number;
    averageRating: number;
    totalAttempts: number;
  };
}

export function useExperimentStats(experimentIds: string[]) {
  const [stats, setStats] = useState<ExperimentStats>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experimentIds.length > 0) {
      fetchStats();
    }
  }, [experimentIds]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Process experiments in smaller batches to avoid URL length issues
      const batchSize = 10;
      const statsMap: ExperimentStats = {};
      
      // Process experiments in batches
      for (let i = 0; i < experimentIds.length; i += batchSize) {
        const batch = experimentIds.slice(i, i + batchSize);
        
        // Get completion counts from lab_sessions for this batch
        const { data: sessions } = await supabase
          .from('lab_sessions')
          .select('experiment_id')
          .eq('status', 'completed')
          .in('experiment_id', batch);

        // Get average scores from assessment_attempts for this batch
        const { data: attempts } = await supabase
          .from('assessment_attempts')
          .select('score, assessment_id, assessments!inner(experiment_id)')
          .in('assessments.experiment_id', batch);

        // Calculate stats for this batch
        batch.forEach(id => {
          const completions = sessions?.filter(s => s.experiment_id === id).length || 0;
          const experimentAttempts = attempts?.filter(a => a.assessments.experiment_id === id) || [];
          const averageRating = experimentAttempts.length > 0 
            ? experimentAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / experimentAttempts.length / 20 // Convert to 5-star scale
            : 4.5; // Default rating

          statsMap[id] = {
            completions,
            averageRating: Math.round(averageRating * 10) / 10,
            totalAttempts: experimentAttempts.length
          };
        });
      }

      setStats(statsMap);
    } catch (error) {
      console.error('Error fetching experiment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}