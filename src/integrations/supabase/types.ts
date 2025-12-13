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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      packages: {
        Row: {
          created_at: string
          description: string | null
          details: string | null
          duration_minutes: number | null
          folder_path: string | null
          id: string
          mood: Database["public"]["Enums"]["mood_enum"][] | null
          occasions: Database["public"]["Enums"]["occasion_enum"][]
          price_krw: number
          reservation_url: string
          sample_image_urls: string[] | null
          thumbnail_url: string | null
          Tips: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: string | null
          duration_minutes?: number | null
          folder_path?: string | null
          id?: string
          mood?: Database["public"]["Enums"]["mood_enum"][] | null
          occasions?: Database["public"]["Enums"]["occasion_enum"][]
          price_krw: number
          reservation_url: string
          sample_image_urls?: string[] | null
          thumbnail_url?: string | null
          Tips?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: string | null
          duration_minutes?: number | null
          folder_path?: string | null
          id?: string
          mood?: Database["public"]["Enums"]["mood_enum"][] | null
          occasions?: Database["public"]["Enums"]["occasion_enum"][]
          price_krw?: number
          reservation_url?: string
          sample_image_urls?: string[] | null
          thumbnail_url?: string | null
          Tips?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservation_clicks: {
        Row: {
          clicked_at: string
          id: string
          package_id: string | null
          package_title: string
          price_krw: number | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          package_id?: string | null
          package_title: string
          price_krw?: number | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          package_id?: string | null
          package_title?: string
          price_krw?: number | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_clicks_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
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
      mood_enum:
        | "로맨틱"
        | "자연스러운"
        | "밝은"
        | "감성적인"
        | "따뜻한"
        | "청량한"
        | "모던한"
        | "빈티지"
        | "편안한"
        | "활기찬"
        | "차분한"
        | "몽환적인"
        | "고요한"
        | "순수한"
        | "깨끗한"
        | "아날로그"
        | "일본감성"
        | "청춘만화"
        | "여유로운"
        | "맑은"
        | "상쾌한"
        | "평화로운"
        | "힐링되는"
        | "일상적인"
        | "소박한"
        | "담백한"
        | "친근한"
        | "포근한"
        | "화사한"
        | "싱그러운"
        | "목가적인"
        | "청춘 같은"
        | "로맨틱한"
        | "사랑스러운"
        | "생기 있는"
        | "경쾌한"
        | "투명한"
      occasion_enum:
        | "커플"
        | "가족"
        | "우정"
        | "프로필"
        | "웨딩"
        | "만삭"
        | "개인"
        | "아기"
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
      mood_enum: [
        "로맨틱",
        "자연스러운",
        "밝은",
        "감성적인",
        "따뜻한",
        "청량한",
        "모던한",
        "빈티지",
        "편안한",
        "활기찬",
        "차분한",
        "몽환적인",
        "고요한",
        "순수한",
        "깨끗한",
        "아날로그",
        "일본감성",
        "청춘만화",
        "여유로운",
        "맑은",
        "상쾌한",
        "평화로운",
        "힐링되는",
        "일상적인",
        "소박한",
        "담백한",
        "친근한",
        "포근한",
        "화사한",
        "싱그러운",
        "목가적인",
        "청춘 같은",
        "로맨틱한",
        "사랑스러운",
        "생기 있는",
        "경쾌한",
        "투명한",
      ],
      occasion_enum: [
        "커플",
        "가족",
        "우정",
        "프로필",
        "웨딩",
        "만삭",
        "개인",
        "아기",
      ],
    },
  },
} as const
