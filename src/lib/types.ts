export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  tags: string[]
  reading_time_minutes: number
  published: boolean
  published_at: string
  created_at: string
  updated_at: string
}
