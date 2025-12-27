export interface Map {
  id: number
  code: string
  name: string
  logo?: string
  main_color_hex?: string
  markers_size?: number
  default_zoom?: number
  selected_zoom?: number
  enable_list?: number
  enable_search?: number
  active: number
  friendly_url?: string
  meta_title?: string
  meta_description?: string
  meta_image?: string
  background_image?: string
  pwa_enable?: number
  language?: string
  languages_enabled?: string
  show_in_first_page?: number
  date_created?: string
  id_user?: number
}

export interface Marker {
  id: number
  _id: string // Convex document ID for reviews
  map_id: number
  user_id?: number | null
  lat: string | number
  lon: string | number
  name: string
  street?: string
  city?: string
  postal_code?: string
  country?: string
  county?: string
  state?: string
  description?: string
  hours?: string
  phone?: string
  email?: string
  website?: string
  whatsapp?: string
  category?: string
  image?: string
  published?: boolean
  active?: boolean | number
  created_at?: string
  updated_at?: string
  visible_map?: number
  visible_search?: number
  to_validate?: number
  centered?: number
  featured?: number
  icon?: string
  color_hex?: string
  icon_color_hex?: string
  marker_size?: number
  order?: number
  access_count?: number
}

export interface User {
  id: number
  clerk_id: string
  email: string
  name?: string
  role: string
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}
