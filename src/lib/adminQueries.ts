export const GET_ALL_POSTS_ADMIN = `
  query GetAllPostsAdmin {
    blog_posts(order_by: { created_at: desc }) {
      id
      title
      slug
      published
      published_at
      created_at
      reading_time_minutes
      skill_level
      tags
    }
  }
`

export const GET_POST_BY_ID_ADMIN = `
  query GetPostByIdAdmin($id: uuid!) {
    blog_posts_by_pk(id: $id) {
      id
      title
      slug
      excerpt
      content
      cover_image_url
      tags
      skill_level
      reading_time_minutes
      published
      published_at
      created_at
      updated_at
    }
  }
`

export const CREATE_POST = `
  mutation CreatePost($input: blog_posts_insert_input!) {
    insert_blog_posts_one(object: $input) {
      id
      slug
    }
  }
`

export const UPDATE_POST = `
  mutation UpdatePost($id: uuid!, $input: blog_posts_set_input!) {
    update_blog_posts_by_pk(
      pk_columns: { id: $id }
      _set: $input
    ) {
      id
      updated_at
    }
  }
`

export const DELETE_POST = `
  mutation DeletePost($id: uuid!) {
    delete_blog_posts_by_pk(id: $id) {
      id
    }
  }
`
