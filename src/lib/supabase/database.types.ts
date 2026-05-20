export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      admin_users: {
        Row: { created_at: string; user_id: string };
        Insert: { created_at?: string; user_id: string };
        Update: { created_at?: string; user_id?: string };
        Relationships: [];
      };
      bookings: {
        Row: {
          arrival: string;
          created_at: string;
          departure: string;
          guest_email: string;
          guest_name: string;
          guest_phone: string | null;
          guests: number;
          hold_expires_at: string | null;
          id: string;
          notes: string | null;
          property_id: string;
          status: Database['public']['Enums']['booking_status'];
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          total_price_usd: number;
          updated_at: string;
        };
        Insert: {
          arrival: string;
          created_at?: string;
          departure: string;
          guest_email: string;
          guest_name: string;
          guest_phone?: string | null;
          guests: number;
          hold_expires_at?: string | null;
          id?: string;
          notes?: string | null;
          property_id: string;
          status?: Database['public']['Enums']['booking_status'];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          total_price_usd: number;
          updated_at?: string;
        };
        Update: {
          arrival?: string;
          created_at?: string;
          departure?: string;
          guest_email?: string;
          guest_name?: string;
          guest_phone?: string | null;
          guests?: number;
          hold_expires_at?: string | null;
          id?: string;
          notes?: string | null;
          property_id?: string;
          status?: Database['public']['Enums']['booking_status'];
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          total_price_usd?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      external_blocked_dates: {
        Row: {
          end_date: string;
          external_uid: string | null;
          id: string;
          imported_at: string;
          property_id: string;
          source: string;
          start_date: string;
        };
        Insert: {
          end_date: string;
          external_uid?: string | null;
          id?: string;
          imported_at?: string;
          property_id: string;
          source?: string;
          start_date: string;
        };
        Update: {
          end_date?: string;
          external_uid?: string | null;
          id?: string;
          imported_at?: string;
          property_id?: string;
          source?: string;
          start_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'external_blocked_dates_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      inquiries: {
        Row: {
          created_at: string;
          guest_email: string;
          guest_name: string;
          guest_phone: string | null;
          id: string;
          message: string;
          property_id: string | null;
          status: string;
        };
        Insert: {
          created_at?: string;
          guest_email: string;
          guest_name: string;
          guest_phone?: string | null;
          id?: string;
          message: string;
          property_id?: string | null;
          status?: string;
        };
        Update: {
          created_at?: string;
          guest_email?: string;
          guest_name?: string;
          guest_phone?: string | null;
          id?: string;
          message?: string;
          property_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inquiries_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      properties: {
        Row: {
          airbnb_ical_url: string | null;
          base_price_per_night_usd: number;
          bathrooms: number;
          bedrooms: number;
          beds: number;
          cancellation_policy: string;
          check_in: string;
          check_out: string;
          cleaning_fee_usd: number;
          created_at: string;
          deposit_usd: number;
          description: string;
          display_order: number;
          hero_photo_alt: string;
          hero_photo_src: string;
          high_season_note: string | null;
          id: string;
          is_published: boolean;
          location: string;
          long_term_discount_percent: number;
          long_term_nights: number;
          max_guests: number;
          max_guests_note: string | null;
          min_nights: number;
          name: string;
          short_description: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          airbnb_ical_url?: string | null;
          base_price_per_night_usd: number;
          bathrooms: number;
          bedrooms: number;
          beds: number;
          cancellation_policy: string;
          check_in: string;
          check_out: string;
          cleaning_fee_usd: number;
          created_at?: string;
          deposit_usd: number;
          description: string;
          display_order?: number;
          hero_photo_alt: string;
          hero_photo_src: string;
          high_season_note?: string | null;
          id?: string;
          is_published?: boolean;
          location: string;
          long_term_discount_percent?: number;
          long_term_nights?: number;
          max_guests: number;
          max_guests_note?: string | null;
          min_nights?: number;
          name: string;
          short_description: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          airbnb_ical_url?: string | null;
          base_price_per_night_usd?: number;
          bathrooms?: number;
          bedrooms?: number;
          beds?: number;
          cancellation_policy?: string;
          check_in?: string;
          check_out?: string;
          cleaning_fee_usd?: number;
          created_at?: string;
          deposit_usd?: number;
          description?: string;
          display_order?: number;
          hero_photo_alt?: string;
          hero_photo_src?: string;
          high_season_note?: string | null;
          id?: string;
          is_published?: boolean;
          location?: string;
          long_term_discount_percent?: number;
          long_term_nights?: number;
          max_guests?: number;
          max_guests_note?: string | null;
          min_nights?: number;
          name?: string;
          short_description?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      property_highlights: {
        Row: { description: string; display_order: number; id: string; property_id: string; title: string };
        Insert: { description: string; display_order?: number; id?: string; property_id: string; title: string };
        Update: { description?: string; display_order?: number; id?: string; property_id?: string; title?: string };
        Relationships: [
          {
            foreignKeyName: 'property_highlights_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      property_house_rules: {
        Row: { display_order: number; id: string; property_id: string; rule: string };
        Insert: { display_order?: number; id?: string; property_id: string; rule: string };
        Update: { display_order?: number; id?: string; property_id?: string; rule?: string };
        Relationships: [
          {
            foreignKeyName: 'property_house_rules_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      property_photos: {
        Row: { alt: string; display_order: number; id: string; room_id: string; src: string };
        Insert: { alt: string; display_order?: number; id?: string; room_id: string; src: string };
        Update: { alt?: string; display_order?: number; id?: string; room_id?: string; src?: string };
        Relationships: [
          {
            foreignKeyName: 'property_photos_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'property_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      property_rooms: {
        Row: { display_order: number; id: string; label: string; property_id: string; slug: string };
        Insert: { display_order?: number; id?: string; label: string; property_id: string; slug: string };
        Update: { display_order?: number; id?: string; label?: string; property_id?: string; slug?: string };
        Relationships: [
          {
            foreignKeyName: 'property_rooms_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      room_amenities: {
        Row: { display_order: number; id: string; label: string; room_id: string };
        Insert: { display_order?: number; id?: string; label: string; room_id: string };
        Update: { display_order?: number; id?: string; label?: string; room_id?: string };
        Relationships: [
          {
            foreignKeyName: 'room_amenities_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'property_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      property_occupied_dates: {
        Row: {
          end_date: string | null;
          property_id: string | null;
          source: string | null;
          start_date: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
    };
    CompositeTypes: Record<string, never>;
  };
};
