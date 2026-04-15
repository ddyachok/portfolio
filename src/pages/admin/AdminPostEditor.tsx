import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminNav from '../../components/admin/AdminNav'
import MarkdownEditor from '../../components/admin/MarkdownEditor'
import ImageUploader from '../../components/admin/ImageUploader'
import Loader from '../../components/Loader'
import { adminGqlRequest } from '../../lib/adminGraphql'
import {
  GET_POST_BY_ID_ADMIN,
  CREATE_POST,
  UPDATE_POST,
} from '../../lib/adminQueries'
import type { SkillLevel } from '../../lib/types'
import styles from './AdminPostEditor.module.css'

interface PostData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  tags: string[]
  skill_level: SkillLevel | null
  reading_time_minutes: number
  published: boolean
  published_at: string | null
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('')
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(1)
  const [readingTimeManual, setReadingTimeManual] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [postId, setPostId] = useState<string | null>(id ?? null)

  // Auto-derive slug from title (new posts only)
  useEffect(() => {
    if (isNew && !slugManual) {
      setSlug(toSlug(title))
    }
  }, [title, isNew, slugManual])

  // Auto reading time
  useEffect(() => {
    if (!readingTimeManual) {
      setReadingTimeMinutes(calcReadingTime(content))
    }
  }, [content, readingTimeManual])

  // Load existing post
  useEffect(() => {
    if (isNew) return
    adminGqlRequest<{ blog_posts_by_pk: PostData | null }>(GET_POST_BY_ID_ADMIN, { id })
      .then((data) => {
        const p = data.blog_posts_by_pk
        if (!p) { navigate('/admin/posts'); return }
        setTitle(p.title)
        setSlug(p.slug)
        setSlugManual(true)
        setExcerpt(p.excerpt ?? '')
        setContent(p.content ?? '')
        setCoverImageUrl(p.cover_image_url ?? '')
        setTagsInput(p.tags?.join(', ') ?? '')
        setSkillLevel(p.skill_level ?? '')
        setReadingTimeMinutes(p.reading_time_minutes ?? 1)
        setReadingTimeManual(true)
        setPublished(p.published)
        setPublishedAt(p.published_at)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, isNew, navigate])

  const parsedTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const buildInput = useCallback((willPublish?: boolean) => {
    const nowPublished = willPublish !== undefined ? willPublish : published
    return {
      title,
      slug,
      excerpt,
      content,
      cover_image_url: coverImageUrl || null,
      tags: parsedTags,
      skill_level: skillLevel || null,
      reading_time_minutes: readingTimeMinutes,
      published: nowPublished,
      published_at:
        nowPublished && !publishedAt ? new Date().toISOString() : publishedAt,
      updated_at: new Date().toISOString(),
    }
  }, [title, slug, excerpt, content, coverImageUrl, parsedTags, skillLevel, readingTimeMinutes, published, publishedAt])

  async function handleSave() {
    if (!title || !slug) {
      setSaveError('Title and slug are required.')
      return
    }
    setSaveError(null)
    setSaving(true)

    try {
      if (isNew || !postId) {
        const result = await adminGqlRequest<{
          insert_blog_posts_one: { id: string; slug: string }
        }>(CREATE_POST, {
          input: { ...buildInput(), created_at: new Date().toISOString() },
        })
        const newId = result.insert_blog_posts_one.id
        setPostId(newId)
        setSlugManual(true)
        navigate(`/admin/posts/${newId}/edit`, { replace: true })
      } else {
        await adminGqlRequest(UPDATE_POST, { id: postId, input: buildInput() })
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublishToggle() {
    if (!postId) { await handleSave(); return }
    const nowPublished = !published
    setSaving(true)
    setSaveError(null)
    try {
      const input = buildInput(nowPublished)
      await adminGqlRequest(UPDATE_POST, { id: postId, input })
      setPublished(nowPublished)
      if (nowPublished && !publishedAt) setPublishedAt(input.published_at ?? null)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update publish status.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <AdminNav />
        <Loader />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <AdminNav />

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={`${styles.statusBadge} ${published ? styles.badgePublished : styles.badgeDraft}`}>
            {published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div className={styles.topBarRight}>
          {saveError && <span className={styles.saveError}>{saveError}</span>}
          <button
            type="button"
            className={styles.publishBtn}
            onClick={handlePublishToggle}
            disabled={saving}
          >
            {published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Editor pane */}
        <div className={styles.editorPane}>
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.titleInput}
          />
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* Metadata sidebar */}
        <aside className={styles.sidebar}>
          <section className={styles.section}>
            <label className={styles.sectionLabel}>Slug</label>
            <div className={styles.slugRow}>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
                className={styles.input}
                placeholder="post-slug"
              />
              {slugManual && isNew && (
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => { setSlugManual(false); setSlug(toSlug(title)) }}
                >
                  Reset
                </button>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <label className={styles.sectionLabel}>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className={styles.textarea}
              placeholder="Short description…"
              rows={3}
            />
          </section>

          <section className={styles.section}>
            <label className={styles.sectionLabel}>Cover image</label>
            <ImageUploader
              onUpload={setCoverImageUrl}
              label="Drop or click to upload cover"
              previewUrl={coverImageUrl || undefined}
            />
            {coverImageUrl && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setCoverImageUrl('')}
              >
                Remove
              </button>
            )}
          </section>

          <section className={styles.section}>
            <label className={styles.sectionLabel}>Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={styles.input}
              placeholder="swift, ios, architecture"
            />
            {parsedTags.length > 0 && (
              <div className={styles.tagChips}>
                {parsedTags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>{tag}</span>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <label className={styles.sectionLabel}>Skill level</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel | '')}
              className={styles.select}
            >
              <option value="">— None —</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </section>

          <section className={styles.section}>
            <div className={styles.readingTimeRow}>
              <label className={styles.sectionLabel}>Reading time (min)</label>
              {readingTimeManual && (
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => { setReadingTimeManual(false); setReadingTimeMinutes(calcReadingTime(content)) }}
                >
                  Auto
                </button>
              )}
            </div>
            <input
              type="number"
              min={1}
              value={readingTimeMinutes}
              onChange={(e) => { setReadingTimeMinutes(Number(e.target.value)); setReadingTimeManual(true) }}
              className={styles.input}
            />
          </section>
        </aside>
      </div>
    </div>
  )
}
