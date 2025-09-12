export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_memory: {
        Row: {
          content: string
          context: Json | null
          created_at: string
          id: string
          importance_score: number | null
          memory_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          context?: Json | null
          created_at?: string
          id?: string
          importance_score?: number | null
          memory_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          context?: Json | null
          created_at?: string
          id?: string
          importance_score?: number | null
          memory_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consensus_audit: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          parse_time_ms: number | null
          provider_name: string | null
          raw_response: Json | null
          request_payload: Json
          signal_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          parse_time_ms?: number | null
          provider_name?: string | null
          raw_response?: Json | null
          request_payload: Json
          signal_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          parse_time_ms?: number | null
          provider_name?: string | null
          raw_response?: Json | null
          request_payload?: Json
          signal_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consensus_audit_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_signals: {
        Row: {
          created_at: string
          id: string
          processed: boolean
          raw_data: Json
          source: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          processed?: boolean
          raw_data: Json
          source: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          processed?: boolean
          raw_data?: Json
          source?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_feedback: string | null
          created_at: string
          direction: string
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          feelings: string | null
          fees: number | null
          id: string
          lot_size: number | null
          mistakes: string | null
          notes: string | null
          pair: string
          result_percentage: number | null
          result_pips: number | null
          risk_reward_ratio: number | null
          status: string
          strategy: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          direction: string
          entry_price: number
          entry_time: string
          exit_price?: number | null
          exit_time?: string | null
          feelings?: string | null
          fees?: number | null
          id?: string
          lot_size?: number | null
          mistakes?: string | null
          notes?: string | null
          pair: string
          result_percentage?: number | null
          result_pips?: number | null
          risk_reward_ratio?: number | null
          status?: string
          strategy: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          direction?: string
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          feelings?: string | null
          fees?: number | null
          id?: string
          lot_size?: number | null
          mistakes?: string | null
          notes?: string | null
          pair?: string
          result_percentage?: number | null
          result_pips?: number | null
          risk_reward_ratio?: number | null
          status?: string
          strategy?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_metrics: {
        Row: {
          created_at: string
          id: string
          metrics: Json
        }
        Insert: {
          created_at?: string
          id?: string
          metrics: Json
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          interactions_count: number | null
          performance_score: number | null
          session_type: string
          start_time: string
          topics_covered: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          interactions_count?: number | null
          performance_score?: number | null
          session_type: string
          start_time?: string
          topics_covered?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          interactions_count?: number | null
          performance_score?: number | null
          session_type?: string
          start_time?: string
          topics_covered?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      signal_outcomes: {
        Row: {
          ai_votes: Json
          confluence_score: number
          created_at: string
          direction: string
          duration_hours: number | null
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          id: string
          market_conditions: Json | null
          outcome: string | null
          pair: string
          pips_gained: number | null
          rr_achieved: number | null
          session_type: string
          signal_id: string
          stop_loss: number
          strategy_used: string[] | null
          take_profit: number
          updated_at: string
        }
        Insert: {
          ai_votes?: Json
          confluence_score: number
          created_at?: string
          direction: string
          duration_hours?: number | null
          entry_price: number
          entry_time: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          market_conditions?: Json | null
          outcome?: string | null
          pair: string
          pips_gained?: number | null
          rr_achieved?: number | null
          session_type: string
          signal_id: string
          stop_loss: number
          strategy_used?: string[] | null
          take_profit: number
          updated_at?: string
        }
        Update: {
          ai_votes?: Json
          confluence_score?: number
          created_at?: string
          direction?: string
          duration_hours?: number | null
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          market_conditions?: Json | null
          outcome?: string | null
          pair?: string
          pips_gained?: number | null
          rr_achieved?: number | null
          session_type?: string
          signal_id?: string
          stop_loss?: number
          strategy_used?: string[] | null
          take_profit?: number
          updated_at?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          ai_votes: Json | null
          confidence: number | null
          confluence_bucket: number | null
          consensus: Json | null
          created_at: string | null
          decision: Json | null
          direction: string
          entry_price: number | null
          expected_value: number | null
          filters: Json | null
          id: string
          max_ai_score: number | null
          outcome: string | null
          outcome_price: number | null
          outcome_time: string | null
          pair: string
          pips_result: number | null
          raw_ai_responses: Json | null
          rejection_reasons: string[] | null
          risk_reward_ratio: number | null
          rr_achieved: number | null
          session_type: string | null
          signal_type: string
          status: string
          stop_loss: number | null
          strategy_results: Json | null
          take_profit: number | null
          ui_label: string | null
          updated_at: string | null
          user_id: string | null
          weighted_ai_score: number | null
        }
        Insert: {
          ai_votes?: Json | null
          confidence?: number | null
          confluence_bucket?: number | null
          consensus?: Json | null
          created_at?: string | null
          decision?: Json | null
          direction: string
          entry_price?: number | null
          expected_value?: number | null
          filters?: Json | null
          id?: string
          max_ai_score?: number | null
          outcome?: string | null
          outcome_price?: number | null
          outcome_time?: string | null
          pair: string
          pips_result?: number | null
          raw_ai_responses?: Json | null
          rejection_reasons?: string[] | null
          risk_reward_ratio?: number | null
          rr_achieved?: number | null
          session_type?: string | null
          signal_type: string
          status?: string
          stop_loss?: number | null
          strategy_results?: Json | null
          take_profit?: number | null
          ui_label?: string | null
          updated_at?: string | null
          user_id?: string | null
          weighted_ai_score?: number | null
        }
        Update: {
          ai_votes?: Json | null
          confidence?: number | null
          confluence_bucket?: number | null
          consensus?: Json | null
          created_at?: string | null
          decision?: Json | null
          direction?: string
          entry_price?: number | null
          expected_value?: number | null
          filters?: Json | null
          id?: string
          max_ai_score?: number | null
          outcome?: string | null
          outcome_price?: number | null
          outcome_time?: string | null
          pair?: string
          pips_result?: number | null
          raw_ai_responses?: Json | null
          rejection_reasons?: string[] | null
          risk_reward_ratio?: number | null
          rr_achieved?: number | null
          session_type?: string | null
          signal_type?: string
          status?: string
          stop_loss?: number | null
          strategy_results?: Json | null
          take_profit?: number | null
          ui_label?: string | null
          updated_at?: string | null
          user_id?: string | null
          weighted_ai_score?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          plan_name: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          id?: string
          plan_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          id?: string
          plan_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          data: Json
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          data?: Json
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          data?: Json
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          charts_analyzed: number
          created_at: string
          current_streak: number
          id: string
          max_streak: number
          meme_coins_scanned: number
          messages_sent: number
          preferred_timeframes: string[] | null
          risk_tolerance: string | null
          signals_viewed: number
          skills_mastered: string[] | null
          total_study_time_minutes: number
          trading_games_played: number
          trading_style: string | null
          updated_at: string
          user_id: string
          weaknesses: string[] | null
          win_rate: number
        }
        Insert: {
          charts_analyzed?: number
          created_at?: string
          current_streak?: number
          id?: string
          max_streak?: number
          meme_coins_scanned?: number
          messages_sent?: number
          preferred_timeframes?: string[] | null
          risk_tolerance?: string | null
          signals_viewed?: number
          skills_mastered?: string[] | null
          total_study_time_minutes?: number
          trading_games_played?: number
          trading_style?: string | null
          updated_at?: string
          user_id: string
          weaknesses?: string[] | null
          win_rate?: number
        }
        Update: {
          charts_analyzed?: number
          created_at?: string
          current_streak?: number
          id?: string
          max_streak?: number
          meme_coins_scanned?: number
          messages_sent?: number
          preferred_timeframes?: string[] | null
          risk_tolerance?: string | null
          signals_viewed?: number
          skills_mastered?: string[] | null
          total_study_time_minutes?: number
          trading_games_played?: number
          trading_style?: string | null
          updated_at?: string
          user_id?: string
          weaknesses?: string[] | null
          win_rate?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_progress: {
        Args: {
          p_activity_type: string
          p_duration_minutes?: number
          p_performance_score?: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
