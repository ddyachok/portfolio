export const GET_PUBLISHED_POSTS = `
  query GetPublishedPosts {
    blog_posts(
      where: { published: { _eq: true } }
      order_by: { published_at: desc }
    ) {
      id
      title
      slug
      excerpt
      tags
      skill_level
      reading_time_minutes
      published_at
    }
  }
`

export const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: String!) {
    blog_posts(where: { slug: { _eq: $slug }, published: { _eq: true } }) {
      id
      title
      slug
      excerpt
      content
      cover_image_url
      tags
      skill_level
      reading_time_minutes
      published_at
      created_at
    }
  }
`
