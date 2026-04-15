import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGqlRequest } from '../../lib/adminGraphql'
import { GET_ALL_POSTS_ADMIN, UPDATE_POST, DELETE_POST } from '../../lib/adminQueries'
import AdminNav from '../../components/admin/AdminNav'
import Loader from '../../components/Loader'
import styles from './AdminPosts.module.css'

interface AdminPost {
  id: string
  title: string
  slug: string
  published: boolean
  published_at: string | null
  created_at: string
  reading_time_minutes: number
  skill_level: string | null
  tags: string[]
}

function formatDate(str: string | null): string {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    adminGqlRequest<{ blog_posts: AdminPost[] }>(GET_ALL_POSTS_ADMIN)
      .then((data) => setPosts(data.blog_posts))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleTogglePublish(post: AdminPost) {
    setActionLoading(post.id)
    try {
      const input = {
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : post.published_at,
        updated_at: new Date().toISOString(),
      }
      await adminGqlRequest(UPDATE_POST, { id: post.id, input })
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, ...input } : p))
      )
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    setActionLoading(id)
    setConfirmDelete(null)
    try {
      await adminGqlRequest(DELETE_POST, { id })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className={styles.page}>
      <AdminNav />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Posts</h1>
          <Link to="/admin/posts/new" className={styles.newBtn}>New post</Link>
        </div>

        {loading ? (
          <Loader />
        ) : posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <div className={styles.list}>
            {posts.map((post) => (
              <div key={post.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{post.title}</div>
                  <div className={styles.rowMeta}>
                    <span className={styles.date}>{formatDate(post.created_at)}</span>
                    <span className={styles.readTime}>{post.reading_time_minutes} min</span>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className={styles.tag}>+{post.tags.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className={styles.rowActions}>
                  <span className={`${styles.badge} ${post.published ? styles.published : styles.draft}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>

                  <Link to={`/admin/posts/${post.id}/edit`} className={styles.actionBtn}>
                    Edit
                  </Link>

                  <button
                    className={styles.actionBtn}
                    onClick={() => handleTogglePublish(post)}
                    disabled={actionLoading === post.id}
                    type="button"
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    className={`${styles.actionBtn} ${confirmDelete === post.id ? styles.danger : ''}`}
                    onClick={() => handleDelete(post.id)}
                    disabled={actionLoading === post.id}
                    type="button"
                  >
                    {confirmDelete === post.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
