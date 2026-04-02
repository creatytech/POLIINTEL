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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          initiative_id: string | null
          location: string | null
          scheduled_at: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          location?: string | null
          scheduled_at?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          location?: string | null
          scheduled_at?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliations: {
        Row: {
          affiliate_code: string | null
          cedula: string
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          level: number
          notes: string | null
          parent_user_id: string | null
          phone: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_code?: string | null
          cedula: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          level: number
          notes?: string | null
          parent_user_id?: string | null
          phone?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string | null
          cedula?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          level?: number
          notes?: string | null
          parent_user_id?: string | null
          phone?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "mv_municipios_full"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "affiliations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "affiliations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          actor_id: string | null
          campaign_id: string | null
          event_type: string
          id: string
          occurred_at: string | null
          org_id: string | null
          properties: Json | null
          territory_id: string | null
          territory_level: string | null
        }
        Insert: {
          actor_id?: string | null
          campaign_id?: string | null
          event_type: string
          id?: string
          occurred_at?: string | null
          org_id?: string | null
          properties?: Json | null
          territory_id?: string | null
          territory_level?: string | null
        }
        Update: {
          actor_id?: string | null
          campaign_id?: string | null
          event_type?: string
          id?: string
          occurred_at?: string | null
          org_id?: string | null
          properties?: Json | null
          territory_id?: string | null
          territory_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          activity_id: string | null
          attended_bool: boolean | null
          confirmed_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          attended_bool?: boolean | null
          confirmed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          attended_bool?: boolean | null
          confirmed_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assignments: {
        Row: {
          assigned_at: string | null
          campaign_id: string
          collector_id: string
          daily_quota: number | null
          id: string
          territory_id: string
          territory_level: string
          total_collected: number | null
        }
        Insert: {
          assigned_at?: string | null
          campaign_id: string
          collector_id: string
          daily_quota?: number | null
          id?: string
          territory_id: string
          territory_level: string
          total_collected?: number | null
        }
        Update: {
          assigned_at?: string | null
          campaign_id?: string
          collector_id?: string
          daily_quota?: number | null
          id?: string
          territory_id?: string
          territory_level?: string
          total_collected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_assignments_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          election_date: string | null
          election_type: Database["public"]["Enums"]["election_type"]
          ends_at: string | null
          id: string
          name: string
          org_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_sample_size: number | null
          target_territory_id: string | null
          target_territory_level: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          election_date?: string | null
          election_type: Database["public"]["Enums"]["election_type"]
          ends_at?: string | null
          id?: string
          name: string
          org_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_sample_size?: number | null
          target_territory_id?: string | null
          target_territory_level?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          election_date?: string | null
          election_type?: Database["public"]["Enums"]["election_type"]
          ends_at?: string | null
          id?: string
          name?: string
          org_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_sample_size?: number | null
          target_territory_id?: string | null
          target_territory_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string | null
          id: string
          initiative_id: string | null
          name: string
          order: number | null
          photo_url: string | null
          role_label: string
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: string
          initiative_id?: string | null
          name: string
          order?: number | null
          photo_url?: string | null
          role_label: string
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: string
          initiative_id?: string | null
          name?: string
          order?: number | null
          photo_url?: string | null
          role_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      circunscripciones: {
        Row: {
          created_at: string | null
          geom: unknown
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["circunscripcion_tipo"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["circunscripcion_tipo"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["circunscripcion_tipo"]
          updated_at?: string | null
        }
        Relationships: []
      }
      colegios_electorales: {
        Row: {
          capacidad_votantes: number | null
          created_at: string | null
          id: string
          numero: number
          recinto_id: string | null
          updated_at: string | null
        }
        Insert: {
          capacidad_votantes?: number | null
          created_at?: string | null
          id?: string
          numero: number
          recinto_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capacidad_votantes?: number | null
          created_at?: string | null
          id?: string
          numero?: number
          recinto_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colegios_electorales_recinto_id_fkey"
            columns: ["recinto_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["recinto_id"]
          },
          {
            foreignKeyName: "colegios_electorales_recinto_id_fkey"
            columns: ["recinto_id"]
            isOneToOne: false
            referencedRelation: "recintos_electorales"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          citizen_identifier: string
          consent_text: string
          consent_version: string
          granted_at: string | null
          id: string
          initiative_id: string | null
          ip_address: unknown
          purpose: string
          revoked_at: string | null
        }
        Insert: {
          citizen_identifier: string
          consent_text: string
          consent_version: string
          granted_at?: string | null
          id?: string
          initiative_id?: string | null
          ip_address?: unknown
          purpose: string
          revoked_at?: string | null
        }
        Update: {
          citizen_identifier?: string
          consent_text?: string
          consent_version?: string
          granted_at?: string | null
          id?: string
          initiative_id?: string | null
          ip_address?: unknown
          purpose?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      distritos_municipales: {
        Row: {
          codigo: string
          created_at: string | null
          geom: unknown
          id: string
          municipio_id: string | null
          nombre: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          geom?: unknown
          id?: string
          municipio_id?: string | null
          nombre: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          geom?: unknown
          id?: string
          municipio_id?: string | null
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distritos_municipales_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distritos_municipales_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "mv_municipios_full"
            referencedColumns: ["municipio_id"]
          },
          {
            foreignKeyName: "distritos_municipales_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["municipio_id"]
          },
        ]
      }
      form_versions: {
        Row: {
          form_id: string
          id: string
          published_at: string | null
          published_by: string | null
          schema: Json
          version: number
        }
        Insert: {
          form_id: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          schema: Json
          version: number
        }
        Update: {
          form_id?: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          schema?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "survey_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_versions_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      geodata_staging: {
        Row: {
          feature_type: string
          geom: unknown
          id: string
          imported_at: string | null
          properties: Json
          source: string
        }
        Insert: {
          feature_type: string
          geom?: unknown
          id?: string
          imported_at?: string | null
          properties?: Json
          source: string
        }
        Update: {
          feature_type?: string
          geom?: unknown
          id?: string
          imported_at?: string | null
          properties?: Json
          source?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          current_cached: number | null
          end_at: string | null
          id: string
          initiative_id: string | null
          scope: string
          scope_id: string | null
          start_at: string | null
          status: string | null
          target_value: number
          type: string
        }
        Insert: {
          current_cached?: number | null
          end_at?: string | null
          id?: string
          initiative_id?: string | null
          scope: string
          scope_id?: string | null
          start_at?: string | null
          status?: string | null
          target_value: number
          type: string
        }
        Update: {
          current_cached?: number | null
          end_at?: string | null
          id?: string
          initiative_id?: string | null
          scope?: string
          scope_id?: string | null
          start_at?: string | null
          status?: string | null
          target_value?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          active: boolean | null
          brand_color: string | null
          brand_json: Json | null
          candidate_name: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          published: boolean | null
          slug: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          brand_color?: string | null
          brand_json?: Json | null
          candidate_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          published?: boolean | null
          slug: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          brand_color?: string | null
          brand_json?: Json | null
          candidate_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          published?: boolean | null
          slug?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          badge: string | null
          id: string
          initiative_id: string | null
          label: string
          narrative_text: string | null
          reached_at: string | null
          threshold_value: number
        }
        Insert: {
          badge?: string | null
          id?: string
          initiative_id?: string | null
          label: string
          narrative_text?: string | null
          reached_at?: string | null
          threshold_value: number
        }
        Update: {
          badge?: string | null
          id?: string
          initiative_id?: string | null
          label?: string
          narrative_text?: string | null
          reached_at?: string | null
          threshold_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "milestones_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_model_registry: {
        Row: {
          created_at: string | null
          deployed_at: string | null
          description: string | null
          hyperparameters: Json | null
          id: string
          is_active: boolean | null
          metrics: Json | null
          name: string
          type: string
          version: string
        }
        Insert: {
          created_at?: string | null
          deployed_at?: string | null
          description?: string | null
          hyperparameters?: Json | null
          id?: string
          is_active?: boolean | null
          metrics?: Json | null
          name: string
          type: string
          version: string
        }
        Update: {
          created_at?: string | null
          deployed_at?: string | null
          description?: string | null
          hyperparameters?: Json | null
          id?: string
          is_active?: boolean | null
          metrics?: Json | null
          name?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      ml_predictions: {
        Row: {
          campaign_id: string
          confidence: number | null
          created_at: string | null
          generated_by: string | null
          id: string
          margin_of_error: number | null
          model_name: string
          model_version: string
          prediction: Json
          prediction_type: Database["public"]["Enums"]["prediction_type"]
          sample_size: number | null
          territory_id: string | null
          territory_level: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          campaign_id: string
          confidence?: number | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          margin_of_error?: number | null
          model_name: string
          model_version: string
          prediction: Json
          prediction_type: Database["public"]["Enums"]["prediction_type"]
          sample_size?: number | null
          territory_id?: string | null
          territory_level?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          campaign_id?: string
          confidence?: number | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          margin_of_error?: number | null
          model_name?: string
          model_version?: string
          prediction?: Json
          prediction_type?: Database["public"]["Enums"]["prediction_type"]
          sample_size?: number | null
          territory_id?: string | null
          territory_level?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_predictions_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          codigo: string
          created_at: string | null
          geom: unknown
          id: string
          nombre: string
          provincia_id: string | null
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre: string
          provincia_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre?: string
          provincia_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "municipios_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "mv_municipios_full"
            referencedColumns: ["provincia_id"]
          },
          {
            foreignKeyName: "municipios_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["provincia_id"]
          },
          {
            foreignKeyName: "municipios_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "provincias"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offline_packages: {
        Row: {
          campaign_id: string
          content: Json
          created_at: string | null
          expires_at: string | null
          id: string
          package_type: string | null
          size_bytes: number | null
          user_id: string
          version: string
        }
        Insert: {
          campaign_id: string
          content: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          package_type?: string | null
          size_bytes?: number | null
          user_id: string
          version: string
        }
        Update: {
          campaign_id?: string
          content?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: string
          package_type?: string | null
          size_bytes?: number | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offline_packages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          id: string
          invited_at: string | null
          joined_at: string | null
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_collectors: number | null
          name: string
          settings: Json | null
          slug: string
          subscription_tier: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_collectors?: number | null
          name: string
          settings?: Json | null
          slug: string
          subscription_tier?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_collectors?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_tier?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          calculated_at: string | null
          candidate_id: string | null
          confidence_interval: Json | null
          id: string
          initiative_id: string | null
          model_version: string | null
          probability: number | null
          scope_id: string | null
        }
        Insert: {
          calculated_at?: string | null
          candidate_id?: string | null
          confidence_interval?: Json | null
          id?: string
          initiative_id?: string | null
          model_version?: string | null
          probability?: number | null
          scope_id?: string | null
        }
        Update: {
          calculated_at?: string | null
          candidate_id?: string | null
          confidence_interval?: Json | null
          id?: string
          initiative_id?: string | null
          model_version?: string | null
          probability?: number | null
          scope_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          device_id: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          org_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          territory_id: string | null
          territory_level: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          device_id?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          org_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          territory_id?: string | null
          territory_level?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          device_id?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          org_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          territory_id?: string | null
          territory_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      provincias: {
        Row: {
          codigo: string
          created_at: string | null
          geom: unknown
          id: string
          nombre: string
          region_id: string | null
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre: string
          region_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre?: string
          region_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provincias_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "mv_municipios_full"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "provincias_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "provincias_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["id"]
          },
        ]
      }
      recintos_electorales: {
        Row: {
          codigo: string
          created_at: string | null
          geom: unknown
          id: string
          lat: number | null
          lng: number | null
          nombre: string
          seccion_id: string | null
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          nombre: string
          seccion_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          nombre?: string
          seccion_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recintos_electorales_seccion_id_fkey"
            columns: ["seccion_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["seccion_id"]
          },
          {
            foreignKeyName: "recintos_electorales_seccion_id_fkey"
            columns: ["seccion_id"]
            isOneToOne: false
            referencedRelation: "secciones"
            referencedColumns: ["id"]
          },
        ]
      }
      regiones: {
        Row: {
          codigo: string
          created_at: string | null
          geom: unknown
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          geom?: unknown
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      respondent_profiles: {
        Row: {
          age_range: string | null
          created_at: string | null
          education_level: string | null
          first_time_voter: boolean | null
          gender: string | null
          id: string
          occupation_category: string | null
          response_id: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string | null
          education_level?: string | null
          first_time_voter?: boolean | null
          gender?: string | null
          id?: string
          occupation_category?: string | null
          response_id: string
        }
        Update: {
          age_range?: string | null
          created_at?: string | null
          education_level?: string | null
          first_time_voter?: boolean | null
          gender?: string | null
          id?: string
          occupation_category?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respondent_profiles_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          actions: string[]
          conditions: Json | null
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          actions: string[]
          conditions?: Json | null
          resource: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          actions?: string[]
          conditions?: Json | null
          resource?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: Database["public"]["Enums"]["user_role"]
          permissions: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["user_role"]
          permissions?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["user_role"]
          permissions?: Json
        }
        Relationships: []
      }
      barrios_parajes: {
        Row: {
          id: string
          nombre: string
          codigo: string
          seccion_id: string | null
          area_km2: number | null
          geom: unknown
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nombre: string
          codigo: string
          seccion_id?: string | null
          area_km2?: number | null
          geom?: unknown
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          codigo?: string
          seccion_id?: string | null
          area_km2?: number | null
          geom?: unknown
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barrios_parajes_seccion_id_fkey"
            columns: ["seccion_id"]
            isOneToOne: false
            referencedRelation: "secciones"
            referencedColumns: ["id"]
          },
        ]
      }
      secciones: {
        Row: {
          codigo: string
          created_at: string | null
          distrito_id: string | null
          geom: unknown
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          distrito_id?: string | null
          geom?: unknown
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          distrito_id?: string | null
          geom?: unknown
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secciones_distrito_id_fkey"
            columns: ["distrito_id"]
            isOneToOne: false
            referencedRelation: "distritos_municipales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secciones_distrito_id_fkey"
            columns: ["distrito_id"]
            isOneToOne: false
            referencedRelation: "mv_recintos_full"
            referencedColumns: ["distrito_id"]
          },
        ]
      }
      signatories: {
        Row: {
          channel: string | null
          consent_bool: boolean
          consent_text: string | null
          consent_version: string | null
          created_at: string | null
          device_fingerprint: string | null
          email: string | null
          full_name: string
          id: string
          id_document: string | null
          initiative_id: string | null
          municipality_id: string | null
          phone: string | null
          province_id: string | null
          revoked_at: string | null
          verified_at: string | null
        }
        Insert: {
          channel?: string | null
          consent_bool?: boolean
          consent_text?: string | null
          consent_version?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_document?: string | null
          initiative_id?: string | null
          municipality_id?: string | null
          phone?: string | null
          province_id?: string | null
          revoked_at?: string | null
          verified_at?: string | null
        }
        Update: {
          channel?: string | null
          consent_bool?: boolean
          consent_text?: string | null
          consent_version?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_document?: string | null
          initiative_id?: string | null
          municipality_id?: string | null
          phone?: string | null
          province_id?: string | null
          revoked_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatories_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          created_at: string | null
          id: string
          initiative_id: string | null
          ip: unknown
          png_blob: string | null
          signatory_id: string | null
          signature_hash: string
          svg_path: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initiative_id?: string | null
          ip?: unknown
          png_blob?: string | null
          signatory_id?: string | null
          signature_hash: string
          svg_path?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initiative_id?: string | null
          ip?: unknown
          png_blob?: string | null
          signatory_id?: string | null
          signature_hash?: string
          svg_path?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_signatory_id_fkey"
            columns: ["signatory_id"]
            isOneToOne: false
            referencedRelation: "signatories"
            referencedColumns: ["id"]
          },
        ]
      }
      social_cards: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          format: string | null
          id: string
          initiative_id: string | null
          overrides_json: Json | null
          template_key: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          initiative_id?: string | null
          overrides_json?: Json | null
          template_key: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          initiative_id?: string | null
          overrides_json?: Json | null
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_cards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_cards_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      survey_forms: {
        Row: {
          campaign_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          schema: Json
          updated_at: string | null
          version: number | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          schema: Json
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          schema?: Json
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_forms_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          accuracy_meters: number | null
          answers: Json
          campaign_id: string
          collected_at: string
          collector_id: string
          created_at: string | null
          distrito_id: string | null
          form_id: string
          id: string
          is_outlier: boolean | null
          lat: number | null
          lng: number | null
          local_id: string | null
          location: unknown
          metadata: Json | null
          municipio_id: string | null
          provincia_id: string | null
          quality_score: number | null
          recinto_id: string | null
          region_id: string | null
          sentiment_score: number | null
          status: Database["public"]["Enums"]["response_status"] | null
          synced_at: string | null
          validation_notes: string | null
        }
        Insert: {
          accuracy_meters?: number | null
          answers: Json
          campaign_id: string
          collected_at: string
          collector_id: string
          created_at?: string | null
          distrito_id?: string | null
          form_id: string
          id?: string
          is_outlier?: boolean | null
          lat?: number | null
          lng?: number | null
          local_id?: string | null
          location?: unknown
          metadata?: Json | null
          municipio_id?: string | null
          provincia_id?: string | null
          quality_score?: number | null
          recinto_id?: string | null
          region_id?: string | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["response_status"] | null
          synced_at?: string | null
          validation_notes?: string | null
        }
        Update: {
          accuracy_meters?: number | null
          answers?: Json
          campaign_id?: string
          collected_at?: string
          collector_id?: string
          created_at?: string | null
          distrito_id?: string | null
          form_id?: string
          id?: string
          is_outlier?: boolean | null
          lat?: number | null
          lng?: number | null
          local_id?: string | null
          location?: unknown
          metadata?: Json | null
          municipio_id?: string | null
          provincia_id?: string | null
          quality_score?: number | null
          recinto_id?: string | null
          region_id?: string | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["response_status"] | null
          synced_at?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "survey_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_queue: {
        Row: {
          checksum: string | null
          conflict_data: Json | null
          created_at: string | null
          device_id: string
          error_message: string | null
          id: string
          operation: Database["public"]["Enums"]["sync_operation"]
          payload: Json
          processed_at: string | null
          record_id: string
          retry_count: number | null
          status: Database["public"]["Enums"]["sync_status"] | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          checksum?: string | null
          conflict_data?: Json | null
          created_at?: string | null
          device_id: string
          error_message?: string | null
          id?: string
          operation: Database["public"]["Enums"]["sync_operation"]
          payload: Json
          processed_at?: string | null
          record_id: string
          retry_count?: number | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          checksum?: string | null
          conflict_data?: Json | null
          created_at?: string | null
          device_id?: string
          error_message?: string | null
          id?: string
          operation?: Database["public"]["Enums"]["sync_operation"]
          payload?: Json
          processed_at?: string | null
          record_id?: string
          retry_count?: number | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_sessions: {
        Row: {
          bandwidth_bytes: number | null
          completed_at: string | null
          device_id: string
          id: string
          last_sync_at: string | null
          records_failed: number | null
          records_synced: number | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          bandwidth_bytes?: number | null
          completed_at?: string | null
          device_id: string
          id?: string
          last_sync_at?: string | null
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          bandwidth_bytes?: number | null
          completed_at?: string | null
          device_id?: string
          id?: string
          last_sync_at?: string | null
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      territory_stats: {
        Row: {
          avg_quality_score: number | null
          campaign_id: string
          completion_rate: number | null
          demographic_breakdown: Json | null
          id: string
          territory_id: string
          territory_level: string
          top_candidate: Json | null
          total_responses: number | null
          updated_at: string | null
          valid_responses: number | null
        }
        Insert: {
          avg_quality_score?: number | null
          campaign_id: string
          completion_rate?: number | null
          demographic_breakdown?: Json | null
          id?: string
          territory_id: string
          territory_level: string
          top_candidate?: Json | null
          total_responses?: number | null
          updated_at?: string | null
          valid_responses?: number | null
        }
        Update: {
          avg_quality_score?: number | null
          campaign_id?: string
          completion_rate?: number | null
          demographic_breakdown?: Json | null
          id?: string
          territory_id?: string
          territory_level?: string
          top_candidate?: Json | null
          total_responses?: number | null
          updated_at?: string | null
          valid_responses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "territory_stats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      mv_initiative_counts: {
        Row: {
          avg_per_hour: number | null
          initiative_id: string | null
          today_signatures: number | null
          total_signatures: number | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_municipios_full: {
        Row: {
          municipio_codigo: string | null
          municipio_geom: unknown
          municipio_id: string | null
          municipio_nombre: string | null
          provincia_codigo: string | null
          provincia_id: string | null
          provincia_nombre: string | null
          region_codigo: string | null
          region_id: string | null
          region_nombre: string | null
        }
        Relationships: []
      }
      mv_barrios_full: {
        Row: {
          barrio_id: string | null
          barrio_nombre: string | null
          barrio_codigo: string | null
          area_km2: number | null
          barrio_geom: unknown
          seccion_id: string | null
          seccion_nombre: string | null
          seccion_codigo: string | null
          distrito_id: string | null
          distrito_nombre: string | null
          municipio_id: string | null
          municipio_nombre: string | null
          provincia_id: string | null
          provincia_nombre: string | null
          region_id: string | null
          region_nombre: string | null
        }
        Relationships: []
      }
      mv_recintos_full: {
        Row: {
          distrito_id: string | null
          distrito_nombre: string | null
          municipio_id: string | null
          municipio_nombre: string | null
          provincia_id: string | null
          provincia_nombre: string | null
          recinto_codigo: string | null
          recinto_geom: unknown
          recinto_id: string | null
          recinto_nombre: string | null
          region_id: string | null
          region_nombre: string | null
          seccion_id: string | null
          seccion_nombre: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_territory_by_point: {
        Args: { p_lat: number; p_lng: number }
        Returns: Json
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_descendants: {
        Args: { root_user_id: string }
        Returns: {
          depth: number
          id: string
        }[]
      }
      get_electoral_stats_by_area: { Args: { p_geom: unknown }; Returns: Json }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      record_consent: {
        Args: {
          p_citizen_identifier: string
          p_consent_text: string
          p_consent_version: string
          p_initiative_id: string
          p_ip_address?: unknown
          p_purpose: string
        }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      campaign_status: "draft" | "active" | "paused" | "completed" | "archived"
      circunscripcion_tipo: "senatorial" | "diputados" | "municipal"
      election_type:
        | "presidencial"
        | "senatorial"
        | "diputados"
        | "municipal"
        | "congresillo"
      prediction_type:
        | "vote_intention"
        | "approval_rating"
        | "trend_forecast"
        | "turnout_estimate"
        | "swing_analysis"
        | "sentiment_index"
      question_type:
        | "single_choice"
        | "multiple_choice"
        | "scale"
        | "text"
        | "number"
        | "date"
        | "geo_point"
        | "photo"
        | "signature"
      response_status:
        | "draft"
        | "submitted"
        | "validated"
        | "rejected"
        | "flagged"
      sync_operation: "INSERT" | "UPDATE" | "DELETE" | "UPSERT"
      sync_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "conflict"
      user_role:
        | "super_admin"
        | "org_admin"
        | "campaign_manager"
        | "field_coordinator"
        | "data_collector"
        | "analyst"
        | "viewer"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      campaign_status: ["draft", "active", "paused", "completed", "archived"],
      circunscripcion_tipo: ["senatorial", "diputados", "municipal"],
      election_type: [
        "presidencial",
        "senatorial",
        "diputados",
        "municipal",
        "congresillo",
      ],
      prediction_type: [
        "vote_intention",
        "approval_rating",
        "trend_forecast",
        "turnout_estimate",
        "swing_analysis",
        "sentiment_index",
      ],
      question_type: [
        "single_choice",
        "multiple_choice",
        "scale",
        "text",
        "number",
        "date",
        "geo_point",
        "photo",
        "signature",
      ],
      response_status: [
        "draft",
        "submitted",
        "validated",
        "rejected",
        "flagged",
      ],
      sync_operation: ["INSERT", "UPDATE", "DELETE", "UPSERT"],
      sync_status: ["pending", "processing", "completed", "failed", "conflict"],
      user_role: [
        "super_admin",
        "org_admin",
        "campaign_manager",
        "field_coordinator",
        "data_collector",
        "analyst",
        "viewer",
      ],
    },
  },
} as const
