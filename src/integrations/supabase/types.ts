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
      account_snapshots: {
        Row: {
          abs_gain_pct: number | null
          account_id: string
          balance: number | null
          captured_at: string
          daily_pct: number | null
          drawdown_pct: number | null
          equity: number | null
          growth_pct: number | null
          id: string
          monthly_pct: number | null
          open_pl: number | null
          profit: number | null
          user_id: string
        }
        Insert: {
          abs_gain_pct?: number | null
          account_id: string
          balance?: number | null
          captured_at?: string
          daily_pct?: number | null
          drawdown_pct?: number | null
          equity?: number | null
          growth_pct?: number | null
          id?: string
          monthly_pct?: number | null
          open_pl?: number | null
          profit?: number | null
          user_id: string
        }
        Update: {
          abs_gain_pct?: number | null
          account_id?: string
          balance?: number | null
          captured_at?: string
          daily_pct?: number | null
          drawdown_pct?: number | null
          equity?: number | null
          growth_pct?: number | null
          id?: string
          monthly_pct?: number | null
          open_pl?: number | null
          profit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_snapshots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      active_trades: {
        Row: {
          be_activated: boolean | null
          channel_id: number
          closed_at: string | null
          created_at: string | null
          direction: string
          entry_price: number | null
          id: string
          original_message_id: number
          outcome: string | null
          pair: string
          pips_realized: number | null
          raw_text: string | null
          status: string
          stop_loss: number | null
          take_profits: Json | null
          telegram_message_id: string | null
          tp1: number | null
          tp1_hit: boolean | null
          tp2: number | null
          tp2_hit: boolean | null
          tp3: number | null
          tp3_hit: boolean | null
          updated_at: string | null
        }
        Insert: {
          be_activated?: boolean | null
          channel_id: number
          closed_at?: string | null
          created_at?: string | null
          direction: string
          entry_price?: number | null
          id?: string
          original_message_id: number
          outcome?: string | null
          pair: string
          pips_realized?: number | null
          raw_text?: string | null
          status?: string
          stop_loss?: number | null
          take_profits?: Json | null
          telegram_message_id?: string | null
          tp1?: number | null
          tp1_hit?: boolean | null
          tp2?: number | null
          tp2_hit?: boolean | null
          tp3?: number | null
          tp3_hit?: boolean | null
          updated_at?: string | null
        }
        Update: {
          be_activated?: boolean | null
          channel_id?: number
          closed_at?: string | null
          created_at?: string | null
          direction?: string
          entry_price?: number | null
          id?: string
          original_message_id?: number
          outcome?: string | null
          pair?: string
          pips_realized?: number | null
          raw_text?: string | null
          status?: string
          stop_loss?: number | null
          take_profits?: Json | null
          telegram_message_id?: string | null
          tp1?: number | null
          tp1_hit?: boolean | null
          tp2?: number | null
          tp2_hit?: boolean | null
          tp3?: number | null
          tp3_hit?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_trades_telegram_message_id_fkey"
            columns: ["telegram_message_id"]
            isOneToOne: false
            referencedRelation: "telegram_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_copy_insights: {
        Row: {
          follower_account_id: string | null
          generated_at: string
          id: string
          payload: Json
          user_id: string
        }
        Insert: {
          follower_account_id?: string | null
          generated_at?: string
          id?: string
          payload?: Json
          user_id: string
        }
        Update: {
          follower_account_id?: string | null
          generated_at?: string
          id?: string
          payload?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_copy_insights_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          account_id: string | null
          body: string | null
          created_at: string
          id: string
          kind: string
          metadata: Json | null
          score: number | null
          title: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          metadata?: Json | null
          score?: number | null
          title: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json | null
          score?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
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
      ai_news: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          description: string | null
          id: number
          published_at: string | null
          source: string | null
          title: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          published_at?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          published_at?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      ai_risk_reports: {
        Row: {
          follower_account_id: string | null
          generated_at: string
          id: string
          payload: Json
          user_id: string
        }
        Insert: {
          follower_account_id?: string | null
          generated_at?: string
          id?: string
          payload?: Json
          user_id: string
        }
        Update: {
          follower_account_id?: string | null
          generated_at?: string
          id?: string
          payload?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_risk_reports_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_trader_scores: {
        Row: {
          breakdown: Json
          follower_account_id: string | null
          generated_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          breakdown?: Json
          follower_account_id?: string | null
          generated_at?: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          breakdown?: Json
          follower_account_id?: string | null
          generated_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_trader_scores_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      api_response_audit: {
        Row: {
          endpoint_url: string
          error_details: string | null
          events_parsed: number | null
          http_status: number | null
          id: string
          raw_sample: Json | null
          response_size_bytes: number | null
          response_time_ms: number | null
          source_name: string
          success: boolean
          timestamp: string
        }
        Insert: {
          endpoint_url: string
          error_details?: string | null
          events_parsed?: number | null
          http_status?: number | null
          id?: string
          raw_sample?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          source_name: string
          success?: boolean
          timestamp?: string
        }
        Update: {
          endpoint_url?: string
          error_details?: string | null
          events_parsed?: number | null
          http_status?: number | null
          id?: string
          raw_sample?: Json | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          source_name?: string
          success?: boolean
          timestamp?: string
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
      copy_activity: {
        Row: {
          action: string
          copy_job_id: string | null
          follower_account_id: string | null
          id: string
          master_account_id: string | null
          occurred_at: string
          pnl: number | null
          price: number | null
          result: string | null
          symbol: string | null
          user_id: string
          volume: number | null
        }
        Insert: {
          action: string
          copy_job_id?: string | null
          follower_account_id?: string | null
          id?: string
          master_account_id?: string | null
          occurred_at?: string
          pnl?: number | null
          price?: number | null
          result?: string | null
          symbol?: string | null
          user_id: string
          volume?: number | null
        }
        Update: {
          action?: string
          copy_job_id?: string | null
          follower_account_id?: string | null
          id?: string
          master_account_id?: string | null
          occurred_at?: string
          pnl?: number | null
          price?: number | null
          result?: string | null
          symbol?: string | null
          user_id?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_activity_copy_job_id_fkey"
            columns: ["copy_job_id"]
            isOneToOne: false
            referencedRelation: "copy_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_activity_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_activity_master_account_id_fkey"
            columns: ["master_account_id"]
            isOneToOne: false
            referencedRelation: "master_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["copy_event_type"]
          id: string
          master_account_id: string
          master_ticket: string | null
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["copy_event_type"]
          id?: string
          master_account_id: string
          master_ticket?: string | null
          payload?: Json
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["copy_event_type"]
          id?: string
          master_account_id?: string
          master_ticket?: string | null
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "copy_events_master_account_id_fkey"
            columns: ["master_account_id"]
            isOneToOne: false
            referencedRelation: "master_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_jobs: {
        Row: {
          attempts: number
          broker_ticket: string | null
          copy_event_id: string
          copy_relationship_id: string
          created_at: string
          executed_at: string | null
          executed_price: number | null
          executed_volume: number | null
          follower_account_id: string
          id: string
          last_error: string | null
          planned_volume: number | null
          status: Database["public"]["Enums"]["copy_job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          broker_ticket?: string | null
          copy_event_id: string
          copy_relationship_id: string
          created_at?: string
          executed_at?: string | null
          executed_price?: number | null
          executed_volume?: number | null
          follower_account_id: string
          id?: string
          last_error?: string | null
          planned_volume?: number | null
          status?: Database["public"]["Enums"]["copy_job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          broker_ticket?: string | null
          copy_event_id?: string
          copy_relationship_id?: string
          created_at?: string
          executed_at?: string | null
          executed_price?: number | null
          executed_volume?: number | null
          follower_account_id?: string
          id?: string
          last_error?: string | null
          planned_volume?: number | null
          status?: Database["public"]["Enums"]["copy_job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_jobs_copy_event_id_fkey"
            columns: ["copy_event_id"]
            isOneToOne: false
            referencedRelation: "copy_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_jobs_copy_relationship_id_fkey"
            columns: ["copy_relationship_id"]
            isOneToOne: false
            referencedRelation: "copy_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_jobs_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_relationships: {
        Row: {
          copy_config: Json
          copy_mode: Database["public"]["Enums"]["copy_mode"]
          created_at: string
          follower_account_id: string
          id: string
          master_account_id: string
          status: Database["public"]["Enums"]["copy_relationship_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          copy_config?: Json
          copy_mode?: Database["public"]["Enums"]["copy_mode"]
          created_at?: string
          follower_account_id: string
          id?: string
          master_account_id: string
          status?: Database["public"]["Enums"]["copy_relationship_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          copy_config?: Json
          copy_mode?: Database["public"]["Enums"]["copy_mode"]
          created_at?: string
          follower_account_id?: string
          id?: string
          master_account_id?: string
          status?: Database["public"]["Enums"]["copy_relationship_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_relationships_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: false
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_relationships_master_account_id_fkey"
            columns: ["master_account_id"]
            isOneToOne: false
            referencedRelation: "master_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_settings: {
        Row: {
          auto_pause_on_drawdown: boolean
          blacklist_symbols: string[] | null
          created_at: string
          follower_account_id: string
          id: string
          notifications: Json
          updated_at: string
          user_id: string
          whitelist_symbols: string[] | null
        }
        Insert: {
          auto_pause_on_drawdown?: boolean
          blacklist_symbols?: string[] | null
          created_at?: string
          follower_account_id: string
          id?: string
          notifications?: Json
          updated_at?: string
          user_id: string
          whitelist_symbols?: string[] | null
        }
        Update: {
          auto_pause_on_drawdown?: boolean
          blacklist_symbols?: string[] | null
          created_at?: string
          follower_account_id?: string
          id?: string
          notifications?: Json
          updated_at?: string
          user_id?: string
          whitelist_symbols?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_settings_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: true
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ctrader_connections: {
        Row: {
          access_token: string
          accounts: Json | null
          connected_at: string
          created_at: string
          expires_at: string
          id: string
          last_sync: string | null
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          accounts?: Json | null
          connected_at?: string
          created_at?: string
          expires_at: string
          id?: string
          last_sync?: string | null
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          accounts?: Json | null
          connected_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_sync?: string | null
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_reviews: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          metrics: Json | null
          review_date: string
          summary: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          metrics?: Json | null
          review_date: string
          summary?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          metrics?: Json | null
          review_date?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reviews_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_source_heartbeat: {
        Row: {
          created_at: string
          error_message: string | null
          events_count: number | null
          id: string
          last_check: string
          response_time_ms: number | null
          source_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          events_count?: number | null
          id?: string
          last_check?: string
          response_time_ms?: number | null
          source_name: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          events_count?: number | null
          id?: string
          last_check?: string
          response_time_ms?: number | null
          source_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      economic_events: {
        Row: {
          actual: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          event_id: string | null
          event_time: string | null
          forecast: string | null
          id: number
          impact: string | null
          previous: string | null
          relevance: number | null
          source: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          event_id?: string | null
          event_time?: string | null
          forecast?: string | null
          id?: never
          impact?: string | null
          previous?: string | null
          relevance?: number | null
          source?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          event_id?: string | null
          event_time?: string | null
          forecast?: string | null
          id?: never
          impact?: string | null
          previous?: string | null
          relevance?: number | null
          source?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_analysis: {
        Row: {
          affected_pairs: string[] | null
          ai_summary: string
          confidence_score: number | null
          created_at: string
          event_id: string
          id: string
          market_sentiment: string
          trade_opportunity: string | null
          updated_at: string
          volatility_level: string | null
        }
        Insert: {
          affected_pairs?: string[] | null
          ai_summary: string
          confidence_score?: number | null
          created_at?: string
          event_id: string
          id?: string
          market_sentiment: string
          trade_opportunity?: string | null
          updated_at?: string
          volatility_level?: string | null
        }
        Update: {
          affected_pairs?: string[] | null
          ai_summary?: string
          confidence_score?: number | null
          created_at?: string
          event_id?: string
          id?: string
          market_sentiment?: string
          trade_opportunity?: string | null
          updated_at?: string
          volatility_level?: string | null
        }
        Relationships: []
      }
      event_verification: {
        Row: {
          actual_value: string | null
          conflicts: string[] | null
          consensus_score: number
          created_at: string
          event_currency: string
          event_time: string
          event_title: string
          forecast_value: string | null
          id: string
          matches_count: number
          previous_value: string | null
          sources: string[]
          verified_at: string
        }
        Insert: {
          actual_value?: string | null
          conflicts?: string[] | null
          consensus_score?: number
          created_at?: string
          event_currency: string
          event_time: string
          event_title: string
          forecast_value?: string | null
          id?: string
          matches_count?: number
          previous_value?: string | null
          sources?: string[]
          verified_at?: string
        }
        Update: {
          actual_value?: string | null
          conflicts?: string[] | null
          consensus_score?: number
          created_at?: string
          event_currency?: string
          event_time?: string
          event_title?: string
          forecast_value?: string | null
          id?: string
          matches_count?: number
          previous_value?: string | null
          sources?: string[]
          verified_at?: string
        }
        Relationships: []
      }
      execution_logs: {
        Row: {
          context: Json | null
          copy_job_id: string | null
          created_at: string
          id: string
          level: string
          message: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          copy_job_id?: string | null
          created_at?: string
          id?: string
          level?: string
          message: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          copy_job_id?: string | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_copy_job_id_fkey"
            columns: ["copy_job_id"]
            isOneToOne: false
            referencedRelation: "copy_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      follower_accounts: {
        Row: {
          account_number: string
          balance: number | null
          broker: string | null
          connection_status: Database["public"]["Enums"]["follower_conn_status"]
          created_at: string
          currency: string | null
          encrypted_password: string | null
          encryption_iv: string | null
          equity: number | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          leverage: number | null
          server: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          balance?: number | null
          broker?: string | null
          connection_status?: Database["public"]["Enums"]["follower_conn_status"]
          created_at?: string
          currency?: string | null
          encrypted_password?: string | null
          encryption_iv?: string | null
          equity?: number | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          leverage?: number | null
          server: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          balance?: number | null
          broker?: string | null
          connection_status?: Database["public"]["Enums"]["follower_conn_status"]
          created_at?: string
          currency?: string | null
          encrypted_password?: string | null
          encryption_iv?: string | null
          equity?: number | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          leverage?: number | null
          server?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      master_accounts: {
        Row: {
          account_number: string | null
          balance: number | null
          broker: string | null
          created_at: string
          created_by: string | null
          drawdown: number | null
          equity: number | null
          growth: number | null
          id: string
          is_active: boolean
          name: string
          server: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          balance?: number | null
          broker?: string | null
          created_at?: string
          created_by?: string | null
          drawdown?: number | null
          equity?: number | null
          growth?: number | null
          id?: string
          is_active?: boolean
          name: string
          server?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          balance?: number | null
          broker?: string | null
          created_at?: string
          created_by?: string | null
          drawdown?: number | null
          equity?: number | null
          growth?: number | null
          id?: string
          is_active?: boolean
          name?: string
          server?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_events: {
        Row: {
          actual: string | null
          country: string | null
          created_at: string | null
          date: string | null
          event_id: string | null
          forecast: string | null
          id: number
          impact: string | null
          previous: string | null
          source: string | null
          title: string | null
        }
        Insert: {
          actual?: string | null
          country?: string | null
          created_at?: string | null
          date?: string | null
          event_id?: string | null
          forecast?: string | null
          id?: number
          impact?: string | null
          previous?: string | null
          source?: string | null
          title?: string | null
        }
        Update: {
          actual?: string | null
          country?: string | null
          created_at?: string | null
          date?: string | null
          event_id?: string | null
          forecast?: string | null
          id?: number
          impact?: string | null
          previous?: string | null
          source?: string | null
          title?: string | null
        }
        Relationships: []
      }
      parsed_signals: {
        Row: {
          confidence: number | null
          created_at: string
          direction: string | null
          entry_price: number | null
          id: string
          parsed_at: string | null
          raw_text: string
          rejection_reason: string | null
          status: string
          stop_loss: number | null
          symbol: string | null
          take_profit_levels: number[] | null
          telegram_message_id: string | null
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          direction?: string | null
          entry_price?: number | null
          id?: string
          parsed_at?: string | null
          raw_text: string
          rejection_reason?: string | null
          status?: string
          stop_loss?: number | null
          symbol?: string | null
          take_profit_levels?: number[] | null
          telegram_message_id?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          direction?: string | null
          entry_price?: number | null
          id?: string
          parsed_at?: string | null
          raw_text?: string
          rejection_reason?: string | null
          status?: string
          stop_loss?: number | null
          symbol?: string | null
          take_profit_levels?: number[] | null
          telegram_message_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parsed_signals_telegram_message_id_fkey"
            columns: ["telegram_message_id"]
            isOneToOne: false
            referencedRelation: "telegram_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          account_id: string
          avg_loss: number | null
          avg_win: number | null
          best_trade: number | null
          computed_at: string
          id: string
          losses: number | null
          period: string
          profit_factor: number | null
          total_pips: number | null
          total_profit: number | null
          trades: number | null
          user_id: string
          win_rate: number | null
          wins: number | null
          worst_trade: number | null
        }
        Insert: {
          account_id: string
          avg_loss?: number | null
          avg_win?: number | null
          best_trade?: number | null
          computed_at?: string
          id?: string
          losses?: number | null
          period?: string
          profit_factor?: number | null
          total_pips?: number | null
          total_profit?: number | null
          trades?: number | null
          user_id: string
          win_rate?: number | null
          wins?: number | null
          worst_trade?: number | null
        }
        Update: {
          account_id?: string
          avg_loss?: number | null
          avg_win?: number | null
          best_trade?: number | null
          computed_at?: string
          id?: string
          losses?: number | null
          period?: string
          profit_factor?: number | null
          total_pips?: number | null
          total_profit?: number | null
          trades?: number | null
          user_id?: string
          win_rate?: number | null
          wins?: number | null
          worst_trade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      Premium: {
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
      risk_profiles: {
        Row: {
          created_at: string
          equity_floor: number | null
          follower_account_id: string
          id: string
          max_daily_drawdown_pct: number
          max_drawdown_pct: number
          max_lot_size: number
          max_open_trades: number
          min_margin_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equity_floor?: number | null
          follower_account_id: string
          id?: string
          max_daily_drawdown_pct?: number
          max_drawdown_pct?: number
          max_lot_size?: number
          max_open_trades?: number
          min_margin_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          equity_floor?: number | null
          follower_account_id?: string
          id?: string
          max_daily_drawdown_pct?: number
          max_drawdown_pct?: number
          max_lot_size?: number
          max_open_trades?: number
          min_margin_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_profiles_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: true
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          stripe_event_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          plan_name: string
          plan_type: string | null
          premium_expires_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
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
          plan_type?: string | null
          premium_expires_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
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
          plan_type?: string | null
          premium_expires_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          error_count: number
          follower_account_id: string
          id: string
          last_heartbeat: string | null
          latency_ms: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          error_count?: number
          follower_account_id: string
          id?: string
          last_heartbeat?: string | null
          latency_ms?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          error_count?: number
          follower_account_id?: string
          id?: string
          last_heartbeat?: string | null
          latency_ms?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_status_follower_account_id_fkey"
            columns: ["follower_account_id"]
            isOneToOne: true
            referencedRelation: "follower_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_messages: {
        Row: {
          channel_id: number
          created_at: string
          edit_date: string | null
          edited: boolean
          id: string
          message_id: number
          original_date: string | null
          raw_text: string | null
          reply_to_message_id: number | null
          thread_id: number | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          channel_id: number
          created_at?: string
          edit_date?: string | null
          edited?: boolean
          id?: string
          message_id: number
          original_date?: string | null
          raw_text?: string | null
          reply_to_message_id?: number | null
          thread_id?: number | null
          timestamp?: string
          updated_at?: string
        }
        Update: {
          channel_id?: number
          created_at?: string
          edit_date?: string | null
          edited?: boolean
          id?: string
          message_id?: number
          original_date?: string | null
          raw_text?: string | null
          reply_to_message_id?: number | null
          thread_id?: number | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      trade_closures: {
        Row: {
          broker_ticket: string | null
          close_price: number | null
          close_type: string
          copy_job_id: string | null
          created_at: string
          id: string
          pnl: number | null
          user_id: string
          volume_closed: number | null
        }
        Insert: {
          broker_ticket?: string | null
          close_price?: number | null
          close_type: string
          copy_job_id?: string | null
          created_at?: string
          id?: string
          pnl?: number | null
          user_id: string
          volume_closed?: number | null
        }
        Update: {
          broker_ticket?: string | null
          close_price?: number | null
          close_type?: string
          copy_job_id?: string | null
          created_at?: string
          id?: string
          pnl?: number | null
          user_id?: string
          volume_closed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_closures_copy_job_id_fkey"
            columns: ["copy_job_id"]
            isOneToOne: false
            referencedRelation: "copy_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_history: {
        Row: {
          account_id: string
          close_price: number | null
          close_time: string | null
          comment: string | null
          commission: number | null
          created_at: string
          external_ticket: string | null
          id: string
          lots: number | null
          open_price: number | null
          open_time: string | null
          pips: number | null
          profit: number | null
          raw: Json | null
          side: string | null
          swap: number | null
          symbol: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          close_price?: number | null
          close_time?: string | null
          comment?: string | null
          commission?: number | null
          created_at?: string
          external_ticket?: string | null
          id?: string
          lots?: number | null
          open_price?: number | null
          open_time?: string | null
          pips?: number | null
          profit?: number | null
          raw?: Json | null
          side?: string | null
          swap?: number | null
          symbol?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          close_price?: number | null
          close_time?: string | null
          comment?: string | null
          commission?: number | null
          created_at?: string
          external_ticket?: string | null
          id?: string
          lots?: number | null
          open_price?: number | null
          open_time?: string | null
          pips?: number | null
          profit?: number | null
          raw?: Json | null
          side?: string | null
          swap?: number | null
          symbol?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_modifications: {
        Row: {
          broker_ticket: string | null
          copy_job_id: string | null
          created_at: string
          id: string
          new_sl: number | null
          new_tp: number | null
          old_sl: number | null
          old_tp: number | null
          user_id: string
        }
        Insert: {
          broker_ticket?: string | null
          copy_job_id?: string | null
          created_at?: string
          id?: string
          new_sl?: number | null
          new_tp?: number | null
          old_sl?: number | null
          old_tp?: number | null
          user_id: string
        }
        Update: {
          broker_ticket?: string | null
          copy_job_id?: string | null
          created_at?: string
          id?: string
          new_sl?: number | null
          new_tp?: number | null
          old_sl?: number | null
          old_tp?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_modifications_copy_job_id_fkey"
            columns: ["copy_job_id"]
            isOneToOne: false
            referencedRelation: "copy_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_setups: {
        Row: {
          ai_feedback: Json | null
          ai_score: number | null
          created_at: string
          direction: string
          entry_price: number | null
          entry_reason: string
          id: string
          pair: string
          risk_percentage: number | null
          screenshot_url: string | null
          status: string | null
          stop_loss: number
          take_profit: number
          timeframe: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          ai_score?: number | null
          created_at?: string
          direction: string
          entry_price?: number | null
          entry_reason: string
          id?: string
          pair: string
          risk_percentage?: number | null
          screenshot_url?: string | null
          status?: string | null
          stop_loss: number
          take_profit: number
          timeframe?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          ai_score?: number | null
          created_at?: string
          direction?: string
          entry_price?: number | null
          entry_reason?: string
          id?: string
          pair?: string
          risk_percentage?: number | null
          screenshot_url?: string | null
          status?: string | null
          stop_loss?: number
          take_profit?: number
          timeframe?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trader_scores: {
        Row: {
          account_id: string | null
          breakdown: Json | null
          computed_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          account_id?: string | null
          breakdown?: Json | null
          computed_at?: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          account_id?: string | null
          breakdown?: Json | null
          computed_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trader_scores_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_login: string | null
          account_name: string
          broker: string | null
          created_at: string
          currency: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          leverage: number | null
          provider: string
          provider_account_id: string | null
          server: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_login?: string | null
          account_name: string
          broker?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          leverage?: number | null
          provider?: string
          provider_account_id?: string | null
          server?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_login?: string | null
          account_name?: string
          broker?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          leverage?: number | null
          provider?: string
          provider_account_id?: string | null
          server?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
      user_profiles: {
        Row: {
          broker_group: string | null
          country: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          has_traded_forex: boolean | null
          has_trading_account: boolean | null
          id: string
          is_premium: boolean | null
          onboarding_status: string
          onboarding_step: number
          phone_number: string | null
          plan_type: string | null
          premium_expires_at: string | null
          referral_source: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          telegram_id: number | null
          telegram_link_code: string | null
          telegram_link_expires: string | null
          telegram_username: string | null
          trader_type: string | null
          trial_end: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
          username: string | null
          weekly_email_enabled: boolean | null
        }
        Insert: {
          broker_group?: string | null
          country: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          has_traded_forex?: boolean | null
          has_trading_account?: boolean | null
          id?: string
          is_premium?: boolean | null
          onboarding_status?: string
          onboarding_step?: number
          phone_number?: string | null
          plan_type?: string | null
          premium_expires_at?: string | null
          referral_source?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          telegram_id?: number | null
          telegram_link_code?: string | null
          telegram_link_expires?: string | null
          telegram_username?: string | null
          trader_type?: string | null
          trial_end?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          weekly_email_enabled?: boolean | null
        }
        Update: {
          broker_group?: string | null
          country?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          has_traded_forex?: boolean | null
          has_trading_account?: boolean | null
          id?: string
          is_premium?: boolean | null
          onboarding_status?: string
          onboarding_step?: number
          phone_number?: string | null
          plan_type?: string | null
          premium_expires_at?: string | null
          referral_source?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          telegram_id?: number | null
          telegram_link_code?: string | null
          telegram_link_expires?: string | null
          telegram_username?: string | null
          trader_type?: string | null
          trial_end?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          weekly_email_enabled?: boolean | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          created_at: string | null
          feature: string
          id: string
          updated_at: string | null
          usage_count: number
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature: string
          id?: string
          updated_at?: string | null
          usage_count?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature?: string
          id?: string
          updated_at?: string | null
          usage_count?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          account_number: string | null
          ai_confidence: number | null
          ai_raw: Json | null
          broker: string | null
          created_at: string
          id: string
          notes: string | null
          platform: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          trader_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          ai_confidence?: number | null
          ai_raw?: Json | null
          broker?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          platform?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          trader_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          ai_confidence?: number | null
          ai_raw?: Json | null
          broker?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          platform?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          trader_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_screenshots: {
        Row: {
          ai_extraction: Json | null
          created_at: string
          id: string
          kind: string
          request_id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          ai_extraction?: Json | null
          created_at?: string
          id?: string
          kind: string
          request_id: string
          storage_path: string
          user_id: string
        }
        Update: {
          ai_extraction?: Json | null
          created_at?: string
          id?: string
          kind?: string
          request_id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_screenshots_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          metrics: Json | null
          summary: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          metrics?: Json | null
          summary?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          metrics?: Json | null
          summary?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cron_job_status: {
        Row: {
          active: boolean | null
          command: string | null
          database: string | null
          jobid: number | null
          jobname: string | null
          nodename: string | null
          schedule: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          schedule?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          schedule?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_trade_pips:
        | {
            Args: {
              p_direction: string
              p_entry: number
              p_pair: string
              p_target: number
            }
            Returns: number
          }
        | {
            Args: {
              p_direction: string
              p_entry: number
              p_pair: string
              p_target: number
            }
            Returns: number
          }
      check_and_increment_usage: {
        Args: { p_daily_limit: number; p_feature: string; p_user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      app_role: "member" | "admin"
      copy_event_type: "OPEN" | "MODIFY" | "PARTIAL_CLOSE" | "FULL_CLOSE"
      copy_job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "rejected"
      copy_mode: "fixed_lot" | "risk_percent" | "balance_multiplier"
      copy_relationship_status: "active" | "paused" | "stopped"
      follower_conn_status:
        | "connected"
        | "connecting"
        | "syncing"
        | "disconnected"
        | "error"
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
    Enums: {
      app_role: ["member", "admin"],
      copy_event_type: ["OPEN", "MODIFY", "PARTIAL_CLOSE", "FULL_CLOSE"],
      copy_job_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "rejected",
      ],
      copy_mode: ["fixed_lot", "risk_percent", "balance_multiplier"],
      copy_relationship_status: ["active", "paused", "stopped"],
      follower_conn_status: [
        "connected",
        "connecting",
        "syncing",
        "disconnected",
        "error",
      ],
    },
  },
} as const
