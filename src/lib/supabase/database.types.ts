export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          email: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      amenities: {
        Row: {
          category: string | null;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          category?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          category?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          cancelled_at: string | null;
          check_in: string;
          check_out: string;
          cleaning_fee_eur: number;
          confirmed_at: string | null;
          created_at: string;
          guest_email: string;
          guest_name: string;
          guest_phone: string | null;
          id: string;
          notes: string | null;
          num_guests: number;
          paid_at: string | null;
          reference: string;
          status: Database["public"]["Enums"]["booking_status"];
          stay_type: Database["public"]["Enums"]["stay_type"];
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          subtotal_eur: number;
          total_eur: number;
          unit_id: string;
          updated_at: string;
        };
        Insert: {
          cancelled_at?: string | null;
          check_in: string;
          check_out: string;
          cleaning_fee_eur?: number;
          confirmed_at?: string | null;
          created_at?: string;
          guest_email: string;
          guest_name: string;
          guest_phone?: string | null;
          id?: string;
          notes?: string | null;
          num_guests: number;
          paid_at?: string | null;
          reference: string;
          status?: Database["public"]["Enums"]["booking_status"];
          stay_type: Database["public"]["Enums"]["stay_type"];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          subtotal_eur: number;
          total_eur: number;
          unit_id: string;
          updated_at?: string;
        };
        Update: {
          cancelled_at?: string | null;
          check_in?: string;
          check_out?: string;
          cleaning_fee_eur?: number;
          confirmed_at?: string | null;
          created_at?: string;
          guest_email?: string;
          guest_name?: string;
          guest_phone?: string | null;
          id?: string;
          notes?: string | null;
          num_guests?: number;
          paid_at?: string | null;
          reference?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          stay_type?: Database["public"]["Enums"]["stay_type"];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          subtotal_eur?: number;
          total_eur?: number;
          unit_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      external_review_aggregates: {
        Row: {
          badge_html: string | null;
          id: string;
          last_synced_at: string | null;
          property_id: string | null;
          rating: number | null;
          source: Database["public"]["Enums"]["review_source"];
          total_reviews: number | null;
          url: string;
        };
        Insert: {
          badge_html?: string | null;
          id?: string;
          last_synced_at?: string | null;
          property_id?: string | null;
          rating?: number | null;
          source: Database["public"]["Enums"]["review_source"];
          total_reviews?: number | null;
          url: string;
        };
        Update: {
          badge_html?: string | null;
          id?: string;
          last_synced_at?: string | null;
          property_id?: string | null;
          rating?: number | null;
          source?: Database["public"]["Enums"]["review_source"];
          total_reviews?: number | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "external_review_aggregates_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string | null;
          preferred_dates: string | null;
          property_id: string | null;
          status: Database["public"]["Enums"]["inquiry_status"];
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
          preferred_dates?: string | null;
          property_id?: string | null;
          status?: Database["public"]["Enums"]["inquiry_status"];
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
          preferred_dates?: string | null;
          property_id?: string | null;
          status?: Database["public"]["Enums"]["inquiry_status"];
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_hero: boolean;
          position: number;
          property_id: string | null;
          unit_id: string | null;
          url: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_hero?: boolean;
          position?: number;
          property_id?: string | null;
          unit_id?: string | null;
          url: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_hero?: boolean;
          position?: number;
          property_id?: string | null;
          unit_id?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      pricing_seasons: {
        Row: {
          end_date: string;
          fixed_price_eur: number | null;
          id: string;
          name: string;
          position: number;
          price_multiplier: number | null;
          start_date: string;
          unit_id: string;
        };
        Insert: {
          end_date: string;
          fixed_price_eur?: number | null;
          id?: string;
          name: string;
          position?: number;
          price_multiplier?: number | null;
          start_date: string;
          unit_id: string;
        };
        Update: {
          end_date?: string;
          fixed_price_eur?: number | null;
          id?: string;
          name?: string;
          position?: number;
          price_multiplier?: number | null;
          start_date?: string;
          unit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pricing_seasons_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          address: string;
          available_from: string | null;
          city: string;
          color_hex: string | null;
          color_name: string;
          country: string;
          created_at: string;
          description: string | null;
          hero_image_url: string | null;
          id: string;
          is_gated: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          parking: Database["public"]["Enums"]["parking_type"];
          pets_allowed: boolean;
          position: number;
          short_description: string | null;
          slug: string;
          status: Database["public"]["Enums"]["property_status"];
          tagline: string | null;
          updated_at: string;
          utilities: Database["public"]["Enums"]["utilities_system"];
          utilities_notes: string | null;
        };
        Insert: {
          address: string;
          available_from?: string | null;
          city: string;
          color_hex?: string | null;
          color_name: string;
          country?: string;
          created_at?: string;
          description?: string | null;
          hero_image_url?: string | null;
          id?: string;
          is_gated?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          parking?: Database["public"]["Enums"]["parking_type"];
          pets_allowed?: boolean;
          position?: number;
          short_description?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["property_status"];
          tagline?: string | null;
          updated_at?: string;
          utilities?: Database["public"]["Enums"]["utilities_system"];
          utilities_notes?: string | null;
        };
        Update: {
          address?: string;
          available_from?: string | null;
          city?: string;
          color_hex?: string | null;
          color_name?: string;
          country?: string;
          created_at?: string;
          description?: string | null;
          hero_image_url?: string | null;
          id?: string;
          is_gated?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          parking?: Database["public"]["Enums"]["parking_type"];
          pets_allowed?: boolean;
          position?: number;
          short_description?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["property_status"];
          tagline?: string | null;
          updated_at?: string;
          utilities?: Database["public"]["Enums"]["utilities_system"];
          utilities_notes?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          body: string | null;
          booking_id: string | null;
          created_at: string;
          guest_name: string;
          id: string;
          is_published: boolean;
          language: string | null;
          rating: number;
          title: string | null;
          unit_id: string | null;
        };
        Insert: {
          body?: string | null;
          booking_id?: string | null;
          created_at?: string;
          guest_name: string;
          id?: string;
          is_published?: boolean;
          language?: string | null;
          rating: number;
          title?: string | null;
          unit_id?: string | null;
        };
        Update: {
          body?: string | null;
          booking_id?: string | null;
          created_at?: string;
          guest_name?: string;
          id?: string;
          is_published?: boolean;
          language?: string | null;
          rating?: number;
          title?: string | null;
          unit_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          brand_description: string | null;
          brand_name: string;
          brand_tagline: string | null;
          contact_email: string | null;
          emergency_phone: string | null;
          google_review_url: string | null;
          id: number;
          instagram_url: string | null;
          tiktok_url: string | null;
          trustpilot_url: string | null;
          whatsapp_number: string | null;
        };
        Insert: {
          brand_description?: string | null;
          brand_name?: string;
          brand_tagline?: string | null;
          contact_email?: string | null;
          emergency_phone?: string | null;
          google_review_url?: string | null;
          id?: number;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          trustpilot_url?: string | null;
          whatsapp_number?: string | null;
        };
        Update: {
          brand_description?: string | null;
          brand_name?: string;
          brand_tagline?: string | null;
          contact_email?: string | null;
          emergency_phone?: string | null;
          google_review_url?: string | null;
          id?: number;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          trustpilot_url?: string | null;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      unit_amenities: {
        Row: {
          amenity_id: string;
          unit_id: string;
        };
        Insert: {
          amenity_id: string;
          unit_id: string;
        };
        Update: {
          amenity_id?: string;
          unit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "unit_amenities_amenity_id_fkey";
            columns: ["amenity_id"];
            isOneToOne: false;
            referencedRelation: "amenities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_amenities_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      units: {
        Row: {
          base_price_eur: number;
          bathrooms: number;
          bedrooms: number;
          cleaning_fee_eur: number;
          created_at: string;
          description: string | null;
          id: string;
          long_stay_monthly_price_eur: number | null;
          max_guests: number;
          min_long_stay_months: number;
          min_short_stay_nights: number;
          name: string;
          position: number;
          property_id: string;
          size_m2: number | null;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          base_price_eur: number;
          bathrooms?: number;
          bedrooms?: number;
          cleaning_fee_eur?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          long_stay_monthly_price_eur?: number | null;
          max_guests?: number;
          min_long_stay_months?: number;
          min_short_stay_nights?: number;
          name: string;
          position?: number;
          property_id: string;
          size_m2?: number | null;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          base_price_eur?: number;
          bathrooms?: number;
          bedrooms?: number;
          cleaning_fee_eur?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          long_stay_monthly_price_eur?: number | null;
          max_guests?: number;
          min_long_stay_months?: number;
          min_short_stay_nights?: number;
          name?: string;
          position?: number;
          property_id?: string;
          size_m2?: number | null;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed";
      inquiry_status: "new" | "replied" | "closed";
      parking_type: "private" | "public" | "street" | "none";
      property_status: "active" | "coming_soon" | "draft" | "archived";
      review_source: "google" | "trustpilot";
      stay_type: "short" | "long";
      utilities_system: "included" | "metered" | "prepaid_card";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
