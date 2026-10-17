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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_version: string
          created_at: string
          error_code: string | null
          id: string
          model: string | null
          operation_id: string
          outcome: string
          prism_trace_id: string | null
          summary: string | null
          tool_calls: number
        }
        Insert: {
          agent_version: string
          created_at?: string
          error_code?: string | null
          id?: string
          model?: string | null
          operation_id: string
          outcome: string
          prism_trace_id?: string | null
          summary?: string | null
          tool_calls?: number
        }
        Update: {
          agent_version?: string
          created_at?: string
          error_code?: string | null
          id?: string
          model?: string | null
          operation_id?: string
          outcome?: string
          prism_trace_id?: string | null
          summary?: string | null
          tool_calls?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      allocation_events: {
        Row: {
          actor: string
          created_at: string
          id: number
          operation_id: string | null
          payload: Json
          step: string
        }
        Insert: {
          actor: string
          created_at?: string
          id?: number
          operation_id?: string | null
          payload?: Json
          step: string
        }
        Update: {
          actor?: string
          created_at?: string
          id?: number
          operation_id?: string | null
          payload?: Json
          step?: string
        }
        Relationships: []
      }
      demo_state: {
        Row: {
          agent_version: string
          id: number
          snapshot: Json | null
          snapshot_at: string | null
        }
        Insert: {
          agent_version?: string
          id?: number
          snapshot?: Json | null
          snapshot_at?: string | null
        }
        Update: {
          agent_version?: string
          id?: number
          snapshot?: Json | null
          snapshot_at?: string | null
        }
        Relationships: []
      }
      issuer_ledger: {
        Row: {
          amount_usd: number
          created_at: string
          entry_type: string
          id: number
          operation_id: string | null
          program_id: string
          team_id: string | null
        }
        Insert: {
          amount_usd: number
          created_at?: string
          entry_type: string
          id?: number
          operation_id?: string | null
          program_id: string
          team_id?: string | null
        }
        Update: {
          amount_usd?: number
          created_at?: string
          entry_type?: string
          id?: number
          operation_id?: string | null
          program_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issuer_ledger_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issuer_ledger_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_reconciliation"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "issuer_ledger_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          agent_version: string
          amount_usd: number
          created_at: string
          error_code: string | null
          from_team: string | null
          id: string
          idempotency_key: string
          note: string | null
          prism_session_id: string | null
          program_id: string
          scenario: string | null
          status: string
          to_team: string | null
          type: string
          updated_at: string
        }
        Insert: {
          agent_version?: string
          amount_usd: number
          created_at?: string
          error_code?: string | null
          from_team?: string | null
          id?: string
          idempotency_key: string
          note?: string | null
          prism_session_id?: string | null
          program_id: string
          scenario?: string | null
          status?: string
          to_team?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          agent_version?: string
          amount_usd?: number
          created_at?: string
          error_code?: string | null
          from_team?: string | null
          id?: string
          idempotency_key?: string
          note?: string | null
          prism_session_id?: string | null
          program_id?: string
          scenario?: string | null
          status?: string
          to_team?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          allow_returns: boolean
          created_at: string
          expires_at: string
          id: string
          issuer: string
          name: string
          per_team_cap_usd: number
          total_budget_usd: number
        }
        Insert: {
          allow_returns?: boolean
          created_at?: string
          expires_at: string
          id?: string
          issuer: string
          name: string
          per_team_cap_usd: number
          total_budget_usd: number
        }
        Update: {
          allow_returns?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          issuer?: string
          name?: string
          per_team_cap_usd?: number
          total_budget_usd?: number
        }
        Relationships: []
      }
      reservations: {
        Row: {
          amount_usd: number
          created_at: string
          expires_at: string
          id: string
          operation_id: string
          program_id: string
          released: boolean
          team_id: string | null
        }
        Insert: {
          amount_usd: number
          created_at?: string
          expires_at?: string
          id?: string
          operation_id: string
          program_id: string
          released?: boolean
          team_id?: string | null
        }
        Update: {
          amount_usd?: number
          created_at?: string
          expires_at?: string
          id?: string
          operation_id?: string
          program_id?: string
          released?: boolean
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          eligible: boolean
          id: string
          name: string
          program_id: string
          sort_order: number
        }
        Insert: {
          eligible?: boolean
          id?: string
          name: string
          program_id: string
          sort_order?: number
        }
        Update: {
          eligible?: boolean
          id?: string
          name?: string
          program_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "teams_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      team_reconciliation: {
        Row: {
          eligible: boolean | null
          expected_balance: number | null
          ledger_balance: number | null
          name: string | null
          per_team_cap_usd: number | null
          program_id: string | null
          reserved: number | null
          sort_order: number | null
          team_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_reallocation_v1: {
        Args: { p_amount: number; p_op: string }
        Returns: Json
      }
      apply_reallocation_v2: { Args: { p_op: string }; Returns: Json }
      cp_balance: {
        Args: { p_program: string; p_team: string }
        Returns: number
      }
      cp_check_rules: {
        Args: { p_op: Database["public"]["Tables"]["operations"]["Row"] }
        Returns: string
      }
      cp_reserved: {
        Args: { p_exclude_op?: string; p_program: string; p_team: string }
        Returns: number
      }
      demo_insert_batch: { Args: never; Returns: Json }
      demo_reset: { Args: never; Returns: Json }
      demo_seed: { Args: never; Returns: Json }
      demo_snapshot: { Args: never; Returns: Json }
      reconcile_op: { Args: { p_op: string }; Returns: Json }
      reserve_funds_v1: {
        Args: { p_amount: number; p_op: string; p_team: string }
        Returns: Json
      }
      reserve_funds_v2: { Args: { p_op: string }; Returns: Json }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
