/**
 * Supabase Database Types
 * 
 * This file contains TypeScript definitions for your Supabase database.
 * You can extend these types as your database schema evolves.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          type: string
          user_id: string
          status: string
          vat_number: string | null
          registration_number: string | null
          outstanding: number
          overdue: number
          last_invoice_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          type: string
          user_id: string
          status?: string
          vat_number?: string | null
          registration_number?: string | null
          outstanding?: number
          overdue?: number
          last_invoice_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          type?: string
          user_id?: string
          status?: string
          vat_number?: string | null
          registration_number?: string | null
          outstanding?: number
          overdue?: number
          last_invoice_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      companies: {
        Row: {
          id: string
          user_id: string
          name: string
          registration_number: string | null
          vat_number: string | null
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          bank_name: string | null
          bank_account: string | null
          branch_code: string | null
          swift_code: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          registration_number?: string | null
          vat_number?: string | null
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          bank_name?: string | null
          bank_account?: string | null
          branch_code?: string | null
          swift_code?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          registration_number?: string | null
          vat_number?: string | null
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          bank_name?: string | null
          bank_account?: string | null
          branch_code?: string | null
          swift_code?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string
          invoice_number: string
          issued_date: string
          due_date: string
          amount: number
          tax_amount: number
          status: string
          created_at: string
          updated_at: string | null
          notes: string | null
          template_id: string | null
          items: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          invoice_number: string
          issued_date: string
          due_date: string
          amount: number
          tax_amount: number
          status?: string
          created_at?: string
          updated_at?: string | null
          notes?: string | null
          template_id?: string | null
          items?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          invoice_number?: string
          issued_date?: string
          due_date?: string
          amount?: number
          tax_amount?: number
          status?: string
          created_at?: string
          updated_at?: string | null
          notes?: string | null
          template_id?: string | null
          items?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      health_check: {
        Row: {
          id: string
          status: string
          timestamp: string
        }
        Insert: {
          id?: string
          status: string
          timestamp?: string
        }
        Update: {
          id?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
