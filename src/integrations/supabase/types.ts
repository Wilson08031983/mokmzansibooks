export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_data: {
        Row: {
          created_at: string | null
          data: Json
          data_id: string | null
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          data_id?: string | null
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          data_id?: string | null
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string
          hours_worked: number
          id: string
          is_public_holiday: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          employee_id: string
          hours_worked: number
          id?: string
          is_public_holiday?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string
          hours_worked?: number
          id?: string
          is_public_holiday?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_statements: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          id: string
          matched_transactions: number | null
          processed_date: string | null
          status: string
          total_transactions: number | null
          updated_at: string
          upload_date: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          id?: string
          matched_transactions?: number | null
          processed_date?: string | null
          status?: string
          total_transactions?: number | null
          updated_at?: string
          upload_date?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          id?: string
          matched_transactions?: number | null
          processed_date?: string | null
          status?: string
          total_transactions?: number | null
          updated_at?: string
          upload_date?: string
        }
        Relationships: []
      }
      company_data: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          bonus_date: string | null
          created_at: string | null
          date_of_birth: string
          department: string | null
          email: string
          employment_type: string
          first_name: string
          id: string
          last_name: string
          monthly_salary: number
          no_bonus_applicable: boolean | null
          phone: string | null
          position: string
          site: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bonus_date?: string | null
          created_at?: string | null
          date_of_birth: string
          department?: string | null
          email: string
          employment_type?: string
          first_name: string
          id?: string
          last_name: string
          monthly_salary: number
          no_bonus_applicable?: boolean | null
          phone?: string | null
          position: string
          site?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bonus_date?: string | null
          created_at?: string | null
          date_of_birth?: string
          department?: string | null
          email?: string
          employment_type?: string
          first_name?: string
          id?: string
          last_name?: string
          monthly_salary?: number
          no_bonus_applicable?: boolean | null
          phone?: string | null
          position?: string
          site?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      statement_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          matched_transaction_id: string | null
          matching_confidence: number | null
          reference_number: string | null
          statement_id: string
          status: string
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          matched_transaction_id?: string | null
          matching_confidence?: number | null
          reference_number?: string | null
          statement_id: string
          status?: string
          transaction_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          matched_transaction_id?: string | null
          matching_confidence?: number | null
          reference_number?: string | null
          statement_id?: string
          status?: string
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "statement_transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
