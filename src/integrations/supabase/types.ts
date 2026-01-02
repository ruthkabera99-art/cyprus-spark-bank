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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      collateral_documents: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          id: string
          loan_application_id: string
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          id?: string
          loan_application_id: string
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          loan_application_id?: string
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collateral_documents_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_balances: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string
          id: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency: string
          id?: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          amount: number
          amount_paid: number | null
          approved_at: string | null
          collateral_description: string | null
          collateral_type: Database["public"]["Enums"]["collateral_type"]
          collateral_value: number
          crypto_amount: number | null
          crypto_currency: string | null
          id: string
          interest_rate: number
          ltv_ratio: number | null
          monthly_payment: number
          next_payment_date: string | null
          purpose: string
          remaining_payments: number | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["loan_status"] | null
          submitted_at: string | null
          term_months: number
          user_id: string
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          approved_at?: string | null
          collateral_description?: string | null
          collateral_type: Database["public"]["Enums"]["collateral_type"]
          collateral_value: number
          crypto_amount?: number | null
          crypto_currency?: string | null
          id?: string
          interest_rate: number
          ltv_ratio?: number | null
          monthly_payment: number
          next_payment_date?: string | null
          purpose: string
          remaining_payments?: number | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          submitted_at?: string | null
          term_months: number
          user_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          approved_at?: string | null
          collateral_description?: string | null
          collateral_type?: Database["public"]["Enums"]["collateral_type"]
          collateral_value?: number
          crypto_amount?: number | null
          crypto_currency?: string | null
          id?: string
          interest_rate?: number
          ltv_ratio?: number | null
          monthly_payment?: number
          next_payment_date?: string | null
          purpose?: string
          remaining_payments?: number | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          submitted_at?: string | null
          term_months?: number
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          balance_changes_enabled: boolean
          created_at: string | null
          id: string
          loan_updates_enabled: boolean
          transactions_enabled: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_changes_enabled?: boolean
          created_at?: string | null
          id?: string
          loan_updates_enabled?: boolean
          transactions_enabled?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_changes_enabled?: boolean
          created_at?: string | null
          id?: string
          loan_updates_enabled?: boolean
          transactions_enabled?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          traditional_balance: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          traditional_balance?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          traditional_balance?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          network_fee: number | null
          recipient_address: string | null
          reference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          currency: string
          description?: string | null
          id?: string
          network_fee?: number | null
          recipient_address?: string | null
          reference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          network_fee?: number | null
          recipient_address?: string | null
          reference_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      collateral_type:
        | "real_estate"
        | "vehicle"
        | "equipment"
        | "crypto"
        | "other"
      loan_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "active"
        | "paid_off"
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
      app_role: ["admin", "user"],
      collateral_type: [
        "real_estate",
        "vehicle",
        "equipment",
        "crypto",
        "other",
      ],
      loan_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "active",
        "paid_off",
      ],
    },
  },
} as const
