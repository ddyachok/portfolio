import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import Navbar from '../components/Navbar'
import TableOfContents, { type Heading } from '../components/TableOfContents'
import { gqlRequest } from '../lib/graphql'
import { GET_POST_BY_SLUG } from '../lib/queries'
import type { BlogPost, SkillLevel } from '../lib/types'
import Loader from '../components/Loader'
import useAppear from '../hooks/useAppear'
import styles from './BlogPost.module.css'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const skillLevelLabels: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractHeadings(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/\*\*/g, '').replace(/`/g, '')
      headings.push({ id: slugify(text), text, level })
    }
  }
  return headings
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const { fadeUp, fadeIn, brushGrow } = useAppear()

  useEffect(() => {
    if (!slug) return
    gqlRequest<{ blog_posts: BlogPost[] }>(GET_POST_BY_SLUG, { slug })
      .then((data) => setPost(data.blog_posts[0] ?? null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  const content = useMemo(() => post?.content.replace(/^#\s+.+\n?/, '') ?? '', [post])
  const headings = useMemo(() => (content ? extractHeadings(content) : []), [content])

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <Loader />
      </div>
    )
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.notFound}>
          <h1>Post not found</h1>
          <Link to="/blog" className={styles.back}>&larr; Blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.main}>
          <header className={styles.header}>
            <Link to="/blog" className={styles.back} style={fadeIn(0)}>&larr; Blog</Link>
            <h1 className={styles.title} style={fadeUp(0.1)}>{post.title}</h1>
            <div className={styles.meta} style={fadeUp(0.2, 0.5)}>
              {formatDate(post.published_at)} · {post.reading_time_minutes} min read
            </div>
            <div className={styles.tags} style={fadeUp(0.25, 0.5)}>
              {post.skill_level && (
                <span className={`${styles.skillLevel} ${styles[post.skill_level]}`}>
                  {skillLevelLabels[post.skill_level]}
                </span>
              )}
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
            <div className={styles.divider} style={brushGrow(0.3, 'X')} />
          </header>
          {post.cover_image_url && (
            <div className={styles.cover} style={fadeIn(0.35, 0.7)}>
              <img src={post.cover_image_url} alt="" className={styles.coverImg} />
            </div>
          )}
          <article className={styles.article} style={fadeIn(0.4)}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSlug]}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
        <TableOfContents headings={headings} />
      </div>
    </div>
  )
}
