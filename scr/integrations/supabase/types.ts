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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apps: {
        Row: {
          bundle_id: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          metadata: Json | null
          name: string
          package_name: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          screenshots: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
          name: string
          package_name?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          screenshots?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bundle_id?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          package_name?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          screenshots?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      builder_components: {
        Row: {
          actions: Json | null
          component_id: string
          content: string | null
          created_at: string | null
          database_connection: Json | null
          height: number
          id: string
          screen_id: string | null
          styles: Json | null
          type: string
          width: number
          x: number
          y: number
        }
        Insert: {
          actions?: Json | null
          component_id: string
          content?: string | null
          created_at?: string | null
          database_connection?: Json | null
          height: number
          id?: string
          screen_id?: string | null
          styles?: Json | null
          type: string
          width: number
          x: number
          y: number
        }
        Update: {
          actions?: Json | null
          component_id?: string
          content?: string | null
          created_at?: string | null
          database_connection?: Json | null
          height?: number
          id?: string
          screen_id?: string | null
          styles?: Json | null
          type?: string
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "builder_components_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "builder_screens"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_database_records: {
        Row: {
          created_at: string | null
          data: Json
          database_id: string
          id: string
          record_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          database_id: string
          id?: string
          record_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          database_id?: string
          id?: string
          record_id?: string
        }
        Relationships: []
      }
      builder_databases: {
        Row: {
          created_at: string | null
          database_id: string
          fields: Json
          id: string
          name: string
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          database_id: string
          fields?: Json
          id?: string
          name: string
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          database_id?: string
          fields?: Json
          id?: string
          name?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_databases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_screens: {
        Row: {
          created_at: string | null
          id: string
          is_default_logged_in: boolean | null
          is_default_logged_out: boolean | null
          is_home: boolean | null
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default_logged_in?: boolean | null
          is_default_logged_out?: boolean | null
          is_home?: boolean | null
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default_logged_in?: boolean | null
          is_default_logged_out?: boolean | null
          is_home?: boolean | null
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_screens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          account_email: string | null
          created_at: string | null
          data_encrypted: string
          id: string
          last_validated_at: string | null
          revoked: boolean | null
          type: Database["public"]["Enums"]["credential_type"]
          user_id: string | null
        }
        Insert: {
          account_email?: string | null
          created_at?: string | null
          data_encrypted: string
          id?: string
          last_validated_at?: string | null
          revoked?: boolean | null
          type: Database["public"]["Enums"]["credential_type"]
          user_id?: string | null
        }
        Update: {
          account_email?: string | null
          created_at?: string | null
          data_encrypted?: string
          id?: string
          last_validated_at?: string | null
          revoked?: boolean | null
          type?: Database["public"]["Enums"]["credential_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      publish_events: {
        Row: {
          created_at: string | null
          id: string
          message: string
          publish_job_id: string | null
          raw_payload: Json | null
          type: Database["public"]["Enums"]["event_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          publish_job_id?: string | null
          raw_payload?: Json | null
          type: Database["public"]["Enums"]["event_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          publish_job_id?: string | null
          raw_payload?: Json | null
          type?: Database["public"]["Enums"]["event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "publish_events_publish_job_id_fkey"
            columns: ["publish_job_id"]
            isOneToOne: false
            referencedRelation: "publish_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      publish_jobs: {
        Row: {
          app_id: string | null
          artifact_url: string | null
          created_at: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          progress: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["publish_job_status"] | null
          target_track: string | null
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          artifact_url?: string | null
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          progress?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["publish_job_status"] | null
          target_track?: string | null
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          artifact_url?: string | null
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          progress?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["publish_job_status"] | null
          target_track?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publish_jobs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "owner"
      credential_type: "google_play" | "apple_app_store"
      event_type: "info" | "warn" | "error"
      platform_type: "android" | "ios" | "both"
      publish_job_status:
        | "queued"
        | "building"
        | "uploading"
        | "in_review"
        | "published"
        | "failed"
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
      app_role: ["admin", "user", "owner"],
      credential_type: ["google_play", "apple_app_store"],
      event_type: ["info", "warn", "error"],
      platform_type: ["android", "ios", "both"],
      publish_job_status: [
        "queued",
        "building",
        "uploading",
        "in_review",
        "published",
        "failed",
      ],
    },
  },
} as const
