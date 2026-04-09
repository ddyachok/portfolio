import type { BlogPost } from './types'

// Static data until Hasura is connected
export const BLOG_POSTS: BlogPost[] = [
  {
    id: '2',
    title: 'The ViewModel Events Pattern: Navigation Without Coupling',
    slug: 'viewmodel-events-pattern',
    excerpt: 'A pattern for keeping ViewModels navigation-agnostic — and why it matters the moment you try to reuse or test one.',
    content: '',
    cover_image_url: null,
    tags: ['SwiftUI', 'MVVM', 'Architecture', 'iOS'],
    skill_level: 'intermediate',
    reading_time_minutes: 5,
    published: true,
    published_at: '2026-04-09T00:00:00Z',
    created_at: '2026-04-09T00:00:00Z',
    updated_at: '2026-04-09T00:00:00Z',
  },
  {
    id: '1',
    title: '"Just Add Arabic" — Dynamic Language Switching in a SwiftUI App Without Restarting',
    slug: 'dynamic-localization-in-ios',
    excerpt: 'How we built real-time English/Arabic switching in a production app, and the RTL bugs that nearly broke us.',
    content: '', // Will be loaded separately
    cover_image_url: 'https://res.cloudinary.com/dqhdphy0b/image/upload/v1774866732/blog/arabic-hero.jpg',
    tags: ['SwiftUI', 'Localization', 'RTL'],
    skill_level: 'intermediate',
    reading_time_minutes: 12,
    published: true,
    published_at: '2026-03-29T00:00:00Z',
    created_at: '2026-03-29T00:00:00Z',
    updated_at: '2026-03-29T00:00:00Z',
  },
]
