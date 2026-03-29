import type { BlogPost } from './types'

// Static data until Hasura is connected
export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '"Just Add Arabic" — Dynamic Language Switching in a SwiftUI App Without Restarting',
    slug: 'dynamic-localization-in-ios',
    excerpt: 'How we built real-time English/Arabic switching in Bankee, and the RTL bugs that nearly broke us.',
    content: '', // Will be loaded separately
    cover_image_url: null,
    tags: ['SwiftUI', 'Localization', 'RTL'],
    reading_time_minutes: 12,
    published: true,
    published_at: '2026-03-29T00:00:00Z',
    created_at: '2026-03-29T00:00:00Z',
    updated_at: '2026-03-29T00:00:00Z',
  },
]
