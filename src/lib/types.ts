export interface Member {
  id: string
  full_name: string
  gender: string | null
  date_of_birth: string // ISO date string
  phone: string
  email: string | null
  address: string | null
  profile_picture_url: string | null
  created_at: string
  updated_at: string
}

export interface MemberFormData {
  full_name: string
  gender?: string
  date_of_birth: Date
  phone: string
  email?: string
  address?: string
  profile_picture?: File | null
}
