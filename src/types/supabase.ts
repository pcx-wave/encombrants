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
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          type: 'client' | 'collector' | 'deposit'
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          type: 'client' | 'collector' | 'deposit'
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          type?: 'client' | 'collector' | 'deposit'
          created_at?: string | null
        }
      }
      collectors: {
        Row: {
          id: string
          vehicle_type: 'van' | 'trailer' | 'truck'
          vehicle_capacity_volume: number
          vehicle_capacity_weight: number
          vehicle_license_plate: string | null
          supported_waste_types: string[]
          rating: number | null
          completed_jobs: number | null
        }
        Insert: {
          id: string
          vehicle_type: 'van' | 'trailer' | 'truck'
          vehicle_capacity_volume: number
          vehicle_capacity_weight: number
          vehicle_license_plate?: string | null
          supported_waste_types: string[]
          rating?: number | null
          completed_jobs?: number | null
        }
        Update: {
          id?: string
          vehicle_type?: 'van' | 'trailer' | 'truck'
          vehicle_capacity_volume?: number
          vehicle_capacity_weight?: number
          vehicle_license_plate?: string | null
          supported_waste_types?: string[]
          rating?: number | null
          completed_jobs?: number | null
        }
      }
      requests: {
        Row: {
          id: string
          client_id: string
          status: 'pending' | 'matched' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          waste_types: string[]
          volume: number
          weight: number | null
          photos: string[] | null
          location_address: string
          location_lat: number
          location_lng: number
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          status?: 'pending' | 'matched' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          waste_types: string[]
          volume: number
          weight?: number | null
          photos?: string[] | null
          location_address: string
          location_lat: number
          location_lng: number
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          status?: 'pending' | 'matched' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          waste_types?: string[]
          volume?: number
          weight?: number | null
          photos?: string[] | null
          location_address?: string
          location_lat?: number
          location_lng?: number
          description?: string | null
          created_at?: string | null
        }
      }
      proposals: {
        Row: {
          id: string
          request_id: string
          collector_id: string
          price: number
          scheduled_start: string
          scheduled_end: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          created_at: string | null
        }
        Insert: {
          id?: string
          request_id: string
          collector_id: string
          price: number
          scheduled_start: string
          scheduled_end: string
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
          created_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          collector_id?: string
          price?: number
          scheduled_start?: string
          scheduled_end?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
          created_at?: string | null
        }
      }
      routes: {
        Row: {
          id: string
          collector_id: string
          disposal_site_id: string
          distance: number
          duration: number
          start_time: string
          end_time: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string | null
        }
        Insert: {
          id?: string
          collector_id: string
          disposal_site_id: string
          distance: number
          duration: number
          start_time: string
          end_time: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string | null
        }
        Update: {
          id?: string
          collector_id?: string
          disposal_site_id?: string
          distance?: number
          duration?: number
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string | null
        }
      }
      route_stops: {
        Row: {
          id: string
          route_id: string
          request_id: string
          stop_order: number
          estimated_arrival: string
          status: 'pending' | 'completed' | 'skipped'
        }
        Insert: {
          id?: string
          route_id: string
          request_id: string
          stop_order: number
          estimated_arrival: string
          status?: 'pending' | 'completed' | 'skipped'
        }
        Update: {
          id?: string
          route_id?: string
          request_id?: string
          stop_order?: number
          estimated_arrival?: string
          status?: 'pending' | 'completed' | 'skipped'
        }
      }
      disposal_sites: {
        Row: {
          id: string
          name: string
          address: string
          lat: number
          lng: number
          accepted_waste_types: string[]
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address: string
          lat: number
          lng: number
          accepted_waste_types: string[]
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string
          lat?: number
          lng?: number
          accepted_waste_types?: string[]
          created_at?: string | null
        }
      }
      availability_windows: {
        Row: {
          id: string
          request_id: string
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          request_id: string
          start_time: string
          end_time: string
        }
        Update: {
          id?: string
          request_id?: string
          start_time?: string
          end_time?: string
        }
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
  }
}