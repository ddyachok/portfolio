import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { gqlRequest } from '../lib/graphql'
import { GET_PUBLISHED_POSTS } from '../lib/queries'
import { BLOG_POSTS } from '../lib/data'
import type { BlogPost, SkillLevel } from '../lib/types'
import styles from './Blog.module.css'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gqlRequest<{ blog_posts: BlogPost[] }>(GET_PUBLISHED_POSTS)
      .then((data) => setPosts(data.blog_posts))
      .catch(() => setPosts(BLOG_POSTS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <Navbar />
      <header className={styles.header}>
        <div className={styles.brushMark} />
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>
          Notes on iOS development, architecture, and lessons from shipping.
        </p>
      </header>
      <div className={styles.posts}>
        {loading ? (
          <p className={styles.loading}>—</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={styles.postItem}
            >
              {post.cover_image_url && (
                <div className={styles.postThumb}>
                  <img src={post.cover_image_url} alt="" className={styles.postThumbImg} />
                </div>
              )}
              <div className={styles.postMeta}>
              <div className={styles.postDate}>
                {formatDate(post.published_at)} · {post.reading_time_minutes} min
              </div>
              <div className={styles.postTitle}>{post.title}</div>
              <div className={styles.postExcerpt}>{post.excerpt}</div>
              <div className={styles.postTags}>
                {post.skill_level && (
                  <span className={`${styles.skillLevel} ${styles[post.skill_level]}`}>
                    {skillLevelLabels[post.skill_level]}
                  </span>
                )}
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
