//src/hooks/useExperiments.ts
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ExperimentStep {
  id: string;
  step_number: number;
  title: string;
  instructions: any;
  expected_results: any;
  safety_notes: string[];
  assets: any;
  validation_rules: any;
  created_at: string;
}

interface ExperimentData {
  id: string;
  slug: string;
  title: string;
  description: string;
  subject: 'physics' | 'chemistry' | 'biology';
  difficulty: number;
  thumbnail_url: string;
  is_free: boolean;
  estimated_duration: number;
  learning_objectives: string[];
  prerequisites: string[];
  created_at: string;
  steps?: ExperimentStep[];
}

// Function to fetch all experiments
async function fetchExperiments(): Promise<ExperimentData[]> {
  try {
    console.log('Fetching all experiments...');
    
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiments:', error);
      throw error;
    }

    console.log('Fetched experiments:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch experiments:', error);
    // Return empty array instead of throwing to prevent uncaught errors
    return [];
  }
}

// Hook for fetching all experiments (for the experiments list page)
export function useExperiments() {
  return useQuery({
    queryKey: ['experiments'],
    queryFn: fetchExperiments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 2, // Retry failed requests up to 2 times
  });
}

// Hook for fetching a single experiment with steps (for experiment detail page)
export function useExperiment(slug: string) {
  const [data, setData] = useState<ExperimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No experiment slug provided');
      setIsLoading(false);
      return;
    }

    fetchExperiment();
  }, [slug]);

  const fetchExperiment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching experiment with slug:', slug);

      // Fetch experiment with its steps
      const { data: experimentData, error: experimentError } = await supabase
        .from('experiments')
        .select(`
          *,
          experiment_steps (
            id,
            step_number,
            title,
            instructions,
            expected_results,
            safety_notes,
            assets,
            validation_rules,
            created_at
          )
        `)
        .eq('slug', slug)
        .single();

      if (experimentError) {
        console.error('Supabase error:', experimentError);
        throw experimentError;
      }

      if (!experimentData) {
        throw new Error('Experiment not found');
      }

      console.log('Fetched experiment data:', experimentData);
      console.log('Steps count:', experimentData.experiment_steps?.length || 0);

      // Sort steps by step_number
      const sortedSteps = experimentData.experiment_steps?.sort(
        (a: ExperimentStep, b: ExperimentStep) => a.step_number - b.step_number
      ) || [];

      const processedData: ExperimentData = {
        ...experimentData,
        steps: sortedSteps
      };

      setData(processedData);
    } catch (err) {
      console.error('Error fetching experiment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching the experiment');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch: fetchExperiment };
}