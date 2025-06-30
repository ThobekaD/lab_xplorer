export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          xp: number;
          role: 'student' | 'teacher' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          xp?: number;
          role?: 'student' | 'teacher' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          xp?: number;
          role?: 'student' | 'teacher' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          subject: 'physics' | 'chemistry' | 'biology';
          difficulty: number;
          thumbnail_url: string | null;
          is_free: boolean;
          estimated_duration: number | null;
          learning_objectives: string[] | null;
          prerequisites: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          subject: 'physics' | 'chemistry' | 'biology';
          difficulty?: number;
          thumbnail_url?: string | null;
          is_free?: boolean;
          estimated_duration?: number | null;
          learning_objectives?: string[] | null;
          prerequisites?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          subject?: 'physics' | 'chemistry' | 'biology';
          difficulty?: number;
          thumbnail_url?: string | null;
          is_free?: boolean;
          estimated_duration?: number | null;
          learning_objectives?: string[] | null;
          prerequisites?: string[] | null;
          created_at?: string;
        };
      };
      experiment_steps: {
        Row: {
          id: string;
          experiment_id: string;
          step_number: number;
          title: string;
          instructions: any;
          expected_results: any | null;
          safety_notes: string[] | null;
          assets: any | null;
          validation_rules: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          step_number: number;
          title: string;
          instructions: any;
          expected_results?: any | null;
          safety_notes?: string[] | null;
          assets?: any | null;
          validation_rules?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          step_number?: number;
          title?: string;
          instructions?: any;
          expected_results?: any | null;
          safety_notes?: string[] | null;
          assets?: any | null;
          validation_rules?: any | null;
          created_at?: string;
        };
      };
      lab_sessions: {
        Row: {
          id: string;
          experiment_id: string;
          creator_id: string | null;
          session_name: string | null;
          status: 'pending' | 'active' | 'completed' | 'archived';
          max_participants: number;
          started_at: string | null;
          ended_at: string | null;
          session_data: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          creator_id?: string | null;
          session_name?: string | null;
          status?: 'pending' | 'active' | 'completed' | 'archived';
          max_participants?: number;
          started_at?: string | null;
          ended_at?: string | null;
          session_data?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          creator_id?: string | null;
          session_name?: string | null;
          status?: 'pending' | 'active' | 'completed' | 'archived';
          max_participants?: number;
          started_at?: string | null;
          ended_at?: string | null;
          session_data?: any | null;
          created_at?: string;
        };
      };
      session_members: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          role: 'leader' | 'member' | 'observer';
          joined_at: string;
          last_active: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          role?: 'leader' | 'member' | 'observer';
          joined_at?: string;
          last_active?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          role?: 'leader' | 'member' | 'observer';
          joined_at?: string;
          last_active?: string;
        };
      };
      notebook_entries: {
        Row: {
          id: string;
          session_id: string;
          author_id: string | null;
          entry_type: 'text' | 'measurement' | 'observation' | 'image' | 'graph';
          content: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          author_id?: string | null;
          entry_type?: 'text' | 'measurement' | 'observation' | 'image' | 'graph';
          content: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          author_id?: string | null;
          entry_type?: 'text' | 'measurement' | 'observation' | 'image' | 'graph';
          content?: any;
          created_at?: string;
        };
      };
      measurements: {
        Row: {
          id: string;
          session_id: string;
          recorded_by: string | null;
          measurement_name: string;
          value: number | null;
          unit: string | null;
          timestamp_recorded: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          recorded_by?: string | null;
          measurement_name: string;
          value?: number | null;
          unit?: string | null;
          timestamp_recorded?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          recorded_by?: string | null;
          measurement_name?: string;
          value?: number | null;
          unit?: string | null;
          timestamp_recorded?: string;
          notes?: string | null;
        };
      };
      assessments: {
        Row: {
          id: string;
          experiment_id: string;
          assessment_type: 'pre_lab' | 'post_lab' | 'checkpoint';
          question_text: string;
          question_type: 'multiple_choice' | 'numerical' | 'short_answer';
          options: any | null;
          correct_answer: any;
          explanation: string | null;
          difficulty: number;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          assessment_type: 'pre_lab' | 'post_lab' | 'checkpoint';
          question_text: string;
          question_type: 'multiple_choice' | 'numerical' | 'short_answer';
          options?: any | null;
          correct_answer: any;
          explanation?: string | null;
          difficulty?: number;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          assessment_type?: 'pre_lab' | 'post_lab' | 'checkpoint';
          question_text?: string;
          question_type?: 'multiple_choice' | 'numerical' | 'short_answer';
          options?: any | null;
          correct_answer?: any;
          explanation?: string | null;
          difficulty?: number;
        };
      };
      assessment_attempts: {
        Row: {
          id: string;
          assessment_id: string | null;
          user_id: string | null;
          session_id: string | null;
          answers: any;
          score: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          assessment_id?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          answers: any;
          score?: number | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string | null;
          user_id?: string | null;
          session_id?: string | null;
          answers?: any;
          score?: number | null;
          completed_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          user_id: string | null;
          experiment_id: string | null;
          algorand_tx_hash: string | null;
          nft_asset_id: number | null;
          certificate_data: any | null;
          minted_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          experiment_id?: string | null;
          algorand_tx_hash?: string | null;
          nft_asset_id?: number | null;
          certificate_data?: any | null;
          minted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          experiment_id?: string | null;
          algorand_tx_hash?: string | null;
          nft_asset_id?: number | null;
          certificate_data?: any | null;
          minted_at?: string;
        };
      };
      video_lectures: {
        Row: {
          id: string;
          experiment_id: string | null;
          lecture_title: string;
          tavus_video_id: string | null;
          tavus_persona_id: string | null;
          duration_seconds: number | null;
          transcript: string | null;
          language_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id?: string | null;
          lecture_title: string;
          tavus_video_id?: string | null;
          tavus_persona_id?: string | null;
          duration_seconds?: number | null;
          transcript?: string | null;
          language_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string | null;
          lecture_title?: string;
          tavus_video_id?: string | null;
          tavus_persona_id?: string | null;
          duration_seconds?: number | null;
          transcript?: string | null;
          language_code?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          revenuecat_customer_id: string | null;
          subscription_tier: 'free' | 'premium' | 'school';
          is_active: boolean;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          revenuecat_customer_id?: string | null;
          subscription_tier?: 'free' | 'premium' | 'school';
          is_active?: boolean;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          revenuecat_customer_id?: string | null;
          subscription_tier?: 'free' | 'premium' | 'school';
          is_active?: boolean;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string | null;
          achievement_type: string;
          achievement_name: string;
          description: string | null;
          xp_awarded: number;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          achievement_type: string;
          achievement_name: string;
          description?: string | null;
          xp_awarded?: number;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          achievement_type?: string;
          achievement_name?: string;
          description?: string | null;
          xp_awarded?: number;
          earned_at?: string;
        };
      };
      game_scores: {
        Row: {
          id: string;
          user_id: string | null;
          game_type: string;
          subject: 'physics' | 'chemistry' | 'biology' | null;
          score: number;
          time_taken: number | null;
          difficulty_level: number;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          game_type: string;
          subject?: 'physics' | 'chemistry' | 'biology' | null;
          score: number;
          time_taken?: number | null;
          difficulty_level?: number;
          played_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          game_type?: string;
          subject?: 'physics' | 'chemistry' | 'biology' | null;
          score?: number;
          time_taken?: number | null;
          difficulty_level?: number;
          played_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}